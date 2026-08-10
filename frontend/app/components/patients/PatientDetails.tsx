'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUser,  FaBriefcase, FaHeart, FaCalendarAlt, FaArrowLeft, FaEdit, FaFileAlt, FaUserMd, FaHospital } from 'react-icons/fa';
import type { PatientDetails } from '@/app/types/patient';
import { patientService } from '@/app/services/patientService';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';


const PatientDetails: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
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
    <div className="space-y-6">
      <PageHeader
        title="Fiche patient"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/patients')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/patients/${params.id}/modifier`)}>
              Modifier
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaUser /> Informations personnelles</h5>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>N° Sécurité sociale :</strong> {informationsPersonnelles.numeroSecuriteSociale}</p>
              <p><strong>Nom :</strong> {informationsPersonnelles.nom}</p>
              <p><strong>Prénom :</strong> {informationsPersonnelles.prenom}</p>
              <p><strong>Date naissance :</strong> {new Date(informationsPersonnelles.dateNaissance).toLocaleDateString('fr-FR')}</p>
              <p><strong>Lieu naissance :</strong> {informationsPersonnelles.lieuNaissance || '-'}</p>
              <p><strong>Genre :</strong> {getGenreLabel(informationsPersonnelles.genre)}</p>
              <p><strong>Téléphone :</strong> {informationsPersonnelles.telephone || '-'}</p>
              <p><strong>Téléphone urgent :</strong> {informationsPersonnelles.telephoneUrgent || '-'}</p>
              <p><strong>Email :</strong> {informationsPersonnelles.email || '-'}</p>
              <p><strong>Adresse :</strong> {informationsPersonnelles.adresse || '-'}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaHeart /> Informations médicales</h5>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Groupe sanguin :</strong> {informationsPersonnelles.groupeSanguin || '-'}</p>
              <p><strong>Allergies :</strong> {informationsPersonnelles.allergies || '-'}</p>
              <p><strong>Antécédents médicaux :</strong> {informationsPersonnelles.antecedentsMedicaux || '-'}</p>
              <p><strong>Antécédents chirurgicaux :</strong> {informationsPersonnelles.antecedentsChirurgicaux || '-'}</p>
              <p><strong>Traitement habituel :</strong> {informationsPersonnelles.traitementHabituel || '-'}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaBriefcase /> Socio-professionnel</h5>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Profession :</strong> {informationsPersonnelles.profession || '-'}</p>
              <p><strong>Situation familiale :</strong> {informationsPersonnelles.situationFamiliale || '-'}</p>
              <p><strong>Mutuelle :</strong> {informationsPersonnelles.mutuelle || '-'}</p>
              <p><strong>N° Mutuelle :</strong> {informationsPersonnelles.numeroMutuelle || '-'}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaUserMd /> Personne de contact</h5>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <p><strong>Nom :</strong> {informationsPersonnelles.personneContactNom || '-'}</p>
              <p><strong>Lien :</strong> {informationsPersonnelles.personneContactLien || '-'}</p>
              <p><strong>Téléphone :</strong> {informationsPersonnelles.personneContactTelephone || '-'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaCalendarAlt /> Rendez-vous récents</h5>
            </div>
            <div className="p-4">
              {rendezVous.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun rendez-vous</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {rendezVous.map(rdv => (
                      <tr key={rdv.idRdv} className="border-b border-gray-100">
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
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaFileAlt /> Consultations récentes</h5>
            </div>
            <div className="p-4">
              {consultations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune consultation</p>
              ) : (
                <ul className="space-y-2">
                  {consultations.map(cons => (
                    <li key={cons.idConsultation} className="border-b border-gray-100 pb-2">
                      <strong>{new Date(cons.dateConsultation).toLocaleDateString('fr-FR')}</strong>
                      <p className="text-sm text-gray-600 mt-1">{cons.motifConsultation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaHospital /> Hospitalisations</h5>
            </div>
            <div className="p-4">
              {hospitalisations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune hospitalisation</p>
              ) : (
                <ul className="space-y-2">
                  {hospitalisations.map(hosp => (
                    <li key={hosp.idHospitalisation} className="border-b border-gray-100 pb-2">
                      <strong>{new Date(hosp.dateAdmission).toLocaleDateString('fr-FR')}</strong>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{hosp.statut}</span>
                      <p className="text-sm text-gray-600 mt-1">{hosp.motif}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
