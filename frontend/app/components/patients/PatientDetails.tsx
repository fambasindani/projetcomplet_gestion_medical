'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUser, FaIdCard, FaPhone, FaBriefcase, FaHeart, FaCalendarAlt, FaEdit, FaFileAlt, FaUserMd, FaHospital, FaEnvelope, FaMapMarkerAlt, FaVenusMars, FaTint } from 'react-icons/fa';
import type { PatientDetails } from '@/app/types/patient';
import { patientService } from '@/app/services/patientService';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
import Button from '@/app/ui/Button';
import { useAuth } from '@/app/contexts/AuthContext';


const PatientDetails: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const [details, setDetails] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await patientService.getDetails(Number(params.id));
        setDetails(data);
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors du chargement des détails');
        router.push('/patients');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [params.id, router]);

  if (loading) return <SkeletonDetails />;
  if (!details) return null;

  const { informationsPersonnelles, rendezVous, consultations, hospitalisations } = details;
  const getGenreLabel = (genre: string) => genre === 'M' ? 'Masculin' : 'Féminin';

  return (
    <PageShell
      title="Fiche patient"
      onBack={() => router.push('/patients')}
      actions={
        hasPermission('PATIENTS_MODIFIER') ? (
          <Button icon={<FaEdit />} onClick={() => router.push(`/patients/${params.id}/modifier`)}>
            Modifier
          </Button>
        ) : undefined
      }
      maxWidth="max-w-6xl"
    >
      <DetailBanner
        meta="Patient"
        title={`${informationsPersonnelles.prenom} ${informationsPersonnelles.nom}`}
        subtitle={`N° ${informationsPersonnelles.numeroSecuriteSociale}`}
        badges={
          <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white">
            {getGenreLabel(informationsPersonnelles.genre)}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FormSection title="Informations personnelles" icon={<FaUser />}>
            <InfoGrid className="p-0!">
              <InfoCard icon={FaIdCard} label="N° Sécurité sociale" value={informationsPersonnelles.numeroSecuriteSociale} />
              <InfoCard icon={FaUser} label="Nom" value={informationsPersonnelles.nom} />
              <InfoCard icon={FaUser} label="Prénom" value={informationsPersonnelles.prenom} />
              <InfoCard icon={FaCalendarAlt} label="Date naissance" value={new Date(informationsPersonnelles.dateNaissance).toLocaleDateString('fr-FR')} />
              <InfoCard icon={FaMapMarkerAlt} label="Lieu naissance" value={informationsPersonnelles.lieuNaissance || '-'} />
              <InfoCard icon={FaVenusMars} label="Genre" value={getGenreLabel(informationsPersonnelles.genre)} />
              <InfoCard icon={FaPhone} label="Téléphone" value={informationsPersonnelles.telephone || '-'} />
              <InfoCard icon={FaPhone} label="Téléphone urgent" value={informationsPersonnelles.telephoneUrgent || '-'} />
              <InfoCard icon={FaEnvelope} label="Email" value={informationsPersonnelles.email || '-'} />
              <InfoCard icon={FaMapMarkerAlt} label="Adresse" value={informationsPersonnelles.adresse || '-'} />
            </InfoGrid>
          </FormSection>

          <FormSection title="Informations médicales" icon={<FaHeart />}>
            <InfoGrid className="p-0!">
              <InfoCard icon={FaTint} label="Groupe sanguin" value={informationsPersonnelles.groupeSanguin || '-'} />
              <InfoCard icon={FaHeart} label="Allergies" value={informationsPersonnelles.allergies || '-'} />
              <InfoCard icon={FaHeart} label="Antécédents médicaux" value={informationsPersonnelles.antecedentsMedicaux || '-'} />
              <InfoCard icon={FaHeart} label="Antécédents chirurgicaux" value={informationsPersonnelles.antecedentsChirurgicaux || '-'} />
              <InfoCard icon={FaHeart} label="Traitement habituel" value={informationsPersonnelles.traitementHabituel || '-'} />
            </InfoGrid>
          </FormSection>

          <FormSection title="Socio-professionnel" icon={<FaBriefcase />}>
            <InfoGrid className="p-0!">
              <InfoCard icon={FaBriefcase} label="Profession" value={informationsPersonnelles.profession || '-'} />
              <InfoCard icon={FaUser} label="Situation familiale" value={informationsPersonnelles.situationFamiliale || '-'} />
              <InfoCard icon={FaFileAlt} label="Mutuelle" value={informationsPersonnelles.mutuelle || '-'} />
              <InfoCard icon={FaFileAlt} label="N° Mutuelle" value={informationsPersonnelles.numeroMutuelle || '-'} />
            </InfoGrid>
          </FormSection>

          <FormSection title="Personne de contact" icon={<FaUserMd />}>
            <InfoGrid className="p-0!">
              <InfoCard icon={FaUserMd} label="Nom" value={informationsPersonnelles.personneContactNom || '-'} />
              <InfoCard icon={FaUserMd} label="Lien" value={informationsPersonnelles.personneContactLien || '-'} />
              <InfoCard icon={FaPhone} label="Téléphone" value={informationsPersonnelles.personneContactTelephone || '-'} />
            </InfoGrid>
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Rendez-vous récents" icon={<FaCalendarAlt />}>
            {rendezVous.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun rendez-vous</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {rendezVous.map(rdv => (
                    <tr key={rdv.idRdv} className="border-b border-slate-100">
                      <td className="py-2">{new Date(rdv.dateRdv).toLocaleString('fr-FR')}</td>
                      <td className="py-2 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rdv.statut === 'Confirmé' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {rdv.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </FormSection>

          <FormSection title="Consultations récentes" icon={<FaFileAlt />}>
            {consultations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune consultation</p>
            ) : (
              <ul className="space-y-2">
                {consultations.map(cons => (
                  <li key={cons.idConsultation} className="border-b border-slate-100 pb-2">
                    <strong>{new Date(cons.dateConsultation).toLocaleDateString('fr-FR')}</strong>
                    <p className="text-sm text-gray-600 mt-1">{cons.motifConsultation}</p>
                  </li>
                ))}
              </ul>
            )}
          </FormSection>

          <FormSection title="Hospitalisations" icon={<FaHospital />}>
            {hospitalisations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune hospitalisation</p>
            ) : (
              <ul className="space-y-2">
                {hospitalisations.map(hosp => (
                  <li key={hosp.idHospitalisation} className="border-b border-slate-100 pb-2">
                    <strong>{new Date(hosp.dateAdmission).toLocaleDateString('fr-FR')}</strong>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{hosp.statut}</span>
                    <p className="text-sm text-gray-600 mt-1">{hosp.motif}</p>
                  </li>
                ))}
              </ul>
            )}
          </FormSection>
        </div>
      </div>
    </PageShell>
  );
};

export default PatientDetails;
