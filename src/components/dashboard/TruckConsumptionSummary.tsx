import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { getTruckConsumptionEntries } from '../../firebase/services/truckConsumption';
import { getTruckMaintenanceStatus } from '../../firebase/services/truckMaintenance';
import { getCustomTrucks } from '../../firebase/services/trucks';
import MaintenanceStatus from '../trucks/maintenance/MaintenanceStatus';

interface Truck {
  id: string;
  name: string;
  consumption: number;
  logo: string;
}

const DEFAULT_TRUCKS = [
  {
    id: 'solo1',
    name: 'Solo 1',
    consumption: 35,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU'
  },
  {
    id: 'solo2',
    name: 'Solo 2',
    consumption: 35,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU'
  },
  {
    id: 'man',
    name: 'Man',
    consumption: 40,
    logo: 'https://media.cdnws.com/_i/46016/m250-6953/520/57/ref7man-stickers-man-logo-lion-droite-autocollant-camion-man-sticker-poid-lourd-truck.jpeg'
  },
  {
    id: 'renault',
    name: 'Renault',
    consumption: 38,
    logo: 'https://www.printpeelstick.co.uk/cdn/shop/collections/New_Renault_Logo-01_3be0c6b3-6e99-4955-a707-fdad3b1d8da3.png?v=1729543668&width=460'
  },
  {
    id: 'mutshi',
    name: 'Mutshi',
    consumption: 35,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU'
  },
  {
    id: 'radade',
    name: 'Radade',
    consumption: 35,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK7DjH2AFoq0f_lRTI2mXfjdcC5zpPP0VMN5lF7FtkOmxxNxf_hvjKT4h6BUjnTaV7KZ8&usqp=CAU'
  },
  {
    id: 'kadjar',
    name: 'Kadjar',
    consumption: 38,
    logo: 'https://www.printpeelstick.co.uk/cdn/shop/collections/New_Renault_Logo-01_3be0c6b3-6e99-4955-a707-fdad3b1d8da3.png?v=1729543668&width=460'
  },
  {
    id: 'soueast',
    name: 'Soueast',
    consumption: 38,
    logo: 'data:image/png;base64,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'
  },
  {
    id: 'hyundai',
    name: 'Hyundai Driss',
    consumption: 35,
    logo: 'https://static.vecteezy.com/ti/vecteur-libre/p1/20499812-hyundai-logo-marque-symbole-avec-nom-blanc-conception-sud-coreen-voiture-voiture-vecteur-illustration-avec-noir-contexte-gratuit-vectoriel.jpg'
  }
];

interface TruckData {
  remainingFuel: number;
  remainingDistance: number;
}

const TruckConsumptionSummary: React.FC = () => {
  const [truckData, setTruckData] = useState<Record<string, TruckData>>({});
  const [maintenanceStatus, setMaintenanceStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>(DEFAULT_TRUCKS);

  useEffect(() => {
    loadTruckData();
  }, []);

  const loadTruckData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load custom trucks
      const customTrucks = await getCustomTrucks();
      const allTrucks = [...DEFAULT_TRUCKS, ...customTrucks];
      setTrucks(allTrucks);
      
      const truckDataPromises = allTrucks.map(async (truck) => {
        const entries = await getTruckConsumptionEntries(truck.id);
        const status = await getTruckMaintenanceStatus(truck.id);
        
        return {
          truckId: truck.id,
          data: {
            remainingFuel: entries[0]?.remainingFuel || 0,
            remainingDistance: entries[0]?.remainingDistance || 0
          },
          status
        };
      });

      const results = await Promise.all(truckDataPromises);
      const newTruckData = {};
      const newMaintenanceStatus = {};
      
      results.forEach(({ truckId, data, status }) => {
        newTruckData[truckId] = data;
        newMaintenanceStatus[truckId] = status;
      });

      setTruckData(newTruckData);
      setMaintenanceStatus(newMaintenanceStatus);
    } catch (err) {
      console.error('Error loading truck data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card title="Suivi des Camions">
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-comagal-blue border-t-transparent"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Suivi des Camions">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Suivi des Camions">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trucks.map(truck => {
          const data = truckData[truck.id] || { remainingFuel: 0, remainingDistance: 0 };
          const status = maintenanceStatus[truck.id] || { vidange: {}, documents: {} };
          
          return (
            <div 
              key={truck.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-3 flex items-center space-x-3">
                <img 
                  src={truck.logo} 
                  alt={`Logo ${truck.name}`}
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {truck.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {truck.consumption} L/100km
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Carburant restant
                  </p>
                  <p className="text-lg font-semibold text-comagal-green dark:text-comagal-light-green">
                    {data.remainingFuel.toFixed(2)} L
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Distance restante
                  </p>
                  <p className="text-lg font-semibold text-comagal-blue dark:text-comagal-light-blue">
                    {data.remainingDistance.toFixed(2)} km
                  </p>
                </div>

                <div className="space-y-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vidange</p>
                    <MaintenanceStatus status={status.vidange} type="vidange" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
                    <MaintenanceStatus status={status.documents} type="document" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TruckConsumptionSummary;