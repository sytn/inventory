import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

const StockMovementDialog = ({ open, onOpenChange, product, onStockUpdated }) => {
  const [formData, setFormData] = useState({
    movement_type: 'IN',
    quantity: '',
    reason: 'PURCHASE',
    notes: '',
    created_by: 'admin' // Would be dynamic with auth
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && product) {
      setFormData({
        movement_type: 'IN',
        quantity: '',
        reason: 'PURCHASE',
        notes: '',
        created_by: 'admin'
      });
      setErrors({});
    }
  }, [open, product]);

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
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/stock-movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          product_id: product.id,
          quantity: parseInt(formData.quantity)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process stock movement');
      }

      const movement = await response.json();
      
      // Reset form and close dialog
      setFormData({
        movement_type: 'IN',
        quantity: '',
        reason: 'PURCHASE',
        notes: '',
        created_by: 'admin'
      });
      onOpenChange(false);
      
      if (onStockUpdated) {
        onStockUpdated();
      }
      
      const action = formData.movement_type === 'IN' ? 'added to' : 'removed from';
      toast.success(`Stock ${action} ${product.product_code} successfully!`);
      
    } catch (error) {
      console.error('Error processing stock movement:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Stock Movement - {product.product_code}</CardTitle>
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
            {/* Movement Type */}
            <div className="space-y-2">
              <Label>Movement Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.movement_type === 'IN' ? 'default' : 'outline'}
                  onClick={() => handleChange('movement_type', 'IN')}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
                <Button
                  type="button"
                  variant={formData.movement_type === 'OUT' ? 'destructive' : 'outline'}
                  onClick={() => handleChange('movement_type', 'OUT')}
                  className="flex-1"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Stock
                </Button>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="Number of sets"
                className={errors.quantity ? 'border-destructive' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity}</p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <select
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                  errors.reason ? 'border-destructive' : ''
                }`}
              >
                <option value="PURCHASE">Purchase</option>
                <option value="SALE">Sale</option>
                <option value="RETURN">Customer Return</option>
                <option value="DAMAGE">Damage/Loss</option>
                <option value="ADJUSTMENT">Stock Adjustment</option>
              </select>
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional details (optional)"
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
                {loading ? 'Processing...' : `Confirm ${formData.movement_type === 'IN' ? 'Add' : 'Remove'}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovementDialog;