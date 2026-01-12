/**
 * Invite Code Generator
 *
 * Generates short, memorable invite codes for workspace joining.
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous: I, O, 0, 1

/**
 * Generate a 6-character invite code
 * Example: "ABC123", "XYZ789"
 */
export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

/**
 * Normalize invite code for comparison (uppercase, no spaces)
 */
export function normalizeInviteCode(code: string): string {
  return code.toUpperCase().replace(/\s/g, '');
}
