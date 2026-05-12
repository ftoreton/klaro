'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Etape, Metier, Photo, StatutEtape } from './types';
import { computeStatut } from './progress';

// ─────────────────────────────────────────────────────
// État persisté par métier — uniquement les données qui
// peuvent évoluer (statut, sous-tâches cochées, photos,
// dates planifiées). La structure du métier reste statique.
//
// NB : le mode d'affichage (debutant/intermediaire/expert) n'est
// PAS stocké ici — il dérive du niveau utilisateur (Supabase) via
// NIVEAU_TO_MODE et est passé en prop aux composants consommateurs.
// ─────────────────────────────────────────────────────

interface EtapeOverlay {
  statutManuel?: StatutEtape; // Si l'utilisateur force "done" depuis le drawer
  sousTachesDone: Record<string, boolean>; // id sous-tâche → done
  photos: Photo[];
  date_planifiee: string | null;
}

type MetierOverlay = Record<string, EtapeOverlay>; // etapeId → overlay

interface StoreState {
  // Par métier : overlay des étapes
  overlays: Record<string, MetierOverlay>;
  toggleSousTache: (metierId: string, etapeId: string, sousTacheId: string) => void;
  setStatut: (metierId: string, etapeId: string, statut: StatutEtape) => void;
  setDate: (metierId: string, etapeId: string, date: string | null) => void;
  addPhoto: (metierId: string, etapeId: string, photo: Photo) => void;

  // Helper : applique l'overlay sur le métier statique → renvoie un Metier "vivant"
  applyOverlay: (metier: Metier) => Metier;
}

function emptyEtapeOverlay(): EtapeOverlay {
  return { sousTachesDone: {}, photos: [], date_planifiee: null };
}

export const useMetierStore = create<StoreState>()(
  persist(
    (set, get) => ({
      overlays: {},

      toggleSousTache: (metierId, etapeId, sousTacheId) => {
        set((state) => {
          const metierOverlay = state.overlays[metierId] ?? {};
          const etapeOverlay = metierOverlay[etapeId] ?? emptyEtapeOverlay();
          const current = etapeOverlay.sousTachesDone[sousTacheId] ?? false;
          const next: EtapeOverlay = {
            ...etapeOverlay,
            sousTachesDone: { ...etapeOverlay.sousTachesDone, [sousTacheId]: !current },
            // Si on (dé)coche, on retire le statut manuel "done" pour laisser le calcul auto
            statutManuel: undefined,
          };
          return {
            overlays: {
              ...state.overlays,
              [metierId]: { ...metierOverlay, [etapeId]: next },
            },
          };
        });
      },

      setStatut: (metierId, etapeId, statut) => {
        set((state) => {
          const metierOverlay = state.overlays[metierId] ?? {};
          const etapeOverlay = metierOverlay[etapeId] ?? emptyEtapeOverlay();
          // Si on force "done" : cocher toutes les sous-tâches
          let sousTachesDone = etapeOverlay.sousTachesDone;
          if (statut === 'done') {
            // On laisse le helper applyOverlay gérer le reste, mais on stocke statutManuel
            sousTachesDone = { ...sousTachesDone, __forceDone: true };
          }
          const next: EtapeOverlay = {
            ...etapeOverlay,
            statutManuel: statut,
            sousTachesDone,
          };
          return {
            overlays: {
              ...state.overlays,
              [metierId]: { ...metierOverlay, [etapeId]: next },
            },
          };
        });
      },

      setDate: (metierId, etapeId, date) => {
        set((state) => {
          const metierOverlay = state.overlays[metierId] ?? {};
          const etapeOverlay = metierOverlay[etapeId] ?? emptyEtapeOverlay();
          return {
            overlays: {
              ...state.overlays,
              [metierId]: {
                ...metierOverlay,
                [etapeId]: { ...etapeOverlay, date_planifiee: date },
              },
            },
          };
        });
      },

      addPhoto: (metierId, etapeId, photo) => {
        set((state) => {
          const metierOverlay = state.overlays[metierId] ?? {};
          const etapeOverlay = metierOverlay[etapeId] ?? emptyEtapeOverlay();
          return {
            overlays: {
              ...state.overlays,
              [metierId]: {
                ...metierOverlay,
                [etapeId]: { ...etapeOverlay, photos: [...etapeOverlay.photos, photo] },
              },
            },
          };
        });
      },

      applyOverlay: (metier) => {
        const overlay = get().overlays[metier.id] ?? {};
        const etapesVivantes: Etape[] = metier.etapes.map((etape) => {
          const ov = overlay[etape.id];
          if (!ov) return etape;

          const sousTaches = etape.sous_taches.map((st) => ({
            ...st,
            done: ov.sousTachesDone[st.id] ?? st.done,
          }));

          // Si statutManuel === 'done', on force tout à done
          let finalSousTaches = sousTaches;
          if (ov.statutManuel === 'done') {
            finalSousTaches = sousTaches.map((st) => ({ ...st, done: true }));
          }

          const statut = computeStatut(finalSousTaches, ov.statutManuel);

          return {
            ...etape,
            sous_taches: finalSousTaches,
            statut,
            date_planifiee: ov.date_planifiee ?? etape.date_planifiee,
            photos: [...etape.photos, ...ov.photos],
          };
        });

        return { ...metier, etapes: etapesVivantes };
      },
    }),
    {
      name: 'klaro:metier:state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        overlays: state.overlays,
      }),
    },
  ),
);
