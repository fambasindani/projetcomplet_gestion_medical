'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaUserMd,
  FaUserInjured,
  FaPlus,
  FaBan,
  FaSearch,
} from 'react-icons/fa';

import { useConfirm } from 'react-use-confirming-dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import Button, { IconButton } from '@/app/ui/Button';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';

import { rendezvousService } from '@/app/services/rendezvousService';
import { RendezVous, StatutRendezVous } from '@/app/types/rendezvous';
import { PagedResult } from '@/app/types/pagination';

import { AnnulationModal } from './AnnulationModal'; // <-- import

const statutColors: Record<StatutRendezVous, string> = {
  [StatutRendezVous.Programme]: 'bg-blue-100 text-blue-800',
  [StatutRendezVous.Confirme]: 'bg-green-100 text-green-800',
  [StatutRendezVous.Annule]: 'bg-red-100 text-red-800',
  [StatutRendezVous.Termine]: 'bg-gray-100 text-gray-800',
  [StatutRendezVous.NonPresente]: 'bg-yellow-100 text-yellow-800',
};

export default function RendezVousList() {
  const router = useRouter();
  const confirm = useConfirm();

  const [pagedData, setPagedData] = useState<PagedResult<RendezVous> | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterStatut, setFilterStatut] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [searchPatientInput, setSearchPatientInput] = useState('');

  const [showFilters, setShowFilters] = useState(false);

  // États pour l'annulation
  const [showAnnulationModal, setShowAnnulationModal] = useState(false);
  const [annulationRdv, setAnnulationRdv] = useState<RendezVous | null>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');

  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (filterStatut) {
        data = await rendezvousService.getByStatut(
          filterStatut as StatutRendezVous,
          pagination.pageIndex,
          pagination.pageSize
        );
      } else {
        data = await rendezvousService.getAll(
          pagination.pageIndex,
          pagination.pageSize
        );
      }
      if (searchPatient) {
        const term = searchPatient.toLowerCase();
        const filtered = data.items.filter(
          (rdv: RendezVous) =>
            rdv.patientNom?.toLowerCase().includes(term) ||
            rdv.patientPrenom?.toLowerCase().includes(term)
        );
        data = {
          ...data,
          items: filtered,
          totalCount: filtered.length,
          totalPages: Math.ceil(filtered.length / pagination.pageSize),
        };
      }
      setPagedData(data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filterStatut, searchPatient, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  // Suppression
  const handleDelete = async (rdv: RendezVous) => {
    const ok = await confirm({
      title: 'Suppression',
      message: `Supprimer le rendez-vous du ${format(
        new Date(rdv.dateRdv),
        'dd/MM/yyyy HH:mm'
      )} ?`,
    });
    if (!ok) return;
    try {
      await rendezvousService.delete(rdv.idRdv);
      toast.success('Rendez-vous supprimé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Annulation
  const openAnnulationModal = (rdv: RendezVous) => {
    setAnnulationRdv(rdv);
    setMotifAnnulation('');
    setShowAnnulationModal(true);
  };

  const closeAnnulationModal = () => {
    setShowAnnulationModal(false);
    setAnnulationRdv(null);
    setMotifAnnulation('');
  };

  const confirmAnnulation = async () => {
    if (!motifAnnulation.trim()) {
      toast.error('Veuillez saisir un motif');
      return;
    }
    if (!annulationRdv) return;
    try {
      await rendezvousService.annuler(annulationRdv.idRdv, motifAnnulation);
      toast.success('Rendez-vous annulé');
      closeAnnulationModal();
      fetchData();
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Gestion des rendez-vous"
        subtitle={`${pagedData?.totalCount || 0} rendez-vous`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FaFilter />}
            >
              Filtres
            </Button>
            <Button onClick={() => router.push('/rendezvous/nouveau')} icon={<FaPlus />}>
              Nouveau rendez-vous
            </Button>
          </>
        }
      />

      {/* FILTRES */}
      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <FilterSelect
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {Object.values(StatutRendezVous).map((statut) => (
                <option key={statut} value={statut}>
                  {statut}
                </option>
              ))}
            </FilterSelect>
            <div className="flex gap-2">
              <FilterInput
                type="text"
                placeholder="Rechercher un patient..."
                value={searchPatientInput}
                onChange={(e) => setSearchPatientInput(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                icon={<FaSearch />}
                onClick={() => { setSearchPatient(searchPatientInput); setPagination(prev => ({ ...prev, pageIndex: 1 })); }}
              >
                Rechercher
              </Button>
            </div>
          </FilterPanel>
        </div>
      )}

      {/* TABLEAU */}
      {pagedData?.items?.length === 0 ? (
        <EmptyState icon={<FaBan />} title="Aucun rendez-vous trouvé" />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Date</Th>
                <Th>Patient</Th>
                <Th>Médecin</Th>
                <Th>Motif</Th>
                <Th>Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData?.items?.map((rdv: RendezVous) => (
                <Tr key={rdv.idRdv}>
                  <Td className="whitespace-nowrap">
                    {format(new Date(rdv.dateRdv), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <FaUserInjured className="inline mr-2 text-blue-500" />
                    {rdv.patientNom} {rdv.patientPrenom}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <FaUserMd className="inline mr-2 text-green-500" />
                    {rdv.medecinNom} {rdv.medecinPrenom}
                  </Td>
                  <Td>{rdv.motif || '-'}</Td>
                  <Td className="whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statutColors[rdv.statut]}`}
                    >
                      {rdv.statut}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      {/* Détails */}
                      <IconButton
                        color="gray"
                        title="Détails"
                        onClick={() => router.push(`/rendezvous/${rdv.idRdv}`)}
                      >
                        <FaEye size={14} />
                      </IconButton>
                      {/* Modifier */}
                      <IconButton color="blue" title="Modifier" onClick={() => router.push(`/rendezvous/${rdv.idRdv}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      {/* Annuler */}
                      {rdv.statut !== StatutRendezVous.Annule && (
                        <IconButton
                          color="green"
                          title="Annuler"
                          onClick={() => openAnnulationModal(rdv)}
                        >
                          <FaBan size={14} />
                        </IconButton>
                      )}
                      {/* Supprimer */}
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(rdv)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          {pagedData && pagedData.totalPages > 1 && (
            <Pagination
              pageIndex={pagedData.pageIndex}
              totalPages={pagedData.totalPages}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, pageIndex: page }))
              }
            />
          )}
        </TableContainer>
      )}

      {/* Modal d'annulation réutilisable */}
      <AnnulationModal
        isOpen={showAnnulationModal}
        rendezVous={annulationRdv}
        motif={motifAnnulation}
        onMotifChange={setMotifAnnulation}
        onConfirm={confirmAnnulation}
        onCancel={closeAnnulationModal}
      />
    </div>
  );
}
