export type SectionTag = 
  | 'Facts'
  | 'Procedural History'
  | 'Issues'
  | 'Petitioner Submissions'
  | 'Respondent Submissions'
  | 'Reasoning & Ratio'
  | 'Final Order'
  | 'Untagged';

export interface Paragraph {
  index: number;
  original_label?: string;
  text: string;
  section_tag: SectionTag;
  statute_mentions: string[];
  citation_mentions: string[];
  token_count: number;
}

export interface TaggedSection {
  tag: SectionTag;
  start_para_index: number;
  end_para_index: number;
  confidence: number;
  rule_id: string;
}

export interface StatuteReference {
  act: string;
  act_code: 'IPC' | 'CrPC' | 'CPC' | 'IEA' | 'BNS' | 'BNSS' | 'BSA' | 'Const' | 'Other';
  section: string;
  transition_mapping?: {
    new_act: string;
    new_section: string;
    mapping_source: string;
  };
  paragraph_indices: number[];
}

export interface CitationEdge {
  raw_citation: string;
  case_title?: string;
  target_jid?: string;
  paragraph_indices: number[];
}

export interface ClassificationRecord {
  domainId: string;
  domainLabel: string;
  subjectIds: string[];
  jurisdictionType: 'Writ' | 'Appellate' | 'Original' | 'Revisional' | 'Special' | 'Unknown';
  method: 'registry' | 'rule' | 'ai-advisory';
  taxonomyVersion: string;
  confidence: number;
  evidenceParagraphs: number[];
  reviewStatus: 'pending' | 'reviewed' | 'unknown';
  ruleId?: string;
  status?: 'verified' | 'unverified' | 'unknown';
  normalizedCaseType?: string;
  officialDescription?: string;
  sourceUrl?: string;
}

export interface ClassificationMetadata {
  reviewStatus: 'pending' | 'reviewed' | 'unknown';
  reviewedBy?: string;
  reviewedAt?: string;
  statedClassification?: ClassificationRecord;
  inferredClassification?: ClassificationRecord[];
  anomaliesDetected?: string[];
}

export interface JudgmentDocument {
  jid: string;
  cnr: string;
  court_code: string;
  court_name: string;
  bench_code: string;
  bench_name: string;
  coram_type: 'Single Judge' | 'Division Bench' | 'Full Bench' | 'Constitution Bench';
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
  purpose_stage: string;
  category: 'Criminal' | 'Civil' | 'Writ' | 'Commercial' | 'Tax' | 'Service' | 'Matrimonial' | 'Other';
  pdf_source_url: string;
  language: string;
  paragraphs: Paragraph[];
  sections: TaggedSection[];
  statutes: StatuteReference[];
  citations: CitationEdge[];
  is_synthetic?: boolean;
  derived_fields: {
    category: boolean;
    purpose_stage: boolean;
    coram_type: boolean;
  };
  classification_metadata?: ClassificationMetadata;
}

export interface AnomalyRecord {
  ruleId: string;
  severity: 'high' | 'medium' | 'low';
  documentId: string;
  evidence: string;
  detectedAt: string;
  reviewStatus: 'pending' | 'reviewed' | 'suppressed';
  remediation: string;
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

export interface SearchFilters {
  query: string;
  courts: string[];
  benches: string[];
  coramTypes: string[];
  categories: string[];
  caseTypes: string[];
  disposals: string[];
  purposes: string[];
  yearFrom?: number;
  yearTo?: number;
}
