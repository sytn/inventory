import React, { useState, useEffect } from 'react';
import { Package, BarChart3, TrendingDown, Plus } from 'lucide-react';
import ProductTable from './components/ProductTable';
import InventoryDashboard from './components/InventoryDashboard';
import AddProductDialog from './components/AddProductDialog';
import ThemeToggle from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const refreshData = () => {
    fetchStats();
    setRefreshTrigger(prev => prev + 1);
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/inventory-summary');
      const data = await response.json();
      setStats({
        totalProducts: data.totalProducts,
        totalStock: data.totalStock,
        lowStockItems: data.lowStockItems
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <ThemeProvider>
      <AppContent 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        stats={stats}
        refreshTrigger={refreshTrigger}
        refreshData={refreshData}
      />
    </ThemeProvider>
  );
}

// Separate component to use the theme hook
function AppContent({ 
  activeTab, 
  setActiveTab, 
  showAddDialog, 
  setShowAddDialog, 
  stats, 
  refreshTrigger, 
  refreshData 
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Textile Inventory</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
          >
            Products
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'outline'}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'products' && <ProductTable refreshTrigger={refreshTrigger} />}
        {activeTab === 'inventory' && <InventoryDashboard />}
      </div>

      {/* Add Product Dialog */}
      <AddProductDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onProductAdded={refreshData}
      />
    </div>
  );
}

export default App;