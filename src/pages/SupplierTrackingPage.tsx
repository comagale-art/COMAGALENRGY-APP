import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FolderList from '../components/suppliers/folders/FolderList';
import CreateFolderModal from '../components/suppliers/folders/CreateFolderModal';
import { Plus, AlertCircle, Star, FolderPlus, ArrowLeft } from 'lucide-react';
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
import {
  getSupplierFolders,
  deleteSupplierFolder,
  getSuppliersInFolder,
  getUnassignedSuppliers,
  assignSupplierToFolder,
  SupplierFolder
} from '../firebase/services/supplierFolders';

interface SupplierWithBalance {
  id: string;
  name: string;
  balance: number;
  isFavorite?: boolean;
  folderId?: string;
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

  const [folders, setFolders] = useState<SupplierFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [supplierCounts, setSupplierCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      loadSuppliersInFolder(selectedFolder);
    } else {
      loadUnassignedSuppliers();
    }
  }, [selectedFolder]);

  const calculateSupplierBalance = async (supplierId: string) => {
    try {
      const transactions = await getSupplierTransactions(supplierId);
      const payments = await getSupplierPayments(supplierId);

      const totalTransactions = transactions.reduce((sum, t) =>
        sum + (t.service ? (t.price || 0) : (t.totalPrice || 0)), 0);
      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

      let lastModification = undefined;
      let lastQuantity = undefined;

      if (transactions.length > 0) {
        const lastTransaction = transactions[0];
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [foldersData, allSuppliers] = await Promise.all([
        getSupplierFolders(),
        getTrackedSuppliers()
      ]);

      setFolders(foldersData);

      const counts: Record<string, number> = {};
      for (const folder of foldersData) {
        const suppliersInFolder = allSuppliers.filter(s => s.folderId === folder.id);
        counts[folder.id] = suppliersInFolder.length;
      }
      setSupplierCounts(counts);

      await loadUnassignedSuppliers();
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliersInFolder = async (folderId: string) => {
    try {
      setLoading(true);
      const suppliersData = await getSuppliersInFolder(folderId);

      const suppliersWithInfo = await Promise.all(
        suppliersData.map(async (supplier) => {
          const info = await calculateSupplierBalance(supplier.id);
          return {
            ...supplier,
            balance: info.balance,
            lastModification: info.lastModification,
            lastQuantity: info.lastQuantity
          };
        })
      );

      const sortedSuppliers = suppliersWithInfo.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });

      setSuppliers(sortedSuppliers);
    } catch (err) {
      console.error('Error loading suppliers in folder:', err);
      setError('Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const loadUnassignedSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersData = await getUnassignedSuppliers();

      const suppliersWithInfo = await Promise.all(
        suppliersData.map(async (supplier) => {
          const info = await calculateSupplierBalance(supplier.id);
          return {
            ...supplier,
            balance: info.balance,
            lastModification: info.lastModification,
            lastQuantity: info.lastQuantity
          };
        })
      );

      const sortedSuppliers = suppliersWithInfo.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      });

      setSuppliers(sortedSuppliers);
    } catch (err) {
      console.error('Error loading unassigned suppliers:', err);
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

      if (selectedFolder) {
        await assignSupplierToFolder(id, selectedFolder);
        await loadSuppliersInFolder(selectedFolder);
      } else {
        setSuppliers(prev => [...prev, { id, name: newSupplierName.trim(), balance: 0, isFavorite: false }]);
      }

      setNewSupplierName('');
      await loadData();
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
      await loadData();
    } catch (err) {
      console.error('Error deleting tracked supplier:', err);
      setError('Erreur lors de la suppression du fournisseur');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Les fournisseurs seront déplacés vers "Non assignés".')) {
      return;
    }

    try {
      await deleteSupplierFolder(folderId);
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      await loadData();
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError('Erreur lors de la suppression du dossier');
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

      setSuppliers(prev => {
        const updated = prev.map(s =>
          s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
        );
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

  const handleMoveToFolder = async (supplierId: string, folderId: string | null) => {
    try {
      await assignSupplierToFolder(supplierId, folderId);
      if (selectedFolder) {
        await loadSuppliersInFolder(selectedFolder);
      } else {
        await loadUnassignedSuppliers();
      }
      await loadData();
    } catch (err) {
      console.error('Error moving supplier to folder:', err);
      setError('Erreur lors du déplacement du fournisseur');
    }
  };

  const getTotalSelectedBalance = () => {
    return suppliers
      .filter(supplier => selectedSuppliers.includes(supplier.id))
      .reduce((sum, supplier) => sum + supplier.balance, 0);
  };

  const selectedFolderData = folders.find(f => f.id === selectedFolder);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suivi Fournisseur</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organisez vos fournisseurs par dossiers
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mes Dossiers
              </h2>
              <Button
                variant="primary"
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center space-x-2"
              >
                <FolderPlus size={20} />
                <span>Nouveau Dossier</span>
              </Button>
            </div>

            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
              </div>
            ) : (
              <FolderList
                folders={folders}
                supplierCounts={supplierCounts}
                onSelectFolder={setSelectedFolder}
                onDeleteFolder={handleDeleteFolder}
                selectedFolderId={selectedFolder}
              />
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            {selectedFolder ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFolder(null)}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft size={20} />
                    <span>Retour</span>
                  </Button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Fournisseurs dans "{selectedFolderData?.name}"
                  </h2>
                </div>
              </div>
            ) : (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fournisseurs non assignés
              </h2>
            )}

            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Nom du fournisseur"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
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
                    <div className="flex items-start space-x-3 flex-1">
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
                      <div className="flex-1">
                        <button
                          onClick={() => handleSupplierSelect(supplier.id)}
                          className="w-full text-left hover:text-comagal-blue dark:hover:text-comagal-light-blue"
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
                              <p>Modifié: {supplier.lastModification}</p>
                              {supplier.lastQuantity && (
                                <p>{supplier.lastQuantity}</p>
                              )}
                            </div>
                          )}
                        </button>

                        {folders.length > 0 && (
                          <select
                            value={supplier.folderId || ''}
                            onChange={(e) => handleMoveToFolder(supplier.id, e.target.value || null)}
                            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">Non assigné</option>
                            {folders.map((folder) => (
                              <option key={folder.id} value={folder.id}>
                                {folder.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
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
                    {selectedFolder
                      ? 'Aucun fournisseur dans ce dossier. Assignez-en un depuis "Non assignés".'
                      : 'Aucun fournisseur non assigné.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onSuccess={() => {
            setShowCreateFolderModal(false);
            loadData();
          }}
        />
      )}
    </Layout>
  );
};

export default SupplierTrackingPage;
