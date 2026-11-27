import { View, Image, StyleSheet } from '@react-pdf/renderer';
import { assetUrl } from '@/utils/basePath';

const LOGO_SRC = assetUrl('Logo.png');

/**
 * En-tete logo DGRAD affiche dans tous les PDF (ordonnances, factures, examens, inventaires).
 * A placer dans la section header d'un Document @react-pdf/renderer.
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
