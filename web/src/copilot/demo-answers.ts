import { GroundedAnswer } from './verifier';

export interface DemoAnswerEntry {
  task: string;
  question: string;
  answer: GroundedAnswer;
}

export const DEMO_PRESETS: Record<string, DemoAnswerEntry[]> = {
  default: [
    {
      task: 'ratio',
      question: 'What is the core holding / ratio decidendi of this judgment?',
      answer: {
        summary: 'Commercial breach of contract cannot give rise to cheating or criminal prosecution absent dishonest intention at inception.',
        claims: [
          {
            claimText: 'Cheating offence under Section 420 IPC requires dishonest intention at the time of inducement.',
            jid: 'demo',
            paraIndex: 6,
            verbatimQuote: 'a mere civil breach of contract cannot give rise to criminal liability under Section 420 of IPC without fraudulent inducement',
            verified: true
          },
          {
            claimText: 'High Court exercises inherent powers under Section 482 to prevent abuse of process in civil disputes.',
            jid: 'demo',
            paraIndex: 7,
            verbatimQuote: 'continuation of criminal proceedings would constitute an abuse of process of Court',
            verified: true
          }
        ],
        insufficientEvidence: false
      }
    },
    {
      task: 'bns_mapping',
      question: 'How do the cited penal provisions translate to the Bharatiya Nyaya Sanhita (BNS)?',
      answer: {
        summary: 'Section 420 IPC maps directly to Section 318 BNS; Section 482 CrPC maps to Section 528 BNSS.',
        claims: [
          {
            claimText: 'Petition filed under Section 482 of CrPC seeking quashing.',
            jid: 'demo',
            paraIndex: 1,
            verbatimQuote: 'filed under Section 482 of CrPC seeking to quash the charge sheet',
            verified: true
          }
        ],
        insufficientEvidence: false
      }
    },
    {
      task: 'bail',
      question: 'What directions or conditions were imposed in the final order?',
      answer: {
        summary: 'The criminal proceedings and impugned charge sheet were ordered to be quashed in their entirety.',
        claims: [
          {
            claimText: 'Final quashing order granted by the Court.',
            jid: 'demo',
            paraIndex: 8,
            verbatimQuote: 'the Criminal Original Petition stands allowed and proceedings are hereby quashed',
            verified: true
          }
        ],
        insufficientEvidence: false
      }
    }
  ]
};

export function getDemoAnswer(task: string, docJid?: string): GroundedAnswer | null {
  const list = (docJid && DEMO_PRESETS[docJid]) || DEMO_PRESETS.default;
  const match = list.find(item => item.task === task || item.question.toLowerCase().includes(task.toLowerCase()));
  return match ? match.answer : list[0].answer;
}
