import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import { Order, BigSupplier } from '../../types';

interface SummaryProps {
  orders: Order[];
  bigSuppliers: BigSupplier[];
}

const DashboardSummary: React.FC<SummaryProps> = ({
  orders,
  bigSuppliers
}) => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(new Set());
  
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  // Filter data for selected month and year
  const filterByDate = (date: string) => {
    const [year, month] = date.split('-');
    return year === selectedYear && month === selectedMonth;
  };

  const filteredOrders = orders.filter(order => filterByDate(order.date));
  const filteredBigSuppliers = bigSuppliers.filter(supplier => filterByDate(supplier.date));

  // Calculate totals for orders
  const orderTotals = filteredOrders.reduce(
    (acc, order) => ({
      quantity: acc.quantity + order.quantity,
      totalPrice: acc.totalPrice + order.totalPriceInclTax
    }),
    { quantity: 0, totalPrice: 0 }
  );

  // Calculate totals for big suppliers
  const bigSupplierTotals = filteredBigSuppliers.reduce(
    (acc, supplier) => ({
      quantity: acc.quantity + supplier.quantity,
      totalPrice: acc.totalPrice + supplier.totalPrice
    }),
    { quantity: 0, totalPrice: 0 }
  );

  // Group orders by client with product details
  const clientSummaries = filteredOrders.reduce((acc, order) => {
    if (!acc[order.clientName]) {
      acc[order.clientName] = {
        totalOrders: 0,
        totalQuantity: 0,
        totalPrice: 0,
        products: {},
        orders: []
      };
    }
    acc[order.clientName].totalOrders++;
    acc[order.clientName].totalQuantity += order.quantity;
    acc[order.clientName].totalPrice += order.totalPriceInclTax;
    acc[order.clientName].orders.push(order);

    // Track quantities by product
    if (!acc[order.clientName].products[order.product]) {
      acc[order.clientName].products[order.product] = 0;
    }
    acc[order.clientName].products[order.product] += order.quantity;

    return acc;
  }, {} as Record<string, {
    totalOrders: number;
    totalQuantity: number;
    totalPrice: number;
    products: Record<string, number>;
    orders: any[];
  }>);

  // Group big suppliers with product details
  const supplierSummaries = filteredBigSuppliers.reduce((acc, supplier) => {
    if (!acc[supplier.supplierName]) {
      acc[supplier.supplierName] = {
        totalOrders: 0,
        totalQuantity: 0,
        totalPrice: 0,
        products: {},
        orders: []
      };
    }
    acc[supplier.supplierName].totalOrders++;
    acc[supplier.supplierName].totalQuantity += supplier.quantity;
    acc[supplier.supplierName].totalPrice += supplier.totalPrice;
    acc[supplier.supplierName].orders.push(supplier);

    // Track quantities by product
    if (!acc[supplier.supplierName].products[supplier.product]) {
      acc[supplier.supplierName].products[supplier.product] = 0;
    }
    acc[supplier.supplierName].products[supplier.product] += supplier.quantity;

    return acc;
  }, {} as Record<string, {
    totalOrders: number;
    totalQuantity: number;
    totalPrice: number;
    products: Record<string, number>;
    orders: any[];
  }>);

  const toggleClientExpansion = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const toggleSupplierExpansion = (supplierName: string) => {
    const newExpanded = new Set(expandedSuppliers);
    if (newExpanded.has(supplierName)) {
      newExpanded.delete(supplierName);
    } else {
      newExpanded.add(supplierName);
    }
    setExpandedSuppliers(newExpanded);
  };
  // Handle date selection change
  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'month') {
      setSelectedMonth(value);
    } else if (name === 'year') {
      setSelectedYear(value);
    }
  };

  // Format product name for display
  const formatProductName = (product: string): string => {
    switch (product) {
      case 'used_oil':
        return 'Huile Usage';
      case 'fuel_oil':
        return 'Fuel Oil';
      case 'oil':
        return 'Oil';
      default:
        return product.replace(/_/g, ' ');
    }
  };

  // Date selection component
  const DateSelector = () => (
    <div className="mb-4 grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Mois
        </label>
        <select
          name="month"
          value={selectedMonth}
          onChange={handleDateChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {Array.from({ length: 12 }, (_, i) => {
            const month = (i + 1).toString().padStart(2, '0');
            return (
              <option key={month} value={month}>
                {format(new Date(2024, i, 1), 'MMMM', { locale: fr })}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Année
        </label>
        <select
          name="year"
          value={selectedYear}
          onChange={handleDateChange}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-comagal-blue focus:outline-none focus:ring-1 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = (new Date().getFullYear() - 2 + i).toString();
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );

  const SAPAK_LOGO_URL = "http://fenagri.org/public/files/img/5f8de6929253c874577881.png";
  const TECHNOPURE_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLgaKWSycXEoxWhVbz5dd7bC7P37L98Fvmq0kgld3OczrGJ0Sp4z5F8PYzzyjFnoUbWkg&usqp=CAU";
const TR3F_LOGO_URL = "data:image/jpeg;base64,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"
  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <DateSelector />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Résumé des Commandes Clients">
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Quantité</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {orderTotals.quantity.toFixed(2)} kg
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Prix TTC</p>
                <p className="text-lg font-semibold text-comagal-green dark:text-comagal-light-green">
                  {orderTotals.totalPrice.toFixed(2)} DH
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(clientSummaries).map(([client, summary]) => (
                <div key={client} className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
                  <div 
                    className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => toggleClientExpansion(client)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-comagal-blue dark:text-comagal-light-blue">
                        {expandedClients.has(client) ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                      {client === 'SAPAK' && (
                        <img src={SAPAK_LOGO_URL} alt="SAPAK Logo" className="h-6 w-auto" />
                      )}
                      {client === 'Technopure Maroc ' && (
                        <img src={TECHNOPURE_LOGO_URL} alt="Technopure Maroc Logo" className="h-6 w-auto" />
                      )}
                      {client === 'Technopure Maroc' && (
                        <img src={TECHNOPURE_LOGO_URL} alt="Technopure Maroc Logo" className="h-6 w-auto" />
                      )}
                      {client === 'TR3F' && (
                        <img src={TR3F_LOGO_URL} alt="TR3F Logo" className="h-6 w-auto" />
                      )}
                      <p className="font-medium text-gray-900 dark:text-white">
                        {client}
                      </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {summary.totalOrders} commande{summary.totalOrders > 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {!expandedClients.has(client) && (
                    <div className="px-3 pb-3 space-y-1">
                    {/* Display quantities by product */}
                    {Object.entries(summary.products).map(([product, quantity]) => (
                      <div key={product} className="flex justify-between text-sm">
                        <p className="text-gray-600 dark:text-gray-300">
                          {formatProductName(product)}: {quantity.toFixed(2)} kg
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-200 pt-1 dark:border-gray-600">
                      <p className="font-medium text-gray-700 dark:text-gray-200">
                        Total: {summary.totalQuantity.toFixed(2)} kg
                      </p>
                      <p className="font-medium text-comagal-green dark:text-comagal-light-green">
                        {summary.totalPrice.toFixed(2)} DH
                      </p>
                    </div>
                    </div>
                  )}
                  
                  {/* Détails des commandes quand le client est étendu */}
                  {expandedClients.has(client) && (
                    <div className="border-t border-gray-200 p-3 dark:border-gray-600">
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                        Détails des commandes
                      </h4>
                      <div className="space-y-2">
                        {summary.orders.map((order, index) => (
                          <div key={index} className="rounded border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
                            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                                <span className="ml-1 text-gray-900 dark:text-white">
                                  {format(new Date(order.date), 'dd/MM/yyyy', { locale: fr })}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Quantité:</span>
                                <span className="ml-1 text-gray-900 dark:text-white">
                                  {order.quantity.toFixed(2)} kg
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">N° BL:</span>
                                <span className="ml-1 text-gray-900 dark:text-white">
                                  {order.blNumber}
                                </span>
                              </div>
                            </div>
                            <div className="mt-1 text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Produit:</span>
                              <span className="ml-1 text-gray-900 dark:text-white">
                                {formatProductName(order.product)}
                              </span>
                              <span className="ml-3 font-medium text-comagal-green dark:text-comagal-light-green">
                                {order.totalPriceInclTax.toFixed(2)} DH
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Totaux pour ce client */}
                      <div className="mt-3 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          Total: {summary.totalQuantity.toFixed(2)} kg
                        </p>
                        <p className="font-medium text-comagal-green dark:text-comagal-light-green">
                          {summary.totalPrice.toFixed(2)} DH
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Résumé des Grands Fournisseurs">
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Quantité</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {bigSupplierTotals.quantity.toFixed(2)} kg
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Prix</p>
                <p className="text-lg font-semibold text-comagal-green dark:text-comagal-light-green">
                  {bigSupplierTotals.totalPrice.toFixed(2)} DH
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(supplierSummaries).map(([supplier, summary]) => (
                <div key={supplier} className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
                  <div
                    className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => toggleSupplierExpansion(supplier)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-comagal-blue dark:text-comagal-light-blue">
                        {expandedSuppliers.has(supplier) ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{supplier}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {summary.totalOrders} livraison{summary.totalOrders > 1 ? 's' : ''}
                    </p>
                  </div>

                  {!expandedSuppliers.has(supplier) && (
                    <div className="px-3 pb-3 space-y-1">
                      {/* Display quantities by product */}
                      {Object.entries(summary.products).map(([product, quantity]) => (
                        <div key={product} className="flex justify-between text-sm">
                          <p className="text-gray-600 dark:text-gray-300">
                            {formatProductName(product)}: {quantity.toFixed(2)} kg
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-gray-200 pt-1 dark:border-gray-600">
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          Total: {summary.totalQuantity.toFixed(2)} kg
                        </p>
                        <p className="font-medium text-comagal-green dark:text-comagal-light-green">
                          {summary.totalPrice.toFixed(2)} DH
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Détails des commandes quand le fournisseur est étendu */}
                  {expandedSuppliers.has(supplier) && (
                    <div className="border-t border-gray-200 p-3 dark:border-gray-600">
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                        Détails des livraisons
                      </h4>
                      <div className="space-y-2">
                        {summary.orders.map((order, index) => (
                          <div key={index} className="rounded border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
                            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                                <span className="ml-1 text-gray-900 dark:text-white">
                                  {format(new Date(order.date), 'dd/MM/yyyy', { locale: fr })}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Produit:</span>
                                <span className="ml-1 text-gray-900 dark:text-white">
                                  {formatProductName(order.product)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Quantité:</span>
                                <span className="ml-1 text-gray-900 dark:text-white">
                                  {order.quantity.toFixed(2)} kg
                                </span>
                              </div>
                            </div>
                            <div className="mt-1 text-sm">
                              <span className="font-medium text-comagal-green dark:text-comagal-light-green">
                                {order.totalPrice.toFixed(2)} DH
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Totaux pour ce fournisseur */}
                      <div className="mt-3 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          Total: {summary.totalQuantity.toFixed(2)} kg
                        </p>
                        <p className="font-medium text-comagal-green dark:text-comagal-light-green">
                          {summary.totalPrice.toFixed(2)} DH
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSummary;
