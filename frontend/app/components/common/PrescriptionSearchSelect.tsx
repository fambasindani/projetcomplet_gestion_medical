'use client';

import { useEffect, useState, useRef } from 'react';
import { prescriptionService } from '@/app/services/prescriptionService';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';

interface PrescriptionSearchSelectProps {
  value: number | null;
  onChange: (id: number | null, numeroPrescription?: string, patientNom?: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  patientId?: number; // optionnel : filtrer par patient
}

interface PrescriptionDisplay {
  id: number;
  numeroPrescription: string;
  patientNom: string;
  patientPrenom: string;
  datePrescription: string;
}

export const PrescriptionSearchSelect: React.FC<PrescriptionSearchSelectProps> = ({
  value,
  onChange,
  error,
  label = 'Prescription',
  required = false,
  placeholder = 'Rechercher une prescription...',
  disabled = false,
  patientId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDisplay | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (!value) setSelectedPrescription(null);
  }

  // Charger la prescription sélectionnée initiale
  useEffect(() => {
    if (value && !selectedPrescription) {
      prescriptionService.getById(value)
        .then(p => {
          setSelectedPrescription({
            id: p.idPrescription,
            numeroPrescription: p.numeroPrescription,
            patientNom: p.patientNom,
            patientPrenom: p.patientPrenom,
            datePrescription: p.datePrescription,
          });
        })
        .catch(console.error);
    }
  }, [value, selectedPrescription]);

  const searchPrescriptions = async (search: string) => {
    setLoading(true);
    try {
      const filters: { idPatient?: number; keyword?: string; pageIndex: number; pageSize: number } = { pageIndex: 1, pageSize: 20 };
      if (search.trim()) {
        // On utilise le search générique (si disponible) ou on passe par un paramètre texte
        // Ici on suppose que l'API supporte un paramètre 'keyword'
        // Sinon, on peut filtrer côté front après récupération de toutes les prescriptions (pas recommandé)
        // On appelle search avec un filtre texte (à adapter selon votre backend)
        filters.keyword = search.trim();
      }
      if (patientId) filters.idPatient = patientId;
      const result = await prescriptionService.search(filters, 1, 20);
      const items = result.items.map(p => ({
        id: p.idPrescription,
        numeroPrescription: p.numeroPrescription,
        patientNom: p.patientNom,
        patientPrenom: p.patientPrenom,
        datePrescription: p.datePrescription,
      }));
      setPrescriptions(items);
    } catch (error) {
      console.error(error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      searchPrescriptions(term);
    }, 300);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && prescriptions.length === 0) {
      searchPrescriptions('');
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

  const handleSelect = (prescription: PrescriptionDisplay) => {
    setSelectedPrescription(prescription);
    onChange(prescription.id, prescription.numeroPrescription, `${prescription.patientNom} ${prescription.patientPrenom}`);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    setSelectedPrescription(null);
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
        {selectedPrescription ? (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm">
              {selectedPrescription.numeroPrescription} - {selectedPrescription.patientNom} {selectedPrescription.patientPrenom} ({format(new Date(selectedPrescription.datePrescription), 'dd/MM/yyyy')})
            </span>
            <button type="button" onClick={clearSelection} className="text-gray-400 hover:text-gray-600" disabled={disabled}>
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
                placeholder="Numéro de prescription, patient..."
                className="w-full rounded-md border border-gray-200 py-1.5 pr-8 pl-2 text-sm focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {prescriptions.length === 0 && !loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Aucune prescription trouvée</div>
            )}
            {prescriptions.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
              >
                <div className="font-medium">{p.numeroPrescription}</div>
                <div className="text-xs text-gray-500">
                  {p.patientNom} {p.patientPrenom} - {format(new Date(p.datePrescription), 'dd/MM/yyyy HH:mm')}
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