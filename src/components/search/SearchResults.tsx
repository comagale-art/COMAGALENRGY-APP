import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Supplier } from '../../types';
import SupplierList from '../suppliers/SupplierList';
import BigSupplierList from '../orders/BigSupplierList';
import OrderList from '../orders/OrderList';
import TankList from '../tanks/TankList';
import InvoiceList from '../invoices/InvoiceList';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SearchResultsProps {
  results: any[];
  onDelete: (id: string) => void;
  searchParams: {
    query: string;
    startDate: string;
    endDate: string;
    searchType: string;
  };
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onDelete, searchParams }) => {
  const { query, startDate, endDate, searchType } = searchParams;
  const hasFilters = query || startDate || endDate;

  // Calculate totals based on search type
  const getTotals = () => {
    switch (searchType) {
      case 'orders':
        return results.reduce((acc, order) => ({
          quantity: acc.quantity + order.quantity,
          price: acc.price + order.totalPriceInclTax
        }), { quantity: 0, price: 0 });
      case 'bigSuppliers':
        return results.reduce((acc, supplier) => ({
          quantity: acc.quantity + supplier.quantity,
          price: acc.price + supplier.totalPrice
        }), { quantity: 0, price: 0 });
      case 'invoices':
        return results.reduce((acc, invoice) => {
          const totalQuantity = invoice.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
          return {
            quantity: acc.quantity + totalQuantity,
            price: acc.price + invoice.totalAmount
          };
        }, { quantity: 0, price: 0 });
      default:
        return null;
    }
  };

  const totals = getTotals();

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'suppliers':
        return 'fournisseurs';
      case 'bigSuppliers':
        return 'grands fournisseurs';
      case 'orders':
        return 'commandes';
      case 'tanks':
        return 'citernes';
      case 'invoices':
        return 'factures';
      default:
        return 'résultats';
    }
  };

  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    switch (searchType) {
      case 'suppliers':
        headers = ['Fournisseur', 'Date de livraison', 'Quantité (cm)', 'Barils', 'Quantité (kg)'];
        rows = results.map(supplier => [
          supplier.name,
          supplier.deliveryDate,
          supplier.quantity.toFixed(2),
          supplier.barrels.toFixed(2),
          supplier.kgQuantity.toFixed(2)
        ]);
        break;
      case 'bigSuppliers':
        headers = ['Fournisseur', 'Date', 'Produit', 'Quantité (kg)', 'Prix/kg', 'Total'];
        rows = results.map(supplier => [
          supplier.supplierName,
          supplier.date,
          supplier.product,
          supplier.quantity.toFixed(2),
          supplier.pricePerKg.toFixed(2),
          supplier.totalPrice.toFixed(2)
        ]);
        if (totals) {
          rows.push(['TOTAL', '', '', totals.quantity.toFixed(2), '', totals.price.toFixed(2)]);
        }
        break;
      case 'orders':
        headers = ['Client', 'Date', 'Produit', 'Quantité', 'Total TTC'];
        rows = results.map(order => [
          order.clientName,
          order.date,
          order.product,
          order.quantity.toFixed(2),
          order.totalPriceInclTax.toFixed(2)
        ]);
        if (totals) {
          rows.push(['TOTAL', '', '', totals.quantity.toFixed(2), totals.price.toFixed(2)]);
        }
        break;
      case 'tanks':
        headers = ['Citerne', 'Date', 'Produit', 'Quantité', 'Opération'];
        rows = results.map(tank => [
          tank.name,
          tank.date,
          tank.productType,
          tank.quantity.toFixed(2),
          tank.isLoading ? 'Chargé' : 'Déchargé'
        ]);
        break;
      case 'invoices':
        headers = ['N° Facture', 'Date', 'Client', 'Produits', 'Quantité totale (kg)', 'Total TTC'];
        rows = results.map(invoice => {
          const totalQuantity = invoice.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
          const productNames = invoice.products?.map(p => 
            p.product === 'huile_usage' ? 'Huile Usage' :
            p.product === 'fuel_oil' ? 'Fuel Oil' :
            p.product === 'gasoil' ? 'Gasoil' : 'Kodrone'
          ).join(', ') || '';
          return [
            invoice.invoiceNumber,
            invoice.date,
            invoice.clientName,
            productNames,
            totalQuantity.toFixed(3),
            invoice.totalAmount.toFixed(2)
          ];
        });
        if (totals) {
          rows.push(['TOTAL', '', '', '', totals.quantity.toFixed(3), totals.price.toFixed(2)]);
        }
        break;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `export-${searchType}-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(0, 86, 179); // comagal-blue
    doc.text('SARIJE COMAGAL ENERGY', pageWidth / 2, 20, { align: 'center' });

    // Add report title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rapport des ${getSearchTypeLabel()}`, pageWidth / 2, 35, { align: 'center' });

    // Add date range if specified
    if (startDate || endDate) {
      doc.setFontSize(12);
      let dateText = 'Période : ';
      if (startDate && endDate) {
        dateText += `du ${format(parseISO(startDate), 'dd MMMM yyyy', { locale: fr })} au ${format(parseISO(endDate), 'dd MMMM yyyy', { locale: fr })}`;
      } else if (startDate) {
        dateText += `à partir du ${format(parseISO(startDate), 'dd MMMM yyyy', { locale: fr })}`;
      } else {
        dateText += `jusqu'au ${format(parseISO(endDate), 'dd MMMM yyyy', { locale: fr })}`;
      }
      doc.text(dateText, pageWidth / 2, 45, { align: 'center' });
    }

    // Add search query if specified
    if (query) {
      doc.setFontSize(12);
      doc.text(`Recherche : "${query}"`, pageWidth / 2, 55, { align: 'center' });
    }

    // Add table based on search type
    let tableData: any[][] = [];
    let headers: string[] = [];

    switch (searchType) {
      case 'suppliers':
        headers = ['Fournisseur', 'Date', 'Quantité (cm)', 'Barils', 'Kg'];
        tableData = results.map(supplier => [
          supplier.name,
          format(parseISO(supplier.deliveryDate), 'dd/MM/yyyy'),
          supplier.quantity.toFixed(2),
          supplier.barrels.toFixed(2),
          supplier.kgQuantity.toFixed(2)
        ]);
        break;
      case 'bigSuppliers':
        headers = ['Fournisseur', 'Date', 'Produit', 'Quantité (kg)', 'Prix/kg', 'Total'];
        tableData = results.map(supplier => [
          supplier.supplierName,
          format(parseISO(supplier.date), 'dd/MM/yyyy'),
          supplier.product,
          supplier.quantity.toFixed(2),
          supplier.pricePerKg.toFixed(2),
          supplier.totalPrice.toFixed(2)
        ]);
        if (totals) {
          tableData.push(['TOTAL', '', '', totals.quantity.toFixed(2), '', totals.price.toFixed(2)]);
        }
        break;
      case 'orders':
        headers = ['Client', 'Date', 'Produit', 'Quantité', 'Total TTC'];
        tableData = results.map(order => [
          order.clientName,
          format(parseISO(order.date), 'dd/MM/yyyy'),
          order.product,
          order.quantity.toFixed(2),
          order.totalPriceInclTax.toFixed(2)
        ]);
        if (totals) {
          tableData.push(['TOTAL', '', '', totals.quantity.toFixed(2), totals.price.toFixed(2)]);
        }
        break;
      case 'tanks':
        headers = ['Citerne', 'Date', 'Produit', 'Quantité', 'Opération'];
        tableData = results.map(tank => [
          tank.name,
          format(parseISO(tank.date), 'dd/MM/yyyy'),
          tank.productType,
          tank.quantity.toFixed(2),
          tank.isLoading ? 'Chargé' : 'Déchargé'
        ]);
        break;
      case 'invoices':
        headers = ['N° Facture', 'Date', 'Client', 'Produits', 'Quantité (kg)', 'Total TTC'];
        tableData = results.map(invoice => {
          const totalQuantity = invoice.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
          const productNames = invoice.products?.map(p => 
            p.product === 'huile_usage' ? 'Huile Usage' :
            p.product === 'fuel_oil' ? 'Fuel Oil' :
            p.product === 'gasoil' ? 'Gasoil' : 'Kodrone'
          ).join(', ') || '';
          return [
            invoice.invoiceNumber,
            format(parseISO(invoice.date), 'dd/MM/yyyy'),
            invoice.clientName,
            productNames,
            totalQuantity.toFixed(3),
            invoice.totalAmount.toFixed(2)
          ];
        });
        if (totals) {
          tableData.push(['TOTAL', '', '', '', totals.quantity.toFixed(3), totals.price.toFixed(2)]);
        }
        break;
    }

    (doc as any).autoTable({
      startY: (startDate || endDate || query) ? 65 : 45,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 86, 179],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      }
    });

    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const date = new Date().toISOString().split('T')[0];
    doc.save(`rapport-${searchType}-${date}.pdf`);
  };

  const renderResults = () => {
    switch (searchType) {
      case 'suppliers':
        return <SupplierList suppliers={results} onDelete={onDelete} />;
      case 'bigSuppliers':
        return <BigSupplierList suppliers={results} onDelete={onDelete} />;
      case 'orders':
        return <OrderList orders={results} onDelete={onDelete} />;
      case 'tanks':
        return <TankList tanks={results} onDelete={onDelete} />;
      case 'invoices':
        return <InvoiceList invoices={results} onDelete={onDelete} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Résultats de recherche
          </h3>
          {hasFilters && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {results.length} {getSearchTypeLabel()}{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}
              {query && ` pour "${query}"`}
              {startDate && endDate && ` entre ${startDate} et ${endDate}`}
              {startDate && !endDate && ` à partir du ${startDate}`}
              {!startDate && endDate && ` jusqu'au ${endDate}`}
            </p>
          )}
        </div>

        {results.length > 0 && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download size={16} className="mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={generatePDF}>
              <FileText size={16} className="mr-2" />
              PDF
            </Button>
          </div>
        )}
      </div>

      {/* Show totals for orders and big suppliers */}
      {totals && (
        <Card className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Quantité totale</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {totals.quantity.toFixed(2)} kg
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchType === 'orders' ? 'Total TTC' : 'Prix total'}
              </p>
              <p className="text-xl font-semibold text-comagal-green dark:text-comagal-light-green">
                {totals.price.toFixed(2)} DH
              </p>
            </div>
          </div>
        </Card>
      )}

      {renderResults()}
    </div>
  );
};

export default SearchResults;