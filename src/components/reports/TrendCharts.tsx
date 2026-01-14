import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { LineChart } from 'lucide-react';
import Card from '../ui/Card';

interface TrendChartsProps {
  orders: any[];
  bigSuppliers: any[];
}

const MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

const TrendCharts: React.FC<TrendChartsProps> = ({ orders, bigSuppliers }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [chartType, setChartType] = useState<'revenue' | 'quantity' | 'orders' | 'profit'>('revenue');

  const availableYears = useMemo(() => {
    const years = new Set(orders.map(o => new Date(o.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  const monthlyData = useMemo(() => {
    const data = Array(12).fill(null).map((_, index) => ({
      month: index,
      revenue: 0,
      quantity: 0,
      orders: 0,
      costs: 0
    }));

    orders.filter(o => new Date(o.date).getFullYear() === selectedYear).forEach(order => {
      const month = new Date(order.date).getMonth();
      data[month].revenue += order.totalPriceInclTax || 0;
      data[month].quantity += order.quantity || 0;
      data[month].orders += 1;
    });

    bigSuppliers.filter(bs => new Date(bs.date).getFullYear() === selectedYear).forEach(supplier => {
      const month = new Date(supplier.date).getMonth();
      data[month].costs += supplier.totalPrice || 0;
    });

    return data;
  }, [orders, bigSuppliers, selectedYear]);

  const getChartData = () => {
    let dataValues: number[];
    let label: string;
    let color: string;

    switch (chartType) {
      case 'revenue':
        dataValues = monthlyData.map(d => d.revenue);
        label = 'Revenu (DH)';
        color = 'rgba(59, 130, 246, 1)';
        break;
      case 'quantity':
        dataValues = monthlyData.map(d => d.quantity);
        label = 'Quantité Vendue (kg)';
        color = 'rgba(16, 185, 129, 1)';
        break;
      case 'orders':
        dataValues = monthlyData.map(d => d.orders);
        label = 'Nombre de Commandes';
        color = 'rgba(245, 158, 11, 1)';
        break;
      case 'profit':
        dataValues = monthlyData.map(d => d.revenue - d.costs);
        label = 'Profit Estimé (DH)';
        color = 'rgba(139, 92, 246, 1)';
        break;
    }

    return {
      labels: MONTHS,
      datasets: [
        {
          label,
          data: dataValues,
          borderColor: color,
          backgroundColor: color.replace('1)', '0.1)'),
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
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
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (chartType === 'orders') {
              label += Math.round(context.parsed.y);
            } else {
              label += context.parsed.y.toFixed(2);
              if (chartType !== 'quantity') {
                label += ' DH';
              } else {
                label += ' kg';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            if (chartType === 'orders') {
              return Math.round(value);
            }
            return value.toFixed(0);
          }
        }
      }
    }
  };

  const totalStats = useMemo(() => {
    const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
    const totalQuantity = monthlyData.reduce((sum, d) => sum + d.quantity, 0);
    const totalOrders = monthlyData.reduce((sum, d) => sum + d.orders, 0);
    const totalCosts = monthlyData.reduce((sum, d) => sum + d.costs, 0);
    const totalProfit = totalRevenue - totalCosts;

    return {
      totalRevenue,
      totalQuantity,
      totalOrders,
      totalCosts,
      totalProfit,
      avgMonthlyRevenue: totalRevenue / 12,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    };
  }, [monthlyData]);

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <LineChart size={24} className="mr-2 text-comagal-blue dark:text-comagal-light-blue" />
          Tendances Mensuelles {selectedYear}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Visualisez l'évolution de vos métriques au fil des mois
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenu Total</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalRevenue.toFixed(0)} DH</p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Quantité Vendue</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalQuantity.toFixed(0)} kg</p>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Commandes</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalOrders}</p>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Coûts d'Achat</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalCosts.toFixed(0)} DH</p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Profit Estimé</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalProfit.toFixed(0)} DH</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Marge: {totalStats.profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Année
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1 md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Métrique à Afficher
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('revenue')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'revenue'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Revenu
            </button>
            <button
              onClick={() => setChartType('quantity')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'quantity'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Quantité
            </button>
            <button
              onClick={() => setChartType('orders')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'orders'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Commandes
            </button>
            <button
              onClick={() => setChartType('profit')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'profit'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Profit
            </button>
          </div>
        </div>
      </div>

      <div className="h-96">
        <Line data={getChartData()} options={chartOptions} />
      </div>
    </Card>
  );
};

export default TrendCharts;
