'use client';

import { useEffect, useRef, useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { acteCatalogueService, type ActeCatalogue } from '@/app/services/acteCatalogueService';
import type { CategorieActeMedical } from '@/app/types/facture';

interface ActeAutocompleteProps {
  categorie: CategorieActeMedical | '';
  idGroupe?: number | null;
  value: string;
  onChange: (text: string) => void;
  onSelect: (acte: ActeCatalogue) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ActeAutocomplete({
  categorie,
  idGroupe,
  value,
  onChange,
  onSelect,
  onClear,
  placeholder = 'Rechercher un acte du catalogue...',
  disabled = false,
}: ActeAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<ActeCatalogue[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ActeCatalogue | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!categorie && !value.trim()) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await acteCatalogueService.search(categorie || undefined, idGroupe || undefined, value.trim() || undefined);
        setSuggestions(results.slice(0, 15));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [value, categorie, idGroupe, open]);

  const handleSelect = (acte: ActeCatalogue) => {
    setSelected(acte);
    onChange(acte.libelle);
    onSelect(acte);
    setOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    onChange('');
    onClear?.();
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center rounded-l-xl bg-slate-50 text-gray-400 transition-colors group-focus-within:bg-indigo-50 group-focus-within:text-indigo-500">
          <FaSearch className="h-4 w-4" />
        </div>
        <input
          type="text"
          className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            setSelected(null);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            title="Effacer"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (value.trim().length >= 1 || suggestions.length > 0) && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Recherche...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Aucun acte trouvé dans le catalogue</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {suggestions.map((acte) => (
                <li key={acte.idActeCatalogue}>
                  <button
                    type="button"
                    onClick={() => handleSelect(acte)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-indigo-50 ${
                      selected?.idActeCatalogue === acte.idActeCatalogue ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <span>
                      <span className="block font-medium text-gray-800">{acte.libelle}</span>
                      <span className="block text-xs text-gray-500">
                        {acte.groupeLibelle} · {acte.code}
                      </span>
                    </span>
                    <span className="whitespace-nowrap font-semibold text-indigo-600">
                      {acte.prixDefaut.toFixed(2)} $
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
