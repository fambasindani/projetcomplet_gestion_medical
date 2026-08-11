'use client';

import { useEffect, useState, useRef } from 'react';
import { lotService } from '@/app/services/lotService';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';

interface LotSearchSelectProps {
  value: number | null;
  onChange: (id: number | null, numeroLot?: string, medicamentNom?: string, prixVenteUnitaire?: number) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  medicamentId?: number;
}

interface LotDisplay {
  id: number;
  numeroLot: string;
  medicamentNom: string;
  medicamentId: number;
  quantiteRestante: number;
  prixVenteUnitaire: number;
}

export const LotSearchSelect: React.FC<LotSearchSelectProps> = ({
  value,
  onChange,
  error,
  label = 'Lot',
  required = false,
  placeholder = 'Rechercher un lot...',
  disabled = false,
  medicamentId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lots, setLots] = useState<LotDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLot, setSelectedLot] = useState<LotDisplay | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (!value) setSelectedLot(null);
  }

  // Charger le lot sélectionné initial
  useEffect(() => {
    if (value && !selectedLot) {
      lotService.getById(value)
        .then(lot => {
          setSelectedLot({
            id: lot.idLot,
            numeroLot: lot.numeroLot,
            medicamentNom: lot.medicamentNom || '',
            medicamentId: lot.idMedicament,
            quantiteRestante: lot.quantiteRestante,
            prixVenteUnitaire: lot.prixVenteUnitaire ?? 0,
          });
        })
        .catch(console.error);
    }
  }, [value, selectedLot]);

  const searchLots = async (search: string) => {
    setLoading(true);
    try {
      const params: { idMedicament?: number; numeroLot?: string; pageIndex: number; pageSize: number } = { pageIndex: 1, pageSize: 20 };
      if (search.trim()) params.numeroLot = search.trim();
      if (medicamentId) params.idMedicament = medicamentId;
      const result = await lotService.search(params);
      const items = result.items.map(lot => ({
        id: lot.idLot,
        numeroLot: lot.numeroLot,
        medicamentNom: lot.medicamentNom || '',
        medicamentId: lot.idMedicament,
        quantiteRestante: lot.quantiteRestante,
        prixVenteUnitaire: lot.prixVenteUnitaire ?? 0,
      }));
      setLots(items);
    } catch (error) {
      console.error(error);
      setLots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      searchLots(term);
    }, 300);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && lots.length === 0) {
      searchLots('');
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

  const handleSelect = (lot: LotDisplay) => {
    setSelectedLot(lot);
    onChange(lot.id, lot.numeroLot, lot.medicamentNom, lot.prixVenteUnitaire);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    setSelectedLot(null);
    onChange(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`relative w-full rounded-md border border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 ${
          error ? 'border-red-500' : ''
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        {selectedLot ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">
              {selectedLot.numeroLot} - {selectedLot.medicamentNom}
              {selectedLot.quantiteRestante !== undefined && (
                <span className="ml-2 text-xs text-gray-500">
                  (Stock: {selectedLot.quantiteRestante})
                </span>
              )}
              <span className="ml-2 text-xs text-green-600">
                {selectedLot.prixVenteUnitaire.toFixed(2)} $
              </span>
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600"
              disabled={disabled}
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggle}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700"
            disabled={disabled}
          >
            <span className="text-gray-400">{placeholder}</span>
            <FaChevronDown className="text-gray-400" />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Numéro de lot..."
                className="w-full rounded-md border border-gray-200 py-1.5 pr-8 pl-2 text-sm focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {lots.length === 0 && !loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Aucun lot trouvé</div>
            )}
            {lots.map(lot => (
              <button
                key={lot.id}
                type="button"
                onClick={() => handleSelect(lot)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
              >
                <div className="font-medium">{lot.numeroLot}</div>
                <div className="text-xs text-gray-500">{lot.medicamentNom}</div>
                <div className="text-xs text-gray-400">
                  Stock: {lot.quantiteRestante} | Prix: {lot.prixVenteUnitaire.toFixed(2)} $
                </div>
              </button>
            ))}
            {loading && <div className="px-3 py-2 text-sm text-gray-400">Chargement...</div>}
          </div>
        </div>
      )}
    </div>
  );
};