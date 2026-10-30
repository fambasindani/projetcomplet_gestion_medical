import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from 'react-use-confirming-dialog';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/Guards';
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ChangePasswordPage from './pages/change-password/ChangePasswordPage';

// Consultations
import ConsultationList from './pages/consultations/ConsultationList';
import NouvelleConsultation from './pages/consultations/NouvelleConsultation';
import ConsultationDetails from './pages/consultations/ConsultationDetails';
import ModifierConsultation from './pages/consultations/ModifierConsultation';

// Patients
import PatientList from './pages/patients/PatientList';
import NouveauPatient from './pages/patients/NouveauPatient';
import PatientDetails from './pages/patients/PatientDetails';
import ModifierPatient from './pages/patients/ModifierPatient';
import DossierMedical from './pages/patients/DossierMedical';
import PatientStatistiques from './pages/patients/PatientStatistiques';

// Médecins
import MedecinsList from './pages/medecins/MedecinsList';
import NouveauMedecin from './pages/medecins/NouveauMedecin';
import MedecinDetails from './pages/medecins/MedecinDetails';
import ModifierMedecin from './pages/medecins/ModifierMedecin';
import PlanningMedecin from './pages/medecins/PlanningMedecin';
import MedecinStatistiques from './pages/medecins/MedecinStatistiques';

// Rendez-vous
import RendezVousList from './pages/rendezvous/RendezVousList';
import NouveauRendezVous from './pages/rendezvous/NouveauRendezVous';
import PlanningJournalier from './pages/rendezvous/PlanningJournalier';
import ModifierRendezVous from './pages/rendezvous/ModifierRendezVous';
import RendezVousDetails from './pages/rendezvous/RendezVousDetails';

// Prescriptions
import PrescriptionsList from './pages/prescriptions/PrescriptionsList';
import NouvellePrescription from './pages/prescriptions/NouvellePrescription';
import PrescriptionDetails from './pages/prescriptions/PrescriptionDetails';
import ModifierPrescription from './pages/prescriptions/ModifierPrescription';
import PrescriptionMedicaments from './pages/prescriptions/PrescriptionMedicaments';
import PrescriptionSoins from './pages/prescriptions/PrescriptionSoins';
import NouveauSoinPrescription from './pages/prescriptions/NouveauSoinPrescription';
import PrescriptionExamens from './pages/prescriptions/PrescriptionExamens';
import ModifierSoinPrescription from './pages/prescriptions/ModifierSoinPrescription';

// Examens
import ExamenList from './pages/examens/ExamenList';
import NouveauExamen from './pages/examens/NouveauExamen';
import ExamenDetails from './pages/examens/ExamenDetails';
import ModifierExamen from './pages/examens/ModifierExamen';
import ResultatExamen from './pages/examens/ResultatExamen';
import ImpressionExamen from './pages/examens/ImpressionExamen';
import EtiquetteExamen from './pages/examens/EtiquetteExamen';
import ImpressionPrescription from './pages/examens/ImpressionPrescription';

// Pharmacie
import MedicamentsList from './pages/pharmacie/MedicamentsList';
import NouveauMedicament from './pages/pharmacie/NouveauMedicament';
import MedicamentDetails from './pages/pharmacie/MedicamentDetails';
import ModifierMedicament from './pages/pharmacie/ModifierMedicament';
import LotsList from './pages/pharmacie/LotsList';
import NouveauLot from './pages/pharmacie/NouveauLot';
import LotDetails from './pages/pharmacie/LotDetails';
import ModifierLot from './pages/pharmacie/ModifierLot';
import CommandesList from './pages/pharmacie/CommandesList';
import NouvelleCommande from './pages/pharmacie/NouvelleCommande';
import CommandeDetails from './pages/pharmacie/CommandeDetails';
import ModifierCommande from './pages/pharmacie/ModifierCommande';
import ReceptionCommande from './pages/pharmacie/ReceptionCommande';
import DelivranceList from './pages/pharmacie/DelivranceList';
import NouvelleDelivrance from './pages/pharmacie/NouvelleDelivrance';
import DelivranceDetails from './pages/pharmacie/DelivranceDetails';
import ModifierDelivrancePage from './pages/pharmacie/ModifierDelivrancePage';
import MargePharmacie from './pages/pharmacie/MargePharmacie';
import DelivranceStatistiques from './pages/pharmacie/DelivranceStatistiques';
import AlertesStock from './pages/pharmacie/AlertesStock';
import InventairesList from './pages/pharmacie/InventairesList';
import NouvelInventaire from './pages/pharmacie/NouvelInventaire';
import InventaireDetails from './pages/pharmacie/InventaireDetails';
import ImpressionInventaire from './pages/pharmacie/ImpressionInventaire';
import FournisseursList from './pages/pharmacie/FournisseursList';
import NouveauFournisseur from './pages/pharmacie/NouveauFournisseur';
import FournisseurDetails from './pages/pharmacie/FournisseurDetails';
import ModifierFournisseur from './pages/pharmacie/ModifierFournisseur';
import CategoriesList from './pages/pharmacie/CategoriesList';
import NouvelleCategorie from './pages/pharmacie/NouvelleCategorie';
import ModifierCategorie from './pages/pharmacie/ModifierCategorie';

// Hospitalisations
import HospitalisationList from './pages/hospitalisations/HospitalisationList';
import NouvelleHospitalisation from './pages/hospitalisations/NouvelleHospitalisation';
import HospitalisationDetails from './pages/hospitalisations/HospitalisationDetails';
import ModifierHospitalisation from './pages/hospitalisations/ModifierHospitalisation';
import ConstantesList from './pages/hospitalisations/ConstantesList';
import NouvelleConstante from './pages/hospitalisations/NouvelleConstante';
import ModifierConstante from './pages/hospitalisations/ModifierConstante';
import ChambresList from './pages/hospitalisations/ChambresList';
import NouvelleChambre from './pages/hospitalisations/NouvelleChambre';
import ChambreDetails from './pages/hospitalisations/ChambreDetails';
import ModifierChambre from './pages/hospitalisations/ModifierChambre';
import SoinsList from './pages/hospitalisations/SoinsList';
import NouveauSoin from './pages/hospitalisations/NouveauSoin';
import SoinDetails from './pages/hospitalisations/SoinDetails';
import ModifierSoin from './pages/hospitalisations/ModifierSoin';

// Urgences
import AdmissionsList from './pages/urgences/AdmissionsList';
import NouvelleAdmission from './pages/urgences/NouvelleAdmission';
import AdmissionDetails from './pages/urgences/AdmissionDetails';
import ModifierAdmission from './pages/urgences/ModifierAdmission';
import InterventionsList from './pages/urgences/InterventionsList';
import NouvelleIntervention from './pages/urgences/NouvelleIntervention';
import InterventionDetails from './pages/urgences/InterventionDetails';
import ModifierIntervention from './pages/urgences/ModifierIntervention';
import SalleAttente from './pages/urgences/SalleAttente';

// Facturation
import FacturesList from './pages/facturation/FacturesList';
import NouvelleFacture from './pages/facturation/NouvelleFacture';
import FactureDetails from './pages/facturation/FactureDetails';
import PaiementsList from './pages/facturation/PaiementsList';
import FactureStatistiques from './pages/facturation/FactureStatistiques';
import NouveauPaiement from './pages/facturation/NouveauPaiement';
import ActesMedicaux from './pages/facturation/ActesMedicaux';
import CatalogueActes from './pages/facturation/CatalogueActes';

// Settings
import Parametres from './pages/settings/Parametres';
import UtilisateursList from './pages/settings/UtilisateursList';
import NouvelUtilisateur from './pages/settings/NouvelUtilisateur';
import UtilisateurDetails from './pages/settings/UtilisateurDetails';
import ModifierUtilisateur from './pages/settings/ModifierUtilisateur';
import RolesPermissions from './pages/settings/RolesPermissions';
import ServicesList from './pages/settings/ServicesList';
import LaboratoiresList from './pages/settings/LaboratoiresList';
import CategoriesExamenList from './pages/settings/CategoriesExamenList';
import SettingsMonProfil from './pages/settings/MonProfil';
import JournalLogs from './pages/settings/JournalLogs';

// Personnel
import PersonnelList from './pages/personnel/PersonnelList';
import NouveauPersonnel from './pages/personnel/NouveauPersonnel';
import InfirmiersList from './pages/personnel/InfirmiersList';
import PersonnelDetails from './pages/personnel/PersonnelDetails';
import ModifierPersonnel from './pages/personnel/ModifierPersonnel';

// Signes vitaux
import SignesVitauxList from './pages/signesvitaux/SignesVitauxList';
import NouveauSigneVital from './pages/signesvitaux/NouveauSigneVital';
import ModifierSigneVital from './pages/signesvitaux/ModifierSigneVital';

// Autres
import NotificationsList from './pages/notifications/NotificationsList';
import MonEspace from './pages/monespace/MonEspace';
import MonDossier from './pages/monespace/MonDossier';
import MesExamens from './pages/monespace/MesExamens';
import MesFactures from './pages/monespace/MesFactures';
import MesOrdonnances from './pages/monespace/MesOrdonnances';
import MesRendezVous from './pages/monespace/MesRendezVous';
import ProfileMonProfil from './pages/profile/MonProfil';
import SpecialitesList from './pages/specialites/SpecialitesList';
import NouvelleSpecialite from './pages/specialites/NouvelleSpecialite';
import SpecialiteDetails from './pages/specialites/SpecialiteDetails';
import ModifierSpecialite from './pages/specialites/ModifierSpecialite';

export default function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <ConfirmProvider>
                    <AppLayout />
                  </ConfirmProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Consultations */}
              <Route path="/consultations" element={<ConsultationList />} />
              <Route path="/consultations/nouveau" element={<NouvelleConsultation />} />
              <Route path="/consultations/:id/details" element={<ConsultationDetails />} />
              <Route path="/consultations/:id/modifier" element={<ModifierConsultation />} />

              {/* Patients */}
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/nouveau" element={<NouveauPatient />} />
              <Route path="/patients/statistiques" element={<PatientStatistiques />} />
              <Route path="/patients/:id/details" element={<PatientDetails />} />
              <Route path="/patients/:id/modifier" element={<ModifierPatient />} />
              <Route path="/patients/:id/dossier-medical" element={<DossierMedical />} />

              {/* Médecins */}
              <Route path="/medecins" element={<MedecinsList />} />
              <Route path="/medecins/nouveau" element={<NouveauMedecin />} />
              <Route path="/medecins/planning" element={<PlanningMedecin />} />
              <Route path="/medecins/statistiques" element={<MedecinStatistiques />} />
              <Route path="/medecins/:id/details" element={<MedecinDetails />} />
              <Route path="/medecins/:id/modifier" element={<ModifierMedecin />} />

              {/* Rendez-vous */}
              <Route path="/rendezvous" element={<RendezVousList />} />
              <Route path="/rendezvous/nouveau" element={<NouveauRendezVous />} />
              <Route path="/rendezvous/planning" element={<PlanningJournalier />} />
              <Route path="/rendezvous/:id" element={<RendezVousDetails />} />
              <Route path="/rendezvous/:id/modifier" element={<ModifierRendezVous />} />

              {/* Prescriptions */}
              <Route path="/prescriptions" element={<PrescriptionsList />} />
              <Route path="/prescriptions/nouveau" element={<NouvellePrescription />} />
              <Route path="/prescriptions/medicaments" element={<PrescriptionMedicaments />} />
              <Route path="/prescriptions/:id" element={<PrescriptionDetails />} />
              <Route path="/prescriptions/:id/modifier" element={<ModifierPrescription />} />
              <Route path="/prescriptions/:id/soins" element={<PrescriptionSoins />} />
              <Route path="/prescriptions/:id/soins/nouveau" element={<NouveauSoinPrescription />} />
              <Route path="/prescriptions/examens/:id" element={<PrescriptionExamens />} />
              <Route path="/prescriptions/soins/:id/modifier" element={<ModifierSoinPrescription />} />

              {/* Examens */}
              <Route path="/examens/liste" element={<ExamenList />} />
              <Route path="/examens/nouveau" element={<NouveauExamen />} />
              <Route path="/examens/details/:id" element={<ExamenDetails />} />
              <Route path="/examens/modifier/:id" element={<ModifierExamen />} />
              <Route path="/examens/resultat/:id" element={<ResultatExamen />} />
              <Route path="/examens/:id/impression" element={<ImpressionExamen />} />
              <Route path="/examens/:id/etiquette" element={<EtiquetteExamen />} />
              <Route path="/examens/prescriptions/:id/impression" element={<ImpressionPrescription />} />

              {/* Pharmacie */}
              <Route path="/pharmacie/medicaments" element={<MedicamentsList />} />
              <Route path="/pharmacie/medicaments/nouveau" element={<NouveauMedicament />} />
              <Route path="/pharmacie/medicaments/:id" element={<MedicamentDetails />} />
              <Route path="/pharmacie/medicaments/:id/modifier" element={<ModifierMedicament />} />
              <Route path="/pharmacie/lots" element={<LotsList />} />
              <Route path="/pharmacie/lots/nouveau" element={<NouveauLot />} />
              <Route path="/pharmacie/lots/:id" element={<LotDetails />} />
              <Route path="/pharmacie/lots/:id/modifier" element={<ModifierLot />} />
              <Route path="/pharmacie/commandes" element={<CommandesList />} />
              <Route path="/pharmacie/commandes/nouvelle" element={<NouvelleCommande />} />
              <Route path="/pharmacie/commandes/:id" element={<CommandeDetails />} />
              <Route path="/pharmacie/commandes/:id/modifier" element={<ModifierCommande />} />
              <Route path="/pharmacie/commandes/:id/reception" element={<ReceptionCommande />} />
              <Route path="/pharmacie/delivrances" element={<DelivranceList />} />
              <Route path="/pharmacie/delivrances/nouveau" element={<NouvelleDelivrance />} />
              <Route path="/pharmacie/delivrances/marges" element={<MargePharmacie />} />
              <Route path="/pharmacie/delivrances/statistiques" element={<DelivranceStatistiques />} />
              <Route path="/pharmacie/delivrances/:id" element={<DelivranceDetails />} />
              <Route path="/pharmacie/delivrances/:id/modifier" element={<ModifierDelivrancePage />} />
              <Route path="/pharmacie/inventaire" element={<InventairesList />} />
              <Route path="/pharmacie/inventaire/nouveau" element={<NouvelInventaire />} />
              <Route path="/pharmacie/inventaire/:id" element={<InventaireDetails />} />
              <Route path="/pharmacie/inventaire/:id/impression" element={<ImpressionInventaire />} />
              <Route path="/pharmacie/fournisseurs" element={<FournisseursList />} />
              <Route path="/pharmacie/fournisseurs/nouveau" element={<NouveauFournisseur />} />
              <Route path="/pharmacie/fournisseurs/:id" element={<FournisseurDetails />} />
              <Route path="/pharmacie/fournisseurs/:id/modifier" element={<ModifierFournisseur />} />
              <Route path="/pharmacie/categories" element={<CategoriesList />} />
              <Route path="/pharmacie/categories/nouveau" element={<NouvelleCategorie />} />
              <Route path="/pharmacie/categories/:id/modifier" element={<ModifierCategorie />} />
              <Route path="/pharmacie/alertes" element={<AlertesStock />} />

              {/* Hospitalisations */}
              <Route path="/hospitalisations" element={<Navigate to="/patients/hospitalisations" replace />} />
              <Route path="/patients/hospitalisations" element={<HospitalisationList />} />
              <Route path="/patients/hospitalisations/nouveau" element={<NouvelleHospitalisation />} />
              <Route path="/patients/hospitalisations/:id" element={<HospitalisationDetails />} />
              <Route path="/patients/hospitalisations/:id/modifier" element={<ModifierHospitalisation />} />
              <Route path="/patients/hospitalisations/:id/constantes" element={<ConstantesList />} />
              <Route path="/patients/hospitalisations/:id/constantes/nouvelle" element={<NouvelleConstante />} />
              <Route path="/patients/hospitalisations/constantes/:id/modifier" element={<ModifierConstante />} />
              <Route path="/hospitalisations/chambres" element={<ChambresList />} />
              <Route path="/hospitalisations/chambres/nouveau" element={<NouvelleChambre />} />
              <Route path="/hospitalisations/chambres/:id/details" element={<ChambreDetails />} />
              <Route path="/hospitalisations/chambres/:id/modifier" element={<ModifierChambre />} />
              <Route path="/hospitalisations/soins" element={<SoinsList />} />
              <Route path="/hospitalisations/soins/nouveau" element={<NouveauSoin />} />
              <Route path="/hospitalisations/soins/:id" element={<SoinDetails />} />
              <Route path="/hospitalisations/soins/:id/modifier" element={<ModifierSoin />} />

              {/* Urgences */}
              <Route path="/urgences/admissions" element={<AdmissionsList />} />
              <Route path="/urgences/admissions/nouveau" element={<NouvelleAdmission />} />
              <Route path="/urgences/admissions/:id" element={<AdmissionDetails />} />
              <Route path="/urgences/admissions/:id/modifier" element={<ModifierAdmission />} />
              <Route path="/urgences/interventions" element={<InterventionsList />} />
              <Route path="/urgences/interventions/nouveau" element={<NouvelleIntervention />} />
              <Route path="/urgences/interventions/:id" element={<InterventionDetails />} />
              <Route path="/urgences/interventions/:id/modifier" element={<ModifierIntervention />} />
              <Route path="/urgences/salle-attente" element={<SalleAttente />} />

              {/* Facturation */}
              <Route path="/factures" element={<FacturesList />} />
              <Route path="/factures/nouveau" element={<NouvelleFacture />} />
              <Route path="/factures/:id" element={<FactureDetails />} />
              <Route path="/factures/:id/paiement/nouveau" element={<NouveauPaiement />} />
              <Route path="/factures/paiements" element={<PaiementsList />} />
              <Route path="/factures/statistiques" element={<FactureStatistiques />} />
              <Route path="/factures/actes" element={<ActesMedicaux />} />
              <Route path="/factures/catalogue" element={<CatalogueActes />} />

              {/* Settings */}
              <Route path="/settings" element={<Parametres />} />
              <Route path="/settings/utilisateurs" element={<UtilisateursList />} />
              <Route path="/settings/utilisateurs/nouveau" element={<NouvelUtilisateur />} />
              <Route path="/settings/utilisateurs/:id/details" element={<UtilisateurDetails />} />
              <Route path="/settings/utilisateurs/:id/modifier" element={<ModifierUtilisateur />} />
              <Route path="/settings/roles" element={<RolesPermissions />} />
              <Route path="/settings/services" element={<ServicesList />} />
              <Route path="/settings/laboratoires" element={<LaboratoiresList />} />
              <Route path="/settings/categories-examen" element={<CategoriesExamenList />} />
              <Route path="/settings/profil" element={<SettingsMonProfil />} />
              <Route path="/settings/logs" element={<JournalLogs />} />

              {/* Personnel */}
              <Route path="/personnel" element={<PersonnelList />} />
              <Route path="/personnel/nouveau" element={<NouveauPersonnel />} />
              <Route path="/personnel/infirmiers" element={<InfirmiersList />} />
              <Route path="/personnel/:id" element={<PersonnelDetails />} />
              <Route path="/personnel/:id/modifier" element={<ModifierPersonnel />} />

              {/* Signes vitaux */}
              <Route path="/signes-vitaux" element={<SignesVitauxList />} />
              <Route path="/signes-vitaux/nouveau" element={<NouveauSigneVital />} />
              <Route path="/signes-vitaux/:id/modifier" element={<ModifierSigneVital />} />

              {/* Mon espace */}
              <Route path="/mon-espace" element={<MonEspace />} />
              <Route path="/mon-espace/dossier" element={<MonDossier />} />
              <Route path="/mon-espace/examens" element={<MesExamens />} />
              <Route path="/mon-espace/factures" element={<MesFactures />} />
              <Route path="/mon-espace/ordonnances" element={<MesOrdonnances />} />
              <Route path="/mon-espace/rendez-vous" element={<MesRendezVous />} />

              {/* Autres */}
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/notifications" element={<NotificationsList />} />
              <Route path="/profile" element={<ProfileMonProfil />} />
              <Route path="/specialites" element={<SpecialitesList />} />
              <Route path="/specialites/nouveau" element={<NouvelleSpecialite />} />
              <Route path="/specialites/:id/details" element={<SpecialiteDetails />} />
              <Route path="/specialites/:id/modifier" element={<ModifierSpecialite />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          gutter={8}
          containerStyle={{ top: 80, right: 20 }}
          toastOptions={{
            duration: 3000,
            style: { background: '#363636', color: '#fff', borderRadius: '10px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </AppSettingsProvider>
  );
}
