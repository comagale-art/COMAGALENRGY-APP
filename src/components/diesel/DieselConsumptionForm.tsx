import React, { useState, useEffect } from 'react';
import { useDiesel } from '../../context/DieselContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const VEHICLES = {
  Camions: ['MAN', 'SOLO1', 'SOLO2', 'Renault'],
  Voitures: ['Kadjar', 'Soueast', 'MUTSHI RADADE', 'Hyundai Driss'],
};

interface DieselConsumptionFormProps {
  onSuccess?: () => void;
  editData?: {
    id: string;
    date: string;
    vehicle_type: string;
    vehicle_name: string;
    amount_dh: number;
    price_per_liter: number;
  };
}

const DieselConsumptionForm: React.FC<DieselConsumptionFormProps> = ({ onSuccess, editData }) => {
  const { addConsumption, updateConsumption } = useDiesel();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: editData?.date || new Date().toISOString().split('T')[0],
    vehicle_type: editData?.vehicle_type || 'Camions',
    vehicle_name: editData?.vehicle_name || 'MAN',
    amount_dh: editData?.amount_dh?.toString() || '',
    price_per_liter: editData?.price_per_liter?.toString() || '',
  });
  const [showCustomVehicle, setShowCustomVehicle] = useState(false);
  const [customVehicleName, setCustomVehicleName] = useState('');
  const [calculatedLiters, setCalculatedLiters] = useState<number>(0);

  useEffect(() => {
    if (editData && editData.vehicle_name === 'Autre') {
      setShowCustomVehicle(true);
      setCustomVehicleName(editData.vehicle_name);
    } else if (editData && !VEHICLES.Camions.includes(editData.vehicle_name) && !VEHICLES.Voitures.includes(editData.vehicle_name)) {
      setShowCustomVehicle(true);
      setCustomVehicleName(editData.vehicle_name);
      setFormData(prev => ({ ...prev, vehicle_name: 'Autre' }));
    }
  }, [editData]);

  useEffect(() => {
    const amount = parseFloat(formData.amount_dh) || 0;
    const pricePerLiter = parseFloat(formData.price_per_liter) || 0;

    if (amount > 0 && pricePerLiter > 0) {
      setCalculatedLiters(amount / pricePerLiter);
    } else {
      setCalculatedLiters(0);
    }
  }, [formData.amount_dh, formData.price_per_liter]);

  const handleVehicleNameChange = (value: string) => {
    if (value === 'Autre') {
      setShowCustomVehicle(true);
      setCustomVehicleName('');
    } else {
      setShowCustomVehicle(false);
      setCustomVehicleName('');
    }
    setFormData(prev => ({ ...prev, vehicle_name: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.amount_dh || !formData.price_per_liter) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (showCustomVehicle && !customVehicleName.trim()) {
      alert('Veuillez entrer le nom du véhicule');
      return;
    }

    setLoading(true);
    try {
      const vehicleName = showCustomVehicle ? customVehicleName.trim() : formData.vehicle_name;
      const consumptionData = {
        date: formData.date,
        vehicle_type: formData.vehicle_type,
        vehicle_name: vehicleName,
        amount_dh: parseFloat(formData.amount_dh),
        price_per_liter: parseFloat(formData.price_per_liter),
        liters_calculated: calculatedLiters,
      };

      if (editData) {
        await updateConsumption(editData.id, consumptionData);
      } else {
        await addConsumption(consumptionData);
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        vehicle_type: 'Camions',
        vehicle_name: 'MAN',
        amount_dh: '',
        price_per_liter: '',
      });
      setShowCustomVehicle(false);
      setCustomVehicleName('');
      setCalculatedLiters(0);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving diesel consumption:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        {editData ? 'Modifier la consommation' : 'Nouvelle consommation diesel'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de véhicule
          </label>
          <select
            value={formData.vehicle_type}
            onChange={(e) => {
              const newType = e.target.value as 'Camions' | 'Voitures';
              setFormData(prev => ({
                ...prev,
                vehicle_type: newType,
                vehicle_name: VEHICLES[newType][0]
              }));
              setShowCustomVehicle(false);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Camions">Camions</option>
            <option value="Voitures">Voitures</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Véhicule
          </label>
          <select
            value={formData.vehicle_name}
            onChange={(e) => handleVehicleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            {VEHICLES[formData.vehicle_type as keyof typeof VEHICLES].map(vehicle => (
              <option key={vehicle} value={vehicle}>{vehicle}</option>
            ))}
            <option value="Autre">Autre</option>
          </select>
        </div>

        {showCustomVehicle && (
          <Input
            label="Nom du véhicule"
            type="text"
            value={customVehicleName}
            onChange={(e) => setCustomVehicleName(e.target.value)}
            placeholder="Entrez le nom du véhicule"
            required
          />
        )}

        <Input
          label="Montant payé (DH)"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount_dh}
          onChange={(e) => setFormData(prev => ({ ...prev, amount_dh: e.target.value }))}
          required
        />

        <Input
          label="Prix du litre (DH/L)"
          type="number"
          step="0.01"
          min="0"
          value={formData.price_per_liter}
          onChange={(e) => setFormData(prev => ({ ...prev, price_per_liter: e.target.value }))}
          required
        />
      </div>

      {calculatedLiters > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Calcul automatique:</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {calculatedLiters.toFixed(2)} Litres
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formData.amount_dh} DH ÷ {formData.price_per_liter} DH/L = {calculatedLiters.toFixed(2)} L
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : editData ? 'Modifier' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

export default DieselConsumptionForm;
