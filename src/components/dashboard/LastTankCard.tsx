import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tank } from '../../types';
import Card from '../ui/Card';

interface LastTankCardProps {
  tank: Tank | null;
}

const LastTankCard: React.FC<LastTankCardProps> = ({ tank }) => {
  if (!tank) {
    return (
      <Card title="Dernière Citerne">
        <p className="text-gray-500 dark:text-gray-400">Aucune citerne enregistrée</p>
      </Card>
    );
  }

  const formattedDate = format(parseISO(tank.date), 'dd MMMM yyyy', { locale: fr });

  return (
    <Card title="Dernière Citerne">
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Nom de la citerne</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{tank.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Type de produit</p>
          <p className="text-base text-gray-800 dark:text-white">{tank.productType}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Date d'opération</p>
          <p className="text-base text-gray-800 dark:text-white">{formattedDate}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tank.time}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quantité</p>
            <p className={`text-xl font-medium ${tank.quantity < 0 ? 'text-red-500' : 'text-comagal-green dark:text-comagal-light-green'}`}>
              {tank.quantity.toFixed(2)} cm
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Opération</p>
            <p className={`text-base font-medium ${tank.isLoading ? 'text-comagal-green' : 'text-red-500'}`}>
              {tank.isLoading ? 'Chargé' : 'Déchargé'}
            </p>
          </div>
        </div>

        {tank.description && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-base text-gray-800 dark:text-white">{tank.description}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LastTankCard;