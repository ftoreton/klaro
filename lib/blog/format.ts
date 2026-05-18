// Helpers de formatage de dates pour le blog.
// Aucune dépendance — utilisable côté serveur ET client.

// Formate une date en français : "il y a 3 jours" si < 7 jours, sinon "15 juin 2026"
export function formatPublishedDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
