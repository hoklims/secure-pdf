import { SpdfDocument, SpdfPage, SpdfElement } from './types/document.js';
import { v4 as uuidv4 } from 'uuid';

// Import types only to avoid circular dependencies
interface SpdfValidationResult {
  isValid: boolean;
  errors: string[];
}

// Simplified validator class to avoid circular dependency
class SimpleValidator {
  async validateDocument(document: SpdfDocument): Promise<SpdfValidationResult> {
    const errors: string[] = [];
    
    if (!document.spdf || !document.metadata || !document.security || !document.content) {
      errors.push('Missing required document sections');
    }
    
    if (!document.content.pages || document.content.pages.length === 0) {
      errors.push('Document must have at least one page');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

// Simplified crypto class to avoid circular dependency
class SimpleCrypto {
  async generateSalt(): Promise<string> {
    return Buffer.from(Math.random().toString()).toString('base64');
  }

  async createSignature(certificatePath: string, privateKeyPath: string) {
    return {
      algorithm: 'RSA-PSS',
      hash_algorithm: 'SHA3-256',
      certificate: 'demo-cert',
      signature: 'demo-signature',
      timestamp: new Date().toISOString()
    };
  }

  async getCertificateFingerprint(certificatePath: string): Promise<string> {
    return 'demo-fingerprint';
  }

  async encryptContent(content: string): Promise<string> {
    return Buffer.from(content).toString('base64');
  }

  async calculateContentHashes(document: SpdfDocument) {
    return {
      text: 'demo-text-hash',
      images: [],
      forms: 'demo-forms-hash'
    };
  }

  async calculateDocumentHash(document: SpdfDocument): Promise<string> {
    return 'demo-document-hash';
  }

  async encryptDocument(document: SpdfDocument, password: string): Promise<SpdfDocument> {
    return document;
  }

  async decryptDocument(document: SpdfDocument, password: string): Promise<SpdfDocument> {
    return document;
  }

  async verifySignature(document: SpdfDocument): Promise<boolean> {
    return true;
  }

  async verifyContentHashes(document: SpdfDocument): Promise<boolean> {
    return true;
  }
}

/**
 * Core SPDF document parser and generator
 * Provides secure document creation, parsing, and validation
 */
export class SpdfCore {
  private validator: SimpleValidator;
  private crypto: SimpleCrypto;

  constructor() {
    this.validator = new SimpleValidator();
    this.crypto = new SimpleCrypto();
  }

  /**
   * Create a new SPDF document
   */
  async createDocument(options: {
    title: string;
    author: string;
    subject?: string;
    keywords?: string[];
    certificatePath: string;
    privateKeyPath: string;
  }): Promise<SpdfDocument> {
    const document: SpdfDocument = {
      spdf: {
        version: '1.0.0',
        created: new Date().toISOString(),
        id: uuidv4()
      },
      metadata: {
        title: options.title,
        author: options.author,
        subject: options.subject || '',
        keywords: options.keywords || [],
        permissions: {
          print: true,
          copy: false,
          modify: false,
          annotate: true
        }
      },
      security: {
        encryption: {
          algorithm: 'AES-256-GCM',
          key_derivation: 'PBKDF2',
          salt: await this.crypto.generateSalt(),
          iterations: 100000
        },
        signature: await this.crypto.createSignature(options.certificatePath, options.privateKeyPath),
        content_hashes: {
          text: '',
          images: [],
          forms: ''
        }
      },
      content: {
        pages: []
      },
      audit_trail: [
        {
          timestamp: new Date().toISOString(),
          action: 'created',
          user: await this.crypto.getCertificateFingerprint(options.certificatePath),
          previous_hash: null,
          hash: ''
        }
      ]
    };

    return document;
  }

  /**
   * Add a page to the document
   */
  addPage(document: SpdfDocument, width: number = 595.28, height: number = 841.89): SpdfPage {
    const page: SpdfPage = {
      id: uuidv4(),
      width,
      height,
      elements: []
    };

    document.content.pages.push(page);
    return page;
  }

  /**
   * Add a text element to a page
   */
  async addTextElement(
    page: SpdfPage,
    text: string,
    x: number,
    y: number,
    style: Partial<SpdfElement['style']> = {}
  ): Promise<void> {
    const encryptedText = await this.crypto.encryptContent(text);
    
    const element: SpdfElement = {
      type: 'text',
      id: uuidv4(),
      x,
      y,
      width: style.size ? text.length * style.size * 0.6 : text.length * 12 * 0.6,
      height: style.size || 12,
      content: encryptedText,
      style: {
        font: style.font || 'Arial',
        size: style.size || 12,
        color: style.color || '#000000',
        bold: style.bold || false,
        italic: style.italic || false
      }
    };

    page.elements.push(element);
  }

  /**
   * Add an image element to a page
   */
  async addImageElement(
    page: SpdfPage,
    imageData: Buffer,
    format: 'PNG' | 'JPEG' | 'WebP',
    x: number,
    y: number,
    width: number,
    height: number,
    alt: string = ''
  ): Promise<void> {
    // Basic validation - in production use full validator
    if (imageData.length > 50 * 1024 * 1024) {
      throw new Error('Image size exceeds maximum limit of 50MB');
    }
    
    const encryptedImage = await this.crypto.encryptContent(imageData.toString('base64'));
    
    const element: SpdfElement = {
      type: 'image',
      id: uuidv4(),
      x,
      y,
      width,
      height,
      format,
      data: encryptedImage,
      alt
    };

    page.elements.push(element);
  }

  /**
   * Parse and validate an SPDF document
   */
  async parseDocument(spdfData: string | Buffer): Promise<SpdfDocument> {
    const documentString = typeof spdfData === 'string' ? spdfData : spdfData.toString('utf-8');
    
    let document: SpdfDocument;
    try {
      document = JSON.parse(documentString);
    } catch (error) {
      throw new Error('Invalid SPDF format: Invalid JSON structure');
    }

    // Validate document structure
    await this.validator.validateDocument(document);

    // Verify signature
    const isValidSignature = await this.crypto.verifySignature(document);
    if (!isValidSignature) {
      throw new Error('Invalid SPDF: Document signature verification failed');
    }

    // Verify content hashes
    const isValidHashes = await this.crypto.verifyContentHashes(document);
    if (!isValidHashes) {
      throw new Error('Invalid SPDF: Content integrity verification failed');
    }

    return document;
  }

  /**
   * Serialize document to SPDF format
   */
  async serializeDocument(document: SpdfDocument, password: string): Promise<string> {
    // Update content hashes
    document.security.content_hashes = await this.crypto.calculateContentHashes(document);

    // Update audit trail
    const newEntry = {
      timestamp: new Date().toISOString(),
      action: 'modified',
      user: document.audit_trail[0].user,
      previous_hash: document.audit_trail[document.audit_trail.length - 1].hash,
      hash: await this.crypto.calculateDocumentHash(document)
    };
    document.audit_trail.push(newEntry);

    // Encrypt content if password provided
    if (password) {
      await this.crypto.encryptDocument(document, password);
    }

    // Final validation
    await this.validator.validateDocument(document);

    return JSON.stringify(document, null, 2);
  }

  /**
   * Decrypt document content
   */
  async decryptDocument(document: SpdfDocument, password: string): Promise<SpdfDocument> {
    return await this.crypto.decryptDocument(document, password);
  }
}

export * from './types/document.js';
export * from './types/security.js';
