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
  FaTrash, FaClock, FaDumbbell, FaUserNurse
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoGrid, InfoCard } from '@/app/ui/InfoCard';
import Button from '@/app/ui/Button';
import { Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { prescriptionService } from '@/app/services/prescriptionService';
import { Prescription, TypePrescription, StatutPrescription } from '@/app/types/prescription';
import { useAuth } from '@/app/contexts/AuthContext';
import { peutModifier } from '@/app/utils/permissions';

const statutStyles: Record<StatutPrescription, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Terminee: 'bg-blue-50 text-blue-700 border-blue-200',
  Annulee: 'bg-red-50 text-red-700 border-red-200',
  EnAttente: 'bg-amber-50 text-amber-700 border-amber-200'
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
  const { user } = useAuth();
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

  const editable = peutModifier(user?.role, user?.medecinId, prescription.idMedecin);

  return (
    <PageShell
      title={`Prescription #${prescription.numeroPrescription}`}
      maxWidth="max-w-6xl"
      onBack={() => router.push('/prescriptions')}
      actions={
        <>
            <Button variant="secondary" icon={<FaFlask />} onClick={() => router.push(`/prescriptions/examens/${id}`)}>
              Examens
            </Button>
            <Button variant="secondary" icon={<FaUserNurse />} onClick={() => router.push(`/prescriptions/${id}/soins`)}>
              Soins
            </Button>
            {editable && (
              <Button icon={<FaEdit />} onClick={() => router.push(`/prescriptions/${id}/modifier`)}>
                Modifier
              </Button>
            )}
            {editable && (
              <Button variant="danger" icon={<FaTrash />} onClick={() => {/* Logique */}}>
                Supprimer
              </Button>
            )}
          </>
        }
      >

      <DetailBanner
        meta="Prescription"
        title={`Prescription #${prescription.numeroPrescription}`}
        subtitle={format(new Date(prescription.datePrescription), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
        badges={
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statutStyles[prescription.statut]}`}>
            {prescription.statut.replace('_', ' ')}
          </span>
        }
      >
        {/* Corps de page */}
        <div className="p-8 space-y-8">
          {/* Grille d'infos */}
          <InfoGrid className="p-0">
            <InfoCard icon={FaUserInjured} label="Patient" value={`${prescription.patientNom} ${prescription.patientPrenom}`} />
            <InfoCard icon={FaUserMd} label="Médecin" value={`Dr. ${prescription.medecinNom}`} />
            <InfoCard icon={FaStethoscope} label="Type" value={prescription.typePrescription} />
          </InfoGrid>

          {/* Description & Notes */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-700">{prescription.description}</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instructions</h3>
              <p className="text-gray-700">{prescription.instructions || 'Aucune instruction particulière.'}</p>
            </div>
          </div>

          {/* Table Médicaments */}
          {prescription.typePrescription === TypePrescription.Medicament && (
            <div className="overflow-hidden rounded-xl border border-slate-100">
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
      </DetailBanner>
    </PageShell>
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
