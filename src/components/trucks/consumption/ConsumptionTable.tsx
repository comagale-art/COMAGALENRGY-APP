import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { addTruckConsumptionEntry, getTruckConsumptionEntries, deleteTruckConsumptionEntry, TruckConsumptionEntry } from '../../../firebase/services/truckConsumption';

interface Truck {
  id: string;
  name: string;
  consumption: number;
}

interface ConsumptionTableProps {
  truck: Truck;
}

const ConsumptionTable: React.FC<ConsumptionTableProps> = ({ truck }) => {
  const [entries, setEntries] = useState<TruckConsumptionEntry[]>([]);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    fuelMoney: '',
    fuelPrice: '',
    consumption: truck.consumption.toString(),
    previousKm: '',
    currentKm: ''
  });

  useEffect(() => {
    loadEntries();
  }, [truck.id]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedEntries = await getTruckConsumptionEntries(truck.id);
      setEntries(loadedEntries);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateValues = (
    entry: Partial<TruckConsumptionEntry>,
    previousEntry?: TruckConsumptionEntry
  ): Omit<TruckConsumptionEntry, 'id' | 'createdAt'> => {
    const previousKm = Number(entry.previousKm) || 0;
    const currentKm = Number(entry.currentKm) || 0;
    const distance = currentKm > previousKm ? currentKm - previousKm : 0;
    const consumption = Number(entry.consumption) || truck.consumption;
    
    const fuelMoney = Number(entry.fuelMoney) || 0;
    const fuelPrice = Number(entry.fuelPrice) || 0;
    const initialFuel = (fuelPrice > 0 ? fuelMoney / fuelPrice : 0) + (previousEntry?.remainingFuel || 0);
    
    const consumedFuel = distance * (consumption / 100);
    const totalDistance = initialFuel * (100 / consumption);
    const remainingFuel = initialFuel - consumedFuel;
    const remainingDistance = totalDistance - distance;

    return {
      truckId: truck.id,
      date: entry.date || new Date().toISOString().split('T')[0],
      fuelMoney: Number(entry.fuelMoney) || 0,
      fuelPrice: Number(entry.fuelPrice) || 0,
      consumption,
      previousKm,
      currentKm,
      distance,
      initialFuel,
      consumedFuel,
      remainingFuel,
      totalDistance,
      remainingDistance
    };
  };

  const handleAddEntry = async () => {
    try {
      setError(null);
      const previousEntry = entries[0];
      const calculatedEntry = calculateValues({
        ...newEntry,
        previousKm: previousEntry ? previousEntry.currentKm : Number(newEntry.previousKm)
      }, previousEntry);
      
      await addTruckConsumptionEntry(calculatedEntry);
      await loadEntries();
      
      setShowNewEntryForm(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        fuelMoney: '',
        fuelPrice: '',
        consumption: truck.consumption.toString(),
        previousKm: '',
        currentKm: ''
      });
    } catch (err) {
      console.error('Error adding entry:', err);
      setError('Erreur lors de l\'ajout de l\'entrée');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      return;
    }

    try {
      setError(null);
      await deleteTruckConsumptionEntry(id);
      await loadEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Erreur lors de la suppression de l\'entrée');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </Card>
      )}

      <div className="mb-4 flex justify-end">
        <Button
          variant="primary"
          onClick={() => setShowNewEntryForm(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10"
        >
          <Plus size={20} />
        </Button>
      </div>

      {showNewEntryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
          <Card className="w-full max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 dark:text-white sm:text-lg">
                Nouvelle entrée - {truck.name}
              </h3>
              <button
                onClick={() => setShowNewEntryForm(false)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 sm:p-2"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white sm:text-sm">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-blue-50 px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-blue-900/20 dark:text-white sm:px-3 sm:py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white sm:text-sm">
                  Argent carburant (MAD)
                </label>
                <input
                  type="number"
                  name="fuelMoney"
                  value={newEntry.fuelMoney}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, fuelMoney: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-blue-50 px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-blue-900/20 dark:text-white sm:px-3 sm:py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white sm:text-sm">
                  Prix carburant (MAD/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="fuelPrice"
                  value={newEntry.fuelPrice}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, fuelPrice: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-blue-50 px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-blue-900/20 dark:text-white sm:px-3 sm:py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white sm:text-sm">
                  % Consommation (L/100km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="consumption"
                  value={newEntry.consumption}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, consumption: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-blue-50 px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-blue-900/20 dark:text-white sm:px-3 sm:py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white sm:text-sm">
                  Km passé
                </label>
                <input
                  type="number"
                  name="previousKm"
                  value={entries[0]?.currentKm || newEntry.previousKm}
                  readOnly={entries.length > 0}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, previousKm: e.target.value }))}
                  className={`w-full rounded-md border border-gray-300 bg-blue-50 px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-blue-900/20 dark:text-white sm:px-3 sm:py-2 ${entries.length > 0 ? 'cursor-not-allowed opacity-75' : ''}`}
                />
                {entries.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Valeur automatiquement reprise du dernier kilométrage
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-white sm:text-sm">
                  Km présent
                </label>
                <input
                  type="number"
                  name="currentKm"
                  value={newEntry.currentKm}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, currentKm: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-blue-50 px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-blue-900/20 dark:text-white sm:px-3 sm:py-2"
                />
              </div>

              <div className="flex justify-end space-x-3 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewEntryForm(false)}
                  className="text-xs sm:text-sm"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddEntry}
                  className="text-xs sm:text-sm"
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Date</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Argent carburant (MAD)</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Prix carburant (MAD/L)</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">% Consommation</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Km passé</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Km présent</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Distance (Km)</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Carburant initial (L)</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Carburant consommé (L)</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Carburant restant (L)</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Distance totale (Km)</th>
              <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Distance restante (Km)</th>
              <th className="px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 sm:px-4 sm:py-3 sm:text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.date}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.fuelMoney.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.fuelPrice.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.consumption.toFixed(1)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.previousKm}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.currentKm}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.distance.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.initialFuel.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.consumedFuel.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.remainingFuel.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.totalDistance.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-[11px] text-gray-900 dark:text-white sm:text-sm">{entry.remainingDistance.toFixed(2)}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 text-right sm:px-4 sm:py-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(entry.id!)}
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsumptionTable;