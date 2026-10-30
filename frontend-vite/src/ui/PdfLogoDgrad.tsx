import { View, Image, StyleSheet } from '@react-pdf/renderer';

const LOGO_SRC = '/Logo.png';

/**
 * En-tête logo DGRAD affiché dans tous les PDF (ordonnances, factures, examens, inventaires).
 * À placer dans la section header d'un Document @react-pdf/renderer.
 */
export function PdfLogoDgrad({ width = 60, height = 60 }: { width?: number; height?: number }) {
  return (
    <View style={styles.container}>
      <Image src={LOGO_SRC} style={{ width, height }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 4,
  },
});
