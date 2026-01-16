import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { createClientFolder } from '../../../firebase/services/clientFolders';

interface CreateClientFolderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateClientFolderModal: React.FC<CreateClientFolderModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      setError('Le nom du dossier est requis');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createClientFolder(folderName.trim());
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
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Nouveau Dossier Client
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom du dossier"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Ex: Clients prioritaires"
            required
            fullWidth
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientFolderModal;
