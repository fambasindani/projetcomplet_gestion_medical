'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaPlus, FaFilter, FaEdit, FaTrash, FaUserInjured, FaEye } from 'react-icons/fa';
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
import type { AdmissionUrgence, GraviteUrgence, StatutAdmissionUrgence } from '@/app/types/urgence';
import { GraviteUrgenceLabels, GraviteUrgenceValues, StatutAdmissionUrgenceLabels, StatutAdmissionUrgenceValues } from '@/app/types/urgence';
import type { PagedResult } from '@/app/types/pagination';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import AdmissionDetailsModal from './AdmissionDetailsModal';

const graviteColors: Record<GraviteUrgence, string> = {
  Critique: 'bg-red-100 text-red-700',
  Urgente: 'bg-orange-100 text-orange-700',
  Semi_urgente: 'bg-yellow-100 text-yellow-700',
  Non_urgente: 'bg-emerald-100 text-emerald-700',
};

const statutColors: Record<StatutAdmissionUrgence, string> = {
  En_attente: 'bg-yellow-100 text-yellow-800',
  En_consultation: 'bg-blue-100 text-blue-800',
  En_observation: 'bg-purple-100 text-purple-800',
  Hospitalise: 'bg-indigo-100 text-indigo-800',
  Sorti: 'bg-green-100 text-green-800',
  Transfere: 'bg-gray-100 text-gray-700',
};

export default function AdmissionsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<AdmissionUrgence> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewing, setViewing] = useState<AdmissionUrgence | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<StatutAdmissionUrgence | ''>('');
  const [filtreGravite, setFiltreGravite] = useState<GraviteUrgence | ''>('');
  const [patientId, setPatientId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await urgenceService.getAdmissions(
        { statut: filtreStatut || undefined, gravite: filtreGravite || undefined, idPatient: patientId || undefined },
        pagination.pageIndex,
        pagination.pageSize,
      );
      setPagedData(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filtreStatut, filtreGravite, patientId]);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && Number(id)) {
      urgenceService.getAdmissionById(Number(id))
        .then(setViewing)
        .catch((error) => toast.error(extractErrorMessage(error)));
    }
  }, [searchParams]);

  const handleDelete = async (adm: AdmissionUrgence) => {
    const ok = await confirm({
      title: 'Suppression',
      message: `Supprimer l'admission ${adm.numeroAdmission} ?`
    });
    if (!ok) return;
    try {
      await urgenceService.deleteAdmission(adm.idAdmissionUrgence);
      toast.success('Admission supprimée');
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleChangerStatut = async (adm: AdmissionUrgence, statut: StatutAdmissionUrgence) => {
    if (statut === adm.statut) return;
    try {
      await urgenceService.changerStatutAdmission(adm.idAdmissionUrgence, statut);
      toast.success(`Statut mis à jour : ${StatutAdmissionUrgenceLabels[statut]}`);
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (loading) return <SkeletonTable columns={7} rows={8} />;

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-6">
      <PageHeader
        title="Admissions aux urgences"
        subtitle={`${pagedData?.totalCount ?? 0} admission(s)`}
        actions={
          <>
            <RefreshButton onRefresh={loadData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={() => router.push('/urgences/admissions/nouveau')}>
              Nouvelle admission
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterSelect
              value={filtreStatut}
              onChange={(e) => { setFiltreStatut(e.target.value as StatutAdmissionUrgence | ''); setPagination((p) => ({ ...p, pageIndex: 1 })); }}
            >
              <option value="">Tous les statuts</option>
              {StatutAdmissionUrgenceValues.map((s) => (
                <option key={s} value={s}>{StatutAdmissionUrgenceLabels[s]}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              value={filtreGravite}
              onChange={(e) => { setFiltreGravite(e.target.value as GraviteUrgence | ''); setPagination((p) => ({ ...p, pageIndex: 1 })); }}
            >
              <option value="">Toutes les gravités</option>
              {GraviteUrgenceValues.map((g) => (
                <option key={g} value={g}>{GraviteUrgenceLabels[g]}</option>
              ))}
            </FilterSelect>
            <PatientSearchSelect value={patientId} onChange={(id) => { setPatientId(id); setPagination((p) => ({ ...p, pageIndex: 1 })); }}
              label="" placeholder="Filtrer par patient..." />
          </FilterPanel>
        </div>
      )}

      {!pagedData || pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaUserInjured />}
          title="Aucune admission trouvée"
          description="Enregistrez une nouvelle admission pour démarrer"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N° admission</Th>
                <Th>Patient</Th>
                <Th>Motif</Th>
                <Th>Gravité</Th>
                <Th>Statut</Th>
                <Th>Arrivée</Th>
                <Th align="right">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((adm) => (
                <Tr key={adm.idAdmissionUrgence}>
                  <Td className="font-mono text-xs font-semibold text-gray-600">{adm.numeroAdmission}</Td>
                  <Td>
                    <button onClick={() => setViewing(adm)} className="font-semibold text-gray-800 hover:text-indigo-600">
                      {`${adm.patientPrenom ?? ''} ${adm.patientNom ?? ''}`.trim() || `Patient #${adm.idPatient}`}
                    </button>
                  </Td>
                  <Td className="max-w-[220px] truncate text-gray-600">{adm.motifUrgent}</Td>
                  <Td>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${graviteColors[adm.gravite]}`}>
                      {GraviteUrgenceLabels[adm.gravite]}
                    </span>
                  </Td>
                  <Td>
                    <select
                      value={adm.statut}
                      onChange={(e) => void handleChangerStatut(adm, e.target.value as StatutAdmissionUrgence)}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 ${statutColors[adm.statut]}`}
                      title="Changer le statut"
                    >
                      {StatutAdmissionUrgenceValues.map((s) => (
                        <option key={s} value={s}>{StatutAdmissionUrgenceLabels[s]}</option>
                      ))}
                    </select>
                  </Td>
                  <Td className="text-gray-600">{format(new Date(adm.dateArrivee), 'dd/MM/yyyy HH:mm', { locale: fr })}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <IconButton color="gray" title="Voir la fiche" onClick={() => router.push(`/urgences/admissions/${adm.idAdmissionUrgence}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="indigo" title="Modifier" onClick={() => router.push(`/urgences/admissions/${adm.idAdmissionUrgence}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(adm)}>
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

      {viewing && <AdmissionDetailsModal admission={viewing} onClose={() => setViewing(null)} onRefresh={() => void loadData()} />}
    </div>
  );
}
