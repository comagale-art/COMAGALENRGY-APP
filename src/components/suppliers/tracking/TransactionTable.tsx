import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { SupplierTransaction } from '../../../types';
import Button from '../../ui/Button';

interface TransactionTableProps {
  transactions: SupplierTransaction[];
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Aucune transaction enregistrée
      </div>
    );
  }

  // Calculate last modification date and last quantity
  const lastTransaction = transactions[0]; // Transactions are already sorted by date desc
  const lastModificationDate = format(new Date(lastTransaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr });
  const lastQuantity = lastTransaction.service 
    ? `Service: ${lastTransaction.service}`
    : `${lastTransaction.quantity?.toFixed(2)} ${lastTransaction.quantityType}`;
  
  // Calculate totals
  const totals = transactions.reduce(
    (acc, t) => ({
      quantity: acc.quantity + (t.quantity || 0),
      totalPrice: acc.totalPrice + (t.service ? (t.price || 0) : (t.totalPrice || 0))
    }),
    { quantity: 0, totalPrice: 0 }
  );
  
  return (
    <div className="space-y-4">
      {/* Last modification info */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dernière modification</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{lastModificationDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dernière quantité ajoutée</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{lastQuantity}</p>
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="overflow-x-auto rounded-lg border-2 border-comagal-blue">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Quantité/Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Prix
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Prix Total
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {transaction.service ? 'Service' : transaction.quantityType?.toUpperCase()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {transaction.service ? (
                      transaction.service
                    ) : (
                      `${transaction.quantity?.toFixed(2)} ${transaction.quantityType}`
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {transaction.service ? (
                      `${transaction.price?.toFixed(2)} DH`
                    ) : (
                      `${transaction.pricePerKg?.toFixed(2)} DH/kg`
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {(transaction.service ? transaction.price : transaction.totalPrice)?.toFixed(2)} DH
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
            
            {/* Totals row */}
            <tr className="bg-gray-50 font-medium dark:bg-gray-700">
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                TOTAL
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                -
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                {totals.quantity.toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                -
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                {totals.totalPrice.toFixed(2)} DH
              </td>
              <td className="whitespace-nowrap px-4 py-3" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;