import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Tank } from '../../types';
import Button from '../../components/ui/Button';

interface TankListProps {
  tanks: Tank[];
  onDelete: (id: string) => void;
}

const TankList: React.FC<TankListProps> = ({ tanks, onDelete }) => {
  const [sortField, setSortField] = useState<keyof Tank>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: keyof Tank) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const renderSortIcon = (field: keyof Tank) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };
  
  if (!tanks || tanks.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aucune citerne trouvée</p>
        <Link to="/tanks/new" className="mt-4 inline-block text-comagal-blue hover:underline dark:text-comagal-light-blue">
          Ajouter une citerne
        </Link>
      </div>
    );
  }
  
  const sortedTanks = [...tanks].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(`${a[sortField]} ${a.time}`).getTime();
      const dateB = new Date(`${b[sortField]} ${b.time}`).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (typeof a[sortField] === 'number' && typeof b[sortField] === 'number') {
      return sortDirection === 'asc'
        ? (a[sortField] as number) - (b[sortField] as number)
        : (b[sortField] as number) - (a[sortField] as number);
    }
    
    const valueA = String(a[sortField]).toLowerCase();
    const valueB = String(b[sortField]).toLowerCase();
    return sortDirection === 'asc'
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });
  
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center space-x-1">
                <span>Date</span>
                {renderSortIcon('date')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center space-x-1">
                <span>Nom de la citerne</span>
                {renderSortIcon('name')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('productType')}
            >
              <div className="flex items-center space-x-1">
                <span>Type de produit</span>
                {renderSortIcon('productType')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('quantity')}
            >
              <div className="flex items-center space-x-1">
                <span>Quantité (cm)</span>
                {renderSortIcon('quantity')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Opération
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {sortedTanks.map((tank) => (
            <tr key={tank.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(tank.date), 'dd/MM/yyyy', { locale: fr })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {tank.time}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{tank.name}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">{tank.productType}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className={`text-sm ${tank.quantity < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                  {tank.quantity.toFixed(2)}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className={`text-sm ${tank.isLoading ? 'text-comagal-green' : 'text-red-500'}`}>
                  {tank.isLoading ? 'Chargé' : 'Déchargé'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {tank.description || '-'}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => onDelete(tank.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TankList;