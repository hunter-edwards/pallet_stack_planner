import React, { useState } from 'react';
import { useStore, SAMPLE_PRODUCTS } from '../store/useStore';
import type { Product, MaterialType, ProductType } from '../models/types';

export const ProductInput: React.FC = () => {
  const {
    products,
    selectedProduct,
    selectProduct,
    addProduct,
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    type: 'flat',
    dimensions: { length: 0, width: 0, height: 0 },
    weight: 0,
    material: { type: 'single-wall', caliper: 42 },
    nestable: false,
  });

  const allProducts = [...SAMPLE_PRODUCTS, ...products];

  const handleSelectProduct = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    selectProduct(product || null);
  };

  const handleCreateProduct = () => {
    if (!formData.name || !formData.sku) {
      alert('Please provide product name and SKU');
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      type: formData.type || 'flat',
      dimensions: formData.dimensions || { length: 0, width: 0, height: 0 },
      weight: formData.weight || 0,
      material: formData.material || { type: 'single-wall', caliper: 42 },
      nestable: formData.nestable || false,
      nestingDepth: formData.nestingDepth,
      compressionStrength: formData.compressionStrength,
      createdAt: new Date(),
    };

    addProduct(newProduct);
    selectProduct(newProduct);
    setIsCreating(false);
    setFormData({
      name: '',
      sku: '',
      type: 'flat',
      dimensions: { length: 0, width: 0, height: 0 },
      weight: 0,
      material: { type: 'single-wall', caliper: 42 },
      nestable: false,
    });
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Product] as any),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Product Selection</h2>

      {!isCreating ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedProduct?.id || ''}
              onChange={(e) => handleSelectProduct(e.target.value)}
            >
              <option value="">-- Select a product --</option>
              {allProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) - {product.dimensions.length}" × {product.dimensions.width}"
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">SKU:</span> {selectedProduct.sku}</div>
                <div><span className="font-medium">Type:</span> {selectedProduct.type}</div>
                <div>
                  <span className="font-medium">Dimensions:</span>{' '}
                  {selectedProduct.dimensions.length}" × {selectedProduct.dimensions.width}" × {selectedProduct.dimensions.height}"
                </div>
                <div><span className="font-medium">Weight:</span> {selectedProduct.weight} lbs</div>
                <div><span className="font-medium">Material:</span> {selectedProduct.material.type}</div>
                <div><span className="font-medium">Nestable:</span> {selectedProduct.nestable ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCreating(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            + Create New Product
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name || ''}
              onChange={(e) => updateFormField('name', e.target.value)}
              placeholder="e.g., Standard Single Wall Sheet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.sku || ''}
              onChange={(e) => updateFormField('sku', e.target.value)}
              placeholder="e.g., SW-48x40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.type}
              onChange={(e) => updateFormField('type', e.target.value as ProductType)}
            >
              <option value="flat">Flat Sheet</option>
              <option value="glued">Glued/Folded</option>
              <option value="kit">Kit</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length (in)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dimensions?.length || 0}
                onChange={(e) => updateFormField('dimensions.length', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (in)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dimensions?.width || 0}
                onChange={(e) => updateFormField('dimensions.width', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (in)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dimensions?.height || 0}
                onChange={(e) => updateFormField('dimensions.height', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.weight || 0}
              onChange={(e) => updateFormField('weight', parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.material?.type}
              onChange={(e) => updateFormField('material.type', e.target.value as MaterialType)}
            >
              <option value="single-wall">Single Wall</option>
              <option value="double-wall">Double Wall</option>
              <option value="triple-wall">Triple Wall</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="nestable"
              className="mr-2"
              checked={formData.nestable || false}
              onChange={(e) => updateFormField('nestable', e.target.checked)}
            />
            <label htmlFor="nestable" className="text-sm font-medium text-gray-700">
              Nestable
            </label>
          </div>

          {formData.nestable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nesting Depth (in)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nestingDepth || 0}
                onChange={(e) => updateFormField('nestingDepth', parseFloat(e.target.value))}
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreateProduct}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Create Product
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
