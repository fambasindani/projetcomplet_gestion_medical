'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Facture, StatutFactureLabels } from '@/app/types/facture';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#4338ca',
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4338ca',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#555',
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  table: {
    marginTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    paddingVertical: 7,
  },
  colDescription: { width: '40%' },
  colQte: { width: '12%', textAlign: 'right' },
  colPu: { width: '18%', textAlign: 'right' },
  colRemise: { width: '12%', textAlign: 'right' },
  colMontant: { width: '18%', textAlign: 'right' },
  totals: {
    marginTop: 16,
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalTtc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderTopWidth: 1.5,
    borderTopColor: '#4338ca',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 4,
  },
  mention: {
    marginTop: 28,
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
  signature: {
    marginTop: 40,
    textAlign: 'right',
  },
});

interface Props {
  facture: Facture;
  etablissement?: {
    nom: string;
    adresse?: string;
    telephone?: string;
  };
}

export default function FacturePDF({ facture, etablissement }: Props) {
  const nomEtablissement = etablissement?.nom || 'Centre Hospitalier';
  const adresseEtablissement =
    etablissement?.adresse || 'Adresse de l\'établissement';
  const telephoneEtablissement = etablissement?.telephone || '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{nomEtablissement}</Text>
            <Text style={styles.subtitle}>{adresseEtablissement}</Text>
            {telephoneEtablissement && (
              <Text style={styles.subtitle}>Tél : {telephoneEtablissement}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>FACTURE</Text>
            <Text style={styles.subtitle}>N° {facture.numeroFacture}</Text>
            <Text style={styles.subtitle}>
              Émise le{' '}
              {facture.dateEmission
                ? format(new Date(facture.dateEmission), 'dd/MM/yyyy', { locale: fr })
                : '-'}
            </Text>
            {facture.dateEcheance && (
              <Text style={styles.subtitle}>
                Échéance le{' '}
                {format(new Date(facture.dateEcheance), 'dd/MM/yyyy', { locale: fr })}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Facturé à</Text>
            <Text style={styles.infoValue}>
              {facture.patientNom} {facture.patientPrenom}
            </Text>
            <Text style={styles.infoValue}>Patient n° {facture.idPatient}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Statut</Text>
            <Text style={styles.infoValue}>
              {StatutFactureLabels[facture.statut]}
            </Text>
            {facture.mutuelleId && (
              <Text style={styles.infoValue}>Mutuelle : {facture.mutuelleId}</Text>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Détail des prestations</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colDescription}>Désignation</Text>
            <Text style={styles.colQte}>Qté</Text>
            <Text style={styles.colPu}>P.U. ($)</Text>
            <Text style={styles.colRemise}>Remise</Text>
            <Text style={styles.colMontant}>Montant</Text>
          </View>
          {facture.details?.map((detail) => (
            <View key={detail.idDetail} style={styles.tableRow}>
              <Text style={styles.colDescription}>
                {detail.description || detail.acteLibelle || detail.medicamentNom || '-'}
              </Text>
              <Text style={styles.colQte}>{detail.quantite}</Text>
              <Text style={styles.colPu}>{detail.prixUnitaire.toFixed(2)}</Text>
              <Text style={styles.colRemise}>
                {detail.remise > 0 ? `${detail.remise.toFixed(2)} $` : '-'}
              </Text>
              <Text style={styles.colMontant}>{detail.montantHt.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Total HT</Text>
            <Text>{facture.montantHt.toFixed(2)} $</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA ({facture.tva.toFixed(2)} %)</Text>
            <Text>{(facture.montantTtc - facture.montantHt).toFixed(2)} $</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Total TTC</Text>
            <Text>{facture.montantTtc.toFixed(2)} $</Text>
          </View>
          {facture.montantPaye > 0 && (
            <View style={styles.totalRow}>
              <Text>Déjà payé</Text>
              <Text>{facture.montantPaye.toFixed(2)} $</Text>
            </View>
          )}
          <View style={styles.totalTtc}>
            <Text>Reste à payer</Text>
            <Text>{facture.montantRestant.toFixed(2)} $</Text>
          </View>
        </View>

        {facture.notesComptables && (
          <Text style={styles.mention}>Notes : {facture.notesComptables}</Text>
        )}
        <Text style={styles.mention}>
          Merci de régler cette facture avant la date d&apos;échéance indiquée.
        </Text>

        <View style={styles.signature}>
          <Text>Cachet et signature</Text>
        </View>
      </Page>
    </Document>
  );
}
