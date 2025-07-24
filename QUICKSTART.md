# Guide de Démarrage Rapide - SecurePDF

## 🚀 Démarrage Immédiat

### 1. Compilation du Projet

```bash
npm run build
```

### 2. Test Rapide

```bash
node examples/simple-test.js
```

### 3. Démonstration du Viewer

Ouvrez `examples/viewer-demo.html` dans votre navigateur ou utilisez la tâche VS Code "Open Viewer Demo".

## 📋 Tâches VS Code Disponibles

- **Build SecurePDF** : Compile tous les packages
- **Dev SecurePDF** : Mode développement avec watch
- **Run Demo** : Exécute le test de démonstration
- **Open Viewer Demo** : Ouvre le viewer dans le navigateur

## 🏗️ Architecture du Projet

```
secure-pdf/
├── packages/
│   ├── core/          # ✅ Parser/générateur SPDF
│   ├── crypto/        # ✅ Opérations cryptographiques
│   ├── validator/     # ✅ Validation et sécurité
│   └── viewer/        # ✅ Viewer React (compilé)
├── spec/              # ✅ Spécifications SPDF
├── examples/          # ✅ Exemples et démos
└── .github/           # ✅ Instructions Copilot
```

## 🔧 Utilisation Rapide

### Création d'un Document

```javascript
import { SpdfCore } from '@secure-pdf/core';

const core = new SpdfCore();
const doc = await core.createDocument({
  title: 'Mon Document',
  author: 'Moi',
  certificatePath: './cert.pem',
  privateKeyPath: './key.pem'
});

const page = core.addPage(doc);
await core.addTextElement(page, 'Hello SecurePDF!', 72, 720);

const spdfData = await core.serializeDocument(doc, 'password');
```

### Lecture d'un Document

```javascript
const document = await core.parseDocument(spdfData);
const decrypted = await core.decryptDocument(document, 'password');
```

## 🛡️ Fonctionnalités de Sécurité

- ✅ **Chiffrement AES-256-GCM** - Contenu chiffré end-to-end
- ✅ **Signatures RSA-PSS** - Authentification par certificat
- ✅ **Validation stricte** - Schema JSON sécurisé
- ✅ **Audit trail** - Historique des modifications
- ✅ **Permissions** - Contrôle d'accès granulaire
- ✅ **Pas de code** - Aucune exécution arbitraire

## 📊 Status du Projet

| Component | Status | Description |
|-----------|--------|-------------|
| Core | ✅ Fonctionnel | Parser/générateur SPDF |
| Crypto | ✅ Fonctionnel | Chiffrement et signatures |
| Validator | ✅ Fonctionnel | Validation de sécurité |
| Viewer | ✅ Fonctionnel | Interface React compilée |
| Specs | ✅ Complet | Documentation format SPDF |
| Demo | ✅ Fonctionnel | Tests et exemples |

## 🎯 Prochaines Étapes

1. **Tests** : Ajouter une suite de tests complète
2. **WebAssembly** : Parser haute performance
3. **CLI** : Outils en ligne de commande
4. **Intégrations** : Plugins pour éditeurs
5. **Mobile** : Applications natives

## 🔗 Liens Utiles

- [Spécification SPDF](./spec/SPDF-Specification.md)
- [Exemples](./examples/)
- [Demo Viewer](./examples/viewer-demo.html)

## ⚡ Commandes Rapides

```bash
# Compilation
npm run build

# Test fonctionnel
node examples/simple-test.js

# Mode développement
npm run dev

# Formatage du code
npm run format
```

---

**SecurePDF est maintenant prêt à l'emploi !** 🎉

Le projet implémente un format de document sécurisé complet avec :
- Architecture modulaire TypeScript
- Sécurité renforcée par design
- Viewer web fonctionnel
- Exemples et documentation
- Configuration VS Code optimisée
