import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { Invoice } from '../../types';
import Button from '../ui/Button';
import InvoicePrintModal from './InvoicePrintModal';

interface InvoiceListProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onDelete }) => {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleSortToggle = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handlePrint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintModal(true);
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    const valA = a.invoiceNumber.toString();
    const valB = b.invoiceNumber.toString();
    return sortDirection === 'asc'
      ? valA.localeCompare(valB, 'fr', { numeric: true })
      : valB.localeCompare(valA, 'fr', { numeric: true });
  });

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="cursor-pointer px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
                onClick={handleSortToggle}
              >
                <div className="flex items-center space-x-1">
                  <span>N° Facture</span>
                  {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Date
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Client
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Produit
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Quantité
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Total TTC
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {sortedInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900 dark:text-white">
                  {invoice.invoiceNumber}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {format(parseISO(invoice.date), 'dd/MM/yyyy', { locale: fr })}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {invoice.clientName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ICE: {invoice.clientICE}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white font-bold">
                  {invoice.products?.length > 1 
                    ? `${invoice.products.length} produits`
                    : invoice.products?.[0]?.product === 'huile_usage' ? 'Huile Usage' : 
                      invoice.products?.[0]?.product === 'fuel_oil' ? 'Fuel Oil' :
                      invoice.products?.[0]?.product === 'Transport_Fuel' ? 'Transport Fuel' :
                      invoice.products?.[0]?.product === 'gasoil' ? 'Gasoil' : 'Kodrone'}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {invoice.products?.reduce((sum, p) => sum + p.quantity, 0).toFixed(3)} kg
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoice.products?.length > 1 ? 'Prix variables' : `${invoice.products?.[0]?.productPrice.toFixed(2)} DH/kg`}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900 dark:text-white">
                  {invoice.totalAmount.toFixed(2)} DH
                  <div className="text-sm text-gray-500">
                    TVA {(invoice.vatRate * 100)}%
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(invoice)}>
                      <Printer size={16} />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete(invoice.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPrintModal && selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </>
  );
};

export default InvoiceList;
