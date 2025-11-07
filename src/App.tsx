import { useState } from 'react';
import { Package } from 'lucide-react';
import { ProductInput } from './components/ProductInput';
import { PalletConfig } from './components/PalletConfig';
import { ResultsDisplay } from './components/ResultsDisplay';
import { PalletVisualizer } from './components/PalletVisualizer';
import { PrintCard } from './components/PrintCard';
import { useStore } from './store/useStore';

function App() {
  const { currentResult } = useStore();
  const [activeTab, setActiveTab] = useState<'results' | 'visualizer' | 'print'>('results');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg print:hidden">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Package className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Corrugated Pallet Planning System</h1>
              <p className="text-blue-100 text-sm">
                Optimize pallet configurations for corrugated packaging materials
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Input Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ProductInput />
            <PalletConfig />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {currentResult ? (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="bg-white rounded-lg shadow p-2 flex gap-2 print:hidden">
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`flex-1 px-4 py-2 rounded transition ${
                      activeTab === 'results'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Results
                  </button>
                  <button
                    onClick={() => setActiveTab('visualizer')}
                    className={`flex-1 px-4 py-2 rounded transition ${
                      activeTab === 'visualizer'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Visualizer
                  </button>
                  <button
                    onClick={() => setActiveTab('print')}
                    className={`flex-1 px-4 py-2 rounded transition ${
                      activeTab === 'print'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Print Card
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'results' && <ResultsDisplay />}
                {activeTab === 'visualizer' && <PalletVisualizer />}
                {activeTab === 'print' && <PrintCard />}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-700 mb-4">
                  Get Started
                </h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Select a product and pallet configuration from the left panel, then click
                  "Calculate Pallet Configuration" to generate optimized stacking results.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Start:</h3>
                  <ol className="text-left text-sm text-blue-800 space-y-1">
                    <li>1. Select or create a product</li>
                    <li>2. Choose a pallet size</li>
                    <li>3. Adjust advanced options if needed</li>
                    <li>4. Click calculate to see results</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12 print:hidden">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            Corrugated Pallet Planning System © {new Date().getFullYear()}
          </p>
          <p className="text-gray-400 mt-1">
            Optimizing packaging efficiency for production excellence
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
