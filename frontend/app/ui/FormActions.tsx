'use client';

import React from 'react';
import Button from './Button';

interface FormActionsProps {
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  submitIcon?: React.ReactNode;
  extra?: React.ReactNode;
}

/**
 * Barre d'actions standard des formulaires (Annuler + Enregistrer).
 */
export default function FormActions({
  onCancel,
  cancelLabel = 'Annuler',
  submitLabel = 'Enregistrer',
  loadingLabel = 'Enregistrement...',
  loading = false,
  submitIcon,
  extra,
}: FormActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      {extra}
      {onCancel && (
        <Button type="button" variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" disabled={loading} icon={!loading ? submitIcon : undefined}>
        {loading ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}
