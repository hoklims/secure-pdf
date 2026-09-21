# SecurePDF (SPDF) 🔒

An experimental TypeScript prototype for a JSON-based document format, with parsing, validation, cryptographic operations and a React viewer.

> **Status: experimental prototype.** This repository is not a production-ready PDF replacement. The feature list and historical project notes describe intended properties and implementation work, not an independently validated security guarantee. Production use would require a separate security review and validation.

## 🛡️ Key Security Features

- **No Arbitrary Code Execution**: Complete elimination of PostScript, JavaScript, or embedded executables
- **Mandatory Digital Signatures**: RSA-PSS signatures with certificate chains for document authenticity
- **End-to-End Encryption**: AES-256-GCM encryption for document content
- **Content Validation**: Strict validation of all document components using JSON Schema
- **Integrity Verification**: SHA-3 hashes for each document element
- **Audit Trail**: Blockchain-style modification history for document traceability
- **Sandboxed Viewing**: Secure rendering without external code execution

## 🏗️ Architecture

SecurePDF uses a monorepo structure with TypeScript packages:

```
secure-pdf/
├── packages/
│   ├── core/          # Parser and generator (Node.js/TypeScript)
│   ├── viewer/        # React-based web viewer
│   ├── validator/     # Document validation and security checks
│   └── crypto/        # Cryptographic operations
├── spec/              # SPDF format specifications
├── examples/          # Example documents and usage
└── docs/              # Documentation
```

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/hoklims/secure-pdf.git
cd secure-pdf

# Install dependencies
npm install

# Build all packages
npm run build
```

### Creating Your First SPDF Document

```typescript
import { SpdfCore } from '@secure-pdf/core';

const core = new SpdfCore();

// Create a new document
const document = await core.createDocument({
  title: 'My Secure Document',
  author: 'John Doe',
  certificatePath: './cert.pem',
  privateKeyPath: './private.key'
});

// Add a page
const page = core.addPage(document);

// Add content
await core.addTextElement(page, 'Hello, Secure World!', 72, 720, {
  font: 'Arial',
  size: 16,
  bold: true
});

// Serialize with encryption
const spdfData = await core.serializeDocument(document, 'my-password');
```

### Viewing SPDF Documents

```tsx
import { SpdfViewer } from '@secure-pdf/viewer';

function MyApp() {
  return (
    <SpdfViewer
      spdfData={spdfDocument}
      password="my-password"
      width={800}
      height={600}
      onLoad={(doc) => console.log('Document loaded:', doc.metadata.title)}
      onError={(err) => console.error('Error:', err)}
    />
  );
}
```

## 📋 Format Specification

SPDF documents are JSON-based with the following structure:

```json
{
  "spdf": {
    "version": "1.0.0",
    "created": "2025-01-24T10:00:00Z",
    "id": "uuid-v4"
  },
  "metadata": {
    "title": "Document Title",
    "author": "Author Name",
    "permissions": { "print": true, "copy": false }
  },
  "security": {
    "encryption": { "algorithm": "AES-256-GCM" },
    "signature": { "algorithm": "RSA-PSS" },
    "content_hashes": { "text": "sha3-hash", "images": [] }
  },
  "content": {
    "pages": [...]
  },
  "audit_trail": [...]
}
```

See [SPDF Specification](./spec/SPDF-Specification.md) for complete details.

## 🔧 Development

### Prerequisites

- Node.js 18+
- TypeScript 5+
- npm 9+

### Scripts

```bash
# Development
npm run dev          # Start development mode
npm run build        # Build all packages
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code

# Package-specific commands
npm run build --workspace=@secure-pdf/core
npm run test --workspace=@secure-pdf/viewer
```

### Running Examples

```bash
# Run the demo
cd examples
npx tsx demo.ts

# This will:
# 1. Generate test certificates
# 2. Create a sample SPDF document
# 3. Validate and display document info
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific package tests
npm test --workspace=@secure-pdf/core
```

## 📚 API Documentation

### Core Package (`@secure-pdf/core`)

#### SpdfCore

Main class for creating and parsing SPDF documents.

```typescript
const core = new SpdfCore();

// Create document
const doc = await core.createDocument(options);

// Parse document
const parsed = await core.parseDocument(spdfData);

// Add content
const page = core.addPage(doc);
await core.addTextElement(page, text, x, y, style);
await core.addImageElement(page, imageData, format, x, y, w, h);
```

### Viewer Package (`@secure-pdf/viewer`)

#### SpdfViewer Component

React component for rendering SPDF documents.

```tsx
<SpdfViewer
  spdfData={string}           // SPDF document data
  password={string}           // Decryption password
  width={number}              // Viewer width
  height={number}             // Viewer height
  onLoad={(doc) => {}}        // Document loaded callback
  onError={(err) => {}}       // Error callback
/>
```

### Validator Package (`@secure-pdf/validator`)

#### SpdfValidator

Document validation and security checks.

```typescript
const validator = new SpdfValidator();
const result = await validator.validateDocument(document);
// { isValid: boolean, errors: string[] }
```

### Crypto Package (`@secure-pdf/crypto`)

#### SpdfCrypto

Cryptographic operations for SPDF.

```typescript
const crypto = new SpdfCrypto();

// Signatures
const signature = await crypto.createSignature(certPath, keyPath);
const isValid = await crypto.verifySignature(document);

// Encryption
const encrypted = await crypto.encryptContent(content, password);
const decrypted = await crypto.decryptContent(encrypted, password);
```

## 🛡️ Security Considerations

### Certificate Management

- Use proper PKI infrastructure for production
- Validate certificate chains and revocation status
- Store private keys securely (HSM recommended)
- Implement certificate rotation policies

### Password Security

- Use strong passwords for document encryption
- Consider key derivation from multiple factors
- Implement secure password transmission
- Support hardware security modules (HSM)

### Content Validation

- All content is validated against strict schemas
- Image formats are verified by magic bytes
- No executable content is allowed
- Form inputs are sanitized and validated

### Audit Trail

- Immutable modification history
- Cryptographic proof of document timeline
- User identification through certificates
- Tamper detection capabilities

## 🚧 Roadmap

### v1.1.0
- [ ] WebAssembly parser for high performance
- [ ] Advanced form field types
- [ ] Digital annotation support
- [ ] Multi-signature workflows

### v1.2.0
- [ ] Rust-based native parser
- [ ] Mobile viewer applications
- [ ] Cloud-based document services
- [ ] Integration with PKI providers

### v2.0.0
- [ ] Protocol Buffers format support
- [ ] Advanced blockchain integration
- [ ] Zero-knowledge proof signatures
- [ ] Quantum-resistant cryptography

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/secure-pdf.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes and add tests
6. Run tests: `npm test`
7. Commit your changes: `git commit -m 'Add amazing feature'`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Specification](./spec/SPDF-Specification.md)
- [API Documentation](./docs/api.md)
- [Security Guide](./docs/security.md)
- [Examples](./examples/)

## ⚠️ Security Disclosure

If you discover a security vulnerability, please send an email to security@secure-pdf.org. All security vulnerabilities will be promptly addressed.

---

**SecurePDF** - Redefining document security for the modern age. 🔒📄
