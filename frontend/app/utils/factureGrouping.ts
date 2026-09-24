import type { DetailFacture } from '../types/facture';

export const ORDRE_SOURCES = [
  'CONSULTATION',
  'EXAMEN',
  'MEDICAMENT',
  'HOSPITALISATION',
  'SOIN',
  'INTERVENTION',
  'AUTRE',
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consultations',
  EXAMEN: 'Examens',
  MEDICAMENT: 'Pharmacie (médicaments)',
  HOSPITALISATION: 'Hospitalisation / frais de séjour',
  SOIN: 'Soins infirmiers',
  INTERVENTION: 'Interventions',
  AUTRE: 'Autres prestations',
};

export interface GroupeFacture {
  key: string;
  label: string;
  items: DetailFacture[];
  sousTotalHt: number;
  sousTotalTtc: number;
}

/**
 * Regroupe les lignes de facture par nature de prestation (présentation note d'honoraires).
 */
export function grouperDetails(details: DetailFacture[] | null | undefined): GroupeFacture[] {
  const map = new Map<string, DetailFacture[]>();
  for (const d of details ?? []) {
    const key = d.source && SOURCE_LABELS[d.source] ? d.source : 'AUTRE';
    const arr = map.get(key);
    if (arr) arr.push(d);
    else map.set(key, [d]);
  }
  return ORDRE_SOURCES.filter((k) => map.has(k)).map((k) => {
    const items = map.get(k)!;
    return {
      key: k,
      label: SOURCE_LABELS[k] ?? 'Autres prestations',
      items,
      sousTotalHt: items.reduce((a, d) => a + d.montantHt, 0),
      sousTotalTtc: items.reduce((a, d) => a + d.montantTtc, 0),
    };
  });
}
