import React from 'react';
import Button from './Button';

interface GroupedSupplierSelectorProps {
  supplierNames: string[];
  selectedSuppliers: string[];
  onToggleSupplier: (supplier: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  label?: string;
}

const SUPPLIER_GROUPS = [
  { id: 'jwali', label: 'Jwali', keyword: 'jwali' },
  { id: 'rayahi', label: 'Rayahi', keyword: 'rayahi' },
  { id: 'riyahi', label: 'Riyahi', keyword: 'riyahi' },
  { id: 'sabir', label: 'Sabir', keyword: 'sabir' },
  { id: 'fadli', label: 'Fadli', keyword: 'fadli' },
  { id: 'eleve', label: 'Eleve', keyword: 'eleve' },
  { id: 'c1', label: 'C1', keyword: 'c1' },
  { id: 'c2', label: 'C2', keyword: 'c2' },
  { id: 'c3', label: 'C3', keyword: 'c3' },
  { id: 'c4', label: 'C4', keyword: 'c4' },
  { id: 'c5', label: 'C5', keyword: 'c5' },
  { id: 'jalal', label: 'Jalal', keyword: 'jalal' },
  { id: 'dawi', label: 'Dawi', keyword: 'dawi' },
  { id: 'etoile', label: 'Etoile', keyword: 'etoile' },
  { id: 'solo', label: 'Solo', keyword: 'solo' },
  { id: 'fadmi', label: 'Fadmi', keyword: 'fadmi' },
  { id: 'elwardy', label: 'Elwardy', keyword: 'elwardy' },
  { id: 'stock', label: 'Stock', keyword: 'stock' },
  { id: 'stok', label: 'Stok', keyword: 'stok' },
  { id: 'sarij', label: 'Sarij', keyword: 'sarij' }
];

const GroupedSupplierSelector: React.FC<GroupedSupplierSelectorProps> = ({
  supplierNames,
  selectedSuppliers,
  onToggleSupplier,
  onSelectAll,
  onClearAll,
  label = 'Sélectionner des fournisseurs'
}) => {
  const selectGroup = (keyword: string) => {
    const matchingSuppliers = supplierNames.filter(name =>
      name.toLowerCase().includes(keyword.toLowerCase())
    );

    matchingSuppliers.forEach(supplier => {
      if (!selectedSuppliers.includes(supplier)) {
        onToggleSupplier(supplier);
      }
    });
  };

  const deselectGroup = (keyword: string) => {
    const matchingSuppliers = supplierNames.filter(name =>
      name.toLowerCase().includes(keyword.toLowerCase())
    );

    matchingSuppliers.forEach(supplier => {
      if (selectedSuppliers.includes(supplier)) {
        onToggleSupplier(supplier);
      }
    });
  };

  const isGroupSelected = (keyword: string) => {
    const matchingSuppliers = supplierNames.filter(name =>
      name.toLowerCase().includes(keyword.toLowerCase())
    );
    return matchingSuppliers.length > 0 &&
           matchingSuppliers.every(s => selectedSuppliers.includes(s));
  };

  const getGroupCount = (keyword: string) => {
    return supplierNames.filter(name =>
      name.toLowerCase().includes(keyword.toLowerCase())
    ).length;
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} ({selectedSuppliers.length} sélectionné{selectedSuppliers.length > 1 ? 's' : ''})
        </label>
        <div className="space-x-2">
          <Button variant="secondary" size="sm" onClick={onSelectAll}>
            Tout sélectionner
          </Button>
          <Button variant="secondary" size="sm" onClick={onClearAll}>
            Tout effacer
          </Button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Sélection par Groupe
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
          {SUPPLIER_GROUPS.map(group => {
            const count = getGroupCount(group.keyword);
            if (count === 0) return null;

            const isSelected = isGroupSelected(group.keyword);

            return (
              <button
                key={group.id}
                onClick={() => isSelected ? deselectGroup(group.keyword) : selectGroup(group.keyword)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-comagal-blue text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title={`${count} fournisseur${count > 1 ? 's' : ''}`}
              >
                {group.label}
                <span className="ml-1 text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {supplierNames.map(supplier => (
            <label
              key={supplier}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSuppliers.includes(supplier)}
                onChange={() => onToggleSupplier(supplier)}
                className="rounded border-gray-300 text-comagal-blue focus:ring-comagal-blue"
              />
              <span className="text-sm text-gray-900 dark:text-white">{supplier}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupedSupplierSelector;
