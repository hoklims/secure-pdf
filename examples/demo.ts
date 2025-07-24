import { SpdfCore } from '@secure-pdf/core';
import fs from 'fs/promises';
import path from 'path';

/**
 * Example: Creating a secure SPDF document
 */
async function createSampleDocument() {
  const core = new SpdfCore();

  try {
    // Create a new document
    const document = await core.createDocument({
      title: 'Sample Secure Document',
      author: 'John Doe',
      subject: 'Demonstration of SPDF format',
      keywords: ['secure', 'pdf', 'demo'],
      certificatePath: './certificates/cert.pem',
      privateKeyPath: './certificates/private.key'
    });

    // Add a page
    const page = core.addPage(document, 595.28, 841.89); // A4 size

    // Add text elements
    await core.addTextElement(page, 'Secure Document Demo', 72, 720, {
      font: 'Arial',
      size: 24,
      color: '#000000',
      bold: true
    });

    await core.addTextElement(
      page,
      'This document demonstrates the SecurePDF format with enhanced security features.',
      72,
      680,
      {
        font: 'Arial',
        size: 12,
        color: '#333333'
      }
    );

    await core.addTextElement(
      page,
      'Key features:\n• Cryptographic signatures\n• End-to-end encryption\n• Content validation\n• Audit trail',
      72,
      600,
      {
        font: 'Arial',
        size: 11,
        color: '#666666'
      }
    );

    // Load and add an image (if available)
    try {
      const imagePath = path.join(process.cwd(), 'examples', 'sample-image.png');
      const imageBuffer = await fs.readFile(imagePath);
      await core.addImageElement(page, imageBuffer, 'PNG', 72, 400, 200, 100, 'Sample image');
    } catch (error) {
      console.log('Sample image not found, skipping image element');
    }

    // Serialize the document
    const spdfData = await core.serializeDocument(document, 'demo-password');

    // Save to file
    const outputPath = path.join(process.cwd(), 'examples', 'sample-document.spdf');
    await fs.writeFile(outputPath, spdfData, 'utf-8');

    console.log('✅ Sample document created successfully!');
    console.log(`📄 Document saved to: ${outputPath}`);
    console.log(`🔐 Password: demo-password`);

    return { document, spdfData, outputPath };
  } catch (error) {
    console.error('❌ Error creating document:', error.message);
    throw error;
  }
}

/**
 * Example: Loading and validating an SPDF document
 */
async function loadAndValidateDocument(filePath: string, password: string) {
  const core = new SpdfCore();

  try {
    // Read the SPDF file
    const spdfData = await fs.readFile(filePath, 'utf-8');

    // Parse and validate the document
    const document = await core.parseDocument(spdfData);

    // Decrypt the document
    const decryptedDocument = await core.decryptDocument(document, password);

    console.log('✅ Document loaded and validated successfully!');
    console.log(`📋 Title: ${decryptedDocument.metadata.title}`);
    console.log(`👤 Author: ${decryptedDocument.metadata.author}`);
    console.log(`📅 Created: ${decryptedDocument.spdf.created}`);
    console.log(`📑 Pages: ${decryptedDocument.content.pages.length}`);
    console.log(`🔒 Encryption: ${decryptedDocument.security.encryption.algorithm}`);
    console.log(`✍️ Signature: ${decryptedDocument.security.signature.algorithm}`);

    // Show audit trail
    console.log('\n📜 Audit Trail:');
    decryptedDocument.audit_trail.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.action} at ${entry.timestamp} by ${entry.user.substring(0, 8)}...`);
    });

    return decryptedDocument;
  } catch (error) {
    console.error('❌ Error loading document:', error.message);
    throw error;
  }
}

/**
 * Example: Generate self-signed certificates for testing
 */
async function generateTestCertificates() {
  // This is a simplified example - in production, use proper certificate generation
  const certificateContent = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK9Z9nJ5N0MA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAlVTMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjUwMTI0MTAwMDAwWhcNMjYwMTI0MTAwMDAwWjBF
MQswCQYDVQQGEwJVUzETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA7J3VkqNzPfGVqNjVj9JE8N7KgV8/Z1oVf5qP3qRr9K8wVqNzPfGVqNjV
j9JE8N7KgV8/Z1oVf5qP3qRr9K8wVqNzPfGVqNjVj9JE8N7KgV8/Z1oVf5qP3qRr
9K8wVqNzPfGVqNjVj9JE8N7KgV8/Z1oVf5qP3qRr9K8wVqNzPfGVqNjVj9JE8N7K
gV8/Z1oVf5qP3qRr9K8wVqNzPfGVqNjVj9JE8N7KgV8/Z1oVf5qP3qRr9K8wVqNz
PfGVqNjVj9JE8N7KgV8/Z1oVf5qP3qRr9K8wVqNzPfGVqNjVj9JE8N7KgV8/Z1oV
f5qP3qRr9K8wVqNzPfGVqNjVj9JE8N7KgV8/Z1oVf5qP3qRr9K8wVwIDAQABo1Aw
TjAdBgNVHQ4EFgQU7J3VkqNzPfGVqNjVj9JE8N7KgV8wHwYDVR0jBBgwFoAU7J3V
kqNzPfGVqNjVj9JE8N7KgV8wDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOC
AQEAyZ8F1K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q
9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q
8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j
7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n
8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K
9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q==
-----END CERTIFICATE-----`;

  const privateKeyContent = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDsndWSo3M98ZWo
2NWP0kTw3sqBXz9nWhV/mo/epGv0rzBWo3M98ZWo2NWP0kTw3sqBXz9nWhV/mo/e
pGv0rzBWo3M98ZWo2NWP0kTw3sqBXz9nWhV/mo/epGv0rzBWo3M98ZWo2NWP0kTw
3sqBXz9nWhV/mo/epGv0rzBWo3M98ZWo2NWP0kTw3sqBXz9nWhV/mo/epGv0rzBW
o3M98ZWo2NWP0kTw3sqBXz9nWhV/mo/epGv0rzBWo3M98ZWo2NWP0kTw3sqBXz9n
WhV/mo/epGv0rzBWo3M98ZWo2NWP0kTw3sqBXz9nWhV/mo/epGv0rzBWo3M98ZWo
2NWP0kTw3sqBXz9nWhV/mo/epGv0rzBWo3M98ZWo2NWP0kTw3sqBXz9nWhV/mo/e
pGv0rzBXAgMBAAECggEBAJvR8P9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q
8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j
7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n
8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K
9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q
9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q
8K9j7Q9n8Q8K9j7Q9n8QECgYEA+zO8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7
Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8
Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9
j7Q9n8Q8K9j7Q9n8QECgYEA8zO8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8
Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9
j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9
n8Q8K9j7Q9n8QCgYEA8zO8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9
j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9
n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8
K9j7Q9n8QECgYEA8zO8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9
n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8
K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7
Q9n8QECgYA8zO8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8
K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7
Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8Q8K9j7Q9n8
Q8K9j7Q9n8==
-----END PRIVATE KEY-----`;

  // Create certificates directory
  const certDir = path.join(process.cwd(), 'certificates');
  await fs.mkdir(certDir, { recursive: true });

  // Write certificate files
  await fs.writeFile(path.join(certDir, 'cert.pem'), certificateContent);
  await fs.writeFile(path.join(certDir, 'private.key'), privateKeyContent);

  console.log('🔐 Test certificates generated successfully!');
  console.log('⚠️  WARNING: These are demo certificates only - DO NOT use in production!');
}

/**
 * Main example runner
 */
async function main() {
  console.log('🚀 SecurePDF (SPDF) Demo');
  console.log('========================');

  try {
    // Generate test certificates
    await generateTestCertificates();

    // Create examples directory
    await fs.mkdir(path.join(process.cwd(), 'examples'), { recursive: true });

    // Create sample document
    console.log('\n📝 Creating sample document...');
    const { outputPath } = await createSampleDocument();

    // Load and validate document
    console.log('\n🔍 Loading and validating document...');
    await loadAndValidateDocument(outputPath, 'demo-password');

    console.log('\n✅ Demo completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Build packages: npm run build');
    console.log('3. Run tests: npm test');
    console.log('4. View the sample document with the SPDF viewer');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
if (process.argv[1]?.endsWith('demo.ts') || process.argv[1]?.endsWith('demo.js')) {
  main().catch(console.error);
}

export { createSampleDocument, loadAndValidateDocument, generateTestCertificates };
