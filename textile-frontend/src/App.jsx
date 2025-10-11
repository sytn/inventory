import React, { useState, useEffect } from 'react';
import { Package, BarChart3, TrendingDown, Plus, LogOut, User } from 'lucide-react';
import ProductTable from './components/ProductTable';
import InventoryDashboard from './components/InventoryDashboard';
import AddProductDialog from './components/AddProductDialog';
import ThemeToggle from './components/ThemeToggle';
import Login from './components/Login';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { apiClient } from './utils/api';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, loading, logout } = useAuth();
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
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get('/reports/inventory-summary');
      setStats({
        totalProducts: data.totalProducts,
        totalStock: data.totalStock,
        lowStockItems: data.lowStockItems
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

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
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="ml-2">
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.full_name || user.username}</span>
              </div>
              <ThemeToggle />
              {user.role === 'admin' && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Dashboard Stats */}
      {user.role === 'admin' && (
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
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6">
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
          {user.role === 'admin' && (
            <Button
              variant={activeTab === 'admin' ? 'default' : 'outline'}
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </Button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'products' && <ProductTable refreshTrigger={refreshTrigger} />}
        {activeTab === 'inventory' && <InventoryDashboard />}
        {activeTab === 'admin' && <AdminDashboard />}
      </div>

      {/* Add Product Dialog - Only for admins */}
      {user.role === 'admin' && (
        <AddProductDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          onProductAdded={refreshData}
        />
      )}
    </div>
  );
}

// Simple Badge component
const Badge = ({ variant = 'default', children, className }) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground'
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default App;