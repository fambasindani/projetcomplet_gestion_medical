'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaKey, FaShieldAlt } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { rbacService } from '@/app/services/rbacService';
import type { PermissionDto, RoleDto } from '@/app/types/rbac';
import type { PagedResult } from '@/app/types/pagination';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { FormInput } from '@/app/components/common/FormInput';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import Button, { IconButton } from '@/app/ui/Button';
import Modal from '@/app/ui/Modal';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur',
  MEDECIN: 'Médecin',
  PATIENT: 'Patient',
  SECRETAIRE: 'Secrétaire',
  PHARMACIEN: 'Pharmacien',
  INFIRMIER: 'Infirmier',
  RH: 'Ressources humaines',
};

export default function RolesCrud() {
  const confirm = useConfirm();
  const [data, setData] = useState<PagedResult<RoleDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoleDto | null>(null);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const [permRole, setPermRole] = useState<RoleDto | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [savingPerm, setSavingPerm] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await rbacService.getRoles(pageIndex, pageSize));
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setNom('');
    setDescription('');
    setShowForm(true);
  };

  const openEdit = (role: RoleDto) => {
    setEditing(role);
    setNom(role.nom);
    setDescription(role.description ?? '');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      toast.error('Le nom du rôle est requis');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await rbacService.updateRole(editing.id, { nom: nom.trim(), description: description || null });
        toast.success('Rôle modifié');
      } else {
        await rbacService.createRole({ nom: nom.trim(), description: description || null });
        toast.success('Rôle créé');
      }
      setShowForm(false);
      await fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: RoleDto) => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Supprimer le rôle « ${role.nom} » ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await rbacService.deleteRole(role.id);
      toast.success('Rôle supprimé');
      await fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const openPermissions = async (role: RoleDto) => {
    setPermRole(role);
    setRolePermissions(role.permissions);
    try {
      setAllPermissions(await rbacService.getAllPermissions());
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const editRoleFromPermissions = () => {
    if (!permRole) return;
    const role = permRole;
    setPermRole(null);
    openEdit(role);
  };

  const toggleAll = async (select: boolean) => {
    if (!permRole) return;
    const codes = select ? allPermissions.map((p) => p.code) : [];
    const previous = rolePermissions;
    setSavingPerm('__all__');
    setRolePermissions(codes);
    try {
      await rbacService.setRolePermissions(permRole.nom, codes);
      toast.success(select ? 'Toutes les permissions accordées' : 'Toutes les permissions retirées');
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setRolePermissions(previous);
    } finally {
      setSavingPerm(null);
    }
  };

  const togglePermission = async (permission: string) => {
    if (!permRole) return;
    const active = rolePermissions.includes(permission);
    setSavingPerm(permission);
    setRolePermissions((prev) => (active ? prev.filter((p) => p !== permission) : [...prev, permission]));
    try {
      if (active) {
        await rbacService.removePermission(permRole.nom, permission);
      } else {
        await rbacService.addPermission(permRole.nom, permission);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setRolePermissions(permRole.permissions);
    } finally {
      setSavingPerm(null);
    }
  };

  if (loading) return <SkeletonTable columns={4} rows={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h5 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <FaShieldAlt className="text-indigo-500" /> Rôles
          <span className="text-sm font-normal text-gray-400">({data?.totalCount ?? 0})</span>
        </h5>
        <Button icon={<FaPlus />} onClick={openCreate}>Nouveau rôle</Button>
      </div>

      {!data || data.items.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-slate-200">
          Aucun rôle.
        </p>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Nom</Th>
                <Th>Description</Th>
                <Th align="center">Permissions</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {data.items.map((role) => (
                <Tr key={role.id}>
                  <Td className="whitespace-nowrap font-medium text-gray-800">
                    {roleLabels[role.nom] ?? role.nom}
                  </Td>
                  <Td className="text-sm text-gray-500">{role.description ?? '—'}</Td>
                  <Td className="text-center">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {role.permissions.length}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="blue" title="Permissions" onClick={() => openPermissions(role)}>
                        <FaKey size={14} />
                      </IconButton>
                      <IconButton color="gray" title="Modifier" onClick={() => openEdit(role)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(role)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <Pagination
            pageIndex={data.pageIndex}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            pageSize={data.pageSize}
            onPageChange={setPageIndex}
          />
        </TableContainer>
      )}

      {/* Formulaire rôle */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Modifier le rôle' : 'Nouveau rôle'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormInput label="Nom" name="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          <FormTextarea
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </div>
        </form>
      </Modal>

      {/* Permissions du rôle */}
      <Modal
        isOpen={!!permRole}
        onClose={() => setPermRole(null)}
        title={`Permissions — ${permRole ? (roleLabels[permRole.nom] ?? permRole.nom) : ''}`}
        size="lg"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <span className="text-sm text-gray-500">
            {rolePermissions.length} / {allPermissions.length} permission(s)
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<FaEdit size={12} />}
              onClick={editRoleFromPermissions}
            >
              Modifier le rôle
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => toggleAll(true)}
              disabled={savingPerm === '__all__' || rolePermissions.length === allPermissions.length}
            >
              Tout cocher
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => toggleAll(false)}
              disabled={savingPerm === '__all__' || rolePermissions.length === 0}
            >
              Tout décocher
            </Button>
          </div>
        </div>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {allPermissions.map((perm) => (
            <label key={perm.code} className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rolePermissions.includes(perm.code)}
                disabled={savingPerm === perm.code}
                onChange={() => togglePermission(perm.code)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-mono text-xs text-gray-400">{perm.code}</span>
              <span>{perm.libelle}</span>
            </label>
          ))}
          {allPermissions.length === 0 && <p className="text-sm text-gray-400">Aucune permission.</p>}
        </div>
      </Modal>
    </div>
  );
}
