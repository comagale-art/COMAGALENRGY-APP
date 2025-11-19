import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Button from '../ui/Button';
import { Invoice } from '../../types';
import jsPDF from 'jspdf';

interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
}

const formatMontant = (value: number): string => {
  return (
    value
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DH'
  );
};

const formatNombre = (value: number): string => {
  return value
    .toFixed(3)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const generatePDFContent = async (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const headerImg = new Image();
    headerImg.src = "https://i.ibb.co/mFhxWx0P/1.png";

    
    const footerImg = new Image();
    footerImg.src = "https://i.ibb.co/N6NJYKcP/2.png";

    const signatureImg = new Image();
    signatureImg.src = "https://i.ibb.co/q3vjM3dF/3.png";

    await new Promise<void>((resolve) => {
      headerImg.onload = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);

        doc.addImage(headerImg, 'PNG', 1, 2, pageWidth, 38);
        doc.setLineWidth(0.1);
        doc.setDrawColor(0, 0, 0);
        doc.rect(2, 2, pageWidth - 5 , 38);

        const verticalRectX = 2;
        const verticalRectY = 40;
        const verticalRectHeight = pageHeight - 40 - 30;
        const verticalRectWidth = 0.1;

        doc.setLineWidth(verticalRectWidth);
        doc.setDrawColor(0, 0, 0);
        doc.rect(verticalRectX, verticalRectY, pageWidth - 5, verticalRectHeight);

        doc.setTextColor(5, 53, 64);
        doc.rect(20, 45, pageWidth - 40, 15);
        doc.text(`Facture N° :`, 25, 55);
        doc.setTextColor(0, 0, 0);
        doc.text(`${invoice.invoiceNumber}`, 60, 55);

        doc.setTextColor(5, 53, 64);
        doc.text(`Date :`, pageWidth / 2 + 10, 55);
        doc.setTextColor(0, 0, 0);
        doc.text(`${format(parseISO(invoice.date), 'dd/MM/yyyy', { locale: fr })}`, pageWidth / 2 + 35, 55);

        const clientBoxWidth = (pageWidth - 100);
        const clientBoxX = (pageWidth - clientBoxWidth) / 2;

        doc.rect(clientBoxX, 65, clientBoxWidth+12, 10);
        doc.setTextColor(5, 53, 64);
        doc.text(` Client :`, clientBoxX + 5, 72);
        doc.setTextColor(0, 0, 0);
        doc.text(`${invoice.clientName}`, clientBoxX + 52, 72, { align: 'center' });
        doc.text(` ${invoice.clientAddress}`, clientBoxX + 82, 72);

        doc.setTextColor(5, 53, 64);
        doc.text(`ICE :`, pageWidth / 2 - 20, 85);
        doc.setTextColor(0, 0, 0);
        doc.text(`${invoice.clientICE}`, pageWidth /2-6, 85);

      
const cellHeight = 10;
const cellPadding = 3;
const colWidths = [40, 45, 45, 40]; // Largeurs des colonnes
const startX = 20;
const tableTop = 100;

doc.setFillColor(220); // gris clair pour l'en-tête
doc.rect(startX, tableTop, pageWidth - 40, cellHeight, 'F');

doc.setDrawColor(200); // gris pour les bordures
doc.setTextColor(5, 53, 64);
doc.setFont(undefined, 'bold'); // Texte de l’en-tête en gras
doc.text("Désignation", startX + colWidths[0] / 2, tableTop + 7, { align: 'center' });
doc.text("Quantité (Tonne)", startX + colWidths[0] + colWidths[1] / 2, tableTop + 7, { align: 'center' });
doc.text("Prix unitaire", startX + colWidths[0] + colWidths[1] + colWidths[2] / 2, tableTop + 7, { align: 'center' });
doc.text("Total", startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2, tableTop + 7, { align: 'center' });

let currentY = tableTop + cellHeight;

invoice.products?.forEach((product) => {
  const designation = product.product === 'fuel_oil' ? 'Fuel Oil' :
                      product.product === 'huile_usage' ? 'Huile Usage' :
                      product.product === 'gasoil' ? 'Gasoil' : 'Kodrone';

  const rowValues = [
    designation,
    formatNombre(product.quantity),
    formatMontant(product.productPrice),
    formatMontant(product.subtotal)
  ];

  doc.setFillColor(255, 255, 255); // fond blanc pour les lignes
  doc.rect(startX, currentY, pageWidth - 40, cellHeight, 'F');

  let cellX = startX;

  rowValues.forEach((text, i) => {
    doc.rect(cellX, currentY, colWidths[i], cellHeight); // bordure cellule
    doc.setFont(undefined, 'bold'); // <-- texte en gras
    doc.setTextColor(0, 0, 0);      // noir
    doc.text(text, cellX + colWidths[i] / 2, currentY + 7, { align: 'center' });
    cellX += colWidths[i];
  });

  currentY += cellHeight;
});







        

        const yTotal = currentY + 15;
        const blocWidth = 80;
        const blocHeight = 40;
        const blocX = pageWidth - blocWidth - 10;
        const blocY = yTotal;
        doc.setLineWidth(0.5);
        doc.setDrawColor(192, 192, 192);
        doc.rect(blocX, blocY, blocWidth, blocHeight);

        doc.setTextColor(5, 53, 64);
        doc.text(`Total HT :`, blocX + 5, blocY + 10);
        doc.setTextColor(0, 0, 0);
        doc.text(formatMontant(invoice.subtotal), blocX + blocWidth - 5, blocY + 10, { align: 'right' });

        doc.setTextColor(5, 53, 64);
        doc.text(`TVA ${invoice.vatRate * 100}% :`, blocX + 5, blocY + 20);
        doc.setTextColor(0, 0, 0);
        doc.text(formatMontant(invoice.vatAmount), blocX + blocWidth - 5, blocY + 20, { align: 'right' });

        doc.setTextColor(5, 53, 64);
        doc.text(`TOTAL TTC :`, blocX + 5, blocY + 30);
        doc.setTextColor(0, 0, 0);
        doc.text(formatMontant(invoice.totalAmount), blocX + blocWidth - 5, blocY + 30, { align: 'right' });

        const amountBoxWidth = 90;
        const amountBoxHeight = 37;
        const amountBoxX = 20;
        const amountBoxY = blocY + 2;

        doc.setLineWidth(0.5);
        doc.setDrawColor(192, 192, 192);
        doc.setTextColor(5, 53, 64);
        doc.rect(amountBoxX, amountBoxY, amountBoxWidth, amountBoxHeight);
        doc.text("Arrêtée la présente facture à la somme de :", amountBoxX + 45, amountBoxY + 7, {
          maxWidth: amountBoxWidth - 6,
          align: 'center',
        });

        doc.setTextColor(0, 0, 0);
        const fullText = invoice.totalAmountInWords;
        const wrappedLines = doc.splitTextToSize(fullText, amountBoxWidth - 10);
        doc.text(`•  ${wrappedLines[0]}`, amountBoxX + 5, amountBoxY + 20);
        for (let i = 1; i < wrappedLines.length; i++) {
          doc.text(wrappedLines[i], amountBoxX + 10, amountBoxY + 20 + i * 7);
        }

        const signatureY = blocY + blocHeight + 20;
        signatureImg.onload = () => {
          doc.addImage(signatureImg, 'PNG', 25, signatureY, 80, 40);
          doc.addImage(footerImg, 'PNG', 0, pageHeight - 30, pageWidth, 30);
          doc.setLineWidth(0.5);
          doc.setDrawColor(0, 0, 0);
          doc.rect(0, pageHeight - 30, pageWidth, 30);
          resolve();
        };

        if (signatureImg.complete) {
          doc.addImage(signatureImg, 'PNG', 25, signatureY, 80, 40);
          doc.addImage(footerImg, 'PNG', 5, pageHeight - 24, pageWidth-10, 17);
          doc.setLineWidth(0.1);
          doc.setDrawColor(0, 0, 0);
          doc.rect(2, pageHeight - 30, pageWidth-5, 28);
          resolve();
        }
      };
    });
  };

  const handlePrint = async () => {
    const doc = new jsPDF();
    await generatePDFContent(doc);
    const blob = doc.output('blob');
    const blobURL = URL.createObjectURL(blob);
    const printWindow = window.open(blobURL);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

const handleDownloadPDF = async () => {
  const doc = new jsPDF();
  await generatePDFContent(doc);

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  const a = document.createElement('a');
  a.href = blobUrl;

  // Ne pas définir `a.download` => déclenche la boîte de dialogue "Enregistrer sous"
  // a.download = 'nom.pdf'; ← NE PAS utiliser cela

  a.target = '_blank'; // utile sur Firefox
  a.rel = 'noopener';
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 100);
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Aperçu de la facture</h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer size={16} className="mr-2" /> Imprimer
            </Button>
            <Button variant="primary" onClick={handleDownloadPDF}>
              <Download size={16} className="mr-2" /> PDF
            </Button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div ref={printRef} className="bg-white p-8 text-black text-[13px]">
            <div className="text-black text-sm font-sans space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-bold text-lg text-[#053540]">Facture N° : {invoice.invoiceNumber}</p>
                  <p className="text-sm">Date : {format(parseISO(invoice.date), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Client :</p>
                  <p>{invoice.clientName}</p>
                  <p>{invoice.clientAddress}</p>
                  <p>ICE : {invoice.clientICE}</p>
                </div>
              </div>

              <table className="w-full table-auto border border-gray-300 text-center text-sm">
                <thead className="bg-gray-200 text-[#053540]">
                  <tr>
                    <th className="border px-2 py-1">Désignation</th>
                    <th className="border px-2 py-1">Quantité (Tonne)</th>
                    <th className="border px-2 py-1">Prix unitaire</th>
                    <th className="border px-2 py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.products?.map((product, index) => (
                    <tr key={index}>
                      <td className="border px-2 py-1">
                        {product.product === 'fuel_oil' ? 'Fuel Oil' : 
                         product.product === 'huile_usage' ? 'Huile Usage' :
                         product.product === 'Transport_Fuel' ? 'Transport Fuel' :
                         product.product === 'gasoil' ? 'Gasoil' : 'Kodrone'}

                      </td>
                      <td className="border px-2 py-1">{formatNombre(product.quantity)}</td>
                      <td className="border px-2 py-1">{formatMontant(product.productPrice)}</td>
                      <td className="border px-2 py-1">{formatMontant(product.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-6">
                <div className="w-[250px] border p-4 space-y-2 text-right text-sm bg-gray-50">
                  <div className="flex justify-between">
                    <span className="text-[#053540]">Total HT :</span>
                    <span>{formatMontant(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#053540]">TVA {invoice.vatRate * 100}% :</span>
                    <span>{formatMontant(invoice.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-[#053540]">TOTAL TTC :</span>
                    <span>{formatMontant(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="border p-4 text-sm bg-gray-50">
                <p className="text-[#053540] font-medium mb-1">Arrêtée la présente facture à la somme de :</p>
                <p className="text-black">• {invoice.totalAmountInWords}</p>
              </div>

              <div className="pt-6">
                <img src="https://i.ibb.co/q3vjM3dF/3.png" alt="signature" className="w-[180px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal;