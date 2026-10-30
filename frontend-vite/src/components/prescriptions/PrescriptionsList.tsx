import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from '@/utils/toast';
import { FaFilter, FaEye, FaEdit, FaTrash, FaBan, FaUserNurse, FaFlask, FaPlus, FaFilePrescription, FaSearch } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/ui/Pagination';
import SkeletonTable from '@/ui/SkeletonTable';
import PageHeader from '@/ui/PageHeader';
import EmptyState from '@/ui/EmptyState';
import Button, { IconButton } from '@/ui/Button';
import RefreshButton from '@/ui/RefreshButton';
import { FilterPanel, FilterSelect, FilterInput } from '@/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/ui/Table';
import { prescriptionService } from '@/services/prescriptionService';
import { Prescription, StatutPrescription, TypePrescription } from '@/types/prescription';
import { PagedResult } from '@/types/pagination';
import Can from '@/components/common/Can';
import RequirePermission from '@/components/common/RequirePermission';
import { usePermission } from '@/hooks/usePermission';

const statutStyles: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EnAttente: 'bg-amber-50 text-amber-700 border-amber-200',
  Terminee: 'bg-slate-50 text-gray-600 border-slate-200',
  Annulee: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function PrescriptionsList() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { allowed: peutVoir } = usePermission('PRESCRIPTIONS_VOIR');
  const [pagedData, setPagedData] = useState<PagedResult<Prescription> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', statut: '', idPatient: '', dateStart: '', dateEnd: '' });
  const [applied, setApplied] = useState({ type: '', statut: '', idPatient: '', dateStart: '', dateEnd: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    if (!peutVoir) { setLoading(false); return; }
    setLoading(true);
    try {
      const hasFilters = Object.values(applied).some(v => v !== '');
      const data = hasFilters 
        ? await prescriptionService.search({ ...applied, idPatient: applied.idPatient ? parseInt(applied.idPatient) : undefined }, pagination.pageIndex, pagination.pageSize)
        : await prescriptionService.getAll(pagination.pageIndex, pagination.pageSize);
      setPagedData(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [pagination.pageIndex, pagination.pageSize, applied, peutVoir]);

  useEffect(() => { void (async () => { await fetchData(); })(); }, [fetchData]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
    setApplied(prev => ({ ...prev, idPatient: filters.idPatient, dateStart: filters.dateStart, dateEnd: filters.dateEnd }));
  };

  const handleReset = () => {
    const empty = { type: '', statut: '', idPatient: '', dateStart: '', dateEnd: '' };
    setFilters(empty);
    setApplied(empty);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const handleDelete = async (p: Prescription) => {
    if (await confirm({ title: 'Supprimer', message: `Supprimer la prescription ${p.numeroPrescription} ?` })) {
      await prescriptionService.delete(p.idPrescription);
      toast.success('Supprimée');
      fetchData();
    }
  };

  if (loading) return <SkeletonTable columns={5} rows={8} />;

  return (
    <RequirePermission permission="PRESCRIPTIONS_VOIR">
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        subtitle="Gestion des ordonnances et actes médicaux"
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter size={14} />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Can permission="PRESCRIPTIONS_GERER">
              <Button icon={<FaPlus />} onClick={() => navigate('/prescriptions/nouveau')}>
                Nouvelle
              </Button>
            </Can>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterSelect value={filters.type} onChange={e => { const type = e.target.value; setFilters({...filters, type}); setApplied(prev => ({ ...prev, type })); }}>
              <option value="">Tous les types</option>
              {Object.values(TypePrescription).map(t => <option key={t} value={t}>{t}</option>)}
            </FilterSelect>
            <FilterSelect value={filters.statut} onChange={e => { const statut = e.target.value; setFilters({...filters, statut}); setApplied(prev => ({ ...prev, statut })); }}>
              <option value="">Tous les statuts</option>
              {Object.values(StatutPrescription).map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
            <FilterInput type="number" placeholder="ID Patient" value={filters.idPatient} onChange={e => setFilters({...filters, idPatient: e.target.value})} />
            <FilterInput type="date" value={filters.dateStart} onChange={e => setFilters({...filters, dateStart: e.target.value})} />
            <FilterInput type="date" value={filters.dateEnd} onChange={e => setFilters({...filters, dateEnd: e.target.value})} />
          </FilterPanel>
          <div className="mt-4 flex gap-2">
            <Button icon={<FaSearch size={14} />} onClick={handleSearch}>Rechercher</Button>
            <Button variant="secondary" onClick={handleReset}>Réinitialiser</Button>
          </div>
        </div>
      )}

      {!pagedData?.items?.length ? (
        <EmptyState
          icon={<FaFilePrescription />}
          title="Aucune prescription trouvée"
          description="Ajustez vos filtres ou créez une nouvelle prescription"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N°</Th>
                <Th>Date</Th>
                <Th>Patient</Th>
                <Th>Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((p: Prescription) => (
                <Tr key={p.idPrescription}>
                  <Td className="font-mono font-medium">{p.numeroPrescription}</Td>
                  <Td>{format(new Date(p.datePrescription), 'dd MMM yyyy')}</Td>
                  <Td>{p.patientNom} {p.patientPrenom}</Td>
                  <Td>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statutStyles[p.statut]}`}>
                      {p.statut.toUpperCase()}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-1">
                      <IconButton color="indigo" title="Détails" onClick={() => navigate(`/prescriptions/${p.idPrescription}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <Can permission="PRESCRIPTIONS_GERER">
                        <IconButton color="blue" title="Modifier" onClick={() => navigate(`/prescriptions/${p.idPrescription}/modifier`)}>
                          <FaEdit size={14} />
                        </IconButton>
                      </Can>
                      {p.typePrescription === TypePrescription.Examen && (
                        <Can permission="PRESCRIPTIONS_GERER">
                          <IconButton color="green" title="Examens de la prescription" onClick={() => navigate(`/prescriptions/examens/${p.idPrescription}`)}>
                            <FaFlask size={14} />
                          </IconButton>
                        </Can>
                      )}
                      {p.typePrescription === TypePrescription.Soin && (
                        <Can permission="PRESCRIPTIONS_GERER">
                          <IconButton color="indigo" title="Soins de la prescription" onClick={() => navigate(`/prescriptions/${p.idPrescription}/soins`)}>
                            <FaUserNurse size={14} />
                          </IconButton>
                        </Can>
                      )}
                      {p.statut !== 'Annulee' && (
                        <Can permission="PRESCRIPTIONS_GERER">
                          <IconButton
                            color="gray"
                            title="Annuler"
                            onClick={async () => { const m = prompt('Motif ?'); if(m) await prescriptionService.annuler(p.idPrescription, m); fetchData(); }}
                          >
                            <FaBan size={14} />
                          </IconButton>
                        </Can>
                      )}
                      <Can permission="PRESCRIPTIONS_GERER">
                        <IconButton color="red" title="Supprimer" onClick={() => handleDelete(p)}>
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
            <Pagination pageIndex={pagination.pageIndex} totalPages={pagedData.totalPages} onPageChange={p => setPagination(prev => ({...prev, pageIndex: p}))} />
          )}
        </TableContainer>
      )}
    </div>
    </RequirePermission>
  );
}
