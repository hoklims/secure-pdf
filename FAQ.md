# FAQ - SecurePDF (SPDF)

## ❓ Questions Générales

### Qu'est-ce que SecurePDF (SPDF) ?

SecurePDF est un format de document sécurisé conçu pour remplacer le PDF traditionnel avec des fonctionnalités de sécurité renforcées. Il utilise un format JSON plutôt que PostScript, ce qui élimine les risques d'exécution de code malveillant.

### Quelle est la différence avec PDF ?

| Caractéristique | PDF | SPDF |
|------------------|-----|------|
| Format de base | PostScript/binaire | JSON |
| Exécution de code | Possible (JavaScript, PostScript) | Impossible |
| Chiffrement | Faible (RC4/AES-128) | Fort (AES-256-GCM) |
| Signatures | Basique | RSA-PSS + SHA-3 |
| Validation | Limitée | Stricte avec schémas |
| Audit | Aucun | Trail blockchain-like |

### SPDF est-il compatible avec PDF ?

Non, SPDF est un format complètement nouveau. Cependant, nous prévoyons :

- **Convertisseurs PDF → SPDF** (extraction sécurisée)
- **Exportation SPDF → PDF** (pour compatibilité)
- **Viewer universel** supportant les deux formats

## 🔧 Utilisation

### Comment créer un document SPDF ?

```javascript
import { SpdfCore } from '@secure-pdf/core';
import { SpdfCrypto } from '@secure-pdf/crypto';

const core = new SpdfCore();
const crypto = new SpdfCrypto();

// Créer un document
const doc = await core.createDocument({
    title: 'Mon Document',
    author: 'John Doe'
});

// Ajouter du contenu
const page = await core.addPage(doc, {
    width: 595.28,
    height: 841.89
});

await core.addText(page, {
    content: 'Hello, SecurePDF!',
    x: 72,
    y: 720,
    style: { font: 'Arial', size: 12 }
});

// Sécuriser le document
const password = 'motdepasse';
const encrypted = await crypto.encrypt(doc, password);
const signed = await crypto.sign(encrypted, certificate, privateKey);

// Sauvegarder
await core.save(signed, 'mon-document.spdf');
```

### Comment lire un document SPDF ?

```javascript
// Charger le document
const encrypted = await core.load('mon-document.spdf');

// Vérifier la signature
const isValid = await crypto.verifySignature(encrypted);
if (!isValid) {
    throw new Error('Signature invalide');
}

// Déchiffrer
const password = 'motdepasse';
const decrypted = await crypto.decrypt(encrypted, password);

// Utiliser le document
console.log(decrypted.metadata.title);
decrypted.content.pages.forEach(page => {
    console.log(`Page ${page.id}: ${page.elements.length} éléments`);
});
```

### Comment visualiser un document SPDF ?

**Option 1: React Component**

```jsx
import { SpdfViewer } from '@secure-pdf/viewer';

function App() {
    return (
        <SpdfViewer 
            documentUrl="/path/to/document.spdf"
            password="motdepasse"
            onError={(error) => console.error(error)}
        />
    );
}
```

**Option 2: HTML Viewer**

Ouvrez `examples/viewer-demo.html` dans votre navigateur et utilisez l'interface pour charger des documents.

## 🔒 Sécurité

### Quels algorithmes cryptographiques sont utilisés ?

**Chiffrement :**

- **AES-256-GCM** : Chiffrement symétrique avec authentification
- **PBKDF2** : Dérivation de clés depuis mot de passe (100,000+ itérations)
- **Sel aléatoire** : Unique pour chaque document

**Signatures numériques :**

- **RSA-PSS** : Signatures avec padding probabiliste
- **SHA-3-256** : Fonction de hachage résistante aux attaques
- **Timestamps** : Horodatage cryptographique

**Intégrité :**

- **SHA-3** : Hash de tous les éléments de contenu
- **Blockchain-like audit trail** : Historique immuable des modifications

### Comment gérer les mots de passe ?

```javascript
// Génération sécurisée
const crypto = new SpdfCrypto();
const strongPassword = crypto.generatePassword(16); // 16 caractères

// Validation de force
const strength = crypto.validatePasswordStrength(password);
if (strength.score < 3) {
    console.warn('Mot de passe trop faible:', strength.feedback);
}

// Stockage sécurisé (ne jamais stocker en plain text)
const hashedPassword = await crypto.hashPassword(password, saltRounds);
```

### Comment vérifier l'intégrité d'un document ?

```javascript
import { SpdfValidator } from '@secure-pdf/validator';

const validator = new SpdfValidator();

// Validation complète
const result = await validator.validate(document);

if (result.isValid) {
    console.log('Document valide');
    console.log('Score de sécurité:', result.securityScore);
} else {
    console.error('Erreurs:', result.errors);
    console.warn('Avertissements:', result.warnings);
}
```

## 🏗️ Développement

### Comment contribuer au projet ?

1. **Fork le repository**
2. **Créer une branche** : `git checkout -b feature/ma-fonctionnalite`
3. **Installer les dépendances** : `npm install`
4. **Développer avec les standards de sécurité**
5. **Tester** : `npm test`
6. **Soumettre une PR**

### Structure du projet

```
next-pdf/
├── packages/
│   ├── core/           # Parser et générateur SPDF
│   ├── crypto/         # Opérations cryptographiques
│   ├── validator/      # Validation et vérifications
│   └── viewer/         # Viewer React
├── examples/           # Exemples et démos
├── spec/              # Spécification SPDF
└── docs/              # Documentation
```

### Comment exécuter les tests ?

```bash
# Tests de toutes les packages
npm test

# Tests d'une package spécifique
npm test -- --filter=@secure-pdf/core

# Tests avec couverture
npm run test:coverage

# Tests de sécurité (fuzzing)
npm run test:security
```

### Comment compiler le projet ?

```bash
# Compilation complète
npm run build

# Mode développement avec watch
npm run dev

# Nettoyage
npm run clean
```

## 🚀 Production

### Déploiement du viewer

**Vite Build :**

```bash
cd packages/viewer
npm run build
# Fichiers dans dist/
```

**Integration HTML :**

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/dist/viewer.css">
</head>
<body>
    <div id="spdf-viewer"></div>
    <script src="/dist/viewer.js"></script>
    <script>
        const viewer = new SpdfViewer('#spdf-viewer');
        viewer.loadDocument('/documents/example.spdf');
    </script>
</body>
</html>
```

### Configuration serveur

**Headers de sécurité recommandés :**

```nginx
# Nginx configuration
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";

# SPDF MIME type
location ~* \.spdf$ {
    add_header Content-Type "application/spdf+json";
    add_header Content-Disposition "inline";
}
```

### Performance

**Optimisations recommandées :**

- **Lazy loading** des pages pour documents volumineux
- **Worker threads** pour le déchiffrement
- **Cache des certificats** validés
- **Compression gzip** pour le transport

## 🔍 Dépannage

### Erreurs courantes

**"Document SPDF invalide" :**

- Vérifiez la structure JSON
- Validez avec `SpdfValidator`
- Vérifiez la version SPDF supportée

**"Impossible de déchiffrer" :**

- Mot de passe incorrect
- Document corrompu
- Algorithme non supporté

**"Signature invalide" :**

- Certificat expiré
- Document modifié
- Horloge système incorrecte

### Logs de débogage

```javascript
// Activer les logs détaillés
process.env.SPDF_DEBUG = 'true';

// Niveaux de log
const logger = SpdfCore.getLogger();
logger.setLevel('debug'); // error, warn, info, debug, trace
```

### Support

- **Issues GitHub** : [github.com/secure-pdf/next-pdf/issues](https://github.com/secure-pdf/next-pdf/issues)
- **Documentation** : [secure-pdf.org/docs](https://secure-pdf.org/docs)
- **Security** : security@secure-pdf.org

---

**Version actuelle :** 1.0.0  
**Dernière mise à jour :** ${new Date().toLocaleDateString('fr-FR')}
