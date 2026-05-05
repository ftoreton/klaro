import type { Scenario, ScenarioKey } from './types';

const scenarios: Record<ScenarioKey, Scenario> = {
  enCours: {
    label: 'En cours',
    sub: 'Chantier sain · 2 points à vérifier',
    project: { nom: 'Maison Pernot', lieu: 'Lyon 7e', jour: 'J+42' },
    tasks: [
      { id: 't1', nom: 'Démolition existant', metier: 'Démolition', statut: 'terminé', priorite: 'important', depends: [], dueIn: -30, artisan: 'Démol Express' },
      { id: 't2', nom: 'Fondations', metier: 'Gros œuvre', statut: 'terminé', priorite: 'critique', depends: ['t1'], dueIn: -25, artisan: 'BTP Lyon' },
      { id: 't3', nom: 'Murs porteurs', metier: 'Gros œuvre', statut: 'terminé', priorite: 'critique', depends: ['t2'], dueIn: -15, artisan: 'BTP Lyon' },
      { id: 't4', nom: 'Charpente', metier: 'Charpente', statut: 'terminé', priorite: 'critique', depends: ['t3'], dueIn: -8, artisan: 'Charpentes Bois' },
      { id: 't5', nom: 'Couverture', metier: 'Toiture', statut: 'terminé', priorite: 'critique', depends: ['t4'], dueIn: -5, artisan: 'Toits & Co' },
      { id: 't6', nom: 'Plomberie passages', metier: 'Plomberie', statut: 'terminé', priorite: 'important', depends: ['t3'], dueIn: -3, artisan: 'ABCo Plomberie' },
      { id: 't7', nom: 'Électricité passages', metier: 'Électricité', statut: 'en cours', priorite: 'critique', depends: ['t3'], dueIn: -1, artisan: 'Volt Pro' },
      { id: 't8', nom: 'Valider devis plomberie SDB', metier: 'Plomberie', statut: 'à faire', priorite: 'critique', depends: [], dueIn: 0, artisan: 'ABCo Plomberie' },
      { id: 't9', nom: 'Choisir carrelage SDB', metier: 'Décoration', statut: 'à faire', priorite: 'important', depends: [], dueIn: 0, artisan: null },
      { id: 't10', nom: 'Confirmer livraison cuisine', metier: 'Cuisine', statut: 'à faire', priorite: 'important', depends: [], dueIn: 1, artisan: 'Cuisinella' },
      { id: 't11', nom: 'Visite de chantier hebdo', metier: 'Suivi', statut: 'à faire', priorite: 'important', depends: [], dueIn: 0, artisan: 'Marie (architecte)' },
      { id: 't12', nom: 'Pose placo', metier: 'Cloisons', statut: 'à faire', priorite: 'important', depends: ['t7'], dueIn: 3, artisan: 'Plâtrerie Lyonnaise' },
      { id: 't13', nom: 'Carrelage SDB', metier: 'Carrelage', statut: 'à faire', priorite: 'important', depends: ['t9'], dueIn: 7, artisan: 'Lapeyre' },
      { id: 't14', nom: 'Peinture', metier: 'Peinture', statut: 'à faire', priorite: 'secondaire', depends: ['t12'], dueIn: 14, artisan: null },
      { id: 't15', nom: 'Pose cuisine', metier: 'Cuisine', statut: 'à faire', priorite: 'critique', depends: ['t10', 't12'], dueIn: 18, artisan: 'Cuisinella' },
    ],
    devis: [
      { id: 'd1', metier: 'plomberie SDB', fichier: 'devis_plomberie_v3.pdf', montant: '4 320 €', artisan: 'ABCo Plomberie', signe: false, recuDepuis: 2, bloqueLe: 'lundi' },
      { id: 'd2', metier: 'électricité', fichier: 'devis_electricite.pdf', montant: '8 750 €', artisan: 'Volt Pro', signe: true, recuDepuis: 30 },
    ],
  },

  demarrage: {
    label: 'Démarrage',
    sub: 'Chantier qui commence · à structurer',
    project: { nom: 'Maison Pernot', lieu: 'Lyon 7e', jour: 'J+3' },
    tasks: [
      { id: 't1', nom: 'Signature contrat principal', metier: 'Admin', statut: 'terminé', priorite: 'critique', depends: [], dueIn: -3, artisan: 'Marie (architecte)' },
      { id: 't2', nom: 'Permis de construire validé', metier: 'Admin', statut: 'terminé', priorite: 'critique', depends: [], dueIn: -1, artisan: null },
      { id: 't3', nom: 'Déclaration préalable mairie', metier: 'Admin', statut: 'à faire', priorite: 'critique', depends: [], dueIn: 0, artisan: null },
      { id: 't4', nom: 'Choisir entreprise gros œuvre', metier: 'Gros œuvre', statut: 'à faire', priorite: 'critique', depends: [], dueIn: 1, artisan: null },
      { id: 't5', nom: 'Réunion de cadrage chantier', metier: 'Suivi', statut: 'à faire', priorite: 'important', depends: [], dueIn: 0, artisan: 'Marie (architecte)' },
      { id: 't6', nom: 'Comparer 3 devis plomberie', metier: 'Plomberie', statut: 'à faire', priorite: 'important', depends: [], dueIn: 2, artisan: null },
      { id: 't7', nom: 'Comparer 3 devis électricité', metier: 'Électricité', statut: 'à faire', priorite: 'important', depends: [], dueIn: 2, artisan: null },
      { id: 't8', nom: 'Démarrage gros œuvre', metier: 'Gros œuvre', statut: 'à faire', priorite: 'critique', depends: ['t3', 't4'], dueIn: 7, artisan: null },
      { id: 't9', nom: 'Démolition existant', metier: 'Démolition', statut: 'à faire', priorite: 'important', depends: ['t4'], dueIn: 5, artisan: null },
      { id: 't10', nom: 'Sélectionner cuisine', metier: 'Cuisine', statut: 'à faire', priorite: 'secondaire', depends: [], dueIn: 14, artisan: null },
      { id: 't11', nom: 'Choisir carrelage', metier: 'Décoration', statut: 'à faire', priorite: 'secondaire', depends: [], dueIn: 21, artisan: null },
      { id: 't12', nom: 'Souscrire assurance dommages', metier: 'Admin', statut: 'à faire', priorite: 'critique', depends: [], dueIn: 1, artisan: null },
      { id: 't13', nom: 'Ouvrir compte chantier banque', metier: 'Admin', statut: 'à faire', priorite: 'important', depends: [], dueIn: 3, artisan: null },
      { id: 't14', nom: 'Visite avec architecte', metier: 'Suivi', statut: 'à faire', priorite: 'important', depends: [], dueIn: 0, artisan: 'Marie' },
      { id: 't15', nom: 'Validation budget global', metier: 'Admin', statut: 'à faire', priorite: 'critique', depends: [], dueIn: 1, artisan: null },
    ],
    devis: [
      { id: 'd1', metier: 'gros œuvre', fichier: 'devis_BTP_Lyon.pdf', montant: '42 000 €', artisan: 'BTP Lyon', signe: false, recuDepuis: 5, bloqueLe: 'le démarrage' },
    ],
  },

  crise: {
    label: 'En crise',
    sub: 'Chantier en difficulté · plusieurs blocages',
    project: { nom: 'Maison Pernot', lieu: 'Lyon 7e', jour: 'J+68' },
    tasks: [
      { id: 't1', nom: 'Démolition', metier: 'Démolition', statut: 'terminé', priorite: 'important', depends: [], dueIn: -50, artisan: 'Démol Express' },
      { id: 't2', nom: 'Fondations', metier: 'Gros œuvre', statut: 'terminé', priorite: 'critique', depends: ['t1'], dueIn: -40, artisan: 'BTP Lyon' },
      { id: 't3', nom: 'Murs porteurs', metier: 'Gros œuvre', statut: 'terminé', priorite: 'critique', depends: ['t2'], dueIn: -20, artisan: 'BTP Lyon' },
      { id: 't4', nom: 'Charpente', metier: 'Charpente', statut: 'à faire', priorite: 'critique', depends: ['t3'], dueIn: -12, artisan: 'Charpentes Bois' },
      { id: 't5', nom: 'Électricité passages', metier: 'Électricité', statut: 'à faire', priorite: 'critique', depends: ['t3'], dueIn: -6, artisan: 'Volt Pro' },
      { id: 't6', nom: 'Plomberie passages', metier: 'Plomberie', statut: 'à faire', priorite: 'important', depends: ['t3'], dueIn: -4, artisan: null },
      { id: 't7', nom: 'Signer avenant gros œuvre', metier: 'Admin', statut: 'à faire', priorite: 'critique', depends: [], dueIn: 0, artisan: 'BTP Lyon' },
      { id: 't8', nom: 'Contacter architecte (urgent)', metier: 'Suivi', statut: 'à faire', priorite: 'critique', depends: [], dueIn: 0, artisan: 'Marie' },
      { id: 't9', nom: 'Couverture', metier: 'Toiture', statut: 'à faire', priorite: 'critique', depends: ['t4'], dueIn: 5, artisan: 'Toits & Co' },
      { id: 't10', nom: 'Pose placo', metier: 'Cloisons', statut: 'à faire', priorite: 'important', depends: ['t5'], dueIn: 8, artisan: null },
      { id: 't11', nom: 'Carrelage SDB', metier: 'Carrelage', statut: 'à faire', priorite: 'important', depends: ['t6'], dueIn: 14, artisan: null },
      { id: 't12', nom: 'Pose cuisine', metier: 'Cuisine', statut: 'à faire', priorite: 'critique', depends: ['t10'], dueIn: 20, artisan: 'Cuisinella' },
      { id: 't13', nom: 'Peinture', metier: 'Peinture', statut: 'à faire', priorite: 'secondaire', depends: ['t10'], dueIn: 25, artisan: null },
      { id: 't14', nom: 'Réception chantier', metier: 'Suivi', statut: 'à faire', priorite: 'critique', depends: ['t9', 't12'], dueIn: 35, artisan: null },
      { id: 't15', nom: 'Validation budget rallonge', metier: 'Admin', statut: 'à faire', priorite: 'critique', depends: [], dueIn: -1, artisan: null },
    ],
    devis: [
      { id: 'd1', metier: 'rallonge gros œuvre', fichier: 'avenant_BTP_v2.pdf', montant: '+ 6 800 €', artisan: 'BTP Lyon', signe: false, recuDepuis: 8, bloqueLe: "aujourd'hui" },
      { id: 'd2', metier: 'charpente urgente', fichier: 'devis_charpente.pdf', montant: '12 400 €', artisan: 'Charpentes Bois', signe: false, recuDepuis: 12, bloqueLe: 'la suite' },
    ],
  },
};

export default scenarios;
