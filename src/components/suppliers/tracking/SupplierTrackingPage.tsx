import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import TransactionTable from './TransactionTable';
import PaymentTable from './PaymentTable';
import AddTransactionModal from './AddTransactionModal';
import AddPaymentModal from './AddPaymentModal';
import { Download, FileImage, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { 
  getSupplierTransactions, 
  getSupplierPayments,
  deleteSupplierTransaction,
  deleteSupplierPayment,
  getTrackedSuppliers
} from '../../../firebase/services/supplierTracking';
import { SupplierTransaction, SupplierPayment } from '../../../types';

interface SupplierTrackingPageProps {
  onClose?: () => void;
}

const SupplierTrackingPage: React.FC<SupplierTrackingPageProps> = ({ onClose }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [supplierName, setSupplierName] = useState<string>('');
  const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    loadData();
  }, [id]);
  
  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load supplier name
      const suppliers = await getTrackedSuppliers();
      const supplier = suppliers.find(s => s.id === id);
      if (supplier) {
        setSupplierName(supplier.name);
      }
      
      const [fetchedTransactions, fetchedPayments] = await Promise.all([
        getSupplierTransactions(id),
        getSupplierPayments(id)
      ]);
      
      setTransactions(fetchedTransactions);
      setPayments(fetchedPayments);
    } catch (err) {
      console.error('Error loading supplier tracking data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      return;
    }
    
    try {
      setError(null);
      await deleteSupplierTransaction(transactionId);
      await loadData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Erreur lors de la suppression de la transaction');
    }
  };
  
  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      return;
    }
    
    try {
      setError(null);
      await deleteSupplierPayment(paymentId);
      await loadData();
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Erreur lors de la suppression du paiement');
    }
  };
  
  // Calculate totals
  const totalTransactions = transactions.reduce((sum, t) => 
    sum + (t.service ? (t.price || 0) : (t.totalPrice || 0)), 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalTransactions - totalPayments;

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(0, 86, 179); // comagal-blue
    doc.text('COMAGAL ENERGY', pageWidth / 2, 20, { align: 'center' });
    
    // Add report title and supplier name
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Suivi Fournisseur - ${supplierName}`, pageWidth / 2, 35, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, pageWidth / 2, 45, { align: 'center' });
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Résumé', 20, 60);
    
    const summaryData = [
      ['Total Transactions', { content: `${totalTransactions.toFixed(2)} DH`, styles: { fontStyle: 'bold' } }],
      ['Total Paiements', { content: `${totalPayments.toFixed(2)} DH`, styles: { fontStyle: 'bold' } }],
      ['Balance', { 
        content: `${balance.toFixed(2)} DH`, 
        styles: { 
          fontStyle: 'bold',
          textColor: balance < 0 ? [220, 38, 38] : [22, 163, 74]
        } 
      }]
    ];
    
    (doc as any).autoTable({
      startY: 65,
      head: [['Description', 'Montant']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 86, 179],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    // Add transactions table
    doc.setFontSize(14);
    doc.text('Transactions', 20, (doc as any).lastAutoTable.finalY + 20);
    
    const transactionData = transactions.map(t => [
      format(new Date(t.date), 'dd/MM/yyyy'),
      t.service ? 'Service' : t.quantityType?.toUpperCase(),
      t.service ? t.service : `${t.quantity?.toFixed(2)} ${t.quantityType}`,
      t.service ? `${t.price?.toFixed(2)} DH` : `${t.pricePerKg?.toFixed(2)} DH/kg`,
      { 
        content: (t.service ? t.price : t.totalPrice)?.toFixed(2) + ' DH',
        styles: { fontStyle: 'bold' }
      }
    ]);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Date', 'Type', 'Quantité/Service', 'Prix', 'Total']],
      body: transactionData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 86, 179],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    // Add payments table
    doc.setFontSize(14);
    doc.text('Paiements', 20, (doc as any).lastAutoTable.finalY + 20);
    
    const paymentData = payments.map(p => [
      format(new Date(p.date), 'dd/MM/yyyy'),
      p.description || '-',
      { content: p.amount.toFixed(2) + ' DH', styles: { fontStyle: 'bold' } }
    ]);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Date', 'Description', 'Montant']],
      body: paymentData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 86, 179],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    // Save the PDF
    doc.save(`suivi-fournisseur-${supplierName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToPNG = async () => {
    if (!contentRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Create a temporary div for the export content
      const exportDiv = document.createElement('div');
      exportDiv.className = 'bg-white p-8';
      
      // Add title and supplier name
      const title = document.createElement('h1');
      title.className = 'text-2xl font-bold text-center mb-6 text-comagal-blue';
      title.textContent = `Suivi Fournisseur - ${supplierName}`;
      exportDiv.appendChild(title);
      
      // Add summary section
      const summary = document.createElement('div');
      summary.className = 'mb-8 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg';
      summary.innerHTML = `
        <div>
          <h3 class="text-sm font-medium text-gray-600">Total Transactions</h3>
          <p class="text-xl font-bold text-gray-900">${totalTransactions.toFixed(2)} DH</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-600">Total Paiements</h3>
          <p class="text-xl font-bold text-gray-900">${totalPayments.toFixed(2)} DH</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-600">Balance</h3>
          <p class="text-xl font-bold ${balance < 0 ? 'text-red-600' : 'text-green-600'}">${balance.toFixed(2)} DH</p>
        </div>
      `;
      exportDiv.appendChild(summary);
      
      // Clone the tables
      const tables = contentRef.current.cloneNode(true) as HTMLElement;
      exportDiv.appendChild(tables);
      
      // Temporarily add to document
      document.body.appendChild(exportDiv);
      
      // Create canvas
      const canvas = await html2canvas(exportDiv, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(exportDiv);
      
      // Download PNG
      const link = document.createElement('a');
      link.download = `suivi-fournisseur-${supplierName}-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error exporting to PNG:', err);
      setError('Erreur lors de l\'export en PNG');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
            Suivi Fournisseur - {supplierName}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-base">
            Gérez les transactions et paiements du fournisseur
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={exportToPDF}
            className="flex items-center space-x-1 px-2 py-1 text-xs sm:space-x-2 sm:px-3 sm:py-2 sm:text-base"
          >
            <Download size={16} className="sm:size-5" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={exportToPNG}
            className="flex items-center space-x-1 px-2 py-1 text-xs sm:space-x-2 sm:px-3 sm:py-2 sm:text-base"
            disabled={isExporting}
          >
            <FileImage size={16} className="sm:size-5" />
            <span className="hidden sm:inline">{isExporting ? 'Export...' : 'PNG'}</span>
          </Button>
        </div>
      </div>
      
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}
      
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Card with smaller text on mobile */}
          <Card>
            <div className="grid grid-cols-3 gap-1 sm:gap-6">
              <div>
                <h3 className="mb-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400 sm:mb-2 sm:text-sm">
                  Total Transactions
                </h3>
                <p className="text-sm font-bold text-gray-900 dark:text-white sm:text-xl">
                  {totalTransactions.toFixed(2)} DH
                </p>
              </div>
              
              <div>
                <h3 className="mb-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400 sm:mb-2 sm:text-sm">
                  Total Paiements
                </h3>
                <p className="text-sm font-bold text-gray-900 dark:text-white sm:text-xl">
                  {totalPayments.toFixed(2)} DH
                </p>
              </div>
              
              <div>
                <h3 className="mb-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400 sm:mb-2 sm:text-sm">
                  Balance
                </h3>
                <p className={`text-sm font-bold sm:text-xl ${
                  balance < 0 
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {balance.toFixed(2)} DH
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2" ref={contentRef}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Transactions Fournisseur
                </h2>
                <Button
                  variant="danger"
                  onClick={() => setShowTransactionModal(true)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs sm:space-x-2 sm:px-3 sm:py-2 sm:text-base"
                >
                  Ajouter Transaction
                </Button>
              </div>
              <TransactionTable
                transactions={transactions}
                onDelete={handleDeleteTransaction}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Paiements COMAGAL ENERGY
                </h2>
                <Button
                  variant="primary"
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs sm:space-x-2 sm:px-3 sm:py-2 sm:text-base"
                >
                  Ajouter Paiement
                </Button>
              </div>
              <PaymentTable
                payments={payments}
                onDelete={handleDeletePayment}
              />
            </div>
          </div>
        </div>
      )}
      
      {showTransactionModal && (
        <AddTransactionModal
          supplierId={id!}
          onClose={() => setShowTransactionModal(false)}
          onSuccess={() => {
            setShowTransactionModal(false);
            loadData();
          }}
        />
      )}
      
      {showPaymentModal && (
        <AddPaymentModal
          supplierId={id!}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            loadData();
          }}
        />
      )}
    </Layout>
  );
};

export default SupplierTrackingPage;