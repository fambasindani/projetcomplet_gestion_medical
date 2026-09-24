// app/patients/[id]/dossier-medical/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  FaNotesMedical, FaCalendarAlt, FaPrescriptionBottle, FaFlask,
  FaHospitalUser, FaSyringe, FaArrowLeft, FaEye, FaPrint, FaHeartbeat,
} from 'react-icons/fa';
import { dossierMedicalService } from '@/app/services/dossierMedicalService';
import { DossierMedical } from '@/app/types/dossierMedical';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
import Button, { IconButton } from '@/app/ui/Button';
import EmptyState from '@/app/ui/EmptyState';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';

const statutBadge: Record<string, string> = {
  Prescrit: 'bg-amber-100 text-amber-800',
  Planifié: 'bg-blue-100 text-blue-800',
  En_cours: 'bg-cyan-100 text-cyan-800',
  Réalisé: 'bg-emerald-100 text-emerald-800',
  Validé: 'bg-indigo-100 text-indigo-800',
  Annulé: 'bg-red-100 text-red-800',
  Active: 'bg-emerald-100 text-emerald-800',
  Terminee: 'bg-slate-100 text-slate-700',
  Annulee: 'bg-red-100 text-red-800',
  En_attente: 'bg-amber-100 text-amber-800',
};

export default function DossierMedicalPage() {
  const router = useRouter();
  const { id } = useParams();
  const [dossier, setDossier] = useState<DossierMedical | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (id) {
      dossierMedicalService.getByPatientId(Number(id))
        .then(setDossier)
        .catch(() => setError('Impossible de charger le dossier médical.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (error) {
    return (
      <PageShell title="Dossier médical" onBack={() => router.back()}>
        <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
      </PageShell>
    );
  }
  if (!dossier) return <div className="p-6">Patient introuvable</div>;

  const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
  const formatDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString('fr-FR') : '—');

  const age = dossier.dateNaissance
    ? Math.floor((Date.now() - new Date(dossier.dateNaissance).getTime()) / (365.25 * 86400000))
    : null;

  const tabs = [
    { id: 'info', label: 'Informations', icon: FaNotesMedical, count: undefined as number | undefined },
    { id: 'consultations', label: 'Consultations', icon: FaCalendarAlt, count: dossier.consultations.length },
    { id: 'prescriptions', label: 'Prescriptions', icon: FaPrescriptionBottle, count: dossier.prescriptions.length },
    { id: 'examens', label: 'Examens', icon: FaFlask, count: dossier.examens.length },
    { id: 'hospitalisations', label: 'Hospitalisations', icon: FaHospitalUser, count: dossier.hospitalisations.length },
    { id: 'interventions', label: 'Interventions', icon: FaSyringe, count: dossier.interventions.length },
  ];

  return (
    <PageShell
      title={`Dossier médical — ${dossier.prenom} ${dossier.nom}`}
      subtitle="Synthèse complète du parcours de soins du patient"
      onBack={() => router.push('/patients')}
    >
      {/* Bandeau patient */}
      <DetailBanner
        meta="Patient"
        title={`${dossier.prenom} ${dossier.nom}`}
        subtitle={`${dossier.genre === 'F' ? 'Femme' : 'Homme'}${age !== null ? ` • ${age} ans` : ''} • Né(e) le ${formatDate(dossier.dateNaissance)}`}
        badges={
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            <FaHeartbeat /> {dossier.groupeSanguin || 'Groupe sanguin ?'}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaNotesMedical} label="Allergies" value={dossier.allergies || 'Aucune'} />
          <InfoCard icon={FaNotesMedical} label="Antécédents médicaux" value={dossier.antecedentsMedicaux || 'Aucun'} />
          <InfoCard icon={FaSyringe} label="Antécédents chirurgicaux" value={dossier.antecedentsChirurgicaux || 'Aucun'} />
          <InfoCard icon={FaPrescriptionBottle} label="Traitement habituel" value={dossier.traitementHabituel || 'Aucun'} />
          <InfoCard icon={FaHeartbeat} label="Mutuelle" value={dossier.mutuelle || 'Non renseignée'} />
        </InfoGrid>
      </DetailBanner>

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-indigo-600 bg-white text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon /> {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'info' && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <InfoGrid>
            <InfoCard icon={FaHeartbeat} label="Groupe sanguin" value={dossier.groupeSanguin} />
            <InfoCard icon={FaNotesMedical} label="Genre" value={dossier.genre === 'F' ? 'Féminin' : 'Masculin'} />
            <InfoCard icon={FaCalendarAlt} label="Date de naissance" value={formatDate(dossier.dateNaissance)} />
            <InfoCard icon={FaNotesMedical} label="Allergies" value={dossier.allergies || 'Aucune'} />
            <InfoCard icon={FaNotesMedical} label="Antécédents médicaux" value={dossier.antecedentsMedicaux || 'Aucun'} />
            <InfoCard icon={FaSyringe} label="Antécédents chirurgicaux" value={dossier.antecedentsChirurgicaux || 'Aucun'} />
            <InfoCard icon={FaPrescriptionBottle} label="Traitement habituel" value={dossier.traitementHabituel || 'Aucun'} />
            <InfoCard icon={FaHeartbeat} label="Mutuelle" value={dossier.mutuelle || 'Non renseignée'} />
          </InfoGrid>
          </div>
        )}

        {activeTab === 'consultations' && (
          <DataTable
            headers={['Date', 'Motif', 'Diagnostic', 'Médecin', 'Actions']}
            empty="Aucune consultation"
            rows={dossier.consultations.map((c) => ({
              cells: [formatDateTime(c.dateConsultation), c.motif, c.diagnostic || '—', `${c.medecinPrenom} ${c.medecinNom}`],
              actions: (
                <IconButton color="gray" title="Voir la consultation" onClick={() => router.push(`/consultations/${c.idConsultation}/details`)}>
                  <FaEye size={14} />
                </IconButton>
              ),
            }))}
          />
        )}

        {activeTab === 'prescriptions' && (
          <DataTable
            headers={['Date', 'Type', 'Description', 'Statut', 'Actions']}
            empty="Aucune prescription"
            rows={dossier.prescriptions.map((p) => ({
              cells: [
                formatDateTime(p.datePrescription),
                p.type,
                p.description,
                <StatutBadge key="s" statut={p.statut} />,
              ],
              actions: (
                <div className="flex justify-center gap-1">
                  <IconButton color="gray" title="Voir la prescription" onClick={() => router.push(`/prescriptions/${p.idPrescription}`)}>
                    <FaEye size={14} />
                  </IconButton>
                  {p.type === 'Examen' && (
                    <IconButton color="green" title="Imprimer les examens (PDF)" onClick={() => router.push(`/examens/prescriptions/${p.idPrescription}/impression`)}>
                      <FaPrint size={14} />
                    </IconButton>
                  )}
                </div>
              ),
            }))}
          />
        )}

        {activeTab === 'examens' && (
          <DataTable
            headers={['Type', 'Date réalisation', 'Résultat / Conclusion', 'Statut', 'Actions']}
            empty="Aucun examen"
            rows={dossier.examens.map((e) => ({
              cells: [
                e.typeExamen,
                e.dateRealisation ? formatDateTime(e.dateRealisation) : 'Non réalisé',
                <span key="r" className="block max-w-md">
                  <span className="text-slate-700">{e.resultat || 'En attente'}</span>
                  {e.conclusion && <span className="block text-xs text-slate-400">Conclusion : {e.conclusion}</span>}
                </span>,
                <StatutBadge key="s" statut={e.statut} />,
              ],
              actions: (
                <div className="flex justify-center gap-1">
                  <IconButton color="indigo" title="Voir le détail" onClick={() => router.push(`/examens/details/${e.idExamen}`)}>
                    <FaEye size={14} />
                  </IconButton>
                  <IconButton color="green" title="Voir / imprimer le PDF" onClick={() => router.push(`/examens/${e.idExamen}/impression`)}>
                    <FaPrint size={14} />
                  </IconButton>
                </div>
              ),
            }))}
          />
        )}

        {activeTab === 'hospitalisations' && (
          <DataTable
            headers={['Admission', 'Sortie', 'Motif', 'Diagnostic', 'Statut', 'Actions']}
            empty="Aucune hospitalisation"
            rows={dossier.hospitalisations.map((h) => ({
              cells: [
                formatDate(h.dateAdmission),
                h.dateSortie ? formatDate(h.dateSortie) : 'En cours',
                h.motifAdmission,
                h.diagnosticPrincipal || '—',
                <StatutBadge key="s" statut={h.statut} />,
              ],
              actions: (
                <IconButton color="gray" title="Voir l'hospitalisation" onClick={() => router.push(`/patients/hospitalisations/${h.idHospitalisation}`)}>
                  <FaEye size={14} />
                </IconButton>
              ),
            }))}
          />
        )}

        {activeTab === 'interventions' && (
          <DataTable
            headers={['Type', 'Date', 'Chirurgien', 'Anesthésie', 'Résultat', 'Actions']}
            empty="Aucune intervention"
            rows={dossier.interventions.map((i) => ({
              cells: [i.typeIntervention, formatDateTime(i.dateIntervention), i.chirurgienPrincipal, i.anesthesieType || '—', i.resultat || '—'],
              actions: (
                <IconButton color="gray" title="Voir l'intervention" onClick={() => router.push(`/urgences/interventions/${i.idIntervention}`)}>
                  <FaEye size={14} />
                </IconButton>
              ),
            }))}
          />
        )}
      </div>
    </PageShell>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statutBadge[statut] ?? 'bg-slate-100 text-slate-700'}`}>
      {statut.replace(/_/g, ' ')}
    </span>
  );
}

interface RowData {
  cells: ReactNode[];
  actions?: ReactNode;
}

function DataTable({ headers, rows, empty }: { headers: string[]; rows: RowData[]; empty: string }) {
  if (rows.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={<FaNotesMedical />} title={empty} />
      </div>
    );
  }
  return (
    <TableContainer className="rounded-2xl ring-0">
      <Table>
        <THead>
          <tr>
            {headers.map((h, idx) => (
              <Th key={idx} align={h === 'Actions' ? 'center' : 'left'}>
                {h}
              </Th>
            ))}
          </tr>
        </THead>
        <TBody>
          {rows.map((row, i) => (
            <Tr key={i}>
              {row.cells.map((cell, j) => (
                <Td key={j} className="align-top text-sm text-slate-700">
                  {cell}
                </Td>
              ))}
              {row.actions !== undefined && <Td className="text-center">{row.actions}</Td>}
            </Tr>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}
