/**
 * In-browser and Node.js int8 dot-product throughput probe for 384-dim vectors.
 * Benchmarks how fast 384-dim int8 dot-product runs over 10,000 vectors.
 */

function benchmarkInt8DotProduct() {
  const DIMENSIONS = 384;
  const NUM_VECTORS = 10000;

  console.log(`=== Benchmarking Int8 Dot-Product: ${NUM_VECTORS} vectors (dim=${DIMENSIONS}) ===`);

  // Create query vector (int8: -128 to 127)
  const queryVec = new Int8Array(DIMENSIONS);
  for (let i = 0; i < DIMENSIONS; i++) {
    queryVec[i] = (Math.random() * 255 - 128) | 0;
  }

  // Create document vectors contiguous buffer (NUM_VECTORS * DIMENSIONS bytes)
  const docBuffer = new Int8Array(NUM_VECTORS * DIMENSIONS);
  for (let i = 0; i < docBuffer.length; i++) {
    docBuffer[i] = (Math.random() * 255 - 128) | 0;
  }

  const start = performance.now();

  // Run brute-force dot product
  const scores = new Float32Array(NUM_VECTORS);
  for (let v = 0; v < NUM_VECTORS; v++) {
    const offset = v * DIMENSIONS;
    let dot = 0;
    for (let d = 0; d < DIMENSIONS; d++) {
      dot += queryVec[d] * docBuffer[offset + d];
    }
    scores[v] = dot;
  }

  const elapsedMs = performance.now() - start;
  const vectorsPerSec = Math.round((NUM_VECTORS / (elapsedMs / 1000)));

  console.log(`Elapsed Time: ${elapsedMs.toFixed(2)} ms`);
  console.log(`Throughput  : ${vectorsPerSec.toLocaleString()} vectors / second`);
  console.log(`Latency per query over ${NUM_VECTORS.toLocaleString()} vectors: ${elapsedMs.toFixed(2)} ms`);

  const results = {
    dimensions: DIMENSIONS,
    vector_count: NUM_VECTORS,
    elapsed_ms: Number(elapsedMs.toFixed(2)),
    vectors_per_second: vectorsPerSec,
    latency_per_10k_vectors_ms: Number(elapsedMs.toFixed(2)),
  };

  const fs = require('fs');
  fs.writeFileSync('config/vector_bench.discovered.json', JSON.stringify(results, null, 2));
  console.log('Saved config/vector_bench.discovered.json!');
}

benchmarkInt8DotProduct();
