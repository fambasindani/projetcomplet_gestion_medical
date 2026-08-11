'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaBed, FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaDoorOpen, FaBuilding } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import type { PagedResult } from '@/app/types/pagination';
import { chambreService } from '@/app/services/chambreService';
import { Chambre, StatutChambre, TypeChambre } from '@/app/types/chambre';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const statutColors: Record<StatutChambre, string> = {
  [StatutChambre.Disponible]: 'bg-green-100 text-green-800',
  [StatutChambre.Occupee]: 'bg-red-100 text-red-800',
  [StatutChambre.En_nettoyage]: 'bg-yellow-100 text-yellow-800',
  [StatutChambre.Hors_service]: 'bg-gray-100 text-gray-800',
  [StatutChambre.Reservee]: 'bg-blue-100 text-blue-800',
};

const statutLabels: Record<StatutChambre, string> = {
  [StatutChambre.Disponible]: 'Disponible',
  [StatutChambre.Occupee]: 'Occupée',
  [StatutChambre.En_nettoyage]: 'En nettoyage',
  [StatutChambre.Hors_service]: 'Hors service',
  [StatutChambre.Reservee]: 'Réservée',
};

const typeLabels: Record<TypeChambre, string> = {
  [TypeChambre.Individuelle]: 'Individuelle',
  [TypeChambre.Double]: 'Double',
  [TypeChambre.Triple]: 'Triple',
  [TypeChambre.Suite]: 'Suite',
  [TypeChambre.Soins_intensifs]: 'Soins intensifs',
};

const ChambreList: React.FC = () => {
  const router = useRouter();
  const confirm = useConfirm();

  const [pagedData, setPagedData] = useState<PagedResult<Chambre> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ statut: '', type: '', etage: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const fetchChambres = async () => {
      setLoading(true);
      try {
        let data;
        const hasFilters = filters.statut || filters.type || filters.etage;
        if (hasFilters) {
          data = await chambreService.search(
            {
              statut: filters.statut as StatutChambre || undefined,
              type: filters.type as TypeChambre || undefined,
              etage: filters.etage ? parseInt(filters.etage) : undefined,
            },
            paginationParams.pageIndex,
            paginationParams.pageSize
          );
        } else {
          data = await chambreService.getAll(paginationParams.pageIndex, paginationParams.pageSize);
        }
        setPagedData(data);
      } catch (error) {
        toast.error('Erreur lors du chargement des chambres');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChambres();
  }, [paginationParams.pageIndex, paginationParams.pageSize, filters.statut, filters.type, filters.etage, reloadTrigger]);

  const handleDelete = async (id: number, numero: string) => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Supprimer la chambre ${numero} ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await chambreService.delete(id);
      toast.success('Chambre supprimée');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleChangerStatut = async (chambre: Chambre, statut: StatutChambre) => {
    if (statut === chambre.statut) return;
    try {
      await chambreService.changerStatut(chambre.idChambre, statut);
      toast.success(`Statut mis à jour : ${statutLabels[statut]}`);
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleEdit = (chambre: Chambre) => router.push(`/hospitalisations/chambres/${chambre.idChambre}/modifier`);
  const handleViewDetails = (chambre: Chambre) => router.push(`/hospitalisations/chambres/${chambre.idChambre}/details`);
  const handleAdd = () => router.push('/hospitalisations/chambres/nouveau');
  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, pageIndex: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
  };

  const clearFilters = () => {
    setFilters({ statut: '', type: '', etage: '' });
    setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
  };

  if (loading) return <SkeletonTable columns={7} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des chambres"
        subtitle={
          <>
            <FaBed className="inline mr-1" /> {pagedData?.totalCount || 0} chambre(s) trouvée(s)
          </>
        }
        actions={
          <>
            <RefreshButton onRefresh={() => setReloadTrigger(prev => prev + 1)} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={handleAdd}>
              Nouvelle chambre
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <FilterSelect
              name="statut"
              value={filters.statut}
              onChange={handleFilterChange}
            >
              <option value="">Tous statuts</option>
              {Object.entries(statutLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Tous types</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </FilterSelect>
            <FilterInput
              type="number"
              name="etage"
              placeholder="Étage"
              value={filters.etage}
              onChange={handleFilterChange}
            />
          </FilterPanel>
          {(filters.statut || filters.type || filters.etage) && (
            <div className="mt-4 text-right">
              <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {!pagedData || pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaBed />}
          title="Aucune chambre trouvée"
          description={
            filters.statut || filters.type || filters.etage
              ? 'Aucun résultat pour vos critères'
              : 'Commencez par ajouter une nouvelle chambre'
          }
          action={
            (filters.statut || filters.type || filters.etage) && (
              <Button variant="secondary" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N° Chambre</Th>
                <Th>Type</Th>
                <Th>Étage / Bâtiment</Th>
                <Th>Statut</Th>
                <Th>Prix / jour</Th>
                <Th>Spécialité</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((chambre) => (
                <Tr key={chambre.idChambre} className="cursor-pointer">
                  <Td className="whitespace-nowrap text-sm font-medium text-gray-900">
                    <FaDoorOpen className="inline mr-1 text-gray-400" /> {chambre.numeroChambre}
                  </Td>
                  <Td className="whitespace-nowrap text-sm text-gray-600">
                    {typeLabels[chambre.typeChambre]}
                  </Td>
                  <Td className="whitespace-nowrap text-sm text-gray-600">
                    <FaBuilding className="inline mr-1" /> Étage {chambre.etage ?? '-'} - {chambre.batiment ?? '-'}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <select
                      value={chambre.statut}
                      onChange={(e) => void handleChangerStatut(chambre, e.target.value as StatutChambre)}
                      className={`inline-flex rounded-full border-0 px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 ${statutColors[chambre.statut]}`}
                      title="Changer le statut"
                    >
                      {(Object.keys(statutLabels) as StatutChambre[]).map((s) => (
                        <option key={s} value={s}>{statutLabels[s]}</option>
                      ))}
                    </select>
                  </Td>
                  <Td className="whitespace-nowrap text-sm text-gray-600">
                    {chambre.prixJour ? `$${chambre.prixJour}` : '-'}
                  </Td>
                  <Td className="whitespace-nowrap text-sm text-gray-600">
                    {chambre.nomSpecialite || '-'}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir détails" onClick={() => handleViewDetails(chambre)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => handleEdit(chambre)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(chambre.idChambre, chambre.numeroChambre)}>
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
              totalCount={pagedData.totalCount}
              pageSize={pagedData.pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
};

export default ChambreList;
