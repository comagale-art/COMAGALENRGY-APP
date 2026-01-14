import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import Card from '../ui/Card';

interface BigSupplierAnalysisProps {
  bigSuppliers: any[];
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const BigSupplierAnalysis: React.FC<BigSupplierAnalysisProps> = ({ bigSuppliers }) => {
  const currentYear = new Date().getFullYear();
  const [month1, setMonth1] = useState(1);
  const [year1, setYear1] = useState(currentYear);
  const [month2, setMonth2] = useState(1);
  const [year2, setYear2] = useState(currentYear - 1);

  const availableYears = useMemo(() => {
    const years = new Set(bigSuppliers.map(bs => new Date(bs.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [bigSuppliers]);

  const getMonthData = (month: number, year: number) => {
    const monthSuppliers = bigSuppliers.filter(bs => {
      const date = new Date(bs.date);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    return {
      count: monthSuppliers.length,
      quantity: monthSuppliers.reduce((sum, bs) => sum + (bs.quantity || 0), 0),
      spending: monthSuppliers.reduce((sum, bs) => sum + (bs.totalPrice || 0), 0),
      avgPricePerKg: monthSuppliers.length > 0
        ? monthSuppliers.reduce((sum, bs) => sum + (bs.pricePerKg || 0), 0) / monthSuppliers.length
        : 0
    };
  };

  const period1Data = getMonthData(month1, year1);
  const period2Data = getMonthData(month2, year2);

  const chartData = {
    labels: ['Nombre d\'Achats', 'Quantité (kg)', 'Dépenses (DH)', 'Prix Moy./kg'],
    datasets: [
      {
        label: `${MONTHS[month1 - 1]} ${year1}`,
        data: [period1Data.count, period1Data.quantity, period1Data.spending, period1Data.avgPricePerKg],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      },
      {
        label: `${MONTHS[month2 - 1]} ${year2}`,
        data: [period2Data.count, period2Data.quantity, period2Data.spending, period2Data.avgPricePerKg],
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const calculateChange = (val1: number, val2: number) => {
    if (val2 === 0) return val1 > 0 ? '+100%' : '0%';
    const change = ((val1 - val2) / val2) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <TrendingUp size={24} className="mr-2 text-comagal-blue dark:text-comagal-light-blue" />
          Analyse des Grands Fournisseurs
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comparez vos achats entre deux périodes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white">Période 1</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mois
              </label>
              <select
                value={month1}
                onChange={(e) => setMonth1(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Année
              </label>
              <select
                value={year1}
                onChange={(e) => setYear1(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white">Période 2</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mois
              </label>
              <select
                value={month2}
                onChange={(e) => setMonth2(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Année
              </label>
              <select
                value={year2}
                onChange={(e) => setYear2(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="h-96 mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Achats</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{period1Data.count}</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {calculateChange(period1Data.count, period2Data.count)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Quantité</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{period1Data.quantity.toFixed(0)} kg</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {calculateChange(period1Data.quantity, period2Data.quantity)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Dépenses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{period1Data.spending.toFixed(0)} DH</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {calculateChange(period1Data.spending, period2Data.spending)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Prix Moy./kg</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{period1Data.avgPricePerKg.toFixed(2)} DH</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {calculateChange(period1Data.avgPricePerKg, period2Data.avgPricePerKg)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BigSupplierAnalysis;
