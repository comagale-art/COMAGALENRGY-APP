import React, { useState } from 'react';
import { DieselProvider } from '../context/DieselContext';
import DieselConsumptionForm from '../components/diesel/DieselConsumptionForm';
import DieselConsumptionTable from '../components/diesel/DieselConsumptionTable';
import DieselDashboard from '../components/diesel/DieselDashboard';
import DieselVehicleSummary from '../components/diesel/DieselVehicleSummary';
import DieselChart from '../components/diesel/DieselChart';
import { DieselConsumption } from '../types';
import { X } from 'lucide-react';

const DieselManagementPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<DieselConsumption | undefined>(undefined);

  const handleEdit = (consumption: DieselConsumption) => {
    setEditData(consumption);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditData(undefined);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditData(undefined);
  };

  return (
    <DieselProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion Gasoil</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Suivez la consommation de carburant de vos véhicules
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors"
            >
              Nouvelle consommation
            </button>
          )}
        </div>

        {showForm && (
          <div className="relative">
            <button
              onClick={handleCloseForm}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
            <DieselConsumptionForm
              onSuccess={handleFormSuccess}
              editData={editData}
            />
          </div>
        )}

        <DieselDashboard />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DieselChart />
          </div>
          <div className="lg:col-span-1">
            <DieselVehicleSummary />
          </div>
        </div>

        <DieselConsumptionTable onEdit={handleEdit} />
      </div>
    </DieselProvider>
  );
};

export default DieselManagementPage;
