'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaFilter, FaEye, FaEdit, FaTrash, FaBan, FaUserNurse, FaFlask, FaPlus, FaFilePrescription } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterSelect, FilterInput } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { prescriptionService } from '@/app/services/prescriptionService';
import { Prescription, StatutPrescription, TypePrescription } from '@/app/types/prescription';
import { PagedResult } from '@/app/types/pagination';

const statutStyles: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EnAttente: 'bg-amber-50 text-amber-700 border-amber-200',
  Terminee: 'bg-slate-50 text-gray-600 border-slate-200',
  Annulee: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function PrescriptionsList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<Prescription> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', statut: '', idPatient: '', dateStart: '', dateEnd: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const hasFilters = Object.values(filters).some(v => v !== '');
      const data = hasFilters 
        ? await prescriptionService.search({ ...filters, idPatient: filters.idPatient ? parseInt(filters.idPatient) : undefined }, pagination.pageIndex, pagination.pageSize)
        : await prescriptionService.getAll(pagination.pageIndex, pagination.pageSize);
      setPagedData(data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  useEffect(() => { void (async () => { await fetchData(); })(); }, [fetchData]);

  const handleDelete = async (p: Prescription) => {
    if (await confirm({ title: 'Supprimer', message: `Supprimer la prescription ${p.numeroPrescription} ?` })) {
      await prescriptionService.delete(p.idPrescription);
      toast.success('Supprimée');
      fetchData();
    }
  };

  if (loading) return <SkeletonTable columns={5} rows={8} />;

  return (
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
            <Button icon={<FaPlus />} onClick={() => router.push('/prescriptions/nouveau')}>
              Nouvelle
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterSelect onChange={e => setFilters({...filters, type: e.target.value})}>
              <option value="">Tous les types</option>
              {Object.values(TypePrescription).map(t => <option key={t} value={t}>{t}</option>)}
            </FilterSelect>
            <FilterSelect onChange={e => setFilters({...filters, statut: e.target.value})}>
              <option value="">Tous les statuts</option>
              {Object.values(StatutPrescription).map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
            <FilterInput type="number" placeholder="ID Patient" onChange={e => setFilters({...filters, idPatient: e.target.value})} />
            <FilterInput type="date" onChange={e => setFilters({...filters, dateStart: e.target.value})} />
            <FilterInput type="date" onChange={e => setFilters({...filters, dateEnd: e.target.value})} />
          </FilterPanel>
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
                      <IconButton color="indigo" title="Détails" onClick={() => router.push(`/prescriptions/${p.idPrescription}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => router.push(`/prescriptions/${p.idPrescription}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      {p.typePrescription === TypePrescription.Examen && (
                        <IconButton color="green" title="Examens de la prescription" onClick={() => router.push(`/prescriptions/examens/${p.idPrescription}`)}>
                          <FaFlask size={14} />
                        </IconButton>
                      )}
                      {p.typePrescription === TypePrescription.Soin && (
                        <IconButton color="indigo" title="Soins de la prescription" onClick={() => router.push(`/prescriptions/${p.idPrescription}/soins`)}>
                          <FaUserNurse size={14} />
                        </IconButton>
                      )}
                      {p.statut !== 'Annulee' && (
                        <IconButton
                          color="gray"
                          title="Annuler"
                          onClick={async () => { const m = prompt('Motif ?'); if(m) await prescriptionService.annuler(p.idPrescription, m); fetchData(); }}
                        >
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
            <Pagination pageIndex={pagination.pageIndex} totalPages={pagedData.totalPages} onPageChange={p => setPagination(prev => ({...prev, pageIndex: p}))} />
          )}
        </TableContainer>
      )}
    </div>
  );
}
