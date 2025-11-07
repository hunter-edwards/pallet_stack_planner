import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const PrintCard: React.FC = () => {
  const { currentResult } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);

  if (!currentResult) {
    return null;
  }

  const { configuration } = currentResult;
  const { product, pallet, layerConfig, totalLayers, totalUnits, slipSheets, totalWeight, overallHeight, stability } = configuration;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`pallet-card-${product.sku}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 print:shadow-none">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-2xl font-bold">Production Print Card</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div ref={cardRef} className="border-4 border-black p-8 bg-white">
        {/* Header */}
        <div className="border-b-4 border-black pb-4 mb-6">
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div>
              <span className="font-semibold">SKU:</span> {product.sku}
            </div>
            <div className="text-right">
              <span className="font-semibold">Date:</span> {currentDate}
            </div>
          </div>
        </div>

        {/* Main Specifications */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Left Column - Key Metrics */}
          <div className="space-y-6">
            <div className="bg-blue-100 border-2 border-blue-600 p-6 rounded-lg">
              <div className="text-sm text-gray-600">UNITS PER LAYER</div>
              <div className="text-6xl font-bold text-blue-700">{layerConfig.unitsPerLayer}</div>
            </div>

            <div className="bg-green-100 border-2 border-green-600 p-6 rounded-lg">
              <div className="text-sm text-gray-600">TOTAL LAYERS</div>
              <div className="text-6xl font-bold text-green-700">{totalLayers}</div>
            </div>

            <div className="bg-purple-100 border-2 border-purple-600 p-6 rounded-lg">
              <div className="text-sm text-gray-600">TOTAL UNITS</div>
              <div className="text-6xl font-bold text-purple-700">{totalUnits}</div>
            </div>
          </div>

          {/* Right Column - Diagrams */}
          <div className="space-y-4">
            <div className="border-2 border-gray-400 p-4">
              <div className="font-bold text-center mb-2">TOP VIEW</div>
              <TopViewDiagram config={configuration} />
            </div>

            <div className="border-2 border-gray-400 p-4">
              <div className="font-bold text-center mb-2">SIDE VIEW</div>
              <SideViewDiagram config={configuration} />
            </div>
          </div>
        </div>

        {/* Detailed Specifications */}
        <div className="border-t-2 border-black pt-6 space-y-4">
          <h3 className="text-2xl font-bold mb-4">SPECIFICATIONS</h3>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base">
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="font-semibold">Pallet Size:</span>
              <span>{pallet.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="font-semibold">Orientation:</span>
              <span className="uppercase">{layerConfig.orientation}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="font-semibold">Total Height:</span>
              <span>{overallHeight.toFixed(2)}"</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="font-semibold">Total Weight:</span>
              <span>{totalWeight.toFixed(1)} lbs</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="font-semibold">Layer Height:</span>
              <span>{layerConfig.layerHeight.toFixed(2)}"</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="font-semibold">Slip Sheets:</span>
              <span>{slipSheets.length} sheets</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {stability.warnings.length > 0 && (
          <div className="border-4 border-yellow-500 bg-yellow-50 p-4 mt-6">
            <h3 className="text-xl font-bold mb-2 text-yellow-800">⚠ IMPORTANT NOTES:</h3>
            <ul className="list-disc list-inside space-y-1">
              {stability.warnings.map((warning, index) => (
                <li key={index} className="text-base text-yellow-800">{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Slip Sheet Positions */}
        {slipSheets.length > 0 && (
          <div className="border-2 border-gray-400 bg-gray-50 p-4 mt-4">
            <h3 className="text-lg font-bold mb-2">SLIP SHEET PLACEMENT:</h3>
            <div className="flex flex-wrap gap-2">
              {slipSheets.map((sheet, index) => (
                <span key={index} className="px-3 py-1 bg-yellow-200 border-2 border-yellow-600 rounded font-semibold">
                  After Layer {sheet.position + 1}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-black mt-6 pt-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <div>Configuration ID: {configuration.id}</div>
            <div>Generated: {new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple SVG-based diagram components for print quality
const TopViewDiagram: React.FC<{ config: any }> = ({ config }) => {
  const { pallet, layerConfig } = config;
  const viewBoxSize = 200;
  const padding = 10;
  const maxDim = Math.max(pallet.dimensions.length, pallet.dimensions.width);
  const scale = (viewBoxSize - 2 * padding) / maxDim;

  return (
    <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-48">
      {/* Pallet */}
      <rect
        x={padding}
        y={padding}
        width={pallet.dimensions.length * scale}
        height={pallet.dimensions.width * scale}
        fill="#DEB887"
        stroke="#8B4513"
        strokeWidth="2"
      />

      {/* Units */}
      {layerConfig.arrangement.map((unit: any, i: number) => (
        <rect
          key={i}
          x={padding + unit.x * scale}
          y={padding + unit.y * scale}
          width={unit.length * scale}
          height={unit.width * scale}
          fill="rgba(59, 130, 246, 0.6)"
          stroke="#1e40af"
          strokeWidth="1"
        />
      ))}

      {/* Dimensions */}
      <text
        x={padding + (pallet.dimensions.length * scale) / 2}
        y={padding - 3}
        textAnchor="middle"
        fontSize="10"
        fill="#000"
      >
        {pallet.dimensions.length}"
      </text>
    </svg>
  );
};

const SideViewDiagram: React.FC<{ config: any }> = ({ config }) => {
  const { pallet, totalLayers, layerConfig, slipSheets, overallHeight } = config;
  const viewBoxWidth = 200;
  const viewBoxHeight = 150;
  const padding = 10;
  const palletHeight = 6;

  const scaleX = (viewBoxWidth - 2 * padding) / pallet.dimensions.length;
  const scaleY = (viewBoxHeight - 2 * padding) / (overallHeight + palletHeight);
  const scale = Math.min(scaleX, scaleY);

  const palletWidth = pallet.dimensions.length * scale;
  const palletHeightScaled = palletHeight * scale;
  const startY = viewBoxHeight - padding;

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-48">
      {/* Pallet base */}
      <rect
        x={padding}
        y={startY - palletHeightScaled}
        width={palletWidth}
        height={palletHeightScaled}
        fill="#8B4513"
        stroke="#000"
        strokeWidth="1"
      />

      {/* Layers */}
      {Array.from({ length: totalLayers }).map((_, i) => {
        const layerY = startY - palletHeightScaled - (i * layerConfig.layerHeight * scale);
        const layerHeight = layerConfig.layerHeight * scale;
        const hasSlipSheet = slipSheets.some((s: any) => s.position === i);

        return (
          <g key={i}>
            <rect
              x={padding}
              y={layerY - layerHeight}
              width={palletWidth}
              height={layerHeight}
              fill={i % 2 === 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(37, 99, 235, 0.7)'}
              stroke="#1e40af"
              strokeWidth="1"
            />
            {hasSlipSheet && (
              <rect
                x={padding}
                y={layerY - layerHeight - 1}
                width={palletWidth}
                height={1}
                fill="#fbbf24"
              />
            )}
          </g>
        );
      })}

      {/* Height dimension */}
      <line
        x1={padding + palletWidth + 5}
        y1={startY}
        x2={padding + palletWidth + 5}
        y2={startY - palletHeightScaled - (overallHeight * scale)}
        stroke="#000"
        strokeWidth="1"
        strokeDasharray="2,2"
      />

      <text
        x={padding + palletWidth + 10}
        y={startY - (palletHeightScaled + overallHeight * scale) / 2}
        fontSize="8"
        fill="#000"
      >
        {overallHeight.toFixed(1)}"
      </text>
    </svg>
  );
};
