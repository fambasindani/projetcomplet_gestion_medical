'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaBan,
  FaUserInjured,
  FaCalendarAlt,
  FaDollarSign,
  FaFileInvoice,
  FaListAlt,
  FaReceipt,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useConfirm } from 'react-use-confirming-dialog';

import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import Card from '@/app/components/common/Card';
import { factureService } from '@/app/services/factureService';
import type { Facture, StatutFacture } from '@/app/types/facture';
import { StatutFactureLabels, ModePaiementLabels } from '@/app/types/facture';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const statutColors: Record<StatutFacture, string> = {
  En_attente: 'bg-yellow-100 text-yellow-800',
  Partiellement_payé: 'bg-blue-100 text-blue-800',
  Payé: 'bg-green-100 text-green-800',
  Annulé: 'bg-gray-100 text-gray-700',
  Impayé: 'bg-red-100 text-red-800',
};

export default function FactureDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();

  const [facture, setFacture] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);
  const [annulationLoading, setAnnulationLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await factureService.getById(Number(id));
      setFacture(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  const handleAnnuler = async () => {
    if (!facture) return;
    const ok = await confirm({
      title: 'Annuler la facture',
      message: `Annuler la facture ${facture.numeroFacture} ?`,
    });
    if (!ok) return;
    setAnnulationLoading(true);
    try {
      await factureService.annuler(facture.idFacture);
      toast.success('Facture annulée');
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setAnnulationLoading(false);
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!facture) return <div className="p-10 text-center text-gray-500">Facture introuvable.</div>;

  const totalPaiements = facture.paiements.reduce((sum, p) => sum + p.montant, 0);
  const annulable = facture.statut !== 'Payé' && facture.statut !== 'Annulé';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails de la facture"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/factures')}>
              Retour
            </Button>
            {annulable && (
              <Button
                variant="danger"
                icon={<FaBan />}
                disabled={annulationLoading}
                onClick={handleAnnuler}
              >
                {annulationLoading ? 'Annulation...' : 'Annuler la facture'}
              </Button>
            )}
            {facture.montantRestant > 0 && facture.statut !== 'Annulé' && (
              <Button
                icon={<FaMoneyBillWave />}
                onClick={() => router.push(`/factures/${facture.idFacture}/paiement/nouveau`)}
              >
                Encaisser un paiement
              </Button>
            )}
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Facture {facture.numeroFacture}</h1>
              <p className="flex items-center gap-2 opacity-90">
                <FaCalendarAlt /> Émise le {format(new Date(facture.dateEmission), 'dd/MM/yyyy', { locale: fr })}
              </p>
              {facture.dateEcheance && (
                <p className="flex items-center gap-2 opacity-90">
                  <FaCalendarAlt /> Échéance le {format(new Date(facture.dateEcheance), 'dd/MM/yyyy', { locale: fr })}
                </p>
              )}
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statutColors[facture.statut]}`}>
              {StatutFactureLabels[facture.statut]}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoBlock icon={FaUserInjured} label="Patient" value={`${facture.patientNom} ${facture.patientPrenom}`} />
            <InfoBlock
              icon={FaDollarSign}
              label="Mode de paiement"
              value={facture.modePaiement ? ModePaiementLabels[facture.modePaiement] : 'Non renseigné'}
            />
            <InfoBlock
              icon={FaFileInvoice}
              label="Assurance"
              value={facture.assurancePriseEnCharge ? 'Prise en charge active' : 'Sans prise en charge'}
            />
            <InfoBlock
              icon={FaFileInvoice}
              label="Mutuelle"
              value={
                facture.mutuellePriseEnCharge && facture.mutuellePriseEnCharge > 0
                  ? `Prise en charge : ${facture.mutuellePriseEnCharge.toFixed(2)} €${facture.mutuelleId ? ` (n°${facture.mutuelleId})` : ''}`
                  : 'Non prise en charge'
              }
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MontantCard label="Montant HT" value={facture.montantHt} />
            <MontantCard label="TVA" value={facture.tva} />
            <MontantCard label="Montant TTC" value={facture.montantTtc} highlight />
            <MontantCard label="Payé" value={facture.montantPaye} color="text-green-600" />
            <MontantCard label="Restant" value={facture.montantRestant} color="text-red-600" />
          </div>

          {facture.notesComptables && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-gray-700">
                <strong className="block text-xs uppercase mb-1">Notes comptables</strong>
                {facture.notesComptables}
              </p>
            </div>
          )}

          <Card>
            <Card.Header>
              <span className="flex items-center gap-2">
                <FaListAlt className="text-indigo-600" /> Détails de la facture
              </span>
            </Card.Header>
            <Card.Body>
              <div className="overflow-x-auto">
                <Table>
                  <THead>
                    <tr>
                      <Th>Description</Th>
                      <Th align="center">Qté</Th>
                      <Th align="right">Prix unitaire</Th>
                      <Th align="right">Remise</Th>
                      <Th align="right">Montant HT</Th>
                      <Th align="right">Montant TTC</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {facture.details.map((detail) => (
                      <Tr key={detail.idDetail}>
                        <Td>
                          <span className="font-medium text-gray-800">
                            {detail.acteLibelle ?? detail.medicamentNom ?? detail.description ?? '-'}
                          </span>
                          {detail.description && detail.acteLibelle && detail.description !== detail.acteLibelle && (
                            <span className="block text-xs text-gray-500">{detail.description}</span>
                          )}
                        </Td>
                        <Td className="text-center">{detail.quantite}</Td>
                        <Td className="text-right">{detail.prixUnitaire.toFixed(2)}</Td>
                        <Td className="text-right">{detail.remise.toFixed(2)}%</Td>
                        <Td className="text-right">{detail.montantHt.toFixed(2)}</Td>
                        <Td className="text-right font-semibold text-indigo-600">
                          {detail.montantTtc.toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <span className="flex items-center gap-2">
                <FaReceipt className="text-indigo-600" /> Paiements reçus
              </span>
            </Card.Header>
            <Card.Body>
              {facture.paiements.length === 0 ? (
                <p className="text-center text-gray-500 py-6">Aucun paiement enregistré</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <THead>
                      <tr>
                        <Th>Date</Th>
                        <Th align="right">Montant</Th>
                        <Th>Mode</Th>
                        <Th>Référence</Th>
                        <Th>Encaissé par</Th>
                      </tr>
                    </THead>
                    <TBody>
                      {facture.paiements.map((paiement) => (
                        <Tr key={paiement.idPaiement}>
                          <Td>
                            {format(new Date(paiement.datePaiement), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </Td>
                          <Td className="text-right font-semibold text-green-600">
                            {paiement.montant.toFixed(2)}
                          </Td>
                          <Td>{ModePaiementLabels[paiement.modePaiement]}</Td>
                          <Td>{paiement.referencePaiement || '-'}</Td>
                          <Td>{paiement.encaisseurNom || '-'}</Td>
                        </Tr>
                      ))}
                    </TBody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-5 py-3 font-semibold">Total encaissé</td>
                        <td className="px-5 py-3 text-right font-bold text-green-600">
                          {totalPaiements.toFixed(2)}
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

      </div>
    </div>
  );
}

interface InfoBlockProps {
  icon: IconType;
  label: string;
  value: string;
}

function InfoBlock({ icon: Icon, label, value }: InfoBlockProps) {
  return (
    <div className="flex gap-4">
      <div className="text-indigo-500 pt-1">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

interface MontantCardProps {
  label: string;
  value: number;
  color?: string;
  highlight?: boolean;
}

function MontantCard({ label, value, color = 'text-gray-800', highlight = false }: MontantCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border ${highlight ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100'}`}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-indigo-600' : color}`}>{value.toFixed(2)}</p>
    </div>
  );
}
