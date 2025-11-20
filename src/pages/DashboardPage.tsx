import React, { useState, useEffect } from 'react';
import { useSuppliers } from '../context/SupplierContext';
import { useTanks } from '../context/TankContext';
import { useOrders } from '../context/OrderContext';
import { useBigSuppliers } from '../context/BigSupplierContext';
import { useBarrels } from '../context/BarrelContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import StockLevelCard from '../components/dashboard/StockLevelCard';
import LastDeliveryCard from '../components/dashboard/LastDeliveryCard';
import LastTankCard from '../components/dashboard/LastTankCard';
import LastBarrelCard from '../components/dashboard/LastBarrelCard';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import TankStockAnalysis from '../components/dashboard/TankStockAnalysis';
import SupplierSummary from '../components/dashboard/SupplierSummary';
import TruckConsumptionSummary from '../components/dashboard/TruckConsumptionSummary';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import Card from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { currentStock, suppliers, loading: suppliersLoading, error: suppliersError, refreshSuppliers } = useSuppliers();
  const { tanks, loading: tanksLoading, error: tanksError, refreshTanks } = useTanks();
  const { orders, loading: ordersLoading, error: ordersError, refreshOrders } = useOrders();
  const { bigSuppliers, loading: bigSuppliersLoading, error: bigSuppliersError, refreshBigSuppliers } = useBigSuppliers();
  const { barrels, loading: barrelsLoading, error: barrelsError, refreshBarrels } = useBarrels();
  const { user } = useAuth();

  const lastDelivery = suppliers.length > 0 
    ? [...suppliers].sort((a, b) => {
        const dateA = new Date(`${a.deliveryDate} ${a.deliveryTime}`).getTime();
        const dateB = new Date(`${b.deliveryDate} ${b.deliveryTime}`).getTime();
        return dateB - dateA;
      })[0]
    : null;

  const lastTank = tanks.length > 0
    ? [...tanks].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return dateB - dateA;
      })[0]
    : null;

  const lastBarrel = barrels.length > 0
    ? [...barrels].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })[0]
    : null;
  
  const handleRefresh = async () => {
    if (user?.role === 'admin') {
      await Promise.all([
        refreshSuppliers(),
        refreshTanks(),
        refreshOrders(),
        refreshBigSuppliers(),
        refreshBarrels()
      ]);
    } else {
      await Promise.all([
        refreshSuppliers(),
        refreshTanks(),
        refreshBarrels()
      ]);
    }
  };
  
  const loading = user?.role === 'admin'
    ? suppliersLoading || tanksLoading || ordersLoading || bigSuppliersLoading || barrelsLoading
    : suppliersLoading || tanksLoading || barrelsLoading;

  const error = user?.role === 'admin'
    ? suppliersError || tanksError || ordersError || bigSuppliersError || barrelsError
    : suppliersError || tanksError || barrelsError;
  
  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aperçu du stock SARIJE et des dernières opérations
          </p>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="rounded-md bg-comagal-blue px-4 py-2 text-white hover:bg-comagal-light-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue focus:ring-offset-2 dark:bg-comagal-light-blue dark:hover:bg-comagal-blue"
          disabled={loading}
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
      
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}
      
      <div className="space-y-6">
        {/* Basic information shown to all users */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <StockLevelCard currentLevel={currentStock} />
          </div>
          
          <div>
            <LastDeliveryCard supplier={lastDelivery} />
          </div>
        </div>
        
        {/* Last tank operation shown to all users */}
        <div>
          <LastTankCard tank={lastTank} />
        </div>

        {/* Last barrel shown to all users */}
        <div>
          <LastBarrelCard barrel={lastBarrel} />
        </div>

        {/* Additional information shown only to admin users */}
        {user?.role === 'admin' && (
          <>
            {/* Truck consumption summary - Moved to top */}
            {!loading && <TruckConsumptionSummary />}
            {/* Order and Big Supplier Summaries */}
            <div className="space-y-6">
              {!loading && (
                <DashboardSummary
                  orders={orders}
                  bigSuppliers={bigSuppliers}
                />
              )}
            </div>

            {/* Tank stock analysis with Sarije level */}
            {!loading && <TankStockAnalysis tanks={tanks} sarijeLevel={currentStock} />}

            {/* Supplier Summary */}
            {!loading && (
              <SupplierSummary 
                suppliers={suppliers}
                bigSuppliers={bigSuppliers}
              />
            )}
            
            
            
            <FloatingActionButton to="/suppliers/new" label="Ajouter un fournisseur" />
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;