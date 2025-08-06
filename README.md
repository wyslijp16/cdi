# CDI de L'ékip Teknik (HTML/JS simple)

## Fonctionnalités

- Proposer une ressource via le site
- Voir les ressources validées
- Panneau d'administration pour valider/refuser les propositions

## Déploiement

1. Crée deux bins sur [jsonbin.io](https://jsonbin.io/) :
   - Un pour les propositions en attente
   - Un pour les ressources validées

2. Récupère les URLs d'API de chaque bin (ex: `https://api.jsonbin.io/v3/b/xxxxxx`)

3. Ajoute les variables d'environnement sur Vercel :
   - `JSONBIN_PROPOSITIONS_URL`
   - `JSONBIN_RESSOURCES_URL`
   - `JSONBIN_KEY` (ta clé secrète jsonbin.io)
   - `ADMIN_PASS` (mot de passe admin, ex: `admin123`)

4. Déploie sur Vercel !

## Sécurité

- Le panneau d'admin est protégé par un mot de passe (à changer dans les variables d'environnement !)