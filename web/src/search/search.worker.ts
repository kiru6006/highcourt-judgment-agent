import { SearchEngine } from './search-engine';
import { WorkerRequest, WorkerResponse } from './types';

const engine = new SearchEngine();

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  try {
    switch (req.type) {
      case 'INIT': {
        const { shardData } = req.payload;
        engine.addRecords(shardData);
        const resp: WorkerResponse = {
          type: 'INIT_SUCCESS',
          payload: {
            totalDocs: engine.getDocumentCount(),
            shardCount: 1
          }
        };
        self.postMessage(resp);
        break;
      }

      case 'LOAD_SHARD_DATA': {
        const { shardId, records } = req.payload;
        engine.addRecords(records, shardId);
        break;
      }

      case 'SEARCH': {
        const { query, filters, page, pageSize } = req.payload;
        const result = engine.search(query, filters, page, pageSize);
        const resp: WorkerResponse = {
          type: 'SEARCH_SUCCESS',
          payload: result
        };
        self.postMessage(resp);
        break;
      }

      default:
        throw new Error(`Unknown message type: ${(req as any).type}`);
    }
  } catch (err: any) {
    const errResp: WorkerResponse = {
      type: 'ERROR',
      payload: { message: err?.message || String(err) }
    };
    self.postMessage(errResp);
  }
};
