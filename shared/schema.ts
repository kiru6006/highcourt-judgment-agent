/**
 * Nyaya AI Reader — Canonical Schema Extensions v1.2.0
 * Additive, backward-compatible data contracts with strict classification metadata.
 */

import { TAXONOMY_VERSION } from "./taxonomy/v1";

export interface ClassificationRecord {
  domainId: string;
  domainLabel: string;
  subjectIds: string[];
  jurisdictionType: "Writ" | "Appellate" | "Original" | "Revisional" | "Special" | "Unknown";
  method: "registry" | "rule" | "ai-advisory";
  taxonomyVersion: typeof TAXONOMY_VERSION;
  confidence: number;
  evidenceParagraphs: number[];
  reviewStatus: "pending" | "reviewed" | "unknown";
  ruleId?: string;
  status?: "verified" | "unverified" | "unknown";
  normalizedCaseType?: string;
  officialDescription?: string;
  sourceUrl?: string;
}

export interface ClassificationMetadata {
  reviewStatus: "pending" | "reviewed" | "unknown";
  reviewedBy?: string;
  reviewedAt?: string;
  statedClassification?: ClassificationRecord;
  inferredClassification?: ClassificationRecord[];
  anomaliesDetected?: string[];
}

export interface ExtendedJudgmentDocument {
  jid: string;
  cnr: string;
  court_code: string;
  court_name: string;
  bench_code: string;
  bench_name: string;
  coram_type: string;
  judges: string[];
  case_type: string;
  raw_case_type?: string;
  case_number: string;
  decision_date: string;
  parties: {
    petitioner: string;
    respondent: string;
  };
  disposal_nature: string;
  purpose_stage?: string;
  category: string;
  pdf_source_url: string;
  language: string;
  is_synthetic?: boolean;
  derived_fields?: Record<string, boolean>;
  statutes: Array<{
    act: string;
    act_code: string;
    section: string;
    transition_mapping?: {
      new_act: string;
      new_section: string;
      mapping_source: string;
    };
    paragraph_indices: number[];
  }>;
  citations: Array<{
    raw_citation: string;
    case_title: string;
    paragraph_indices: number[];
  }>;
  sections: Array<{
    tag: string;
    start_para_index: number;
    end_para_index: number;
    confidence: number;
    rule_id: string;
  }>;
  paragraphs: Array<{
    index: number;
    text: string;
    section_tag?: string;
  }>;

  // Additive v1.2.0 Classification & Quality Metadata
  classification_metadata?: ClassificationMetadata;
}

/**
 * Migration helper: wraps any existing judgment document ensuring backward compatibility.
 * Default review status is "pending" with unmutated raw court strings.
 */
export function migrateJudgmentToV12(doc: any): ExtendedJudgmentDocument {
  return {
    ...doc,
    raw_case_type: doc.raw_case_type || doc.case_type,
    classification_metadata: doc.classification_metadata || {
      reviewStatus: "pending",
      statedClassification: undefined,
      inferredClassification: [],
      anomaliesDetected: []
    }
  };
}
