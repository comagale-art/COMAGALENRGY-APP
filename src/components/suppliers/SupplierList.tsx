import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Supplier } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../ui/Card';

interface SupplierListProps {
  suppliers: Supplier[];
  onDelete: (id: string) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onDelete }) => {
  const [sortField, setSortField] = useState<keyof Supplier>('deliveryDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const renderSortIcon = (field: keyof Supplier) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };
  
  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aucun fournisseur trouvé</p>
        <Link to="/suppliers/new" className="mt-4 inline-block text-comagal-blue hover:underline dark:text-comagal-light-blue">
          Ajouter un fournisseur
        </Link>
      </div>
    );
  }

  // Get the latest stock level
  const currentStockLevel = suppliers.length > 0 
    ? suppliers[suppliers.length - 1].stockLevel 
    : 0;
  
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (sortField === 'deliveryDate') {
      const dateA = new Date(`${a[sortField]} ${a.deliveryTime}`).getTime();
      const dateB = new Date(`${b[sortField]} ${b.deliveryTime}`).getTime();
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
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Niveau de Stock SARIJE
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Niveau actuel basé sur les livraisons
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-comagal-green dark:text-comagal-light-green">
              {currentStockLevel.toFixed(2)} cm
            </p>
          </div>
        </div>
      </Card>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                onClick={() => handleSort('deliveryDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {renderSortIcon('deliveryDate')}
                </div>
              </th>
              <th 
                scope="col" 
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Fournisseur</span>
                  {renderSortIcon('name')}
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
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                onClick={() => handleSort('barrels')}
              >
                <div className="flex items-center space-x-1">
                  <span>Barils</span>
                  {renderSortIcon('barrels')}
                </div>
              </th>
              <th 
                scope="col" 
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                onClick={() => handleSort('kgQuantity')}
              >
                <div className="flex items-center space-x-1">
                  <span>Kg</span>
                  {renderSortIcon('kgQuantity')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {sortedSuppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {format(parseISO(supplier.deliveryDate), 'dd/MM/yyyy', { locale: fr })}
                    <span className="ml-2 text-gray-400">-</span>
                    <span className="ml-2">{supplier.deliveryTime}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{supplier.name}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className={`text-sm ${supplier.quantity < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {supplier.quantity?.toFixed(2) || '0.00'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {supplier.barrels?.toFixed(2) || '0.00'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {supplier.kgQuantity?.toFixed(2) || '0.00'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => onDelete(supplier.id)}
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
    </div>
  );
};

export default SupplierList;