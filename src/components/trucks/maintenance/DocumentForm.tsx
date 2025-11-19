import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { TruckDocument } from '../../../types';

interface DocumentFormProps {
  truckId: string;
  initialData?: TruckDocument | null;
  onSubmit: (data: Omit<TruckDocument, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ 
  truckId, 
  initialData, 
  onSubmit, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    nomDocument: '',
    dateExpiration: format(new Date(), 'yyyy-MM-dd')
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nomDocument: initialData.nomDocument,
        dateExpiration: initialData.dateExpiration
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.nomDocument) {
        throw new Error('Le nom du document est obligatoire');
      }

      setSubmitting(true);
      await onSubmit({
        truckId,
        nomDocument: formData.nomDocument,
        dateExpiration: formData.dateExpiration
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
        label="Nom du document"
        type="text"
        name="nomDocument"
        value={formData.nomDocument}
        onChange={handleChange}
        placeholder="Ex: Carte grise, Assurance..."
        required
        fullWidth
      />

      <Input
        label="Date d'expiration"
        type="date"
        name="dateExpiration"
        value={formData.dateExpiration}
        onChange={handleChange}
        required
        fullWidth
      />

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

export default DocumentForm;