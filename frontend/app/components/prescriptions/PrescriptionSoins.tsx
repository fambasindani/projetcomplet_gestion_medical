// app/prescriptions/soins/[id]/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaArrowLeft, FaBandAid } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { soinPrescritService } from '@/app/services/soinPrescritService';
import { prescriptionService } from '@/app/services/prescriptionService';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageShell from '@/app/ui/PageShell';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import type { SoinPrescrit } from '@/app/types/soin';
import type { Prescription } from '@/app/types/prescription';

const statutColors: Record<string, string> = {
  Prescrit: 'bg-yellow-100 text-yellow-800',
  EnCours: 'bg-blue-100 text-blue-800',
  Realise: 'bg-green-100 text-green-800',
  Annule: 'bg-red-100 text-red-800',
};

export default function PrescriptionSoins() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const prescriptionId = Number(id);

  const confirm = useConfirm();
  const [soins, setSoins] = useState<SoinPrescrit[]>([]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // Validation stricte
    if (!id || isNaN(prescriptionId) || prescriptionId <= 0) {
      toast.error('ID de prescription invalide');
      router.push('/prescriptions');
      return;
    }

    setLoading(true);
    try {
      const [soinsData, prescriptionData] = await Promise.all([
        soinPrescritService.getByPrescription(prescriptionId),
        prescriptionService.getById(prescriptionId),
      ]);
      setSoins(soinsData);
      setPrescription(prescriptionData);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id, prescriptionId, router]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleDelete = async (soin: SoinPrescrit) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer le soin "${soin.description}" ?`,
    });
    if (!ok) return;
    try {
      await soinPrescritService.delete(soin.idSoin);
      toast.success('Soin supprimé');
      fetchData();
    } catch {
      toast.error('Erreur');
    }
  };

  const handleEdit = (soin: SoinPrescrit) => {
    router.push(`/prescriptions/soins/${soin.idSoin}/modifier`);
  };

  const handleAdd = () => {
    if (!prescription) return;
    router.push(`/prescriptions/${prescriptionId}/soins/nouveau?patient=${prescription.idPatient}`);
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;
  if (!prescription) return <div className="p-6 text-center">Prescription non trouvée</div>;

  return (
    <PageShell
      title="Soins de la prescription"
      subtitle={
        <span>
          Prescription n° {prescription.numeroPrescription} – {prescription.patientNom} {prescription.patientPrenom}
        </span>
      }
      maxWidth="max-w-6xl"
      onBack={() => router.push('/prescriptions')}
      backLabel="Retour aux prescriptions"
      actions={
        <>
          <Button variant="secondary" onClick={() => router.push(`/prescriptions/examens/${prescriptionId}`)}>
            Voir les examens
          </Button>
          <Button icon={<FaPlus />} onClick={handleAdd}>
            Ajouter un soin
          </Button>
        </>
      }
    >

      {soins.length === 0 ? (
        <EmptyState
          icon={<FaBandAid />}
          title="Aucun soin associé"
          description="Aucun soin associé à cette prescription."
          action={
            <Button icon={<FaPlus />} onClick={handleAdd}>
              Ajouter un soin
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Description</Th>
                <Th>Fréquence</Th>
                <Th>Durée</Th>
                <Th>Statut</Th>
                <Th>Date</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {soins.map((s) => (
                <Tr key={s.idSoin}>
                  <Td>{s.description}</Td>
                  <Td>{s.frequence || '-'}</Td>
                  <Td>{s.duree || '-'}</Td>
                  <Td>
                    <span className={`px-2 py-1 rounded-full text-xs ${statutColors[s.statut]}`}>{s.statut}</span>
                  </Td>
                  <Td>{format(new Date(s.datePrescription), 'dd/MM/yyyy HH:mm')}</Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="blue" title="Modifier" onClick={() => handleEdit(s)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(s)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}

      <Button variant="ghost" icon={<FaArrowLeft />} onClick={() => router.push('/prescriptions')}>
        Retour aux prescriptions
      </Button>
    </PageShell>
  );
}
