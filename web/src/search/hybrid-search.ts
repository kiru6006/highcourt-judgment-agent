/**
 * Reciprocal Rank Fusion (RRF) for Hybrid Lexical + Semantic Search
 * Combines BM25 ranks and Vector similarity ranks:
 * RRF(d) = w_bm25 / (60 + rank_bm25) + w_vec / (60 + rank_vec)
 */

export interface RankedItem {
  jid: string;
  score: number;
}

export interface FusedItem {
  jid: string;
  rrfScore: number;
  bm25Rank?: number;
  vectorRank?: number;
  vectorSimilarity?: number;
}

export function reciprocalRankFusion(
  bm25Results: RankedItem[],
  vectorResults: { jid: string; similarity: number }[],
  k: number = 60,
  weightBm25: number = 0.5,
  weightVector: number = 0.5
): FusedItem[] {
  const scoreMap = new Map<string, FusedItem>();

  // Process BM25 ranked list
  bm25Results.forEach((item, index) => {
    const rank = index + 1;
    const rrfContrib = weightBm25 / (k + rank);
    scoreMap.set(item.jid, {
      jid: item.jid,
      rrfScore: rrfContrib,
      bm25Rank: rank
    });
  });

  // Process Vector ranked list
  vectorResults.forEach((item, index) => {
    const rank = index + 1;
    const rrfContrib = weightVector / (k + rank);
    const existing = scoreMap.get(item.jid);
    if (existing) {
      existing.rrfScore += rrfContrib;
      existing.vectorRank = rank;
      existing.vectorSimilarity = item.similarity;
    } else {
      scoreMap.set(item.jid, {
        jid: item.jid,
        rrfScore: rrfContrib,
        vectorRank: rank,
        vectorSimilarity: item.similarity
      });
    }
  });

  return Array.from(scoreMap.values()).sort((a, b) => b.rrfScore - a.rrfScore);
}
