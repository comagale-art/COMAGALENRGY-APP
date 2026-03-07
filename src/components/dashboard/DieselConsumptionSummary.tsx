import React, { useMemo, useState } from 'react';
import { useDiesel } from '../../context/DieselContext';
import Card from '../ui/Card';
import { Fuel, TrendingUp, Calendar } from 'lucide-react';
import { DieselConsumption } from '../../types';
import PeriodFilter, { PeriodType } from '../ui/PeriodFilter';
import { getDateRangeFromPeriod, filterByDateRange } from '../../utils/dateFilters';

// Vehicle logos mapping
const VEHICLE_LOGOS: Record<string, string> = {
  'solo1': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU',
  'solo2': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU',
  'mutshi': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU',
  'radade': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU',
  'renault': 'https://www.printpeelstick.co.uk/cdn/shop/collections/New_Renault_Logo-01_3be0c6b3-6e99-4955-a707-fdad3b1d8da3.png?v=1729543668&width=460',
  'kadjar': 'https://www.printpeelstick.co.uk/cdn/shop/collections/New_Renault_Logo-01_3be0c6b3-6e99-4955-a707-fdad3b1d8da3.png?v=1729543668&width=460',
  'man': 'https://media.cdnws.com/_i/46016/m250-6953/520/57/ref7man-stickers-man-logo-lion-droite-autocollant-camion-man-sticker-poid-lourd-truck.jpeg',
  'soueast': 'data:image/png;base64,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',
  'hyundai': 'https://static.vecteezy.com/ti/vecteur-libre/p1/20499812-hyundai-logo-marque-symbole-avec-nom-blanc-conception-sud-coreen-voiture-voiture-vecteur-illustration-avec-noir-contexte-gratuit-vectoriel.jpg'
};

const getVehicleLogo = (vehicleName: string): string => {
  const normalizedName = vehicleName.toLowerCase().trim();

  // Check exact matches first
  if (VEHICLE_LOGOS[normalizedName]) {
    return VEHICLE_LOGOS[normalizedName];
  }

  // Check if vehicle name contains any of the keys
  for (const [key, logo] of Object.entries(VEHICLE_LOGOS)) {
    if (normalizedName.includes(key)) {
      return logo;
    }
  }

  // Default to a generic vehicle icon if no match
  return '';
};

const DieselConsumptionSummary: React.FC = () => {
  const { consumptions, loading } = useDiesel();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('last_6_months');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  const { vehicleData, evolutionData } = useMemo(() => {
    if (!consumptions.length) {
      return { vehicleData: [], evolutionData: [] };
    }

    // Filter consumptions by selected period
    const dateRange = getDateRangeFromPeriod(selectedPeriod, customStartDate, customEndDate);
    const filteredConsumptions = filterByDateRange(consumptions, dateRange);

    if (!filteredConsumptions.length) {
      return { vehicleData: [], evolutionData: [] };
    }

    // Group by vehicle
    const vehicleMap = new Map<string, { totalLiters: number; totalAmount: number; count: number }>();

    filteredConsumptions.forEach((consumption: DieselConsumption) => {
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

    // Group by month for evolution
    const monthMap = new Map<string, { totalLiters: number; totalAmount: number }>();

    filteredConsumptions
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
  }, [consumptions, selectedPeriod, customStartDate, customEndDate]);

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
      {/* Period Filter */}
      <Card>
        <PeriodFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomDateChange={handleCustomDateChange}
        />
      </Card>

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
                {vehicleData.map((vehicle, index) => {
                  const logo = getVehicleLogo(vehicle.vehicle);
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {logo && (
                            <img
                              src={logo}
                              alt={vehicle.vehicle}
                              className="h-8 w-auto object-contain"
                            />
                          )}
                          <span>{vehicle.vehicle}</span>
                        </div>
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
                  );
                })}
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
            Évolution de la Consommation
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
