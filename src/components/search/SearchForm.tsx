import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useSuppliers } from '../../context/SupplierContext';
import { useBigSuppliers } from '../../context/BigSupplierContext';
import { useOrders } from '../../context/OrderContext';
import { useTanks } from '../../context/TankContext';
import { useInvoices } from '../../context/InvoiceContext';

interface SearchFormProps {
  onSearch: (query: string, startDate: string, endDate: string, searchType: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const { suppliers } = useSuppliers();
  const { bigSuppliers } = useBigSuppliers();
  const { orders } = useOrders();
  const { tanks } = useTanks();
  const { invoices } = useInvoices();

  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchType, setSearchType] = useState('suppliers');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    let searchSuggestions: string[] = [];
    
    switch (searchType) {
      case 'suppliers':
        searchSuggestions = Array.from(new Set(suppliers.map(s => s.name)));
        break;
      case 'bigSuppliers':
        searchSuggestions = Array.from(new Set(bigSuppliers.map(s => s.supplierName)));
        break;
      case 'orders':
        searchSuggestions = Array.from(new Set(orders.map(o => o.clientName)));
        break;
      case 'tanks':
        searchSuggestions = Array.from(new Set(tanks.map(t => t.name)));
        break;
      case 'invoices':
        searchSuggestions = Array.from(new Set([
          ...invoices.map(i => i.clientName),
          ...invoices.map(i => i.invoiceNumber)
        ]));
        break;
    }
    
    const filteredSuggestions = searchSuggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    );
    
    setSuggestions(filteredSuggestions);
    setShowSuggestions(query.length > 0 && filteredSuggestions.length > 0);
  }, [query, searchType, suppliers, bigSuppliers, orders, tanks, invoices]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, startDate, endDate, searchType);
    setShowSuggestions(false);
  };
  
  const handleReset = () => {
    setQuery('');
    setStartDate('');
    setEndDate('');
    setSearchType('suppliers');
    setShowSuggestions(false);
    onSearch('', '', '', 'suppliers');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'suppliers':
        return 'Rechercher un fournisseur...';
      case 'bigSuppliers':
        return 'Rechercher un grand fournisseur...';
      case 'orders':
        return 'Rechercher une commande...';
      case 'tanks':
        return 'Rechercher une citerne...';
      case 'invoices':
        return 'Rechercher une facture (client ou numéro)...';
      default:
        return 'Rechercher...';
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Type de recherche
        </label>
        <select
          value={searchType}
          onChange={(e) => {
            setSearchType(e.target.value);
            setQuery('');
            setSuggestions([]);
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="suppliers">Fournisseurs</option>
          <option value="bigSuppliers">Grands Fournisseurs</option>
          <option value="orders">Commandes</option>
          <option value="tanks">Citernes</option>
          <option value="invoices">Factures</option>
        </select>
      </div>

      <div className="relative">
        <Input
          label="Rechercher"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getPlaceholder()}
          fullWidth
        />
        <div className="absolute right-3 top-9 text-gray-400">
          <Search size={20} />
        </div>

        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Date de début"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
        />
        <Input
          label="Date de fin"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={handleReset}>
          Réinitialiser
        </Button>
        <Button type="submit" variant="primary">
          Rechercher
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;