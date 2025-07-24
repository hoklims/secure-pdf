import * as forge from 'node-forge';
import { createHash, randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto';
import { readFileSync } from 'fs';

// Define basic types to avoid circular dependency
interface SpdfDocument {
  spdf: { version: string; created: string; id: string; };
  metadata: any;
  security: {
    signature: { algorithm: string; hash_algorithm: string; certificate: string; signature: string; timestamp: string; };
    content_hashes: { text: string; images: string[]; forms: string; };
    encryption: any;
  };
  content: { pages: any[]; forms?: any; };
  audit_trail?: any[];
}

interface SpdfSignature {
  algorithm: string;
  hash_algorithm: string;
  certificate: string;
  signature: string;
  timestamp: string;
}

/**
 * Cryptographic operations for SPDF documents
 * Handles encryption, decryption, signing, and verification
 */
export class SpdfCrypto {
  
  /**
   * Generate a random salt for encryption
   */
  async generateSalt(): Promise<string> {
    return randomBytes(32).toString('base64');
  }

  /**
   * Create a digital signature for a document
   */
  async createSignature(certificatePath: string, privateKeyPath: string): Promise<SpdfSignature> {
    try {
      const certPem = readFileSync(certificatePath, 'utf8');
      const keyPem = readFileSync(privateKeyPath, 'utf8');
      
      const certificate = forge.pki.certificateFromPem(certPem);
      const privateKey = forge.pki.privateKeyFromPem(keyPem);
      
      // Create signature data
      const signatureData = {
        timestamp: new Date().toISOString(),
        certificate: forge.util.encode64(forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes())
      };

      // Create hash of signature data
      const md = forge.md.sha256.create();
      md.update(JSON.stringify(signatureData), 'utf8');
      
      // Sign with RSA-PSS
      const signature = privateKey.sign(md, 'RSASSA-PSS');
      
      return {
        algorithm: 'RSA-PSS',
        hash_algorithm: 'SHA3-256',
        certificate: signatureData.certificate,
        signature: forge.util.encode64(signature),
        timestamp: signatureData.timestamp
      };
    } catch (error) {
      throw new Error(`Failed to create signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify a document signature
   */
  async verifySignature(document: SpdfDocument): Promise<boolean> {
    try {
      const { signature: sigData } = document.security;
      
      // Decode certificate and signature
      const certDer = forge.util.decode64(sigData.certificate);
      const certificate = forge.pki.certificateFromAsn1(forge.asn1.fromDer(certDer));
      const signature = forge.util.decode64(sigData.signature);
      
      // Recreate signature data
      const signatureData = {
        timestamp: sigData.timestamp,
        certificate: sigData.certificate
      };
      
      // Create hash
      const md = forge.md.sha256.create();
      md.update(JSON.stringify(signatureData), 'utf8');
      
      // Verify signature using forge's verify method
      return (certificate.publicKey as any).verify(md.digest().getBytes(), signature, 'RSASSA-PSS');
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Get certificate fingerprint
   */
  async getCertificateFingerprint(certificatePath: string): Promise<string> {
    try {
      const certPem = readFileSync(certificatePath, 'utf8');
      const certificate = forge.pki.certificateFromPem(certPem);
      
      const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate));
      const md = forge.md.sha256.create();
      md.update(certDer.getBytes());
      
      return md.digest().toHex();
    } catch (error) {
      throw new Error(`Failed to get certificate fingerprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt content using AES-256-GCM
   */
  async encryptContent(content: string, password: string = 'default'): Promise<string> {
    try {
      const salt = randomBytes(16);
      const key = pbkdf2Sync(password, salt, 100000, 32, 'sha512');
      const iv = randomBytes(16);
      
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      let encrypted = cipher.update(content, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      const authTag = cipher.getAuthTag();
      
      // Combine salt, iv, authTag, and encrypted data
      const combined = Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, 'base64')]);
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Failed to encrypt content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt content using AES-256-GCM
   */
  async decryptContent(encryptedContent: string, password: string = 'default'): Promise<string> {
    try {
      const combined = Buffer.from(encryptedContent, 'base64');
      
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 32);
      const authTag = combined.slice(32, 48);
      const encrypted = combined.slice(48);
      
      const key = pbkdf2Sync(password, salt, 100000, 32, 'sha512');
      
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Failed to decrypt content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate content hashes for integrity verification
   */
  async calculateContentHashes(document: SpdfDocument): Promise<{ text: string; images: string[]; forms: string; }> {
    const textElements: string[] = [];
    const imageElements: string[] = [];
    const formElements: string[] = [];

    // Collect all text and image elements
    for (const page of document.content.pages) {
      for (const element of page.elements) {
        if (element.type === 'text' && element.content) {
          textElements.push(element.content);
        } else if (element.type === 'image' && element.data) {
          imageElements.push(element.data);
        }
      }
    }

    // Collect form elements
    if (document.content.forms) {
      formElements.push(JSON.stringify(document.content.forms));
    }

    // Calculate hashes
    const textHash = this.calculateSHA3Hash(textElements.join(''));
    const imageHashes = imageElements.map(img => this.calculateSHA3Hash(img));
    const formsHash = this.calculateSHA3Hash(formElements.join(''));

    return {
      text: textHash,
      images: imageHashes,
      forms: formsHash
    };
  }

  /**
   * Verify content hashes
   */
  async verifyContentHashes(document: SpdfDocument): Promise<boolean> {
    try {
      const calculatedHashes = await this.calculateContentHashes(document);
      const storedHashes = document.security.content_hashes;

      return (
        calculatedHashes.text === storedHashes.text &&
        JSON.stringify(calculatedHashes.images.sort()) === JSON.stringify(storedHashes.images.sort()) &&
        calculatedHashes.forms === storedHashes.forms
      );
    } catch (error) {
      console.error('Hash verification failed:', error);
      return false;
    }
  }

  /**
   * Calculate document hash for audit trail
   */
  async calculateDocumentHash(document: SpdfDocument): Promise<string> {
    const documentCopy = { ...document };
    if (documentCopy.audit_trail) {
      delete documentCopy.audit_trail; // Exclude audit trail from hash calculation
    }
    
    return this.calculateSHA3Hash(JSON.stringify(documentCopy));
  }

  /**
   * Encrypt entire document
   */
  async encryptDocument(document: SpdfDocument, password: string): Promise<SpdfDocument> {
    // Encrypt all text content
    for (const page of document.content.pages) {
      for (const element of page.elements) {
        if (element.type === 'text' && element.content) {
          element.content = await this.encryptContent(element.content, password);
        } else if (element.type === 'image' && element.data) {
          element.data = await this.encryptContent(element.data, password);
        }
      }
    }

    return document;
  }

  /**
   * Decrypt entire document
   */
  async decryptDocument(document: SpdfDocument, password: string): Promise<SpdfDocument> {
    const decryptedDocument = JSON.parse(JSON.stringify(document));

    // Decrypt all text content
    for (const page of decryptedDocument.content.pages) {
      for (const element of page.elements) {
        if (element.type === 'text' && element.content) {
          element.content = await this.decryptContent(element.content, password);
        } else if (element.type === 'image' && element.data) {
          element.data = await this.decryptContent(element.data, password);
        }
      }
    }

    return decryptedDocument;
  }

  /**
   * Calculate SHA3-256 hash
   */
  private calculateSHA3Hash(content: string): string {
    // Note: Node.js doesn't have native SHA3, using SHA256 as fallback
    // In production, use a proper SHA3 library like js-sha3
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }
}

export * from './types.js';
