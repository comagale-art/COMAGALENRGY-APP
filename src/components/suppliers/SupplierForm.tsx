import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Supplier } from '../../types';
import { calculateBarrels, calculateKgQuantity } from '../../utils/calculations';
import { useSuppliers } from '../../context/SupplierContext';

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (data: Omit<Supplier, 'id' | 'barrels' | 'kgQuantity' | 'createdAt' | 'deliveryTime' | 'stockLevel'>) => void;
  isEditing?: boolean;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ 
  initialData, 
  onSubmit,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const { suppliers } = useSuppliers();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    deliveryDate: initialData?.deliveryDate || new Date().toISOString().split('T')[0],
    quantity: initialData?.quantity || 0,
  });
  const [quantityInput, setQuantityInput] = useState(initialData?.quantity?.toString() || '0');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [kgPerBarrel, setKgPerBarrel] = useState(185);
  const [calculatedValues, setCalculatedValues] = useState({
    barrels: 0,
    kgQuantity: 0,
  });
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  const uniqueSupplierNames = Array.from(new Set(suppliers.map(s => s.name)))
    .sort((a, b) => a.localeCompare(b));
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        deliveryDate: initialData.deliveryDate,
        quantity: initialData.quantity,
      });
      setQuantityInput(initialData.quantity.toString());
    }
  }, [initialData]);
  
  useEffect(() => {
    const barrels = calculateBarrels(formData.quantity);
    const kgQuantity = calculateKgQuantity(barrels, kgPerBarrel);
    
    setCalculatedValues({
      barrels,
      kgQuantity,
    });
  }, [formData.quantity, kgPerBarrel]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity') {
      setQuantityInput(value);
      const processedValue = value.replace(',', '.');
      const parsedValue = parseFloat(processedValue);
      
      if (!isNaN(parsedValue)) {
        setFormData(prev => ({
          ...prev,
          quantity: parsedValue,
        }));
      }
    } else if (name === 'name') {
      setFormData(prev => ({ ...prev, name: value }));
      
      const filtered = uniqueSupplierNames.filter(name => 
        name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectSuggestion = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    setShowSuggestions(false);
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du fournisseur est requis';
    }
    
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'La date de livraison est requise';
    }
    
    const quantity = parseFloat(quantityInput.replace(',', '.'));
    if (isNaN(quantity)) {
      newErrors.quantity = 'La quantité doit être un nombre valide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      const data = {
        name: formData.name.trim(),
        deliveryDate: formData.deliveryDate,
        quantity: parseFloat(quantityInput.replace(',', '.'))
      };
      onSubmit(data);
    }
  };
  
  const handleCancel = () => {
    navigate('/suppliers');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative" ref={suggestionRef}>
        <Input
          label="Nom du fournisseur"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          fullWidth
          required
          autoComplete="off"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <Input
        label="Date de livraison"
        type="date"
        name="deliveryDate"
        value={formData.deliveryDate}
        onChange={handleChange}
        error={errors.deliveryDate}
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
      />
      
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Conversion kg par baril
        </label>
        <select
          value={kgPerBarrel}
          onChange={(e) => setKgPerBarrel(Number(e.target.value))}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value={182}>182 kg/baril</option>
          <option value={183}>183 kg/baril</option>
          <option value={184}>184 kg/baril</option>
          <option value={185}>185 kg/baril</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre de barils</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {calculatedValues.barrels.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Calculé automatiquement (quantité ÷ 0.75)
          </p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantité en kg</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {calculatedValues.kgQuantity.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Calculé automatiquement (barils × {kgPerBarrel})
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Mettre à jour' : 'Ajouter le fournisseur'}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;