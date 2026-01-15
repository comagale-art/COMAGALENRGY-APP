import React, { useState, useMemo } from 'react';
import { Package, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface BarrelSupplierAnalysisProps {
  barrels: any[];
}

const BarrelSupplierAnalysis: React.FC<BarrelSupplierAnalysisProps> = ({ barrels }) => {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');

  const supplierNames = useMemo(() => {
    const names = new Set(barrels.map(b => b.supplier).filter(Boolean));
    return Array.from(names).sort();
  }, [barrels]);

  const supplierBarrels = useMemo(() => {
    if (!selectedSupplier) return [];
    return barrels.filter(b => b.supplier === selectedSupplier);
  }, [barrels, selectedSupplier]);

  const statistics = useMemo(() => {
    const totalBarrels = supplierBarrels.length;

    const totalQuantityCm = supplierBarrels.reduce((sum, barrel) => {
      const qty = parseFloat(barrel.quantity) || 0;
      return sum + qty;
    }, 0);

    const totalQuantityKg = totalQuantityCm * 0.92;

    const inStockBarrels = supplierBarrels.filter(b => b.status === 'Stock').length;
    const soldCompleteBarrels = supplierBarrels.filter(b => b.status === 'Vendu Complet').length;
    const soldPartialBarrels = supplierBarrels.filter(b => b.status === 'Vendu Quantité').length;

    const price = parseFloat(pricePerKg) || 0;
    const totalCost = totalQuantityKg * price;

    return {
      totalBarrels,
      totalQuantityCm,
      totalQuantityKg,
      inStockBarrels,
      soldCompleteBarrels,
      soldPartialBarrels,
      totalCost
    };
  }, [supplierBarrels, pricePerKg]);

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Package size={24} className="mr-2 text-comagal-blue dark:text-comagal-light-blue" />
          Analyse Barils par Fournisseur
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analysez les barils reçus de chaque fournisseur avec calcul des coûts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sélectionner un fournisseur
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">-- Choisir un fournisseur --</option>
              {supplierNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedSupplier && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Barils</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.totalBarrels}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quantité (cm³)</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statistics.totalQuantityCm.toFixed(2)}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quantité (kg)</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statistics.totalQuantityKg.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Statut des Barils
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">En Stock</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {statistics.inStockBarrels}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Vendus Complet</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {statistics.soldCompleteBarrels}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Vendus Partiel</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {statistics.soldPartialBarrels}
                    </p>
                  </div>
                </div>
              </div>
            </>
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

            {selectedSupplier && pricePerKg && (
              <div className="pt-4 border-t border-white/30">
                <p className="text-sm opacity-90 mb-2">Coût Total Estimé</p>
                <p className="text-3xl font-bold">
                  {statistics.totalCost.toFixed(2)} DH
                </p>
                <p className="text-xs opacity-75 mt-2">
                  {statistics.totalQuantityKg.toFixed(2)} kg × {parseFloat(pricePerKg).toFixed(2)} DH/kg
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSupplier && supplierBarrels.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Liste des Barils - {selectedSupplier}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    N° Baril
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Quantité (cm³)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Quantité (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Date
                  </th>
                  {pricePerKg && (
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Coût (DH)
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {supplierBarrels.map((barrel) => {
                  const qtyCm = parseFloat(barrel.quantity) || 0;
                  const qtyKg = qtyCm * 0.92;
                  const cost = qtyKg * (parseFloat(pricePerKg) || 0);

                  return (
                    <tr key={barrel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {barrel.barrelNumber}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {barrel.product}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {qtyCm.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {qtyKg.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          barrel.status === 'Stock'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : barrel.status === 'Vendu Complet'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {barrel.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(barrel.date).toLocaleDateString('fr-FR')}
                      </td>
                      {pricePerKg && (
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {cost.toFixed(2)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSupplier && supplierBarrels.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucun baril trouvé pour ce fournisseur.
        </div>
      )}

      {!selectedSupplier && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Sélectionnez un fournisseur pour voir l'analyse détaillée.
        </div>
      )}
    </Card>
  );
};

export default BarrelSupplierAnalysis;
