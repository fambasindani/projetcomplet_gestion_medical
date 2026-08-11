'use client';

import { useEffect, useState } from 'react';
import { categorieService } from '@/app/services/categorieService';

interface CategorieSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  hideLabel?: boolean;
}

export const CategorieSelect: React.FC<CategorieSelectProps> = ({ value, onChange, error, label = 'Catégorie', required = false, placeholder = 'Sélectionner une catégorie', hideLabel = false }) => {
  const [categories, setCategories] = useState<{ id: number; nom: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categorieService.getAll(1, 100).then(res => {
      setCategories(res.items.map(c => ({ id: c.idCategorie, nom: c.nomCategorie })));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {!hideLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${error ? 'border-red-500' : ''}`}
      >
        <option value="">{placeholder}</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.nom}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};