import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import TankForm from '../components/tanks/TankForm';
import Card from '../components/ui/Card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useTanks } from '../context/TankContext';

const EditTankPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tanks, updateTank, loading } = useTanks();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const tank = id ? tanks.find(t => t.id === id) : undefined;
  
  const handleSubmit = async (data: any) => {
    if (!id || !tank) {
      setError('Citerne non trouvée');
      return;
    }
    
    try {
      setError(null);
      
      // Validate required fields
      if (!data.name?.trim()) {
        setError('Le nom de la citerne est requis');
        return;
      }
      
      if (!data.productType?.trim()) {
        setError('Le type de produit est requis');
        return;
      }
      
      if (!data.date) {
        setError('La date est requise');
        return;
      }
      
      if (typeof data.quantity !== 'number' || isNaN(data.quantity)) {
        setError('La quantité doit être un nombre valide');
        return;
      }

      // Ensure data types are correct
      const updatedData = {
        name: data.name.trim(),
        productType: data.productType.trim(),
        date: data.date,
        quantity: Number(data.quantity),
        isLoading: Boolean(data.isLoading),
        description: data.description?.trim() || ''
      };

      await updateTank(id, updatedData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/tanks');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating tank:', err);
      setError(err.message || 'Erreur lors de la mise à jour de la citerne. Veuillez réessayer.');
    }
  };
  
  if (!tank) {
    return (
      <Layout>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">Citerne non trouvée</p>
          <button
            onClick={() => navigate('/tanks')}
            className="mt-4 text-comagal-blue hover:underline dark:text-comagal-light-blue"
          >
            Retour à la liste des citernes
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier une citerne</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifiez les informations de la citerne
        </p>
      </div>
      
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}
      
      {success && (
        <Card className="mb-6 border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/30">
          <div className="flex items-center text-green-700 dark:text-green-400">
            <CheckCircle className="mr-2" size={20} />
            <p>Citerne mise à jour avec succès! Redirection...</p>
          </div>
        </Card>
      )}
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
          </div>
        ) : (
          <TankForm initialData={tank} onSubmit={handleSubmit} isEditing />
        )}
      </div>
    </Layout>
  );
};

export default EditTankPage;