'use client';

import { useEffect, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { FaTimes } from 'react-icons/fa';
import { prescriptionService } from '@/app/services/prescriptionService';
import { Prescription } from '@/app/types/prescription';
import OrdonnancePDF from './OrdonnancePDF';
import SkeletonDetails from '@/app/ui/SkeletonDetails';

interface OrdonnanceModalProps {
  isOpen: boolean;
  prescriptionId: number | null;
  onClose: () => void;
}

export default function OrdonnanceModal({ isOpen, prescriptionId, onClose }: OrdonnanceModalProps) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (!isOpen) setPrescription(null);
  }

  useEffect(() => {
    if (isOpen && prescriptionId) {
      void (async () => {
        setLoading(true);
        try {
          const data = await prescriptionService.getById(prescriptionId);
          setPrescription(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isOpen, prescriptionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Ordonnance médicale</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 p-4" style={{ minHeight: '500px' }}>
          {loading ? (
            <SkeletonDetails />
          ) : prescription ? (
            <PDFViewer width="100%" height="100%" style={{ minHeight: '500px', border: 'none' }}>
              <OrdonnancePDF prescription={prescription} />
            </PDFViewer>
          ) : (
            <p className="text-center">Impossible de charger la prescription.</p>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}