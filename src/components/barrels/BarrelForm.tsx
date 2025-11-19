import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Barrel } from '../../types';
import { useBarrels } from '../../context/BarrelContext';

interface BarrelFormProps {
  initialData?: Barrel;
  onSubmit: (data: Omit<Barrel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  isEditing?: boolean;
}

const BarrelForm: React.FC<BarrelFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const { barrels } = useBarrels();
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    barrelNumber: initialData?.barrelNumber || '',
    product: initialData?.product || '',
    supplier: initialData?.supplier || '',
    quantity: initialData?.quantity || 'Complet',
    quantityCustom: '',
    status: initialData?.status || 'Stock',
    quantitySold: initialData?.quantitySold?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);
  const productRef = useRef<HTMLDivElement>(null);
  const supplierRef = useRef<HTMLDivElement>(null);

  const uniqueProducts = Array.from(new Set(barrels.map(b => b.product)))
    .filter(p => p.trim())
    .sort((a, b) => a.localeCompare(b));

  const uniqueSuppliers = Array.from(new Set(barrels.map(b => b.supplier)))
    .filter(s => s.trim())
    .sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (initialData) {
      const isCustomQuantity = !['Complet', '70%', '50%', '30%'].includes(initialData.quantity);
      setFormData({
        date: initialData.date,
        barrelNumber: initialData.barrelNumber,
        product: initialData.product,
        supplier: initialData.supplier,
        quantity: isCustomQuantity ? 'Autre' : initialData.quantity,
        quantityCustom: isCustomQuantity ? initialData.quantity : '',
        status: initialData.status,
        quantitySold: initialData.quantitySold?.toString() || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
      if (supplierRef.current && !supplierRef.current.contains(event.target as Node)) {
        setShowSupplierSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'product') {
      setFormData(prev => ({ ...prev, product: value }));
      const filtered = uniqueProducts.filter(p =>
        p.toLowerCase().includes(value.toLowerCase())
      );
      setProductSuggestions(filtered);
      setShowProductSuggestions(true);
    } else if (name === 'supplier') {
      setFormData(prev => ({ ...prev, supplier: value }));
      const filtered = uniqueSuppliers.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSupplierSuggestions(filtered);
      setShowSupplierSuggestions(true);
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

  const handleSelectSuggestion = (type: 'product' | 'supplier', value: string) => {
    setFormData(prev => ({ ...prev, [type]: value }));
    if (type === 'product') {
      setShowProductSuggestions(false);
    } else {
      setShowSupplierSuggestions(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    if (!formData.barrelNumber.trim()) {
      newErrors.barrelNumber = 'Le numéro de baril est requis';
    }

    if (!formData.product.trim()) {
      newErrors.product = 'Le produit est requis';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Le fournisseur est requis';
    }

    if (formData.quantity === 'Autre' && !formData.quantityCustom.trim()) {
      newErrors.quantityCustom = 'Veuillez spécifier la quantité';
    }

    if (formData.status === 'Vendu Quantité' && !formData.quantitySold.trim()) {
      newErrors.quantitySold = 'La quantité vendue est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const quantity = formData.quantity === 'Autre' ? formData.quantityCustom : formData.quantity;
      const quantitySold = formData.status === 'Vendu Quantité' ? parseFloat(formData.quantitySold) : undefined;

      const data = {
        date: formData.date,
        barrelNumber: formData.barrelNumber.trim(),
        product: formData.product.trim(),
        supplier: formData.supplier.trim(),
        quantity,
        status: formData.status as 'Vendu Complet' | 'Stock' | 'Vendu Quantité',
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
        label="N° Baril"
        type="text"
        name="barrelNumber"
        value={formData.barrelNumber}
        onChange={handleChange}
        error={errors.barrelNumber}
        fullWidth
        required
      />

      <div className="relative" ref={productRef}>
        <Input
          label="Produit"
          type="text"
          name="product"
          value={formData.product}
          onChange={handleChange}
          error={errors.product}
          fullWidth
          required
          autoComplete="off"
        />

        {showProductSuggestions && productSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {productSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSelectSuggestion('product', suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={supplierRef}>
        <Input
          label="Fournisseur"
          type="text"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          error={errors.supplier}
          fullWidth
          required
          autoComplete="off"
        />

        {showSupplierSuggestions && supplierSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {supplierSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSelectSuggestion('supplier', suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Quantité
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
          type="text"
          name="quantityCustom"
          value={formData.quantityCustom}
          onChange={handleChange}
          error={errors.quantityCustom}
          placeholder="Ex: 15L, 20cm, etc."
          fullWidth
          required
        />
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Statut
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

      {formData.status === 'Vendu Quantité' && (
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
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Mettre à jour' : 'Ajouter le baril'}
        </Button>
      </div>
    </form>
  );
};

export default BarrelForm;
