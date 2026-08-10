// app/ui/SelectionModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from './Modal';
import { FaSearch, FaUser } from 'react-icons/fa';

interface SelectableItem {
  id: number;
  nom: string;
  prenom: string;
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: SelectableItem) => void;  // Retourne l'élément sélectionné
  title: string;
  fetchItems: (search: string) => Promise<SelectableItem[]>;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  fetchItems,
}) => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<SelectableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadItems = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const data = await fetchItems(search);
      if (isMounted.current) {
        setItems(data);
      }
    } catch (error) {
      console.error(error);
      if (isMounted.current) setItems([]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [isOpen, search, fetchItems]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(() => {
        loadItems();
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [isOpen, search, loadItems]);

  const handleSelect = (item: SelectableItem) => {
    onSelect(item);
    onClose();  // Ferme le modal immédiatement
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500">Aucun résultat</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="flex cursor-pointer items-center gap-3 rounded-md p-3 hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={false}  // Pas d'état interne, sélection directe
                  onChange={() => handleSelect(item)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <FaUser className="text-gray-400" />
                <div className="font-medium text-gray-800">
                  {item.nom} {item.prenom}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SelectionModal;