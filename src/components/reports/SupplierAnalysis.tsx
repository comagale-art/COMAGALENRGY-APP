import React, { useState, useMemo } from 'react';
import { Users, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import GroupedSupplierSelector from '../ui/GroupedSupplierSelector';

interface SupplierAnalysisProps {
  orders: any[];
  suppliers: any[];
}

const SupplierAnalysis: React.FC<SupplierAnalysisProps> = ({ orders, suppliers }) => {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const supplierNames = useMemo(() => {
    const names = new Set(orders.map(o => o.clientName).filter(Boolean));
    return Array.from(names).sort();
  }, [orders]);

  const toggleSupplier = (supplier: string) => {
    if (selectedSuppliers.includes(supplier)) {
      setSelectedSuppliers(selectedSuppliers.filter(s => s !== supplier));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplier]);
    }
  };

  const selectAllSuppliers = () => {
    setSelectedSuppliers(supplierNames);
  };

  const clearAllSuppliers = () => {
    setSelectedSuppliers([]);
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (selectedSuppliers.length > 0) {
      filtered = filtered.filter(o => selectedSuppliers.includes(o.clientName));
    }

    if (startDate) {
      filtered = filtered.filter(o => new Date(o.date) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(o => new Date(o.date) <= new Date(endDate));
    }

    return filtered;
  }, [orders, selectedSuppliers, startDate, endDate]);

  const analysisData = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, order) => {
      const supplier = order.clientName;
      if (!acc[supplier]) {
        acc[supplier] = {
          name: supplier,
          orderCount: 0,
          totalQuantity: 0,
          totalSpent: 0,
          avgPricePerKg: 0,
          avgOrderValue: 0
        };
      }

      acc[supplier].orderCount++;
      acc[supplier].totalQuantity += order.quantity || 0;
      acc[supplier].totalSpent += order.totalPriceInclTax || 0;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((supplier: any) => ({
      ...supplier,
      avgPricePerKg: supplier.totalQuantity > 0 ? supplier.totalSpent / supplier.totalQuantity : 0,
      avgOrderValue: supplier.orderCount > 0 ? supplier.totalSpent / supplier.orderCount : 0
    })).sort((a: any, b: any) => b.totalSpent - a.totalSpent);
  }, [filteredOrders]);

  const totalStats = useMemo(() => ({
    totalOrders: filteredOrders.length,
    totalQuantity: filteredOrders.reduce((sum, o) => sum + (o.quantity || 0), 0),
    totalRevenue: filteredOrders.reduce((sum, o) => sum + (o.totalPriceInclTax || 0), 0),
    avgOrderValue: filteredOrders.length > 0
      ? filteredOrders.reduce((sum, o) => sum + (o.totalPriceInclTax || 0), 0) / filteredOrders.length
      : 0
  }), [filteredOrders]);

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Users size={24} className="mr-2 text-comagal-blue dark:text-comagal-light-blue" />
          Analyse par Client
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analysez les commandes par client sur une période donnée
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <GroupedSupplierSelector
            supplierNames={supplierNames}
            selectedSuppliers={selectedSuppliers}
            onToggleSupplier={toggleSupplier}
            onSelectAll={selectAllSuppliers}
            onClearAll={clearAllSuppliers}
            label="Sélectionner des clients"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <Calendar size={16} className="mr-1" />
              Date de début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <Calendar size={16} className="mr-1" />
              Date de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Résumé Global</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Commandes:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalStats.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quantité:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalStats.totalQuantity.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Revenu:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalStats.totalRevenue.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Moy. commande:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalStats.avgOrderValue.toFixed(2)} DH</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Commandes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Quantité (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Total Dépensé (DH)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Prix Moy./kg
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Valeur Moy. Commande
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {analysisData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune donnée à afficher. Sélectionnez des clients pour voir l'analyse.
                </td>
              </tr>
            ) : (
              analysisData.map((supplier: any) => (
                <tr key={supplier.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {supplier.orderCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {supplier.totalQuantity.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.totalSpent.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {supplier.avgPricePerKg.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {supplier.avgOrderValue.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SupplierAnalysis;
