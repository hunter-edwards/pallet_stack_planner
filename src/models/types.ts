// Core data models for Pallet Stack Planner

export type ProductType = 'flat' | 'kit' | 'glued';
export type MaterialType = 'single-wall' | 'double-wall' | 'triple-wall';
export type Orientation = 'portrait' | 'landscape';

export interface Dimensions {
  length: number; // inches
  width: number; // inches
  height: number; // inches (0 for flat sheets)
}

export interface Material {
  type: MaterialType;
  caliper: number; // thickness in points (1/1000 inch)
}

export interface FoldConfiguration {
  foldLines: number;
  glueTabs: number;
  foldedDimensions?: Dimensions;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  type: ProductType;
  dimensions: Dimensions;
  weight: number; // pounds per unit
  material: Material;
  nestable: boolean;
  nestingDepth?: number; // inches - how much units compress when nested
  compressionStrength?: number; // PSI
  components?: Product[]; // for kits
  foldConfig?: FoldConfiguration;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PalletConfig {
  id: string;
  name: string; // e.g., "Standard 48x40"
  dimensions: Dimensions;
  weight: number; // pallet weight in pounds
  maxLoad: number; // maximum load capacity in pounds
  maxHeight?: number; // maximum allowed height in inches
}

export interface Overhang {
  length: number; // inches
  width: number; // inches
}

export interface LayerConfiguration {
  unitsPerLayer: number;
  orientation: Orientation;
  arrangement: UnitPosition[]; // position of each unit in the layer
  nestingApplied: boolean;
  layerHeight: number; // actual height including nesting
}

export interface UnitPosition {
  x: number; // position from pallet edge
  y: number; // position from pallet edge
  rotation: number; // 0 or 90 degrees
  width: number;
  length: number;
}

export interface SlipSheet {
  position: number; // layer index where slip sheet is placed
  weight: number; // pounds
  thickness: number; // inches
}

export interface StackConfiguration {
  id: string;
  product: Product;
  pallet: PalletConfig;
  layerConfig: LayerConfiguration;
  totalLayers: number;
  totalUnits: number;
  slipSheets: SlipSheet[];
  totalWeight: number; // including pallet and slip sheets
  overallHeight: number; // inches
  overhang: Overhang;
  stability: StabilityMetrics;
  createdAt: Date;
}

export interface StabilityMetrics {
  centerOfGravityHeight: number; // inches from ground
  weightDistributionScore: number; // 0-100, higher is better
  overhangScore: number; // 0-100, higher is better (less overhang)
  overallStabilityScore: number; // 0-100, composite score
  warnings: string[];
}

export interface OptimizationOptions {
  maxOverhang: number; // inches, typically 1-2"
  slipSheetInterval?: number; // insert slip sheet every N layers
  slipSheetAtWeightThreshold?: number; // insert when weight exceeds threshold
  preferOrientation?: Orientation;
  prioritizeStability: boolean; // vs space efficiency
  maxHeight?: number; // override pallet max height
}

export interface OptimizationResult {
  configuration: StackConfiguration;
  spaceUtilization: number; // percentage of pallet footprint used
  efficiency: number; // units per cubic foot
  score: number; // overall optimization score
}

// Preset pallet configurations
export const STANDARD_PALLETS: PalletConfig[] = [
  {
    id: 'std-48x40',
    name: 'Standard 48" × 40"',
    dimensions: { length: 48, width: 40, height: 0 },
    weight: 40,
    maxLoad: 4600,
    maxHeight: 72,
  },
  {
    id: 'std-48x48',
    name: 'Standard 48" × 48"',
    dimensions: { length: 48, width: 48, height: 0 },
    weight: 45,
    maxLoad: 4600,
    maxHeight: 72,
  },
  {
    id: 'std-40x48',
    name: 'Standard 40" × 48"',
    dimensions: { length: 40, width: 48, height: 0 },
    weight: 40,
    maxLoad: 4600,
    maxHeight: 72,
  },
];

// Default slip sheet specifications
export const DEFAULT_SLIP_SHEET = {
  weight: 0.5, // pounds
  thickness: 0.04, // inches (~1mm)
};
