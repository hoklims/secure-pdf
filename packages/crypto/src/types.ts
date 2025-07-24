/**
 * Crypto package type definitions
 */

export interface CryptoConfig {
  algorithm: string;
  keySize: number;
  iterations: number;
}

export interface EncryptionResult {
  encrypted: string;
  salt: string;
  iv: string;
  authTag: string;
}

export interface HashResult {
  algorithm: string;
  hash: string;
  timestamp: string;
}
