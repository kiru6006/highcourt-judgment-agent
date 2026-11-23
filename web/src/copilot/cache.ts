import { GroundedAnswer } from './verifier';

const PROMPT_VERSION = 'v1.0';
const DB_NAME = 'NyayaReader_CopilotCache';
const STORE_NAME = 'answers';

function makeCacheKey(jid: string, task: string, model: string = 'gemini-2.0-flash'): string {
  return `${jid}::${task.trim().toLowerCase()}::${model}::${PROMPT_VERSION}`;
}

// In-memory fallback
const memoryCache = new Map<string, GroundedAnswer>();

export const CopilotCache = {
  async get(jid: string, task: string, model: string = 'gemini-2.0-flash'): Promise<GroundedAnswer | null> {
    const key = makeCacheKey(jid, task, model);
    if (memoryCache.has(key)) {
      return memoryCache.get(key)!;
    }

    if (typeof indexedDB === 'undefined') {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const getReq = store.get(key);
          getReq.onsuccess = () => {
            const val = getReq.result;
            if (val) {
              memoryCache.set(key, val);
              resolve(val);
            } else {
              resolve(null);
            }
          };
          getReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  },

  async set(jid: string, task: string, answer: GroundedAnswer, model: string = 'gemini-2.0-flash'): Promise<void> {
    const key = makeCacheKey(jid, task, model);
    memoryCache.set(key, answer);

    if (typeof indexedDB === 'undefined') return;

    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(answer, key);
      };
    } catch {
      // Ignore storage errors
    }
  }
};
