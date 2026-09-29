'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/app/utils/toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaUserPlus, FaFlask, FaTimes } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { laboratoireService } from '@/app/services/laboratoireService';
import type { Laboratoire, PersonnelAffecte } from '@/app/types/examen';
import { PersonnelSearchSelect } from '@/app/components/common/PersonnelSearchSelect';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { FormInput } from '@/app/components/common/FormInput';
import Can from '@/app/components/common/Can';
import RequirePermission from '@/app/components/common/RequirePermission';
import { usePermission } from '@/app/hooks/usePermission';
import PageHeader from '@/app/ui/PageHeader';
import Button, { IconButton } from '@/app/ui/Button';
import Modal from '@/app/ui/Modal';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';

interface FormState {
  nom: string;
  type: string;
  responsable: string;
  accreditation: string;
  actif: boolean;
}

const emptyForm = (): FormState => ({
  nom: '',
  type: '',
  responsable: '',
  accreditation: '',
  actif: true,
});

export default function LaboratoiresList() {
  const confirm = useConfirm();
  const { allowed: peutVoir } = usePermission('CATEGORIES_EXAMEN_VOIR');
  const [laboratoires, setLaboratoires] = useState<Laboratoire[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });
  const [pagedMeta, setPagedMeta] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Laboratoire | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Affectation
  const [affectModal, setAffectModal] = useState<Laboratoire | null>(null);
  const [idPersonnel, setIdPersonnel] = useState<number | null>(null);
  const [affecting, setAffecting] = useState(false);

  const load = useCallback(async () => {
    if (!peutVoir) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await laboratoireService.search(undefined, undefined, paginationParams.pageIndex, paginationParams.pageSize);
      setLaboratoires(res.items);
      setPagedMeta({
        pageIndex: res.pageIndex,
        pageSize: res.pageSize,
        totalCount: res.totalCount,
        totalPages: res.totalPages,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [paginationParams.pageIndex, paginationParams.pageSize, peutVoir]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (l: Laboratoire) => {
    setEditing(l);
    setForm({
      nom: l.nom,
      type: l.type ?? '',
      responsable: l.responsable ?? '',
      accreditation: l.accreditation ?? '',
      actif: l.actif,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    const payload = {
      nom: form.nom.trim(),
      type: form.type || null,
      responsable: form.responsable || null,
      accreditation: form.accreditation || null,
      actif: form.actif,
    };
    setSaving(true);
    try {
      if (editing) {
        await laboratoireService.update(editing.idLaboratoire, payload);
        toast.success('Laboratoire modifié');
      } else {
        await laboratoireService.create(payload);
        toast.success('Laboratoire créé');
      }
      setShowModal(false);
      await load();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (l: Laboratoire) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer le laboratoire « ${l.nom} » ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await laboratoireService.delete(l.idLaboratoire);
      toast.success('Laboratoire supprimé');
      await load();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const openAffect = (l: Laboratoire) => {
    setAffectModal(l);
    setIdPersonnel(null);
  };

  const handleAffect = async () => {
    if (!affectModal || !idPersonnel) {
      toast.error('Sélectionnez un technicien');
      return;
    }
    setAffecting(true);
    try {
      await laboratoireService.affecter(idPersonnel, affectModal.idLaboratoire);
      toast.success('Technicien affecté');
      setAffectModal(null);
      await load();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setAffecting(false);
    }
  };

  const handleRetirer = async (l: Laboratoire, p: PersonnelAffecte) => {
    const ok = await confirm({
      title: 'Retirer',
      message: `Retirer ${p.nom} de « ${l.nom} » ?`,
      confirmText: 'Oui, retirer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await laboratoireService.retirerAffectation(p.idPersonnel);
      toast.success('Affectation retirée');
      await load();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <RequirePermission permission="CATEGORIES_EXAMEN_VOIR">
    <div className="space-y-6">
      <PageHeader
        title="Laboratoires"
        subtitle="Plateaux techniques (ISO 15189) : chaque technicien ne voit que les examens de son laboratoire."
        actions={
          <Can permission="CATEGORIES_EXAMEN_GERER">
            <Button icon={<FaPlus />} onClick={openCreate}>
              Nouveau laboratoire
            </Button>
          </Can>
        }
      />

      {loading ? (
        <SkeletonTable columns={5} rows={8} />
      ) : laboratoires.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-slate-200">
          Aucun laboratoire.
        </p>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Nom</Th>
                <Th>Type</Th>
                <Th>Accréditation</Th>
                <Th>Personnel affecté</Th>
                <Th align="center">Actif</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {laboratoires.map((l) => (
                <Tr key={l.idLaboratoire}>
                  <Td className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <FaFlask className="text-indigo-500" /> {l.nom}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-gray-600">{l.type || '-'}</Td>
                  <Td className="whitespace-nowrap text-gray-600">{l.accreditation || '-'}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(l.personnel ?? []).length === 0 && (
                        <span className="text-xs text-gray-400">Aucun</span>
                      )}
                      {(l.personnel ?? []).map((p) => (
                        <span
                          key={p.idPersonnel}
                          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                        >
                          {p.nom}
                          <Can permission="CATEGORIES_EXAMEN_GERER">
                            <button
                              type="button"
                              onClick={() => handleRetirer(l, p)}
                              className="text-indigo-400 hover:text-red-600"
                              title="Retirer"
                            >
                              <FaTimes size={9} />
                            </button>
                          </Can>
                        </span>
                      ))}
                    </div>
                  </Td>
                  <Td className="text-center">
                    {l.actif ? (
                      <span className="text-green-600">Oui</span>
                    ) : (
                      <span className="text-red-600">Non</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <Can permission="CATEGORIES_EXAMEN_GERER">
                        <IconButton color="green" title="Affecter un technicien" onClick={() => openAffect(l)}>
                          <FaUserPlus size={14} />
                        </IconButton>
                      </Can>
                      <Can permission="CATEGORIES_EXAMEN_GERER">
                        <IconButton color="blue" title="Modifier" onClick={() => openEdit(l)}>
                          <FaEdit size={14} />
                        </IconButton>
                      </Can>
                      <Can permission="CATEGORIES_EXAMEN_GERER">
                        <IconButton color="red" title="Supprimer" onClick={() => handleDelete(l)}>
                          <FaTrash size={14} />
                        </IconButton>
                      </Can>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagedMeta.totalPages > 1 && (
            <Pagination
              pageIndex={pagedMeta.pageIndex}
              totalPages={pagedMeta.totalPages}
              totalCount={pagedMeta.totalCount}
              pageSize={pagedMeta.pageSize}
              onPageChange={(page) => setPaginationParams((prev) => ({ ...prev, pageIndex: page }))}
            />
          )}
        </TableContainer>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Modifier le laboratoire' : 'Nouveau laboratoire'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
            />
            <FormInput
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              placeholder="Ex : Biologie, Imagerie..."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Responsable"
              value={form.responsable}
              onChange={(e) => setForm({ ...form, responsable: e.target.value })}
            />
            <FormInput
              label="Accréditation"
              value={form.accreditation}
              onChange={(e) => setForm({ ...form, accreditation: e.target.value })}
              placeholder="Ex : ISO 15189"
            />
          </div>
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

      <Modal
        isOpen={affectModal !== null}
        onClose={() => setAffectModal(null)}
        title={`Affecter un technicien — ${affectModal?.nom ?? ''}`}
        size="md"
      >
        <div className="space-y-4">
          <PersonnelSearchSelect
            label="Technicien / laborantin"
            value={idPersonnel}
            onChange={(id) => setIdPersonnel(id)}
            fonction="Laborantin"
          />
          <p className="text-xs text-slate-500">
            L&apos;affectation remplace le laboratoire actuel du technicien. Il ne verra que les
            examens de ce laboratoire.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setAffectModal(null)}>
              Annuler
            </Button>
            <Button type="button" disabled={affecting} icon={<FaUserPlus />} onClick={handleAffect}>
              {affecting ? 'Affectation...' : 'Affecter'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </RequirePermission>
  );
}