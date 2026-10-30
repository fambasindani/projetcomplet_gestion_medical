import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from '@/utils/toast';
import { FaPlus, FaEdit, FaTrash, FaHeartbeat, FaUserInjured } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/ui/Pagination';
import SkeletonTable from '@/ui/SkeletonTable';
import PageShell from '@/ui/PageShell';
import EmptyState from '@/ui/EmptyState';
import Button, { IconButton } from '@/ui/Button';
import RefreshButton from '@/ui/RefreshButton';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/ui/Table';
import { PatientSearchSelect } from '@/components/common/PatientSearchSelect';
import Can from '@/components/common/Can';
import RequirePermission from '@/components/common/RequirePermission';
import { usePermission } from '@/hooks/usePermission';
import { signeVitalService } from '@/services/signeVitalService';
import { SigneVital } from '@/types/signeVital';
import type { PagedResult } from '@/types/pagination';

export default function SignesVitauxList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const confirm = useConfirm();
  const { allowed: peutVoir } = usePermission('SIGNES_VITAUX_VOIR');

  const [idPatient, setIdPatient] = useState<number | null>(
    searchParams.get('idPatient') ? Number(searchParams.get('idPatient')) : null
  );
  const [pagedData, setPagedData] = useState<PagedResult<SigneVital> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    if (!peutVoir || !idPatient) { setPagedData(null); setLoading(false); return; }
    setLoading(true);
    try {
      const data = await signeVitalService.getByPatient(idPatient, pagination.pageIndex, pagination.pageSize);
      setPagedData(data);
    } catch (error) {
      console.error(error);
      setPagedData(null);
    } finally {
      setLoading(false);
    }
  }, [idPatient, pagination.pageIndex, pagination.pageSize, peutVoir]);

  useEffect(() => {
    void fetchData();
  }, [fetchData, reloadTrigger]);

  const handleDelete = async (sv: SigneVital) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer la mesure du ${format(new Date(sv.dateMesure), 'dd/MM/yyyy HH:mm')} ?`
    });
    if (!ok) return;
    try {
      await signeVitalService.delete(sv.idSigneVital);
      toast.success('Mesure supprimée');
      setReloadTrigger(prev => prev + 1);
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <RequirePermission permission="SIGNES_VITAUX_VOIR">
      <PageShell
        title="Signes vitaux"
        subtitle="Relevés pré-consultation (poids, taille, tension, température…)"
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Can permission="SIGNES_VITAUX_GERER">
              <Button
                icon={<FaPlus />}
                disabled={!idPatient}
                onClick={() => navigate(`/signes-vitaux/nouveau${idPatient ? `?idPatient=${idPatient}` : ''}`)}
              >
                Nouvelle mesure
              </Button>
            </Can>
          </>
        }
      >
        <div className="max-w-md">
          <PatientSearchSelect
            label="Patient"
            value={idPatient}
            onChange={(id) => setIdPatient(id)}
            placeholder="Sélectionner un patient..."
          />
        </div>

        {!idPatient ? (
          <EmptyState
            icon={<FaUserInjured />}
            title="Aucun patient sélectionné"
            description="Choisissez un patient pour consulter son historique de signes vitaux."
          />
        ) : loading ? (
          <SkeletonTable columns={7} rows={6} />
        ) : !pagedData?.items?.length ? (
          <EmptyState
            icon={<FaHeartbeat />}
            title="Aucune mesure"
            description="Aucun signe vital enregistré pour ce patient."
            action={
              <Can permission="SIGNES_VITAUX_GERER">
                <Button icon={<FaPlus />} onClick={() => navigate(`/signes-vitaux/nouveau?idPatient=${idPatient}`)}>
                  Nouvelle mesure
                </Button>
              </Can>
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <THead>
                <tr>
                  <Th>Date/heure</Th>
                  <Th>Poids</Th>
                  <Th>Taille</Th>
                  <Th>IMC</Th>
                  <Th>Tension</Th>
                  <Th>T° / Pouls</Th>
                  <Th>Prise par</Th>
                  <Th align="center">Actions</Th>
                </tr>
              </THead>
              <TBody>
                {pagedData.items.map((sv) => (
                  <Tr key={sv.idSigneVital}>
                    <Td className="whitespace-nowrap text-sm">
                      {format(new Date(sv.dateMesure), 'dd/MM/yyyy HH:mm')}
                    </Td>
                    <Td className="text-sm">{sv.poids != null ? `${sv.poids} kg` : '-'}</Td>
                    <Td className="text-sm">{sv.taille != null ? (sv.taille > 3 ? `${sv.taille} cm` : `${sv.taille} m`) : '-'}</Td>
                    <Td className="text-sm">{sv.imc != null ? sv.imc : '-'}</Td>
                    <Td className="text-sm">
                      {sv.pressionSystolique != null && sv.pressionDiastolique != null
                        ? `${sv.pressionSystolique}/${sv.pressionDiastolique}`
                        : '-'}
                    </Td>
                    <Td className="text-sm">
                      {sv.temperature != null ? `${sv.temperature}°C` : '-'}
                      {sv.pouls != null ? ` · ${sv.pouls} bpm` : ''}
                    </Td>
                    <Td className="text-sm">{sv.prisePar || '-'}</Td>
                    <Td className="text-center whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <Can permission="SIGNES_VITAUX_GERER">
                          <IconButton color="blue" title="Modifier" onClick={() => navigate(`/signes-vitaux/${sv.idSigneVital}/modifier`)}>
                            <FaEdit size={14} />
                          </IconButton>
                          <IconButton color="red" title="Supprimer" onClick={() => handleDelete(sv)}>
                            <FaTrash size={14} />
                          </IconButton>
                        </Can>
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
    </RequirePermission>
  );
}
