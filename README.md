# Système son cargo — Dossier de construction

Application [Vite](https://vite.dev/) + [React](https://react.dev/) présentant le dossier de
construction du système son transportable en vélo cargo.

## Développement

```bash
npm install
npm run dev      # serveur local sur http://localhost:5173
npm run build    # build de production dans dist/
npm run preview  # prévisualise le build de production
```

## Structure

- `index.html` — point d'entrée Vite (charge les polices Google Fonts)
- `src/main.jsx` — montage React
- `src/App.jsx` — contenu du dossier (composants Section, Note, Tip…)
- `src/index.css` — styles globaux
- `rapport-systeme-son.md` — note source d'origine

## Déploiement sur Vercel

Vercel détecte automatiquement Vite (`framework: "vite"` dans `vercel.json`).

- **Via l'interface** : importer le dépôt sur [vercel.com](https://vercel.com), aucun réglage à
  changer (build `npm run build`, sortie `dist`).
- **Via la CLI** :

  ```bash
  npm i -g vercel
  vercel        # déploiement de prévisualisation
  vercel --prod # déploiement en production
  ```
