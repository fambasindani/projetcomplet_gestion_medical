// app/prescriptions/examens/[id]/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEye, FaPrint, FaArrowLeft, FaFlask } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { examenService } from '@/app/services/examenService';
import { prescriptionService } from '@/app/services/prescriptionService';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import Link from 'next/link';
import type { Examen } from '@/app/types/examen';
import type { Prescription } from '@/app/types/prescription';

const statutColors: Record<string, string> = {
  Prescrit: 'bg-yellow-100 text-yellow-800',
  Planifié: 'bg-blue-100 text-blue-800',
  Réalisé: 'bg-green-100 text-green-800',
  Validé: 'bg-indigo-100 text-indigo-800',
  Annulé: 'bg-red-100 text-red-800',
};

export default function PrescriptionExamens() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const prescriptionId = Number(id);

  const confirm = useConfirm();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id || isNaN(prescriptionId) || prescriptionId <= 0) {
      toast.error('ID de prescription invalide');
      router.push('/prescriptions');
      return;
    }

    setLoading(true);
    try {
      const [examensData, prescriptionData] = await Promise.all([
        examenService.getByPrescription(prescriptionId),
        prescriptionService.getById(prescriptionId),
      ]);
      setExamens(examensData);
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

  const handleDelete = async (examen: Examen) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer l'examen ${examen.numeroExamen} ?`,
    });
    if (!ok) return;
    try {
      await examenService.delete(examen.idExamen);
      toast.success('Examen supprimé');
      fetchData();
    } catch {
      toast.error('Erreur');
    }
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;
  if (!prescription) return <div className="p-6 text-center">Prescription non trouvée</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Examens de la prescription"
        subtitle={
          <span>
            Prescription n° {prescription.numeroPrescription} – {prescription.patientNom} {prescription.patientPrenom}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/prescriptions')}>
              Retour aux prescriptions
            </Button>
            <Link href={`/examens/nouveau?prescriptionId=${prescriptionId}`}>
              <Button icon={<FaPlus />}>Ajouter un examen</Button>
            </Link>
          </>
        }
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">N° prescription</span>
            <p className="font-semibold">{prescription.numeroPrescription}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Patient</span>
            <p className="font-semibold">{prescription.patientNom} {prescription.patientPrenom}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Médecin</span>
            <p className="font-semibold">Dr. {prescription.medecinNom} {prescription.medecinPrenom}</p>
          </div>
        </div>
      </div>

      {examens.length === 0 ? (
        <EmptyState
          icon={<FaFlask />}
          title="Aucun examen associé"
          description="Aucun examen associé à cette prescription."
          action={
            <Link href={`/examens/nouveau?prescriptionId=${prescriptionId}`}>
              <Button icon={<FaPlus />}>Ajouter un examen</Button>
            </Link>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N° Examen</Th>
                <Th>Type</Th>
                <Th>Catégorie</Th>
                <Th>Statut</Th>
                <Th>Date prescription</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {examens.map((ex) => (
                <Tr key={ex.idExamen}>
                  <Td className="whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                      {ex.numeroExamen}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">{ex.typeExamen}</Td>
                  <Td className="whitespace-nowrap">{ex.libelleCategorie}</Td>
                  <Td className="whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutColors[ex.statut] || 'bg-gray-100 text-gray-800'}`}>
                      {ex.statut}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {format(new Date(ex.datePrescription), 'dd/MM/yyyy')}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton
                        color="gray"
                        title="Voir détails"
                        onClick={() => router.push(`/examens/details/${ex.idExamen}`)}
                      >
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton
                        color="green"
                        title="Imprimer"
                        onClick={() => router.push(`/examens/${ex.idExamen}/impression`)}
                      >
                        <FaPrint size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(ex)}>
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
    </div>
  );
}
