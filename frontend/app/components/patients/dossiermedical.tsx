// app/patients/[id]/dossier-medical/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { dossierMedicalService } from '@/app/services/dossierMedicalService';
import { DossierMedical } from '@/app/types/dossierMedical';
import { FaNotesMedical, FaCalendarAlt, FaPrescriptionBottle, FaFlask, FaHospitalUser, FaSyringe, FaArrowLeft } from 'react-icons/fa';
//import { FaNotesMedical, FaCalendarAlt, FaPrescriptionBottle, FaFlask, FaHospitalUser, FaScalpel, FaArrowLeft } from 'react-icons/fa';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';

const tabs = [
  { id: 'info', label: 'Infos patient', icon: FaNotesMedical },
  { id: 'consultations', label: 'Consultations', icon: FaCalendarAlt },
  { id: 'prescriptions', label: 'Prescriptions', icon: FaPrescriptionBottle },
  { id: 'examens', label: 'Examens', icon: FaFlask },
  { id: 'hospitalisations', label: 'Hospitalisations', icon: FaHospitalUser },
  { id: 'interventions', label: 'Interventions', icon: FaSyringe }, // au lieu de FaScalpel
];


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
        .catch(err => {
          console.error(err);
          setError("Impossible de charger le dossier médical.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (error) return (
    <div className="space-y-6">
      <div className="rounded-md bg-red-50 p-4 text-red-700">
        {error}
      </div>
      <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.back()}>
        Retour
      </Button>
    </div>
  );
  if (!dossier) return <div className="space-y-6">Patient introuvable</div>;

  // Fonction utilitaire pour formater les dates
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };
  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Dossier médical – ${dossier.prenom} ${dossier.nom}`}
        subtitle={`Né(e) le ${formatDate(dossier.dateNaissance)}`}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/patients')}>
            Retour
          </Button>
        }
      />

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Groupe sanguin" value={dossier.groupeSanguin} />
            <InfoItem label="Allergies" value={dossier.allergies || 'Aucune'} />
            <InfoItem label="Antécédents médicaux" value={dossier.antecedentsMedicaux || 'Aucun'} />
            <InfoItem label="Antécédents chirurgicaux" value={dossier.antecedentsChirurgicaux || 'Aucun'} />
            <InfoItem label="Traitement habituel" value={dossier.traitementHabituel || 'Aucun'} />
            <InfoItem label="Mutuelle" value={dossier.mutuelle || 'Non renseignée'} />
          </div>
        )}

        {activeTab === 'consultations' && (
          <DataTable
            headers={['Date', 'Motif', 'Diagnostic', 'Médecin']}
            rows={dossier.consultations.map(c => [
              formatDateTime(c.dateConsultation),
              c.motif,
              c.diagnostic || '-',
              `${c.medecinPrenom} ${c.medecinNom}`
            ])}
          />
        )}

        {activeTab === 'prescriptions' && (
          <DataTable
            headers={['Date', 'Type', 'Description', 'Statut']}
            rows={dossier.prescriptions.map(p => [
              formatDateTime(p.datePrescription),
              p.type,
              p.description,
              p.statut
            ])}
          />
        )}

        {activeTab === 'examens' && (
          <DataTable
            headers={['Type', 'Date réalisation', 'Résultat', 'Statut']}
            rows={dossier.examens.map(e => [
              e.typeExamen,
              e.dateRealisation ? formatDateTime(e.dateRealisation) : 'Non réalisé',
              e.resultat || 'En attente',
              e.statut
            ])}
          />
        )}

        {activeTab === 'hospitalisations' && (
          <DataTable
            headers={['Admission', 'Sortie', 'Motif', 'Diagnostic', 'Statut']}
            rows={dossier.hospitalisations.map(h => [
              formatDate(h.dateAdmission),
              h.dateSortie ? formatDate(h.dateSortie) : 'En cours',
              h.motifAdmission,
              h.diagnosticPrincipal || '-',
              h.statut
            ])}
          />
        )}

        {activeTab === 'interventions' && (
          <DataTable
            headers={['Type', 'Date', 'Chirurgien', 'Anesthésie', 'Résultat']}
            rows={dossier.interventions.map(i => [
              i.typeIntervention,
              formatDateTime(i.dateIntervention),
              i.chirurgienPrincipal,
              i.anesthesieType || '-',
              i.resultat || '-'
            ])}
          />
        )}
      </div>
    </div>
  );
}

// Composants utilitaires
const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <div className="text-sm text-gray-500">{label}</div>
    <div className="font-medium">{value || '—'}</div>
  </div>
);

const DataTable = ({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) => (
  <TableContainer>
    <Table>
      <THead>
        <tr>
          {headers.map((h, idx) => (
            <Th key={idx}>{h}</Th>
          ))}
        </tr>
      </THead>
      <TBody>
        {rows.map((row, i) => (
          <Tr key={i}>
            {row.map((cell, j) => (
              <Td key={j} className="text-sm text-gray-900">
                {cell}
              </Td>
            ))}
          </Tr>
        ))}
      </TBody>
    </Table>
    {rows.length === 0 && <div className="text-center py-8 text-gray-500">Aucune donnée</div>}
  </TableContainer>
);
