import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Card from '../../ui/Card';
import { TruckOilChange, TruckDocument } from '../../../types';
import Button from '../../ui/Button';
import { Pencil } from 'lucide-react';

interface MaintenanceTablesProps {
  oilChanges: TruckOilChange[];
  documents: TruckDocument[];
  onEditDocument?: (document: TruckDocument) => void;
}

const MaintenanceTables: React.FC<MaintenanceTablesProps> = ({ 
  oilChanges, 
  documents,
  onEditDocument 
}) => {
  return (
    <div className="space-y-6">
      <Card title="Historique des vidanges">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Kilométrage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Intervalle (km)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {oilChanges.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun historique de vidange
                  </td>
                </tr>
              ) : (
                oilChanges.map((change, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {format(new Date(change.dateVidange), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {change.kmActuel.toLocaleString()} km
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {change.intervalVidangeKm.toLocaleString()} km
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {change.description || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Documents du véhicule">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Document
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Date d'expiration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun document enregistré
                  </td>
                </tr>
              ) : (
                documents.map((doc, index) => {
                  const expirationDate = new Date(doc.dateExpiration);
                  const today = new Date();
                  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  let statusColor = 'text-green-600 dark:text-green-400';
                  let statusText = 'Valide';
                  
                  if (daysUntilExpiration <= 0) {
                    statusColor = 'text-red-600 dark:text-red-400';
                    statusText = 'Expiré';
                  } else if (daysUntilExpiration <= 30) {
                    statusColor = 'text-yellow-600 dark:text-yellow-400';
                    statusText = `Expire dans ${daysUntilExpiration} jours`;
                  }

                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {doc.nomDocument}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {format(expirationDate, 'dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 text-sm ${statusColor}`}>
                        {statusText}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditDocument?.(doc)}
                          className="inline-flex items-center space-x-1"
                        >
                          <Pencil size={16} />
                          <span>Modifier</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MaintenanceTables;