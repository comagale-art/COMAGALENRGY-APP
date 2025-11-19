import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Order } from '../../types';
import { useClientSuggestions } from '../../context/ClientSuggestionsContext';

interface OrderFormProps {
  onSubmit: (data: Omit<Order, 'id' | 'createdAt' | 'time'>) => void;
}

const PRODUCT_OPTIONS = [
  { value: 'used_oil', label: 'Huile Usage' },
  { value: 'fuel_oil', label: 'Fuel Oil' },
  { value: 'oil', label: 'Oil' }
];

const TANK_OPTIONS = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
  'C11', 'C50', 'C60', 'C100-1', 'C100-2'
];

const LOCATION_OPTIONS = [
  { value: 'sarije', label: 'Sarije' },
  { value: 'tank', label: 'Citerne' },
  { value: 'both', label: 'Les deux' },
  { value: 'other', label: 'Autre' }
];

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const { clientSuggestions } = useClientSuggestions();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    deliveryAddress: '',
    product: 'used_oil',
    blNumber: '',
    cargoPlacement: 'sarije',
    tankName: '',
    quantityCm: '',
    tankQuantity: '',
    quantity: '',
    pricePerKg: '',
    vatRate: 0.2,
    otherLocation: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalPriceExclTax, setTotalPriceExclTax] = useState(0);
  const [totalPriceInclTax, setTotalPriceInclTax] = useState(0);
  
  // State for suggestions
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState<string[]>([]);
  const [filteredAddresses, setFilteredAddresses] = useState<string[]>([]);
  
  // Refs for suggestion dropdowns
  const clientInputRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.pricePerKg) || 0;
    const TV = parseFloat(formData.vatRate) || 0;
    const totalExclTax = quantity * price;
    const totalInclTax = totalExclTax * (1 + TV) ;
    
    setTotalPriceExclTax(totalExclTax);
    setTotalPriceInclTax(totalInclTax);
  }, [formData.quantity, formData.pricePerKg, formData.vatRate]);

  useEffect(() => {
    // Handle clicks outside suggestion dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (clientInputRef.current && !clientInputRef.current.contains(event.target as Node)) {
        setShowClientSuggestions(false);
      }
      if (addressInputRef.current && !addressInputRef.current.contains(event.target as Node)) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Handle client name suggestions
    if (name === 'clientName') {
      const filtered = clientSuggestions
        .map(s => s.name)
        .filter(name => name.toLowerCase().includes(value.toLowerCase()));
      setFilteredClients(filtered);
      setShowClientSuggestions(true);
    }

    // Handle address suggestions
    if (name === 'deliveryAddress') {
      const currentClient = clientSuggestions.find(s => s.name === formData.clientName);
      if (currentClient) {
        const filtered = currentClient.addresses.filter(addr => 
          addr.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAddresses(filtered);
        setShowAddressSuggestions(true);
      }
    }
  };

  const handleSelectClient = (clientName: string) => {
    setFormData(prev => ({ ...prev, clientName }));
    setShowClientSuggestions(false);

    // Update address suggestions for the selected client
    const client = clientSuggestions.find(s => s.name === clientName);
    if (client && client.addresses.length > 0) {
      setFilteredAddresses(client.addresses);
      setShowAddressSuggestions(true);
    }
  };

  const handleSelectAddress = (address: string) => {
    setFormData(prev => ({ ...prev, deliveryAddress: address }));
    setShowAddressSuggestions(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est requis';
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'L\'adresse de livraison est requise';
    }

    if (!formData.blNumber.trim()) {
      newErrors.blNumber = 'Le numéro BL est requis';
    }

    if (formData.cargoPlacement === 'sarije' && !formData.quantityCm) {
      newErrors.quantityCm = 'La quantité en cm est requise pour Sarije';
    }

    if ((formData.cargoPlacement === 'tank' || formData.cargoPlacement === 'both') && !formData.tankName) {
      newErrors.tankName = 'Le nom de la citerne est requis';
    }

    if (formData.cargoPlacement === 'both') {
      if (!formData.quantityCm) {
        newErrors.quantityCm = 'La quantité Sarije en cm est requise';
      }
      if (!formData.tankQuantity) {
        newErrors.tankQuantity = 'La quantité citerne est requise';
      }
    }

    if (formData.cargoPlacement === 'other' && !formData.otherLocation.trim()) {
      newErrors.otherLocation = 'L\'emplacement est requis';
    }

    if (!formData.quantity || isNaN(parseFloat(formData.quantity))) {
      newErrors.quantity = 'La quantité en kg doit être un nombre valide';
    }

    if (!formData.pricePerKg || isNaN(parseFloat(formData.pricePerKg))) {
      newErrors.pricePerKg = 'Le prix par kg doit être un nombre valide';
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
        quantityCm: formData.quantityCm ? parseFloat(formData.quantityCm) : undefined,
        tankQuantity: formData.tankQuantity ? parseFloat(formData.tankQuantity) : undefined,
        pricePerKg: parseFloat(formData.pricePerKg),
        totalPriceExclTax,
        totalPriceInclTax,
        cargoPlacement: formData.cargoPlacement === 'other' ? formData.otherLocation : formData.cargoPlacement
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

        <div ref={clientInputRef} className="relative">
          <Input
            label="Nom du client"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            error={errors.clientName}
            fullWidth
            required
            autoComplete="off"
          />
          {showClientSuggestions && filteredClients.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {filteredClients.map((client, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSelectClient(client)}
                >
                  {client}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={addressInputRef} className="relative">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Adresse de livraison
        </label>
        <textarea
          name="deliveryAddress"
          value={formData.deliveryAddress}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          rows={3}
          placeholder="Adresse complète de livraison"
          required
        />
        {errors.deliveryAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress}</p>
        )}
        {showAddressSuggestions && filteredAddresses.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {filteredAddresses.map((address, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSelectAddress(address)}
              >
                {address}
              </button>
            ))}
          </div>
        )}
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
          label="Numéro BL"
          name="blNumber"
          value={formData.blNumber}
          onChange={handleChange}
          error={errors.blNumber}
          fullWidth
          required
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Source du cargo
          </label>
          <select
            name="cargoPlacement"
            value={formData.cargoPlacement}
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

        {formData.cargoPlacement === 'other' && (
          <Input
            label="Autre emplacement"
            name="otherLocation"
            value={formData.otherLocation}
            onChange={handleChange}
            error={errors.otherLocation}
            placeholder="Spécifiez l'emplacement"
            fullWidth
            required
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(formData.cargoPlacement === 'sarije' || formData.cargoPlacement === 'both') && (
          <Input
            label="Quantité Sarije (cm)"
            type="text"
            name="quantityCm"
            value={formData.quantityCm}
            onChange={handleChange}
            error={errors.quantityCm}
            placeholder="0.00"
            fullWidth
            required
          />
        )}

        {(formData.cargoPlacement === 'tank' || formData.cargoPlacement === 'both') && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nom de la citerne
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

            <Input
              label="Quantité Citerne (cm)"
              type="text"
              name="tankQuantity"
              value={formData.tankQuantity}
              onChange={handleChange}
              error={errors.tankQuantity}
              placeholder="0.00"
              fullWidth
              required
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Quantité totale (kg)"
          type="text"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          placeholder="0.00"
          fullWidth
          required
        />

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
        </select>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prix total HT</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {totalPriceExclTax.toFixed(2)} DH
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prix total TTC</p>
            <p className="text-lg font-semibold text-comagal-green dark:text-comagal-light-green">
              {totalPriceInclTax.toFixed(2)} DH
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          Ajouter la commande
        </Button>
      </div>
    </form>
  );
};

export default OrderForm;