import crypto from 'crypto';

/**
 * Generates a cryptographically random 6-digit numeric code.
 * @returns {string} 6-digit numeric code
 */
export function generate6DigitCode() {
  return crypto.randomInt(100000, 1000000).toString();
}
