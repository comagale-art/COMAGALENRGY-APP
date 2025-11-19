import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { TruckOilChange } from '../../../types';

interface OilChangeFormProps {
  truckId: string;
  onSubmit: (data: Omit<TruckOilChange, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

const OilChangeForm: React.FC<OilChangeFormProps> = ({ truckId, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    dateVidange: format(new Date(), 'yyyy-MM-dd'),
    kmActuel: '',
    intervalVidangeKm: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.kmActuel || !formData.intervalVidangeKm) {
        throw new Error('Tous les champs sont obligatoires');
      }

      setSubmitting(true);
      await onSubmit({
        truckId,
        dateVidange: formData.dateVidange,
        kmActuel: Number(formData.kmActuel),
        intervalVidangeKm: Number(formData.intervalVidangeKm),
        description: formData.description
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <Input
        label="Date de vidange"
        type="date"
        name="dateVidange"
        value={formData.dateVidange}
        onChange={handleChange}
        required
        fullWidth
      />

      <Input
        label="Kilométrage vidange"
        type="number"
        name="kmActuel"
        value={formData.kmActuel}
        onChange={handleChange}
        placeholder="0"
        required
        fullWidth
      />

      <Input
        label="Intervalle de vidange (km)"
        type="number"
        name="intervalVidangeKm"
        value={formData.intervalVidangeKm}
        onChange={handleChange}
        placeholder="0"
        required
        fullWidth
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          placeholder="Notes supplémentaires..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

export default OilChangeForm;