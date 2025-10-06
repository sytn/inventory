import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

const EditProductDialog = ({ open, onOpenChange, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    product_code: '',
    cloth_type: '',
    fabric_type: '',
    color: '',
    size_set: '',
    unit_price: '',
    description: '',
    stock_adjustment: '',
    adjustment_reason: 'ADJUSTMENT'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStock, setCurrentStock] = useState(0);

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        product_code: product.product_code || '',
        cloth_type: product.cloth_type || '',
        fabric_type: product.fabric_type || '',
        color: product.color || '',
        size_set: product.size_set || '',
        unit_price: product.unit_price || '',
        description: product.description || '',
        stock_adjustment: '',
        adjustment_reason: 'ADJUSTMENT'
      });
      fetchCurrentStock(product.id);
    }
  }, [product]);

  const fetchCurrentStock = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/product/${productId}`);
      if (response.ok) {
        const inventoryData = await response.json();
        setCurrentStock(inventoryData.stock_quantity || 0);
      }
    } catch (error) {
      console.error('Error fetching current stock:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      product_code: '',
      cloth_type: '',
      fabric_type: '',
      color: '',
      size_set: '',
      unit_price: '',
      description: '',
      stock_adjustment: '',
      adjustment_reason: 'ADJUSTMENT'
    });
    setErrors({});
    setCurrentStock(0);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      // Update product
      const productResponse = await fetch(`http://localhost:5000/api/products/${product.product_code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_code: formData.product_code,
          cloth_type: formData.cloth_type,
          fabric_type: formData.fabric_type,
          color: formData.color,
          size_set: formData.size_set,
          unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
          description: formData.description
        }),
      });

      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      // If stock adjustment provided, create stock movement
      if (formData.stock_adjustment && formData.stock_adjustment !== '0') {
        const adjustment = parseInt(formData.stock_adjustment);
        const movementType = adjustment > 0 ? 'IN' : 'OUT';
        const quantity = Math.abs(adjustment);

        const stockResponse = await fetch('http://localhost:5000/api/stock-movements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: product.id,
            movement_type: movementType,
            quantity: quantity,
            reason: formData.adjustment_reason,
            notes: `Stock adjustment during product edit`,
            created_by: 'admin'
          }),
        });

        if (!stockResponse.ok) {
          throw new Error('Product updated but failed to adjust stock');
        }
      }

      const updatedProduct = await productResponse.json();
      
      resetForm();
      onOpenChange(false);
      
      if (onProductUpdated) {
        onProductUpdated();
      }
      
      toast.success('Product updated successfully!');
      
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Edit Product</CardTitle>
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
            {/* Current Stock Display */}
            <div className="bg-muted p-4 rounded-lg">
              <Label className="text-sm font-medium">Current Stock</Label>
              <div className="text-2xl font-bold mt-1">{currentStock} sets</div>
            </div>

            {/* Stock Adjustment */}
            <div className="space-y-2">
              <Label htmlFor="stock_adjustment">Stock Adjustment</Label>
              <div className="flex gap-2">
                <Input
                  id="stock_adjustment"
                  type="number"
                  value={formData.stock_adjustment}
                  onChange={(e) => handleChange('stock_adjustment', e.target.value)}
                  placeholder="e.g., +50 or -10"
                  className="flex-1"
                />
                <select
                  value={formData.adjustment_reason}
                  onChange={(e) => handleChange('adjustment_reason', e.target.value)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="ADJUSTMENT">Adjustment</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="SALE">Sale</option>
                  <option value="RETURN">Return</option>
                  <option value="DAMAGE">Damage</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter positive number to add stock, negative to remove
              </p>
            </div>

            {/* Product Code */}
            <div className="space-y-2">
              <Label htmlFor="edit_product_code">Product Code *</Label>
              <Input
                id="edit_product_code"
                value={formData.product_code}
                onChange={(e) => handleChange('product_code', e.target.value)}
                placeholder="e.g., 22011, 33100"
                className={errors.product_code ? 'border-destructive' : ''}
              />
              {errors.product_code && (
                <p className="text-sm text-destructive">{errors.product_code}</p>
              )}
            </div>

            {/* Rest of the form fields (cloth type, fabric type, etc.) remain the same */}
            <div className="space-y-2">
              <Label htmlFor="edit_cloth_type">Cloth Type *</Label>
              <select
                id="edit_cloth_type"
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

            {/* ... other form fields ... */}

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
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductDialog;