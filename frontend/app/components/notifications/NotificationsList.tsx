'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaBell, FaTrash, FaCheckDouble, FaFilter, FaArrowLeft, FaClock,
  FaExclamationTriangle, FaBoxOpen, FaCalendarCheck, FaFlask, FaClipboardList
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import { notificationService } from '@/app/services/notificationService';
import type { Notification, TypeNotification } from '@/app/services/notificationService';
import type { PagedResult } from '@/app/types/pagination';

const typeMeta: Record<string, { icon: IconType; color: string }> = {
  STOCK_FAIBLE: { icon: FaExclamationTriangle, color: 'bg-amber-100 text-amber-600' },
  STOCK_CRITIQUE: { icon: FaExclamationTriangle, color: 'bg-red-100 text-red-600' },
  PEREMPTION_PROCHAINE: { icon: FaFlask, color: 'bg-amber-100 text-amber-600' },
  PEREMPTION_DEPASSEE: { icon: FaFlask, color: 'bg-red-100 text-red-600' },
  NOUVEAU_RDV: { icon: FaCalendarCheck, color: 'bg-indigo-100 text-indigo-600' },
  RDV_AUJOURDHUI: { icon: FaCalendarCheck, color: 'bg-blue-100 text-blue-600' },
  NOUVEL_INVENTAIRE: { icon: FaClipboardList, color: 'bg-purple-100 text-purple-600' },
  NOUVELLE_COMMANDE: { icon: FaBoxOpen, color: 'bg-teal-100 text-teal-600' },
  SYSTEME: { icon: FaBell, color: 'bg-gray-100 text-gray-600' },
};

const typeLabels: Record<TypeNotification, string> = {
  STOCK_FAIBLE: 'Stock faible',
  STOCK_CRITIQUE: 'Stock critique',
  PEREMPTION_PROCHAINE: 'Péremption prochaine',
  PEREMPTION_DEPASSEE: 'Péremption dépassée',
  NOUVEAU_RDV: 'Nouveau rendez-vous',
  RDV_AUJOURDHUI: 'Rendez-vous du jour',
  NOUVEL_INVENTAIRE: 'Inventaire',
  NOUVELLE_COMMANDE: 'Commande fournisseur',
  SYSTEME: 'Système',
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return d.toLocaleDateString('fr-FR');
};

const NotificationsList: React.FC = () => {
  const router = useRouter();
  const [pagedData, setPagedData] = useState<PagedResult<Notification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterLue, setFilterLue] = useState('');
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const lue = filterLue === '' ? undefined : filterLue === 'true';
      const data = await notificationService.getAll({ ...paginationParams, lue });
      let items = data.items;
      if (filterType) {
        items = items.filter((n) => n.typeNotification === filterType);
      }
      setPagedData({ ...data, items, totalCount: items.length, totalPages: Math.ceil(items.length / paginationParams.pageSize) });
    } catch {
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterLue, paginationParams]);

  useEffect(() => {
    void (async () => { await loadNotifications(); })();
  }, [loadNotifications]);

  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, pageIndex: page }));
  };

  const handleMarkOne = async (notif: Notification) => {
    if (notif.lue) return;
    try {
      await notificationService.marquerLue(notif.idNotification);
      loadNotifications();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.marquerToutesLues();
      toast.success('Toutes les notifications marquées comme lues');
      loadNotifications();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (notif: Notification) => {
    try {
      await notificationService.delete(notif.idNotification);
      toast.success('Notification supprimée');
      loadNotifications();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const hasFilters = filterType !== '' || filterLue !== '';

  if (loading) return <SkeletonTable columns={4} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={
          <>
            <FaBell className="inline mr-1" /> {pagedData?.totalCount || 0} notification(s)
          </>
        }
        actions={
          <>
            <RefreshButton onRefresh={loadNotifications} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button variant="secondary" icon={<FaCheckDouble />} onClick={handleMarkAll}>
              Tout marquer lu
            </Button>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/')}>
              Retour
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <FilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Tous les types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </FilterSelect>
            <FilterSelect value={filterLue} onChange={(e) => setFilterLue(e.target.value)}>
              <option value="">Toutes (lues / non lues)</option>
              <option value="false">Non lues</option>
              <option value="true">Lues</option>
            </FilterSelect>
          </FilterPanel>
          {hasFilters && (
            <div className="mt-4 text-right">
              <button
                onClick={() => { setFilterType(''); setFilterLue(''); setPaginationParams(prev => ({ ...prev, pageIndex: 1 })); }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {!pagedData || pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaBell />}
          title="Aucune notification"
          description={hasFilters ? 'Aucun résultat pour vos critères' : 'Les nouvelles notifications apparaîtront ici.'}
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Type</Th>
                <Th>Notification</Th>
                <Th>Date</Th>
                <Th align="center">Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((notif) => {
                const meta = typeMeta[notif.typeNotification] || typeMeta.SYSTEME;
                const Icon = meta.icon;
                return (
                  <Tr key={notif.idNotification} className={notif.lue ? 'opacity-60' : ''}>
                    <Td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.color}`}>
                          <Icon size={14} />
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {typeLabels[notif.typeNotification] || notif.typeNotification}
                        </span>
                      </div>
                    </Td>
                    <Td className="min-w-[280px]">
                      <p className="font-medium text-gray-900">{notif.titre}</p>
                      {notif.message && <p className="text-sm text-gray-500">{notif.message}</p>}
                    </Td>
                    <Td className="whitespace-nowrap text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaClock /> {formatDate(notif.dateCreation)}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-center">
                      {notif.lue ? (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Lue
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Non lue
                        </span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        {!notif.lue && (
                          <IconButton color="indigo" title="Marquer lue" onClick={() => handleMarkOne(notif)}>
                            <FaCheckDouble size={14} />
                          </IconButton>
                        )}
                        <IconButton color="red" title="Supprimer" onClick={() => handleDelete(notif)}>
                          <FaTrash size={14} />
                        </IconButton>
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

export default NotificationsList;
