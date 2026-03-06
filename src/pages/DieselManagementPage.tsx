import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import { DieselProvider } from '../context/DieselContext';
import DieselConsumptionTable from '../components/diesel/DieselConsumptionTable';
import DieselDashboard from '../components/diesel/DieselDashboard';
import { DieselConsumption } from '../types';

const DieselManagementPageContent: React.FC = () => {
  const navigate = useNavigate();
  const [editData, setEditData] = useState<DieselConsumption | undefined>(undefined);

  const handleEdit = (consumption: DieselConsumption) => {
    setEditData(consumption);
  };

  const handleAddClick = () => {
    navigate('/diesel/new');
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

        <FloatingActionButton onClick={handleAddClick} />
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
