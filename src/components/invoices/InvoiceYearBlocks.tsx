import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, ChevronRight, FileText, Plus } from 'lucide-react';
import { Invoice } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InvoiceList from './InvoiceList';

interface InvoiceYearBlocksProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  onAddInvoice: () => void;
}

interface YearData {
  year: number;
  invoices: Invoice[];
  totalQuantity: number;
  totalAmount: number;
  count: number;
}

const InvoiceYearBlocks: React.FC<InvoiceYearBlocksProps> = ({ 
  invoices, 
  onDelete, 
  onAddInvoice 
}) => {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([new Date().getFullYear()]));

  // Group invoices by year
  const yearData: YearData[] = React.useMemo(() => {
    const grouped = invoices.reduce((acc, invoice) => {
      const year = new Date(invoice.date).getFullYear();
      
      if (!acc[year]) {
        acc[year] = {
          year,
          invoices: [],
          totalQuantity: 0,
          totalAmount: 0,
          count: 0
        };
      }
      
      acc[year].invoices.push(invoice);
      acc[year].count++;
      acc[year].totalAmount += invoice.totalAmount;
      
      // Calculate total quantity from all products
      const invoiceQuantity = invoice.products?.reduce((sum, product) => sum + product.quantity, 0) || 0;
      acc[year].totalQuantity += invoiceQuantity;
      
      return acc;
    }, {} as Record<number, YearData>);

    // Convert to array and sort by year (most recent first)
    return Object.values(grouped).sort((a, b) => b.year - a.year);
  }, [invoices]);

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const formatQuantity = (quantity: number): string => {
    return quantity.toFixed(3);
  };

  const formatAmount = (amount: number): string => {
    return amount.toFixed(2);
  };

  if (yearData.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune facture
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Commencez par créer votre première facture
          </p>
          <Button variant="primary" onClick={onAddInvoice}>
            <Plus size={20} className="mr-2" />
            Créer une facture
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
                    Factures {data.year}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.count} facture{data.count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-right">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Quantité totale
                  </p>
                  <p className="text-lg font-bold text-comagal-green dark:text-comagal-light-green">
                    {formatQuantity(data.totalQuantity)} kg
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total TTC
                  </p>
                  <p className="text-xl font-bold text-comagal-blue dark:text-comagal-light-blue">
                    {formatAmount(data.totalAmount)} DH
                  </p>
                </div>
              </div>
            </div>
          </div>

          {expandedYears.has(data.year) && (
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Détail des factures {data.year}
                </h3>
                
                {data.year === new Date().getFullYear() && (
                  <Button
                    variant="primary"
                    onClick={onAddInvoice}
                    className="flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Nouvelle facture</span>
                  </Button>
                )}
              </div>
              
              <InvoiceList 
                invoices={data.invoices} 
                onDelete={onDelete}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default InvoiceYearBlocks;