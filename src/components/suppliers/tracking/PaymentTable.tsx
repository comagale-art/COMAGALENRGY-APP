import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { SupplierPayment } from '../../../types';
import Button from '../../ui/Button';

interface PaymentTableProps {
  payments: SupplierPayment[];
  onDelete: (id: string) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments, onDelete }) => {
  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Aucun paiement enregistré
        </p>
      </div>
    );
  }
  
  // Calculate total
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  
  return (
    <div className="overflow-x-auto rounded-lg border-2 border-red-500">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Montant
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="whitespace-nowrap px-4 py-3">
                <div className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(payment.date), 'dd/MM/yyyy', { locale: fr })}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-900 dark:text-white">
                  {payment.description || '-'}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {payment.amount.toFixed(2)} DH
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(payment.id)}
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
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
              -
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
              {totalAmount.toFixed(2)} DH
            </td>
            <td className="whitespace-nowrap px-4 py-3" />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;