import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import TruckConsumptionTracker from '../components/trucks/consumption/TruckConsumptionTracker';

const TruckConsumptionPage: React.FC = () => {
  const { user } = useAuth();

  // Redirect non-admin users to dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Suivi Consommation Camions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Suivez la consommation de carburant de votre flotte
        </p>
      </div>
      
      <TruckConsumptionTracker />
    </Layout>
  );
};

export default TruckConsumptionPage;