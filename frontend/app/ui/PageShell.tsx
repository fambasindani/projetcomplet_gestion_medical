'use client';

import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import PageHeader from './PageHeader';
import Button from './Button';

interface PageShellProps {
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
  /** Conservé pour compatibilité — la largeur pleine est désormais utilisée (comme le dashboard). */
  maxWidth?: string;
  children: React.ReactNode;
}

/**
 * Enveloppe standard des pages "détails" et "formulaires" :
 * pleine largeur (comme le dashboard) + en-tête (titre, sous-titre, retour, actions).
 */
export default function PageShell({
  title,
  subtitle,
  onBack,
  backLabel = 'Retour',
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {onBack && (
              <Button variant="secondary" type="button" icon={<FaArrowLeft />} onClick={onBack}>
                {backLabel}
              </Button>
            )}
            {actions}
          </>
        }
      />
      {children}
    </div>
  );
}
