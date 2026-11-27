import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmOptions {
  title?: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Couleur du bouton de confirmation (ex. '#dc2626' pour une suppression). */
  confirmColor?: string;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Dialogue de confirmation thémé (clair / sombre).
 *
 * Remplace `react-use-confirming-dialog`, qui imposait un fond blanc tout en
 * héritant de la couleur de texte claire du thème sombre (texte invisible).
 * L'API reste identique : useConfirm() -> confirm({ title, message, ... }).
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setOptions(null);
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  // Echap = annuler
  useEffect(() => {
    if (!options) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [options, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close(false);
            }}
          >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
              <h2
                id="confirm-title"
                className="mb-3 text-lg font-semibold text-slate-900"
              >
                {options.title || 'Confirmation'}
              </h2>
              <p
                id="confirm-message"
                className="mb-6 text-sm leading-relaxed text-slate-600"
              >
                {options.message}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {options.cancelText || 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={() => close(true)}
                  style={options.confirmColor ? { backgroundColor: options.confirmColor } : undefined}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {options.confirmText || 'Confirmer'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
