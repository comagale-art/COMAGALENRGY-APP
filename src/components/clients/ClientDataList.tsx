import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ClientData } from '../../types';
import Button from '../ui/Button';

interface ClientDataListProps {
  clientData: ClientData[];
  onDelete: (id: string) => void;
}

const ClientDataList: React.FC<ClientDataListProps> = ({ clientData, onDelete }) => {
  const [sortField, setSortField] = useState<keyof ClientData>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof ClientData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: keyof ClientData) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  if (!clientData || clientData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aucun client trouvé</p>
        <Link to="/client-data/new" className="mt-4 inline-block text-comagal-blue hover:underline dark:text-comagal-light-blue">
          Ajouter un client
        </Link>
      </div>
    );
  }

  const sortedClientData = [...clientData].sort((a, b) => {
    if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
      const valueA = String(a[sortField]).toLowerCase();
      const valueB = String(b[sortField]).toLowerCase();
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    return 0;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center space-x-1">
                <span>Nom du client</span>
                {renderSortIcon('name')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Adresse
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('ice')}
            >
              <div className="flex items-center space-x-1">
                <span>ICE</span>
                {renderSortIcon('ice')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center space-x-1">
                <span>Date d'ajout</span>
                {renderSortIcon('createdAt')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {sortedClientData.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {client.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {client.address}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {client.ice}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {format(parseISO(client.createdAt), 'dd/MM/yyyy', { locale: fr })}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => onDelete(client.id)}
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

export default ClientDataList;