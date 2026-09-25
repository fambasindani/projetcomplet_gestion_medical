'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaUsers, FaPlus, FaTrash, FaEdit, FaEye, FaSearch, FaFilter, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { userService } from '@/app/services/userService';
import { User } from '@/app/types/user';
import { PagedResult } from '@/app/types/pagination';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  PHARMACIEN: 'bg-blue-100 text-blue-800',
  MEDECIN: 'bg-green-100 text-green-800',
  SECRETAIRE: 'bg-yellow-100 text-yellow-800',
  PATIENT: 'bg-gray-100 text-gray-800',
  INFIRMIER: 'bg-pink-100 text-pink-800',
  LABORANTIN: 'bg-cyan-100 text-cyan-800',
  RH: 'bg-indigo-100 text-indigo-800',
};

export default function UserList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [data, setData] = useState<PagedResult<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedActive, setSelectedActive] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAll(pageIndex, pageSize);

      // Filtrage côté front
      let items = res.items;
      if (selectedRole) {
        items = items.filter((u: User) => u.role === selectedRole);
      }
      if (selectedActive !== null) {
        const isActive = selectedActive === 'true';
        items = items.filter((u: User) => u.actif === isActive);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        items = items.filter((u: User) =>
          u.nom.toLowerCase().includes(term) ||
          u.prenom.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        );
      }

      setData({
        ...res,
        items: items,
        totalCount: items.length,
        totalPages: Math.ceil(items.length / pageSize),
      });
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, selectedRole, selectedActive, searchTerm]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleDelete = async (user: User) => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Supprimer ${user.nom} ${user.prenom} ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await userService.delete(user.id);
      toast.success('Utilisateur supprimé');
      fetchData();
    } catch {
      toast.error('Erreur');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPageIndex(1);
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setSelectedRole(null);
    setSelectedActive(null);
    setPageIndex(1);
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const hasFilters = searchTerm || selectedRole || selectedActive;

  if (loading) return <SkeletonTable columns={7} rows={8} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle={<><FaUsers className="inline mr-1" /> {data?.totalCount || 0} utilisateur(s) trouvé(s)</>}
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FaFilter />}
            >
              Filtres
            </Button>
            <Button onClick={() => router.push('/settings/utilisateurs/nouveau')} icon={<FaPlus />}>
              Nouvel utilisateur
            </Button>
          </>
        }
      />

      {/* Filtres */}
      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <form onSubmit={handleSearch} className="flex gap-2">
              <FilterInput
                type="text"
                placeholder="Rechercher par nom, prénom, email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button type="submit" size="sm" icon={<FaSearch />}>Rechercher</Button>
            </form>
            <FilterSelect
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(e.target.value || null)}
            >
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Admin</option>
              <option value="PHARMACIEN">Pharmacien</option>
              <option value="MEDECIN">Médecin</option>
              <option value="SECRETAIRE">Secrétaire</option>
              <option value="PATIENT">Patient</option>
              <option value="INFIRMIER">Infirmier</option>
              <option value="LABORANTIN">Laborantin</option>
              <option value="RH">RH</option>
            </FilterSelect>
            <FilterSelect
              value={selectedActive || ''}
              onChange={(e) => setSelectedActive(e.target.value || null)}
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
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
      {!data || data.items.length === 0 ? (
        <EmptyState
          icon={<FaUsers />}
          title="Aucun utilisateur trouvé"
          description={hasFilters ? 'Aucun résultat pour vos critères' : 'Commencez par créer un nouvel utilisateur'}
          action={hasFilters ? (
            <Button variant="secondary" onClick={clearFilters}>Effacer les filtres</Button>
          ) : undefined}
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>ID</Th>
                <Th>Nom &amp; Prénom</Th>
                <Th>Email</Th>
                <Th>Rôle</Th>
                <Th>Statut</Th>
                <Th>Date création</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {data.items.map((user: User) => (
                <Tr key={user.id} className="cursor-pointer">
                  <Td className="whitespace-nowrap text-sm text-gray-500">{user.id}</Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700">
                          {getInitials(user.nom, user.prenom)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.nom} {user.prenom}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <FaEnvelope className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {user.actif ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                        <FaCheckCircle className="h-4 w-4" /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                        <FaTimesCircle className="h-4 w-4" /> Inactif
                      </span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FaCalendarAlt className="h-3 w-3 text-gray-400" />
                      {format(new Date(user.dateCreation), 'dd/MM/yyyy')}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton
                        color="gray"
                        onClick={() => router.push(`/settings/utilisateurs/${user.id}/details`)}
                        title="Voir détails"
                      >
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton
                        color="blue"
                        onClick={() => router.push(`/settings/utilisateurs/${user.id}/modifier`)}
                        title="Modifier"
                      >
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton
                        color="red"
                        onClick={() => handleDelete(user)}
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
          {data.totalPages > 1 && (
            <Pagination
              pageIndex={data.pageIndex}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              pageSize={data.pageSize}
              onPageChange={setPageIndex}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
}
