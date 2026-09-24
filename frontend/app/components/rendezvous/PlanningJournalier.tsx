'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaCalendarDay } from 'react-icons/fa';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { rendezvousService } from '@/app/services/rendezvousService';
import { RendezVous } from '@/app/types/rendezvous';
import SkeletonCards from '@/app/ui/SkeletonCards';
import EmptyState from '@/app/ui/EmptyState';
import { toast } from 'react-hot-toast';

export default function PlanningJournalier() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // Ici, idéalement un endpoint /api/rendezvous/planning?date=... mais on peut charger tous les RDV du jour
        // Pour simplifier, on charge tous les RDV du jour via getAll puis filtre côté front.
        const data = await rendezvousService.getAll(1, 100);
        const filtered = data.items.filter(rdv => isSameDay(new Date(rdv.dateRdv), selectedDate));
        setRdvs(filtered);
      } catch {
        toast.error("Erreur chargement planning");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedDate]);

  const groupedByMedecin = rdvs.reduce((acc, rdv) => {
    const key = `${rdv.idMedecin}-${rdv.medecinNom}`;
    if (!acc[key]) acc[key] = { medecin: rdv, rdvs: [] };
    acc[key].rdvs.push(rdv);
    return acc;
  }, {} as Record<string, { medecin: RendezVous, rdvs: RendezVous[] }>);

  if (loading) return <SkeletonCards cards={4} />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex justify-between items-center">
        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 rounded-full hover:bg-gray-100"><FaArrowLeft /></button>
        <div className="flex items-center gap-2">
          <FaCalendarDay className="text-indigo-600" />
          <span className="text-xl font-semibold">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 rounded-full hover:bg-gray-100"><FaArrowRight /></button>
      </div>

      <div className="space-y-6">
        {Object.values(groupedByMedecin).map((group, idx) => (
          <div key={idx} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="bg-indigo-50 px-4 py-2 border-b">
              <h3 className="font-semibold">Dr {group.medecin.medecinNom} {group.medecin.medecinPrenom}</h3>
            </div>
            <div className="divide-y">
              {group.rdvs.sort((a,b) => new Date(a.dateRdv).getTime() - new Date(b.dateRdv).getTime()).map(rdv => (
                <div key={rdv.idRdv} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{format(new Date(rdv.dateRdv), 'HH:mm')}</div>
                    <div className="text-sm text-gray-600">{rdv.patientNom} {rdv.patientPrenom}</div>
                    <div className="text-xs text-gray-500">{rdv.motif}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${rdv.statut === 'Confirmé' ? 'bg-green-100' : 'bg-blue-100'}`}>{rdv.statut}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {rdvs.length === 0 && <EmptyState icon={<FaCalendarDay />} title="Aucun rendez-vous ce jour." />}
      </div>
    </div>
  );
}
