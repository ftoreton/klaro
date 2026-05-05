# Klaro

Voir clair sur son chantier. C'est Klaro.

Klaro est un copilote de chantier intelligent pour particuliers : il guide l'utilisateur via un planning défini, une checklist de tâches à valider, et des alertes sur les situations à risque.

## Stack

- Next.js 15 (App Router)
- React 18
- TypeScript

## Démarrage

```bash
npm install
npm run dev
```

Le site tourne sur http://localhost:3000.

## Pages

- `/dashboard` — Tableau de bord (score chantier, prochaine action, top 3 tâches)
- `/alertes` — Centre d'alertes (focus + reste)
- `/devis` — Liste des devis (signés / en attente)
- `/taches` — Vue tâches (à venir)

## Architecture

```
klaro/
├── app/                    # routes Next.js
│   ├── dashboard/
│   ├── alertes/
│   ├── devis/
│   ├── taches/
│   ├── providers.tsx       # contexte global (état + actions)
│   └── globals.css
├── components/
│   ├── ui/                 # Icon, Logo, ScoreRing, Toast
│   ├── layout/             # Sidebar, Topbar, MobileNav
│   ├── dashboard/          # ScoreCard, NextAction, TasksList, AlertStrip
│   ├── alerts/             # AlertFocus, AlertMini
│   └── ScenarioPanel.tsx   # switch démarrage / en cours / crise
└── lib/
    ├── engine.ts           # moteur de scoring
    ├── scenarios.ts        # 3 datasets de démo
    └── types.ts
```

## Le moteur

`lib/engine.ts` lit tâches + devis + dépendances et sort :
- score chantier /100
- top 3 tâches du jour
- liste d'alertes triées par priorité
- détection des blocages (dépendances non finies)

Trois scénarios de démo : `demarrage`, `enCours`, `crise`. Switch via le panneau "Scénario" en bas à droite.
