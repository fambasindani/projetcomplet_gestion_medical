'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

export const PALETTE = [
  '#0ea5e9',
  '#6366f1',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#14b8a6',
  '#f43f5e',
];

const baseFont = {
  family:
    "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  size: 12,
};

const gridColor = 'rgba(148, 163, 184, 0.15)';

const tooltipBase = {
  backgroundColor: '#0f172a',
  titleColor: '#f8fafc',
  bodyColor: '#e2e8f0',
  padding: 12,
  cornerRadius: 8,
  displayColors: true,
  boxPadding: 4,
  titleFont: { ...baseFont, weight: 600 },
  bodyFont: baseFont,
};

interface DatasetInput {
  label: string;
  data: number[];
  color?: string;
}

interface BaseProps {
  labels: string[];
  datasets: DatasetInput[];
  height?: number;
  currency?: boolean;
}

interface DonutProps extends BaseProps {
  colors?: string[];
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function AreaChart({ labels, datasets, height = 300 }: BaseProps) {
  const data = {
    labels,
    datasets: datasets.map((d, i) => {
      const color = d.color ?? PALETTE[i % PALETTE.length];
      return {
        label: d.label,
        data: d.data,
        borderColor: color,
        backgroundColor: (ctx: { chart: ChartJS }) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return hexToRgba(color, 0.2);
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, hexToRgba(color, 0.45));
          gradient.addColorStop(1, hexToRgba(color, 0.02));
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 3,
      };
    }),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, pointStyle: 'circle', font: baseFont, boxWidth: 8 },
      },
      tooltip: tooltipBase,
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: baseFont, color: '#94a3b8', maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor, drawTicks: false },
        border: { display: false },
        ticks: { font: baseFont, color: '#94a3b8', padding: 8, precision: 0 },
      },
    },
  };

  return <div style={{ height }}><Line data={data} options={options} /></div>;
}

export function BarChart({ labels, datasets, height = 300, currency = false }: BaseProps) {
  const data = {
    labels,
    datasets: datasets.map((d, i) => {
      const color = d.color ?? PALETTE[i % PALETTE.length];
      return {
        label: d.label,
        data: d.data,
        backgroundColor: (ctx: { chart: ChartJS }) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return hexToRgba(color, 0.75);
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, hexToRgba(color, 0.95));
          gradient.addColorStop(1, hexToRgba(color, 0.55));
          return gradient;
        },
        hoverBackgroundColor: color,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 42,
      };
    }),
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, pointStyle: 'circle', font: baseFont, boxWidth: 8 },
      },
      tooltip: {
        ...tooltipBase,
        callbacks: currency
          ? {
              label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(2)} $`,
            }
          : undefined,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: baseFont, color: '#94a3b8', maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor, drawTicks: false },
        border: { display: false },
        ticks: {
          font: baseFont,
          color: '#94a3b8',
          padding: 8,
          callback: (value) => (currency ? `${value}` : `${value}`),
        },
      },
    },
  };

  return <div style={{ height }}><Bar data={data} options={options} /></div>;
}

export function DonutChart({ labels, datasets, height = 300, colors: colorsProp }: DonutProps) {
  const colors = datasets[0]
    ? datasets[0].data.map((_, i) =>
        colorsProp?.[i] ??
        (datasets[0].color ? datasets[0].color : PALETTE[i % PALETTE.length]))
    : PALETTE;
  const data = {
    labels,
    datasets: [
      {
        label: datasets[0]?.label ?? '',
        data: datasets[0]?.data ?? [],
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: baseFont,
          boxWidth: 8,
          padding: 14,
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        cornerRadius: 8,
        titleFont: { ...baseFont, weight: 600 },
        bodyFont: baseFont,
      },
    },
  };

  return <div style={{ height }}><Doughnut data={data} options={options} /></div>;
}
