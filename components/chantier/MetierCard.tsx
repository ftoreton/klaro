'use client';

import { Check, Plus, X } from 'lucide-react';

// 4 états canoniques d'une carte métier (cf. brief Modification du chantier).
// L'onboarding utilise un sous-ensemble : `actif_paye_avec_taches` (sélectionné)
// et `disponible_sans_upgrade` (non sélectionné). Le contexte "payé" n'existe
// pas encore à l'onboarding ; on traite la sélection comme l'équivalent visuel.
export type MetierCardState =
  | 'actif_paye_avec_taches'      // bordure teal, badge ✓ Actif, click → ouvre tâches, non-retirable
  | 'actif_paye_sans_taches'      // bordure teal, badge ✓ Actif, retirable
  | 'disponible_sans_upgrade'     // bordure grise, bouton + Ajouter
  | 'disponible_avec_upgrade';    // bordure grise, badge prix, bouton + Ajouter (déclenche modal)

interface Props {
  meta: { icon: string; label: string };
  state: MetierCardState;
  // # tâches actives / total disponibles. Pour les états `actif_*`, on affiche
  // "X / Y tâches". Pour les `disponible_*`, on affiche juste "Y tâches".
  activeTaskCount?: number;
  totalTaskCount: number;
  // Pour `disponible_avec_upgrade` : prix de l'upgrade en centimes (ex. 2000 = +20€).
  upgradePriceCents?: number;
  // Click sur la carte entière. Sémantique :
  //  - actif_paye_avec_taches : ouvrir les tâches du métier
  //  - actif_paye_sans_taches : ouvrir les tâches du métier (ajouter)
  //  - disponible_sans_upgrade : ajouter le métier
  //  - disponible_avec_upgrade : déclencher la modal d'upgrade
  // L'onboarding utilise ce click pour toggle la sélection.
  onClick?: () => void;
  // Bouton dédié de retrait (visible uniquement si défini et state = actif_paye_sans_taches).
  onRemove?: () => void;
  // Si défini sur `actif_paye_avec_taches`, le bouton de retrait est rendu mais désactivé,
  // avec ce texte en tooltip (ex. "Retire d'abord toutes les tâches").
  removeDisabledReason?: string;
}

function formatPrice(cents: number): string {
  const euros = cents / 100;
  return euros % 1 === 0 ? `${euros}€` : `${euros.toFixed(2)}€`;
}

export default function MetierCard({
  meta,
  state,
  activeTaskCount,
  totalTaskCount,
  upgradePriceCents,
  onClick,
  onRemove,
  removeDisabledReason,
}: Props) {
  const isActive = state === 'actif_paye_avec_taches' || state === 'actif_paye_sans_taches';
  const isRemovable = state === 'actif_paye_sans_taches' && !!onRemove;
  const showRemoveDisabled = state === 'actif_paye_avec_taches' && !!removeDisabledReason;
  const showUpgradeBadge = state === 'disponible_avec_upgrade';

  return (
    <div
      className={`ck-metier ${isActive ? 'is-active' : ''} ${showUpgradeBadge ? 'is-upgrade' : ''}`}
      data-state={state}
    >
      <button
        type="button"
        className="ck-metier-main"
        onClick={onClick}
        aria-pressed={isActive}
      >
        <span className="ck-metier-icon" aria-hidden>{meta.icon}</span>
        <span className="ck-metier-text">
          <span className="ck-metier-label">{meta.label}</span>
          <span className="ck-metier-count">
            {isActive
              ? `${activeTaskCount ?? 0} / ${totalTaskCount} tâches`
              : `${totalTaskCount} tâches`}
          </span>
        </span>

        {isActive && (
          <span className="ck-metier-badge ck-metier-badge-active" aria-hidden>
            <Check size={12} strokeWidth={3} />
            Actif
          </span>
        )}

        {showUpgradeBadge && upgradePriceCents != null && (
          <span className="ck-metier-badge ck-metier-badge-upgrade" aria-hidden>
            +{formatPrice(upgradePriceCents)} pour ajouter
          </span>
        )}

        {state === 'disponible_sans_upgrade' && (
          <span className="ck-metier-cta" aria-hidden>
            <Plus size={14} strokeWidth={2.4} />
            Ajouter
          </span>
        )}

        {state === 'disponible_avec_upgrade' && (
          <span className="ck-metier-cta" aria-hidden>
            <Plus size={14} strokeWidth={2.4} />
            Ajouter
          </span>
        )}
      </button>

      {/* Bouton retirer — état actif_paye_sans_taches */}
      {isRemovable && (
        <button
          type="button"
          className="ck-metier-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove!();
          }}
          aria-label={`Retirer ${meta.label}`}
        >
          <X size={14} />
        </button>
      )}

      {/* Bouton retirer désactivé — état actif_paye_avec_taches */}
      {showRemoveDisabled && (
        <button
          type="button"
          className="ck-metier-remove is-disabled"
          disabled
          title={removeDisabledReason}
          aria-label={`Retirer ${meta.label} (désactivé)`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
