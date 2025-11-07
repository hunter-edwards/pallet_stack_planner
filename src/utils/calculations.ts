import type {
  Product,
  PalletConfig,
  StackConfiguration,
  LayerConfiguration,
  SlipSheet,
  Overhang,
  StabilityMetrics,
} from '../models/types';
import { DEFAULT_SLIP_SHEET } from '../models/types';

/**
 * Calculate total weight of a stack configuration
 */
export function calculateTotalWeight(
  product: Product,
  totalUnits: number,
  pallet: PalletConfig,
  slipSheets: SlipSheet[]
): number {
  const productWeight = product.weight * totalUnits;
  const palletWeight = pallet.weight;
  const slipSheetWeight = slipSheets.reduce((sum, sheet) => sum + sheet.weight, 0);

  return productWeight + palletWeight + slipSheetWeight;
}

/**
 * Calculate total height of the stack
 */
export function calculateTotalHeight(
  layerConfig: LayerConfiguration,
  totalLayers: number,
  slipSheets: SlipSheet[]
): number {
  const productHeight = layerConfig.layerHeight * totalLayers;
  const slipSheetHeight = slipSheets.length * DEFAULT_SLIP_SHEET.thickness;

  return productHeight + slipSheetHeight;
}

/**
 * Calculate overhang from pallet edges
 */
export function calculateOverhang(
  palletLength: number,
  palletWidth: number,
  stackLength: number,
  stackWidth: number
): Overhang {
  return {
    length: Math.max(0, (stackLength - palletLength) / 2),
    width: Math.max(0, (stackWidth - palletWidth) / 2),
  };
}

/**
 * Calculate center of gravity height
 */
export function calculateCenterOfGravity(
  layerConfig: LayerConfiguration,
  totalLayers: number,
  slipSheets: SlipSheet[]
): number {
  let totalMoment = 0;
  let totalWeight = 0;
  let currentHeight = 0;

  for (let layer = 0; layer < totalLayers; layer++) {
    const layerHeight = layerConfig.layerHeight;
    const layerCenterHeight = currentHeight + layerHeight / 2;
    const layerWeight = 1; // normalized weight per layer

    totalMoment += layerWeight * layerCenterHeight;
    totalWeight += layerWeight;
    currentHeight += layerHeight;

    // Add slip sheet if present at this position
    const hasSlipSheet = slipSheets.some(s => s.position === layer);
    if (hasSlipSheet) {
      currentHeight += DEFAULT_SLIP_SHEET.thickness;
    }
  }

  return totalWeight > 0 ? totalMoment / totalWeight : 0;
}

/**
 * Calculate stability metrics for a stack configuration
 */
export function calculateStability(
  config: Partial<StackConfiguration>,
  _product: Product,
  pallet: PalletConfig
): StabilityMetrics {
  const warnings: string[] = [];
  const overhang = config.overhang || { length: 0, width: 0 };
  const totalHeight = config.overallHeight || 0;
  const totalWeight = config.totalWeight || 0;

  // Calculate overhang score (0-100, lower overhang is better)
  const maxAllowedOverhang = 2; // inches
  const avgOverhang = (overhang.length + overhang.width) / 2;
  const overhangScore = Math.max(0, 100 - (avgOverhang / maxAllowedOverhang) * 100);

  if (avgOverhang > maxAllowedOverhang) {
    warnings.push(`Overhang exceeds recommended maximum of ${maxAllowedOverhang}"`);
  }

  // Calculate height-to-base ratio (lower is more stable)
  const baseSize = Math.min(pallet.dimensions.length, pallet.dimensions.width);
  const heightToBaseRatio = totalHeight / baseSize;
  const heightScore = Math.max(0, 100 - heightToBaseRatio * 50);

  if (heightToBaseRatio > 1.5) {
    warnings.push('Stack height-to-base ratio is high, may be unstable');
  }

  // Check weight capacity
  const weightUtilization = (totalWeight / pallet.maxLoad) * 100;
  if (weightUtilization > 100) {
    warnings.push('Stack exceeds pallet weight capacity');
  } else if (weightUtilization > 90) {
    warnings.push('Stack is near maximum weight capacity');
  }

  // Weight distribution score (assume uniform for now)
  const weightDistributionScore = 85;

  // Calculate center of gravity
  const cogHeight = config.layerConfig
    ? calculateCenterOfGravity(
        config.layerConfig,
        config.totalLayers || 0,
        config.slipSheets || []
      )
    : 0;

  // Overall stability score (weighted average)
  const overallStabilityScore = (
    overhangScore * 0.3 +
    heightScore * 0.3 +
    weightDistributionScore * 0.4
  );

  return {
    centerOfGravityHeight: cogHeight,
    weightDistributionScore,
    overhangScore,
    overallStabilityScore,
    warnings,
  };
}

/**
 * Calculate space utilization percentage
 */
export function calculateSpaceUtilization(
  palletLength: number,
  palletWidth: number,
  usedLength: number,
  usedWidth: number
): number {
  const palletArea = palletLength * palletWidth;
  const usedArea = usedLength * usedWidth;
  return (usedArea / palletArea) * 100;
}

/**
 * Calculate packing efficiency (units per cubic foot)
 */
export function calculateEfficiency(
  totalUnits: number,
  stackLength: number,
  stackWidth: number,
  stackHeight: number
): number {
  const volumeCubicInches = stackLength * stackWidth * stackHeight;
  const volumeCubicFeet = volumeCubicInches / 1728; // 12^3
  return volumeCubicFeet > 0 ? totalUnits / volumeCubicFeet : 0;
}

/**
 * Determine how many slip sheets are needed based on configuration
 */
export function calculateSlipSheetPositions(
  totalLayers: number,
  interval?: number
): SlipSheet[] {
  if (!interval || interval <= 0) {
    return [];
  }

  const slipSheets: SlipSheet[] = [];
  for (let layer = interval - 1; layer < totalLayers; layer += interval) {
    slipSheets.push({
      position: layer,
      weight: DEFAULT_SLIP_SHEET.weight,
      thickness: DEFAULT_SLIP_SHEET.thickness,
    });
  }

  return slipSheets;
}

/**
 * Calculate actual layer height considering nesting
 */
export function calculateLayerHeight(
  product: Product,
  isNested: boolean
): number {
  const baseHeight = product.dimensions.height || 0.25; // minimum height for flat sheets

  if (isNested && product.nestable && product.nestingDepth) {
    return baseHeight - product.nestingDepth;
  }

  return baseHeight;
}
