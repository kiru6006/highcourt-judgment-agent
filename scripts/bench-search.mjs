import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import MiniSearch from 'minisearch';
import { create, insertMultiple, search as oramaSearch, save, load } from '@orama/orama';

const shardPath = path.resolve('data/shards/search-33_10-2022.json.gz');
if (!fs.existsSync(shardPath)) {
  console.error(`Shard not found: ${shardPath}`);
  process.exit(1);
}

const compressed = fs.readFileSync(shardPath);
const decompressed = zlib.gunzipSync(compressed);
const baseDocs = JSON.parse(decompressed.toString('utf-8'));

// Synthesize 1,000 docs for rigorous benchmark
const targetSize = 1000;
const docs = [];
for (let i = 0; i < targetSize; i++) {
  const base = baseDocs[i % baseDocs.length];
  docs.push({
    id: `${base.jid}_${i}`,
    title: `${base.title} [Copy ${i}]`,
    case_no: `${base.case_no}-${i}`,
    court_code: base.court_code,
    year: base.year,
    date: base.date,
    category: base.category,
    disposal: base.disposal,
    statutes: (base.statutes || []).join(' '),
    excerpt: base.excerpt || '',
    judges: (base.judges || []).join(' ')
  });
}

console.log(`Loaded and prepared ${docs.length} documents for benchmark.`);

// 1. MiniSearch Benchmark
const t0_mini = performance.now();
const miniSearch = new MiniSearch({
  idField: 'id',
  fields: ['title', 'case_no', 'statutes', 'category', 'disposal', 'excerpt', 'judges'],
  storeFields: ['id', 'title', 'case_no', 'court_code', 'year', 'date', 'category', 'disposal'],
  searchOptions: {
    boost: { title: 3, case_no: 3, statutes: 2, category: 1.5 },
    prefix: true,
    fuzzy: 0.2
  }
});
miniSearch.addAll(docs);
const miniIndexTime = performance.now() - t0_mini;

const miniSerialized = JSON.stringify(miniSearch);
const miniSerializedBytes = Buffer.byteLength(miniSerialized, 'utf-8');
const miniGzipBytes = zlib.gzipSync(Buffer.from(miniSerialized)).length;

const t0_mini_deser = performance.now();
const loadedMini = MiniSearch.loadJSON(miniSerialized, {
  fields: ['title', 'case_no', 'statutes', 'category', 'disposal', 'excerpt', 'judges'],
  storeFields: ['id', 'title', 'case_no', 'court_code', 'year', 'date', 'category', 'disposal'],
  searchOptions: {
    boost: { title: 3, case_no: 3, statutes: 2, category: 1.5 },
    prefix: true,
    fuzzy: 0.2
  }
});
const miniDeserTime = performance.now() - t0_mini_deser;

// 2. Orama Benchmark
const t0_orama = performance.now();
const oramaDb = await create({
  schema: {
    id: 'string',
    title: 'string',
    case_no: 'string',
    court_code: 'string',
    year: 'number',
    date: 'string',
    category: 'string',
    disposal: 'string',
    statutes: 'string',
    excerpt: 'string',
    judges: 'string'
  }
});
await insertMultiple(oramaDb, docs);
const oramaIndexTime = performance.now() - t0_orama;

const oramaDump = await save(oramaDb);
const oramaSerialized = JSON.stringify(oramaDump);
const oramaSerializedBytes = Buffer.byteLength(oramaSerialized, 'utf-8');
const oramaGzipBytes = zlib.gzipSync(Buffer.from(oramaSerialized)).length;

const t0_orama_deser = performance.now();
const loadedOrama = await create({
  schema: {
    id: 'string',
    title: 'string',
    case_no: 'string',
    court_code: 'string',
    year: 'number',
    date: 'string',
    category: 'string',
    disposal: 'string',
    statutes: 'string',
    excerpt: 'string',
    judges: 'string'
  }
});
await load(loadedOrama, oramaDump);
const oramaDeserTime = performance.now() - t0_orama_deser;

// Query Benchmark
const testQueries = [
  'bail',
  'Section 482',
  'quash criminal proceedings',
  'Arbitration Original Petition',
  'Madras High Court petition',
  'Crl.O.P.'
];

const iterations = 50;

function benchQueries(runner) {
  const latencies = [];
  for (let i = 0; i < iterations; i++) {
    for (const q of testQueries) {
      const start = performance.now();
      const res = runner(q);
      latencies.push(performance.now() - start);
    }
  }
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  return { p50, p95, p99, avg };
}

const miniStats = benchQueries((q) => loadedMini.search(q));
const oramaStats = benchQueries((q) => oramaSearch(loadedOrama, { term: q, limit: 20 }));

const report = {
  docsCount: docs.length,
  miniSearch: {
    indexTimeMs: Math.round(miniIndexTime * 100) / 100,
    deserializationTimeMs: Math.round(miniDeserTime * 100) / 100,
    serializedSizeBytes: miniSerializedBytes,
    serializedGzipBytes: miniGzipBytes,
    latency: {
      avgMs: Math.round(miniStats.avg * 100) / 100,
      p50Ms: Math.round(miniStats.p50 * 100) / 100,
      p95Ms: Math.round(miniStats.p95 * 100) / 100,
      p99Ms: Math.round(miniStats.p99 * 100) / 100
    }
  },
  orama: {
    indexTimeMs: Math.round(oramaIndexTime * 100) / 100,
    deserializationTimeMs: Math.round(oramaDeserTime * 100) / 100,
    serializedSizeBytes: oramaSerializedBytes,
    serializedGzipBytes: oramaGzipBytes,
    latency: {
      avgMs: Math.round(oramaStats.avg * 100) / 100,
      p50Ms: Math.round(oramaStats.p50 * 100) / 100,
      p95Ms: Math.round(oramaStats.p95 * 100) / 100,
      p99Ms: Math.round(oramaStats.p99 * 100) / 100
    }
  }
};

console.log(JSON.stringify(report, null, 2));
fs.writeFileSync('docs/search-bench.json', JSON.stringify(report, null, 2));
