import React, { useState } from 'react';
import { X } from 'lucide-react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { useClientTracking } from '../../../context/ClientTrackingContext';

interface AddTransactionModalProps {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  clientId,
  onClose,
  onSuccess
}) => {
  const { addTransaction } = useClientTracking();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entryType: 'invoice' as 'invoice' | 'quantity',
    invoiceNumber: '',
    quantity: '',
    pricePerKg: '',
    totalAmount: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Calculate total amount for quantity-based entries
      if (name === 'quantity' || name === 'pricePerKg') {
        if (newData.entryType === 'quantity') {
          const quantity = parseFloat(newData.quantity) || 0;
          const pricePerKg = parseFloat(newData.pricePerKg) || 0;
          newData.totalAmount = (quantity * pricePerKg).toString();
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (formData.entryType === 'invoice') {
        if (!formData.invoiceNumber) {
          throw new Error('Le numéro de facture est obligatoire');
        }
        if (!formData.totalAmount) {
          throw new Error('Le montant total est requis');
        }
      } else {
        if (!formData.quantity || !formData.pricePerKg) {
          throw new Error('La quantité et le prix par kg sont requis');
        }
      }

      setSubmitting(true);

      // Create transaction data object based on entry type
      const transactionData = {
        clientId,
        date: formData.date,
        entryType: formData.entryType,
        totalAmount: parseFloat(formData.totalAmount),
        ...(formData.description ? { description: formData.description } : {}),
        ...(formData.entryType === 'invoice' 
          ? { invoiceNumber: formData.invoiceNumber }
          : {
              quantity: parseFloat(formData.quantity),
              pricePerKg: parseFloat(formData.pricePerKg)
            }
        )
      };

      await addTransaction(transactionData);
      onSuccess();
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Nouvelle Transaction
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
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            fullWidth
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Type de saisie
            </label>
            <select
              name="entryType"
              value={formData.entryType}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="invoice">N° Facture</option>
              <option value="quantity">Quantité</option>
            </select>
          </div>

          {formData.entryType === 'invoice' ? (
            <>
              <Input
                label="N° de facture"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                required
                fullWidth
              />

              <Input
                label="Montant TTC (DH)"
                type="number"
                step="0.01"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                required
                fullWidth
              />
            </>
          ) : (
            <>
              <Input
                label="Quantité (kg)"
                type="number"
                step="0.01"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                fullWidth
              />

              <Input
                label="Prix par kg (DH/kg)"
                type="number"
                step="0.01"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                required
                fullWidth
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Prix total (DH)
                </label>
                <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    {formData.totalAmount || '0.00'}
                  </p>
                </div>
              </div>
            </>
          )}

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
              placeholder="Description de la transaction..."
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

export default AddTransactionModal;