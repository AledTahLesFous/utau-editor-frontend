# UTAU editor

## fonctionnalités : 
- creation de compte via github
- editeur utau like :
    - tempo
    - voicebanks
    - status projet
    - phonemes
    - hauteurs/note MIDI
    - tags  
- notification wbesocket
- Recherche de projet avec meilisearch
- Upload de fichier pour photo de profil / photo illustration projet

## Build & Run

Run backend (apres avoir build les extensions) :
```
cd backend
npm install
npx directus start
```
Run frontend :
```
cd frontend
npm install
npm run start
```
Build les extensions (a faire 3 fois) :
```
cd backend/extensions/<extension>
npm run build
```

