/**
 * SPDF Document Type Definitions
 */

export interface SpdfDocument {
  spdf: {
    version: string;
    created: string;
    id: string;
  };
  metadata: {
    title: string;
    author: string;
    subject: string;
    keywords: string[];
    permissions: {
      print: boolean;
      copy: boolean;
      modify: boolean;
      annotate: boolean;
    };
  };
  security: {
    encryption: {
      algorithm: string;
      key_derivation: string;
      salt: string;
      iterations: number;
    };
    signature: {
      algorithm: string;
      hash_algorithm: string;
      certificate: string;
      signature: string;
      timestamp: string;
    };
    content_hashes: {
      text: string;
      images: string[];
      forms: string;
    };
  };
  content: {
    pages: SpdfPage[];
    forms?: {
      fields: SpdfFormField[];
    };
  };
  audit_trail: SpdfAuditEntry[];
}

export interface SpdfPage {
  id: string;
  width: number;
  height: number;
  elements: SpdfElement[];
}

export interface SpdfElement {
  type: 'text' | 'image' | 'form';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // Encrypted content for text
  data?: string; // Encrypted data for images
  format?: 'PNG' | 'JPEG' | 'WebP';
  alt?: string;
  style?: {
    font: string;
    size: number;
    color: string;
    bold: boolean;
    italic: boolean;
  };
}

export interface SpdfFormField {
  id: string;
  type: 'text' | 'checkbox' | 'radio' | 'select';
  name: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  validation: {
    type: string;
    max_length?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface SpdfAuditEntry {
  timestamp: string;
  action: string;
  user: string;
  previous_hash: string | null;
  hash: string;
}

export interface SpdfCreateOptions {
  title: string;
  author: string;
  subject?: string;
  keywords?: string[];
  certificatePath: string;
  privateKeyPath: string;
  password?: string;
}
