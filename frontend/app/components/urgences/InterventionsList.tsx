'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaFilter, FaPlus, FaSyringe, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { useConfirm } from 'react-use-confirming-dialog';
import { FilterPanel, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { urgenceService } from '@/app/services/urgenceService';
import type { InterventionUrgence, StatutInterventionUrgence } from '@/app/types/urgence';
import { StatutInterventionUrgenceLabels, StatutInterventionUrgenceValues } from '@/app/types/urgence';
import type { PagedResult } from '@/app/types/pagination';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const statutColors: Record<StatutInterventionUrgence, string> = {
  Planifiee: 'bg-blue-100 text-blue-700',
  En_cours: 'bg-yellow-100 text-yellow-700',
  Terminee: 'bg-green-100 text-green-700',
  Annulee: 'bg-gray-100 text-gray-700',
};

export default function InterventionsList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<InterventionUrgence> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState<StatutInterventionUrgence | ''>('');
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await urgenceService.getInterventions(
        { statut: filtreStatut || undefined },
        pagination.pageIndex,
        pagination.pageSize,
      );
      setPagedData(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filtreStatut]);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  const handleDelete = async (int: InterventionUrgence) => {
    const ok = await confirm({
      title: 'Suppression',
      message: `Supprimer l'intervention ${int.numeroIntervention} ?`
    });
    if (!ok) return;
    try {
      await urgenceService.deleteIntervention(int.idInterventionUrgence);
      toast.success('Intervention supprimée');
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleChangerStatut = async (int: InterventionUrgence, statut: StatutInterventionUrgence) => {
    if (statut === int.statut) return;
    try {
      await urgenceService.changerStatutIntervention(int.idInterventionUrgence, statut);
      toast.success(`Statut mis à jour : ${StatutInterventionUrgenceLabels[statut]}`);
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (loading) return <SkeletonTable columns={7} rows={8} />;

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-6">
      <PageHeader
        title="Interventions d&apos;urgence"
        subtitle={`${pagedData?.totalCount ?? 0} intervention(s)`}
        actions={
          <>
            <RefreshButton onRefresh={loadData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={() => router.push('/urgences/interventions/nouveau')}>
              Nouvelle intervention
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterSelect
              value={filtreStatut}
              onChange={(e) => { setFiltreStatut(e.target.value as StatutInterventionUrgence | ''); setPagination((p) => ({ ...p, pageIndex: 1 })); }}
            >
              <option value="">Tous les statuts</option>
              {StatutInterventionUrgenceValues.map((s) => (
                <option key={s} value={s}>{StatutInterventionUrgenceLabels[s]}</option>
              ))}
            </FilterSelect>
          </FilterPanel>
        </div>
      )}

      {!pagedData || pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaSyringe />}
          title="Aucune intervention trouvée"
          description="Enregistrez une nouvelle intervention pour démarrer"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N°</Th>
                <Th>Patient</Th>
                <Th>Type d&apos;intervention</Th>
                <Th>Médecin</Th>
                <Th>Date</Th>
                <Th>Statut</Th>
                <Th align="right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((int) => (
                <Tr key={int.idInterventionUrgence}>
                  <Td className="font-mono text-xs font-semibold text-gray-600">{int.numeroIntervention}</Td>
                  <Td className="font-semibold text-gray-800">
                    {`${int.patientPrenom ?? ''} ${int.patientNom ?? ''}`.trim() || `Patient #${int.idPatient}`}
                  </Td>
                  <Td className="max-w-[220px] truncate text-gray-600">{int.typeIntervention}</Td>
                  <Td className="text-gray-600">
                    {int.medecinPrenom && int.medecinNom ? `${int.medecinPrenom} ${int.medecinNom}` : '—'}
                  </Td>
                  <Td className="text-gray-600">{format(new Date(int.dateIntervention), 'dd/MM/yyyy HH:mm', { locale: fr })}</Td>
                  <Td>
                    <select
                      value={int.statut}
                      onChange={(e) => void handleChangerStatut(int, e.target.value as StatutInterventionUrgence)}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 ${statutColors[int.statut]}`}
                      title="Changer le statut"
                    >
                      {StatutInterventionUrgenceValues.map((s) => (
                        <option key={s} value={s}>{StatutInterventionUrgenceLabels[s]}</option>
                      ))}
                    </select>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <IconButton color="gray" title="Voir la fiche" onClick={() => router.push(`/urgences/interventions/${int.idInterventionUrgence}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="indigo" title="Modifier" onClick={() => router.push(`/urgences/interventions/${int.idInterventionUrgence}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(int)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <Pagination
            pageIndex={pagedData.pageIndex}
            totalPages={pagedData.totalPages}
            totalCount={pagedData.totalCount}
            pageSize={pagedData.pageSize}
            onPageChange={(p) => setPagination((prev) => ({ ...prev, pageIndex: p }))}
          />
        </TableContainer>
      )}
    </div>
  );
}
