'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaChartLine, FaCoins, FaShoppingCart, FaPiggyBank, FaPercent, FaPills, FaUserTie } from 'react-icons/fa';
import { format } from 'date-fns';
import { delivranceService } from '@/app/services/delivranceService';
import type { RapportMargePharmacie } from '@/app/types/delivrance';
import SkeletonCards from '@/app/ui/SkeletonCards';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button from '@/app/ui/Button';

const dateDebutMois = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const dateAujourdhui = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function MargePharmacie() {
  const router = useRouter();
  const [rapport, setRapport] = useState<RapportMargePharmacie | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState(dateDebutMois());
  const [dateFin, setDateFin] = useState(dateAujourdhui());

  const charger = async () => {
    setLoading(true);
    try {
      const data = await delivranceService.getRapportMarge(dateDebut, dateFin);
      setRapport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    delivranceService.getRapportMarge(dateDebut, dateFin)
      .then(setRapport)
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      label: 'Chiffre d\'affaires',
      value: `${(rapport?.chiffreAffairesTotal ?? 0).toFixed(2)} $`,
      icon: FaCoins,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Coût d\'achat',
      value: `${(rapport?.coutAchatTotal ?? 0).toFixed(2)} $`,
      icon: FaShoppingCart,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Marge brute',
      value: `${(rapport?.margeTotale ?? 0).toFixed(2)} $`,
      icon: FaPiggyBank,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Taux de marge',
      value: `${(rapport?.tauxMargeTotal ?? 0).toFixed(1)} %`,
      icon: FaPercent,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Délivrances',
      value: `${rapport?.nbDelivrances ?? 0}`,
      icon: FaPills,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
  ];

  if (loading && !rapport) return <SkeletonCards cards={5} />;
  if (!rapport) return (
    <EmptyState
      icon={<FaChartLine />}
      title="Aucune donnée disponible"
      description="Le rapport de marge sera disponible dès que des délivrances seront enregistrées."
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapport marge pharmacie"
        subtitle="Prix de vente délivré vs coût d'achat du lot — ce que rapporte la vente des médicaments"
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.back()}>
            Retour
          </Button>
        }
      />

      {/* Filtres période */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
        </div>
        <Button onClick={charger} disabled={loading}>
          {loading ? 'Calcul...' : 'Actualiser'}
        </Button>
        <p className="text-xs text-gray-400 ml-auto">
          Période : {format(new Date(rapport.dateDebut), 'dd/MM/yyyy')} → {format(new Date(rapport.dateFin), 'dd/MM/yyyy')}
        </p>
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Marge par médicament */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
          <FaPills className="text-indigo-600" /> Marge par médicament
        </h2>
        {rapport.parMedicament.length === 0 ? (
          <p className="text-center text-gray-500 py-6">Aucune vente sur cette période</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b">
                  <th className="py-3 pr-4">Médicament</th>
                  <th className="py-3 pr-4 text-right">Qté vendue</th>
                  <th className="py-3 pr-4 text-right">Prix vente moy.</th>
                  <th className="py-3 pr-4 text-right">Coût achat moy.</th>
                  <th className="py-3 pr-4 text-right">Chiffre d&apos;affaires</th>
                  <th className="py-3 pr-4 text-right">Coût d&apos;achat</th>
                  <th className="py-3 pr-4 text-right">Marge</th>
                  <th className="py-3 text-right">Taux</th>
                </tr>
              </thead>
              <tbody>
                {rapport.parMedicament.map((med) => (
                  <tr key={med.idMedicament} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">{med.nomMedicament}</td>
                    <td className="py-3 pr-4 text-right">{med.quantiteDelivree}</td>
                    <td className="py-3 pr-4 text-right">{med.prixVenteMoyen.toFixed(2)} $</td>
                    <td className="py-3 pr-4 text-right">{med.prixAchatMoyen.toFixed(2)} $</td>
                    <td className="py-3 pr-4 text-right">{med.chiffreAffaires.toFixed(2)} $</td>
                    <td className="py-3 pr-4 text-right">{med.coutAchat.toFixed(2)} $</td>
                    <td className={`py-3 pr-4 text-right font-semibold ${med.marge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {med.marge.toFixed(2)} $
                    </td>
                    <td className={`py-3 text-right font-semibold ${med.tauxMarge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {med.tauxMarge.toFixed(1)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Marge par pharmacien */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
          <FaUserTie className="text-indigo-600" /> Marge par pharmacien
        </h2>
        {rapport.parPharmacien.length === 0 ? (
          <p className="text-center text-gray-500 py-6">Aucune vente sur cette période</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b">
                  <th className="py-3 pr-4">Pharmacien</th>
                  <th className="py-3 pr-4 text-right">Délivrances</th>
                  <th className="py-3 pr-4 text-right">Chiffre d&apos;affaires</th>
                  <th className="py-3 pr-4 text-right">Coût d&apos;achat</th>
                  <th className="py-3 pr-4 text-right">Marge</th>
                  <th className="py-3 text-right">Taux</th>
                </tr>
              </thead>
              <tbody>
                {rapport.parPharmacien.map((ph) => (
                  <tr key={ph.idPharmacien} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">{ph.nomPharmacien}</td>
                    <td className="py-3 pr-4 text-right">{ph.nbDelivrances}</td>
                    <td className="py-3 pr-4 text-right">{ph.chiffreAffaires.toFixed(2)} $</td>
                    <td className="py-3 pr-4 text-right">{ph.coutAchat.toFixed(2)} $</td>
                    <td className={`py-3 pr-4 text-right font-semibold ${ph.marge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {ph.marge.toFixed(2)} $
                    </td>
                    <td className={`py-3 text-right font-semibold ${ph.tauxMarge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {ph.tauxMarge.toFixed(1)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
