import { JudgmentDocument } from '../types/schema';
import { SYNTHETIC_JUDGMENTS } from '../fixtures/synthetic-judgments';
import { Manifest } from '../search/types';

// In-memory LRU document cache
const documentCache = new Map<string, JudgmentDocument>();
const loadedDocsShards = new Set<string>();

/**
 * Loads a full judgment document by its JID.
 * 1. Checks memory cache.
 * 2. Checks synthetic fixtures.
 * 3. Fetches and decompresses docs shard from data-sample or production data.
 */
export async function fetchJudgmentDocument(
  jid: string,
  baseHref: string = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'
): Promise<JudgmentDocument | null> {
  if (!jid) return null;

  // 1. Memory cache check
  if (documentCache.has(jid)) {
    return documentCache.get(jid)!;
  }

  // 2. Synthetic fixture check (instant, no fetch needed)
  const fixture = SYNTHETIC_JUDGMENTS.find(j => j.jid === jid);
  if (fixture) {
    documentCache.set(jid, fixture);
    return fixture;
  }

  // 3. Shard fetch (for browser or node with valid URL)
  try {
    const cleanBase = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
    let manifestUrl = `${cleanBase}data-sample/manifest.json`;

    // In Node.js testing environment, relative URLs fail native fetch
    if (typeof window === 'undefined' && !manifestUrl.startsWith('http')) {
      manifestUrl = `http://localhost${manifestUrl.startsWith('/') ? '' : '/'}${manifestUrl}`;
    }

    const mRes = await fetch(manifestUrl);
    if (!mRes.ok) return null;
    const manifest: Manifest = await mRes.json();

    // Iterate through shards to find the document
    for (const shard of manifest.shards) {
      if (!shard.docs?.file) continue;
      const shardFile = shard.docs.file;

      if (!loadedDocsShards.has(shardFile)) {
        let docsUrl = `${cleanBase}data-sample/${shardFile}`;
        if (typeof window === 'undefined' && !docsUrl.startsWith('http')) {
          docsUrl = `http://localhost${docsUrl.startsWith('/') ? '' : '/'}${docsUrl}`;
        }

        const dRes = await fetch(docsUrl);
        if (!dRes.ok) continue;

        let docsList: JudgmentDocument[] = [];
        if (typeof DecompressionStream !== 'undefined' && dRes.body) {
          const ds = dRes.body.pipeThrough(new DecompressionStream('gzip'));
          const decompResp = new Response(ds);
          docsList = await decompResp.json();
        } else {
          docsList = await dRes.json();
        }

        for (const doc of docsList) {
          documentCache.set(doc.jid, doc);
        }
        loadedDocsShards.add(shardFile);

        if (documentCache.has(jid)) {
          return documentCache.get(jid)!;
        }
      }
    }
  } catch (err) {
    // If running in an environment where network fetch is unavailable, return null
  }

  return documentCache.get(jid) || null;
}

export function clearDocumentCache(): void {
  documentCache.clear();
  loadedDocsShards.clear();
}
