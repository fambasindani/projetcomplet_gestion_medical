import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Inventaire, LigneInventaire } from '@/app/types/inventaire';

interface InventairePVProps {
  inventaire: Inventaire;
}

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 9, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 6 },
  etablissement: { fontSize: 13, fontWeight: 'bold' },
  sousTitre: { fontSize: 8, color: '#666' },
  title: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginTop: 10, marginBottom: 12 },
  separator: { borderBottomWidth: 1, borderBottomColor: '#999', marginVertical: 8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  infoCell: { width: '50%', marginBottom: 3 },
  infoLabel: { fontSize: 8, color: '#666' },
  infoValue: { fontSize: 9, fontWeight: 'bold' },
  table: { marginTop: 8, borderTopWidth: 1, borderColor: '#ccc' },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e5e5', minHeight: 16, alignItems: 'center' },
  th: { fontSize: 8, fontWeight: 'bold', backgroundColor: '#f2f2f2', paddingVertical: 3, paddingHorizontal: 3 },
  td: { fontSize: 8, paddingVertical: 3, paddingHorizontal: 3 },
  colMed: { width: '30%' },
  colLot: { width: '18%' },
  colQty: { width: '12%', textAlign: 'center' },
  colEcart: { width: '12%', textAlign: 'center' },
  colVal: { width: '16%', textAlign: 'right' },
  totals: { marginTop: 10, alignItems: 'flex-end' },
  totalLine: { fontSize: 9, marginBottom: 2 },
  signatures: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { width: '45%' },
  signatureLabel: { fontSize: 8, color: '#666', marginBottom: 24 },
  signatureLine: { borderTopWidth: 1, borderColor: '#999', paddingTop: 3, fontSize: 8 },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, fontSize: 7, color: '#888', textAlign: 'center' },
});

const fmtDate = (d?: string | null) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('fr-FR') + ' ' + dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export default function InventairePV({ inventaire }: InventairePVProps) {
  const lignes = inventaire.lignes ?? [];
  const totalValeurEcart = lignes.reduce((sum, l) => sum + Math.abs(Number(l.valeurEcart) || 0), 0);
  const nbEcarts = lignes.filter((l) => (l.ecart ?? 0) !== 0).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.etablissement}>Hôpital Saint-Luc</Text>
          <Text style={styles.sousTitre}>Service Pharmacie</Text>
        </View>

        <Text style={styles.title}>Procès-verbal d&apos;inventaire</Text>
        <View style={styles.separator} />

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>N° inventaire</Text>
            <Text style={styles.infoValue}>#{inventaire.idInventaire}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Statut</Text>
            <Text style={styles.infoValue}>{inventaire.statut}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Date de l&apos;inventaire</Text>
            <Text style={styles.infoValue}>{fmtDate(inventaire.dateInventaire)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{inventaire.typeInventaire}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Réalisé par</Text>
            <Text style={styles.infoValue}>{inventaire.realisateurNom || '-'}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Validé par</Text>
            <Text style={styles.infoValue}>{inventaire.validateurNom || '-'}</Text>
          </View>
        </View>
        {inventaire.observations ? (
          <View>
            <Text style={styles.infoLabel}>Observations</Text>
            <Text style={styles.infoValue}>{inventaire.observations}</Text>
          </View>
        ) : null}

        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, styles.colMed]}>Médicament</Text>
            <Text style={[styles.th, styles.colLot]}>Lot</Text>
            <Text style={[styles.th, styles.colQty]}>Théorique</Text>
            <Text style={[styles.th, styles.colQty]}>Réel</Text>
            <Text style={[styles.th, styles.colEcart]}>Écart</Text>
            <Text style={[styles.th, styles.colVal]}>Valeur</Text>
          </View>
          {lignes.map((l: LigneInventaire, idx) => (
            <View key={idx} style={styles.tr} wrap={false}>
              <Text style={[styles.td, styles.colMed]}>{l.medicamentNom ?? `#${l.idMedicament}`}</Text>
              <Text style={[styles.td, styles.colLot]}>{l.lotNumero ?? `#${l.idLot}`}</Text>
              <Text style={[styles.td, styles.colQty]}>{l.quantiteTheorique}</Text>
              <Text style={[styles.td, styles.colQty]}>{l.quantiteReelle}</Text>
              <Text style={[styles.td, styles.colEcart]}>
                {l.ecart != null && l.ecart > 0 ? '+' : ''}{l.ecart ?? 0}
              </Text>
              <Text style={[styles.td, styles.colVal]}>
                {l.valeurEcart != null ? `${Number(l.valeurEcart).toFixed(2)} $` : '-'}
              </Text>
            </View>
          ))}
          {lignes.length === 0 && (
            <View style={styles.tr}>
              <Text style={[styles.td, { width: '100%' }]}>Aucune ligne.</Text>
            </View>
          )}
        </View>

        <View style={styles.totals}>
          <Text style={styles.totalLine}>Lignes comptées : {lignes.length}</Text>
          <Text style={styles.totalLine}>Lignes avec écart : {nbEcarts}</Text>
          <Text style={styles.totalLine}>Valeur totale des écarts : {totalValeurEcart.toFixed(2)} $</Text>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le réalisateur</Text>
            <Text style={styles.signatureLine}>{inventaire.realisateurNom || '..........................'}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le validateur</Text>
            <Text style={styles.signatureLine}>{inventaire.validateurNom || '..........................'}</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Document généré par le système de gestion hospitalière — {new Date().toLocaleDateString('fr-FR')}
        </Text>
      </Page>
    </Document>
  );
}
