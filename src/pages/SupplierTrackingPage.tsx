import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, AlertCircle, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  addTrackedSupplier, 
  getTrackedSuppliers, 
  deleteTrackedSupplier,
  getSupplierTransactions,
  getSupplierPayments,
  toggleSupplierFavorite 
} from '../firebase/services/supplierTracking';

interface SupplierWithBalance {
  id: string;
  name: string;
  balance: number;
  isFavorite?: boolean;
  lastModification?: string;
  lastQuantity?: string;
}

const SupplierTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [newSupplierName, setNewSupplierName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const calculateSupplierBalance = async (supplierId: string) => {
    try {
      const transactions = await getSupplierTransactions(supplierId);
      const payments = await getSupplierPayments(supplierId);
      
      const totalTransactions = transactions.reduce((sum, t) => 
        sum + (t.service ? (t.price || 0) : (t.totalPrice || 0)), 0);
      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
      
      // Get last modification info if there are transactions
      let lastModification = undefined;
      let lastQuantity = undefined;
      
      if (transactions.length > 0) {
        const lastTransaction = transactions[0]; // Already sorted by date desc
        lastModification = format(new Date(lastTransaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr });
        lastQuantity = lastTransaction.service 
          ? `Service: ${lastTransaction.service}`
          : `${lastTransaction.quantity?.toFixed(2)} ${lastTransaction.quantityType}`;
      }
      
      return {
        balance: totalTransactions - totalPayments,
        lastModification,
        lastQuantity
      };
    } catch (err) {
      console.error('Error calculating balance:', err);
      return { balance: 0 };
    }
  };

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const trackedSuppliers = await getTrackedSuppliers();
      
      // Calculate balance and last modification info for each supplier
      const suppliersWithInfo = await Promise.all(
        trackedSuppliers.map(async (supplier) => {
          const info = await calculateSupplierBalance(supplier.id);
          return {
            ...supplier,
            balance: info.balance,
            lastModification: info.lastModification,
            lastQuantity: info.lastQuantity
          };
        })
      );
      
      // Sort suppliers: favorites first, then alphabetically
      const sortedSuppliers = suppliersWithInfo.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setSuppliers(sortedSuppliers);
    } catch (err) {
      console.error('Error loading tracked suppliers:', err);
      setError('Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      setError('Le nom du fournisseur est requis');
      return;
    }

    try {
      setError(null);
      const id = await addTrackedSupplier(newSupplierName.trim());
      setSuppliers(prev => [...prev, { id, name: newSupplierName.trim(), balance: 0, isFavorite: false }]);
      setNewSupplierName('');
    } catch (err) {
      console.error('Error adding tracked supplier:', err);
      setError('Erreur lors de l\'ajout du fournisseur');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      return;
    }

    try {
      await deleteTrackedSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      setSelectedSuppliers(prev => prev.filter(s => s !== id));
    } catch (err) {
      console.error('Error deleting tracked supplier:', err);
      setError('Erreur lors de la suppression du fournisseur');
    }
  };

  const handleSupplierSelect = (id: string) => {
    navigate(`/supplier-tracking/${id}`);
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const supplier = suppliers.find(s => s.id === id);
      if (!supplier) return;

      await toggleSupplierFavorite(id, !supplier.isFavorite);
      
      // Update local state
      setSuppliers(prev => {
        const updated = prev.map(s => 
          s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
        );
        // Re-sort the list
        return updated.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return a.name.localeCompare(b.name);
        });
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Erreur lors de la modification des favoris');
    }
  };

  const toggleSupplierSelection = (id: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const getTotalSelectedBalance = () => {
    return suppliers
      .filter(supplier => selectedSuppliers.includes(supplier.id))
      .reduce((sum, supplier) => sum + supplier.balance, 0);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suivi Fournisseur</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez les paiements entre COMAGAL ENERGY et ses fournisseurs
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

      <div className="space-y-6">
        {/* Status Card for Selected Suppliers */}
        {selectedSuppliers.length > 0 && (
          <Card>
            <div className="rounded-lg border-2 border-comagal-blue p-4">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Statut des fournisseurs sélectionnés
              </h2>
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSuppliers.length} fournisseur{selectedSuppliers.length > 1 ? 's' : ''} sélectionné{selectedSuppliers.length > 1 ? 's' : ''}
                </p>
                <p className={`text-2xl font-bold ${
                  getTotalSelectedBalance() < 0 
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {getTotalSelectedBalance().toFixed(2)} DH
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter un fournisseur au suivi
            </h2>

            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Nom du fournisseur"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  error={error}
                  fullWidth
                />
              </div>
              <Button
                variant="primary"
                onClick={handleAddSupplier}
                className="flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Ajouter</span>
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fournisseurs suivis
            </h2>

            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.includes(supplier.id)}
                          onChange={() => toggleSupplierSelection(supplier.id)}
                          className="mt-1.5 h-4 w-4 rounded border-gray-300 text-comagal-blue focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700"
                        />
                        <button
                          onClick={() => handleToggleFavorite(supplier.id)}
                          className={`mt-1 transition-colors ${
                            supplier.isFavorite 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          title={supplier.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Star
                            size={20}
                            fill={supplier.isFavorite ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                      <button
                        onClick={() => handleSupplierSelect(supplier.id)}
                        className="flex-1 text-left hover:text-comagal-blue dark:hover:text-comagal-light-blue"
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {supplier.name}
                        </h3>
                        <p className={`mt-1 text-sm ${
                          supplier.balance < 0 
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-green-500 dark:text-green-400'
                        }`}>
                          Balance: {supplier.balance.toFixed(2)} DH
                        </p>
                        {supplier.lastModification && (
                          <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <p>Dernière modification: {supplier.lastModification}</p>
                            {supplier.lastQuantity && (
                              <p>Dernière quantité: {supplier.lastQuantity}</p>
                            )}
                          </div>
                        )}
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Cliquez pour voir les détails
                        </p>
                      </button>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSupplier(supplier.id);
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}

                {suppliers.length === 0 && (
                  <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                    Aucun fournisseur suivi. Ajoutez-en un pour commencer.
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SupplierTrackingPage;