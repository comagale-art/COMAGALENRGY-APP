import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Tank } from '../../types';

interface TankFormProps {
  initialData?: Tank;
  onSubmit: (data: Omit<Tank, 'id' | 'time'>) => void;
  isEditing?: boolean;
}

// Tank capacity configuration
const TANK_CAPACITIES: Record<string, number> = {
  'C1': 250,
  'C2': 250,
  'C3': 250,
  'C4': 250,
  'C5': 250,
  'C6': 250,
  'C7': 250,
  'C8': 250,
  'C9': 250,
  'C10': 200,
  'C11': 200,
  'C50': 300,
  'C60': 300,
  'C100-1': 36,
  'C100-2': 64
};

const PREDEFINED_PRODUCTS = [
  { value: 'vide', label: 'Vide' },
  { value: 'huile_usage', label: 'Huile Usage' },
  { value: 'gasoil', label: 'Gasoil' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'kodrone', label: 'Kodrone' },
  { value: 'huile_usage_fuel', label: 'Huile Usage + Fuel' },
  { value: 'huile_usage_kodrone', label: 'Huile Usage + Kodrone' },
  { value: 'huile_usage_kodrone_gasoil', label: 'Huile Usage + Kodrone + Gasoil' }
];

const TANK_NAMES = Object.keys(TANK_CAPACITIES);

const TankForm: React.FC<TankFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    productType: initialData?.productType || '',
    quantity: initialData?.quantity || 0,
    isLoading: initialData?.isLoading ?? true,
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });
  const [quantityInput, setQuantityInput] = useState(initialData?.quantity.toString() || '0');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCustomProduct, setShowCustomProduct] = useState(!PREDEFINED_PRODUCTS.some(p => p.value === formData.productType));
  const [customProductType, setCustomProductType] = useState(
    !PREDEFINED_PRODUCTS.some(p => p.value === formData.productType) ? formData.productType : ''
  );

  // Effect to handle automatic quantity setting when "vide" is selected
  useEffect(() => {
    if (formData.productType === 'vide' && formData.name) {
      const isC100Tank = formData.name === 'C100-1' || formData.name === 'C100-2';
      const tankCapacity = isC100Tank ? 0 : TANK_CAPACITIES[formData.name];
      
      setQuantityInput(tankCapacity.toString());
      setFormData(prev => ({
        ...prev,
        quantity: tankCapacity,
        isLoading: false // Set to "Déchargé" when empty
      }));
    }
  }, [formData.productType, formData.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'quantity' && formData.productType !== 'vide') {
      setQuantityInput(value);
      const processedValue = value.replace(',', '.');
      const parsedValue = parseFloat(processedValue);

      if (!isNaN(parsedValue)) {
        setFormData(prev => ({
          ...prev,
          quantity: parsedValue
        }));
      }
    } else if (name === 'isLoading') {
      setFormData(prev => ({
        ...prev,
        isLoading: value === 'true'
      }));
    } else if (name === 'productType') {
      if (value === 'autre') {
        setShowCustomProduct(true);
        setFormData(prev => ({ 
          ...prev, 
          productType: customProductType || ''
        }));
      } else {
        setShowCustomProduct(false);
        setFormData(prev => ({ 
          ...prev, 
          productType: value,
          // Reset isLoading based on product type
          isLoading: value === 'vide' ? false : true
        }));

        // If selecting "vide" and tank is already selected, set capacity
        if (value === 'vide' && formData.name) {
          const isC100Tank = formData.name === 'C100-1' || formData.name === 'C100-2';
          const tankCapacity = isC100Tank ? 0 : TANK_CAPACITIES[formData.name];
          
          setQuantityInput(tankCapacity.toString());
          setFormData(prev => ({
            ...prev,
            productType: value,
            quantity: tankCapacity,
            isLoading: false
          }));
        }
      }
    } else if (name === 'customProductType') {
      setCustomProductType(value);
      setFormData(prev => ({ ...prev, productType: value }));
    } else if (name === 'name') {
      setFormData(prev => ({ ...prev, name: value }));
      // If product type is "vide", update quantity based on tank capacity
      if (formData.productType === 'vide') {
        const isC100Tank = value === 'C100-1' || value === 'C100-2';
        const tankCapacity = isC100Tank ? 0 : TANK_CAPACITIES[value];
        
        setQuantityInput(tankCapacity.toString());
        setFormData(prev => ({
          ...prev,
          name: value,
          quantity: tankCapacity,
          isLoading: false
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la citerne est requis';
    }

    if (!formData.productType.trim()) {
      newErrors.productType = 'Le type de produit est requis';
    }

    const quantity = parseFloat(quantityInput.replace(',', '.'));
    if (isNaN(quantity)) {
      newErrors.quantity = 'La quantité doit être un nombre valide';
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const data = {
        name: formData.name.trim(),
        productType: formData.productType.trim(),
        date: formData.date,
        quantity: parseFloat(quantityInput.replace(',', '.')),
        isLoading: formData.isLoading,
        description: formData.description.trim()
      };
      onSubmit(data);
    }
  };

  const handleCancel = () => {
    navigate('/tanks');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Nom de la citerne
        </label>
        <select
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Sélectionnez une citerne</option>
          {TANK_NAMES.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Type de produit
        </label>
        <select
          name="productType"
          value={showCustomProduct ? 'autre' : formData.productType}
          onChange={handleChange}
          className="mb-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Sélectionnez un type de produit</option>
          {PREDEFINED_PRODUCTS.map(product => (
            <option key={product.value} value={product.value}>{product.label}</option>
          ))}
          <option value="autre">Autre</option>
        </select>

        {showCustomProduct && (
          <Input
            name="customProductType"
            value={customProductType}
            onChange={handleChange}
            placeholder="Entrez le type de produit"
            error={errors.productType}
            fullWidth
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Date d'opération"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          fullWidth
          required
        />

        <Input
          label="Quantité (cm)"
          type="text"
          name="quantity"
          value={quantityInput}
          onChange={handleChange}
          error={errors.quantity}
          placeholder="Utilisez . ou , comme séparateur décimal"
          fullWidth
          required
          disabled={formData.productType === 'vide'} // Disable input when "vide" is selected
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Opération
        </label>
        <select
          name="isLoading"
          value={formData.isLoading.toString()}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          disabled={formData.productType === 'vide'} // Disable when "vide" is selected
        >
          <option value="true">Chargé</option>
          <option value="false">Déchargé</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          placeholder="Ajoutez des détails supplémentaires..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Mettre à jour' : 'Ajouter la citerne'}
        </Button>
      </div>
    </form>
  );
};

export default TankForm;