'use client';

import { useEffect, useState, useRef } from 'react';
import { fournisseurService } from '@/app/services/fournisseurService';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';

interface FournisseurSearchSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export const FournisseurSearchSelect: React.FC<FournisseurSearchSelectProps> = ({
  value,
  onChange,
  error,
  label = 'Fournisseur',
  required = false,
  placeholder = 'Rechercher un fournisseur...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fournisseurs, setFournisseurs] = useState<{ id: number; nom: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<{ id: number; nom: string } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (!value) setSelectedFournisseur(null);
  }

  useEffect(() => {
    if (value && !selectedFournisseur) {
      fournisseurService.getById(value).then(f => setSelectedFournisseur({ id: f.idFournisseur, nom: f.nomFournisseur })).catch(console.error);
    }
  }, [value, selectedFournisseur]);

  const loadFournisseurs = async (search: string) => {
    setLoading(true);
    try {
      const res = await fournisseurService.search({ nom: search, pageIndex: 1, pageSize: 20 });
      setFournisseurs(res.items.map(f => ({ id: f.idFournisseur, nom: f.nomFournisseur })));
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
      loadFournisseurs(term);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && fournisseurs.length === 0) loadFournisseurs('');
  };

  const handleSelect = (f: { id: number; nom: string }) => {
    setSelectedFournisseur(f);
    onChange(f.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    setSelectedFournisseur(null);
    onChange(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative w-full rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 ${error ? 'border-red-500' : ''}`}>
        {selectedFournisseur ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">{selectedFournisseur.nom}</span>
            <button type="button" onClick={clearSelection} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
          </div>
        ) : (
          <button type="button" onClick={handleToggle} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700">
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
              <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Rechercher..." className="w-full rounded-md border border-gray-200 py-1.5 pr-8 pl-2 text-sm focus:border-indigo-500 focus:outline-none" />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {fournisseurs.length === 0 && !loading && <div className="px-3 py-2 text-sm text-gray-500">Aucun fournisseur trouvé</div>}
            {fournisseurs.map(f => (
              <button key={f.id} type="button" onClick={() => handleSelect(f)} className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50">
                {f.nom}
              </button>
            ))}
            {loading && <div className="px-3 py-2 text-sm text-gray-400">Chargement...</div>}
          </div>
        </div>
      )}
    </div>
  );
};