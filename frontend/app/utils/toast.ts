'use client';

import toastBase, { ToastOptions } from 'react-hot-toast';

/**
 * Enveloppe react-hot-toast pour eviter l'empilement de messages d'erreur.
 * - `error` utilise un id fixe : une nouvelle erreur remplace la precedente
 *   (fini les plusieurs alertes identiques qui s'empilent).
 */
export const toast = Object.assign(
  (message: string, options?: ToastOptions) => toastBase(message, options),
  {
    success: (message: string, options?: ToastOptions) => toastBase.success(message, options),
    loading: (message: string, options?: ToastOptions) => toastBase.loading(message, options),
    error: (message: string, options?: ToastOptions): string => {
      toastBase.dismiss('app-error');
      return toastBase.error(message, { ...options, id: 'app-error' });
    },
    dismiss: (id?: string) => toastBase.dismiss(id),
    remove: (id?: string) => toastBase.remove(id),
    promise: toastBase.promise,
  },
);

export default toast;