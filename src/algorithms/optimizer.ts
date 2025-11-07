import type {
  Product,
  PalletConfig,
  Orientation,
  OptimizationOptions,
  OptimizationResult,
  StackConfiguration,
  LayerConfiguration,
  UnitPosition,
} from '../models/types';
import {
  calculateTotalWeight,
  calculateTotalHeight,
  calculateOverhang,
  calculateStability,
  calculateSpaceUtilization,
  calculateEfficiency,
  calculateSlipSheetPositions,
  calculateLayerHeight,
} from '../utils/calculations';

/**
 * Calculate how many units fit in one dimension
 */
function calculateUnitsPerDimension(
  availableSpace: number,
  unitSize: number,
  maxOverhang: number
): number {
  const effectiveSpace = availableSpace + 2 * maxOverhang;
  return Math.floor(effectiveSpace / unitSize);
}

/**
 * Try to fit units on a pallet in a specific orientation
 */
function tryOrientation(
  product: Product,
  pallet: PalletConfig,
  orientation: Orientation,
  maxOverhang: number
): LayerConfiguration | null {
  const unitLength = orientation === 'portrait' ? product.dimensions.length : product.dimensions.width;
  const unitWidth = orientation === 'portrait' ? product.dimensions.width : product.dimensions.length;

  // Calculate how many units fit along each dimension
  const unitsAlongLength = calculateUnitsPerDimension(
    pallet.dimensions.length,
    unitLength,
    maxOverhang
  );
  const unitsAlongWidth = calculateUnitsPerDimension(
    pallet.dimensions.width,
    unitWidth,
    maxOverhang
  );

  if (unitsAlongLength <= 0 || unitsAlongWidth <= 0) {
    return null;
  }

  const unitsPerLayer = unitsAlongLength * unitsAlongWidth;

  // Generate unit positions
  const arrangement: UnitPosition[] = [];
  for (let i = 0; i < unitsAlongLength; i++) {
    for (let j = 0; j < unitsAlongWidth; j++) {
      arrangement.push({
        x: i * unitLength,
        y: j * unitWidth,
        rotation: orientation === 'landscape' ? 90 : 0,
        width: unitWidth,
        length: unitLength,
      });
    }
  }

  const layerHeight = calculateLayerHeight(product, false);

  return {
    unitsPerLayer,
    orientation,
    arrangement,
    nestingApplied: false,
    layerHeight,
  };
}

/**
 * Optimize pallet configuration for a given product
 */
export function optimizePalletConfiguration(
  product: Product,
  pallet: PalletConfig,
  options: OptimizationOptions
): OptimizationResult | null {
  const { maxOverhang, slipSheetInterval, preferOrientation, prioritizeStability, maxHeight } = options;

  // Try both orientations
  const orientations: Orientation[] = preferOrientation
    ? [preferOrientation]
    : ['portrait', 'landscape'];

  let bestConfig: LayerConfiguration | null = null;
  let bestScore = -1;

  for (const orientation of orientations) {
    const layerConfig = tryOrientation(product, pallet, orientation, maxOverhang);

    if (!layerConfig) continue;

    // Score this configuration
    const stackLength = Math.max(...layerConfig.arrangement.map(u => u.x + u.length));
    const stackWidth = Math.max(...layerConfig.arrangement.map(u => u.y + u.width));
    const spaceUtil = calculateSpaceUtilization(
      pallet.dimensions.length,
      pallet.dimensions.width,
      stackLength,
      stackWidth
    );

    // Score favors space utilization, with bonus for preferred orientation
    let score = spaceUtil;
    if (preferOrientation && orientation === preferOrientation) {
      score *= 1.1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestConfig = layerConfig;
    }
  }

  if (!bestConfig) {
    return null;
  }

  // Calculate maximum number of layers based on height and weight constraints
  const effectiveMaxHeight = maxHeight || pallet.maxHeight || 72;
  const maxLayersByHeight = Math.floor(effectiveMaxHeight / bestConfig.layerHeight);

  // Calculate max layers by weight
  const weightPerLayer = product.weight * bestConfig.unitsPerLayer;
  const maxLayersByWeight = Math.floor((pallet.maxLoad - pallet.weight) / weightPerLayer);

  const totalLayers = Math.min(maxLayersByHeight, maxLayersByWeight);

  if (totalLayers <= 0) {
    return null;
  }

  const totalUnits = bestConfig.unitsPerLayer * totalLayers;

  // Calculate slip sheet positions
  const slipSheets = calculateSlipSheetPositions(totalLayers, slipSheetInterval);

  // Calculate dimensions
  const stackLength = Math.max(...bestConfig.arrangement.map(u => u.x + u.length));
  const stackWidth = Math.max(...bestConfig.arrangement.map(u => u.y + u.width));
  const overallHeight = calculateTotalHeight(bestConfig, totalLayers, slipSheets);
  const overhang = calculateOverhang(
    pallet.dimensions.length,
    pallet.dimensions.width,
    stackLength,
    stackWidth
  );

  // Calculate total weight
  const totalWeight = calculateTotalWeight(product, totalUnits, pallet, slipSheets);

  // Build stack configuration
  const stackConfig: StackConfiguration = {
    id: `stack-${Date.now()}`,
    product,
    pallet,
    layerConfig: bestConfig,
    totalLayers,
    totalUnits,
    slipSheets,
    totalWeight,
    overallHeight,
    overhang,
    stability: { centerOfGravityHeight: 0, weightDistributionScore: 0, overhangScore: 0, overallStabilityScore: 0, warnings: [] },
    createdAt: new Date(),
  };

  // Calculate stability
  stackConfig.stability = calculateStability(stackConfig, product, pallet);

  // Calculate metrics
  const spaceUtilization = calculateSpaceUtilization(
    pallet.dimensions.length,
    pallet.dimensions.width,
    stackLength,
    stackWidth
  );

  const efficiency = calculateEfficiency(totalUnits, stackLength, stackWidth, overallHeight);

  // Calculate overall optimization score
  let score = spaceUtilization * 0.4 + stackConfig.stability.overallStabilityScore * 0.6;

  if (prioritizeStability) {
    score = spaceUtilization * 0.2 + stackConfig.stability.overallStabilityScore * 0.8;
  }

  return {
    configuration: stackConfig,
    spaceUtilization,
    efficiency,
    score,
  };
}

/**
 * Compare multiple pallet configurations and return the best one
 */
export function findBestConfiguration(
  product: Product,
  pallets: PalletConfig[],
  options: OptimizationOptions
): OptimizationResult | null {
  let bestResult: OptimizationResult | null = null;
  let bestScore = -1;

  for (const pallet of pallets) {
    const result = optimizePalletConfiguration(product, pallet, options);

    if (result && result.score > bestScore) {
      bestScore = result.score;
      bestResult = result;
    }
  }

  return bestResult;
}
