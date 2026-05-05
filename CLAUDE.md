# Klaro — CLAUDE.md

## Produit
Klaro est un copilote IA pour les particuliers qui rénovent leur logement.
Il s'adresse aux non-initiés, qu'ils fassent eux-mêmes les travaux ou qu'ils pilotent des artisans.
Il n'est PAS un outil pro BTP, pas une marketplace, pas un logiciel de devis/facturation.

## Problème résolu
Rénover sans être du métier = trois problèmes :
1. Ne pas savoir quoi faire, dans quel ordre, et ce qu'on oublie
2. Mal planifier (délais, dépendances entre corps de métier, contraintes légales)
3. Rater des étapes critiques ou ne pas détecter les malfaçons à temps

## Vocabulaire produit
- "Score chantier" (pas "progression")
- "Alertes" (pas "notifications")
- "Blocage" / "Retard" / "Finies"
- "Klaro vous recommande" / "Klaro priorise"
- "Faire" / "Contacter" / "Plus tard"
- "Lot" pour regrouper des tâches par corps de métier
- "Tâche critique" = bloque la suite du chantier

## Contexte fondateur
Florent, fondateur, a rénové sa propre maison lui-même — pas de background dev ni BTP pro.
Klaro est conçu depuis la perspective de celui qui a vécu le problème.

## Principes produit
- Actionnable : chaque écran répond à "qu'est-ce que je fais maintenant ?"
- Pédagogue : pas de jargon BTP non expliqué
- IA en surface : score, priorisation, recommandation visibles mais jamais intrusifs
- Tolérant à l'imprévu : un chantier dérape, l'outil s'adapte sans punir
- Mobile-friendly : les particuliers sont sur chantier

## Ce qu'il reste à construire
- Référentiel corps de métier + tâches par métier (fichier JSON)
- Vue Tâches complète
- Calendrier / planning avec dépendances
- Budget
- Documents
- Onboarding / création de projet
- Moteur de priorisation IA
