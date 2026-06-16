import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import TankList from '../components/tanks/TankList';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import Card from '../components/ui/Card';
import { AlertCircle, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTanks } from '../context/TankContext';

const TanksPage: React.FC = () => {
  const { tanks, deleteTank, loading, error, refreshTanks } = useTanks();

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette citerne ?')) {
      try {
        await deleteTank(id);
      } catch (err) {
        console.error('Error deleting tank:', err);
      }
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Citernes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos citernes et leurs opérations
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Link to="/tanks/new">
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
            onClick={refreshTanks}
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
        <TankList tanks={tanks} onDelete={handleDelete} />
      )}
      
      <FloatingActionButton to="/tanks/new" label="Ajouter une citerne" />
    </Layout>
  );
};

export default TanksPage;
