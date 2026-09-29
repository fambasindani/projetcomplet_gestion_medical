'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/app/utils/toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaUserPlus, FaSitemap, FaTimes } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { serviceHospitalierService } from '@/app/services/serviceHospitalierService';
import type { ServiceHospitalier, PersonnelAffecteService } from '@/app/services/serviceHospitalierService';
import { PersonnelSearchSelect } from '@/app/components/common/PersonnelSearchSelect';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { FormInput } from '@/app/components/common/FormInput';
import PageHeader from '@/app/ui/PageHeader';
import Button, { IconButton } from '@/app/ui/Button';
import Modal from '@/app/ui/Modal';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';

interface FormState {
  nom: string;
  pole: string;
  type: string;
  responsable: string;
  actif: boolean;
}

const emptyForm = (): FormState => ({ nom: '', pole: '', type: '', responsable: '', actif: true });

export default function ServicesList() {
  const confirm = useConfirm();
  const [services, setServices] = useState<ServiceHospitalier[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });
  const [pagedMeta, setPagedMeta] = useState({ pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ServiceHospitalier | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const [affectModal, setAffectModal] = useState<ServiceHospitalier | null>(null);
  const [idPersonnel, setIdPersonnel] = useState<number | null>(null);
  const [affecting, setAffecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await serviceHospitalierService.search(undefined, undefined, paginationParams.pageIndex, paginationParams.pageSize);
      setServices(res.items);
      setPagedMeta({ pageIndex: res.pageIndex, pageSize: res.pageSize, totalCount: res.totalCount, totalPages: res.totalPages });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [paginationParams.pageIndex, paginationParams.pageSize]);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (s: ServiceHospitalier) => {
    setEditing(s);
    setForm({ nom: s.nom, pole: s.pole ?? '', type: s.type ?? '', responsable: s.responsable ?? '', actif: s.actif });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) { toast.error('Le nom est requis'); return; }
    const payload = {
      nom: form.nom.trim(),
      pole: form.pole || null,
      type: form.type || null,
      responsable: form.responsable || null,
      actif: form.actif,
    };
    setSaving(true);
    try {
      if (editing) { await serviceHospitalierService.update(editing.idService, payload); toast.success('Service modifie'); }
      else { await serviceHospitalierService.create(payload); toast.success('Service cree'); }
      setShowModal(false);
      await load();
    } catch (error) { toast.error(extractErrorMessage(error)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (s: ServiceHospitalier) => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer le service « ${s.nom} » ?`, confirmText: 'Oui, supprimer', cancelText: 'Annuler', confirmColor: '#d33' });
    if (!ok) return;
    try { await serviceHospitalierService.delete(s.idService); toast.success('Service supprime'); await load(); }
    catch (error) { toast.error(extractErrorMessage(error)); }
  };

  const openAffect = (s: ServiceHospitalier) => { setAffectModal(s); setIdPersonnel(null); };

  const handleAffect = async () => {
    if (!affectModal || !idPersonnel) { toast.error('Selectionnez un membre du personnel'); return; }
    setAffecting(true);
    try {
      await serviceHospitalierService.affecter(idPersonnel, affectModal.idService);
      toast.success('Personnel affecte');
      setAffectModal(null);
      await load();
    } catch (error) { toast.error(extractErrorMessage(error)); }
    finally { setAffecting(false); }
  };

  const handleRetirer = async (s: ServiceHospitalier, p: PersonnelAffecteService) => {
    const ok = await confirm({ title: 'Retirer', message: `Retirer ${p.nom} de « ${s.nom} » ?`, confirmText: 'Oui, retirer', cancelText: 'Annuler', confirmColor: '#d33' });
    if (!ok) return;
    try { await serviceHospitalierService.retirerAffectation(p.idPersonnel); toast.success('Affectation retiree'); await load(); }
    catch (error) { toast.error(extractErrorMessage(error)); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        subtitle="Unites fonctionnelles (pole, service) — affectez medecins et infirmiers a leur service."
        actions={<Button icon={<FaPlus />} onClick={openCreate}>Nouveau service</Button>}
      />

      {loading ? (
        <SkeletonTable columns={5} rows={8} />
      ) : services.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-slate-200">Aucun service.</p>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Nom</Th>
                <Th>Pole</Th>
                <Th>Type</Th>
                <Th>Personnel affecte</Th>
                <Th align="center">Actif</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {services.map((s) => (
                <Tr key={s.idService}>
                  <Td className="font-medium">
                    <span className="inline-flex items-center gap-2"><FaSitemap className="text-indigo-500" /> {s.nom}</span>
                  </Td>
                  <Td className="whitespace-nowrap text-gray-600">{s.pole || '-'}</Td>
                  <Td className="whitespace-nowrap text-gray-600">{s.type || '-'}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(s.personnel ?? []).length === 0 && <span className="text-xs text-gray-400">Aucun</span>}
                      {(s.personnel ?? []).map((p) => (
                        <span key={p.idPersonnel} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                          {p.nom}{p.fonction ? ` (${p.fonction})` : ''}
                          <button type="button" onClick={() => handleRetirer(s, p)} className="text-indigo-400 hover:text-red-600" title="Retirer">
                            <FaTimes size={9} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </Td>
                  <Td className="text-center">{s.actif ? <span className="text-green-600">Oui</span> : <span className="text-red-600">Non</span>}</Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="green" title="Affecter un membre" onClick={() => openAffect(s)}><FaUserPlus size={14} /></IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => openEdit(s)}><FaEdit size={14} /></IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(s)}><FaTrash size={14} /></IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagedMeta.totalPages > 1 && (
            <Pagination pageIndex={pagedMeta.pageIndex} totalPages={pagedMeta.totalPages} totalCount={pagedMeta.totalCount} pageSize={pagedMeta.pageSize} onPageChange={(page) => setPaginationParams((prev) => ({ ...prev, pageIndex: page }))} />
          )}
        </TableContainer>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Modifier le service' : 'Nouveau service'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            <FormInput label="Pole" value={form.pole} onChange={(e) => setForm({ ...form, pole: e.target.value })} placeholder="Ex : Pole Medecine" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Ex : Medecine, Chirurgie..." />
            <FormInput label="Responsable" value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            Actif
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" disabled={saving} icon={<FaSave />}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={affectModal !== null} onClose={() => setAffectModal(null)} title={`Affecter — ${affectModal?.nom ?? ''}`} size="md">
        <div className="space-y-4">
          <PersonnelSearchSelect label="Medecin / infirmier / personnel" value={idPersonnel} onChange={(id) => setIdPersonnel(id)} />
          <p className="text-xs text-slate-500">L&apos;affectation remplace le service actuel du membre du personnel.</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setAffectModal(null)}>Annuler</Button>
            <Button type="button" disabled={affecting} icon={<FaUserPlus />} onClick={handleAffect}>{affecting ? 'Affectation...' : 'Affecter'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}