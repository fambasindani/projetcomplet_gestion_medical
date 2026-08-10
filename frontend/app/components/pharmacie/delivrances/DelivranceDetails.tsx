'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaPills, FaUser, FaUserMd, FaCalendarAlt,
  FaFileAlt, FaTrash, FaPrint, FaEdit
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { delivranceService } from '@/app/services/delivranceService';
import { DelivranceResponse } from '@/app/types/delivrance';
import OrdonnanceModal from '../../prescriptions/OrdonnanceModal';

const motifLabels: Record<string, string> = {
  SUR_ORDONNANCE: 'Sur ordonnance',
  URGENCE: 'Urgence',
  GRATUITE: 'Gratuite'
};

export default function DelivranceDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const [delivrance, setDelivrance] = useState<DelivranceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false);

  useEffect(() => {
    if (id) {
      delivranceService.getById(Number(id))
        .then(setDelivrance)
        .catch(() => toast.error('Erreur de chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer la délivrance n°${delivrance?.idDelivrance} ?` });
    if (!ok) return;
    try {
      await delivranceService.delete(Number(id));
      toast.success('Délivrance supprimée');
      router.push('/pharmacie/delivrances');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <SkeletonDetails />;
  if (!delivrance) return (
    <EmptyState
      icon={<FaPills />}
      title="Délivrance introuvable"
      description="La délivrance demandée n'existe pas ou a été supprimée."
    />
  );

  const totalMutuelle = delivrance.details.reduce((sum, d) => sum + (d.priseEnChargeMutuelle || 0), 0);
  const totalReste = delivrance.details.reduce((sum, d) => sum + (d.resteACharge || 0), 0);
  const totalMontant = delivrance.details.reduce((sum, d) => sum + (d.montantLigne || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails de la délivrance"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/delivrances')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/pharmacie/delivrances/${id}/modifier`)}>
              Modifier
            </Button>
            <Button variant="secondary" icon={<FaPrint />} onClick={() => setShowOrdonnanceModal(true)} disabled={!delivrance.idPrescriptionMed}>
              {delivrance.idPrescriptionMed ? "Imprimer l'ordonnance" : "Aucune ordonnance"}
            </Button>
            <Button variant="danger" icon={<FaTrash />} onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Délivrance #{delivrance.idDelivrance}</h1>
              <p className="opacity-90 mt-1 flex items-center gap-2">
                <FaFileAlt /> {delivrance.numeroOrdonnance || 'Sans numéro d\'ordonnance'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${delivrance.signatureElectronique ? 'bg-green-500/20 text-green-100' : 'bg-gray-500/20 text-gray-100'}`}>
                {delivrance.signatureElectronique ? 'Signée' : 'Non signée'}
              </span>
              <span className="text-sm font-medium">{motifLabels[delivrance.motifDelivrance]}</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Grille Infos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoBox title="Patient" value={delivrance.patientNom} icon={FaUser} />
            <InfoBox title="Médecin" value={delivrance.medecinNom || '-'} icon={FaUserMd} />
            <InfoBox title="Pharmacien" value={delivrance.pharmacienNom} icon={FaUserMd} />
            <InfoBox title="Date" value={format(new Date(delivrance.dateDelivrance), 'dd/MM/yyyy')} icon={FaCalendarAlt} />
          </div>

          {/* Table Médicaments */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaPills /> Médicaments délivrés
            </h3>
            <TableContainer>
              <Table>
                <THead>
                  <tr>
                    <Th>Médicament</Th>
                    <Th align="center">Qté</Th>
                    <Th align="right">Mutuelle</Th>
                    <Th align="right">Reste à charge</Th>
                    <Th align="right">Total</Th>
                  </tr>
                </THead>
                <TBody>
                  {delivrance.details.map(d => (
                    <Tr key={d.idDetailDelivrance}>
                      <Td className="font-medium text-gray-900">{d.medicamentNom}</Td>
                      <Td className="text-center">{d.quantiteDelivree}</Td>
                      <Td className="text-right">${d.priseEnChargeMutuelle.toFixed(2)}</Td>
                      <Td className="text-right">${d.resteACharge.toFixed(2)}</Td>
                      <Td className="text-right font-bold text-indigo-600">${d.montantLigne.toFixed(2)}</Td>
                    </Tr>
                  ))}
                </TBody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={2} className="px-5 py-3 text-right">Totaux</td>
                    <td className="px-5 py-3 text-right">${totalMutuelle.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">${totalReste.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">${totalMontant.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </Table>
            </TableContainer>
          </section>

        </div>
      </div>

      {showOrdonnanceModal && (
        <OrdonnanceModal
          isOpen={showOrdonnanceModal}
          prescriptionId={delivrance.idPrescriptionMed!}
          onClose={() => setShowOrdonnanceModal(false)}
        />
      )}
    </div>
  );
}

function InfoBox({ title, value, icon: Icon }: { title: string; value: string; icon: IconType }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-2">
        <Icon /> {title}
      </p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}
