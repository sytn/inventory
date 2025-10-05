import React, { useState, useEffect } from 'react';
import { Package, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import EditProductDialog from './EditProductDialog';

const ProductTable = ({ refreshTrigger }) => {
  const [products, setProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cloth_type: '',
    fabric_type: '',
    size_set: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchInventory();
  }, [filters, refreshTrigger]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filters.cloth_type) queryParams.append('cloth_type', filters.cloth_type);
      if (filters.fabric_type) queryParams.append('fabric_type', filters.fabric_type);
      if (filters.size_set) queryParams.append('size_set', filters.size_set);

      const url = `http://localhost:5000/api/products${queryParams.toString() ? `/search?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      const data = await response.json();
      
      // Convert array to object for easy lookup by product_id
      const inventoryMap = {};
      data.forEach(item => {
        inventoryMap[item.product_id] = item;
      });
      setInventoryData(inventoryMap);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const getStockQuantity = (productId) => {
    return inventoryData[productId]?.stock_quantity || 0;
  };

  const getStockStatus = (productId) => {
    const stock = getStockQuantity(productId);
    const threshold = inventoryData[productId]?.low_stock_threshold || 10;
    
    if (stock === 0) return { variant: 'destructive', text: 'Out of Stock' };
    if (stock <= threshold) return { variant: 'destructive', text: 'Low Stock' };
    return { variant: 'default', text: 'In Stock' };
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditDialog(true);
  };

  const handleDelete = async (productId, productCode) => {
    if (!confirm(`Are you sure you want to delete product ${productCode}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productCode}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast.success('Product deleted successfully!');
      fetchProducts(); // Refresh the list
      fetchInventory(); // Refresh inventory data
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const handleProductUpdated = () => {
    fetchProducts(); // Refresh the list
    fetchInventory(); // Refresh inventory data
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const getSizeSetBadge = (sizeSet) => {
    return sizeSet === 'STANDARD' 
      ? <Badge variant="default">Standard</Badge>
      : <Badge variant="secondary">Plus</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product code..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.cloth_type}
                onChange={(e) => handleFilterChange('cloth_type', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">All Cloth Types</option>
                <option value="DRESS">Dress</option>
                <option value="BLOUSE">Blouse</option>
                <option value="SKIRT">Skirt</option>
                <option value="TOP">Top</option>
                <option value="PANTS">Pants</option>
              </select>

              <select
                value={filters.fabric_type}
                onChange={(e) => handleFilterChange('fabric_type', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">All Fabric Types</option>
                <option value="COTTON">Cotton</option>
                <option value="SILK">Silk</option>
                <option value="DENIM">Denim</option>
                <option value="LINEN">Linen</option>
                <option value="POLYESTER">Polyester</option>
                <option value="WOOL">Wool</option>
              </select>

              <select
                value={filters.size_set}
                onChange={(e) => handleFilterChange('size_set', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">All Size Sets</option>
                <option value="STANDARD">Standard</option>
                <option value="PLUS">Plus</option>
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Code</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Fabric</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Color</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Size Set</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Price</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Stock</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.id);
                    return (
                      <tr key={product.id} className="border-b">
                        <td className="p-4 align-middle font-medium">{product.product_code}</td>
                        <td className="p-4 align-middle">{product.cloth_type}</td>
                        <td className="p-4 align-middle">{product.fabric_type}</td>
                        <td className="p-4 align-middle">{product.color}</td>
                        <td className="p-4 align-middle">{getSizeSetBadge(product.size_set)}</td>
                        <td className="p-4 align-middle">
                          {product.unit_price ? `$${product.unit_price}` : '-'}
                        </td>
                        <td className="p-4 align-middle font-medium">
                          {getStockQuantity(product.id)} sets
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.text}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(product.id, product.product_code)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={editingProduct}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
};

export default ProductTable;