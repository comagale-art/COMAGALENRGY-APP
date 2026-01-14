import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, ShoppingCart, Plus } from 'lucide-react';
import { Order } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import OrderList from './OrderList';

interface OrderYearBlocksProps {
  orders: Order[];
  onDelete: (id: string) => void;
  onAddOrder: () => void;
}

interface YearData {
  year: number;
  orders: Order[];
  totalQuantity: number;
  totalAmount: number;
  count: number;
}

const OrderYearBlocks: React.FC<OrderYearBlocksProps> = ({
  orders,
  onDelete,
  onAddOrder
}) => {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([new Date().getFullYear()]));

  const yearData: YearData[] = React.useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
      const year = new Date(order.date).getFullYear();

      if (!acc[year]) {
        acc[year] = {
          year,
          orders: [],
          totalQuantity: 0,
          totalAmount: 0,
          count: 0
        };
      }

      acc[year].orders.push(order);
      acc[year].count++;
      acc[year].totalAmount += order.totalPriceInclTax || 0;
      acc[year].totalQuantity += order.quantity || 0;

      return acc;
    }, {} as Record<number, YearData>);

    return Object.values(grouped).sort((a, b) => b.year - a.year);
  }, [orders]);

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  if (yearData.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune commande
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Commencez par ajouter votre première commande client
          </p>
          <Button variant="primary" onClick={onAddOrder}>
            <Plus size={20} className="mr-2" />
            Ajouter une commande
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {yearData.map((data) => (
        <Card key={data.year}>
          <div
            className="cursor-pointer"
            onClick={() => toggleYear(data.year)}
          >
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-comagal-blue dark:text-comagal-light-blue">
                  {expandedYears.has(data.year) ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Commandes {data.year}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.count} commande{data.count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-right">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Quantité totale
                  </p>
                  <p className="text-lg font-bold text-comagal-green dark:text-comagal-light-green">
                    {data.totalQuantity.toFixed(2)} kg
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total TTC
                  </p>
                  <p className="text-xl font-bold text-comagal-blue dark:text-comagal-light-blue">
                    {data.totalAmount.toFixed(2)} DH
                  </p>
                </div>
              </div>
            </div>
          </div>

          {expandedYears.has(data.year) && (
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Détail des commandes {data.year}
                </h3>

                {data.year === new Date().getFullYear() && (
                  <Button
                    variant="primary"
                    onClick={onAddOrder}
                    className="flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Nouvelle commande</span>
                  </Button>
                )}
              </div>

              <OrderList
                orders={data.orders}
                onDelete={onDelete}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default OrderYearBlocks;
