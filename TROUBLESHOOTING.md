# Guide de Résolution des Problèmes - SecurePDF Viewer

## 🐛 Problèmes Courants et Solutions

### 1. "Créer un document d'exemple" ne fonctionne pas

**Symptômes :**
- Le bouton ne répond pas
- Aucun document n'apparaît
- Erreurs dans la console du navigateur

**Solutions :**

1. **Ouvrir la console du navigateur** (F12) pour voir les erreurs détaillées
2. **Vérifier JavaScript** - Le viewer utilise du JavaScript vanilla, assurez-vous qu'il est activé
3. **Recharger la page** et réessayer

**Test rapide :**
```html
<!-- Ouvrez la console et tapez: -->
createSampleDocument();
```

### 2. Le contenu du document n'apparaît pas correctement

**Causes possibles :**
- Contenu encodé en base64 (normal pour les vrais documents SPDF)
- Problème de rendu CSS
- Données corrompues

**Solutions :**

1. **Pour les documents générés par le système :**
   ```bash
   node examples/generate-sample.js
   ```
   Puis utiliser le bouton "Charger fichier d'exemple"

2. **Vérification du format :**
   - Les documents SPDF chiffrent le contenu
   - Le viewer décode automatiquement le base64
   - Vérifiez que `element.content` existe

### 3. Impossible de charger un fichier SPDF

**Symptômes :**
- "Format SPDF invalide"
- Fichier non reconnu

**Vérifications :**

1. **Structure JSON valide :**
   ```json
   {
     "spdf": { "version": "1.0.0", ... },
     "metadata": { ... },
     "security": { ... },
     "content": { "pages": [...] }
   }
   ```

2. **Extension de fichier :**
   - `.spdf` ou `.json` acceptés
   - Contenu doit être du JSON valide

### 4. Permissions du document

**Si les permissions ne fonctionnent pas :**
- `copy: false` → Le texte ne peut pas être sélectionné
- `print: false` → L'impression est désactivée (dépend du navigateur)
- Vérifiez `document.metadata.permissions`

### 5. Problèmes de sécurité

**Certificats et signatures :**
- Le viewer demo utilise des certificats factices
- En production, utilisez de vrais certificats PKI
- La validation complète nécessite le package `@secure-pdf/validator`

## 🔧 Outils de Débogage

### Console du Navigateur

Activez le mode développeur (F12) et vérifiez :

```javascript
// Vérifier que les fonctions existent
console.log(typeof createSampleDocument); // doit retourner "function"
console.log(typeof renderDocument);       // doit retourner "function"

// Vérifier le document actuel
console.log(currentDocument);

// Tester le rendu manuellement
if (currentDocument) {
    renderDocument(currentDocument);
}
```

### Validation des Données

```javascript
// Vérifier la structure d'un document
function validateSpdfStructure(doc) {
    const required = ['spdf', 'metadata', 'security', 'content'];
    for (const field of required) {
        if (!doc[field]) {
            console.error(`Champ manquant: ${field}`);
            return false;
        }
    }
    
    if (!doc.content.pages || doc.content.pages.length === 0) {
        console.error('Aucune page trouvée');
        return false;
    }
    
    return true;
}
```

### Test de Décodage Base64

```javascript
// Tester le décodage d'un contenu
function testDecode(content) {
    try {
        const decoded = atob(content);
        console.log('Original:', content);
        console.log('Décodé:', decoded);
        return decoded;
    } catch (e) {
        console.log('Pas du base64 valide:', e);
        return content;
    }
}
```

## 🚀 Générer des Documents de Test

### Via Node.js (recommandé)

```bash
# Compiler le projet
npm run build

# Générer un document d'exemple
node examples/generate-sample.js

# Le fichier sera créé : examples/exemple-document.json
```

### Via le Code Directement

```javascript
// Document minimal pour test
const testDoc = {
    spdf: {
        version: "1.0.0",
        created: new Date().toISOString(),
        id: "test-doc"
    },
    metadata: {
        title: "Test Simple",
        author: "Test",
        subject: "Test",
        keywords: [],
        permissions: { print: true, copy: true, modify: false, annotate: false }
    },
    security: {
        encryption: { algorithm: "AES-256-GCM", key_derivation: "PBKDF2", salt: "test", iterations: 100000 },
        signature: { algorithm: "RSA-PSS", hash_algorithm: "SHA3-256", certificate: "test", signature: "test", timestamp: new Date().toISOString() },
        content_hashes: { text: "test", images: [], forms: "test" }
    },
    content: {
        pages: [{
            id: "page-1",
            width: 595.28,
            height: 841.89,
            elements: [{
                type: "text",
                id: "text-1",
                x: 72, y: 720, width: 400, height: 20,
                content: "Hello World!",
                style: { font: "Arial", size: 12, color: "#000000", bold: false, italic: false }
            }]
        }]
    },
    audit_trail: [{
        timestamp: new Date().toISOString(),
        action: "created",
        user: "test",
        previous_hash: null,
        hash: "test"
    }]
};

// Utiliser ce document
currentDocument = testDoc;
renderDocument(testDoc);
```

## 📞 Support et Aide

1. **Vérifiez les logs de la console** pour des erreurs détaillées
2. **Utilisez les documents d'exemple générés** pour tester
3. **Consultez la spécification SPDF** pour la structure correcte
4. **Testez avec des données minimales** avant d'utiliser des documents complexes

---

**Le viewer SecurePDF fonctionne maintenant correctement !** 

Les corrections apportées :
- ✅ Gestion d'erreurs améliorée
- ✅ Décodage automatique du base64
- ✅ Génération de fichiers d'exemple
- ✅ Outils de débogage intégrés
