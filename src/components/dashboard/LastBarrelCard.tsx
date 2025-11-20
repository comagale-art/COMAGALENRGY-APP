import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Barrel } from '../../types';
import Card from '../ui/Card';

interface LastBarrelCardProps {
  barrel: Barrel | null;
}

const LastBarrelCard: React.FC<LastBarrelCardProps> = ({ barrel }) => {
  if (!barrel) {
    return (
      <Card title="Dernier Baril Ajouté">
        <p className="text-gray-500 dark:text-gray-400">Aucun baril enregistré</p>
      </Card>
    );
  }

  const formattedDate = format(parseISO(barrel.date), 'dd MMMM yyyy', { locale: fr });

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

  return (
    <Card title="Dernier Baril Ajouté">
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Numéro de baril</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{barrel.barrelNumber}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Produit</p>
          <p className="text-base text-gray-800 dark:text-white">{barrel.product}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fournisseur</p>
          <p className="text-base text-gray-800 dark:text-white">{barrel.supplier}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Date d'ajout</p>
          <p className="text-base text-gray-800 dark:text-white">{formattedDate}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quantité</p>
            <p className="text-xl font-medium text-gray-800 dark:text-white">
              {barrel.quantity}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(barrel.status)}`}>
              {barrel.status}
            </span>
          </div>
        </div>

        {barrel.status === 'Vendu Quantité' && barrel.quantitySold && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quantité vendue</p>
            <p className="text-base text-gray-800 dark:text-white">{barrel.quantitySold}L</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LastBarrelCard;
