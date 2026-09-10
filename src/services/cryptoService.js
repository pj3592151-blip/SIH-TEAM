/**
 * DocGuard – Cryptographic Integrity Service (Phase 3)
 * Provides SHA-256 hash calculation and verification using Web Crypto API.
 * Ensures document files cannot be silently overwritten or tampered with.
 */

export const cryptoService = {
  /**
   * Convert ArrayBuffer to Hex String
   */
  bufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer)
    return Array.from(byteArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  },

  /**
   * Calculate SHA-256 hash of an ArrayBuffer
   */
  async calculateBufferSHA256(arrayBuffer) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API is not available in this browser environment.')
    }
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer)
    return this.bufferToHex(hashBuffer)
  },

  /**
   * Calculate SHA-256 hash from a File or Blob object
   */
  async calculateFileSHA256(file) {
    if (!file) throw new Error('No file provided for SHA-256 calculation.')
    const arrayBuffer = await file.arrayBuffer()
    return this.calculateBufferSHA256(arrayBuffer)
  },

  /**
   * Calculate SHA-256 hash from a string (e.g. for text documents or test content)
   */
  async calculateStringSHA256(text) {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    return this.calculateBufferSHA256(data.buffer)
  },

  /**
   * Verify file against an expected SHA-256 hash.
   * Performs cryptographic comparison.
   */
  async verifyFileIntegrity(file, expectedHash) {
    if (!expectedHash) {
      throw new Error('Expected hash is missing for integrity verification.')
    }

    const calculatedHash = await this.calculateFileSHA256(file)
    const normalizedCalculated = calculatedHash.trim().toLowerCase()
    const normalizedExpected = expectedHash.trim().toLowerCase()
    const verified = normalizedCalculated === normalizedExpected

    return {
      verified,
      calculatedHash: normalizedCalculated,
      storedHash: normalizedExpected,
      timestamp: new Date().toISOString(),
    }
  },

  /**
   * Generate deterministic SHA-256 hash string for mock seed data
   */
  async generateSeedHash(seedText) {
    return this.calculateStringSHA256(seedText)
  },
}
