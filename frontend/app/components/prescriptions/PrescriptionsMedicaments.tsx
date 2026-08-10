'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaEye, FaEdit, FaTrash, FaBan, FaPrint, FaPrescriptionBottle } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { prescriptionService } from '@/app/services/prescriptionService';
import { Prescription, StatutPrescription, TypePrescription } from '@/app/types/prescription';
import { PagedResult } from '@/app/types/pagination';
import OrdonnanceModal from './OrdonnanceModal';

const statutColors: Record<StatutPrescription, string> = {
  Active: 'bg-green-100 text-green-800',
  Terminée: 'bg-gray-100 text-gray-800',
  Annulée: 'bg-red-100 text-red-800',
  'En attente': 'bg-yellow-100 text-yellow-800'
};

export default function PrescriptionsMedicaments() {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<Prescription> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await prescriptionService.getByType(TypePrescription.Medicament, pagination.pageIndex, pagination.pageSize);
      setPagedData(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleDelete = async (p: Prescription) => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer la prescription ${p.numeroPrescription} ?` });
    if (!ok) return;
    await prescriptionService.delete(p.idPrescription);
    toast.success('Supprimée');
    fetchData();
  };

  const handleAnnuler = async (p: Prescription) => {
    const motif = window.prompt('Motif d\'annulation');
    if (!motif) return;
    await prescriptionService.annuler(p.idPrescription, motif);
    toast.success('Annulée');
    fetchData();
  };

  const handlePrintOrdonnance = (id: number) => {
    setSelectedPrescriptionId(id);
    setModalOpen(true);
  };

  if (loading) return <SkeletonTable columns={7} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions médicaments"
        subtitle={`${pagedData?.totalCount || 0} prescriptions`}
        actions={
          <Button icon={<FaPrescriptionBottle />} onClick={() => router.push('/prescriptions/nouveau?type=Medicament')}>
            Nouvelle prescription médicament
          </Button>
        }
      />

      {!pagedData || pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaPrescriptionBottle />}
          title="Aucune prescription médicament"
          description="Créez une nouvelle prescription médicament pour démarrer"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N°</Th>
                <Th>Date</Th>
                <Th>Patient</Th>
                <Th>Médecin</Th>
                <Th>Description</Th>
                <Th>Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((p: Prescription) => (
                <Tr key={p.idPrescription}>
                  <Td className="font-mono">{p.numeroPrescription}</Td>
                  <Td>{format(new Date(p.datePrescription), 'dd/MM/yyyy HH:mm')}</Td>
                  <Td>{p.patientNom} {p.patientPrenom}</Td>
                  <Td>Dr. {p.medecinNom} {p.medecinPrenom}</Td>
                  <Td className="max-w-xs truncate">{p.description}</Td>
                  <Td>
                    <span className={`px-2 py-1 rounded-full text-xs ${statutColors[p.statut]}`}>{p.statut}</span>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="indigo" title="Détails" onClick={() => router.push(`/prescriptions/${p.idPrescription}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => router.push(`/prescriptions/${p.idPrescription}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="green" title="Imprimer l'ordonnance" onClick={() => handlePrintOrdonnance(p.idPrescription)}>
                        <FaPrint size={14} />
                      </IconButton>
                      {p.statut !== 'Annulée' && (
                        <IconButton color="gray" title="Annuler" onClick={() => handleAnnuler(p)}>
                          <FaBan size={14} />
                        </IconButton>
                      )}
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(p)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagedData.totalPages > 1 && (
            <Pagination pageIndex={pagedData.pageIndex} totalPages={pagedData.totalPages} onPageChange={p => setPagination(prev => ({...prev, pageIndex: p}))} />
          )}
        </TableContainer>
      )}

      <OrdonnanceModal
        isOpen={modalOpen}
        prescriptionId={selectedPrescriptionId}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
