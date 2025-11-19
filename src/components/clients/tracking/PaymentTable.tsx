import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import type { ClientPayment } from '../../../types';

interface PaymentTableProps {
  payments: ClientPayment[];
  onDelete: (id: string) => void;
}

const getCollectionStatus = (payment: ClientPayment) => {
  if (payment.paymentMethod === 'virement') return null;

  const collectionDate = new Date(payment.collectionDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  collectionDate.setHours(0, 0, 0, 0);

  if (collectionDate < today) {
    return {
      label: 'Encaissé',
      className: 'text-green-600 font-medium dark:text-green-400'
    };
  }

  const daysUntilCollection = Math.ceil(
    (collectionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilCollection <= 7) {
    return {
      label: `Dans ${daysUntilCollection} jour${daysUntilCollection > 1 ? 's' : ''}`,
      className: 'text-yellow-600 dark:text-yellow-400'
    };
  } else {
    return {
      label: `Dans ${daysUntilCollection} jours`,
      className: 'text-gray-600 dark:text-gray-400'
    };
  }
};

const CollectionStatus: React.FC<{ payment: ClientPayment }> = ({ payment }) => {
  const status = getCollectionStatus(payment);
  if (!status) return null;
  
  return (
    <span className={status.className}>
      {status.label}
    </span>
  );
};

const PaymentTable: React.FC<PaymentTableProps> = ({ payments, onDelete }) => {
  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Aucun paiement</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-6 sm:py-3">
              Date paiement
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-6 sm:py-3">
              Date encaissement
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-6 sm:py-3">
              Moyen
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-6 sm:py-3">
              Montant
            </th>
             <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-6 sm:py-3">
              Description 
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-6 sm:py-3">
              Statut
            </th>
            
            <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-6 sm:py-3">
              Actions
            </th>


            
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white text-sm dark:divide-gray-700 dark:bg-gray-800">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="whitespace-nowrap px-3 py-2 text-gray-900 dark:text-white sm:px-6 sm:py-4">
                {format(new Date(payment.paymentDate), 'dd/MM/yyyy', { locale: fr })}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-900 dark:text-white sm:px-6 sm:py-4">
                {format(new Date(payment.collectionDate), 'dd/MM/yyyy', { locale: fr })}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-gray-900 dark:text-white sm:px-6 sm:py-4">
                {payment.paymentMethod === 'virement' ? 'Virement' : payment.paymentMethod === 'cheque' ? 'Chèque' : 'Effet'}
              </td>
              
              <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white sm:px-6 sm:py-4">
                {payment.amount.toFixed(2)} DH
              </td>

                 <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white sm:px-6 sm:py-4">
               Facture N : {payment.description}
              </td>
              
              <td className="whitespace-nowrap px-3 py-2 sm:px-6 sm:py-4">
                <CollectionStatus payment={payment} />
              </td>

            

              
              <td className="whitespace-nowrap px-3 py-2 text-right sm:px-6 sm:py-4">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(payment.id)}
                  className="inline-flex items-center"
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

export default PaymentTable;