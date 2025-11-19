import React, { useState } from 'react';
import { X } from 'lucide-react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

interface AddTruckModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; logo: string; consumption: number }) => Promise<void>;
}

const AddTruckModal: React.FC<AddTruckModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    consumption: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Le nom du camion est requis');
      }

      if (!formData.logo.trim()) {
        throw new Error('Le lien du logo est requis');
      }

      if (!formData.consumption || isNaN(Number(formData.consumption))) {
        throw new Error('La consommation doit être un nombre valide');
      }

      setSubmitting(true);
      await onSubmit({
        name: formData.name.trim(),
        logo: formData.logo.trim(),
        consumption: Number(formData.consumption)
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Ajouter un nouveau camion
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom du camion"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Volvo FH"
            required
            fullWidth
          />

          <Input
            label="Lien du logo"
            name="logo"
            type="url"
            value={formData.logo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            required
            fullWidth
          />

          <Input
            label="Consommation (L/100km)"
            name="consumption"
            type="number"
            step="0.1"
            value={formData.consumption}
            onChange={handleChange}
            placeholder="35"
            required
            fullWidth
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Enregistrement...' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddTruckModal;