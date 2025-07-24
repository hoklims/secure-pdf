import { SpdfCore } from '../packages/core/dist/index.js';
import { writeFileSync } from 'fs';

/**
 * Générer un fichier SPDF d'exemple pour tester le viewer
 */
async function generateSampleSpdf() {
  console.log('🔧 Génération d\'un fichier SPDF d\'exemple...');

  try {
    const core = new SpdfCore();

    // Créer un document avec plus de contenu
    const document = await core.createDocument({
      title: 'Document Exemple SecurePDF',
      author: 'Générateur de Test',
      subject: 'Démonstration du format SPDF',
      keywords: ['exemple', 'test', 'sécurisé', 'demo'],
      certificatePath: './demo-cert.pem',
      privateKeyPath: './demo-key.pem'
    });

    // Ajouter une page
    const page = core.addPage(document, 595.28, 841.89); // A4

    // Ajouter du contenu varié
    await core.addTextElement(page, 'Document SecurePDF - Exemple', 72, 750, {
      font: 'Arial',
      size: 20,
      color: '#000000',
      bold: true
    });

    await core.addTextElement(page, 'Ceci est un document de démonstration du format SPDF.', 72, 710, {
      font: 'Arial',
      size: 12,
      color: '#333333'
    });

    await core.addTextElement(page, 'Caractéristiques de sécurité :', 72, 670, {
      font: 'Arial',
      size: 14,
      color: '#000000',
      bold: true
    });

    await core.addTextElement(page, '• Chiffrement AES-256-GCM pour le contenu', 90, 640, {
      font: 'Arial',
      size: 11,
      color: '#555555'
    });

    await core.addTextElement(page, '• Signatures numériques RSA-PSS obligatoires', 90, 620, {
      font: 'Arial',
      size: 11,
      color: '#555555'
    });

    await core.addTextElement(page, '• Validation stricte de la structure du document', 90, 600, {
      font: 'Arial',
      size: 11,
      color: '#555555'
    });

    await core.addTextElement(page, '• Audit trail complet des modifications', 90, 580, {
      font: 'Arial',
      size: 11,
      color: '#555555'
    });

    await core.addTextElement(page, '• Aucune exécution de code arbitraire', 90, 560, {
      font: 'Arial',
      size: 11,
      color: '#555555'
    });

    await core.addTextElement(page, 'Avantages du format SPDF :', 72, 520, {
      font: 'Arial',
      size: 14,
      color: '#000000',
      bold: true
    });

    await core.addTextElement(page, 'Contrairement aux formats traditionnels, SPDF empêche l\'injection de code malveillant tout en conservant les fonctionnalités essentielles d\'un document numérique.', 72, 490, {
      font: 'Arial',
      size: 11,
      color: '#666666'
    });

    await core.addTextElement(page, 'Chaque document est signé numériquement et peut être chiffré pour garantir l\'intégrité et la confidentialité.', 72, 460, {
      font: 'Arial',
      size: 11,
      color: '#666666'
    });

    // Sérialiser le document sans mot de passe pour cet exemple
    const spdfData = await core.serializeDocument(document, '');

    // Sauvegarder le fichier
    writeFileSync('examples/exemple-document.spdf', spdfData);
    writeFileSync('examples/exemple-document.json', spdfData); // Pour faciliter le chargement dans le browser

    console.log('✅ Fichier SPDF généré avec succès!');
    console.log('   📁 examples/exemple-document.spdf');
    console.log('   📁 examples/exemple-document.json');
    console.log('   📊 Taille:', spdfData.length, 'caractères');
    console.log('   📄 Pages:', document.content.pages.length);
    console.log('   📝 Éléments:', document.content.pages[0].elements.length);

    // Afficher un aperçu du contenu
    console.log('\n📖 Aperçu du contenu:');
    document.content.pages[0].elements.forEach((element, index) => {
      if (element.type === 'text') {
        console.log(`   ${index + 1}. "${element.content.substring(0, 50)}${element.content.length > 50 ? '...' : ''}"`);
      }
    });

    console.log('\n🎯 Pour tester:');
    console.log('   1. Ouvrez examples/viewer-demo.html');
    console.log('   2. Cliquez sur "Créer un document d\'exemple"');
    console.log('   3. Ou chargez examples/exemple-document.json');

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    return false;
  }
}

// Exécuter la génération
generateSampleSpdf().then(success => {
  if (success) {
    console.log('\n✅ Génération terminée avec succès!');
    process.exit(0);
  } else {
    console.log('\n❌ Génération échouée!');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Erreur inattendue:', error);
  process.exit(1);
});
