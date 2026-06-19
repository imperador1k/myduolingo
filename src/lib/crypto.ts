/**
 * Advanced Multi-Device E2EE Implementation using WebCrypto API
 * Features:
 * - RSA-OAEP for asymmetric key exchange
 * - AES-GCM for symmetric message encryption (Conversation Keys)
 * - PBKDF2 for Zero-Knowledge Key Escrow (PIN-based private key backup)
 */

// ---------------------------------------------------------------------------
// 1. UTILITIES (Base64 & Buffers)
// ---------------------------------------------------------------------------

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export function generateSalt(length = 16): string {
  const salt = window.crypto.getRandomValues(new Uint8Array(length));
  return arrayBufferToBase64(salt.buffer);
}

// ---------------------------------------------------------------------------
// 2. ZERO-KNOWLEDGE KEY ESCROW (PIN Derivation)
// ---------------------------------------------------------------------------

/**
 * Derives a strong AES-GCM key from a user's PIN using PBKDF2.
 */
async function deriveKeyFromPIN(
  pin: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  const saltBuffer = base64ToArrayBuffer(saltBase64);

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts the user's exported Private Key using the AES key derived from their PIN.
 */
export async function encryptPrivateKeyWithPIN(
  exportedPrivateKey: JsonWebKey,
  pin: string,
  saltBase64: string,
): Promise<string> {
  const derivedKey = await deriveKeyFromPIN(pin, saltBase64);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(exportedPrivateKey));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    data,
  );

  // Combine IV and Ciphertext for storage
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypts the Private Key from the server using the user's PIN.
 */
export async function decryptPrivateKeyWithPIN(
  encryptedPayloadBase64: string,
  pin: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const derivedKey = await deriveKeyFromPIN(pin, saltBase64);

  const combined = new Uint8Array(base64ToArrayBuffer(encryptedPayloadBase64));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    ciphertext,
  );

  const dec = new TextDecoder();
  const jwk: JsonWebKey = JSON.parse(dec.decode(decrypted));

  return window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true, // Must be extractable to save locally or re-encrypt
    ["decrypt"],
  );
}

// ---------------------------------------------------------------------------
// 3. MASTER IDENTITY KEYS (RSA-OAEP)
// ---------------------------------------------------------------------------

/**
 * Generates a new RSA-OAEP Key Pair for the user's E2EE Identity.
 */
export async function generateMasterKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"],
  );

  const exportedPublicKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey,
  );
  const exportedPrivateKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey,
  );

  return {
    keyPair,
    publicKeyBase64: arrayBufferToBase64(exportedPublicKey),
    privateKeyJwk: exportedPrivateKey,
  };
}

/**
 * Imports a Base64 SPKI Public Key (from the server) into a CryptoKey.
 */
export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const buffer = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    "spki",
    buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );
}

// ---------------------------------------------------------------------------
// 4. CONVERSATION KEYS (Symmetric Room Keys)
// ---------------------------------------------------------------------------

/**
 * Generates a symmetric AES-GCM Conversation Key.
 */
export async function generateConversationKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // Extractable so we can encrypt it for others
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts the Conversation Key using a recipient's RSA Public Key.
 */
export async function encryptConversationKeyForUser(
  conversationKey: CryptoKey,
  recipientPublicKey: CryptoKey,
): Promise<string> {
  const rawKey = await window.crypto.subtle.exportKey("raw", conversationKey);

  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    rawKey,
  );

  return arrayBufferToBase64(encryptedKey);
}

/**
 * Decrypts a Conversation Key using the user's own RSA Private Key.
 */
export async function decryptConversationKey(
  encryptedConversationKeyBase64: string,
  myPrivateKey: CryptoKey,
): Promise<CryptoKey> {
  const encryptedBuffer = base64ToArrayBuffer(encryptedConversationKeyBase64);

  const rawKey = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    myPrivateKey,
    encryptedBuffer,
  );

  return window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"],
  );
}

// ---------------------------------------------------------------------------
// 5. MESSAGE ENCRYPTION / DECRYPTION
// ---------------------------------------------------------------------------

/**
 * Encrypts a chat message using the symmetric Conversation Key.
 */
export async function encryptMessage(
  text: string,
  conversationKey: CryptoKey,
): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    conversationKey,
    data,
  );

  // Combine IV and Ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypts a chat message using the symmetric Conversation Key.
 */
export async function decryptMessage(
  encryptedBase64: string,
  conversationKey: CryptoKey,
): Promise<string> {
  const combined = new Uint8Array(base64ToArrayBuffer(encryptedBase64));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    conversationKey,
    ciphertext,
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
