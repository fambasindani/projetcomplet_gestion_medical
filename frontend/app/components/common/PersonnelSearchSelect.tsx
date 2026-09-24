'use client';

import { useEffect, useState, useRef } from 'react';
import { personnelService } from '@/app/services/personnelService';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';

interface PersonnelDisplay {
  idPersonnel: number;
  nom: string;
  prenom: string;
  email: string;
  fonction: string;
}

interface PersonnelSearchSelectProps {
  value: number | null;
  onChange: (id: number | null, nom?: string, prenom?: string, email?: string, fonction?: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  fonction?: string;
}

export const PersonnelSearchSelect: React.FC<PersonnelSearchSelectProps> = ({
  value,
  onChange,
  error,
  label = 'Personnel',
  required = false,
  placeholder = 'Rechercher un personnel...',
  fonction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [personnels, setPersonnels] = useState<PersonnelDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelDisplay | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (!value) setSelectedPersonnel(null);
  }

  // Charger le personnel sélectionné initial
  useEffect(() => {
    if (value && !selectedPersonnel) {
      personnelService.getById(value)
        .then(p => {
          setSelectedPersonnel({
            idPersonnel: p.idPersonnel,
            nom: p.nom,
            prenom: p.prenom,
            email: p.email || '',
            fonction: p.fonction,
          });
        })
        .catch(console.error);
    }
  }, [value, selectedPersonnel]);

  const searchPersonnel = async (search: string) => {
    setLoading(true);
    try {
      // Utiliser l'API de recherche existante (search) plutôt que getSimpleList
      const result = await personnelService.search(search, 1, 20, fonction);
      const items = result.items.map(p => ({
        idPersonnel: p.idPersonnel,
        nom: p.nom,
        prenom: p.prenom,
        email: p.email || '',
        fonction: p.fonction,
      }));
      setPersonnels(items);
    } catch (error) {
      console.error(error);
      setPersonnels([]);
    } finally {
      setLoading(false);
    }
  };

  // Recharge quand la fonction filtrée change.
  useEffect(() => {
    setPersonnels([]);
    if (isOpen) {
      void searchPersonnel('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fonction]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      searchPersonnel(term);
    }, 300);
  };

  const handleToggle = () => {
    if (!isOpen && personnels.length === 0) {
      searchPersonnel('');
    }
    setIsOpen(!isOpen);
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

  const handleSelect = (p: PersonnelDisplay) => {
    setSelectedPersonnel(p);
    onChange(p.idPersonnel, p.nom, p.prenom, p.email, p.fonction);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    setSelectedPersonnel(null);
    onChange(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative w-full rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 ${error ? 'border-red-500' : ''}`}>
        {selectedPersonnel ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">
              {selectedPersonnel.nom} {selectedPersonnel.prenom} - {selectedPersonnel.fonction}
            </span>
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
          <div className="border-b border-slate-200 p-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Rechercher par nom, prénom, fonction..."
                className="w-full rounded-md border border-slate-200 py-1.5 pr-8 pl-2 text-sm focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {personnels.length === 0 && !loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Aucun personnel trouvé</div>
            )}
            {personnels.map(p => (
              <button
                key={p.idPersonnel}
                type="button"
                onClick={() => handleSelect(p)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
              >
                <div className="font-medium">{p.nom} {p.prenom}</div>
                <div className="text-xs text-gray-500">{p.fonction} - {p.email}</div>
              </button>
            ))}
            {loading && <div className="px-3 py-2 text-sm text-gray-400">Chargement...</div>}
          </div>
        </div>
      )}
    </div>
  );
};