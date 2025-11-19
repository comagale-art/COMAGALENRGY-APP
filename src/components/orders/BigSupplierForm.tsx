import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface BigSupplierFormProps {
  onSubmit: (data: any) => void;
}

const PRODUCT_OPTIONS = [
  { value: 'huile_usage', label: 'Huile usage' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'fuel_original', label: 'Fuel Original' },
  { value: 'kodrone', label: 'Kodrone' },
  { value: 'gasoil', label: 'Gasoil' }
];

const LOCATION_OPTIONS = [
  { value: 'sarije', label: 'Sarije' },
  { value: 'tank', label: 'Une des citernes' },
  { value: 'camion_solo', label: 'Camion Solo' },
  { value: 'camion_renault', label: 'Camion Renault' },
  { value: 'camion_man', label: 'Camion MAN' }
];

const TANK_OPTIONS = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
  'C11', 'C50', 'C60', 'C100-1', 'C100-2'
];

const BigSupplierForm: React.FC<BigSupplierFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    product: 'huile_usage',
    quantity: '',
    pricePerKg: '',
    location: 'sarije',
    tankName: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.pricePerKg) || 0;
    setTotalPrice(quantity * price);
  }, [formData.quantity, formData.pricePerKg]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Le nom du fournisseur est requis';
    }

    if (!formData.quantity || isNaN(parseFloat(formData.quantity))) {
      newErrors.quantity = 'La quantité doit être un nombre valide';
    }

    if (!formData.pricePerKg || isNaN(parseFloat(formData.pricePerKg))) {
      newErrors.pricePerKg = 'Le prix par kg doit être un nombre valide';
    }

    if (formData.location === 'tank' && !formData.tankName) {
      newErrors.tankName = 'Veuillez sélectionner une citerne';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const data = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        pricePerKg: parseFloat(formData.pricePerKg),
        totalPrice
      };
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          fullWidth
          required
        />

        <Input
          label="Nom du fournisseur"
          name="supplierName"
          value={formData.supplierName}
          onChange={handleChange}
          error={errors.supplierName}
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Produit
          </label>
          <select
            name="product"
            value={formData.product}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {PRODUCT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Quantité (kg)"
          type="text"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          placeholder="0.00"
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Prix par kg (DH)"
          type="text"
          name="pricePerKg"
          value={formData.pricePerKg}
          onChange={handleChange}
          error={errors.pricePerKg}
          placeholder="0.00"
          fullWidth
          required
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Prix total
          </label>
          <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalPrice.toFixed(2)} DH
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Emplacement
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {LOCATION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {formData.location === 'tank' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Sélectionner la citerne
            </label>
            <select
              name="tankName"
              value={formData.tankName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Sélectionnez une citerne</option>
              {TANK_OPTIONS.map(tank => (
                <option key={tank} value={tank}>{tank}</option>
              ))}
            </select>
            {errors.tankName && (
              <p className="mt-1 text-sm text-red-600">{errors.tankName}</p>
            )}
          </div>
        )}
      </div>

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
          placeholder="Ajoutez des détails supplémentaires..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => navigate('/big-suppliers')}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          Ajouter le grand fournisseur
        </Button>
      </div>
    </form>
  );
};

export default BigSupplierForm;