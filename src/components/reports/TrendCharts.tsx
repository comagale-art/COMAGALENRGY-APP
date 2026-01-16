import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { LineChart } from 'lucide-react';
import Card from '../ui/Card';
import GroupedSupplierSelector from '../ui/GroupedSupplierSelector';

interface TrendChartsProps {
  orders: any[];
  bigSuppliers: any[];
  suppliers: any[];
}

const MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

const TrendCharts: React.FC<TrendChartsProps> = ({ orders, bigSuppliers, suppliers }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [chartType, setChartType] = useState<'revenue' | 'quantity' | 'orders' | 'profit' | 'purchaseQuantity'>('revenue');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [supplierPricePerKg, setSupplierPricePerKg] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const availableYears = useMemo(() => {
    if (!orders || orders.length === 0) return [currentYear];
    const years = new Set(orders.map(o => new Date(o.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [orders, currentYear]);

  const supplierNames = useMemo(() => {
    if (!suppliers || suppliers.length === 0) return [];
    const names = new Set(suppliers.map(s => s.name).filter(Boolean));
    return Array.from(names).sort();
  }, [suppliers]);

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

  const toggleSupplierWrapper = (supplier: string) => {
    toggleSupplier(supplier);
  };

  const monthlyData = useMemo(() => {
    const data = Array(12).fill(null).map((_, index) => ({
      month: index,
      revenue: 0,
      quantity: 0,
      orders: 0,
      bigSupplierCosts: 0,
      supplierCosts: 0,
      bigSupplierQuantity: 0,
      supplierQuantity: 0
    }));

    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;

    const isInDateRange = (date: Date) => {
      if (!startDateObj && !endDateObj) return true;
      if (startDateObj && date < startDateObj) return false;
      if (endDateObj && date > endDateObj) return false;
      return true;
    };

    if (orders && orders.length > 0) {
      orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getFullYear() === selectedYear && isInDateRange(orderDate);
      }).forEach(order => {
        const month = new Date(order.date).getMonth();
        data[month].revenue += order.totalPriceInclTax || 0;
        data[month].quantity += order.quantity || 0;
        data[month].orders += 1;
      });
    }

    if (bigSuppliers && bigSuppliers.length > 0) {
      bigSuppliers.filter(bs => {
        const bsDate = new Date(bs.date);
        return bsDate.getFullYear() === selectedYear && isInDateRange(bsDate);
      }).forEach(supplier => {
        const month = new Date(supplier.date).getMonth();
        data[month].bigSupplierCosts += supplier.totalPrice || 0;
        data[month].bigSupplierQuantity += supplier.quantity || 0;
      });
    }

    if (suppliers && suppliers.length > 0) {
      const filteredSuppliers = selectedSuppliers.length > 0
        ? suppliers.filter(s => selectedSuppliers.includes(s.name))
        : suppliers;

      filteredSuppliers.filter(s => {
        const date = new Date(s.deliveryDate);
        return date.getFullYear() === selectedYear && isInDateRange(date);
      }).forEach(supplier => {
        const month = new Date(supplier.deliveryDate).getMonth();
        const pricePerKg = parseFloat(supplierPricePerKg) || 0;
        const kgQuantity = supplier.kgQuantity || 0;
        data[month].supplierCosts += kgQuantity * pricePerKg;
        data[month].supplierQuantity += kgQuantity;
      });
    }

    return data;
  }, [orders, bigSuppliers, suppliers, selectedYear, selectedSuppliers, supplierPricePerKg, startDate, endDate]);

  const getChartData = () => {
    if (chartType === 'purchaseQuantity') {
      return {
        labels: MONTHS,
        datasets: [
          {
            label: 'Grands Fournisseurs (kg)',
            data: monthlyData.map(d => d.bigSupplierQuantity),
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Fournisseurs (kg)',
            data: monthlyData.map(d => d.supplierQuantity),
            borderColor: 'rgba(249, 115, 22, 1)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Total Acheté (kg)',
            data: monthlyData.map(d => d.bigSupplierQuantity + d.supplierQuantity),
            borderColor: 'rgba(20, 184, 166, 1)',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };
    }

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
        dataValues = monthlyData.map(d => d.revenue - d.bigSupplierCosts - d.supplierCosts);
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
              if (chartType !== 'quantity' && chartType !== 'purchaseQuantity') {
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
    const totalBigSupplierCosts = monthlyData.reduce((sum, d) => sum + d.bigSupplierCosts, 0);
    const totalSupplierCosts = monthlyData.reduce((sum, d) => sum + d.supplierCosts, 0);
    const totalBigSupplierQuantity = monthlyData.reduce((sum, d) => sum + d.bigSupplierQuantity, 0);
    const totalSupplierQuantity = monthlyData.reduce((sum, d) => sum + d.supplierQuantity, 0);
    const totalPurchasedQuantity = totalBigSupplierQuantity + totalSupplierQuantity;
    const totalCosts = totalBigSupplierCosts + totalSupplierCosts;
    const totalProfit = totalRevenue - totalCosts;

    return {
      totalRevenue,
      totalQuantity,
      totalOrders,
      totalBigSupplierCosts,
      totalSupplierCosts,
      totalBigSupplierQuantity,
      totalSupplierQuantity,
      totalPurchasedQuantity,
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

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Filtres de Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="mt-3 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenu Total</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalRevenue.toFixed(0)} DH</p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Quantité Vendue</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalQuantity.toFixed(0)} kg</p>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Commandes</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalOrders}</p>
        </div>

        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-l-4 border-teal-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Acheté</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalPurchasedQuantity.toFixed(0)} kg</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Qté Grands Fournisseurs</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalBigSupplierQuantity.toFixed(0)} kg</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coût: {totalStats.totalBigSupplierCosts.toFixed(0)} DH</p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Qté Fournisseurs</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalSupplierQuantity.toFixed(0)} kg</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coût: {totalStats.totalSupplierCosts.toFixed(0)} DH</p>
        </div>

        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border-l-4 border-violet-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Profit Estimé</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalProfit.toFixed(0)} DH</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Marge: {totalStats.profitMargin.toFixed(1)}%</p>
        </div>

        <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border-l-4 border-cyan-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Somme Quantités</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStats.totalPurchasedQuantity.toFixed(0)} kg</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            GF: {totalStats.totalBigSupplierQuantity.toFixed(0)} + F: {totalStats.totalSupplierQuantity.toFixed(0)}
          </p>
        </div>
      </div>

      {(chartType === 'profit' || chartType === 'purchaseQuantity') && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {chartType === 'profit' ? 'Calcul du Profit - Coûts Fournisseurs' : 'Sélection des Fournisseurs'}
          </h3>

          {chartType === 'profit' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prix d'achat par kg des fournisseurs (DH)
              </label>
              <input
                type="number"
                value={supplierPricePerKg}
                onChange={(e) => setSupplierPricePerKg(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full md:w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-comagal-blue focus:outline-none focus:ring-2 focus:ring-comagal-blue dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <GroupedSupplierSelector
            supplierNames={supplierNames}
            selectedSuppliers={selectedSuppliers}
            onToggleSupplier={toggleSupplierWrapper}
            onSelectAll={selectAllSuppliers}
            onClearAll={clearAllSuppliers}
            label="Sélectionner des fournisseurs"
          />

          {chartType === 'profit' && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Le profit est calculé comme: Revenu - Coûts Grands Fournisseurs - Coûts Fournisseurs (kg × prix/kg)
            </p>
          )}
          {chartType === 'purchaseQuantity' && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Sélectionnez les fournisseurs pour filtrer les quantités achetées. Si aucun n'est sélectionné, tous sont affichés.
            </p>
          )}
        </div>
      )}

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <button
              onClick={() => setChartType('revenue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'revenue'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Revenu
            </button>
            <button
              onClick={() => setChartType('quantity')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'quantity'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Quantité
            </button>
            <button
              onClick={() => setChartType('orders')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'orders'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Commandes
            </button>
            <button
              onClick={() => setChartType('purchaseQuantity')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'purchaseQuantity'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Achats
            </button>
            <button
              onClick={() => setChartType('profit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'profit'
                  ? 'bg-violet-500 text-white'
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
