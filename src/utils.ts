/**
 * Generates a cryptographically secure code verifier for PKCE
 * @returns A random code verifier string with 256 bits of entropy
 */
export function generatePKCEVerifier(): string {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);

  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Creates a code challenge from a code verifier using SHA-256
 * @param codeVerifier The code verifier to hash
 * @returns Base64url encoded code challenge
 */
export async function generatePKCEChallenge(
  codeVerifier: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  const hash = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export const safeStorage = {
  setItem: (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.warn("Could not store auth state in browser storage:", err);
      }
    }
  },
  getItem: (key: string): string | null => {
    try {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue !== null) {
        return sessionValue;
      }

      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Could not retrieve from browser storage:", e);
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      /* ignore */
    }
    try {
      localStorage.removeItem(key);
    } catch (e) {
      /* ignore */
    }
  },
};
