import React from 'react';
import Card from '../../ui/Card';

const ConsumptionExplanation: React.FC = () => {
  return (
    <Card title="Explications des calculs">
      <div className="space-y-6">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
            Carburant initial (L)
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>= (Argent de carburant ÷ Prix de carburant) + Carburant restant précédent</p>
            <div className="mt-2 rounded border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
              <p className="font-mono">
                Carburant initial = (Argent MAD ÷ Prix MAD/L) + Restant précédent L
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
            Carburant consommé (L)
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>= (Distance parcourue × % Consommation) ÷ 100</p>
            <div className="mt-2 rounded border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
              <p className="font-mono">
                Carburant consommé = (Distance Km × P L/100km) ÷ 100
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
            Autres calculs
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>Distance parcourue = Km présent - Km passé</p>
            <p>Distance totale = Carburant initial × (100 ÷ % Consommation)</p>
            <p>Carburant restant = Carburant initial - Carburant consommé</p>
            <p>Distance restante = Distance totale - Distance parcourue</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConsumptionExplanation;