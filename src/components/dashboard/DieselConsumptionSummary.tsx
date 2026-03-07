import React, { useMemo } from 'react';
import { useDiesel } from '../../context/DieselContext';
import Card from '../ui/Card';
import { Fuel, TrendingUp, Calendar } from 'lucide-react';
import { DieselConsumption } from '../../types';

const DieselConsumptionSummary: React.FC = () => {
  const { consumptions, loading } = useDiesel();

  const { vehicleData, evolutionData } = useMemo(() => {
    if (!consumptions.length) {
      return { vehicleData: [], evolutionData: [] };
    }

    // Group by vehicle
    const vehicleMap = new Map<string, { totalLiters: number; totalAmount: number; count: number }>();

    consumptions.forEach((consumption: DieselConsumption) => {
      const key = `${consumption.vehicle_type} - ${consumption.vehicle_name}`;
      const existing = vehicleMap.get(key) || { totalLiters: 0, totalAmount: 0, count: 0 };

      vehicleMap.set(key, {
        totalLiters: existing.totalLiters + Number(consumption.liters_calculated),
        totalAmount: existing.totalAmount + Number(consumption.amount_dh),
        count: existing.count + 1
      });
    });

    // Convert to array and sort by total liters descending
    const vehicleData = Array.from(vehicleMap.entries())
      .map(([vehicle, data]) => ({
        vehicle,
        ...data,
        avgLiters: data.totalLiters / data.count
      }))
      .sort((a, b) => b.totalLiters - a.totalLiters);

    // Group by month for evolution (last 6 months)
    const monthMap = new Map<string, { totalLiters: number; totalAmount: number }>();
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    consumptions
      .filter((c: DieselConsumption) => new Date(c.date) >= sixMonthsAgo)
      .forEach((consumption: DieselConsumption) => {
        const date = new Date(consumption.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthMap.get(monthKey) || { totalLiters: 0, totalAmount: 0 };

        monthMap.set(monthKey, {
          totalLiters: existing.totalLiters + Number(consumption.liters_calculated),
          totalAmount: existing.totalAmount + Number(consumption.amount_dh)
        });
      });

    // Convert to array and sort by month
    const evolutionData = Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { vehicleData, evolutionData };
  }, [consumptions]);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Consumption by Vehicle */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Fuel className="text-comagal-green" size={24} />
            Consommation par Véhicule
          </h3>
        </div>

        {vehicleData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Aucune donnée de consommation disponible
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Litres
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Montant
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Moyenne/Plein
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nb Pleins
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {vehicleData.map((vehicle, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {vehicle.vehicle}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {vehicle.totalLiters.toFixed(2)} L
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {vehicle.totalAmount.toFixed(2)} DH
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {vehicle.avgLiters.toFixed(2)} L
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                      {vehicle.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Evolution of Consumption */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-comagal-blue" size={24} />
            Évolution de la Consommation (6 derniers mois)
          </h3>
        </div>

        {evolutionData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Aucune donnée d'évolution disponible
          </p>
        ) : (
          <div className="space-y-4">
            {/* Chart bars */}
            <div className="space-y-3">
              {evolutionData.map((item, index) => {
                const maxLiters = Math.max(...evolutionData.map(d => d.totalLiters));
                const percentage = (item.totalLiters / maxLiters) * 100;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatMonth(item.month)}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.totalLiters.toFixed(2)} L
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({item.totalAmount.toFixed(2)} DH)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-comagal-green to-comagal-light-green h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Litres</p>
                <p className="text-lg font-bold text-comagal-green">
                  {evolutionData.reduce((sum, item) => sum + item.totalLiters, 0).toFixed(2)} L
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Montant</p>
                <p className="text-lg font-bold text-comagal-blue">
                  {evolutionData.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)} DH
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Moyenne/Mois</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {(evolutionData.reduce((sum, item) => sum + item.totalLiters, 0) / evolutionData.length).toFixed(2)} L
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DieselConsumptionSummary;
