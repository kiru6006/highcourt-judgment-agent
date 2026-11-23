/**
 * NyayaReader BYOK (Bring Your Own Key) Security Manager
 * Enforces ADR D-006:
 * - In-memory storage by default (zero persistence, wiped on reload/tab close)
 * - Optional sessionStorage
 * - localStorage only upon explicit opt-in with security confirmation
 * - Zero hardcoded keys, zero server-side proxies
 */

export type KeyStorageTier = 'memory' | 'session' | 'local';

const STORAGE_KEY = 'nyayareader_gemini_key';
const STORAGE_TIER_KEY = 'nyayareader_gemini_key_tier';

let inMemoryKey: string | null = null;

export const KeyManager = {
  getStorageTier(): KeyStorageTier {
    if (typeof window === 'undefined') return 'memory';
    const saved = localStorage.getItem(STORAGE_TIER_KEY) as KeyStorageTier;
    if (saved === 'local' || saved === 'session' || saved === 'memory') {
      return saved;
    }
    return 'memory';
  },

  getKey(): string | null {
    if (inMemoryKey) return inMemoryKey;
    if (typeof window === 'undefined') return null;

    const tier = this.getStorageTier();
    if (tier === 'session') {
      return sessionStorage.getItem(STORAGE_KEY);
    } else if (tier === 'local') {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  },

  hasKey(): boolean {
    return !!this.getKey();
  },

  setKey(key: string, tier: KeyStorageTier = 'memory'): void {
    const trimmed = key.trim();
    if (!trimmed) {
      this.clearKey();
      return;
    }

    if (tier === 'memory') {
      inMemoryKey = trimmed;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_TIER_KEY, 'memory');
      }
    } else if (tier === 'session') {
      inMemoryKey = null;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, trimmed);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_TIER_KEY, 'session');
      }
    } else if (tier === 'local') {
      inMemoryKey = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, trimmed);
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_TIER_KEY, 'local');
      }
    }
  },

  clearKey(): void {
    inMemoryKey = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TIER_KEY);
    }
  }
};
