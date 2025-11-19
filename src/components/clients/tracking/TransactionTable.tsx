import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { ClientTransaction } from '../../../types';
import Button from '../../ui/Button';

interface TransactionTableProps {
  transactions: ClientTransaction[];
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

  const total = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

  return (
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
              Détails
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Montant
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
                  {transaction.entryType === 'invoice' ? 'Facture' : 'Quantité'}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-900 dark:text-white">
                  {transaction.entryType === 'invoice' ? (
                    <>N° {transaction.invoiceNumber}</>
                  ) : (
                    <>
                      {transaction.quantity?.toFixed(2)} kg × {transaction.pricePerKg?.toFixed(2)} DH/kg
                    </>
                  )}
                </div>
                {transaction.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.description}
                  </div>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {transaction.totalAmount.toFixed(2)} DH
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
          
          {/* Total row */}
          <tr className="bg-gray-50 font-medium dark:bg-gray-700">
            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
              TOTAL
            </td>
            <td className="px-4 py-3" />
            <td className="px-4 py-3" />
            <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
              {total.toFixed(2)} DH
            </td>
            <td className="px-4 py-3" />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;