'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaUserMd, FaUserInjured, FaClipboardList,
  FaStethoscope, FaPrescriptionBottle, FaFlask, FaBandAid, FaEdit,
  FaTrash, FaClock, FaDumbbell
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { prescriptionService } from '@/app/services/prescriptionService';
import { Prescription, TypePrescription, StatutPrescription } from '@/app/types/prescription';

const statutStyles: Record<StatutPrescription, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Terminée': 'bg-blue-50 text-blue-700 border-blue-200',
  'Annulée': 'bg-red-50 text-red-700 border-red-200',
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200'
};

const typeIcons: Record<TypePrescription, ReactNode> = {
  [TypePrescription.Medicament]: <FaPrescriptionBottle />,
  [TypePrescription.Examen]: <FaFlask />,
  [TypePrescription.Soin]: <FaBandAid />,
  [TypePrescription.Reeducation]: <FaDumbbell />,
  [TypePrescription.Regime]: <FaClipboardList />
};

export default function PrescriptionDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      prescriptionService.getById(Number(id))
        .then(setPrescription)
        .catch(() => toast.error('Erreur de chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (!prescription) return <div className="p-10 text-center text-gray-500">Prescription introuvable.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Prescription #${prescription.numeroPrescription}`}
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/prescriptions')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/prescriptions/${id}/modifier`)}>
              Modifier
            </Button>
            <Button variant="danger" icon={<FaTrash />} onClick={() => {/* Logique */}}>
              Supprimer
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Header Moderne */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">Prescription #{prescription.numeroPrescription}</h1>
              <p className="opacity-80 flex items-center gap-2 text-sm">
                <FaClock /> {format(new Date(prescription.datePrescription), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statutStyles[prescription.statut]}`}>
              {prescription.statut.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Corps de page */}
        <div className="p-8 space-y-8">
          {/* Grille d'infos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem icon={FaUserInjured} label="Patient" value={`${prescription.patientNom} ${prescription.patientPrenom}`} />
            <InfoItem icon={FaUserMd} label="Médecin" value={`Dr. ${prescription.medecinNom}`} />
            <InfoItem icon={FaStethoscope} label="Type" value={prescription.typePrescription} iconComponent={typeIcons[prescription.typePrescription]} />
          </div>

          {/* Description & Notes */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-700">{prescription.description}</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instructions</h3>
              <p className="text-gray-700">{prescription.instructions || 'Aucune instruction particulière.'}</p>
            </div>
          </div>

          {/* Table Médicaments */}
          {prescription.typePrescription === TypePrescription.Medicament && (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <Table>
                <THead>
                  <tr>
                    <Th>Médicament</Th>
                    <Th align="center">Posologie</Th>
                    <Th align="center">Durée</Th>
                    <Th align="center">Qté</Th>
                  </tr>
                </THead>
                <TBody>
                  {prescription.prescriptionsMedicaments?.map((med) => (
                    <Tr key={med.idPrescriptionMed}>
                      <Td className="font-medium text-gray-900">{med.medicamentNom}</Td>
                      <Td className="text-center">{med.posologie}</Td>
                      <Td className="text-center">{med.dureeTraitement}</Td>
                      <Td className="text-center font-bold">{med.quantitePrescrite}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant utilitaire pour les infos
interface InfoItemProps {
  icon: IconType;
  label: string;
  value: string;
  iconComponent?: ReactNode;
}

function InfoItem({ icon: Icon, label, value, iconComponent }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-indigo-500 bg-indigo-50 p-2 rounded-lg">{iconComponent || <Icon />}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
