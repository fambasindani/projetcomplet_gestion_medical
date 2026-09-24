// app/specialites/page.tsx (ou components/specialites/SpecialitesList.tsx)
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaTag, FaUserTie, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaEye, FaChartBar, FaArrowLeft } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { specialiteService } from '@/app/services/specialiteService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { PagedResult } from '@/app/types/pagination';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import SpecialitesFilters from './SpecialitesFilters';
import StatsDashboard from './StatsDashboard';
import { Specialite } from '@/app/types/specialite';

const SpecialitesList: React.FC = () => {
  const confirm = useConfirm();
  const router = useRouter();

  const [pagedData, setPagedData] = useState<PagedResult<Specialite> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Chargement des données (déplacé dans useEffect)
  useEffect(() => {
    const fetchSpecialites = async () => {
      setLoading(true);
      try {
        let data: PagedResult<Specialite>;
        if (searchTerm) {
          data = await specialiteService.search(searchTerm, paginationParams);
        } else {
          switch (currentFilter) {
            case 'actives':
              data = await specialiteService.getActives(paginationParams);
              break;
            case 'inactives':
              data = await specialiteService.getAll(paginationParams);
              data.items = data.items.filter((s) => !s.actif);
              data.totalCount = data.items.length;
              data.totalPages = Math.ceil(data.totalCount / paginationParams.pageSize);
              break;
            case 'avec-medecins':
              data = await specialiteService.getAvecMedecins(paginationParams);
              break;
            case 'sans-medecins':
              data = await specialiteService.getSansMedecins(paginationParams);
              break;
            default:
              data = await specialiteService.getAll(paginationParams);
          }
        }
        setPagedData(data);
      } catch (error) {
        toast.error('Erreur lors du chargement des spécialités');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialites();
  }, [paginationParams, currentFilter, searchTerm, reloadTrigger]);

  const handleDelete = async (id: number, nom: string) => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Supprimer la spécialité "${nom}" ? Cette action est irréversible.`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await specialiteService.delete(id);
      toast.success('Spécialité supprimée');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationParams((prev) => ({ ...prev, pageIndex: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showStats) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowStats(false)}
            icon={<FaArrowLeft />}
          >
            Retour
          </Button>
          <h2 className="text-xl font-bold text-gray-800">Statistiques des spécialités</h2>
        </div>
        <StatsDashboard />
      </div>
    );
  }

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestion des spécialités"
        subtitle={<><FaTag className="inline mr-1" /> {pagedData?.totalCount || 0} spécialité(s) trouvée(s)</>}
        actions={
          <>
            <RefreshButton onRefresh={() => setReloadTrigger(prev => prev + 1)} loading={loading} />
            <Button
              variant="secondary"
              onClick={() => setShowStats(true)}
              icon={<FaChartBar />}
            >
              Statistiques
            </Button>
            <Button onClick={() => router.push('/specialites/nouveau')} icon={<FaPlus />}>
              Nouvelle spécialité
            </Button>
          </>
        }
      />

      {/* Filters */}
      <SpecialitesFilters
        onSearch={setSearchTerm}
        onFilterChange={setCurrentFilter}
        onSortChange={() => {}}
        totalCount={pagedData?.totalCount || 0}
        activeFilter={currentFilter}
      />

      {/* Empty state */}
      {!pagedData?.items.length ? (
        <EmptyState
          icon={<FaTag />}
          title="Aucune spécialité trouvée"
          description={searchTerm ? 'Aucun résultat pour votre recherche' : 'Commencez par ajouter une spécialité'}
          action={searchTerm ? (
            <Button variant="secondary" onClick={() => setSearchTerm('')}>Effacer la recherche</Button>
          ) : undefined}
        />
      ) : (
        <>
          {/* Table */}
          <TableContainer>
            <Table>
              <THead>
                <tr>
                  <Th><FaTag className="inline mr-1" /> Nom</Th>
                  <Th><FaUserTie className="inline mr-1" /> Chef</Th>
                  <Th><FaPhone className="inline mr-1" /> Téléphone</Th>
                  <Th><FaEnvelope className="inline mr-1" /> Email</Th>
                  <Th>Statut</Th>
                  <Th align="center">Actions</Th>
                </tr>
              </THead>
              <TBody>
                {pagedData.items.map((spec) => (
                  <Tr key={spec.idSpecialite} onClick={() => router.push(`/specialites/${spec.idSpecialite}/details`)}>
                    <Td className="whitespace-nowrap text-sm font-medium text-gray-900">
                      {spec.nomSpecialite}
                      {spec.description && (
                        <div className="text-xs text-gray-500">{spec.description.slice(0, 50)}…</div>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-sm text-gray-600">{spec.chefService || '-'}</Td>
                    <Td className="whitespace-nowrap text-sm text-gray-600">{spec.telephoneService || '-'}</Td>
                    <Td className="whitespace-nowrap text-sm text-gray-600">{spec.emailService || '-'}</Td>
                    <Td className="whitespace-nowrap">
                      {spec.actif ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <FaCheckCircle className="mr-1" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          <FaTimesCircle className="mr-1" /> Inactif
                        </span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <IconButton
                          color="indigo"
                          onClick={() => router.push(`/specialites/${spec.idSpecialite}/details`)}
                          title="Voir détails"
                        >
                          <FaEye size={14} />
                        </IconButton>
                        <IconButton
                          color="blue"
                          onClick={() => router.push(`/specialites/${spec.idSpecialite}/modifier`)}
                          title="Modifier"
                        >
                          <FaEdit size={14} />
                        </IconButton>
                        <IconButton
                          color="red"
                          onClick={() => handleDelete(spec.idSpecialite, spec.nomSpecialite)}
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
        </>
      )}
    </div>
  );
};

export default SpecialitesList;
