import React, { useState, useMemo } from 'react';
import { Truck, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GroupedSupplierSelector from '../ui/GroupedSupplierSelector';

interface SupplierStockAnalysisProps {
  suppliers: any[];
}

const SupplierStockAnalysis: React.FC<SupplierStockAnalysisProps> = ({ suppliers }) => {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [pricePerKg, setPricePerKg] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredByDate = useMemo(() => {
    if (!startDate && !endDate) return suppliers;

    return suppliers.filter(s => {
      const supplierDate = s.deliveryDate;
      if (!supplierDate) return false;

      if (startDate && supplierDate < startDate) return false;
      if (endDate && supplierDate > endDate) return false;
      return true;
    });
  }, [suppliers, startDate, endDate]);

  const supplierNames = useMemo(() => {
    const names = new Set(filteredByDate.map(s => s.name).filter(Boolean));
    return Array.from(names).sort();
  }, [filteredByDate]);

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

  const filteredSuppliers = useMemo(() => {
    if (selectedSuppliers.length === 0) return [];
    return filteredByDate.filter(s => selectedSuppliers.includes(s.name));
  }, [filteredByDate, selectedSuppliers]);

  const supplierStats = useMemo(() => {
    const grouped = filteredSuppliers.reduce((acc, supplier) => {
      const name = supplier.name;
      if (!acc[name]) {
        acc[name] = {
          name,
          totalQuantityCm: 0,
          totalBarrels: 0,
          totalKg: 0,
          deliveryCount: 0
        };
      }

      acc[name].totalQuantityCm += supplier.quantity || 0;
      acc[name].totalBarrels += supplier.barrels || 0;
      acc[name].totalKg += supplier.kgQuantity || 0;
      acc[name].deliveryCount++;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [filteredSuppliers]);

  const grandTotal = useMemo(() => {
    return {
      totalQuantityCm: supplierStats.reduce((sum, s) => sum + s.totalQuantityCm, 0),
      totalBarrels: supplierStats.reduce((sum, s) => sum + s.totalBarrels, 0),
      totalKg: supplierStats.reduce((sum, s) => sum + s.totalKg, 0),
      totalDeliveries: supplierStats.reduce((sum, s) => sum + s.deliveryCount, 0),
      totalCost: supplierStats.reduce((sum, s) => sum + s.totalKg, 0) * (parseFloat(pricePerKg) || 0)
    };
  }, [supplierStats, pricePerKg]);

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Truck size={24} className="mr-2 text-comagal-blue dark:text-comagal-light-blue" />
          Analyse Fournisseurs
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analysez les livraisons de vos fournisseurs avec calcul des coûts d'achat
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date de début
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date de fin
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <GroupedSupplierSelector
            supplierNames={supplierNames}
            selectedSuppliers={selectedSuppliers}
            onToggleSupplier={toggleSupplier}
            onSelectAll={selectAllSuppliers}
            onClearAll={clearAllSuppliers}
            label="Sélectionner des fournisseurs"
          />

          {selectedSuppliers.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Livraisons</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {grandTotal.totalDeliveries}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quantité (cm³)</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {grandTotal.totalQuantityCm.toFixed(2)}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Barils</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {grandTotal.totalBarrels.toFixed(2)}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quantité (kg)</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {grandTotal.totalKg.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-comagal-blue to-blue-600 dark:from-comagal-light-blue dark:to-blue-500 p-6 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Calcul des Coûts</h3>
              <DollarSign size={24} />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 opacity-90">
                Prix d'achat par kg (DH)
              </label>
              <Input
                type="number"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="bg-white/20 border-white/30 text-white placeholder-white/60"
              />
            </div>

            {selectedSuppliers.length > 0 && pricePerKg && (
              <div className="pt-4 border-t border-white/30">
                <p className="text-sm opacity-90 mb-2">Coût Total d'Achat</p>
                <p className="text-3xl font-bold">
                  {grandTotal.totalCost.toFixed(2)} DH
                </p>
                <p className="text-xs opacity-75 mt-2">
                  {grandTotal.totalKg.toFixed(2)} kg × {parseFloat(pricePerKg).toFixed(2)} DH/kg
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSuppliers.length > 0 && supplierStats.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Détail par Fournisseur
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Livraisons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Quantité (cm³)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Barils
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Quantité (kg)
                  </th>
                  {pricePerKg && (
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Coût Total (DH)
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {supplierStats.map((stat: any) => {
                  const cost = stat.totalKg * (parseFloat(pricePerKg) || 0);

                  return (
                    <tr key={stat.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {stat.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {stat.deliveryCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {stat.totalQuantityCm.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {stat.totalBarrels.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {stat.totalKg.toFixed(2)}
                      </td>
                      {pricePerKg && (
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {cost.toFixed(2)}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {supplierStats.length > 1 && (
                  <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      TOTAL
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {grandTotal.totalDeliveries}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {grandTotal.totalQuantityCm.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {grandTotal.totalBarrels.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {grandTotal.totalKg.toFixed(2)}
                    </td>
                    {pricePerKg && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {grandTotal.totalCost.toFixed(2)}
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSuppliers.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Sélectionnez un ou plusieurs fournisseurs pour voir l'analyse détaillée.
        </div>
      )}
    </Card>
  );
};

export default SupplierStockAnalysis;
