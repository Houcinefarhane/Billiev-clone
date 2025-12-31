// 🔒 Système de logging sécurisé
// Pourquoi ? Les logs en production peuvent exposer des informations sensibles
// (emails, IDs, stack traces) qui aident les hackers à attaquer le site

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  // Logs d'information (seulement en développement)
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data || '')
    }
    // En production : envoyer à un service de logging (Sentry, LogRocket, etc.)
  },

  // Logs d'erreur (sans exposer de détails sensibles)
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      // En développement : logger tous les détails pour debug
      console.error(`[ERROR] ${message}`, {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      })
    } else {
      // En production : logger seulement le type d'erreur, pas les détails
      console.error(`[ERROR] ${message}`, {
        code: error?.code || 'UNKNOWN',
        type: error?.constructor?.name,
        // Ne PAS logger : message, stack, données utilisateur
      })
    }
  },

  // Logs d'avertissement
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '')
    }
  },
}

