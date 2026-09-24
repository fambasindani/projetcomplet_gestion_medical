'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaUser, FaStethoscope } from 'react-icons/fa';
import { PagedResult } from '@/app/types/pagination';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import { IconButton } from '@/app/ui/Button';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import { FilterPanel, FilterInput } from '@/app/ui/FilterControls';
import { RendezVous } from '@/app/types/planningService';
import { planningService } from '@/app/services/planningService';
import { FormSelect } from '../common/FormSelect';

// ✅ Options de statut avec les valeurs exactes de l'enum (avec accents)
const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'Programmé', label: 'Programmé' },
  { value: 'Confirmé', label: 'Confirmé' },
  { value: 'Annulé', label: 'Annulé' },
  { value: 'Terminé', label: 'Terminé' },
  { value: 'NonPrésenté', label: 'Non présenté' },
];

// Couleurs pour chaque statut (clés exactes)
const badgeStyles: Record<string, string> = {
  'Programmé': 'bg-blue-100 text-blue-800',
  'Confirmé': 'bg-green-100 text-green-800',
  'Annulé': 'bg-red-100 text-red-800',
  'Terminé': 'bg-gray-100 text-gray-800',
  'NonPrésenté': 'bg-yellow-100 text-yellow-800',
};

const PlanningMedecin: React.FC = () => {
  // À adapter : récupérer l'ID du médecin connecté (ex: depuis le contexte d'authentification)
  // Pour l'exemple, on utilise 0 comme fallback (tous les médecins)
  const medecinId = 0; // À remplacer par la vraie valeur

  const [pagedData, setPagedData] = useState<PagedResult<RendezVous> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    statut: '',
  });
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [stats, setStats] = useState({ aujourdhui: 0 });

  const fetchRendezVous = useCallback(async () => {
    try {
      const params: {
        start?: string;
        end?: string;
        statut?: string;
        idMedecin?: number;
        pageIndex?: number;
        pageSize?: number;
      } = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        idMedecin: medecinId || undefined, // si medecinId > 0
      };
      if (filters.start) params.start = filters.start;
      if (filters.end) params.end = filters.end;
      if (filters.statut) params.statut = filters.statut;
      const data = await planningService.getRendezVous(params);
      setPagedData(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des rendez-vous');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination, filters, medecinId]);

  const fetchStats = useCallback(async () => {
    try {
      // Appel à l'endpoint stats/aujourdhui avec l'ID du médecin
      const statsData = await planningService.getStats(medecinId || undefined);
      setStats(statsData);
    } catch (error) {
      console.error(error);
    }
  }, [medecinId]);

  useEffect(() => {
    void (async () => {
      await fetchRendezVous();
      await fetchStats();
    })();
  }, [fetchRendezVous, fetchStats]);

  const handleStatutChange = async (rdvId: number, newStatut: string) => {
    try {
      await planningService.updateStatut(rdvId, newStatut);
      toast.success('Statut mis à jour');
      fetchRendezVous();
      fetchStats();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatutBadge = (statut: string) => {
    const style = badgeStyles[statut] || 'bg-gray-100 text-gray-800';
    return `inline-flex rounded-full px-2 py-1 text-xs font-semibold ${style}`;
  };

  if (loading) return <SkeletonTable columns={5} rows={8} />;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <PageHeader
        title="Mon planning"
        subtitle={<><FaCalendarAlt className="mr-1 inline" /> Rendez-vous du médecin</>}
        actions={
          <div className="rounded-lg bg-indigo-50 px-4 py-2 text-center">
            <p className="text-xs text-indigo-600">Aujourd&apos;hui</p>
            <p className="text-2xl font-bold text-indigo-700">{stats.aujourdhui}</p>
          </div>
        }
      />

      {/* Filtres */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <FilterPanel>
          <FilterInput
            type="datetime-local"
            value={filters.start}
            onChange={(e) => setFilters({ ...filters, start: e.target.value })}
            placeholder="Date début"
          />
          <FilterInput
            type="datetime-local"
            value={filters.end}
            onChange={(e) => setFilters({ ...filters, end: e.target.value })}
            placeholder="Date fin"
          />
          <FormSelect
            label="Statut"
            name="statut"
            options={statutOptions}
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            icon={<FaCalendarAlt />}
          />
        </FilterPanel>
      </div>

      {/* Tableau des rendez-vous */}
      {!pagedData?.items.length ? (
        <EmptyState
          icon={<FaCalendarAlt />}
          title="Aucun rendez-vous"
          description="Aucun rendez-vous trouvé pour cette période."
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Date &amp; heure</Th>
                <Th>Patient</Th>
                <Th>Motif</Th>
                <Th>Statut</Th>
                <Th>Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((rdv) => (
                <Tr key={rdv.idRdv}>
                  <Td className="whitespace-nowrap text-sm text-gray-900">
                    {new Date(rdv.dateRdv).toLocaleString()}
                  </Td>
                  <Td className="text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      {rdv.patientNom} {rdv.patientPrenom}
                    </div>
                  </Td>
                  <Td className="text-sm text-gray-600">{rdv.motif || '-'}</Td>
                  <Td>
                    <span className={getStatutBadge(rdv.statut)}>{rdv.statut}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <select
                        value={rdv.statut}
                        onChange={(e) => handleStatutChange(rdv.idRdv, e.target.value)}
                        className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="Programmé">Programmé</option>
                        <option value="Confirmé">Confirmé</option>
                        <option value="Annulé">Annulé</option>
                        <option value="Terminé">Terminé</option>
                        <option value="NonPrésenté">Non présenté</option>
                      </select>
                      {rdv.idConsultation && (
                        <IconButton
                          color="indigo"
                          title="Voir consultation"
                          onClick={() => window.location.href = `/consultations/${rdv.idConsultation}`}
                        >
                          <FaStethoscope size={14} />
                        </IconButton>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          {/* Pagination */}
          {pagedData && pagedData.totalPages > 1 && (
            <Pagination
              pageIndex={pagedData.pageIndex}
              totalPages={pagedData.totalPages}
              totalCount={pagedData.totalCount}
              pageSize={pagedData.pageSize}
              onPageChange={(page) => setPagination({ ...pagination, pageIndex: page })}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
};

export default PlanningMedecin;
