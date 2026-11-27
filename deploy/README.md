# Déploiement

## Windows (serveur hospitalier)

Le paquet ressemble à celui de **GS-RH** : une application Spring Boot
(l'API **et** l'interface React dans le même `app.jar`) installée comme
**service Windows** avec NSSM, plus un installateur en double-clic.

```
deploy/
├── build-windows.ps1          # construit frontend + backend + le paquet
└── windows/                   # contenu du paquet d'installation
    ├── Installer-GS-Hopital.cmd
    ├── Desinstaller-GS-Hopital.cmd
    ├── installer.ps1
    ├── uninstall.ps1
    ├── config/application-prod.properties   # base, compte SQL, port
    ├── tools/nssm/nssm.exe
    └── LISEZ-MOI.txt
```

Le paquet produit contient aussi `database\GestionHospitaliereDB.bak`
(si la sauvegarde est présente à la racine du projet).

### 1. Construire le paquet (machine de développement)

```powershell
.\deploy\build-windows.ps1
```

Produit :

- `dist\GS-Hopital-Backend\` (dossier prêt à copier)
- `dist\GS-Hopital-Backend-<date>.zip`

Le script :

1. `npm run build` dans `frontend-vite` avec `VITE_API_URL=/api`
2. copie `frontend-vite\dist` dans `bakend\src\main\resources\static`
3. `mvnw -DskipTests package` (jar exécutable)
4. assemble `app.jar` + installateur + config + NSSM

### 2. Installer sur le serveur Windows

1. Copier `GS-Hopital-Backend` sur le serveur (ex. `C:\Temp\GS-Hopital`)
2. Vérifier `config\application-prod.properties` :

```
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=GestionHospitaliereDB;...
spring.datasource.username=hopital
spring.datasource.password=hopital+1234
server.port=7035
```

3. Double-cliquer sur `Installer-GS-Hopital.cmd` (accepter l'UAC)

Le script crée `C:\apps\gs-hopital\backend`, installe le service
`GS-Hopital-Backend`, ouvre le port 7035 et teste l'API.

### 3. Accès

- Serveur : `http://127.0.0.1:7035/med`
- Réseau : `http://<ip-du-serveur>:7035/med`

Un seul port : l'interface React est servie par le backend sous
`/med/` (`/med/`, `/med/assets/**`), et l'API sous `/api/**`.

### Mise à jour

Relancer `Installer-GS-Hopital.cmd` avec le nouveau paquet : la
configuration, les journaux et `uploads\` sont conservés.

### Désinstallation

`Desinstaller-GS-Hopital.cmd` — les données sont conservées par défaut
(`-RemoveData` pour tout supprimer).

## Apache (frontend statique)

Si l'interface est servie par Apache au lieu du jar :

1. copier le contenu de `frontend-vite\dist` dans le dossier web
   `/med` (ex. `C:\Apache24\htdocs\med`)
2. activer `mod_rewrite` et `AllowOverride All` sur ce dossier
3. le fichier `public\.htaccess` est inclus dans le build : il gère
   les routes React (F5), le cache et la compression
4. proxifier `/api` vers le backend : `http://127.0.0.1:7035/api`

## Linux (déploiement historique)

`deploy.sh` à la racine concerne l'ancien frontend Next.js
(`frontend/`). Il n'est pas utilisé par le paquet Windows.
