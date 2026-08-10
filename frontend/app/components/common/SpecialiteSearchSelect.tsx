'use client';

import { useEffect, useState, useRef } from 'react';
import { specialiteService } from '@/app/services/specialiteService';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';
import { Specialite } from '@/app/types/specialite';

interface SpecialiteSearchSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export const SpecialiteSearchSelect: React.FC<SpecialiteSearchSelectProps> = ({
  value,
  onChange,
  error,
  label = 'Spécialité',
  required = false,
  placeholder = 'Rechercher une spécialité...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSpecialite, setSelectedSpecialite] = useState<Specialite | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (!value) setSelectedSpecialite(null);
  }

  // Charger la spécialité sélectionnée si un ID est fourni
  useEffect(() => {
    if (value && !selectedSpecialite) {
      specialiteService.getById(value).then(spec => setSelectedSpecialite(spec)).catch(console.error);
    }
  }, [value, selectedSpecialite]);

  // Charger les spécialités avec recherche
  const loadSpecialites = async (search: string, pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const result = await specialiteService.search(search, { pageIndex: pageNum, pageSize: 10 });
      if (reset) {
        setSpecialites(result.items);
        setHasMore(result.pageIndex < result.totalPages);
      } else {
        setSpecialites(prev => [...prev, ...result.items]);
        setHasMore(result.pageIndex < result.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la recherche avec debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(1);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      loadSpecialites(term, 1, true);
    }, 300);
  };

  // Gestion du scroll infini
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadSpecialites(searchTerm, nextPage, false);
    }
  };

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && specialites.length === 0) {
      loadSpecialites('', 1, true);
    }
  };

  // Fermer la liste en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (spec: Specialite) => {
    setSelectedSpecialite(spec);
    onChange(spec.idSpecialite);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    setSelectedSpecialite(null);
    onChange(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`relative w-full rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 ${error ? 'border-red-500' : ''}`}
      >
        {selectedSpecialite ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">{selectedSpecialite.nomSpecialite}</span>
            <button type="button" onClick={clearSelection} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggle}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700"
          >
            <span className="text-gray-400">{placeholder}</span>
            <FaChevronDown className="text-gray-400" />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Rechercher..."
                className="w-full rounded-md border border-gray-200 py-1.5 pr-8 pl-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <FaSearch
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={12}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto" onScroll={handleScroll}>
            {specialites.length === 0 && !loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Aucune spécialité trouvée</div>
            )}
            {specialites.map((spec) => (
              <button
                key={spec.idSpecialite}
                type="button"
                onClick={() => handleSelect(spec)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
              >
                {spec.nomSpecialite}
              </button>
            ))}
            {loading && <div className="px-3 py-2 text-sm text-gray-400">Chargement...</div>}
          </div>
        </div>
      )}
    </div>
  );
};