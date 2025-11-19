import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useSuppliers } from '../context/SupplierContext';
import Layout from '../components/layout/Layout';
import SupplierList from '../components/suppliers/SupplierList';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import Card from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const SuppliersPage: React.FC = () => {
  const { suppliers, deleteSupplier, loading, error, refreshSuppliers } = useSuppliers();
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await deleteSupplier(id);
      } catch (err) {
        console.error('Error deleting supplier:', err);
      }
    }
  };
  
  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fournisseurs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos fournisseurs et leurs livraisons
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Link to="/suppliers/new">
            <Button 
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Ajouter</span>
            </Button>
          </Link>
          
          <Button 
            variant="secondary" 
            onClick={refreshSuppliers}
            disabled={loading}
          >
            {loading ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>
      </div>
      
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}
      
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
        </div>
      ) : (
        <SupplierList suppliers={suppliers} onDelete={handleDelete} />
      )}
      
      <FloatingActionButton to="/suppliers/new" label="Ajouter un fournisseur" />
    </Layout>
  );
};

export default SuppliersPage;