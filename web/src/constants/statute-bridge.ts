/**
 * Official Statute Transition Bridge Tables
 * Sourced from data/mappings/statute_transitions.csv
 * Verified against Official Gazette publications of Bharatiya Nyaya Sanhita (BNS),
 * Bharatiya Nagarik Suraksha Sanhita (BNSS), and Bharatiya Sakshya Adhiniyam (BSA).
 */

export type EquivalenceType = 'EXACT' | 'SUBSTANTIVELY_ALTERED' | 'CONSOLIDATED';

export interface StatuteTransition {
  oldAct: string;
  oldSection: string;
  newAct: string;
  newSection: string;
  mappingSource: string;
  notes?: string;
  equivalenceType?: EquivalenceType;
  isReverseLookup?: boolean;
}

export const OFFICIAL_STATUTE_TRANSITIONS: StatuteTransition[] = [
  // CrPC -> BNSS
  { oldAct: 'CrPC', oldSection: '482', newAct: 'BNSS', newSection: '528', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Inherent powers of High Court to quash', equivalenceType: 'EXACT' },
  { oldAct: 'CrPC', oldSection: '439', newAct: 'BNSS', newSection: '483', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Special powers of High Court or Court of Session regarding bail', equivalenceType: 'EXACT' },
  { oldAct: 'CrPC', oldSection: '438', newAct: 'BNSS', newSection: '482', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)', equivalenceType: 'EXACT' },
  { oldAct: 'CrPC', oldSection: '167', newAct: 'BNSS', newSection: '187', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Procedure on investigation remand (Substantively Altered: 15-day custody period modified)', equivalenceType: 'SUBSTANTIVELY_ALTERED' },
  { oldAct: 'CrPC', oldSection: '313', newAct: 'BNSS', newSection: '351', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Power to examine the accused', equivalenceType: 'EXACT' },
  { oldAct: 'CrPC', oldSection: '154', newAct: 'BNSS', newSection: '173', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Information in cognizable cases (e-FIR introduced)', equivalenceType: 'SUBSTANTIVELY_ALTERED' },
  { oldAct: 'CrPC', oldSection: '41A', newAct: 'BNSS', newSection: '35(3)', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Notice of appearance before police officer', equivalenceType: 'EXACT' },
  { oldAct: 'CrPC', oldSection: '173(8)', newAct: 'BNSS', newSection: '193(9)', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Further investigation after charge sheet', equivalenceType: 'EXACT' },

  // IPC -> BNS
  { oldAct: 'IPC', oldSection: '420', newAct: 'BNS', newSection: '318', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Cheating and dishonestly inducing delivery of property', equivalenceType: 'CONSOLIDATED' },
  { oldAct: 'IPC', oldSection: '406', newAct: 'BNS', newSection: '316', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Punishment for criminal breach of trust', equivalenceType: 'CONSOLIDATED' },
  { oldAct: 'IPC', oldSection: '302', newAct: 'BNS', newSection: '103', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Punishment for murder', equivalenceType: 'EXACT' },
  { oldAct: 'IPC', oldSection: '307', newAct: 'BNS', newSection: '109', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Attempt to murder', equivalenceType: 'EXACT' },
  { oldAct: 'IPC', oldSection: '376', newAct: 'BNS', newSection: '64', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Punishment for rape', equivalenceType: 'EXACT' },
  { oldAct: 'IPC', oldSection: '498A', newAct: 'BNS', newSection: '85', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Husband or relative subjecting woman to cruelty', equivalenceType: 'EXACT' },
  { oldAct: 'IPC', oldSection: '120B', newAct: 'BNS', newSection: '61', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Punishment of criminal conspiracy', equivalenceType: 'EXACT' },
  { oldAct: 'IPC', oldSection: '124A', newAct: 'BNS', newSection: '152', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Acts endangering sovereignty, unity and integrity of India (Sedition replaced)', equivalenceType: 'SUBSTANTIVELY_ALTERED' },
  { oldAct: 'IPC', oldSection: '304A', newAct: 'BNS', newSection: '106', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Causing death by negligence', equivalenceType: 'SUBSTANTIVELY_ALTERED' },

  // IEA -> BSA
  { oldAct: 'IEA', oldSection: '27', newAct: 'BSA', newSection: '23', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Information received from accused proved (Recovery)', equivalenceType: 'EXACT' },
  { oldAct: 'IEA', oldSection: '65B', newAct: 'BSA', newSection: '63', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Admissibility of electronic records', equivalenceType: 'EXACT' },
  { oldAct: 'IEA', oldSection: '114A', newAct: 'BSA', newSection: '119', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Presumption as to absence of consent in rape prosecution', equivalenceType: 'EXACT' }
];

export function lookupTransition(actCode: string, section: string): StatuteTransition | undefined {
  const normSec = section.trim().toUpperCase().replace(/^SEC(?:TION)?\.?\s*/i, '');
  const normAct = actCode.trim().toUpperCase();

  // 1. Direct forward lookup (Old Code -> New Sanhita)
  const forward = OFFICIAL_STATUTE_TRANSITIONS.find(
    t => t.oldAct.toUpperCase() === normAct && t.oldSection.toUpperCase() === normSec
  );
  if (forward) return forward;

  // 2. Reverse lookup (New Sanhita -> Legacy Code Equivalent)
  const reverse = OFFICIAL_STATUTE_TRANSITIONS.find(
    t => t.newAct.toUpperCase() === normAct && t.newSection.toUpperCase() === normSec
  );
  if (reverse) {
    return {
      oldAct: reverse.newAct,
      oldSection: reverse.newSection,
      newAct: reverse.oldAct,
      newSection: reverse.oldSection,
      mappingSource: reverse.mappingSource,
      notes: `Legacy code equivalent: ${reverse.oldAct} § ${reverse.oldSection} (${reverse.notes || ''})`,
      equivalenceType: reverse.equivalenceType,
      isReverseLookup: true
    };
  }

  return undefined;
}
