import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { useConfirm } from 'react-use-confirming-dialog';
import { format } from 'date-fns';
import {
  FaHospitalUser, FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaHeartbeat, FaSearch
} from 'react-icons/fa';

import Pagination from '@/ui/Pagination';
import SkeletonTable from '@/ui/SkeletonTable';
import PageHeader from '@/ui/PageHeader';
import EmptyState from '@/ui/EmptyState';
import Button, { IconButton } from '@/ui/Button';
import RefreshButton from '@/ui/RefreshButton';
import { FilterPanel, FilterInput, FilterSelect } from '@/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/ui/Table';
import { hospitalisationService } from '@/services/hospitalisationService';
import Can from '@/components/common/Can';
import RequirePermission from '@/components/common/RequirePermission';
import { usePermission } from '@/hooks/usePermission';
import { Hospitalisation, StatutHospitalisation } from '@/types/hospitalisation';
import type { PagedResult } from '@/types/pagination';

const statutColors: Record<StatutHospitalisation, string> = {
  En_cours: 'bg-blue-100 text-blue-800',
  Terminée: 'bg-green-100 text-green-800',
  Transféré: 'bg-yellow-100 text-yellow-800',
  Décédé: 'bg-red-100 text-red-800',
  Sortie_contre_avis: 'bg-orange-100 text-orange-800'
};

export default function HospitalisationList() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { allowed: peutVoir } = usePermission('HOSPITALISATIONS_VOIR');

  const [pagedData, setPagedData] = useState<PagedResult<Hospitalisation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ statut: '', idPatient: '', dateStart: '', dateEnd: '' });
  const [applied, setApplied] = useState({ statut: '', idPatient: '', dateStart: '', dateEnd: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = async () => {
    if (!peutVoir) { setLoading(false); return; }
    setLoading(true);
    try {
      let data;
      const hasFilters = applied.statut || applied.idPatient || applied.dateStart || applied.dateEnd;
      if (hasFilters) {
        data = await hospitalisationService.search({
          statut: applied.statut as StatutHospitalisation || undefined,
          idPatient: applied.idPatient ? parseInt(applied.idPatient) : undefined,
          dateStart: applied.dateStart || undefined,
          dateEnd: applied.dateEnd || undefined
        }, pagination.pageIndex, pagination.pageSize);
      } else {
        data = await hospitalisationService.getAll(pagination.pageIndex, pagination.pageSize);
      }
      setPagedData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, applied.statut, applied.idPatient, applied.dateStart, applied.dateEnd, peutVoir]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
    setApplied(prev => ({ ...prev, idPatient: filters.idPatient, dateStart: filters.dateStart, dateEnd: filters.dateEnd }));
  };

  const handleReset = () => {
    const empty = { statut: '', idPatient: '', dateStart: '', dateEnd: '' };
    setFilters(empty);
    setApplied(empty);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const handleDelete = async (h: Hospitalisation) => {
    const ok = await confirm({
      title: 'Suppression',
      message: `Supprimer l'hospitalisation ${h.numeroAdmission} ?`
    });
    if (!ok) return;
    await hospitalisationService.delete(h.idHospitalisation);
    toast.success('Supprimée');
    fetchData();
  };

  if (loading) return <SkeletonTable columns={8} rows={8} />;

  return (
    <RequirePermission permission="HOSPITALISATIONS_VOIR">
    <div className="space-y-6">
      <PageHeader
        title="Hospitalisations"
        subtitle={`${pagedData?.totalCount || 0} admissions`}
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Can permission="HOSPITALISATIONS_GERER">
              <Button icon={<FaPlus />} onClick={() => navigate('/patients/hospitalisations/nouveau')}>
                Nouvelle admission
              </Button>
            </Can>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterSelect value={filters.statut} onChange={e => { const statut = e.target.value; setFilters({...filters, statut}); setApplied(prev => ({ ...prev, statut })); }}>
              <option value="">Tous statuts</option>
              {Object.values(StatutHospitalisation).map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
            <FilterInput type="text" placeholder="ID Patient" value={filters.idPatient} onChange={e => setFilters({...filters, idPatient: e.target.value})} />
            <FilterInput type="date" placeholder="Date début" value={filters.dateStart} onChange={e => setFilters({...filters, dateStart: e.target.value})} />
            <FilterInput type="date" placeholder="Date fin" value={filters.dateEnd} onChange={e => setFilters({...filters, dateEnd: e.target.value})} />
          </FilterPanel>
          <div className="mt-4 flex gap-2">
            <Button icon={<FaSearch size={14} />} onClick={handleSearch}>Rechercher</Button>
            <Button variant="secondary" onClick={handleReset}>Réinitialiser</Button>
          </div>
        </div>
      )}

      {!pagedData?.items?.length ? (
        <EmptyState
          icon={<FaHospitalUser />}
          title="Aucune hospitalisation"
          description="Enregistrez une nouvelle admission pour démarrer"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N° Admission</Th>
                <Th>Patient</Th>
                <Th>Médecin responsable</Th>
                <Th>Chambre</Th>
                <Th>Service</Th>
                <Th>Date admission</Th>
                <Th>Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((h: Hospitalisation) => (
                <Tr key={h.idHospitalisation}>
                  <Td className="font-mono text-sm">{h.numeroAdmission}</Td>
                  <Td>{h.patientNom} {h.patientPrenom}</Td>
                  <Td>{h.medecinNom} {h.medecinPrenom}</Td>
                  <Td>{h.chambreNumero || '-'}</Td>
                  <Td>{h.serviceNom || '-'}</Td>
                  <Td>{format(new Date(h.dateAdmission), 'dd/MM/yyyy HH:mm')}</Td>
                  <Td><span className={`px-2 py-1 rounded-full text-xs ${statutColors[h.statut]}`}>{h.statut}</span></Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir détails" onClick={() => navigate(`/patients/hospitalisations/${h.idHospitalisation}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <Can permission="HOSPITALISATIONS_GERER">
                        <IconButton color="blue" title="Modifier" onClick={() => navigate(`/patients/hospitalisations/${h.idHospitalisation}/modifier`)}>
                          <FaEdit size={14} />
                        </IconButton>
                      </Can>
                      <Can permission="HOSPITALISATIONS_GERER">
                        <IconButton color="red" title="Supprimer" onClick={() => handleDelete(h)}>
                          <FaTrash size={14} />
                        </IconButton>
                      </Can>
                      <IconButton
                        color="indigo"
                        title="Constantes vitales"
                        onClick={() => navigate(`/patients/hospitalisations/${h.idHospitalisation}/constantes`)}
                      >
                        <FaHeartbeat size={14} />
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
              onPageChange={p => setPagination(prev => ({ ...prev, pageIndex: p }))}
            />
          )}
        </TableContainer>
      )}
    </div>
    </RequirePermission>
  );
}
