// components/medecins/MedecinsList.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUserMd, FaPlus, FaEdit, FaTrash, FaIdCard, FaEnvelope, FaPhone, FaBuilding, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaFilter, FaChartBar, FaEye } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import axios from 'axios';
import { medecinService } from '@/app/services/medecinService';
import { specialiteService } from '@/app/services/specialiteService';
import type { Specialite } from '@/app/types/specialite';
import type { Medecin } from '@/app/types/medecin';
import type { PagedResult } from '@/app/types/pagination';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import Button, { IconButton } from '@/app/ui/Button';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = API_URL?.replace('/api', '') || 'http://localhost:7034';

const MedecinsList: React.FC = () => {
  const router = useRouter();
  const confirm = useConfirm();

  const [pagedData, setPagedData] = useState<PagedResult<Medecin> | null>(null);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedSpecialite, setSelectedSpecialite] = useState<number | null>(null);
  const [selectedDisponibilite, setSelectedDisponibilite] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });

  // ========== FONCTIONS DÉFINIES AVANT LE useEffect ==========
  const getImageUrl = (medecin: Medecin) => {
    if (!medecin.photo) return null;
    if (medecin.photo.startsWith('blob:')) return medecin.photo;
    if (medecin.photo.startsWith('/uploads')) return `${BASE_URL}${medecin.photo}`;
    if (medecin.photo.startsWith('http')) return medecin.photo;
    return medecin.photo;
  };

  const getSpecialiteName = (medecin: Medecin): string | null => {
    if (!medecin.idSpecialite) return null;
    const specialite = specialites.find(s => s.idSpecialite === medecin.idSpecialite);
    return specialite?.nomSpecialite || null;
  };

  const loadMedecins = useCallback(async () => {
    setLoading(true);
    setImageErrors(new Set());
    try {
      let data: PagedResult<Medecin>;
      if (selectedSpecialite) {
        data = await medecinService.getBySpecialite(selectedSpecialite, paginationParams);
      } else if (selectedDisponibilite !== null) {
        data = await medecinService.getAll(paginationParams);
        if (selectedDisponibilite) {
          data.items = data.items.filter(m => m.disponibilite === selectedDisponibilite);
          data.totalCount = data.items.length;
          data.totalPages = Math.ceil(data.totalCount / paginationParams.pageSize);
        }
      } else if (searchTerm) {
        data = await medecinService.search(searchTerm, paginationParams);
      } else {
        data = await medecinService.getAll(paginationParams);
      }
      setPagedData(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des médecins');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [paginationParams, selectedSpecialite, selectedDisponibilite, searchTerm]);

  const loadSpecialites = useCallback(async () => {
    try {
      const data = await specialiteService.getAll({ pageSize: 100 });
      setSpecialites(data.items);
    } catch (error) {
      console.error('Erreur chargement spécialités:', error);
    }
  }, []);

  // ========== useEffect APRÈS les définitions ==========
  useEffect(() => {
    const fetchData = async () => {
      await loadMedecins();
      await loadSpecialites();
    };
    fetchData();
  }, [loadMedecins, loadSpecialites]);

  // ========== Gestionnaires d'événements ==========
  const handleImageError = (id: number) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  const handleDelete = async (id: number, nom: string, prenom: string) => {
    const confirmed = await confirm({
      title: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer le Dr. ${nom} ${prenom} ? Cette action est irréversible.`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!confirmed) return;
    try {
      await medecinService.delete(id);
      toast.success('Médecin supprimé avec succès');
      loadMedecins();
    } catch (error: unknown) {
      let message = 'Impossible de supprimer le médecin';
      if (axios.isAxiosError<{ message?: string }>(error)) {
        message = error.response?.data?.message ?? message;
      }
      toast.error(message);
    }
  };

  const handleEdit = (medecin: Medecin) => router.push(`/medecins/${medecin.idMedecin}/modifier`);
  const handleViewDetails = (medecin: Medecin) => router.push(`/medecins/${medecin.idMedecin}/details`);
  const handleStats = () => router.push('/medecins/statistiques');
  const handleAdd = () => router.push('/medecins/nouveau');
  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, pageIndex: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
    loadMedecins();
  };
  const clearFilters = () => {
    setSelectedSpecialite(null);
    setSelectedDisponibilite(null);
    setSearchTerm('');
    setSearchInput('');
    setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
  };

  const getDisponibiliteBadge = (disponibilite?: string | null) => {
    const colors = ['success', 'warning', 'danger', 'info'];
    const labels = ['Disponible', 'En congé', 'Absent', 'En formation'];
    const icons = [FaCheckCircle, FaClock, FaTimesCircle, FaGraduationCap];
    const values = ['Disponible', 'EnConge', 'Absent', 'EnFormation'];
    const idx = values.indexOf(disponibilite ?? '');
    const isValid = idx >= 0;
    const Icon = isValid ? icons[idx] : FaTimesCircle;
    const color = isValid ? colors[idx] : 'secondary';
    const label = isValid ? labels[idx] : 'Inconnu';
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-${color}-100 text-${color}-800`}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </span>
    );
  };

  const hasFilters = searchTerm || selectedSpecialite !== null || selectedDisponibilite !== null;

  // ========== RENDU ==========
  if (loading) {
    return <SkeletonTable columns={6} rows={8} />;
  }

  if (!pagedData || pagedData.items.length === 0) {
    return (
      <EmptyState
        icon={<FaUserMd />}
        title="Aucun médecin trouvé"
        description={hasFilters ? 'Aucun résultat pour vos critères' : 'Commencez par ajouter un nouveau médecin'}
        action={hasFilters ? (
          <Button variant="secondary" onClick={clearFilters}>Effacer les filtres</Button>
        ) : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestion des médecins"
        subtitle={<><FaUserMd className="mr-1 inline" /> {pagedData.totalCount} médecin(s) trouvé(s)</>}
        actions={
          <>
            <Button variant="secondary" onClick={handleStats} icon={<FaChartBar />}>Statistiques</Button>
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={<FaFilter />}>Filtres</Button>
            <Button onClick={handleAdd} icon={<FaPlus />}>Nouveau médecin</Button>
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
              value={selectedSpecialite ?? ''}
              onChange={(e) => setSelectedSpecialite(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Toutes spécialités</option>
              {specialites.map(spec => (
                <option key={spec.idSpecialite} value={spec.idSpecialite}>{spec.nomSpecialite}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              value={selectedDisponibilite ?? ''}
              onChange={(e) => setSelectedDisponibilite(e.target.value ? e.target.value : null)}
            >
              <option value="">Toutes disponibilités</option>
              <option value="Disponible">Disponible</option>
              <option value="EnConge">En congé</option>
              <option value="Absent">Absent</option>
              <option value="EnFormation">En formation</option>
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
      <TableContainer>
        <Table>
          <THead>
            <tr>
              <Th>Matricule</Th>
              <Th>Nom &amp; Prénom</Th>
              <Th>Spécialité</Th>
              <Th>Contact</Th>
              <Th>Disponibilité</Th>
              <Th align="center">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {pagedData.items.map((medecin) => {
              const imageUrl = getImageUrl(medecin);
              const hasImageError = imageErrors.has(medecin.idMedecin);
              const specialiteName = getSpecialiteName(medecin);
              return (
                <Tr key={medecin.idMedecin} className="cursor-pointer">
                  <Td className="whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                      <FaIdCard className="mr-1" /> {medecin.matricule}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                        {imageUrl && !hasImageError ? (
                          <img
                            src={imageUrl}
                            alt={`${medecin.prenom} ${medecin.nom}`}
                            className="h-full w-full object-cover"
                            onError={() => handleImageError(medecin.idMedecin)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-indigo-600">
                            <FaUserMd />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Dr. {medecin.nom} {medecin.prenom}</p>
                        <p className="text-sm text-gray-500">{medecin.qualification || 'Médecin'}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {specialiteName ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <FaBuilding className="mr-1" /> {specialiteName}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </Td>
                  <Td className="text-sm text-gray-500">
                    {medecin.email && <div className="flex items-center"><FaEnvelope className="mr-1 h-3 w-3" /> {medecin.email}</div>}
                    {medecin.telephone && <div className="flex items-center"><FaPhone className="mr-1 h-3 w-3" /> {medecin.telephone}</div>}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {getDisponibiliteBadge(medecin.disponibilite)}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton
                        color="gray"
                        onClick={() => handleViewDetails(medecin)}
                        title="Voir détails"
                      >
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton
                        color="blue"
                        onClick={() => handleEdit(medecin)}
                        title="Modifier"
                      >
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton
                        color="red"
                        onClick={() => handleDelete(medecin.idMedecin, medecin.nom, medecin.prenom)}
                        title="Supprimer"
                      >
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>

        {/* Pagination */}
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
    </div>
  );
};

export default MedecinsList;
