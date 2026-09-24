'use client';

import Link from 'next/link';
import { FaTools } from 'react-icons/fa';

interface UnderConstructionProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title,
  description = 'Ce module est en cours de construction et sera bientôt disponible.',
  backHref,
  backLabel = 'Retour à l\'accueil',
}) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-md">
          <FaTools className="text-2xl text-white" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">{title}</h1>
        <p className="mb-6 text-sm text-gray-500">{description}</p>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:opacity-90"
          >
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
};

export default UnderConstruction;
