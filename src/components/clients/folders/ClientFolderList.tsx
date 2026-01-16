import React from 'react';
import { Folder, Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import { ClientFolder } from '../../../firebase/services/clientFolders';

interface ClientFolderListProps {
  folders: ClientFolder[];
  clientCounts: Record<string, number>;
  onSelectFolder: (folderId: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  selectedFolderId: string | null;
}

const ClientFolderList: React.FC<ClientFolderListProps> = ({
  folders,
  clientCounts,
  onSelectFolder,
  onDeleteFolder,
  selectedFolderId
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <button
        onClick={() => onSelectFolder(null)}
        className={`flex items-center justify-between rounded-lg border-2 p-4 transition-all ${
          selectedFolderId === null
            ? 'border-comagal-blue bg-comagal-blue/10 dark:bg-comagal-blue/20'
            : 'border-gray-200 hover:border-comagal-blue dark:border-gray-700'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Folder className="text-gray-500 dark:text-gray-400" size={24} />
          <div className="text-left">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Non assignés
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clients sans dossier
            </p>
          </div>
        </div>
      </button>

      {folders.map((folder) => (
        <div
          key={folder.id}
          className={`flex items-center justify-between rounded-lg border-2 p-4 transition-all ${
            selectedFolderId === folder.id
              ? 'border-comagal-blue bg-comagal-blue/10 dark:bg-comagal-blue/20'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <button
            onClick={() => onSelectFolder(folder.id)}
            className="flex flex-1 items-center space-x-3 text-left"
          >
            <Folder className="text-comagal-blue dark:text-comagal-light-blue" size={24} />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {folder.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {clientCounts[folder.id] || 0} client{(clientCounts[folder.id] || 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(folder.id);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}

      {folders.length === 0 && (
        <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
          Aucun dossier. Créez-en un pour organiser vos clients.
        </p>
      )}
    </div>
  );
};

export default ClientFolderList;
