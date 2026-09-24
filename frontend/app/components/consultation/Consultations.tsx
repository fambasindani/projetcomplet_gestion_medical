// app/components/consultation/ConsultationList.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaStethoscope, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaUserMd, FaUser } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import type { PagedResult } from '@/app/types/pagination';
import type { Consultation } from '@/app/types/consultation';
import { consultationService } from '@/app/services/consultationService';
import { useAuth } from '@/app/contexts/AuthContext';
import { peutModifier } from '@/app/utils/permissions';

const ConsultationList: React.FC = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const { user } = useAuth();
  const estMedecin = user?.role === 'MEDECIN';

  const [pagedData, setPagedData] = useState<PagedResult<Consultation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      let data: PagedResult<Consultation>;
      if (searchTerm.trim()) {
        // Recherche simple : récupère toutes les consultations (max 100) et filtre côté client
        const all = await consultationService.getAll(1, 100);
        const filteredItems = all.items.filter(
          (c) =>
            c.patientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.patientPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.medecinNom.toLowerCase().includes(searchTerm.toLowerCase())
        );
        data = {
          ...all,
          items: filteredItems,
          totalCount: filteredItems.length,
          totalPages: Math.ceil(filteredItems.length / paginationParams.pageSize),
        };
      } else {
        data = await consultationService.getAll(paginationParams.pageIndex, paginationParams.pageSize);
      }
      setPagedData(data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des consultations');
      setPagedData(null);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, paginationParams.pageIndex, paginationParams.pageSize]);

  // Chargement des consultations
  useEffect(() => {
    void (async () => {
      await fetchConsultations();
    })();
  }, [fetchConsultations]);

  // Suppression d'une consultation
  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer cette consultation.`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });

    if (!ok) return;
    try {
      await consultationService.delete(id);
      toast.success('Consultation supprimée');
      // Recharger la première page
      await fetchConsultations();
      setPaginationParams((prev) => ({ ...prev, pageIndex: 1 }));
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationParams((prev) => ({ ...prev, pageIndex: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // États de chargement et d'erreur
  if (loading) return <SkeletonTable columns={6} rows={8} />;
  if (!pagedData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-red-600">Impossible de charger les consultations. Veuillez réessayer.</div>
      </div>
    );
  }

  const hasNoItems = pagedData.items.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={estMedecin ? 'Mes consultations' : 'Toutes les consultations'}
        subtitle={
          <span>
            <FaStethoscope className="mr-1 inline" /> {pagedData.totalCount} consultation(s)
          </span>
        }
        actions={
          <>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSearchTerm(searchInput);
                setPaginationParams((prev) => ({ ...prev, pageIndex: 1 }));
              }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher patient / médecin..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-64 rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <Button type="submit" icon={<FaSearch />}>Rechercher</Button>
            </form>
            <RefreshButton onRefresh={fetchConsultations} loading={loading} />
            <Button icon={<FaPlus />} onClick={() => router.push('/consultations/nouveau')}>
              Nouvelle consultation
            </Button>
          </>
        }
      />

      {hasNoItems ? (
        <EmptyState
          icon={<FaStethoscope />}
          title="Aucune consultation trouvée"
          description={
            searchTerm
              ? 'Aucun résultat ne correspond à votre recherche.'
              : 'Commencez par créer une nouvelle consultation.'
          }
          action={
            searchTerm && (
              <Button variant="secondary" onClick={() => { setSearchTerm(''); setSearchInput(''); }}>
                Effacer la recherche
              </Button>
            )
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Date</Th>
                <Th>Patient</Th>
                <Th>Médecin</Th>
                <Th>Motif</Th>
                <Th>Diagnostic</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((cons) => {
                const peutEditer = peutModifier(user?.role, user?.medecinId, cons.idMedecin);
                return (
                <Tr key={cons.idConsultation}>
                  <Td className="whitespace-nowrap text-gray-900">
                    {new Date(cons.dateConsultation).toLocaleString()}
                  </Td>
                  <Td className="whitespace-nowrap text-gray-900">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      {cons.patientNom} {cons.patientPrenom}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-gray-900">
                    <div className="flex items-center gap-2">
                      <FaUserMd className="text-gray-400" />
                      {cons.medecinNom} {cons.medecinPrenom}
                    </div>
                  </Td>
                  <Td className="max-w-xs truncate text-gray-600">
                    {cons.motifConsultation}
                  </Td>
                  <Td className="max-w-xs truncate text-gray-600">
                    {cons.diagnostic || '-'}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton
                        color="indigo"
                        title="Détails"
                        onClick={() => router.push(`/consultations/${cons.idConsultation}/details`)}
                      >
                        <FaEye size={14} />
                      </IconButton>
                      {peutEditer && (
                        <>
                          <IconButton
                            color="blue"
                            title="Modifier"
                            onClick={() => router.push(`/consultations/${cons.idConsultation}/modifier`)}
                          >
                            <FaEdit size={14} />
                          </IconButton>
                          <IconButton
                            color="red"
                            title="Supprimer"
                            onClick={() => handleDelete(cons.idConsultation)}
                          >
                            <FaTrash size={14} />
                          </IconButton>
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
                );
              })}
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

export default ConsultationList;
