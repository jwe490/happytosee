/**
 * Key-Based Authentication Utilities
 * Generates secure keys and handles hashing for the vault authentication system
 */

// Generate a cryptographically secure 128-bit random key
export async function generateSecretKey(): Promise<string> {
  const buffer = new Uint8Array(16); // 128 bits
  window.crypto.getRandomValues(buffer);
  
  // Convert to Base64 URL-safe string
  const base64 = btoa(String.fromCharCode(...buffer));
  // Make URL-safe: replace + with -, / with _, remove =
  const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  // Add prefix for better UX and format with dashes for readability
  const formatted = `MF-${urlSafe.slice(0, 4)}-${urlSafe.slice(4, 8)}-${urlSafe.slice(8, 12)}-${urlSafe.slice(12)}`;
  return formatted;
}

// Create SHA-256 hash of the key
export async function hashKey(key: string): Promise<string> {
  // Normalize: trim whitespace, remove dashes/spaces, convert to uppercase for consistent hashing
  const normalizedKey = key.trim().replace(/[-\s]/g, '').toUpperCase();
  
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedKey);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// Validate key format - now accepts any non-empty key (backend validates)
export function validateKeyFormat(key: string): boolean {
  const cleaned = key.replace(/\s/g, '');
  // Accept any key that has reasonable length (at least 8 characters)
  return cleaned.length >= 8;
}

// Format key for display
export function formatKeyForDisplay(key: string): string {
  return key.toUpperCase();
}

// Generate downloadable key file content
export function generateKeyFileContent(key: string, displayName: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `===========================================
MoodFlix Secret Access Key
===========================================

Display Name: ${displayName}
Created: ${date}

YOUR SECRET KEY:
${key}

===========================================
⚠️  IMPORTANT SECURITY NOTICE  ⚠️
===========================================

• This key is your ONLY way to access your account
• We cannot recover this key if you lose it
• Keep this file in a secure location
• Never share this key with anyone
• Consider storing a backup in a password manager

===========================================
`;
}

// Download key as text file
export function downloadKeyFile(key: string, displayName: string): void {
  const content = generateKeyFileContent(key, displayName);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `moodflix-secret-key-${displayName.toLowerCase().replace(/\s+/g, '-')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Session token storage (NOT the raw key - just the JWT)
const SESSION_TOKEN_KEY = 'mf_session_token';
const SESSION_USER_KEY = 'mf_session_user';

export interface KeyUser {
  id: string;
  display_name: string;
  date_of_birth?: string;
  gender?: string;
  purpose?: string;
  created_at: string;
  last_login_at?: string;
}

export function storeSession(token: string, user: KeyUser): void {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function getStoredSession(): { token: string; user: KeyUser } | null {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  const userStr = localStorage.getItem(SESSION_USER_KEY);
  
  if (!token || !userStr) {
    return null;
  }
  
  try {
    const user = JSON.parse(userStr) as KeyUser;
    return { token, user };
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
}

// Check if session token is expired (basic JWT decode)
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
