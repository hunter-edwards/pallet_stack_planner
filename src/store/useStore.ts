import { create } from 'zustand';
import type {
  Product,
  PalletConfig,
  OptimizationOptions,
  OptimizationResult,
} from '../models/types';
import { STANDARD_PALLETS } from '../models/types';
import { optimizePalletConfiguration } from '../algorithms/optimizer';

interface AppState {
  // Products
  products: Product[];
  selectedProduct: Product | null;

  // Pallets
  availablePallets: PalletConfig[];
  selectedPallet: PalletConfig | null;

  // Optimization
  optimizationOptions: OptimizationOptions;
  currentResult: OptimizationResult | null;

  // UI State
  isCalculating: boolean;
  error: string | null;

  // Actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  selectProduct: (product: Product | null) => void;

  selectPallet: (pallet: PalletConfig | null) => void;
  addCustomPallet: (pallet: PalletConfig) => void;

  setOptimizationOptions: (options: Partial<OptimizationOptions>) => void;

  calculateConfiguration: () => void;
  clearResult: () => void;

  setError: (error: string | null) => void;
}

// Default optimization options
const defaultOptions: OptimizationOptions = {
  maxOverhang: 1.5,
  slipSheetInterval: 5,
  prioritizeStability: true,
};

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,

  availablePallets: STANDARD_PALLETS,
  selectedPallet: STANDARD_PALLETS[0],

  optimizationOptions: defaultOptions,
  currentResult: null,

  isCalculating: false,
  error: null,

  // Product actions
  addProduct: (product) => {
    set((state) => ({
      products: [...state.products, product],
    }));
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
      selectedProduct:
        state.selectedProduct?.id === id
          ? { ...state.selectedProduct, ...updates }
          : state.selectedProduct,
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      selectedProduct:
        state.selectedProduct?.id === id ? null : state.selectedProduct,
    }));
  },

  selectProduct: (product) => {
    set({ selectedProduct: product, error: null });
  },

  // Pallet actions
  selectPallet: (pallet) => {
    set({ selectedPallet: pallet });
  },

  addCustomPallet: (pallet) => {
    set((state) => ({
      availablePallets: [...state.availablePallets, pallet],
    }));
  },

  // Optimization actions
  setOptimizationOptions: (options) => {
    set((state) => ({
      optimizationOptions: { ...state.optimizationOptions, ...options },
    }));
  },

  calculateConfiguration: () => {
    const { selectedProduct, selectedPallet, optimizationOptions } = get();

    if (!selectedProduct) {
      set({ error: 'Please select a product first' });
      return;
    }

    if (!selectedPallet) {
      set({ error: 'Please select a pallet configuration' });
      return;
    }

    set({ isCalculating: true, error: null });

    try {
      const result = optimizePalletConfiguration(
        selectedProduct,
        selectedPallet,
        optimizationOptions
      );

      if (!result) {
        set({
          error: 'Could not find a valid configuration for this product and pallet',
          isCalculating: false,
          currentResult: null,
        });
        return;
      }

      set({
        currentResult: result,
        isCalculating: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred during calculation',
        isCalculating: false,
        currentResult: null,
      });
    }
  },

  clearResult: () => {
    set({ currentResult: null, error: null });
  },

  setError: (error) => {
    set({ error });
  },
}));

// Sample products for demo purposes
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Standard Single Wall Sheet',
    sku: 'SW-48x40',
    type: 'flat',
    dimensions: { length: 48, width: 40, height: 0.25 },
    weight: 2.5,
    material: { type: 'single-wall', caliper: 42 },
    nestable: false,
    compressionStrength: 200,
  },
  {
    id: 'prod-002',
    name: 'Double Wall Sheet',
    sku: 'DW-48x48',
    type: 'flat',
    dimensions: { length: 48, width: 48, height: 0.5 },
    weight: 4.8,
    material: { type: 'double-wall', caliper: 84 },
    nestable: false,
    compressionStrength: 400,
  },
  {
    id: 'prod-003',
    name: 'Nestable Tray',
    sku: 'TRAY-24x18',
    type: 'glued',
    dimensions: { length: 24, width: 18, height: 6 },
    weight: 1.2,
    material: { type: 'single-wall', caliper: 44 },
    nestable: true,
    nestingDepth: 4.5,
    compressionStrength: 150,
    foldConfig: {
      foldLines: 4,
      glueTabs: 2,
      foldedDimensions: { length: 24, width: 18, height: 6 },
    },
  },
  {
    id: 'prod-004',
    name: 'Triple Wall Heavy Duty',
    sku: 'TW-60x48',
    type: 'flat',
    dimensions: { length: 60, width: 48, height: 0.75 },
    weight: 8.5,
    material: { type: 'triple-wall', caliper: 120 },
    nestable: false,
    compressionStrength: 800,
  },
];
