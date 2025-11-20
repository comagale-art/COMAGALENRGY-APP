import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Barrel } from '../../types';

interface BarrelStatusFormProps {
  initialData: Barrel;
  onSubmit: (data: Partial<Barrel>) => void;
}

const BarrelStatusForm: React.FC<BarrelStatusFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    status: initialData.status || 'Stock',
    quantity: initialData.quantity || 'Complet',
    quantityCustom: '',
    quantitySold: initialData.quantitySold?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      const isCustomQuantity = !['Complet', '70%', '50%', '30%'].includes(initialData.quantity);
      setFormData({
        status: initialData.status,
        quantity: isCustomQuantity ? 'Autre' : initialData.quantity,
        quantityCustom: isCustomQuantity ? initialData.quantity : '',
        quantitySold: initialData.quantitySold?.toString() || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.status === 'Vendu Quantité') {
      if (formData.quantity === 'Autre' && !formData.quantityCustom.trim()) {
        newErrors.quantityCustom = 'Veuillez spécifier la quantité';
      }

      if (!formData.quantitySold.trim()) {
        newErrors.quantitySold = 'La quantité vendue est requise';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const quantity = formData.status === 'Vendu Quantité'
        ? (formData.quantity === 'Autre' ? formData.quantityCustom : formData.quantity)
        : initialData.quantity;

      const quantitySold = formData.status === 'Vendu Quantité'
        ? parseFloat(formData.quantitySold)
        : undefined;

      const data: Partial<Barrel> = {
        status: formData.status as 'Vendu Complet' | 'Stock' | 'Vendu Quantité',
        quantity,
        quantitySold,
      };

      onSubmit(data);
    }
  };

  const handleCancel = () => {
    navigate('/barrels');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display read-only information */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
          Informations du baril (non modifiables)
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{initialData.date}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">N° Baril:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{initialData.barrelNumber}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Produit:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{initialData.product}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Fournisseur:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{initialData.supplier}</span>
          </div>
          {formData.status !== 'Vendu Quantité' && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Quantité:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{initialData.quantity}</span>
            </div>
          )}
        </div>
      </div>

      {/* Editable status field */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Statut <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="Stock">Stock</option>
          <option value="Vendu Complet">Vendu Complet</option>
          <option value="Vendu Quantité">Vendu Quantité</option>
        </select>
      </div>

      {/* Show quantity and quantitySold fields only when status is "Vendu Quantité" */}
      {formData.status === 'Vendu Quantité' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Quantité <span className="text-red-500">*</span>
            </label>
            <select
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="Complet">Complet</option>
              <option value="70%">70%</option>
              <option value="50%">50%</option>
              <option value="30%">30%</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {formData.quantity === 'Autre' && (
            <Input
              label="Spécifier la quantité"
              type="number"
              name="quantityCustom"
              value={formData.quantityCustom}
              onChange={handleChange}
              error={errors.quantityCustom}
              placeholder="Ex: 15, 20, etc."
              step="0.01"
              min="0"
              fullWidth
              required
            />
          )}

          <Input
            label="Quantité vendue (en litres)"
            type="number"
            name="quantitySold"
            value={formData.quantitySold}
            onChange={handleChange}
            error={errors.quantitySold}
            placeholder="0"
            step="0.01"
            min="0"
            fullWidth
            required
          />
        </>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          Mettre à jour le statut
        </Button>
      </div>
    </form>
  );
};

export default BarrelStatusForm;
