import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Examen } from '@/app/types/examen';

interface EtiquetteExamenPDFProps {
  examens: Examen[];
}

// Etiquette compacte pour imprimante matricielle / thermique.
// Format par defaut : 70mm x 40mm (converti en points : 1mm = 2.8346pt).
const LABEL_WIDTH = 70 * 2.8346;
const LABEL_HEIGHT = 40 * 2.8346;

const styles = StyleSheet.create({
  page: {
    padding: 6,
    fontFamily: 'Courier',
    fontSize: 8,
    color: '#000',
  },
  box: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'dashed',
    padding: 5,
    marginBottom: 4,
    flexDirection: 'column',
  },
  entete: {
    fontSize: 7,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  numero: {
    fontFamily: 'Courier-Bold',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 2,
  },
  ligne: {
    fontSize: 8.5,
    marginBottom: 1,
  },
  label: {
    fontFamily: 'Courier-Bold',
  },
  pied: {
    fontSize: 7,
    marginTop: 2,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 2,
  },
});

const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function EtiquetteExamenPDF({ examens }: EtiquetteExamenPDFProps) {
  return (
    <Document>
      {examens.map((e) => (
        <Page key={e.idExamen} size={[LABEL_WIDTH, LABEL_HEIGHT]} style={styles.page}>
          <View style={styles.box}>
            <Text style={styles.entete}>LABORATOIRE — EXAMEN</Text>
            <Text style={styles.numero}>{e.numeroExamen}</Text>
            <Text style={styles.ligne}>
              <Text style={styles.label}>Patient : </Text>
              {e.patientNom || '-'}
            </Text>
            <Text style={styles.ligne}>
              <Text style={styles.label}>Examen : </Text>
              {e.typeExamen || '-'}
            </Text>
            <Text style={styles.ligne}>
              <Text style={styles.label}>Categorie : </Text>
              {e.libelleCategorie || '-'}
            </Text>
            <Text style={styles.ligne}>
              <Text style={styles.label}>Laboratoire : </Text>
              {e.nomLaboratoire || e.laboratoire || '-'}
            </Text>
            <Text style={styles.ligne}>
              <Text style={styles.label}>Date : </Text>
              {formatDate(e.datePrescription)}
            </Text>
            <Text style={styles.pied}>Prescription : {e.medecinNom || '-'}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}