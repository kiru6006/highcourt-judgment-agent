/**
 * Nyaya AI Reader — Structured Legal Taxonomy v1.0
 * Versioned 8-Domain Hierarchy for Indian High Court Jurisprudence
 * Complies with NyayaReader v1.2.0 M2 Specification
 */

export const TAXONOMY_VERSION = "1.0" as const;

export interface TaxonomySubject {
  id: string;
  label: string;
  description: string;
}

export interface TaxonomyDomain {
  id: string;
  code: string;
  label: string;
  description: string;
  subjects: readonly TaxonomySubject[];
}

export const LEGAL_DOMAINS = [
  {
    id: "domain_constitutional",
    code: "CONST",
    label: "Constitutional Law",
    description: "Matters involving Articles 12-35, 226, 227 of the Constitution, legislative powers, and constitutional validity.",
    subjects: [
      { id: "subj_const_fundamental_rights", label: "Fundamental Rights Enforcement", description: "Enforcement of Articles 14, 19, 21." },
      { id: "subj_const_writ_jurisdiction", label: "Writ Jurisdiction (Art 226/227)", description: "Mandamus, Certiorari, Habeas Corpus, Prohibition, Quo Warranto." },
      { id: "subj_const_legislative_competence", label: "Legislative Competence", description: "Vires of central and state statutes under Schedule VII." },
      { id: "subj_const_election_law", label: "Election Petitions", description: "Disputes arising under the Representation of the People Act." }
    ]
  },
  {
    id: "domain_criminal",
    code: "CRIM",
    label: "Criminal Law",
    description: "Offences, investigation, prosecution, bail, revisions, and statutory appeals.",
    subjects: [
      { id: "subj_crim_bail", label: "Bail & Anticipatory Bail", description: "Sections 437, 438, 439 CrPC / BNSS 478, 480, 482." },
      { id: "subj_crim_quashing", label: "FIR & Chargesheet Quashing", description: "Section 482 CrPC / BNSS Section 528." },
      { id: "subj_crim_appeal", label: "Criminal Appeals", description: "Appeals against conviction or acquittal." },
      { id: "subj_crim_revision", label: "Criminal Revisions", description: "Revisional review under Section 397/401 CrPC." },
      { id: "subj_crim_special_acts", label: "Special Criminal Statutes", description: "NDPS, PMLA, Prevention of Corruption, Arms Act." }
    ]
  },
  {
    id: "domain_civil_property",
    code: "CIVIL",
    label: "Civil & Property Law",
    description: "Private rights, immovable property, contracts, succession, and civil remedies.",
    subjects: [
      { id: "subj_civil_property_title", label: "Property & Title Disputes", description: "Declaration of title, possession, boundary disputes." },
      { id: "subj_civil_land_acquisition", label: "Land Acquisition", description: "Compensation under RFCTLARR Act and predecessor legislation." },
      { id: "subj_civil_specific_performance", label: "Specific Performance & Contracts", description: "Suits under Specific Relief Act and Indian Contract Act." },
      { id: "subj_civil_mact", label: "Motor Accident Claims (MACT)", description: "Compensation under Motor Vehicles Act." },
      { id: "subj_civil_injunction", label: "Injunctions & Civil Remedies", description: "Order XXXIX CPC temporary and permanent injunctions." }
    ]
  },
  {
    id: "domain_commercial_corporate",
    code: "COMM",
    label: "Commercial & Corporate",
    description: "Disputes arising out of mercantile transactions, corporate governance, and debt recovery.",
    subjects: [
      { id: "subj_comm_arbitration", label: "Arbitration & Conciliation", description: "Sections 9, 11, 34, 37 of Arbitration and Conciliation Act 1996." },
      { id: "subj_comm_negotiable_instruments", label: "Negotiable Instruments (Sec 138)", description: "Cheque dishonour and summary commercial proceedings." },
      { id: "subj_comm_insolvency", label: "Insolvency & Bankruptcy (IBC)", description: "Corporate insolvency resolution, liquidation, NCLAT references." },
      { id: "subj_comm_ipr", label: "Intellectual Property Rights", description: "Trademarks, patents, copyright, passing off, design infringement." },
      { id: "subj_comm_banking", label: "Banking & Debt Recovery", description: "SARFAESI Act, RDDBFI Act, recovery tribunals." }
    ]
  },
  {
    id: "domain_service_labour",
    code: "SERV",
    label: "Service & Labour Law",
    description: "Public employment conditions, departmental proceedings, industrial disputes, and wages.",
    subjects: [
      { id: "subj_serv_disciplinary", label: "Disciplinary Proceedings & Inquiries", description: "Departmental charge sheets, suspension, penalties." },
      { id: "subj_serv_seniority_promotion", label: "Seniority & Promotion", description: "Inter-se seniority, roster points, reservation in promotions." },
      { id: "subj_serv_pension_retirement", label: "Pension & Terminal Benefits", description: "Gratuity, provident fund, pension withholding." },
      { id: "subj_serv_industrial_disputes", label: "Industrial Disputes & Strikes", description: "ID Act references, retrenchment, unfair labour practices." }
    ]
  },
  {
    id: "domain_tax_revenue",
    code: "TAX",
    label: "Taxation & Revenue",
    description: "Direct taxes, indirect taxes, customs duties, state excise, and fiscal assessments.",
    subjects: [
      { id: "subj_tax_income_tax", label: "Direct Taxes / Income Tax", description: "Assessment, reassessment under Sec 148, search & seizure." },
      { id: "subj_tax_gst_customs", label: "GST & Customs", description: "Input tax credit, classification, import/export duties." },
      { id: "subj_tax_state_revenue", label: "State Revenue & Stamp Duty", description: "Registration fees, stamp deficit, land revenue cess." }
    ]
  },
  {
    id: "domain_family_matrimonial",
    code: "FAM",
    label: "Family & Matrimonial",
    description: "Marriage dissolution, child custody, maintenance, and family succession.",
    subjects: [
      { id: "subj_fam_divorce", label: "Divorce & Restitution", description: "Hindu Marriage Act, Special Marriage Act dissolution grounds." },
      { id: "subj_fam_custody", label: "Custody & Guardianship", description: "Guardian and Wards Act, best welfare of minor." },
      { id: "subj_fam_maintenance", label: "Maintenance & Domestic Violence", description: "Section 125 CrPC / BNSS 144, DV Act protection orders." }
    ]
  },
  {
    id: "domain_special_regulatory",
    code: "SPEC",
    label: "Special & Regulatory",
    description: "Environmental, education, consumer protection, and administrative regulation.",
    subjects: [
      { id: "subj_spec_environment", label: "Environment & Pollution", description: "NGT appeals, air/water pollution, forest conservation." },
      { id: "subj_spec_education", label: "Education & University Admissions", description: "Affiliation, fee regulation, entrance examination disputes." },
      { id: "subj_spec_consumer", label: "Consumer Protection", description: "Consumer commission appeals, unfair trade practices." }
    ]
  }
] as const;

export type LegalDomainId = (typeof LEGAL_DOMAINS)[number]["id"];
export type LegalDomainCode = (typeof LEGAL_DOMAINS)[number]["code"];

export const DOMAIN_BY_CODE: Record<string, (typeof LEGAL_DOMAINS)[number]> = Object.fromEntries(
  LEGAL_DOMAINS.map(d => [d.code, d])
);

export const DOMAIN_BY_ID: Record<string, (typeof LEGAL_DOMAINS)[number]> = Object.fromEntries(
  LEGAL_DOMAINS.map(d => [d.id, d])
);
