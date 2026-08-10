'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Prescription } from '@/app/types/prescription';

// Enregistrer une police (optionnel mais recommandé)
Font.register({
  family: 'Times-Roman',
  fonts: [{ src: 'https://fonts.gstatic.com/s/timesnewroman/v15/TimesNewRoman.ttf' }]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Times-Roman'
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  patient: {
    marginBottom: 20,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  colMedicament: { width: '35%' },
  colPosologie: { width: '25%' },
  colDuree: { width: '20%' },
  colQuantite: { width: '20%' },
  signature: {
    marginTop: 40,
    textAlign: 'right',
  },
  note: {
    marginTop: 20,
    fontStyle: 'italic',
  }
});

interface Props {
  prescription: Prescription;
}

export default function OrdonnancePDF({ prescription }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>ORDONNANCE MÉDICALE</Text>
          <Text style={styles.subtitle}>Dr. {prescription.medecinNom} {prescription.medecinPrenom}</Text>
          <Text style={styles.subtitle}>Prescription n° {prescription.numeroPrescription}</Text>
          <Text style={styles.subtitle}>
            Émise le {format(new Date(prescription.datePrescription), 'dd MMMM yyyy', { locale: fr })}
          </Text>
        </View>

        {/* Patient */}
        <View style={styles.patient}>
          <Text><Text style={{ fontWeight: 'bold' }}>Patient :</Text> {prescription.patientNom} {prescription.patientPrenom}</Text>
        </View>

        {/* Médicaments */}
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Médicaments prescrits :</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.colMedicament}>Médicament</Text>
              <Text style={styles.colPosologie}>Posologie</Text>
              <Text style={styles.colDuree}>Durée</Text>
              <Text style={styles.colQuantite}>Quantité</Text>
            </View>
            {prescription.prescriptionsMedicaments?.map((med, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colMedicament}>{med.medicamentNom || `ID ${med.idMedicament}`}</Text>
                <Text style={styles.colPosologie}>{med.posologie}</Text>
                <Text style={styles.colDuree}>{med.dureeTraitement || '-'}</Text>
                <Text style={styles.colQuantite}>{med.quantitePrescrite}</Text>
              </View>
            ))}
          </View>
          {prescription.instructions && (
            <Text>Instructions générales : {prescription.instructions}</Text>
          )}
        </View>

        {/* Infos complémentaires */}
        {prescription.dateDebut && (
          <Text>À prendre à partir du {format(new Date(prescription.dateDebut), 'dd/MM/yyyy')}</Text>
        )}
        {prescription.dateFin && (
          <Text>Jusqu&apos;au {format(new Date(prescription.dateFin), 'dd/MM/yyyy')}</Text>
        )}
        {prescription.notesComplementaires && (
          <Text style={styles.note}>Notes : {prescription.notesComplementaires}</Text>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text>Signature et cachet du médecin</Text>
        </View>
      </Page>
    </Document>
  );
}