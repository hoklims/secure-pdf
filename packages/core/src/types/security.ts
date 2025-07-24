/**
 * SPDF Security Type Definitions
 */

export interface SpdfSignature {
  algorithm: string;
  hash_algorithm: string;
  certificate: string;
  signature: string;
  timestamp: string;
}

export interface SpdfEncryption {
  algorithm: string;
  key_derivation: string;
  salt: string;
  iterations: number;
}

export interface SpdfContentHashes {
  text: string;
  images: string[];
  forms: string;
}

export interface SpdfCertificate {
  subject: string;
  issuer: string;
  serial_number: string;
  not_before: string;
  not_after: string;
  fingerprint: string;
  public_key: string;
}

export interface SpdfValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SpdfSecurityLevel {
  encryption: 'none' | 'basic' | 'enhanced';
  signature: 'none' | 'basic' | 'extended';
  permissions: 'open' | 'restricted' | 'locked';
}

export interface SpdfTrustAnchor {
  certificate: string;
  trusted: boolean;
  purpose: string[];
}
