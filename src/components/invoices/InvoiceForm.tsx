import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { numberToWords } from '../../utils/numberToWords';
import { useClientData } from '../../context/ClientDataContext';
import { InvoiceProduct } from '../../types';

interface InvoiceFormProps {
  onSubmit: (data: any) => void;
}

const PRODUCT_OPTIONS = [
  { value: 'huile_usage', label: 'Huile Usage' },
  { value: 'fuel_oil', label: 'Fuel Oil' },
  { value: 'gasoil', label: 'Gasoil' },
  { value: 'kodrone', label: 'Kodrone' },
  { value: 'Transport_Fuel', label: 'Transport Fuel' }
];

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const { clientData } = useClientData();
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    clientICE: '',
    date: new Date().toISOString().split('T')[0],
    vatRate: 0.2
  });

  const [products, setProducts] = useState<InvoiceProduct[]>([
    {
      id: '1',
      product: 'huile_usage',
      productPrice: 0,
      quantity: 0,
      subtotal: 0
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subtotal, setSubtotal] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalAmountInWords, setTotalAmountInWords] = useState('');

  useEffect(() => {
    const sub = products.reduce((sum, product) => sum + product.subtotal, 0);
    const vat = parseFloat(formData.vatRate.toString()) || 0;
    const vatAmt = sub * vat;
    const total = sub + vatAmt;
    
    setSubtotal(sub);
    setVatAmount(vatAmt);
    setTotalAmount(total);
    setTotalAmountInWords(numberToWords(total));
  }, [products, formData.vatRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'vatRate' ? parseFloat(value) : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const selectedClient = clientData.find(c => c.id === clientId);
    
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        clientName: selectedClient.name,
        clientAddress: selectedClient.address,
        clientICE: selectedClient.ice
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clientName: '',
        clientAddress: '',
        clientICE: ''
      }));
    }
  };

  const handleProductChange = (productId: string, field: keyof InvoiceProduct, value: string | number) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const updatedProduct = { ...product, [field]: value };
        
        // Recalculate subtotal when price or quantity changes
        if (field === 'productPrice' || field === 'quantity') {
          updatedProduct.subtotal = updatedProduct.productPrice * updatedProduct.quantity;
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

  const addProduct = () => {
    const newProduct: InvoiceProduct = {
      id: Date.now().toString(),
      product: 'huile_usage',
      productPrice: 0,
      quantity: 0,
      subtotal: 0
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const removeProduct = (productId: string) => {
    if (products.length > 1) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est requis';
    }

    if (!formData.clientAddress.trim()) {
      newErrors.clientAddress = 'L\'adresse du client est requise';
    }

    if (!formData.clientICE.trim()) {
      newErrors.clientICE = 'L\'ICE du client est requis';
    }

    // Validate products
    products.forEach((product, index) => {
      if (!product.productPrice || product.productPrice <= 0) {
        newErrors[`product_${index}_price`] = 'Le prix du produit doit être supérieur à 0';
      }
      if (!product.quantity || product.quantity <= 0) {
        newErrors[`product_${index}_quantity`] = 'La quantité doit être supérieure à 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const data = {
        ...formData,
        products,
        subtotal,
        vatAmount,
        totalAmount,
        totalAmountInWords
      };
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Sélectionner un client
          </label>
          <select
            onChange={handleClientSelect}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Sélectionnez un client</option>
            {clientData.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

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
      </div>

      <Input
        label="Nom du client"
        name="clientName"
        value={formData.clientName}
        onChange={handleChange}
        error={errors.clientName}
        fullWidth
        required
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Adresse du client
        </label>
        <textarea
          name="clientAddress"
          value={formData.clientAddress}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          rows={3}
          placeholder="Adresse complète du client"
          required
        />
        {errors.clientAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.clientAddress}</p>
        )}
      </div>

      <Input
        label="ICE du client"
        name="clientICE"
        value={formData.clientICE}
        onChange={handleChange}
        error={errors.clientICE}
        placeholder="Numéro ICE du client"
        fullWidth
        required
      />

      {/* Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Produits</h3>
          <Button
            type="button"
            variant="outline"
            onClick={addProduct}
            className="flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Ajouter un produit</span>
          </Button>
        </div>

        {products.map((product, index) => (
          <div key={product.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white">Produit {index + 1}</h4>
              {products.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Produit
                </label>
                <select
                  value={product.product}
                  onChange={(e) => handleProductChange(product.id, 'product', e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {PRODUCT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Prix du produit (DH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={product.productPrice}
                  onChange={(e) => handleProductChange(product.id, 'productPrice', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  placeholder="0.00"
                  required
                />
                {errors[`product_${index}_price`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`product_${index}_price`]}</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Quantité (kg)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={product.quantity}
                  onChange={(e) => handleProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  placeholder="0.000"
                  required
                />
                {errors[`product_${index}_quantity`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`product_${index}_quantity`]}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Sous-total (DH)
                </label>
                <div className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    {product.subtotal.toFixed(2)} DH
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          TVA
        </label>
        <select
          name="vatRate"
          value={formData.vatRate}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="0.2">20%</option>
          <option value="0.1">10%</option>
          <option value="0.13">13%</option>
        </select>
      </div>

      <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Résumé de la facture</h3>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sous-total HT</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {subtotal.toFixed(2)} DH
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              TVA ({(formData.vatRate * 100)}%)
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {vatAmount.toFixed(2)} DH
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total TTC</p>
            <p className="text-xl font-bold text-comagal-green dark:text-comagal-light-green">
              {totalAmount.toFixed(2)} DH
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Montant en lettres</p>
          <p className="text-base font-medium text-gray-800 dark:text-white">
            {totalAmountInWords}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          Créer la facture
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;