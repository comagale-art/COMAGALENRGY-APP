import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import { useBarrels } from '../context/BarrelContext';
import Layout from '../components/layout/Layout';
import BarrelList from '../components/barrels/BarrelList';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const BarrelsPage: React.FC = () => {
  const { barrels, deleteBarrel, loading, error, refreshBarrels } = useBarrels();

  const handleDelete = async (id: string) => {
    try {
      await deleteBarrel(id);
    } catch (err) {
      console.error('Error deleting barrel:', err);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Barils</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos barils et leur statut
          </p>
        </div>

        <div className="flex space-x-3">
          <Link to="/barrels/new">
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
            onClick={refreshBarrels}
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
        <BarrelList barrels={barrels} onDelete={handleDelete} />
      )}

      <FloatingActionButton to="/barrels/new" label="Ajouter un baril" />
    </Layout>
  );
};

export default BarrelsPage;
