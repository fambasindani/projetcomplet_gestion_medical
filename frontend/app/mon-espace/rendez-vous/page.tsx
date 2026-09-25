'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaCalendarCheck, FaPlus, FaTrash, FaClock } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { patientPortalService, type MonRdv } from '@/app/services/patientPortalService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageHeader from '@/app/ui/PageHeader';
import Card from '@/app/components/common/Card';
import Button from '@/app/ui/Button';
import Modal from '@/app/ui/Modal';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import SkeletonTable from '@/app/ui/SkeletonTable';

function labelStatut(s: string) {
  if (s.startsWith('Programm')) return 'Programmé';
  if (s.startsWith('Confirm')) return 'Confirmé';
  if (s.startsWith('Annul')) return 'Annulé';
  if (s.startsWith('Termin')) return 'Terminé';
  return s;
}

function couleurStatut(s: string) {
  if (s.startsWith('Annul')) return { bg: '#ef444414', color: '#dc2626' };
  if (s.startsWith('Termin')) return { bg: '#64748b14', color: '#475569' };
  if (s.startsWith('Confirm')) return { bg: '#10b98114', color: '#059669' };
  return { bg: '#0ea5e914', color: '#0284c7' };
}

export default function MesRendezVousPage() {
  const confirm = useConfirm();
  const [rdvs, setRdvs] = useState<MonRdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [medecins, setMedecins] = useState<{ idMedecin: number; nom: string; prenom: string; specialite?: string | null }[]>([]);
  const [form, setForm] = useState({ dateRdv: '', idMedecin: '', motif: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRdvs(await patientPortalService.getRendezVous());
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const openModal = async () => {
    setForm({ dateRdv: '', idMedecin: '', motif: '' });
    setShowModal(true);
    try {
      const res = await patientPortalService.getMedecins();
      setMedecins(Array.isArray(res) ? res : []);
    } catch {
      setMedecins([]);
    }
  };

  const handleDemander = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dateRdv || !form.idMedecin) {
      toast.error('Choisissez un médecin et une date');
      return;
    }
    setSaving(true);
    try {
      await patientPortalService.demanderRendezVous({
        dateRdv: new Date(form.dateRdv).toISOString(),
        idMedecin: Number(form.idMedecin),
        motif: form.motif || undefined,
      });
      toast.success('Demande de rendez-vous envoyée');
      setShowModal(false);
      await load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleAnnuler = async (r: MonRdv) => {
    const ok = await confirm({
      title: 'Annuler le rendez-vous',
      message: `Annuler le rendez-vous du ${new Date(r.dateRdv).toLocaleString('fr-FR')} ?`,
      confirmText: 'Oui, annuler',
      cancelText: 'Non',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await patientPortalService.annulerRendezVous(r.idRdv);
      toast.success('Rendez-vous annulé');
      await load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes rendez-vous"
        subtitle="Consultez, demandez ou annulez vos rendez-vous"
        actions={<Button icon={<FaPlus />} onClick={openModal}>Demander un rendez-vous</Button>}
      />

      {loading ? (
        <SkeletonTable columns={4} rows={6} />
      ) : rdvs.length === 0 ? (
        <Empty />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Médecin</th>
                <th className="px-5 py-3">Motif</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rdvs.map((r) => {
                const c = couleurStatut(r.statut);
                const annulable = !r.statut.startsWith('Annul') && !r.statut.startsWith('Termin');
                return (
                  <tr key={r.idRdv} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-700">
                      {new Date(r.dateRdv).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {r.medecinNom ?? '-'}
                      {r.medecinSpecialite && <span className="block text-xs text-slate-400">{r.medecinSpecialite}</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{r.motif || '-'}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ background: c.bg, color: c.color }}>
                        {labelStatut(r.statut)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {annulable && (
                        <button onClick={() => handleAnnuler(r)} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50">
                          <FaTrash size={11} /> Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Demander un rendez-vous" size="lg">
        <form onSubmit={handleDemander} className="space-y-4">
          <FormSelect
            label="Médecin"
            value={form.idMedecin}
            onChange={(e) => setForm({ ...form, idMedecin: e.target.value })}
            options={[
              { value: '', label: '-- Choisir un médecin --' },
              ...medecins.map((m) => ({
                value: m.idMedecin,
                label: `Dr. ${m.prenom} ${m.nom}${m.specialite ? ` — ${m.specialite}` : ''}`,
              })),
            ]}
            required
          />
          <FormInput
            label="Date et heure souhaitées"
            type="datetime-local"
            value={form.dateRdv}
            onChange={(e) => setForm({ ...form, dateRdv: e.target.value })}
            required
          />
          <FormInput
            label="Motif (facultatif)"
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
            placeholder="ex. douleurs abdominales"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Envoi...' : 'Envoyer la demande'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
      <FaCalendarCheck className="text-4xl text-slate-200" />
      <p className="text-sm text-slate-400">Aucun rendez-vous pour le moment.</p>
    </div>
  );
}
