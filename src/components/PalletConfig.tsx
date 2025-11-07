import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { OptimizationOptions } from '../models/types';

export const PalletConfig: React.FC = () => {
  const {
    availablePallets,
    selectedPallet,
    selectPallet,
    optimizationOptions,
    setOptimizationOptions,
    calculateConfiguration,
    isCalculating,
    error,
  } = useStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleOptionChange = (key: keyof OptimizationOptions, value: any) => {
    setOptimizationOptions({ [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Pallet Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Pallet Size
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPallet?.id || ''}
            onChange={(e) => {
              const pallet = availablePallets.find(p => p.id === e.target.value);
              selectPallet(pallet || null);
            }}
          >
            {availablePallets.map((pallet) => (
              <option key={pallet.id} value={pallet.id}>
                {pallet.name} - Max Load: {pallet.maxLoad} lbs
              </option>
            ))}
          </select>
        </div>

        {selectedPallet && (
          <div className="p-4 bg-gray-50 rounded-md space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Dimensions:</span>{' '}
                {selectedPallet.dimensions.length}" × {selectedPallet.dimensions.width}"
              </div>
              <div>
                <span className="font-medium">Weight:</span> {selectedPallet.weight} lbs
              </div>
              <div>
                <span className="font-medium">Max Load:</span> {selectedPallet.maxLoad} lbs
              </div>
              <div>
                <span className="font-medium">Max Height:</span> {selectedPallet.maxHeight}"
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Overhang (inches)
              </label>
              <input
                type="number"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={optimizationOptions.maxOverhang}
                onChange={(e) => handleOptionChange('maxOverhang', parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Typically 1-2 inches</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slip Sheet Interval (layers)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={optimizationOptions.slipSheetInterval || ''}
                onChange={(e) => handleOptionChange('slipSheetInterval', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Optional - e.g., 5"
              />
              <p className="text-xs text-gray-500 mt-1">Insert slip sheet every N layers (leave empty for no slip sheets)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Orientation
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={optimizationOptions.preferOrientation || ''}
                onChange={(e) => handleOptionChange('preferOrientation', e.target.value || undefined)}
              >
                <option value="">Auto (Best Fit)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Height Override (inches)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={optimizationOptions.maxHeight || ''}
                onChange={(e) => handleOptionChange('maxHeight', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder={`Default: ${selectedPallet?.maxHeight || 72}`}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="prioritizeStability"
                className="mr-2"
                checked={optimizationOptions.prioritizeStability}
                onChange={(e) => handleOptionChange('prioritizeStability', e.target.checked)}
              />
              <label htmlFor="prioritizeStability" className="text-sm font-medium text-gray-700">
                Prioritize Stability over Space Efficiency
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={calculateConfiguration}
          disabled={isCalculating}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Pallet Configuration'}
        </button>
      </div>
    </div>
  );
};
