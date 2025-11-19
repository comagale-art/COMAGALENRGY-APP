import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Barrel } from '../../types';

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
    productCustom: '',
    supplier: initialData?.supplier || '',
    supplierCustom: '',
    quantity: initialData?.quantity || 'Complet',
    quantityCustom: '',
    status: initialData?.status || 'Stock',
    quantitySold: initialData?.quantitySold?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const productOptions = [
    "Huile Hydraulique Rouge",
    "Gasoil",
    "Graisse",
    "Mkayha",
    "Huile Transfot",
    "10",
    "Autre"
  ];

  const supplierOptions = [
    "Said",
    "Radade",
    "Youssef",
    "Abdeslam",
    "Autre"
  ];

  useEffect(() => {
    if (initialData) {
      const isCustomQuantity = !['Complet', '70%', '50%', '30%'].includes(initialData.quantity);
      const isCustomProduct = !productOptions.slice(0, -1).includes(initialData.product);
      const isCustomSupplier = !supplierOptions.slice(0, -1).includes(initialData.supplier);

      setFormData({
        date: initialData.date,
        barrelNumber: initialData.barrelNumber,
        product: isCustomProduct ? 'Autre' : initialData.product,
        productCustom: isCustomProduct ? initialData.product : '',
        supplier: isCustomSupplier ? 'Autre' : initialData.supplier,
        supplierCustom: isCustomSupplier ? initialData.supplier : '',
        quantity: isCustomQuantity ? 'Autre' : initialData.quantity,
        quantityCustom: isCustomQuantity ? initialData.quantity : '',
        status: initialData.status,
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

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    if (!formData.barrelNumber.trim()) {
      newErrors.barrelNumber = 'Le numéro de baril est requis';
    }

    if (!formData.product.trim()) {
      newErrors.product = 'Le produit est requis';
    }

    if (formData.product === 'Autre' && !formData.productCustom.trim()) {
      newErrors.productCustom = 'Veuillez spécifier le produit';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Le fournisseur est requis';
    }

    if (formData.supplier === 'Autre' && !formData.supplierCustom.trim()) {
      newErrors.supplierCustom = 'Veuillez spécifier le fournisseur';
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
      const product = formData.product === 'Autre' ? formData.productCustom : formData.product;
      const supplier = formData.supplier === 'Autre' ? formData.supplierCustom : formData.supplier;
      const quantity = formData.quantity === 'Autre' ? formData.quantityCustom : formData.quantity;
      const quantitySold = formData.status === 'Vendu Quantité' ? parseFloat(formData.quantitySold) : undefined;

      const data = {
        date: formData.date,
        barrelNumber: formData.barrelNumber.trim(),
        product: product.trim(),
        supplier: supplier.trim(),
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

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Produit <span className="text-red-500">*</span>
        </label>
        <select
          name="product"
          value={formData.product}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Sélectionner un produit</option>
          {productOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.product && (
          <p className="mt-1 text-sm text-red-500">{errors.product}</p>
        )}
      </div>

      {formData.product === 'Autre' && (
        <Input
          label="Spécifier le produit"
          type="text"
          name="productCustom"
          value={formData.productCustom}
          onChange={handleChange}
          error={errors.productCustom}
          placeholder="Nom du produit"
          fullWidth
          required
        />
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Fournisseur <span className="text-red-500">*</span>
        </label>
        <select
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Sélectionner un fournisseur</option>
          {supplierOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.supplier && (
          <p className="mt-1 text-sm text-red-500">{errors.supplier}</p>
        )}
      </div>

      {formData.supplier === 'Autre' && (
        <Input
          label="Spécifier le fournisseur"
          type="text"
          name="supplierCustom"
          value={formData.supplierCustom}
          onChange={handleChange}
          error={errors.supplierCustom}
          placeholder="Nom du fournisseur"
          fullWidth
          required
        />
      )}

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
