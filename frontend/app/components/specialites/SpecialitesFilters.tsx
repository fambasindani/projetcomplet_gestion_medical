// components/specialites/SpecialitesFilters.tsx
'use client';

import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

interface FiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (filter: string) => void;
  onSortChange: (sortBy: string, descending: boolean) => void;
  totalCount: number;
  activeFilter: string;
}

const SpecialitesFilters: React.FC<FiltersProps> = ({
  onSearch,
  onFilterChange,
  onSortChange,
  activeFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDescending, setSortDescending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filters = [
    { value: 'all', label: 'Toutes', color: 'primary' },
    { value: 'actives', label: 'Actives', color: 'success' },
    { value: 'inactives', label: 'Inactives', color: 'secondary' },
    { value: 'avec-medecins', label: 'Avec médecins', color: 'info' },
    { value: 'sans-medecins', label: 'Sans médecins', color: 'warning' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const activeFilterLabel = filters.find((f) => f.value === activeFilter)?.label || 'Filtré';

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search & filter toggle */}
        <div className="flex flex-1 gap-3">
          <form onSubmit={handleSearch} className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-indigo-500 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FaFilter /> Filtres
            {activeFilter !== 'all' && (
              <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                {activeFilterLabel}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setSortDescending(!sortDescending);
              onSortChange('nomSpecialite', !sortDescending);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {sortDescending ? <FaSortAmountDown /> : <FaSortAmountUp />}
            Trier
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeFilter === filter.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialitesFilters;