import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Order } from '../../types';
import Button from '../ui/Button';

interface OrderListProps {
  orders: Order[];
  onDelete: (id: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onDelete }) => {
  const [sortField, setSortField] = useState<keyof Order>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: keyof Order) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const formatLocation = (order: Order) => {
    if (order.cargoPlacement === 'sarije') {
      return `Sarije${order.quantityCm ? ` (${order.quantityCm} cm)` : ''}`;
    }
    if (order.cargoPlacement === 'tank') {
      return `Citerne ${order.tankName}${order.tankQuantity ? ` (${order.tankQuantity} cm)` : ''}`;
    }
    if (order.cargoPlacement === 'both') {
      return (
        <div>
          <div>Sarije ({order.quantityCm} cm)</div>
          <div>Citerne {order.tankName} ({order.tankQuantity} cm)</div>
        </div>
      );
    }
    // For custom locations, just show the location as is
    return order.cargoPlacement;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aucune commande trouvée</p>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => {
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
              onClick={() => handleSort('clientName')}
            >
              <div className="flex items-center space-x-1">
                <span>Client</span>
                {renderSortIcon('clientName')}
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
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Adresse de livraison
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              BL
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
            >
              Emplacement
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
              onClick={() => handleSort('totalPriceInclTax')}
            >
              <div className="flex items-center space-x-1">
                <span>Total TTC</span>
                {renderSortIcon('totalPriceInclTax')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {sortedOrders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {format(parseISO(order.date), 'dd/MM/yyyy', { locale: fr })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {order.time}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.clientName}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {order.product === 'used_oil' ? 'Huile Usage' : 
                   order.product === 'fuel_oil' ? 'Fuel' : 'Huile'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {order.deliveryAddress}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {order.blNumber}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {formatLocation(order)}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {order.quantity.toFixed(2)} kg
                </div>
                <div className="text-sm text-gray-500">
                  {order.pricePerKg.toFixed(2)} DH/kg
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.totalPriceInclTax.toFixed(2)} DH
                </div>
                <div className="text-sm text-gray-500">
                  TVA {(order.vatRate * 100)}%
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => onDelete(order.id)}
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

export default OrderList;