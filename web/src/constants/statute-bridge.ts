/**
 * Official Statute Transition Bridge Tables
 * Sourced from data/mappings/statute_transitions.csv
 * Verified against Official Gazette publications of Bharatiya Nyaya Sanhita (BNS),
 * Bharatiya Nagarik Suraksha Sanhita (BNSS), and Bharatiya Sakshya Adhiniyam (BSA).
 */

export interface StatuteTransition {
  oldAct: string;
  oldSection: string;
  newAct: string;
  newSection: string;
  mappingSource: string;
  notes?: string;
}

export const OFFICIAL_STATUTE_TRANSITIONS: StatuteTransition[] = [
  // CrPC -> BNSS
  { oldAct: 'CrPC', oldSection: '482', newAct: 'BNSS', newSection: '528', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Inherent powers of High Court to quash' },
  { oldAct: 'CrPC', oldSection: '439', newAct: 'BNSS', newSection: '483', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Special powers of High Court or Court of Session regarding bail' },
  { oldAct: 'CrPC', oldSection: '438', newAct: 'BNSS', newSection: '482', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)' },
  { oldAct: 'CrPC', oldSection: '167', newAct: 'BNSS', newSection: '187', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Procedure when investigation cannot be completed in twenty-four hours (Remand)' },
  { oldAct: 'CrPC', oldSection: '313', newAct: 'BNSS', newSection: '351', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Power to examine the accused' },
  { oldAct: 'CrPC', oldSection: '154', newAct: 'BNSS', newSection: '173', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Information in cognizable cases (FIR)' },

  // IPC -> BNS
  { oldAct: 'IPC', oldSection: '420', newAct: 'BNS', newSection: '318', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Cheating and dishonestly inducing delivery of property' },
  { oldAct: 'IPC', oldSection: '406', newAct: 'BNS', newSection: '316', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Punishment for criminal breach of trust' },
  { oldAct: 'IPC', oldSection: '302', newAct: 'BNS', newSection: '103', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Punishment for murder' },
  { oldAct: 'IPC', oldSection: '307', newAct: 'BNS', newSection: '109', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Attempt to murder' },
  { oldAct: 'IPC', oldSection: '376', newAct: 'BNS', newSection: '64', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Punishment for rape' },
  { oldAct: 'IPC', oldSection: '498A', newAct: 'BNS', newSection: '85', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Husband or relative of husband subjecting woman to cruelty' },
  { oldAct: 'IPC', oldSection: '120B', newAct: 'BNS', newSection: '61', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Punishment of criminal conspiracy' },

  // IEA -> BSA
  { oldAct: 'IEA', oldSection: '27', newAct: 'BSA', newSection: '23', mappingSource: 'OFFICIAL_GAZETTE', notes: 'How much of information received from accused may be proved (Recovery)' },
  { oldAct: 'IEA', oldSection: '65B', newAct: 'BSA', newSection: '63', mappingSource: 'OFFICIAL_GAZETTE', notes: 'Admissibility of electronic records' }
];

export function lookupTransition(actCode: string, section: string): StatuteTransition | undefined {
  const normSec = section.trim().toUpperCase().replace(/^SEC(?:TION)?\.?\s*/i, '');
  return OFFICIAL_STATUTE_TRANSITIONS.find(
    t => t.oldAct.toUpperCase() === actCode.trim().toUpperCase() && t.oldSection.toUpperCase() === normSec
  );
}
