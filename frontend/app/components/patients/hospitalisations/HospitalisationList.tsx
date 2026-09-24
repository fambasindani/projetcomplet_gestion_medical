'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useConfirm } from 'react-use-confirming-dialog';
import { format } from 'date-fns';
import {
  FaHospitalUser, FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaHeartbeat
} from 'react-icons/fa';

import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { hospitalisationService } from '@/app/services/hospitalisationService';
import { Hospitalisation, StatutHospitalisation } from '@/app/types/hospitalisation';
import type { PagedResult } from '@/app/types/pagination';

const statutColors: Record<StatutHospitalisation, string> = {
  En_cours: 'bg-blue-100 text-blue-800',
  Terminée: 'bg-green-100 text-green-800',
  Transféré: 'bg-yellow-100 text-yellow-800',
  Décédé: 'bg-red-100 text-red-800',
  Sortie_contre_avis: 'bg-orange-100 text-orange-800'
};

export default function HospitalisationList() {
  const router = useRouter();
  const confirm = useConfirm();

  const [pagedData, setPagedData] = useState<PagedResult<Hospitalisation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ statut: '', idPatient: '', dateStart: '', dateEnd: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = async () => {
    setLoading(true);
    try {
      let data;
      const hasFilters = filters.statut || filters.idPatient || filters.dateStart || filters.dateEnd;
      if (hasFilters) {
        data = await hospitalisationService.search({
          statut: filters.statut as StatutHospitalisation || undefined,
          idPatient: filters.idPatient ? parseInt(filters.idPatient) : undefined,
          dateStart: filters.dateStart || undefined,
          dateEnd: filters.dateEnd || undefined
        }, pagination.pageIndex, pagination.pageSize);
      } else {
        data = await hospitalisationService.getAll(pagination.pageIndex, pagination.pageSize);
      }
      setPagedData(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, filters.statut, filters.idPatient, filters.dateStart, filters.dateEnd]);

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

  if (loading) return <SkeletonTable columns={7} rows={8} />;

  return (
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
            <Button icon={<FaPlus />} onClick={() => router.push('/patients/hospitalisations/nouveau')}>
              Nouvelle admission
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterSelect value={filters.statut} onChange={e => setFilters({...filters, statut: e.target.value})}>
              <option value="">Tous statuts</option>
              {Object.values(StatutHospitalisation).map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
            <FilterInput type="text" placeholder="ID Patient" value={filters.idPatient} onChange={e => setFilters({...filters, idPatient: e.target.value})} />
            <FilterInput type="date" placeholder="Date début" value={filters.dateStart} onChange={e => setFilters({...filters, dateStart: e.target.value})} />
            <FilterInput type="date" placeholder="Date fin" value={filters.dateEnd} onChange={e => setFilters({...filters, dateEnd: e.target.value})} />
          </FilterPanel>
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
                  <Td>{format(new Date(h.dateAdmission), 'dd/MM/yyyy HH:mm')}</Td>
                  <Td><span className={`px-2 py-1 rounded-full text-xs ${statutColors[h.statut]}`}>{h.statut}</span></Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir détails" onClick={() => router.push(`/patients/hospitalisations/${h.idHospitalisation}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => router.push(`/patients/hospitalisations/${h.idHospitalisation}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(h)}>
                        <FaTrash size={14} />
                      </IconButton>
                      <IconButton
                        color="indigo"
                        title="Constantes vitales"
                        onClick={() => router.push(`/patients/hospitalisations/${h.idHospitalisation}/constantes`)}
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
  );
}
