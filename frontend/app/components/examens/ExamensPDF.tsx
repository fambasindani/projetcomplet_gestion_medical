import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Examen } from '@/app/types/examen';

interface ExamensPDFProps {
  examens: Examen[];
  titre: string;
  patientNom: string;
  patientPrenom: string;
  medecinNom?: string;
  medecinPrenom?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 8,
    flexDirection: 'column',
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 9,
    marginBottom: 2,
  },
  table: {
    width: 'auto',
    marginTop: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  cellNumero: { width: '8%', padding: 2, fontSize: 7 },
  cellType: { width: '12%', padding: 2, fontSize: 7 },
  cellCategorie: { width: '12%', padding: 2, fontSize: 7 },
  cellDate: { width: '10%', padding: 2, fontSize: 7 },
  cellResultat: { width: '15%', padding: 2, fontSize: 7 },
  cellInterpretation: { width: '15%', padding: 2, fontSize: 7 },
  cellCompteRendu: { width: '12%', padding: 2, fontSize: 7 },
  cellAnomalies: { width: '10%', padding: 2, fontSize: 7 },
  cellConclusion: { width: '8%', padding: 2, fontSize: 7 },
});

export default function ExamensPDF({ examens, titre, patientNom, patientPrenom, medecinNom, medecinPrenom }: ExamensPDFProps) {
  const finalTitre = titre || `Examens (${examens.length})`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{finalTitre}</Text>
        <Text style={styles.header}>Patient : {patientNom || ''} {patientPrenom || ''}</Text>
        {medecinNom && <Text style={styles.header}>Médecin : Dr. {medecinNom} {medecinPrenom || ''}</Text>}
        <Text style={styles.header}>Date d&apos;impression : {new Date().toLocaleDateString('fr-FR')}</Text>

        <View style={styles.table}>
          {/* En-tête */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.cellNumero}>N°</Text>
            <Text style={styles.cellType}>Type</Text>
            <Text style={styles.cellCategorie}>Cat.</Text>
            <Text style={styles.cellDate}>Date</Text>
            <Text style={styles.cellResultat}>Résultat</Text>
            <Text style={styles.cellInterpretation}>Interpr.</Text>
            <Text style={styles.cellCompteRendu}>CR</Text>
            <Text style={styles.cellAnomalies}>Ano.</Text>
            <Text style={styles.cellConclusion}>Concl.</Text>
          </View>

          {examens.map((ex, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.cellNumero}>{ex.numeroExamen}</Text>
              <Text style={styles.cellType}>{ex.typeExamen}</Text>
              <Text style={styles.cellCategorie}>{ex.libelleCategorie}</Text>
              <Text style={styles.cellDate}>{new Date(ex.datePrescription).toLocaleDateString('fr-FR')}</Text>
              <Text style={styles.cellResultat}>{ex.resultat || '-'}</Text>
              <Text style={styles.cellInterpretation}>{ex.interpretation || '-'}</Text>
              <Text style={styles.cellCompteRendu}>{ex.compteRendu || '-'}</Text>
              <Text style={styles.cellAnomalies}>{ex.anomalies || '-'}</Text>
              <Text style={styles.cellConclusion}>{ex.conclusion || '-'}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}