# Canonical Data Schemas (VERIFIED — Post-Phase 2 Empirical Spike)

## 1. Overview
This document defines the canonical JSON Schemas and TypeScript interfaces for the Nyaya AI Reader pipeline, static shard artifacts, and client application.

Status: **VERIFIED against s3://indian-high-court-judgments metadata and real PDF extraction metrics**.

---

## 2. Core Entity Models

### 2.1 Judgment Document (`JudgmentDocument`)
Represents the complete parsed judgment or order.
```typescript
export interface JudgmentDocument {
  jid: string;                      // sha1(cnr|decision_date|order_number)
  cnr: string;                      // eCourts Case Number Record (16-char alphanumeric)
  court_code: string;               // e.g. "33~10" (Madras High Court)
  court_name: string;               // e.g. "Madras High Court"
  bench_code: string;               // e.g. "01" (Principal Bench), "02" (Madurai)
  bench_name: string;               // e.g. "Principal Seat at Madras"
  coram_type: 'Single Judge' | 'Division Bench' | 'Full Bench' | 'Constitution Bench';
  judges: string[];                 // Names of deciding judges
  case_type: string;                // e.g. "WP", "CRL.P", "WA"
  case_number: string;              // e.g. "WP(MD) No. 12345 of 2023"
  decision_date: string;            // ISO format: YYYY-MM-DD
  parties: {
    petitioner: string;             // Appellant / Petitioner
    respondent: string;             // Respondent / State
  };
  disposal_nature: string;          // e.g. "ALLOWED", "DISMISSED", "DISPOSED OF"
  purpose_stage: string;            // e.g. "Bail", "Quashing", "Final Hearing"
  category: 'Criminal' | 'Civil' | 'Writ' | 'Commercial' | 'Tax' | 'Service' | 'Matrimonial' | 'Other';
  pdf_source_url: string;           // Direct upstream S3 or eCourts PDF link
  language: string;                 // ISO 639-1: "en", "ta", "kn", "hi"
  paragraphs: Paragraph[];          // Ordered paragraph list
  sections: TaggedSection[];        // Section partitions
  statutes: StatuteReference[];     // Sourced statutory mentions
  citations: CitationEdge[];        // Cited judicial authorities
  is_synthetic?: boolean;           // true only for test fixtures
  derived_fields: {                 // Tracks which fields are heuristic
    category: boolean;
    purpose_stage: boolean;
    coram_type: boolean;
  };
}
```

### 2.2 Paragraph (`Paragraph`)
```typescript
export interface Paragraph {
  index: number;                    // 1-based sequential index
  original_label?: string;          // e.g. "1.", "Para 2", or null if unnumbered
  text: string;                     // Normalized UTF-8 paragraph text
  section_tag: SectionTag;          // Assigned section type
  statute_mentions: string[];       // Normalized statute keys e.g. ["CrPC:482", "BNS:528"]
  citation_mentions: string[];      // Cited case titles/citations in this paragraph
  token_count: number;              // Approximate BPE token count
}

export type SectionTag = 
  | 'Facts'
  | 'Procedural History'
  | 'Issues'
  | 'Petitioner Submissions'
  | 'Respondent Submissions'
  | 'Reasoning & Ratio'
  | 'Final Order'
  | 'Untagged';
```

### 2.3 Tagged Section (`TaggedSection`)
```typescript
export interface TaggedSection {
  tag: SectionTag;
  start_para_index: number;
  end_para_index: number;
  confidence: number;               // 0.0 to 1.0 (heuristic score)
  rule_id: string;                  // Identifier of regular expression rule matched
}
```

### 2.4 Statute Reference (`StatuteReference`)
```typescript
export interface StatuteReference {
  act: string;                      // e.g. "Code of Criminal Procedure, 1973"
  act_code: 'IPC' | 'CrPC' | 'CPC' | 'IEA' | 'BNS' | 'BNSS' | 'BSA' | 'Const' | 'Other';
  section: string;                  // e.g. "482", "302", "Article 226"
  transition_mapping?: {
    new_act: string;                // e.g. "BNSS"
    new_section: string;            // e.g. "528"
    mapping_source: string;         // e.g. "official_gazette_2023.csv"
  };
  paragraph_indices: number[];      // Paragraphs citing this section
}
```

### 2.5 Citation Edge (`CitationEdge`)
```typescript
export interface CitationEdge {
  raw_citation: string;             // e.g. "AIR 2022 SC 1234" or "(2020) 4 SCC 1"
  case_title?: string;              // e.g. "Arnesh Kumar v. State of Bihar"
  target_jid?: string;              // Resolved in-corpus JID (null if out-of-corpus)
  paragraph_indices: number[];      // Mentioning paragraphs
}
```

---

## 3. Search & Storage Shard Schemas

### 3.1 Search Record (`SearchRecord`)
Compact index document used for client-side BM25 search.
```typescript
export interface SearchRecord {
  jid: string;
  title: string;                    // "Petitioner v. Respondent"
  case_no: string;                  // "WP 1234/2023"
  court_code: string;
  bench_code: string;
  year: number;
  date: string;                     // "2023-10-15"
  category: string;
  disposal: string;
  judges: string[];
  statutes: string[];               // ["CrPC:482", "IPC:420"]
  excerpt: string;                  // Leading ~250 chars of ratio or facts
  has_structured_brief: boolean;
}
```

### 3.2 Corpus Manifest (`CorpusManifest`)
Root metadata catalog loaded by the browser client at startup.
```typescript
export interface CorpusManifest {
  manifest_version: string;         // e.g. "1.0.0"
  build_timestamp: string;          // ISO UTC
  git_commit: string;
  total_judgments: number;
  courts: {
    court_code: string;
    court_name: string;
    years: number[];
    judgment_count: number;
  }[];
  shards: {
    court_code: string;
    year: number;
    search_shard_url: string;       // "data/shards/search-33_10-2023.json.gz"
    search_shard_bytes: number;
    search_shard_sha256: string;
    docs_shard_url: string;         // "data/shards/docs-33_10-2023.json.gz"
    docs_shard_bytes: number;
    docs_shard_sha256: string;
    vec_shard_url?: string;         // "data/shards/vec-33_10-2023.bin"
    vec_shard_bytes?: number;
    vec_shard_sha256?: string;
  }[];
  embedding_config?: {
    model_id: "BAAI/bge-small-en-v1.5";
    git_revision: string;
    tokenizer_hash: string;
    dimensions: 384;
    quantization: "int8-symmetric-per-vector";
  };
}
```

---

## 4. AI Grounding & Claims Schema

### 4.1 Grounded AI Answer (`AIAnswer`)
```typescript
export interface AIAnswer {
  answer: string;                   // Synthesized narrative text
  claims: AIClaim[];                // Individual verified propositions
  abstained: boolean;               // true if insufficient source evidence found
  abstain_reason?: string;          // Explanation when abstained
  verification_summary: {
    total_claims: number;
    verified_claims: number;
    dropped_claims: number;
    evidence_score: number;         // verified / total
  };
}

export interface AIClaim {
  text: string;                     // Asserted legal proposition
  judgment_id: string;              // Target JID
  paragraph_numbers: number[];      // Paragraph citations e.g. [14, 15]
  supporting_quote: string;         // Exact verbatim quotation from paragraph
  verified?: boolean;               // Populated by client verifier
}
```

---

## 5. Structured Case Intelligence & Anomaly Schema (v1.2.0)

### 5.1 Case Classification Metadata (`ClassificationMetadata`)
Additive extension to `JudgmentDocument`:
```typescript
export interface ClassificationMetadata {
  reviewStatus: 'pending' | 'reviewed' | 'unknown';
  statedClassification?: ClassificationRecord;
  inferredClassification?: ClassificationRecord[];
  anomaliesDetected?: string[];
}

export interface ClassificationRecord {
  ruleId?: string;
  method: 'registry' | 'rule' | 'ai';
  taxonomyVersion: string;         // "1.0"
  domainId: string;                // e.g. "domain_criminal"
  domainLabel: string;             // "Criminal Law"
  subjectIds: string[];            // e.g. ["subj_crim_bail"]
  jurisdictionType?: string;       // "Original" | "Appellate" | "Writ" | "Revisional"
  normalizedCaseType?: string;     // "Crl.O.P."
  officialDescription?: string;    // "Criminal Original Petition"
  confidence: number;              // 0.0 to 1.0
  evidenceParagraphs: number[];    // Mandatory paragraph anchors e.g. [2]
  reviewStatus: 'pending' | 'reviewed' | 'unknown';
  sourceUrl?: string;              // High Court portal URL
  status?: 'verified' | 'unverified' | 'unknown';
}
```

### 5.2 Anomaly Summary & Audit Records (`AnomalySummary`)
Emitted by `pipeline/anomaly/engine.py` into `data/anomaly-summary.json`:
```typescript
export interface AnomalyRecord {
  ruleId: string;                  // e.g. "A01_MISSING_SOURCE_URL"
  severity: 'high' | 'medium' | 'low';
  documentId: string;              // Target JID
  evidence: string;                // Audit failure rationale
  detectedAt: string;              // ISO timestamp
  reviewStatus: 'pending' | 'reviewed' | 'suppressed';
  remediation: string;             // Suggested corrective action
  history?: string[];
}

export interface AnomalySummary {
  generatedAt: string;
  totalDocumentsScanned: number;
  totalAnomaliesDetected: number;
  severityCounts: {
    high: number;
    medium: number;
    low: number;
  };
  statusCounts: {
    pending: number;
    reviewed: number;
    suppressed: number;
  };
  ruleCounts: Record<string, number>;
  anomalies: AnomalyRecord[];
}
```

### 5.3 Schema Migration Invariant
Existing documents receive `classification_metadata.review_status: "pending"` and null/empty classifications. No values are fabricated during migration. Missing court-code matches retain raw code strings with `status: "unknown"`.
