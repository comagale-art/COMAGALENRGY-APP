import React from 'react';
import { MaintenanceStatus as MaintenanceStatusType } from '../../../types';

interface MaintenanceStatusProps {
  status: MaintenanceStatusType;
  type: 'vidange' | 'document';
}

const MaintenanceStatus: React.FC<MaintenanceStatusProps> = ({ status, type }) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'pas_encore':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'proche':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expire':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'pas_encore':
        return type === 'vidange' 
          ? `Reste ${status.kmRestants?.toFixed(0)} km`
          : `${status.joursRestants} jours`;
      case 'proche':
        return type === 'vidange'
          ? `Vidange proche (${status.kmRestants?.toFixed(0)} km)`
          : `${status.joursRestants} jours`;
      case 'expire':
        return type === 'vidange'
          ? 'Vidange dépassée'
          : 'Expiré';
      default:
        return 'Inconnu';
    }
  };

  const getDocumentName = () => {
    if (type === 'document' && status.status !== 'pas_encore' && status.nomDocument) {
      return (
        <span className="ml-1 border-l border-current pl-1 opacity-75">
          {status.nomDocument}
        </span>
      );
    }
    return null;
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor()}`}>
      <span>{getStatusText()}</span>
      {getDocumentName()}
    </span>
  );
};

export default MaintenanceStatus;