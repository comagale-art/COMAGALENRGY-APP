import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { useClientTracking } from '../../../context/ClientTrackingContext';

interface AddPaymentModalProps {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  clientId,
  onClose,
  onSuccess
}) => {
  const { addPayment } = useClientTracking();
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'virement' as 'effect' | 'cheque' | 'virement',
    collectionDate: new Date().toISOString().split('T')[0],
    amount: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Update collection date when payment method or payment date changes
  useEffect(() => {
    if (formData.paymentMethod === 'virement') {
      setFormData(prev => ({
        ...prev,
        collectionDate: prev.paymentDate
      }));
    }
  }, [formData.paymentMethod, formData.paymentDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset collection date if switching to virement
      ...(name === 'paymentMethod' && value === 'virement' 
        ? { collectionDate: prev.paymentDate }
        : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.amount || isNaN(parseFloat(formData.amount))) {
        throw new Error('Le montant doit être un nombre valide');
      }

      setSubmitting(true);
      await addPayment({
        clientId,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        collectionDate: formData.collectionDate,
        amount: parseFloat(formData.amount),
        description: formData.description.trim()
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error adding payment:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du paiement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Nouveau Paiement
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
            label="Date"
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            required
            fullWidth
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Moyen de paiement
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="effect">Effet</option>
              <option value="cheque">Chèque</option>
              <option value="virement">Virement</option>
            </select>
          </div>

          {formData.paymentMethod !== 'virement' && (
            <Input
              label="Date d'encaissement"
              type="date"
              name="collectionDate"
              value={formData.collectionDate}
              onChange={handleChange}
              required
              fullWidth
            />
          )}

          <Input
            label="Montant (DH)"
            type="number"
            step="0.01"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            fullWidth
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Description (optionnel)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              placeholder="Ajoutez des détails sur le paiement..."
            />
          </div>

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
      </div>
    </div>
  );
};

export default AddPaymentModal;