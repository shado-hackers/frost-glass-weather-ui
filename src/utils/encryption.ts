import nacl from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64,
} from 'tweetnacl-util';

/**
 * ChaCha20-Poly1305 encryption utilities for securing sensitive data
 * Uses TweetNaCl's secretbox (XSalsa20-Poly1305, similar to ChaCha20-Poly1305)
 */

// Generate a random encryption key (32 bytes for ChaCha20)
export const generateEncryptionKey = (): Uint8Array => {
  return nacl.randomBytes(32);
};

// Generate a random nonce (24 bytes for XSalsa20)
export const generateNonce = (): Uint8Array => {
  return nacl.randomBytes(24);
};

/**
 * Encrypt data using ChaCha20-Poly1305
 * @param data - Plain text data to encrypt
 * @param key - 32-byte encryption key
 * @returns Base64 encoded encrypted data with nonce prepended
 */
export const encryptData = (data: string, key: Uint8Array): string => {
  const nonce = generateNonce();
  const messageUint8 = decodeUTF8(data);
  const encrypted = nacl.secretbox(messageUint8, nonce, key);
  
  // Prepend nonce to encrypted data
  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);
  
  return encodeBase64(fullMessage);
};

/**
 * Decrypt data using ChaCha20-Poly1305
 * @param encryptedData - Base64 encoded encrypted data with nonce
 * @param key - 32-byte encryption key
 * @returns Decrypted plain text or null if decryption fails
 */
export const decryptData = (encryptedData: string, key: Uint8Array): string | null => {
  try {
    const fullMessage = decodeBase64(encryptedData);
    
    // Extract nonce and ciphertext
    const nonce = fullMessage.slice(0, 24);
    const ciphertext = fullMessage.slice(24);
    
    const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
    
    if (!decrypted) {
      return null;
    }
    
    return encodeUTF8(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

/**
 * Generate a cryptographic signature using Ed25519
 * @param message - Message to sign
 * @param secretKey - 64-byte secret key (use nacl.sign.keyPair() to generate)
 * @returns Base64 encoded signature
 */
export const generateSignature = (message: string, secretKey: Uint8Array): string => {
  const messageUint8 = decodeUTF8(message);
  const signature = nacl.sign.detached(messageUint8, secretKey);
  return encodeBase64(signature);
};

/**
 * Verify a cryptographic signature using Ed25519
 * @param message - Original message
 * @param signature - Base64 encoded signature
 * @param publicKey - 32-byte public key
 * @returns true if signature is valid
 */
export const verifySignature = (
  message: string,
  signature: string,
  publicKey: Uint8Array
): boolean => {
  try {
    const messageUint8 = decodeUTF8(message);
    const signatureUint8 = decodeBase64(signature);
    return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKey);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

/**
 * Generate a key pair for signing (Ed25519)
 * @returns Object with publicKey and secretKey
 */
export const generateKeyPair = () => {
  return nacl.sign.keyPair();
};

/**
 * Store encryption key securely in sessionStorage (base64 encoded)
 * Note: For production, consider using more secure key management
 */
export const storeKey = (key: Uint8Array, keyId: string = 'encryptionKey'): void => {
  sessionStorage.setItem(keyId, encodeBase64(key));
};

/**
 * Retrieve encryption key from sessionStorage
 */
export const retrieveKey = (keyId: string = 'encryptionKey'): Uint8Array | null => {
  const keyString = sessionStorage.getItem(keyId);
  if (!keyString) return null;
  return decodeBase64(keyString);
};

/**
 * Clear stored encryption key
 */
export const clearKey = (keyId: string = 'encryptionKey'): void => {
  sessionStorage.removeItem(keyId);
};
