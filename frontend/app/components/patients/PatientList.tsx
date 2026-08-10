'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUserInjured, FaPlus, FaEdit, FaTrash, FaIdCard, FaEnvelope, FaPhone, FaSearch, FaFilter, FaChartBar, FaEye, FaFileMedical } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import type { PagedResult } from '@/app/types/pagination';
//import type{ GenreLabels } from '@/app/types/medecin';
import { GenreLabels } from '@/app/types/patient';

import type { Genre, Patient } from '@/app/types/patient';
import { patientService } from '@/app/services/patientService';

const PatientList: React.FC = () => {
  const router = useRouter();
  const confirm = useConfirm();

  const [pagedData, setPagedData] = useState<PagedResult<Patient> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        let data;
        if (selectedGenre !== null) {
          data = await patientService.getByGenre(selectedGenre, paginationParams);
        } else if (searchTerm) {
          data = await patientService.search(searchTerm, paginationParams);
        } else {
          data = await patientService.getAll(paginationParams);
        }
        setPagedData(data);
      } catch (error) {
        toast.error('Erreur lors du chargement des patients');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [paginationParams, paginationParams.pageIndex, paginationParams.pageSize, selectedGenre, searchTerm]);

  const handleDelete = async (id: number, nom: string, prenom: string) => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Supprimer le patient ${nom} ${prenom} ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await patientService.delete(id);
      toast.success('Patient supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (patient: Patient) => router.push(`/patients/${patient.idPatient}/modifier`);
  const handleViewDetails = (patient: Patient) => router.push(`/patients/${patient.idPatient}/details`);
  const handleDossierMedical = (patient: Patient) => router.push(`/patients/${patient.idPatient}/dossier-medical`);
  const handleStats = () => router.push('/patients/statistiques');
  const handleAdd = () => router.push('/patients/nouveau');
  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, pageIndex: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
  };
  const clearFilters = () => {
    setSelectedGenre(null);
    setSearchTerm('');
    setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
  };

  const getGenreLabel = (genre: Genre): string => GenreLabels[genre];

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des patients"
        subtitle={
          <>
            <FaUserInjured className="inline mr-1" /> {pagedData?.totalCount || 0} patient(s) trouvé(s)
          </>
        }
        actions={
          <>
            <Button variant="secondary" icon={<FaChartBar />} onClick={handleStats}>
              Statistiques
            </Button>
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={handleAdd}>
              Nouveau patient
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <form onSubmit={handleSearch} className="flex gap-2">
              <FilterInput
                type="text"
                placeholder="Rechercher par nom, prénom, numéro sécurité sociale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" icon={<FaSearch />} />
            </form>
            <FilterSelect
              value={selectedGenre ?? ''}
              onChange={(e) => setSelectedGenre(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Tous genres</option>
              <option value={0}>Masculin</option>
              <option value={1}>Féminin</option>
            </FilterSelect>
          </FilterPanel>
          {(selectedGenre !== null || searchTerm) && (
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
          icon={<FaUserInjured />}
          title="Aucun patient trouvé"
          description={
            searchTerm || selectedGenre !== null
              ? 'Aucun résultat pour vos critères'
              : 'Commencez par ajouter un nouveau patient'
          }
          action={
            (searchTerm || selectedGenre !== null) && (
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
                <Th>N° Sécurité Sociale</Th>
                <Th>Nom & Prénom</Th>
                <Th>Genre</Th>
                <Th>Contact</Th>
                <Th>Date naissance</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((patient) => (
                <Tr key={patient.idPatient} className="cursor-pointer">
                  <Td className="whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                      <FaIdCard className="mr-1" /> {patient.numeroSecuriteSociale}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.nom} {patient.prenom}
                  </Td>
                  <Td className="whitespace-nowrap text-sm text-gray-600">
                    {getGenreLabel(patient.genre)}
                  </Td>
                  <Td className="text-sm text-gray-500">
                    {patient.email && <div className="flex items-center"><FaEnvelope className="mr-1 h-3 w-3" /> {patient.email}</div>}
                    {patient.telephone && <div className="flex items-center"><FaPhone className="mr-1 h-3 w-3" /> {patient.telephone}</div>}
                  </Td>
                  <Td className="whitespace-nowrap text-sm text-gray-600">
                    {new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir détails" onClick={() => handleViewDetails(patient)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => handleEdit(patient)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="green" title="Dossier médical" onClick={() => handleDossierMedical(patient)}>
                        <FaFileMedical size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(patient.idPatient, patient.nom, patient.prenom)}>
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

export default PatientList;
