'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaKey } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { rbacService } from '@/app/services/rbacService';
import type { PermissionDto } from '@/app/types/rbac';
import type { PagedResult } from '@/app/types/pagination';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { FormInput } from '@/app/components/common/FormInput';
import Button, { IconButton } from '@/app/ui/Button';
import Modal from '@/app/ui/Modal';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';

export default function PermissionsCrud() {
  const confirm = useConfirm();
  const [data, setData] = useState<PagedResult<PermissionDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PermissionDto | null>(null);
  const [code, setCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [module, setModule] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await rbacService.getPermissions(pageIndex, pageSize));
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
    setCode('');
    setLibelle('');
    setModule('');
    setShowForm(true);
  };

  const openEdit = (perm: PermissionDto) => {
    setEditing(perm);
    setCode(perm.code);
    setLibelle(perm.libelle);
    setModule(perm.module ?? '');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !code.trim()) {
      toast.error('Le code est requis');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await rbacService.updatePermission(editing.id, { libelle, module: module || null });
        toast.success('Permission modifiée');
      } else {
        await rbacService.createPermission({ code: code.trim(), libelle, module: module || null });
        toast.success('Permission créée');
      }
      setShowForm(false);
      await fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (perm: PermissionDto) => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Supprimer la permission « ${perm.code} » ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await rbacService.deletePermission(perm.id);
      toast.success('Permission supprimée');
      await fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (loading) return <SkeletonTable columns={4} rows={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h5 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <FaKey className="text-indigo-500" /> Permissions
          <span className="text-sm font-normal text-gray-400">({data?.totalCount ?? 0})</span>
        </h5>
        <Button icon={<FaPlus />} onClick={openCreate}>Nouvelle permission</Button>
      </div>

      {!data || data.items.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-slate-200">
          Aucune permission.
        </p>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Code</Th>
                <Th>Libellé</Th>
                <Th>Module</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {data.items.map((perm) => (
                <Tr key={perm.id}>
                  <Td className="whitespace-nowrap font-mono text-xs text-gray-700">{perm.code}</Td>
                  <Td className="text-sm text-gray-800">{perm.libelle}</Td>
                  <Td className="text-sm text-gray-500">{perm.module ?? '—'}</Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Modifier" onClick={() => openEdit(perm)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(perm)}>
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

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Modifier la permission' : 'Nouvelle permission'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormInput
            label="Code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={!!editing}
            placeholder="EX: FACTURATION_VOIR"
            required
          />
          <FormInput label="Libellé" name="libelle" value={libelle} onChange={(e) => setLibelle(e.target.value)} />
          <FormInput label="Module" name="module" value={module} onChange={(e) => setModule(e.target.value)} placeholder="EX: FACTURATION" />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
