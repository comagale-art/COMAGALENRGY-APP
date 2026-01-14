import React, { useState } from 'react';
import { Folder, FolderOpen, Trash2, Edit2, Users } from 'lucide-react';
import Button from '../../ui/Button';
import { SupplierFolder } from '../../../firebase/services/supplierFolders';

interface FolderListProps {
  folders: SupplierFolder[];
  supplierCounts: Record<string, number>;
  onSelectFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  selectedFolderId: string | null;
}

const FolderList: React.FC<FolderListProps> = ({
  folders,
  supplierCounts,
  onSelectFolder,
  onDeleteFolder,
  selectedFolderId
}) => {
  if (folders.length === 0) {
    return (
      <div className="text-center py-8">
        <Folder size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Aucun dossier créé. Cliquez sur "Nouveau Dossier" pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {folders.map((folder) => {
        const isSelected = selectedFolderId === folder.id;
        const count = supplierCounts[folder.id] || 0;

        return (
          <div
            key={folder.id}
            className={`
              relative rounded-lg border p-4 transition-all cursor-pointer
              ${isSelected
                ? 'border-comagal-blue bg-blue-50 dark:bg-blue-900/20 dark:border-comagal-light-blue'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }
            `}
            onClick={() => onSelectFolder(folder.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {isSelected ? (
                    <FolderOpen size={32} className="text-yellow-500" />
                  ) : (
                    <Folder size={32} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {folder.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Année {folder.year}
                  </p>
                  <div className="mt-2 flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                    <Users size={16} />
                    <span>{count} fournisseur{count > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
                className="flex items-center space-x-1"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FolderList;
