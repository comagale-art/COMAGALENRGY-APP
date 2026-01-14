import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Card from '../../ui/Card';
import { createSupplierFolder } from '../../../firebase/services/supplierFolders';

interface CreateFolderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Le nom du dossier est requis');
      return;
    }

    if (!year.trim()) {
      setError('L\'année est requise');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createSupplierFolder(name.trim(), year.trim());
      onSuccess();
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Erreur lors de la création du dossier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Créer un nouveau dossier
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom du dossier
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Dossier 2025, Fournisseurs Principaux, etc."
              fullWidth
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Année
            </label>
            <Input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Ex: 2025"
              fullWidth
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Utilisé pour organiser les dossiers par ordre chronologique
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateFolderModal;
