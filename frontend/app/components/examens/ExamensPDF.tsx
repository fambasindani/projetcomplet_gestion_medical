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
    padding: 24,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 9,
    marginBottom: 2,
    color: '#333',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    marginVertical: 8,
  },
  examBlock: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 10,
    padding: 8,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  examType: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  examMeta: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  examNumero: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#444',
  },
  section: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#555',
    marginBottom: 2,
  },
  sectionBody: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  missing: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#b91c1c',
  },
  footer: {
    marginTop: 12,
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
});

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('fr-FR');
};

export default function ExamensPDF({ examens, titre, patientNom, patientPrenom, medecinNom, medecinPrenom }: ExamensPDFProps) {
  const finalTitre = titre || `Examens (${examens.length})`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{finalTitre}</Text>
        <Text style={styles.header}>Patient : {patientNom || ''} {patientPrenom || ''}</Text>
        {medecinNom && <Text style={styles.header}>Médecin prescripteur : Dr. {medecinNom} {medecinPrenom || ''}</Text>}
        <Text style={styles.header}>Date d&apos;impression : {new Date().toLocaleDateString('fr-FR')}</Text>
        <View style={styles.separator} />

        {examens.map((ex, idx) => {
          const hasResultat = !!(ex.resultat || ex.interpretation || ex.compteRendu || ex.conclusion || ex.anomalies);
          return (
            <View key={idx} style={styles.examBlock} wrap={false}>
              <View style={styles.examHeader}>
                <View>
                  <Text style={styles.examType}>{ex.typeExamen}</Text>
                  <Text style={styles.examMeta}>
                    {ex.libelleCategorie} · Prescrit le {formatDate(ex.datePrescription)}
                    {ex.dateRealisation ? ` · Réalisé le ${formatDate(ex.dateRealisation)}` : ''}
                  </Text>
                </View>
                <Text style={styles.examNumero}>{ex.numeroExamen}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Résultat</Text>
                {hasResultat ? (
                  <Text style={styles.sectionBody}>
                    {ex.resultat}
                    {ex.interpretation ? `\n\nInterprétation : ${ex.interpretation}` : ''}
                    {ex.anomalies ? `\nAnomalies : ${ex.anomalies}` : ''}
                    {ex.compteRendu ? `\nCompte rendu : ${ex.compteRendu}` : ''}
                    {ex.conclusion ? `\nConclusion : ${ex.conclusion}` : ''}
                  </Text>
                ) : (
                  <Text style={styles.missing}>Résultat pas disponible</Text>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.separator} />
        <Text style={styles.footer}>Document généré par le système de gestion hospitalière</Text>
      </Page>
    </Document>
  );
}
