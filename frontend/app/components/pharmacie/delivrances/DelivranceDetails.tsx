'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  FaPills, FaUser, FaUserMd, FaCalendarAlt,
  FaFileAlt, FaTrash, FaPrint, FaEdit
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import PageShell from '@/app/ui/PageShell';
import Button from '@/app/ui/Button';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
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
    <PageShell
      title="Détails de la délivrance"
      onBack={() => router.back()}
      actions={
        <>
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
    >
      <DetailBanner
        meta="Délivrance"
        title={`Délivrance #${delivrance.idDelivrance}`}
        subtitle={delivrance.numeroOrdonnance || 'Sans numéro d\'ordonnance'}
        badges={
          <>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${delivrance.signatureElectronique ? 'bg-green-500/20 text-green-100' : 'bg-slate-500/20 text-gray-100'}`}>
              {delivrance.signatureElectronique ? 'Signée' : 'Non signée'}
            </span>
            <span className="text-sm font-medium self-center">{motifLabels[delivrance.motifDelivrance]}</span>
          </>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaUser} label="Patient" value={delivrance.patientNom} />
          <InfoCard icon={FaUserMd} label="Médecin" value={delivrance.medecinNom || '-'} />
          <InfoCard icon={FaUserMd} label="Pharmacien" value={delivrance.pharmacienNom} />
          <InfoCard icon={FaCalendarAlt} label="Date" value={format(new Date(delivrance.dateDelivrance), 'dd/MM/yyyy')} />
        </InfoGrid>

        <div className="px-6 pb-6">
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaFileAlt /> Médicaments délivrés
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
                <tfoot className="bg-slate-50 font-bold">
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
      </DetailBanner>

      {showOrdonnanceModal && (
        <OrdonnanceModal
          isOpen={showOrdonnanceModal}
          prescriptionId={delivrance.idPrescriptionMed!}
          onClose={() => setShowOrdonnanceModal(false)}
        />
      )}
    </PageShell>
  );
}
