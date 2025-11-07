import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export const PalletVisualizer: React.FC = () => {
  const { currentResult } = useStore();
  const topViewRef = useRef<HTMLCanvasElement>(null);
  const sideViewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!currentResult) return;

    drawTopView();
    drawSideView();
  }, [currentResult]);

  const drawTopView = () => {
    if (!currentResult || !topViewRef.current) return;

    const canvas = topViewRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { configuration } = currentResult;
    const { pallet, layerConfig } = configuration;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale to fit canvas
    const padding = 40;
    const maxDim = Math.max(pallet.dimensions.length, pallet.dimensions.width);
    const scale = (Math.min(canvas.width, canvas.height) - 2 * padding) / maxDim;

    const offsetX = (canvas.width - pallet.dimensions.length * scale) / 2;
    const offsetY = (canvas.height - pallet.dimensions.width * scale) / 2;

    // Draw pallet
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      offsetX,
      offsetY,
      pallet.dimensions.length * scale,
      pallet.dimensions.width * scale
    );

    // Fill pallet with wood color
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(
      offsetX,
      offsetY,
      pallet.dimensions.length * scale,
      pallet.dimensions.width * scale
    );

    // Draw units
    ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 1;

    layerConfig.arrangement.forEach((unit) => {
      const x = offsetX + unit.x * scale;
      const y = offsetY + unit.y * scale;
      const width = unit.length * scale;
      const height = unit.width * scale;

      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);

      // Draw rotation indicator if rotated
      if (unit.rotation === 90) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x + width * 0.5, y + height * 0.3);
        ctx.lineTo(x + width * 0.7, y + height * 0.5);
        ctx.lineTo(x + width * 0.5, y + height * 0.7);
        ctx.lineTo(x + width * 0.3, y + height * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      }
    });

    // Draw dimensions
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // Length dimension
    ctx.fillText(
      `${pallet.dimensions.length}"`,
      canvas.width / 2,
      offsetY - 10
    );

    // Width dimension
    ctx.save();
    ctx.translate(offsetX - 20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${pallet.dimensions.width}"`, 0, 0);
    ctx.restore();

    // Title
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Top View', canvas.width / 2, 20);
  };

  const drawSideView = () => {
    if (!currentResult || !sideViewRef.current) return;

    const canvas = sideViewRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { configuration } = currentResult;
    const { pallet, totalLayers, layerConfig, slipSheets, overallHeight } = configuration;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale
    const padding = 40;
    const scaleX = (canvas.width - 2 * padding) / pallet.dimensions.length;
    const scaleY = (canvas.height - 2 * padding) / Math.max(overallHeight, pallet.maxHeight || 72);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - pallet.dimensions.length * scale) / 2;
    const offsetY = canvas.height - padding;

    // Draw pallet base
    const palletHeight = 6; // inches
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(
      offsetX,
      offsetY - palletHeight * scale,
      pallet.dimensions.length * scale,
      palletHeight * scale
    );

    // Draw layers
    let currentHeight = 0;
    for (let i = 0; i < totalLayers; i++) {
      const layerY = offsetY - palletHeight * scale - currentHeight * scale;
      const layerHeight = layerConfig.layerHeight * scale;

      // Alternate colors for visibility
      ctx.fillStyle = i % 2 === 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(37, 99, 235, 0.7)';
      ctx.fillRect(
        offsetX,
        layerY - layerHeight,
        pallet.dimensions.length * scale,
        layerHeight
      );

      // Draw layer outline
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        offsetX,
        layerY - layerHeight,
        pallet.dimensions.length * scale,
        layerHeight
      );

      currentHeight += layerConfig.layerHeight;

      // Draw slip sheet if present
      const hasSlipSheet = slipSheets.some(s => s.position === i);
      if (hasSlipSheet) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(
          offsetX,
          layerY - layerHeight - 2,
          pallet.dimensions.length * scale,
          2
        );
        currentHeight += 0.04; // slip sheet thickness
      }
    }

    // Draw height indicator
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    const totalHeightY = offsetY - palletHeight * scale - overallHeight * scale;
    ctx.beginPath();
    ctx.moveTo(offsetX + pallet.dimensions.length * scale + 10, offsetY);
    ctx.lineTo(offsetX + pallet.dimensions.length * scale + 10, totalHeightY);
    ctx.stroke();

    // Height arrows
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(offsetX + pallet.dimensions.length * scale + 10, offsetY);
    ctx.lineTo(offsetX + pallet.dimensions.length * scale + 5, offsetY - 5);
    ctx.moveTo(offsetX + pallet.dimensions.length * scale + 10, offsetY);
    ctx.lineTo(offsetX + pallet.dimensions.length * scale + 15, offsetY - 5);
    ctx.moveTo(offsetX + pallet.dimensions.length * scale + 10, totalHeightY);
    ctx.lineTo(offsetX + pallet.dimensions.length * scale + 5, totalHeightY + 5);
    ctx.moveTo(offsetX + pallet.dimensions.length * scale + 10, totalHeightY);
    ctx.lineTo(offsetX + pallet.dimensions.length * scale + 15, totalHeightY + 5);
    ctx.stroke();

    // Height text
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${overallHeight.toFixed(1)}"`,
      offsetX + pallet.dimensions.length * scale + 20,
      (offsetY + totalHeightY) / 2
    );

    // Title
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Side View', canvas.width / 2, 20);

    // Layer count
    ctx.font = '12px sans-serif';
    ctx.fillText(`${totalLayers} layers`, canvas.width / 2, 35);
  };

  if (!currentResult) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Pallet Visualization</h2>
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          Calculate a configuration to see visualization
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Pallet Visualization</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <canvas
            ref={topViewRef}
            width={400}
            height={400}
            className="border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <canvas
            ref={sideViewRef}
            width={400}
            height={400}
            className="border border-gray-300 rounded w-full"
          />
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
        <h4 className="font-semibold mb-2">Legend:</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 mr-2"></div>
            <span>Slip sheets</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 mr-2"></div>
            <span>Product layers</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4" style={{ backgroundColor: '#8B4513' }}></div>
            <span className="ml-2">Pallet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
