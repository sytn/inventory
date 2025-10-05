import React, { useState, useEffect } from 'react';
import { Package, TrendingDown, AlertTriangle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch all inventory
      const inventoryResponse = await fetch('http://localhost:5000/api/inventory');
      const inventoryData = await inventoryResponse.json();
      setInventory(inventoryData);

      // Fetch low stock items
      const lowStockResponse = await fetch('http://localhost:5000/api/reports/low-stock');
      const lowStockData = await lowStockResponse.json();
      setLowStock(lowStockData);

      // Fetch summary
      const summaryResponse = await fetch('http://localhost:5000/api/reports/inventory-summary');
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/export/inventory/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return { variant: 'destructive', text: 'Out of Stock' };
    if (quantity <= threshold) return { variant: 'destructive', text: 'Low Stock' };
    return { variant: 'default', text: 'In Stock' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading inventory data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Dashboard</h2>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts ({lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map((item) => (
                <div key={item.product_id} className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                  <div>
                    <span className="font-medium">{item.products?.product_code}</span>
                    <span className="text-muted-foreground ml-2">
                      - {item.products?.cloth_type} • {item.products?.fabric_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-destructive font-medium">
                      Stock: {item.stock_quantity} (Threshold: {item.low_stock_threshold})
                    </span>
                    <Button variant="outline" size="sm">Restock</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStock || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.lowStockItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.outOfStockItems || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Details ({inventory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inventory data found
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Product Code</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Fabric</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Size Set</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Current Stock</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Threshold</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const status = getStockStatus(item.stock_quantity, item.low_stock_threshold);
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="p-4 align-middle font-medium">
                          {item.products?.product_code}
                        </td>
                        <td className="p-4 align-middle">{item.products?.cloth_type}</td>
                        <td className="p-4 align-middle">{item.products?.fabric_type}</td>
                        <td className="p-4 align-middle">
                          {item.products?.size_set === 'STANDARD' 
                            ? <Badge variant="secondary">Standard</Badge>
                            : <Badge variant="outline">Plus</Badge>
                          }
                        </td>
                        <td className="p-4 align-middle font-medium">
                          {item.stock_quantity}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {item.low_stock_threshold}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={status.variant}>
                            {status.text}
                          </Badge>
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
    </div>
  );
};

export default InventoryDashboard;