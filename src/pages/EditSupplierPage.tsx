import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuppliers } from '../context/SupplierContext';
import Layout from '../components/layout/Layout';
import SupplierForm from '../components/suppliers/SupplierForm';
import Card from '../components/ui/Card';
import { AlertCircle, CheckCircle } from 'lucide-react';

const EditSupplierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getSupplierById, updateSupplier, loading } = useSuppliers();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const supplier = id ? getSupplierById(id) : undefined;
  
  const handleSubmit = async (data: any) => {
    if (!id || !supplier) {
      setError('Fournisseur non trouvé');
      return;
    }

    try {
      setError(null);
      
      // Validate required fields
      if (!data.name?.trim()) {
        setError('Le nom du fournisseur est requis');
        return;
      }
      
      if (!data.deliveryDate) {
        setError('La date de livraison est requise');
        return;
      }
      
      if (typeof data.quantity !== 'number' || isNaN(data.quantity)) {
        setError('La quantité doit être un nombre valide');
        return;
      }

      // Ensure data types are correct
      const updatedData = {
        name: data.name.trim(),
        deliveryDate: data.deliveryDate,
        quantity: Number(data.quantity)
      };

      await updateSupplier(id, updatedData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/suppliers');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating supplier:', err);
      setError(err.message || 'Erreur lors de la mise à jour du fournisseur. Veuillez réessayer.');
    }
  };
  
  if (!supplier) {
    return (
      <Layout>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">Fournisseur non trouvé</p>
          <button
            onClick={() => navigate('/suppliers')}
            className="mt-4 text-comagal-blue hover:underline dark:text-comagal-light-blue"
          >
            Retour à la liste des fournisseurs
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier un fournisseur</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifiez les informations du fournisseur
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
            <p>Fournisseur mis à jour avec succès! Redirection...</p>
          </div>
        </Card>
      )}
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
          </div>
        ) : (
          <SupplierForm initialData={supplier} onSubmit={handleSubmit} isEditing />
        )}
      </div>
    </Layout>
  );
};

export default EditSupplierPage;