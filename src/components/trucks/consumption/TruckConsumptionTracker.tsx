import React, { useState, useEffect } from 'react';
import { Info, Plus, Trash2 } from 'lucide-react';
import Card from '../../ui/Card';
import ConsumptionTable from './ConsumptionTable';
import ConsumptionExplanation from './ConsumptionExplanation';
import OilChangeForm from '../maintenance/OilChangeForm';
import DocumentForm from '../maintenance/DocumentForm';
import MaintenanceStatus from '../maintenance/MaintenanceStatus';
import MaintenanceTables from '../maintenance/MaintenanceTables';
import AddTruckModal from './AddTruckModal';
import { getTruckConsumptionEntries } from '../../../firebase/services/truckConsumption';
import { getTruckMaintenanceStatus, addTruckOilChange, addTruckDocument, getTruckOilChanges, getTruckDocuments, updateTruckDocument } from '../../../firebase/services/truckMaintenance';
import { getCustomTrucks, addCustomTruck, deleteCustomTruck } from '../../../firebase/services/trucks';
import Button from '../../ui/Button';
import { MaintenanceStatus as MaintenanceStatusType, TruckOilChange, TruckDocument } from '../../../types';

const DEFAULT_TRUCKS = [
  { 
    id: 'solo1', 
    name: 'Solo 1', 
    consumption: 30,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU'
  },
  { 
    id: 'solo2', 
    name: 'Solo 2', 
    consumption: 30,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU'
  },
  { 
    id: 'man', 
    name: 'Man', 
    consumption: 35,
    logo: 'https://media.cdnws.com/_i/46016/m250-6953/520/57/ref7man-stickers-man-logo-lion-droite-autocollant-camion-man-sticker-poid-lourd-truck.jpeg'
  },
  { 
    id: 'renault', 
    name: 'Renault', 
    consumption: 35,
    logo: 'https://www.printpeelstick.co.uk/cdn/shop/collections/New_Renault_Logo-01_3be0c6b3-6e99-4955-a707-fdad3b1d8da3.png?v=1729543668&width=460'
  }
];

const TruckConsumptionTracker: React.FC = () => {
  const [selectedTruck, setSelectedTruck] = useState(DEFAULT_TRUCKS[0]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showOilChangeForm, setShowOilChangeForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showAddTruckModal, setShowAddTruckModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<TruckDocument | null>(null);
  const [truckSummaries, setTruckSummaries] = useState<Record<string, { remainingFuel: number; remainingDistance: number }>>({});
  const [maintenanceStatus, setMaintenanceStatus] = useState<{
    vidange: MaintenanceStatusType;
    documents: MaintenanceStatusType;
  } | null>(null);
  const [oilChanges, setOilChanges] = useState<TruckOilChange[]>([]);
  const [documents, setDocuments] = useState<TruckDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [trucks, setTrucks] = useState(DEFAULT_TRUCKS);

  useEffect(() => {
    loadData();
  }, [selectedTruck.id]);

  useEffect(() => {
    loadCustomTrucks();
  }, []);

  const loadCustomTrucks = async () => {
    try {
      const customTrucks = await getCustomTrucks();
      setTrucks([
        ...DEFAULT_TRUCKS,
        ...customTrucks.map(truck => ({
          id: truck.id,
          name: truck.name,
          consumption: truck.consumption,
          logo: truck.logo
        }))
      ]);
    } catch (error) {
      console.error('Error loading custom trucks:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaries, status, oilChangeHistory, documentHistory] = await Promise.all([
        Promise.all(
          trucks.map(async (truck) => {
            const entries = await getTruckConsumptionEntries(truck.id);
            return {
              truckId: truck.id,
              summary: entries[0] ? {
                remainingFuel: entries[0].remainingFuel,
                remainingDistance: entries[0].remainingDistance
              } : { remainingFuel: 0, remainingDistance: 0 }
            };
          })
        ),
        getTruckMaintenanceStatus(selectedTruck.id),
        getTruckOilChanges(selectedTruck.id),
        getTruckDocuments(selectedTruck.id)
      ]);

      const summaryMap = summaries.reduce((acc, { truckId, summary }) => {
        acc[truckId] = summary;
        return acc;
      }, {} as Record<string, { remainingFuel: number; remainingDistance: number }>);

      setTruckSummaries(summaryMap);
      setMaintenanceStatus(status);
      setOilChanges(oilChangeHistory);
      setDocuments(documentHistory);
    } catch (error) {
      console.error('Error loading truck data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTruck = async (data: { name: string; logo: string; consumption: number }) => {
    try {
      const newTruck = await addCustomTruck(data);
      setTrucks(prev => [...prev, {
        id: newTruck.id,
        name: newTruck.name,
        consumption: newTruck.consumption,
        logo: newTruck.logo
      }]);
    } catch (error) {
      console.error('Error adding truck:', error);
      throw error;
    }
  };

  const handleDeleteTruck = async (id: string) => {
    // Don't allow deleting default trucks
    if (DEFAULT_TRUCKS.some(truck => truck.id === id)) {
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce camion ?')) {
      return;
    }

    try {
      await deleteCustomTruck(id);
      setTrucks(prev => prev.filter(truck => truck.id !== id));
      
      // If the deleted truck was selected, switch to the first available truck
      if (selectedTruck.id === id) {
        setSelectedTruck(trucks[0]);
      }
    } catch (error) {
      console.error('Error deleting truck:', error);
    }
  };

  const handleOilChangeSubmit = async (data: any) => {
    try {
      await addTruckOilChange(data);
      setShowOilChangeForm(false);
      const [status, history] = await Promise.all([
        getTruckMaintenanceStatus(selectedTruck.id),
        getTruckOilChanges(selectedTruck.id)
      ]);
      setMaintenanceStatus(status);
      setOilChanges(history);
    } catch (error) {
      console.error('Error adding oil change:', error);
      throw error;
    }
  };

  const handleDocumentSubmit = async (data: any) => {
    try {
      if (editingDocument) {
        await updateTruckDocument(editingDocument.id, data);
      } else {
        await addTruckDocument(data);
      }
      setShowDocumentForm(false);
      setEditingDocument(null);
      const [status, history] = await Promise.all([
        getTruckMaintenanceStatus(selectedTruck.id),
        getTruckDocuments(selectedTruck.id)
      ]);
      setMaintenanceStatus(status);
      setDocuments(history);
    } catch (error) {
      console.error('Error with document:', error);
      throw error;
    }
  };

  const handleEditDocument = (document: TruckDocument) => {
    setEditingDocument(document);
    setShowDocumentForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedTruck.id}
            onChange={(e) => setSelectedTruck(trucks.find(t => t.id === e.target.value) || trucks[0])}
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-lg font-medium text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:w-auto"
          >
            {trucks.map(truck => (
              <option key={truck.id} value={truck.id}>
                {truck.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              onClick={() => setShowAddTruckModal(true)}
              className="flex items-center justify-center"
            >
              <Plus size={20} />
              <span className="hidden sm:ml-2 sm:inline">Ajouter un camion</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowOilChangeForm(true)}
              className="flex h-10 w-10 items-center justify-center border-red-500 p-0 text-red-500 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30 sm:h-auto sm:w-auto sm:space-x-1 sm:p-2"
            >
              <Plus size={20} className="sm:size-4" />
              <span className="hidden sm:inline">Vidange</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setEditingDocument(null);
                setShowDocumentForm(true);
              }}
              className="flex h-10 w-10 items-center justify-center border-yellow-500 p-0 text-yellow-500 hover:bg-yellow-50 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-900/30 sm:h-auto sm:w-auto sm:space-x-1 sm:p-2"
            >
              <Plus size={20} className="sm:size-4" />
              <span className="hidden sm:inline">Documents</span>
            </Button>

            {!DEFAULT_TRUCKS.some(t => t.id === selectedTruck.id) && (
              <Button
                variant="danger"
                onClick={() => handleDeleteTruck(selectedTruck.id)}
                className="flex h-10 w-10 items-center justify-center p-0 sm:h-auto sm:w-auto sm:space-x-2 sm:p-2"
              >
                <Trash2 size={20} />
                <span className="hidden sm:inline">Supprimer le camion</span>
              </Button>
            )}

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-4">
            <img 
              src={selectedTruck.logo} 
              alt={`Logo ${selectedTruck.name}`}
              className="h-12 w-auto object-contain sm:h-16"
            />
            <div>
              <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white sm:text-2xl">
                {selectedTruck.name}
              </h3>
              {!loading && truckSummaries[selectedTruck.id] && (
                <div className="flex flex-col space-y-1 text-sm sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 sm:text-base">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Carburant restant:
                    </span>
                    <span className="font-medium text-comagal-green dark:text-comagal-light-green">
                      {truckSummaries[selectedTruck.id].remainingFuel.toFixed(2)} L
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Distance restante:
                    </span>
                    <span className="font-medium text-comagal-blue dark:text-comagal-light-blue">
                      {truckSummaries[selectedTruck.id].remainingDistance.toFixed(2)} km
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {maintenanceStatus && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Statut du véhicule</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Vidange</p>
                <MaintenanceStatus status={maintenanceStatus.vidange} type="vidange" />
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Documents</p>
                <MaintenanceStatus status={maintenanceStatus.documents} type="document" />
              </div>
            </div>
          </div>
        )}
      </Card>

      {showExplanation && <ConsumptionExplanation />}
      
      {showOilChangeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Ajouter une vidange - {selectedTruck.name}
            </h3>
            <OilChangeForm
              truckId={selectedTruck.id}
              onSubmit={handleOilChangeSubmit}
              onClose={() => setShowOilChangeForm(false)}
            />
          </div>
        </div>
      )}

      {showDocumentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              {editingDocument ? 'Modifier le document' : 'Ajouter un document'} - {selectedTruck.name}
            </h3>
            <DocumentForm
              truckId={selectedTruck.id}
              initialData={editingDocument}
              onSubmit={handleDocumentSubmit}
              onClose={() => {
                setShowDocumentForm(false);
                setEditingDocument(null);
              }}
            />
          </div>
        </div>
      )}

      {showAddTruckModal && (
        <AddTruckModal
          onClose={() => setShowAddTruckModal(false)}
          onSubmit={handleAddTruck}
        />
      )}
      
      <ConsumptionTable truck={selectedTruck} />

      {!loading && (
        <MaintenanceTables
          oilChanges={oilChanges}
          documents={documents}
          onEditDocument={handleEditDocument}
        />
      )}
    </div>
  );
};

export default TruckConsumptionTracker;