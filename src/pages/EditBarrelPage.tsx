import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBarrels } from '../context/BarrelContext';
import Layout from '../components/layout/Layout';
import BarrelStatusForm from '../components/barrels/BarrelStatusForm';
import Card from '../components/ui/Card';
import { AlertCircle, CheckCircle } from 'lucide-react';

const EditBarrelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getBarrelById, updateBarrel, loading } = useBarrels();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [barrel, setBarrel] = useState(id ? getBarrelById(id) : undefined);

  useEffect(() => {
    if (id) {
      const foundBarrel = getBarrelById(id);
      if (foundBarrel) {
        setBarrel(foundBarrel);
      } else {
        setError('Baril non trouvé');
      }
    }
  }, [id, getBarrelById]);

  const handleSubmit = async (data: any) => {
    if (!id) return;

    try {
      setError(null);
      await updateBarrel(id, data);
      setSuccess(true);

      setTimeout(() => {
        navigate('/barrels');
      }, 1500);
    } catch (err) {
      console.error('Error updating barrel:', err);
      setError('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
    }
  };

  if (!barrel && !loading) {
    return (
      <Layout>
        <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>Baril non trouvé</p>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le statut du baril</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Mettez à jour uniquement le statut du baril
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
            <p>Statut du baril mis à jour avec succès! Redirection...</p>
          </div>
        </Card>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
          </div>
        ) : (
          barrel && <BarrelStatusForm initialData={barrel} onSubmit={handleSubmit} />
        )}
      </div>
    </Layout>
  );
};

export default EditBarrelPage;
