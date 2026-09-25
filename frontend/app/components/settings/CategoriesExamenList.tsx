'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaLink } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { categorieExamenService } from '@/app/services/categorieExamenService';
import type { CategorieExamen } from '@/app/types/examen';
import { acteCatalogueService, type GroupeActe } from '@/app/services/acteCatalogueService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import PageHeader from '@/app/ui/PageHeader';
import Button, { IconButton } from '@/app/ui/Button';
import Modal from '@/app/ui/Modal';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';

interface FormState {
  code: string;
  libelle: string;
  description: string;
  idGroupeCatalogue: number | '';
  actif: boolean;
}

const emptyForm = (): FormState => ({
  code: '',
  libelle: '',
  description: '',
  idGroupeCatalogue: '',
  actif: true,
});

export default function CategoriesExamenList() {
  const confirm = useConfirm();
  const [categories, setCategories] = useState<CategorieExamen[]>([]);
  const [groupes, setGroupes] = useState<GroupeActe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategorieExamen | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, grps] = await Promise.all([
        categorieExamenService.getAllList(),
        acteCatalogueService.getGroupesAdmin('Examen'),
      ]);
      setCategories(cats);
      setGroupes(grps.filter((g) => g.actif !== false));
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (c: CategorieExamen) => {
    setEditing(c);
    setForm({
      code: c.code,
      libelle: c.libelle,
      description: c.description ?? '',
      idGroupeCatalogue: c.idGroupeCatalogue ?? '',
      actif: c.actif,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.libelle.trim()) {
      toast.error('Code et libellé sont requis');
      return;
    }
    const payload = {
      code: form.code.trim(),
      libelle: form.libelle.trim(),
      description: form.description || undefined,
      actif: form.actif,
      idGroupeCatalogue: form.idGroupeCatalogue === '' ? null : Number(form.idGroupeCatalogue),
    };
    setSaving(true);
    try {
      if (editing) {
        await categorieExamenService.update(editing.idCategorieExamen, payload);
        toast.success('Catégorie modifiée');
      } else {
        await categorieExamenService.create(payload);
        toast.success('Catégorie créée');
      }
      setShowModal(false);
      await load();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: CategorieExamen) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer la catégorie « ${c.libelle} » ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await categorieExamenService.delete(c.idCategorieExamen);
      toast.success('Catégorie supprimée');
      await load();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catégories d'examen"
        subtitle="Chaque catégorie est reliée à un groupe d'actes du catalogue (examens précis)."
        actions={
          <Button icon={<FaPlus />} onClick={openCreate}>
            Nouvelle catégorie
          </Button>
        }
      />

      {loading ? (
        <SkeletonTable columns={5} rows={8} />
      ) : categories.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-slate-200">
          Aucune catégorie d&apos;examen.
        </p>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Code</Th>
                <Th>Libellé</Th>
                <Th>Groupe du catalogue</Th>
                <Th align="center">Actif</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {categories.map((c) => (
                <Tr key={c.idCategorieExamen}>
                  <Td className="whitespace-nowrap font-mono text-xs">{c.code}</Td>
                  <Td className="font-medium">{c.libelle}</Td>
                  <Td className="whitespace-nowrap text-gray-600">
                    {c.groupeCatalogueLibelle ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <FaLink className="text-xs" /> {c.groupeCatalogueLibelle}
                      </span>
                    ) : (
                      <span className="text-amber-600">Non relié</span>
                    )}
                  </Td>
                  <Td className="text-center">
                    {c.actif ? <span className="text-green-600">Oui</span> : <span className="text-red-600">Non</span>}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="blue" title="Modifier" onClick={() => openEdit(c)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(c)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie d\'examen'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
            <FormInput
              label="Libellé"
              value={form.libelle}
              onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              required
            />
          </div>
          <FormSelect
            label="Groupe d'actes du catalogue (examens précis)"
            value={form.idGroupeCatalogue}
            onChange={(e) => setForm({ ...form, idGroupeCatalogue: e.target.value ? Number(e.target.value) : '' })}
            options={[
              { value: '', label: '-- Aucun --' },
              ...groupes.map((g) => ({ value: g.idGroupe, label: g.libelle })),
            ]}
          />
          <p className="text-xs text-slate-500">
            Les examens proposés dans « Prescription d&apos;examens » seront ceux de ce groupe.
          </p>
          <FormTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.actif}
              onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Actif
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving} icon={<FaSave />}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
