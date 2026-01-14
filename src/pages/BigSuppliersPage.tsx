import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBigSuppliers } from '../context/BigSupplierContext';
import Layout from '../components/layout/Layout';
import BigSupplierYearBlocks from '../components/orders/BigSupplierYearBlocks';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import Card from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const BigSuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const { bigSuppliers, deleteBigSupplier, loading, error, refreshBigSuppliers } = useBigSuppliers();

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce grand fournisseur ?')) {
      try {
        await deleteBigSupplier(id);
      } catch (err) {
        console.error('Error deleting big supplier:', err);
      }
    }
  };

  const handleAddSupplier = () => {
    navigate('/big-suppliers/new');
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Liste des Grand Fournisseur</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos commandes avec les grands fournisseurs
          </p>
        </div>

        <Button
          variant="primary"
          onClick={refreshBigSuppliers}
          disabled={loading}
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </Button>
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
        <BigSupplierYearBlocks
          suppliers={bigSuppliers}
          onDelete={handleDelete}
          onAddSupplier={handleAddSupplier}
        />
      )}

      <FloatingActionButton
        to="/big-suppliers/new"
        label="Ajouter un grand fournisseur"
        className="bg-comagal-blue hover:bg-comagal-light-blue"
      />
    </Layout>
  );
};

export default BigSuppliersPage;