import { StrictMode, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SupplierProvider } from './context/SupplierContext';
import { TankProvider } from './context/TankContext';
import { OrderProvider } from './context/OrderContext';
import { BigSupplierProvider } from './context/BigSupplierContext';
import { ClientSuggestionsProvider } from './context/ClientSuggestionsContext';
import { ClientTrackingProvider } from './context/ClientTrackingContext';
import { ClientProvider } from './context/ClientContext';
import { ClientDataProvider } from './context/ClientDataContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { BarrelProvider } from './context/BarrelContext';
import { getTruckMaintenanceStatus } from './firebase/services/truckMaintenance';
import { getCustomTrucks } from './firebase/services/trucks';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SuppliersPage from './pages/SuppliersPage';
import AddSupplierPage from './pages/AddSupplierPage';
import EditSupplierPage from './pages/EditSupplierPage';
import SupplierTrackingPage from './pages/SupplierTrackingPage';
import SupplierTrackingDetailsPage from './components/suppliers/tracking/SupplierTrackingPage';
import ClientTrackingPage from './components/clients/tracking/ClientTrackingPage';
import TanksPage from './pages/TanksPage';
import AddTankPage from './pages/AddTankPage';
import EditTankPage from './pages/EditTankPage';
import OrdersPage from './pages/OrdersPage';
import AddOrderPage from './pages/AddOrderPage';
import BigSuppliersPage from './pages/BigSuppliersPage';
import AddBigSupplierPage from './pages/AddBigSupplierPage';
import CalculatorPage from './pages/CalculatorPage';
import CalendarPage from './pages/CalendarPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import TruckConsumptionPage from './pages/TruckConsumptionPage';
import AddClientPage from './pages/AddClientPage';
import ClientDataPage from './pages/ClientDataPage';
import AddClientDataPage from './pages/AddClientDataPage';
import InvoicesPage from './pages/InvoicesPage';
import AddInvoicePage from './pages/AddInvoicePage';
import BarrelsPage from './pages/BarrelsPage';
import AddBarrelPage from './pages/AddBarrelPage';
import EditBarrelPage from './pages/EditBarrelPage';

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const DEFAULT_TRUCKS = [
  { id: 'solo1', name: 'Solo 1' },
  { id: 'solo2', name: 'Solo 2' },
  { id: 'man', name: 'Man' },
  { id: 'renault', name: 'Renault' }
];

function DocumentExpirationAlert() {
  const { user } = useAuth();
  const [expiringDocuments, setExpiringDocuments] = useState<Array<{
    truckName: string;
    documentName: string;
    daysRemaining: number;
    expirationDate: string;
    isExpired: boolean;
  }>>([]);
  const [visible, setVisible] = useState(true);
  const [trucks, setTrucks] = useState(DEFAULT_TRUCKS);

  useEffect(() => {
    const loadTrucks = async () => {
      try {
        const customTrucks = await getCustomTrucks();
        setTrucks([...DEFAULT_TRUCKS, ...customTrucks]);
      } catch (error) {
        console.error('Error loading custom trucks:', error);
      }
    };
    loadTrucks();
  }, []);

  useEffect(() => {
    const checkDocuments = async () => {
      const statuses = await Promise.all(
        trucks.map(async (truck) => {
          const status = await getTruckMaintenanceStatus(truck.id);
          return {
            truckName: truck.name,
            status: status.documents
          };
        })
      );

      const expiring = statuses
        .filter(({ status }) => (status.status === 'proche' || status.status === 'expire') && status.nomDocument)
        .map(({ truckName, status }) => ({
          truckName,
          documentName: status.nomDocument!,
          daysRemaining: status.joursRestants!,
          expirationDate: new Date(Date.now() + status.joursRestants! * 24 * 60 * 60 * 1000)
            .toLocaleDateString('fr-FR'),
          isExpired: status.status === 'expire'
        }));

      setExpiringDocuments(expiring);
    };

    checkDocuments();

    // Hide alert after 20 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 20000);

    return () => clearTimeout(timer);
  }, [trucks]);

  // Only show alerts for admin users
  if (user?.role !== 'admin') {
    return null;
  }

  if (!visible || expiringDocuments.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg bg-yellow-50 p-4 shadow-lg dark:bg-yellow-900/30">
      <div className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
        Documents à renouveler
      </div>
      {expiringDocuments.map((doc, index) => (
        <div 
          key={index} 
          className={`text-sm ${
            doc.isExpired 
              ? 'text-red-700 dark:text-red-400' 
              : 'text-yellow-700 dark:text-yellow-300'
          }`}
        >
          <strong>{doc.truckName}</strong>: {doc.documentName} 
          {doc.isExpired 
            ? ' est expiré' 
            : ` expire le ${doc.expirationDate} (${doc.daysRemaining} jours restants)`
          }
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SupplierProvider>
          <TankProvider>
            <OrderProvider>
              <BigSupplierProvider>
                <ClientProvider>
                  <ClientDataProvider>
                    <InvoiceProvider>
                      <BarrelProvider>
                        <ClientSuggestionsProvider>
                          <ClientTrackingProvider>
                        <Router>
                          <DocumentExpirationAlert />
                          <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/suppliers" element={<SuppliersPage />} />
                            <Route path="/suppliers/new" element={<AddSupplierPage />} />
                            <Route path="/suppliers/edit/:id" element={<EditSupplierPage />} />
                            <Route path="/supplier-tracking" element={
                              <AdminRoute>
                                <SupplierTrackingPage />
                              </AdminRoute>
                            } />
                            <Route path="/supplier-tracking/:id" element={
                              <AdminRoute>
                                <SupplierTrackingDetailsPage />
                              </AdminRoute>
                            } />
                            <Route path="/client-tracking" element={
                              <AdminRoute>
                                <ClientTrackingPage />
                              </AdminRoute>
                            } />
                            <Route path="/client-tracking/:id" element={
                              <AdminRoute>
                                <ClientTrackingPage />
                              </AdminRoute>
                            } />
                            <Route path="/clients/new" element={<AddClientPage />} />
                            <Route path="/client-data" element={
                              <AdminRoute>
                                <ClientDataPage />
                              </AdminRoute>
                            } />
                            <Route path="/client-data/new" element={
                              <AdminRoute>
                                <AddClientDataPage />
                              </AdminRoute>
                            } />
                            <Route path="/invoices" element={
                              <AdminRoute>
                                <InvoicesPage />
                              </AdminRoute>
                            } />
                            <Route path="/invoices/new" element={
                              <AdminRoute>
                                <AddInvoicePage />
                              </AdminRoute>
                            } />
                            <Route path="/tanks" element={<TanksPage />} />
                            <Route path="/tanks/new" element={<AddTankPage />} />
                            <Route path="/tanks/edit/:id" element={<EditTankPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/orders/new" element={<AddOrderPage />} />
                            <Route path="/big-suppliers" element={<BigSuppliersPage />} />
                            <Route path="/big-suppliers/new" element={<AddBigSupplierPage />} />
                            <Route path="/calculator" element={<CalculatorPage />} />
                            <Route path="/calendar" element={<CalendarPage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/truck-consumption" element={<TruckConsumptionPage />} />
                            <Route path="/barrels" element={<BarrelsPage />} />
                            <Route path="/barrels/new" element={<AddBarrelPage />} />
                            <Route path="/barrels/edit/:id" element={<EditBarrelPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </Router>
                          </ClientTrackingProvider>
                        </ClientSuggestionsProvider>
                      </BarrelProvider>
                    </InvoiceProvider>
                  </ClientDataProvider>
                </ClientProvider>
              </BigSupplierProvider>
            </OrderProvider>
          </TankProvider>
        </SupplierProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;