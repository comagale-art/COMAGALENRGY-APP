import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X } from 'lucide-react';
import { Supplier } from '../../types';
import Button from '../ui/Button';

interface DayDetailsModalProps {
  date: Date;
  suppliers: Supplier[];
  onClose: () => void;
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ date, suppliers, onClose }) => {
  const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  const totalQuantity = suppliers.reduce((sum, supplier) => sum + supplier.quantity, 0);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {formattedDate}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total des livraisons</p>
          <p className={`text-xl font-bold ${totalQuantity < 0 ? 'text-red-500' : 'text-comagal-green'}`}>
            {totalQuantity.toFixed(2)} cm
          </p>
        </div>
        
        {suppliers.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Aucune livraison pour cette date
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Fournisseur
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Quantité
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Barils
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {supplier.name}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-sm ${supplier.quantity < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                      {supplier.quantity.toFixed(2)} cm
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {supplier.barrels.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DayDetailsModal;