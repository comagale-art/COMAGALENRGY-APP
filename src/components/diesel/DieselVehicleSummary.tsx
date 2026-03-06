import React, { useMemo, useState } from 'react';
import { useDiesel } from '../../context/DieselContext';
import { Truck, Car } from 'lucide-react';
import Card from '../ui/Card';

const DieselVehicleSummary: React.FC = () => {
  const { getVehicleSummary, consumptions } = useDiesel();
  const [filterPeriod, setFilterPeriod] = useState('all');

  const getDateRange = () => {
    const today = new Date();
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    switch (filterPeriod) {
      case 'current_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'current_year':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
    }

    return { startDate, endDate };
  };

  const vehicleSummary = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    return getVehicleSummary(startDate, endDate);
  }, [consumptions, filterPeriod, getVehicleSummary]);

  const getVehicleIcon = (vehicleName: string) => {
    const trucks = ['MAN', 'SOLO1', 'SOLO2', 'Renault'];
    return trucks.includes(vehicleName) ? Truck : Car;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Consommation par véhicule
        </h3>
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Tout</option>
          <option value="current_month">Ce mois</option>
          <option value="last_month">Mois dernier</option>
          <option value="current_year">Cette année</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Véhicule
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total DH
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Litres
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Prix moyen/L
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {vehicleSummary.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune donnée disponible
                </td>
              </tr>
            ) : (
              vehicleSummary.map((summary, index) => {
                const Icon = getVehicleIcon(summary.vehicle_name);
                const avgPrice = summary.totalAmount / summary.totalLiters;
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {summary.vehicle_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {summary.totalAmount.toFixed(2)} DH
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-green-600 dark:text-green-400">
                      {summary.totalLiters.toFixed(2)} L
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-400">
                      {avgPrice.toFixed(2)} DH/L
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {vehicleSummary.length > 0 && (
            <tfoot className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                  {vehicleSummary.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)} DH
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                  {vehicleSummary.reduce((sum, s) => sum + s.totalLiters, 0).toFixed(2)} L
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  );
};

export default DieselVehicleSummary;
