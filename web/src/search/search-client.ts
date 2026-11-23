import {
  Manifest,
  SearchShardRecord,
  SearchResponse,
  WorkerRequest,
  WorkerResponse
} from './types';
import { SearchFilters } from '../types/schema';

export class SearchClient {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map();
  private isInitialized = false;

  public get ready(): boolean {
    return this.isInitialized;
  }

  constructor() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./search.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        if (msg.type === 'INIT_SUCCESS') {
          const handler = this.pendingRequests.get('INIT');
          if (handler) {
            handler.resolve(msg.payload);
            this.pendingRequests.delete('INIT');
          }
        } else if (msg.type === 'SEARCH_SUCCESS') {
          const handler = this.pendingRequests.get('SEARCH');
          if (handler) {
            handler.resolve(msg.payload);
            this.pendingRequests.delete('SEARCH');
          }
        } else if (msg.type === 'ERROR') {
          for (const [key, handler] of this.pendingRequests.entries()) {
            handler.reject(new Error(msg.payload.message));
            this.pendingRequests.delete(key);
          }
        }
      };
    }
  }

  /**
   * Loads the manifest and initializes the search worker with initial shard records
   */
  public async initialize(baseHref: string = '/highcourt-judgment-agent/'): Promise<{ totalDocs: number }> {
    if (!this.worker) {
      throw new Error('Web Worker not supported in this environment');
    }

    const cleanBase = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
    const manifestUrl = `${cleanBase}data-sample/manifest.json`;

    const manifestRes = await fetch(manifestUrl);
    if (!manifestRes.ok) {
      throw new Error(`Failed to fetch manifest from ${manifestUrl}: ${manifestRes.statusText}`);
    }
    const manifest: Manifest = await manifestRes.json();

    // Fetch and decompress search shards
    const allRecords: SearchShardRecord[] = [];
    for (const shard of manifest.shards) {
      if (shard.search?.file) {
        const shardUrl = `${cleanBase}data-sample/${shard.search.file}`;
        const records = await this.fetchShard(shardUrl);
        allRecords.push(...records);
      }
    }

    return new Promise((resolve, reject) => {
      this.pendingRequests.set('INIT', {
        resolve: (val) => {
          this.isInitialized = true;
          resolve(val);
        },
        reject
      });

      const req: WorkerRequest = {
        type: 'INIT',
        payload: {
          manifest,
          shardData: allRecords
        }
      };
      this.worker!.postMessage(req);
    });
  }

  public async search(
    query: string,
    filters: Partial<SearchFilters> = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<SearchResponse> {
    if (!this.worker) {
      throw new Error('Web Worker not initialized');
    }

    return new Promise((resolve, reject) => {
      this.pendingRequests.set('SEARCH', { resolve, reject });

      const req: WorkerRequest = {
        type: 'SEARCH',
        payload: {
          query,
          filters,
          page,
          pageSize
        }
      };
      this.worker!.postMessage(req);
    });
  }

  private async fetchShard(url: string): Promise<SearchShardRecord[]> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch shard ${url}`);
    }

    // Use DecompressionStream if available in modern browsers
    if (typeof DecompressionStream !== 'undefined' && res.body) {
      const decompressedStream = res.body.pipeThrough(new DecompressionStream('gzip'));
      const decompressedResponse = new Response(decompressedStream);
      return await decompressedResponse.json();
    } else {
      // Fallback for environment without DecompressionStream
      const text = await res.text();
      return JSON.parse(text);
    }
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
