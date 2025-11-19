import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBarrels } from '../context/BarrelContext';
import Layout from '../components/layout/Layout';
import BarrelForm from '../components/barrels/BarrelForm';
import Card from '../components/ui/Card';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AddBarrelPage: React.FC = () => {
  const { addBarrel, loading } = useBarrels();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      await addBarrel(data);
      setSuccess(true);

      setTimeout(() => {
        navigate('/barrels');
      }, 1500);
    } catch (err) {
      console.error('Error adding barrel:', err);
      setError('Erreur lors de l\'ajout du baril. Veuillez réessayer.');
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajouter un baril</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enregistrez un nouveau baril
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
            <p>Baril ajouté avec succès! Redirection...</p>
          </div>
        </Card>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
          </div>
        ) : (
          <BarrelForm onSubmit={handleSubmit} />
        )}
      </div>
    </Layout>
  );
};

export default AddBarrelPage;
