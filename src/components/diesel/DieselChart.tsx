import React, { useMemo, useState } from 'react';
import { useDiesel } from '../../context/DieselContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import Card from '../ui/Card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DieselChart: React.FC = () => {
  const { consumptions } = useDiesel();
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  const vehicles = useMemo(() => {
    const uniqueVehicles = new Set(consumptions.map(c => c.vehicle_name));
    return Array.from(uniqueVehicles).sort();
  }, [consumptions]);

  const chartData = useMemo(() => {
    const today = new Date();
    let filteredData = consumptions;

    if (selectedVehicle !== 'all') {
      filteredData = filteredData.filter(c => c.vehicle_name === selectedVehicle);
    }

    if (timeRange === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filteredData = filteredData.filter(c => new Date(c.date) >= startOfMonth);
    } else {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      filteredData = filteredData.filter(c => new Date(c.date) >= startOfYear);
    }

    const sortedData = [...filteredData].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = sortedData.map(c => format(new Date(c.date), 'dd MMM', { locale: fr }));
    const litersData = sortedData.map(c => Number(c.liters_calculated));
    const amountData = sortedData.map(c => Number(c.amount_dh));

    return {
      labels,
      datasets: [
        {
          label: 'Litres',
          data: litersData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Montant (DH)',
          data: amountData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  }, [consumptions, selectedVehicle, timeRange]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Litres',
          color: 'rgb(34, 197, 94)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Montant (DH)',
          color: 'rgb(59, 130, 246)',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Évolution de la consommation
        </h3>
        <div className="flex gap-3">
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les véhicules</option>
            {vehicles.map(vehicle => (
              <option key={vehicle} value={vehicle}>{vehicle}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'month' | 'year')}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      <div className="h-80">
        {chartData.labels.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Aucune donnée disponible pour la période sélectionnée
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </Card>
  );
};

export default DieselChart;
