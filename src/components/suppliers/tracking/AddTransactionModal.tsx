import React, { useState } from 'react';
import { X } from 'lucide-react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { addSupplierTransaction } from '../../../firebase/services/supplierTracking';

interface AddTransactionModalProps {
  supplierId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  supplierId,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    transactionType: 'quantity', // 'quantity' or 'service'
    quantity: '',
    quantityType: 'cm',
    pricePerKg: '',
    kgPerBarrel: 185,
    service: '',
    price: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setSubmitting(true);
      
      if (formData.transactionType === 'quantity') {
        if (!formData.quantity || isNaN(Number(formData.quantity))) {
          throw new Error('La quantité doit être un nombre valide');
        }
        
        if (!formData.pricePerKg || isNaN(Number(formData.pricePerKg))) {
          throw new Error('Le prix par kg doit être un nombre valide');
        }
        
        await addSupplierTransaction({
          supplierId,
          date: formData.date,
          quantity: Number(formData.quantity),
          quantityType: formData.quantityType as 'cm' | 'kg',
          pricePerKg: Number(formData.pricePerKg),
          kgPerBarrel: Number(formData.kgPerBarrel),
          description: formData.description
        });
      } else {
        if (!formData.service.trim()) {
          throw new Error('Le service est requis');
        }
        
        if (!formData.price || isNaN(Number(formData.price))) {
          throw new Error('Le prix doit être un nombre valide');
        }
        
        await addSupplierTransaction({
          supplierId,
          date: formData.date,
          service: formData.service.trim(),
          price: Number(formData.price),
          description: formData.description
        });
      }
      
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
              Type de transaction
            </label>
            <select
              name="transactionType"
              value={formData.transactionType}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="quantity">Quantité</option>
              <option value="service">Autre (Service)</option>
            </select>
          </div>

          {formData.transactionType === 'quantity' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Quantité"
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  fullWidth
                />
                
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Type
                  </label>
                  <select
                    name="quantityType"
                    value={formData.quantityType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="cm">cm</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>
              
              {formData.quantityType === 'cm' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Conversion kg par baril
                  </label>
                  <select
                    name="kgPerBarrel"
                    value={formData.kgPerBarrel}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value={182}>182 kg/baril</option>
                    <option value={183}>183 kg/baril</option>
                    <option value={184}>184 kg/baril</option>
                    <option value={185}>185 kg/baril</option>
                  </select>
                </div>
              )}
              
              <Input
                label="Prix par kg (DH)"
                type="text"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                placeholder="0.00"
                required
                fullWidth
              />
            </>
          ) : (
            <>
              <Input
                label="Service"
                type="text"
                name="service"
                value={formData.service}
                onChange={handleChange}
                placeholder="Nom du service"
                required
                fullWidth
              />
              
              <Input
                label="Prix (DH)"
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
                fullWidth
              />
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
              placeholder="Description optionnelle..."
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