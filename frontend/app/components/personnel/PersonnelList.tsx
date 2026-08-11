'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaIdCard, FaPhone, FaEnvelope, FaUserTag } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { personnelService } from '@/app/services/personnelService';
import type { PersonnelResponse } from '@/app/types/personnel';
import { GenreLabels, TypeContratLabels } from '@/app/types/personnel';

const PersonnelList = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const [personnel, setPersonnel] = useState<PersonnelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedFonction, setSelectedFonction] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalPages: 0, totalCount: 0 });

  const fetchData = useCallback(async (page: number, keyword = '') => {
    setLoading(true);
    try {
      // Utiliser search avec les filtres si disponibles
      const res = keyword || selectedGenre || selectedFonction
        ? await personnelService.search(keyword, page, pagination.pageSize)
        : await personnelService.getAll(page, pagination.pageSize);

      // Filtrage supplémentaire côté front si nécessaire
      let items = res.items;
      if (selectedGenre) {
        items = items.filter(p => p.genre === selectedGenre);
      }
      if (selectedFonction) {
        items = items.filter(p => p.fonction?.toLowerCase().includes(selectedFonction.toLowerCase()));
      }

      setPersonnel(items);
      setPagination({
        pageIndex: res.pageIndex,
        pageSize: res.pageSize,
        totalPages: res.totalPages,
        totalCount: res.totalCount,
      });
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, selectedGenre, selectedFonction]);

  useEffect(() => {
    void (async () => {
      await fetchData(pagination.pageIndex, searchTerm);
    })();
  }, [fetchData, pagination.pageIndex, searchTerm]);

  const handleDelete = async (id: number, nom: string, prenom: string) => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Supprimer ${nom} ${prenom} ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (ok) {
      await personnelService.delete(id);
      toast.success('Supprimé');
      fetchData(1, searchTerm);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setSelectedGenre(null);
    setSelectedFonction(null);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
  };

  const getGenreBadge = (genre: string) => {
    const colors: Record<string, string> = {
      M: 'bg-blue-100 text-blue-800',
      F: 'bg-pink-100 text-pink-800',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[genre] || 'bg-gray-100'}`}>
        {GenreLabels[genre as keyof typeof GenreLabels] || genre}
      </span>
    );
  };

  const getContratBadge = (contrat: string | null) => {
    if (!contrat) return null;
    const colors: Record<string, string> = {
      CDI: 'bg-green-100 text-green-800',
      CDD: 'bg-yellow-100 text-yellow-800',
      STAGE: 'bg-purple-100 text-purple-800',
      FREELANCE: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[contrat] || 'bg-gray-100'}`}>
        {TypeContratLabels[contrat as keyof typeof TypeContratLabels] || contrat}
      </span>
    );
  };

  // Fonctions disponibles (extraites des données pour les filtres)
  const fonctions = [...new Set(personnel.map(p => p.fonction).filter(Boolean))];

  const hasFilters = searchTerm || selectedGenre || selectedFonction;

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestion du personnel"
        subtitle={<><FaUsers className="inline mr-1" /> {pagination.totalCount} agent(s) trouvé(s)</>}
        actions={
          <>
            <RefreshButton onRefresh={() => fetchData(pagination.pageIndex, searchTerm)} loading={loading} />
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FaFilter />}
            >
              Filtres
            </Button>
            <Button onClick={() => router.push('/personnel/nouveau')} icon={<FaPlus />}>
              Nouveau
            </Button>
          </>
        }
      />

      {/* Filtres */}
      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <form onSubmit={handleSearch} className="flex gap-2">
              <FilterInput
                type="text"
                placeholder="Rechercher par nom, prénom, matricule..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button type="submit" size="sm" icon={<FaSearch />}>Rechercher</Button>
            </form>
            <FilterSelect
              value={selectedGenre || ''}
              onChange={(e) => setSelectedGenre(e.target.value || null)}
            >
              <option value="">Tous genres</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </FilterSelect>
            <FilterSelect
              value={selectedFonction || ''}
              onChange={(e) => setSelectedFonction(e.target.value || null)}
            >
              <option value="">Toutes fonctions</option>
              {fonctions.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </FilterSelect>
          </FilterPanel>
          {hasFilters && (
            <div className="mt-4 text-right">
              <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {personnel.length === 0 ? (
        <EmptyState
          icon={<FaUsers />}
          title="Aucun personnel trouvé"
          description={hasFilters ? 'Aucun résultat pour vos critères' : 'Commencez par ajouter un nouveau membre du personnel'}
          action={hasFilters ? (
            <Button variant="secondary" onClick={clearFilters}>Effacer les filtres</Button>
          ) : undefined}
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Matricule</Th>
                <Th>Nom &amp; Prénom</Th>
                <Th>Fonction</Th>
                <Th>Genre</Th>
                <Th>Contact</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {personnel.map((p) => (
                <Tr key={p.idPersonnel} className="cursor-pointer">
                  <Td className="whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                      <FaIdCard className="mr-1" /> {p.matricule}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700">
                          {getInitials(p.nom, p.prenom)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{p.nom} {p.prenom}</p>
                        <p className="text-xs text-gray-500">{p.service || 'Aucun service'}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-900">{p.fonction}</span>
                      {p.typeContrat && getContratBadge(p.typeContrat)}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {getGenreBadge(p.genre)}
                  </Td>
                  <Td className="text-sm text-gray-500">
                    {p.email && (
                      <div className="flex items-center">
                        <FaEnvelope className="mr-1 h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[150px]">{p.email}</span>
                      </div>
                    )}
                    {p.telephone && (
                      <div className="flex items-center mt-1">
                        <FaPhone className="mr-1 h-3 w-3 text-gray-400" />
                        <span>{p.telephone}</span>
                      </div>
                    )}
                    {!p.email && !p.telephone && <span className="text-gray-400 text-xs">-</span>}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton
                        color="gray"
                        onClick={() => router.push(`/personnel/${p.idPersonnel}`)}
                        title="Voir détails"
                      >
                        <FaUserTag size={14} />
                      </IconButton>
                      <IconButton
                        color="blue"
                        onClick={() => router.push(`/personnel/${p.idPersonnel}/modifier`)}
                        title="Modifier"
                      >
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton
                        color="red"
                        onClick={() => handleDelete(p.idPersonnel, p.nom, p.prenom)}
                        title="Supprimer"
                      >
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagination.totalPages > 1 && (
            <Pagination
              pageIndex={pagination.pageIndex}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              pageSize={pagination.pageSize}
              onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
};

export default PersonnelList;
