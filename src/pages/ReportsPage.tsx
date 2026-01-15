import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useBigSuppliers } from '../context/BigSupplierContext';
import { useSuppliers } from '../context/SupplierContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { BarChart3, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import OrderMonthlyComparison from '../components/reports/OrderMonthlyComparison';
import BigSupplierAnalysis from '../components/reports/BigSupplierAnalysis';
import SupplierAnalysis from '../components/reports/SupplierAnalysis';
import SupplierStockAnalysis from '../components/reports/SupplierStockAnalysis';
import TrendCharts from '../components/reports/TrendCharts';

const ReportsPage: React.FC = () => {
  const { orders, loading: ordersLoading, error: ordersError, refreshOrders } = useOrders();
  const { bigSuppliers, loading: bigSuppliersLoading, error: bigSuppliersError, refreshBigSuppliers } = useBigSuppliers();
  const { suppliers, loading: suppliersLoading, error: suppliersError, refreshSuppliers } = useSuppliers();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'bigSuppliers' | 'clients' | 'supplierStock' | 'trends'>('overview');

  const loading = ordersLoading || bigSuppliersLoading || suppliersLoading;
  const error = ordersError || bigSuppliersError || suppliersError;

  const handleRefresh = () => {
    refreshOrders();
    refreshBigSuppliers();
    refreshSuppliers();
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'orders', label: 'Analyse Commandes' },
    { id: 'bigSuppliers', label: 'Analyse Grands Fournisseurs' },
    { id: 'clients', label: 'Analyse par Client' },
    { id: 'supplierStock', label: 'Analyse Fournisseurs' },
    { id: 'trends', label: 'Tendances' }
  ];

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 size={32} className="mr-3 text-comagal-blue dark:text-comagal-light-blue" />
            Rapports et Analyses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analysez vos données commerciales et suivez vos performances
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-comagal-blue text-comagal-blue dark:border-comagal-light-blue dark:text-comagal-light-blue'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <ReportsDashboard
                orders={orders}
                bigSuppliers={bigSuppliers}
                suppliers={suppliers}
              />
              <TrendCharts
                orders={orders}
                bigSuppliers={bigSuppliers}
                suppliers={suppliers}
              />
            </>
          )}

          {activeTab === 'orders' && (
            <OrderMonthlyComparison orders={orders} />
          )}

          {activeTab === 'bigSuppliers' && (
            <BigSupplierAnalysis bigSuppliers={bigSuppliers} />
          )}

          {activeTab === 'clients' && (
            <SupplierAnalysis
              orders={orders}
              suppliers={suppliers}
            />
          )}

          {activeTab === 'supplierStock' && (
            <SupplierStockAnalysis suppliers={suppliers} />
          )}

          {activeTab === 'trends' && (
            <TrendCharts
              orders={orders}
              bigSuppliers={bigSuppliers}
            />
          )}
        </div>
      )}
    </Layout>
  );
};

export default ReportsPage;
