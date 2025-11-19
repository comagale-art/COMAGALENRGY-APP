import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { BigSupplier } from '../../types';
import Button from '../ui/Button';

interface BigSupplierListProps {
  suppliers: BigSupplier[];
  onDelete: (id: string) => void;
}

const BigSupplierList: React.FC<BigSupplierListProps> = ({ suppliers = [], onDelete }) => {
  const [sortField, setSortField] = useState<keyof BigSupplier>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: keyof BigSupplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const renderSortIcon = (field: keyof BigSupplier) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };
  
  if (!Array.isArray(suppliers) || suppliers.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aucun grand fournisseur trouvé</p>
        <Link to="/big-suppliers/new" className="mt-4 inline-block text-comagal-blue hover:underline dark:text-comagal-light-blue">
          Ajouter un grand fournisseur
        </Link>
      </div>
    );
  }
  
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (!a || !b) return 0;
    
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
    
    const valueA = String(a[sortField] || '').toLowerCase();
    const valueB = String(b[sortField] || '').toLowerCase();
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
              onClick={() => handleSort('supplierName')}
            >
              <div className="flex items-center space-x-1">
                <span>Fournisseur</span>
                {renderSortIcon('supplierName')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('product')}
            >
              <div className="flex items-center space-x-1">
                <span>Produit</span>
                {renderSortIcon('product')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('quantity')}
            >
              <div className="flex items-center space-x-1">
                <span>Quantité</span>
                {renderSortIcon('quantity')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('pricePerKg')}
            >
              <div className="flex items-center space-x-1">
                <span>Prix/kg</span>
                {renderSortIcon('pricePerKg')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('totalPrice')}
            >
              <div className="flex items-center space-x-1">
                <span>Total</span>
                {renderSortIcon('totalPrice')}
              </div>
            </th>
            <th 
              scope="col" 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              onClick={() => handleSort('location')}
            >
              <div className="flex items-center space-x-1">
                <span>Emplacement</span>
                {renderSortIcon('location')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {sortedSuppliers.map((supplier) => {
            if (!supplier) return null;
            
            return (
              <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {format(parseISO(supplier.date), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {supplier.time}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.supplierName}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {supplier.product}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {supplier.quantity?.toFixed(2) || '0.00'} kg
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {supplier.pricePerKg?.toFixed(2) || '0.00'} DH
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.totalPrice?.toFixed(2) || '0.00'} DH
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {supplier.location}
                    {supplier.tankName && (
                      <span className="ml-2 text-gray-500">({supplier.tankName})</span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BigSupplierList;