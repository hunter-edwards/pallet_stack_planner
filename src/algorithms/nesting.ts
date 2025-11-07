import type { Product, LayerConfiguration, UnitPosition } from '../models/types';
import { calculateLayerHeight } from '../utils/calculations';

/**
 * Detect if a product can be nested based on geometry
 */
export function isNestable(product: Product): boolean {
  // Already marked as nestable in product definition
  if (product.nestable) {
    return true;
  }

  // Glued/folded pieces often nest
  if (product.type === 'glued' && product.foldConfig) {
    return true;
  }

  return false;
}

/**
 * Calculate optimal nesting depth for a product
 */
export function calculateNestingDepth(product: Product, unitsInStack: number): number {
  if (!product.nestable || !product.nestingDepth) {
    return 0;
  }

  // Each additional unit compresses by the nesting depth
  // But there's usually a minimum height even when fully nested
  const maxCompression = product.nestingDepth;
  const minHeight = product.dimensions.height * 0.1; // Keep at least 10% of original height

  const totalCompression = maxCompression * (unitsInStack - 1);
  const compressedHeight = product.dimensions.height - totalCompression;

  return Math.max(compressedHeight, minHeight);
}

/**
 * Create a nested layer configuration
 */
export function createNestedLayerConfiguration(
  product: Product,
  baseConfig: LayerConfiguration
): LayerConfiguration {
  if (!product.nestable) {
    return baseConfig;
  }

  // Apply nesting to reduce layer height
  const nestedHeight = calculateLayerHeight(product, true);

  return {
    ...baseConfig,
    nestingApplied: true,
    layerHeight: nestedHeight,
  };
}

/**
 * Calculate how many nested units can fit in a given height
 */
export function calculateNestedUnitsInHeight(
  product: Product,
  availableHeight: number
): number {
  if (!product.nestable || !product.nestingDepth) {
    return Math.floor(availableHeight / product.dimensions.height);
  }

  // First unit takes full height
  let remainingHeight = availableHeight - product.dimensions.height;
  let units = 1;

  // Each additional unit adds (height - nestingDepth)
  const heightPerNestedUnit = product.dimensions.height - product.nestingDepth;

  if (heightPerNestedUnit > 0) {
    const additionalUnits = Math.floor(remainingHeight / heightPerNestedUnit);
    units += additionalUnits;
  }

  return units;
}

/**
 * Optimize layer arrangement considering nesting opportunities
 */
export function optimizeWithNesting(
  product: Product,
  baseArrangement: UnitPosition[],
  availableHeight: number
): { arrangement: UnitPosition[]; layersPerStack: number } {
  if (!product.nestable) {
    return {
      arrangement: baseArrangement,
      layersPerStack: 1,
    };
  }

  // Calculate how many units can nest vertically
  const unitsPerVerticalStack = calculateNestedUnitsInHeight(product, availableHeight);

  // If we can nest multiple units, we can reduce the number of horizontal positions needed
  // This is a simplification - in reality, you'd need more complex geometry analysis

  return {
    arrangement: baseArrangement,
    layersPerStack: Math.max(1, Math.floor(unitsPerVerticalStack / 2)),
  };
}

/**
 * Analyze nesting compatibility between different products (for kits)
 */
export interface NestingCompatibility {
  canNest: boolean;
  estimatedSavings: number; // percentage space savings
  configuration?: 'stack' | 'interleave' | 'none';
}

export function analyzeNestingCompatibility(
  product1: Product,
  product2: Product
): NestingCompatibility {
  // Simple heuristic: can nest if one is significantly smaller than the other
  const size1 = product1.dimensions.length * product1.dimensions.width;
  const size2 = product2.dimensions.length * product2.dimensions.width;

  const sizeRatio = Math.max(size1, size2) / Math.min(size1, size2);

  if (sizeRatio > 1.5) {
    return {
      canNest: true,
      estimatedSavings: ((sizeRatio - 1) / sizeRatio) * 100,
      configuration: 'stack',
    };
  }

  // Check if they can interleave (alternating layers)
  if (
    Math.abs(product1.dimensions.length - product2.dimensions.length) < 2 &&
    Math.abs(product1.dimensions.width - product2.dimensions.width) < 2
  ) {
    return {
      canNest: true,
      estimatedSavings: 10,
      configuration: 'interleave',
    };
  }

  return {
    canNest: false,
    estimatedSavings: 0,
    configuration: 'none',
  };
}
