'use client';

export type Granularite = 'day' | 'month' | 'year';

export interface PeriodeFiltre {
  dateDebut: string;
  dateFin: string;
  granularite: Granularite;
}

interface PeriodeFilterProps {
  value: PeriodeFiltre;
  onChange: (value: PeriodeFiltre) => void;
  showGranularite?: boolean;
  granularites?: Granularite[];
}

const LABELS: Record<Granularite, string> = {
  day: 'Jour',
  month: 'Mois',
  year: 'Année',
};

const toISO = (d: Date) => d.toISOString().slice(0, 10);

export default function PeriodeFilter({
  value,
  onChange,
  showGranularite = true,
  granularites = ['day', 'month', 'year'],
}: PeriodeFilterProps) {
  const setPreset = (preset: 'today' | 'month' | 'year' | 'clear') => {
    const now = new Date();
    if (preset === 'today') {
      onChange({ ...value, dateDebut: toISO(now), dateFin: toISO(now), granularite: value.granularite });
    } else if (preset === 'month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      onChange({ ...value, dateDebut: toISO(first), dateFin: toISO(last), granularite: 'day' });
    } else if (preset === 'year') {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      onChange({ ...value, dateDebut: toISO(first), dateFin: toISO(last), granularite: 'month' });
    } else {
      onChange({ ...value, dateDebut: '', dateFin: '' });
    }
  };

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-end gap-2.5">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Du</label>
          <input
            type="date"
            value={value.dateDebut}
            onChange={(e) => onChange({ ...value, dateDebut: e.target.value })}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Au</label>
          <input
            type="date"
            value={value.dateFin}
            onChange={(e) => onChange({ ...value, dateFin: e.target.value })}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {showGranularite && (
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Vue</label>
            <select
              value={value.granularite}
              onChange={(e) => onChange({ ...value, granularite: e.target.value as Granularite })}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {granularites.map((g) => (
                <option key={g} value={g}>{LABELS[g]}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setPreset('today')}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              value.dateDebut === toISO(new Date()) && value.dateFin === toISO(new Date())
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aujourd&apos;hui
          </button>
          <button
            type="button"
            onClick={() => setPreset('month')}
            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
          >
            Ce mois
          </button>
          <button
            type="button"
            onClick={() => setPreset('year')}
            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
          >
            Cette année
          </button>
          <button
            type="button"
            onClick={() => setPreset('clear')}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Effacer
          </button>
        </div>
      </div>
    </div>
  );
}
