# 🤖 Configuration de l'Assistant Vocal "Gaston"

## ✅ État Actuel

- ✅ **Page Admin** : Fonctionne (`http://localhost:3000/admin/assistant`)
- ✅ **Widget** : Visible en bas à droite de toutes les pages
- ❌ **Credentials Google Cloud** : Non configurées
- ❌ **Variables d'environnement** : Manquantes

## 🔧 Configuration Requise

### Étape 1 : Obtenir les Credentials Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez ou créez un projet
3. Activez l'API **Vertex AI**
4. Créez un **Service Account** :
   - IAM & Admin → Service Accounts → Create Service Account
   - Nom: "vertex-ai-assistant"
   - Rôle: "Vertex AI User"
5. Créez une clé JSON :
   - Cliquez sur le service account créé
   - Keys → Add Key → Create new key → JSON
   - Téléchargez le fichier

### Étape 2 : Placer le Fichier de Credentials

Renommez le fichier téléchargé et placez-le ici :
```
/Users/vladimirpaun/Documents/JD Conseil/ReneOltra/testWebSiteReneOltra/frontend/google-credentials.json
```

**Alternative** : Copiez le contenu de votre fichier dans `google-credentials.json.template` et renommez-le en `google-credentials.json`

### Étape 3 : Configurer les Variables d'Environnement

Ouvrez le fichier `.env` et ajoutez :

```env
# Google Cloud / Vertex AI
GOOGLE_APPLICATION_CREDENTIALS=/Users/vladimirpaun/Documents/JD Conseil/ReneOltra/testWebSiteReneOltra/frontend/google-credentials.json
GCP_PROJECT_ID=votre-project-id
GCP_LOCATION=us-central1
```

> **Note** : Remplacez `votre-project-id` par l'ID réel de votre projet (visible dans le fichier JSON)

### Étape 4 : Redémarrer le Serveur

```bash
# Arrêter le serveur actuel (Ctrl+C dans le terminal)
# Puis relancer :
make dev
```

## 🎯 Fonctionnalités Disponibles

### Page d'Administration (`/admin/assistant`)

![Admin UI](/Users/vladimirpaun/.gemini/antigravity/brain/ef081ca7-4fa3-4287-981a-dfb54aaf8eb8/admin_assistant_page_1764168153309.png)

1. **Instruction Système** : Modifiez le prompt système de "Gaston"
2. **Upload de Documents** : Ajoutez des FAQ, CGV, etc. pour la base de connaissances

### Widget de Discussion

- **Icône flottante** en bas à droite
- **Mode texte** : Tapez vos questions
- **Mode vocal** : Cliquez sur le micro pour parler (reconnaissance vocale en français)
- **Réponses audio** : Gaston répond en voix de synthèse française

### Outils Automatiques

L'assistant peut :
- ✅ Vérifier la **disponibilité** des hébergements (appel à la BDD)
- ✅ Donner les **horaires** des services du camping
- ⏳ Rechercher dans la **base de connaissances** (après upload de documents)

## 🔍 Vérification

Une fois configuré, testez :

1. Ouvrez le widget (clic sur la bulle bleue)
2. Posez une question : "Est-ce qu'il y a de la place du 1er au 5 juillet ?"
3. L'assistant devrait appeler l'API et répondre avec les disponibilités réelles

## 🚨 Sécurité

- ✅ Le fichier `google-credentials.json` est **déjà dans .gitignore**
- ⚠️ Ne commitez **JAMAIS** ce fichier sur Git
- ⚠️ Ne partagez **JAMAIS** vos credentials

## 📞 Support

En cas de problème :
- Vérifiez les logs du serveur (terminal)
- Vérifiez la console du navigateur (F12)
- L'erreur 500 actuelle est normale : elle disparaîtra une fois les credentials configurés
