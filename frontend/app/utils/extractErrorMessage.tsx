// utils/extractErrorMessage.ts
import axios from 'axios';

export const extractErrorMessage = (error: unknown): string => {
  // Cas AxiosError
  if (axios.isAxiosError(error)) {
    // Aucune réponse : backend éteint, mauvaise URL ou origine bloquée (CORS)
    if (!error.response) {
      return 'Impossible de contacter le serveur. Vérifiez que le backend est démarré et que votre origine est autorisée (CORS).';
    }
    // Si le backend a renvoyé un message dans une propriété 'message'
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Si la réponse est une simple chaîne
    if (typeof error.response?.data === 'string') {
      return error.response.data;
    }
    // Si le backend a renvoyé une erreur de validation (format .NET)
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      // Prendre la première erreur du premier champ
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey && errors[firstErrorKey].length) {
        return errors[firstErrorKey][0];
      }
    }
    // Message par défaut d'Axios
    if (error.message) {
      return error.message;
    }
  }

  // Cas d'une erreur JavaScript standard
  if (error instanceof Error) {
    return error.message;
  }

  // Cas où l'erreur est une chaîne
  if (typeof error === 'string') {
    return error;
  }

  // Fallback générique
  return 'Une erreur inattendue est survenue';
};