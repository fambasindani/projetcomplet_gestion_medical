'use client';

import { useEffect, useState, useRef } from 'react';
import { medecinService } from '@/app/services/medecinService';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';

interface MedecinSearchSelectProps {
  value: number | null;
  onChange: (id: number | null, nom?: string, prenom?: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export const MedecinSearchSelect: React.FC<MedecinSearchSelectProps> = ({
  value,
  onChange,
  error,
  label = 'Médecin',
  required = false,
  placeholder = 'Rechercher un médecin...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [medecins, setMedecins] = useState<{ id: number; nom: string; prenom: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState<{ id: number; nom: string; prenom: string } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (!value) setSelectedMedecin(null);
  }

  useEffect(() => {
    if (value && !selectedMedecin) {
      medecinService.getSimpleList().then(list => {
        const found = list.find(m => m.id === value);
        if (found) setSelectedMedecin(found);
      }).catch(console.error);
    }
  }, [value, selectedMedecin]);

  const loadMedecins = async (search: string) => {
    setLoading(true);
    try {
      const list = await medecinService.getSimpleList(search);
      setMedecins(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      loadMedecins(term);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && medecins.length === 0) {
      loadMedecins('');
    }
  };

  const handleSelect = (medecin: { id: number; nom: string; prenom: string }) => {
    setSelectedMedecin(medecin);
    onChange(medecin.id, medecin.nom, medecin.prenom);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    setSelectedMedecin(null);
    onChange(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative w-full rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 ${error ? 'border-red-500' : ''}`}>
        {selectedMedecin ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">Dr. {selectedMedecin.nom} {selectedMedecin.prenom}</span>
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
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {medecins.length === 0 && !loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Aucun médecin trouvé</div>
            )}
            {medecins.map(medecin => (
              <button
                key={medecin.id}
                type="button"
                onClick={() => handleSelect(medecin)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
              >
                Dr. {medecin.nom} {medecin.prenom}
              </button>
            ))}
            {loading && <div className="px-3 py-2 text-sm text-gray-400">Chargement...</div>}
          </div>
        </div>
      )}
    </div>
  );
};