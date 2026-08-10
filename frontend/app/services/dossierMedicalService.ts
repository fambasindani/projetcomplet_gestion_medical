// app/services/dossierMedicalService.ts
import api from './api';
import { DossierMedical } from '@/app/types/dossierMedical';

export const dossierMedicalService = {
  /**
   * Récupère le dossier médical complet d'un patient
   * @param patientId - ID du patient
   */
  async getByPatientId(patientId: number): Promise<DossierMedical> {
    const response = await api.get(`/patients/${patientId}/dossier-medical`);
    return response.data;
  },
};