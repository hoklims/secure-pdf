import { SpdfCore } from '../packages/core/dist/index.js';

/**
 * Simple demo script to test SPDF functionality
 */
async function simpleDemoTest() {
  console.log('🚀 Testing SecurePDF Core Functionality\n');

  try {
    const core = new SpdfCore();

    // Create a new document
    console.log('📝 Creating new SPDF document...');
    const document = await core.createDocument({
      title: 'Test Document',
      author: 'Demo User',
      subject: 'Testing SPDF functionality',
      keywords: ['test', 'demo', 'spdf'],
      certificatePath: './demo-cert.pem',
      privateKeyPath: './demo-key.pem'
    });

    console.log('✅ Document created successfully!');
    console.log(`   Title: ${document.metadata.title}`);
    console.log(`   Author: ${document.metadata.author}`);
    console.log(`   ID: ${document.spdf.id}`);

    // Add a page
    console.log('\n📄 Adding page to document...');
    const page = core.addPage(document, 595.28, 841.89); // A4 size
    console.log(`✅ Page added with ID: ${page.id}`);

    // Add text element
    console.log('\n📝 Adding text element...');
    await core.addTextElement(page, 'Welcome to SecurePDF!', 72, 720, {
      font: 'Arial',
      size: 18,
      color: '#000000',
      bold: true
    });

    await core.addTextElement(
      page,
      'This is a demonstration of the secure document format.',
      72,
      680,
      {
        font: 'Arial',
        size: 12,
        color: '#333333'
      }
    );

    console.log('✅ Text elements added successfully!');

    // Serialize document
    console.log('\n💾 Serializing document...');
    const spdfData = await core.serializeDocument(document, 'demo-password');
    console.log('✅ Document serialized successfully!');
    console.log(`   Document size: ${spdfData.length} characters`);

    // Parse document back
    console.log('\n🔍 Parsing and validating document...');
    const parsedDocument = await core.parseDocument(spdfData);
    console.log('✅ Document parsed and validated successfully!');

    // Decrypt document
    console.log('\n🔓 Decrypting document...');
    const decryptedDocument = await core.decryptDocument(parsedDocument, 'demo-password');
    console.log('✅ Document decrypted successfully!');

    // Display document info
    console.log('\n📊 Document Information:');
    console.log(`   Pages: ${decryptedDocument.content.pages.length}`);
    console.log(`   Elements on page 1: ${decryptedDocument.content.pages[0].elements.length}`);
    console.log(`   Security algorithm: ${decryptedDocument.security.encryption.algorithm}`);
    console.log(`   Signature algorithm: ${decryptedDocument.security.signature.algorithm}`);
    console.log(`   Audit entries: ${decryptedDocument.audit_trail.length}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nSecurePDF is working correctly. Key features demonstrated:');
    console.log('   ✓ Document creation and metadata');
    console.log('   ✓ Page and element management');
    console.log('   ✓ Content encryption/decryption');
    console.log('   ✓ Digital signatures');
    console.log('   ✓ Document serialization/parsing');
    console.log('   ✓ Security validation');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
simpleDemoTest().then(success => {
  if (success) {
    console.log('\n✅ Demo completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Demo failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
