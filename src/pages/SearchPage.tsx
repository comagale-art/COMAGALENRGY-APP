import React, { useState } from 'react';
import { useSuppliers } from '../context/SupplierContext';
import { useBigSuppliers } from '../context/BigSupplierContext';
import { useOrders } from '../context/OrderContext';
import { useTanks } from '../context/TankContext';
import { useInvoices } from '../context/InvoiceContext';
import Layout from '../components/layout/Layout';
import SearchForm from '../components/search/SearchForm';
import SearchResults from '../components/search/SearchResults';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import Card from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { suppliers, deleteSupplier, filterSuppliers } = useSuppliers();
  const { bigSuppliers, deleteBigSupplier } = useBigSuppliers();
  const { orders, deleteOrder } = useOrders();
  const { tanks, deleteTank } = useTanks();
  const { invoices, deleteInvoice } = useInvoices();

  const [searchParams, setSearchParams] = useState({
    query: '',
    startDate: '',
    endDate: '',
    searchType: 'suppliers'
  });
  const [results, setResults] = useState<any[]>(suppliers);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const handleSearch = async (query: string, startDate: string, endDate: string, searchType: string) => {
    setSearching(true);
    setSearchError(null);
    try {
      let searchResults: any[] = [];
      
      switch (searchType) {
        case 'suppliers':
          searchResults = await filterSuppliers(query, startDate, endDate);
          break;
        case 'bigSuppliers':
          searchResults = bigSuppliers.filter(supplier => {
            const matchesQuery = query 
              ? supplier.supplierName.toLowerCase().includes(query.toLowerCase())
              : true;
            const matchesDate = startDate && endDate
              ? supplier.date >= startDate && supplier.date <= endDate
              : true;
            return matchesQuery && matchesDate;
          });
          break;
        case 'orders':
          searchResults = orders.filter(order => {
            const matchesQuery = query 
              ? order.clientName.toLowerCase().includes(query.toLowerCase())
              : true;
            const matchesDate = startDate && endDate
              ? order.date >= startDate && order.date <= endDate
              : true;
            return matchesQuery && matchesDate;
          });
          break;
        case 'tanks':
          searchResults = tanks.filter(tank => {
            const matchesQuery = query 
              ? tank.name.toLowerCase().includes(query.toLowerCase()) ||
                tank.productType.toLowerCase().includes(query.toLowerCase())
              : true;
            const matchesDate = startDate && endDate
              ? tank.date >= startDate && tank.date <= endDate
              : true;
            return matchesQuery && matchesDate;
          });
          break;
        case 'invoices':
          searchResults = invoices.filter(invoice => {
            const matchesQuery = query 
              ? invoice.clientName.toLowerCase().includes(query.toLowerCase()) ||
                invoice.invoiceNumber.toLowerCase().includes(query.toLowerCase())
              : true;
            const matchesDate = startDate && endDate
              ? invoice.date >= startDate && invoice.date <= endDate
              : true;
            return matchesQuery && matchesDate;
          });
          break;
      }
      
      setResults(searchResults);
      setSearchParams({ query, startDate, endDate, searchType });
    } catch (err) {
      console.error('Error during search:', err);
      setSearchError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setSearching(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    try {
      switch (searchParams.searchType) {
        case 'suppliers':
          await deleteSupplier(id);
          break;
        case 'bigSuppliers':
          await deleteBigSupplier(id);
          break;
        case 'orders':
          await deleteOrder(id);
          break;
        case 'tanks':
          await deleteTank(id);
          break;
        case 'invoices':
          await deleteInvoice(id);
          break;
      }
      setResults(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const getFloatingActionButtonProps = () => {
    switch (searchParams.searchType) {
      case 'suppliers':
        return { to: '/suppliers/new', label: 'Ajouter un fournisseur' };
      case 'bigSuppliers':
        return { to: '/big-suppliers/new', label: 'Ajouter un grand fournisseur' };
      case 'orders':
        return { to: '/orders/new', label: 'Ajouter une commande' };
      case 'tanks':
        return { to: '/tanks/new', label: 'Ajouter une citerne' };
      case 'invoices':
        return { to: '/invoices/new', label: 'Créer une facture' };
      default:
        return { to: '/suppliers/new', label: 'Ajouter' };
    }
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recherche avancée</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Recherchez des éléments par type et période
        </p>
      </div>
      
      {searchError && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>{searchError}</p>
          </div>
        </Card>
      )}
      
      <div className="space-y-6">
        <SearchForm onSearch={handleSearch} />
        
        {searching ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
          </div>
        ) : (
          <SearchResults 
            results={results} 
            onDelete={handleDelete} 
            searchParams={searchParams}
          />
        )}
      </div>
      
      <FloatingActionButton {...getFloatingActionButtonProps()} />
    </Layout>
  );
};

export default SearchPage;