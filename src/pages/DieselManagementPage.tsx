import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import { DieselProvider } from '../context/DieselContext';
import { useAuth } from '../context/AuthContext';
import DieselConsumptionTable from '../components/diesel/DieselConsumptionTable';
import DieselDashboard from '../components/diesel/DieselDashboard';
import DieselConsumptionForm from '../components/diesel/DieselConsumptionForm';
import { DieselConsumption } from '../types';
import { X } from 'lucide-react';

const DieselManagementPageContent: React.FC = () => {
  const { user } = useAuth();
  const [editData, setEditData] = useState<DieselConsumption | undefined>(undefined);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleEdit = (consumption: DieselConsumption) => {
    setEditData(consumption);
  };

  const handleCloseModal = () => {
    setEditData(undefined);
  };

  const handleSuccess = () => {
    setEditData(undefined);
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

        {editData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-6">
                <DieselConsumptionForm editData={editData} onSuccess={handleSuccess} />
              </div>
            </div>
          </div>
        )}
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
