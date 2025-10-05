import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

const AddProductDialog = ({ open, onOpenChange, onProductAdded }) => {
  const [formData, setFormData] = useState({
    product_code: '',
    cloth_type: '',
    fabric_type: '',
    color: '',
    size_set: '',
    unit_price: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setFormData({
      product_code: '',
      cloth_type: '',
      fabric_type: '',
      color: '',
      size_set: '',
      unit_price: '',
      description: ''
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.product_code.trim()) {
      newErrors.product_code = 'Product code is required';
    }
    if (!formData.cloth_type) {
      newErrors.cloth_type = 'Cloth type is required';
    }
    if (!formData.fabric_type) {
      newErrors.fabric_type = 'Fabric type is required';
    }
    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }
    if (!formData.size_set) {
      newErrors.size_set = 'Size set is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setLoading(true);
  try {
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }

    const newProduct = await response.json();
    
    resetForm();
    onOpenChange(false);
    
    if (onProductAdded) {
      onProductAdded();
    }
    
    toast.success('Product created successfully!');
    
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Add New Product</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Code */}
            <div className="space-y-2">
              <Label htmlFor="product_code">Product Code *</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => handleChange('product_code', e.target.value)}
                placeholder="e.g., 22011, 33100"
                className={errors.product_code ? 'border-destructive' : ''}
              />
              {errors.product_code && (
                <p className="text-sm text-destructive">{errors.product_code}</p>
              )}
            </div>

            {/* Cloth Type */}
            <div className="space-y-2">
              <Label htmlFor="cloth_type">Cloth Type *</Label>
              <select
                id="cloth_type"
                value={formData.cloth_type}
                onChange={(e) => handleChange('cloth_type', e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                  errors.cloth_type ? 'border-destructive' : ''
                }`}
              >
                <option value="">Select cloth type</option>
                <option value="DRESS">Dress</option>
                <option value="BLOUSE">Blouse</option>
                <option value="SKIRT">Skirt</option>
                <option value="TOP">Top</option>
                <option value="PANTS">Pants</option>
              </select>
              {errors.cloth_type && (
                <p className="text-sm text-destructive">{errors.cloth_type}</p>
              )}
            </div>

            {/* Fabric Type */}
            <div className="space-y-2">
              <Label htmlFor="fabric_type">Fabric Type *</Label>
              <select
                id="fabric_type"
                value={formData.fabric_type}
                onChange={(e) => handleChange('fabric_type', e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                  errors.fabric_type ? 'border-destructive' : ''
                }`}
              >
                <option value="">Select fabric type</option>
                <option value="COTTON">Cotton</option>
                <option value="SILK">Silk</option>
                <option value="DENIM">Denim</option>
                <option value="LINEN">Linen</option>
                <option value="POLYESTER">Polyester</option>
                <option value="WOOL">Wool</option>
              </select>
              {errors.fabric_type && (
                <p className="text-sm text-destructive">{errors.fabric_type}</p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="e.g., Blue, Red, Black"
                className={errors.color ? 'border-destructive' : ''}
              />
              {errors.color && (
                <p className="text-sm text-destructive">{errors.color}</p>
              )}
            </div>

            {/* Size Set */}
            <div className="space-y-2">
              <Label htmlFor="size_set">Size Set *</Label>
              <select
                id="size_set"
                value={formData.size_set}
                onChange={(e) => handleChange('size_set', e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                  errors.size_set ? 'border-destructive' : ''
                }`}
              >
                <option value="">Select size set</option>
                <option value="STANDARD">Standard (36,38,40,42)</option>
                <option value="PLUS">Plus (42,44,46,48)</option>
              </select>
              {errors.size_set && (
                <p className="text-sm text-destructive">{errors.size_set}</p>
              )}
            </div>

            {/* Unit Price */}
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleChange('unit_price', e.target.value)}
                placeholder="e.g., 29.99"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Product description (optional)"
                rows="3"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProductDialog;