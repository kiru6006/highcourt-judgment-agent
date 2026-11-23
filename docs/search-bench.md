# Search Engine Benchmark Report: MiniSearch vs Orama

**Date**: 2026-11-23  
**Corpus**: Madras High Court Judgment Sample (1,000 synthesized documents based on actual HC judgments)  
**Environment**: Node.js v24.11.1 (macOS Apple Silicon)

## Executive Summary
**Winner**: **MiniSearch** (Selected for ADR D-004).

While both engines achieve exceptional query latencies ($< 4\text{ ms}$ at p95, well under the $50\text{ ms}$ main thread threshold), **MiniSearch** produces a serialized index that is **3.46x smaller on the wire** (117 KB gzipped vs 406 KB gzipped for Orama) and builds **2.39x faster** (61.18 ms vs 146.22 ms). MiniSearch also has a much smaller bundle footprint (~7 KB min+gz vs ~28 KB min+gz for Orama), conserving critical bundle budget.

---

## Benchmark Results

| Metric | MiniSearch | Orama | Advantage |
|---|---|---|---|
| **Bundle Size Footprint** | ~7 KB (min+gz) | ~28 KB (min+gz) | **MiniSearch (4x lighter)** |
| **Index Construction Time (1,000 docs)** | 61.18 ms | 146.22 ms | **MiniSearch (2.39x faster)** |
| **Deserialization Time** | 18.88 ms | 7.70 ms | Orama (2.45x faster) |
| **Raw Serialized Index Size** | 841 KB | 3,401 KB | **MiniSearch (4.04x smaller)** |
| **Gzipped Serialized Index Size** | **117 KB** | **406 KB** | **MiniSearch (3.46x smaller)** |
| **Query Latency (Avg)** | 1.46 ms | 0.97 ms | Orama |
| **Query Latency (p50)** | 1.29 ms | 0.36 ms | Orama |
| **Query Latency (p95)** | **3.74 ms** | **3.55 ms** | Equivalent ($< 4\text{ ms}$) |
| **Query Latency (p99)** | **4.68 ms** | **4.26 ms** | Equivalent ($< 5\text{ ms}$) |

---

## Architectural Conclusion
1. **Memory & Wire Budget**: For an offline-first static app on GitHub Pages with a 500 MB budget, MiniSearch's 117 KB/1k docs footprint preserves network transfer and device RAM.
2. **Dynamic Worker Indexing**: Ingesting raw JSON shards (`search-*.json.gz`) directly into MiniSearch in a Web Worker takes only $\sim 60\text{ ms}$, eliminating the need to transmit pre-computed inverted indices altogether if raw shard metadata is loaded.
3. **Decision**: MiniSearch adopted for client-side search core.
