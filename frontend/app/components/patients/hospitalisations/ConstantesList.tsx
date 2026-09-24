// app/hospitalisations/[id]/constantes/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageShell from '@/app/ui/PageShell';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { constanteService } from '@/app/services/constanteService';
import { hospitalisationService } from '@/app/services/hospitalisationService';
import { Constante } from '@/app/types/constante';
import type { PagedResult } from '@/app/types/pagination';
import type { Hospitalisation } from '@/app/types/hospitalisation';

export default function ConstantesList() {
  const { id } = useParams();      // maintenant id est défini
  const router = useRouter();
  const confirm = useConfirm();

  const hospitalisationId = typeof id === 'string' ? parseInt(id, 10) : NaN;

  const [pagedData, setPagedData] = useState<PagedResult<Constante> | null>(null);
  const [loading, setLoading] = useState(true);
  const [hospitalisation, setHospitalisation] = useState<Hospitalisation | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    if (isNaN(hospitalisationId)) {
      toast.error('ID d\'hospitalisation invalide');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [constantes, hosp] = await Promise.all([
        constanteService.getByHospitalisation(hospitalisationId, pagination.pageIndex, pagination.pageSize),
        hospitalisationService.getById(hospitalisationId)
      ]);
      setPagedData(constantes);
      setHospitalisation(hosp);
    } catch (error) {
      console.error(error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [hospitalisationId, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, [fetchData, reloadTrigger]);

  const handleDelete = async (constante: Constante) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer la constante du ${format(new Date(constante.dateMesure), 'dd/MM/yyyy HH:mm')} ?`
    });
    if (!ok) return;
    try {
      await constanteService.delete(constante.idConstante);
      toast.success('Constante supprimée');
      setReloadTrigger(prev => prev + 1);
    } catch {
      toast.error('Erreur');
    }
  };

  const handleEdit = (c: Constante) => {
    router.push(`/patients/hospitalisations/constantes/${c.idConstante}/modifier`);
  };

  const handleAdd = () => {
    router.push(`/patients/hospitalisations/${hospitalisationId}/constantes/nouvelle`);
  };

  if (loading) return <SkeletonTable columns={7} rows={8} />;
  if (!hospitalisation) return <div className="space-y-6 text-center">Hospitalisation non trouvée</div>;

  return (
    <PageShell
      title="Constantes vitales"
      subtitle={`Hospitalisation ${hospitalisation.numeroAdmission} - ${hospitalisation.patientNom} ${hospitalisation.patientPrenom}`}
      onBack={() => router.back()}
      actions={
        <>
          <RefreshButton onRefresh={fetchData} loading={loading} />
          <Button icon={<FaPlus />} onClick={handleAdd}>
            Nouvelle mesure
          </Button>
        </>
      }
      maxWidth="max-w-6xl"
    >
      {!pagedData?.items?.length ? (
        <EmptyState
          icon={<FaPlus />}
          title="Aucune mesure enregistrée"
          description="Ajoutez une nouvelle mesure pour démarrer"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Date/heure</Th>
                <Th>Température</Th>
                <Th>Pouls</Th>
                <Th>Tension</Th>
                <Th>SpO₂</Th>
                <Th>Douleur</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((c: Constante) => (
                <Tr key={c.idConstante}>
                  <Td className="whitespace-nowrap text-sm">
                    {format(new Date(c.dateMesure), 'dd/MM/yyyy HH:mm')}
                  </Td>
                  <Td className="text-sm">{c.temperature ? `${c.temperature} °C` : '-'}</Td>
                  <Td className="text-sm">{c.pouls ? `${c.pouls} bpm` : '-'}</Td>
                  <Td className="text-sm">
                    {c.pressionSystolique && c.pressionDiastolique ? `${c.pressionSystolique}/${c.pressionDiastolique}` : '-'}
                  </Td>
                  <Td className="text-sm">{c.saturation ? `${c.saturation} %` : '-'}</Td>
                  <Td className="text-sm">{c.douleurEchelle ? `${c.douleurEchelle}/10` : '-'}</Td>
                  <Td className="text-center whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      <IconButton color="blue" title="Modifier" onClick={() => handleEdit(c)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(c)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagedData.totalPages > 1 && (
            <Pagination
              pageIndex={pagedData.pageIndex}
              totalPages={pagedData.totalPages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
            />
          )}
        </TableContainer>
      )}
    </PageShell>
  );
}
