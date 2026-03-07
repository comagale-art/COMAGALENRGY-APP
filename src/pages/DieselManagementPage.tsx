import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import { DieselProvider } from '../context/DieselContext';
import { useAuth } from '../context/AuthContext';
import DieselConsumptionTable from '../components/diesel/DieselConsumptionTable';
import DieselDashboard from '../components/diesel/DieselDashboard';
import { DieselConsumption } from '../types';

const DieselManagementPageContent: React.FC = () => {
  const { user } = useAuth();
  const [editData, setEditData] = useState<DieselConsumption | undefined>(undefined);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleEdit = (consumption: DieselConsumption) => {
    setEditData(consumption);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion Gasoil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Suivez la consommation de carburant de vos véhicules
          </p>
        </div>

        <DieselDashboard />

        <DieselConsumptionTable onEdit={handleEdit} />

        <FloatingActionButton to="/diesel/new" />
      </div>
    </Layout>
  );
};

const DieselManagementPage: React.FC = () => {
  return (
    <DieselProvider>
      <DieselManagementPageContent />
    </DieselProvider>
  );
};

export default DieselManagementPage;
