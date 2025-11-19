import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import TransactionTable from './TransactionTable';
import PaymentTable from './PaymentTable';
import AddTransactionModal from './AddTransactionModal';
import AddPaymentModal from './AddPaymentModal';
import { Download, FileImage, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useClientTracking } from '../../../context/ClientTrackingContext';
import { useClients } from '../../../context/ClientContext';
import FloatingActionButton from '../../layout/FloatingActionButton';

const ClientTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const { clients, deleteClient } = useClients();
  const { 
    transactions, 
    payments,
    loading,
    error,
    refreshData,
    deleteTransaction,
    deletePayment 
  } = useClientTracking();
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Handle transaction deletion
  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        await deleteTransaction(transactionId);
        await refreshData();
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
  };

  // Handle payment deletion
  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        await deletePayment(paymentId);
        await refreshData();
      } catch (err) {
        console.error('Error deleting payment:', err);
      }
    }
  };

  // Add handler for client deletion
  const handleDeleteClient = async (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteClient(clientId);
        // If we're on the client's page, navigate back to list
        if (id === clientId) {
          navigate('/client-tracking');
        }
      } catch (err) {
        console.error('Error deleting client:', err);
      }
    }
  };

  // If no client ID is provided, show the client list
  if (!id) {
    return (
      <Layout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suivi Client
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sélectionnez un client pour voir son suivi
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            // Calculate client balance
            const clientTransactions = transactions.filter(t => t.clientId === client.id);
            const clientPayments = payments.filter(p => p.clientId === client.id);
            
            const totalTransactions = clientTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
            const totalPayments = clientPayments.reduce((sum, p) => sum + p.amount, 0);
            const balance = totalTransactions - totalPayments;

            // Get latest payment status
            const latestPayment = clientPayments
              .filter(p => p.paymentMethod !== 'virement')
              .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];

            const daysUntilCollection = latestPayment 
              ? Math.ceil((new Date(latestPayment.collectionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card key={client.id}>
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => navigate(`/client-tracking/${client.id}`)}
                    className="flex flex-1 flex-col space-y-4 text-left"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={client.logo}
                        alt={`Logo ${client.name}`}
                        className="h-16 w-16 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Logo';
                        }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {client.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                        <p className={`text-lg font-semibold ${
                          balance < 0 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {balance.toFixed(2)} DH
                        </p>
                      </div>

                      {daysUntilCollection !== null && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Prochain encaissement
                          </p>
                          <p className={`text-sm font-medium ${
                            daysUntilCollection < 0 
                              ? 'text-green-600 dark:text-green-400'
                              : daysUntilCollection <= 7
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-gray-900 dark:text-white'
                          }`}>
                            {daysUntilCollection < 0 
                              ? 'Encaissé'
                              : `Dans ${daysUntilCollection} jour${daysUntilCollection > 1 ? 's' : ''}`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => handleDeleteClient(client.id, e)}
                    className="ml-4"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <FloatingActionButton 
          to="/clients/new" 
          label="Ajouter un client"
          className="bg-comagal-green hover:bg-comagal-light-green"
        />
      </Layout>
    );
  }

  const client = clients.find(c => c.id === id);
  
  if (!client) {
    return (
      <Layout>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">Client non trouvé</p>
          <button
            onClick={() => navigate('/client-tracking')}
            className="mt-4 text-comagal-blue hover:underline dark:text-comagal-light-blue"
          >
            Retour à la liste des clients
          </button>
        </div>
      </Layout>
    );
  }

  // Calculate balance
  const totalTransactions = transactions
    .filter(t => t.clientId === id)
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const totalPayments = payments
    .filter(p => p.clientId === id)
    .reduce((sum, p) => sum + p.amount, 0);
  
  const balance = totalTransactions - totalPayments;

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Base64 logo image
  const logoBase64 = "data:image/jpeg;base64,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" // (tronqué pour la lisibilité)

  // Dimensions du logo
  const imgWidth = 20;
  const imgHeight = 20;

  // Positionner le logo à gauche
  const marginLeft = 20;
  const marginTop = 10;
  doc.addImage(logoBase64, 'JPEG', marginLeft, marginTop, imgWidth, imgHeight);

  // Positionner le texte COMAGAL ENERGY à droite du logo
   // Add header
    doc.setFontSize(20);
    doc.setTextColor(0, 86, 179); // comagal-blue
    doc.text('COMAGAL ENERGY', pageWidth / 2, 20, { align: 'center' });

  // Add report title and client name
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Suivi Client - ${client.name}`, pageWidth / 2, 35, { align: 'center' });
    
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
         textColor: balance > 0 ? [22, 163, 74] : [220, 38, 38]

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
    
    const transactionData = transactions
      .filter(t => t.clientId === id)
      .map(t => [
        format(new Date(t.date), 'dd/MM/yyyy'),
        t.entryType === 'invoice' ? 'Facture' : 'Quantité',
        t.entryType === 'invoice' 
          ? `N° ${t.invoiceNumber}`
          : `${t.quantity?.toFixed(2)} kg × ${t.pricePerKg?.toFixed(2)} DH/kg`,
        { content: t.totalAmount.toFixed(2) + ' DH', styles: { fontStyle: 'bold' } }
      ]);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Date', 'Type', 'Détails', 'Montant']],
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
    
    const paymentData = payments
      .filter(p => p.clientId === id)
      .map(p => [
        format(new Date(p.paymentDate), 'dd/MM/yyyy'),
        format(new Date(p.collectionDate), 'dd/MM/yyyy'),
        p.paymentMethod === 'virement' ? 'Virement' : p.paymentMethod === 'cheque' ? 'Chèque' : 'Effet',
        { content: p.amount.toFixed(2) + ' DH', styles: { fontStyle: 'bold' } }
      ]);
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Date paiement', 'Date encaissement', 'Moyen', 'Montant']],
      body: paymentData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 86, 179],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    // Save the PDF
    doc.save(`suivi-client-${client.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToPNG = async () => {
    if (!contentRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Create a temporary div for the export content
      const exportDiv = document.createElement('div');
      exportDiv.className = 'bg-white p-8';
      
      // Add title and client name
      const title = document.createElement('h1');
      title.className = 'text-2xl font-bold text-center mb-6 text-comagal-blue';
      title.textContent = `Suivi Client - ${client.name}`;
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
          <p class="text-xl font-bold ${balance < 0 ? 'text-green-600' : 'text-red-600'}">${balance.toFixed(2)} DH</p>
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
      link.download = `suivi-client-${client.name}-${format(new Date(), 'yyyy-MM-dd')}.png`;
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
            Suivi Client - {client.name}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-base">
            Gérez les transactions et paiements du client
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
            <X className="mr-2" size={20} />
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
                  Transactions COMAGAL ENERGY - Client
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
                transactions={transactions.filter(t => t.clientId === id)}
                onDelete={handleDeleteTransaction}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Paiements du Client
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
                payments={payments.filter(p => p.clientId === id)}
                onDelete={handleDeletePayment}
              />
            </div>
          </div>
        </div>
      )}
      
      {showTransactionModal && (
        <AddTransactionModal
          clientId={id}
          onClose={() => setShowTransactionModal(false)}
          onSuccess={() => {
            setShowTransactionModal(false);
            refreshData();
          }}
        />
      )}
      
      {showPaymentModal && (
        <AddPaymentModal
          clientId={id}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            refreshData();
          }}
        />
      )}
    </Layout>
  );
};

export default ClientTrackingPage;