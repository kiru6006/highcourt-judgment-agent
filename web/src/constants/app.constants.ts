export const APP_CONFIG = {
  BRAND_NAME: 'NyayaReader',
  SUBTITLE: 'Indian High Court Judgment Search & AI Reader',
  FOOTER_DISCLAIMER: 'Data: Indian High Court Judgments, CC-BY-4.0, source eCourts. Not legal advice. Verify against the certified copy.',
  DEFAULT_COURTS: [
    { code: '33_10', name: 'Madras High Court' },
    { code: '29_3', name: 'Karnataka High Court' },
    { code: '7_26', name: 'Delhi High Court' },
    { code: '1_1', name: 'Bombay High Court' },
  ],
  CATEGORIES: [
    'Criminal',
    'Civil',
    'Writ',
    'Commercial',
    'Tax',
    'Service',
    'Matrimonial',
  ] as const,
  DISPOSAL_STATUSES: [
    'Allowed',
    'Dismissed',
    'Partly Allowed',
    'Disposed Of',
    'Quashed',
  ] as const,
  CORAM_TYPES: [
    'Single Judge',
    'Division Bench',
    'Full Bench',
  ] as const,
  STAGE_PURPOSES: [
    'Bail / Anticipatory Bail',
    'Quashing FIR / Chargesheet',
    'Interim Stay',
    'Delay Condonation',
    'Final Hearing',
  ] as const,
};
