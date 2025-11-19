import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { Barrel } from '../../types';

interface BarrelListProps {
  barrels: Barrel[];
  onDelete: (id: string) => void;
}

const BarrelList: React.FC<BarrelListProps> = ({ barrels, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vendu Complet':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Vendu Quantité':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (barrels.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">Aucun baril enregistré</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">N° Baril</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Produit</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fournisseur</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Quantité</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {barrels.map((barrel, index) => (
            <tr
              key={barrel.id}
              className={`border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {formatDate(barrel.date)}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {barrel.barrelNumber}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {barrel.product}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {barrel.supplier}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {barrel.quantity}
                {barrel.status === 'Vendu Quantité' && barrel.quantitySold && (
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    ({barrel.quantitySold}L vendu)
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(barrel.status)}`}>
                  {barrel.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <div className="flex justify-end space-x-2">
                  <Link
                    to={`/barrels/edit/${barrel.id}`}
                    className="inline-flex items-center rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce baril ?')) {
                        onDelete(barrel.id);
                      }
                    }}
                    className="inline-flex items-center rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BarrelList;
