import React from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

export const ResultsDisplay: React.FC = () => {
  const { currentResult } = useStore();

  if (!currentResult) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Configure a product and pallet, then calculate to see results here.</p>
      </div>
    );
  }

  const { configuration, spaceUtilization, efficiency, score } = currentResult;
  const { product, pallet, layerConfig, totalLayers, totalUnits, slipSheets, totalWeight, overallHeight, overhang, stability } = configuration;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          Configuration Results
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Units per Layer</div>
            <div className="text-2xl font-bold text-blue-600">{layerConfig.unitsPerLayer}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Layers</div>
            <div className="text-2xl font-bold text-green-600">{totalLayers}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Units</div>
            <div className="text-2xl font-bold text-purple-600">{totalUnits}</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Weight</div>
            <div className="text-2xl font-bold text-orange-600">{totalWeight.toFixed(1)} lbs</div>
          </div>
        </div>
      </div>

      {/* Detailed Specifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Detailed Specifications</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Dimensions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pallet Size:</span>
                <span className="font-medium">{pallet.dimensions.length}" × {pallet.dimensions.width}"</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overall Height:</span>
                <span className="font-medium">{overallHeight.toFixed(2)}"</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layer Height:</span>
                <span className="font-medium">{layerConfig.layerHeight.toFixed(2)}"</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orientation:</span>
                <span className="font-medium capitalize">{layerConfig.orientation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overhang (L×W):</span>
                <span className="font-medium">{overhang.length.toFixed(2)}" × {overhang.width.toFixed(2)}"</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Weight & Capacity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product Weight:</span>
                <span className="font-medium">{(product.weight * totalUnits).toFixed(1)} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pallet Weight:</span>
                <span className="font-medium">{pallet.weight} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slip Sheets:</span>
                <span className="font-medium">{slipSheets.length} sheets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Weight:</span>
                <span className="font-medium font-bold">{totalWeight.toFixed(1)} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight Capacity:</span>
                <span className="font-medium">{pallet.maxLoad} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Utilization:</span>
                <span className={`font-medium ${(totalWeight/pallet.maxLoad) > 0.9 ? 'text-orange-600' : 'text-green-600'}`}>
                  {((totalWeight / pallet.maxLoad) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Efficiency Metrics</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border-2 border-blue-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Space Utilization</div>
            <div className="text-3xl font-bold text-blue-600">{spaceUtilization.toFixed(1)}%</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, spaceUtilization)}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 border-2 border-green-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Stability Score</div>
            <div className="text-3xl font-bold text-green-600">{stability.overallStabilityScore.toFixed(0)}/100</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${stability.overallStabilityScore}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 border-2 border-purple-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Optimization Score</div>
            <div className="text-3xl font-bold text-purple-600">{score.toFixed(0)}/100</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, score)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Packing Efficiency:</span>
            <span className="font-medium">{efficiency.toFixed(2)} units/ft³</span>
          </div>
        </div>
      </div>

      {/* Warnings & Recommendations */}
      {stability.warnings.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 flex items-center text-yellow-800">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Warnings & Recommendations
          </h3>
          <ul className="space-y-2">
            {stability.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Slip Sheet Information */}
      {slipSheets.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Slip Sheet Placement</h3>
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Slip sheets will be inserted at the following layer positions:
            </p>
            <div className="flex flex-wrap gap-2">
              {slipSheets.map((sheet, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  After Layer {sheet.position + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
