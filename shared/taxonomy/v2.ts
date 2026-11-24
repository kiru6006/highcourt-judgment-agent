/**
 * Nyaya AI Reader v1.3.0 — Structured Legal Taxonomy v2.0
 * Comprehensive 13-Domain Hierarchy for Indian High Court Jurisprudence
 */

export const TAXONOMY_VERSION_V2 = "2.0" as const;

export interface TaxonomySubjectV2 {
  id: string;
  label: string;
  description: string;
  keywords: string[];
}

export interface TaxonomyDomainV2 {
  id: string;
  code: string;
  number: string;
  label: string;
  description: string;
  subjects: readonly TaxonomySubjectV2[];
}

export const LEGAL_DOMAINS_V2: readonly TaxonomyDomainV2[] = [
  {
    id: "domain_civil",
    number: "01",
    code: "CIVIL",
    label: "Civil Law",
    description: "Private civil rights, contracts, property titles, recovery, and civil procedure.",
    subjects: [
      { id: "subj_civil_contracts", label: "Contracts", description: "Contract formation, breach, repudiation, and damages.", keywords: ["contract", "agreement", "breach", "damages"] },
      { id: "subj_civil_money_recovery", label: "Money Recovery", description: "Suits for recovery of money, summary suits under Order XXXVII CPC.", keywords: ["money recovery", "summary suit", "decree", "debt"] },
      { id: "subj_civil_specific_performance", label: "Specific Performance", description: "Suits under Specific Relief Act for conveyance or obligations.", keywords: ["specific performance", "agreement to sell", "readiness and willingness"] },
      { id: "subj_civil_injunctions", label: "Injunctions", description: "Temporary and permanent injunctions under Order XXXIX CPC.", keywords: ["injunction", "restraint", "interim relief", "status quo"] },
      { id: "subj_civil_property_title", label: "Property Title", description: "Declaration of title, ownership disputes, and boundaries.", keywords: ["title declaration", "ownership", "possession"] },
      { id: "subj_civil_partition", label: "Partition", description: "Joint family property, coparcenary, and metes and bounds.", keywords: ["partition", "coparcenary", "ancestral", "share"] },
      { id: "subj_civil_succession", label: "Succession", description: "Testamentary and intestate succession, probate, letters of administration.", keywords: ["succession", "probate", "will", "letters of administration"] },
      { id: "subj_civil_tenancy", label: "Tenancy", description: "Rent control, eviction petitions, landlord-tenant disputes.", keywords: ["tenancy", "landlord", "tenant", "eviction", "rent"] },
      { id: "subj_civil_easements", label: "Easements", description: "Right of way, light, waterflow, and customary easements.", keywords: ["easement", "right of way", "servient", "dominant"] },
      { id: "subj_civil_procedure", label: "Civil Procedure", description: "Jurisdiction, res judicata, rejection of plaint under Order VII Rule 11.", keywords: ["cpc", "order vii rule 11", "res judicata", "execution"] }
    ]
  },
  {
    id: "domain_criminal",
    number: "02",
    code: "CRIM",
    label: "Criminal Law",
    description: "Investigation, offences, prosecution, bail, revisions, appeals, and sentencing.",
    subjects: [
      { id: "subj_crim_bail", label: "Bail", description: "Regular bail under Section 437/439 CrPC or BNSS 478/482.", keywords: ["bail", "custody", "surety", "furnish bond"] },
      { id: "subj_crim_anticipatory_bail", label: "Anticipatory Bail", description: "Pre-arrest bail under Section 438 CrPC or BNSS 480.", keywords: ["anticipatory bail", "pre-arrest bail", "apprehension of arrest"] },
      { id: "subj_crim_quashing", label: "FIR Quashing", description: "Inherent powers under Section 482 CrPC / BNSS 528.", keywords: ["quash", "section 482", "bhajan lal", "abuse of process"] },
      { id: "subj_crim_appeal", label: "Criminal Appeals", description: "Appeals against conviction or acquittal.", keywords: ["criminal appeal", "conviction", "acquittal"] },
      { id: "subj_crim_revision", label: "Criminal Revisions", description: "Revisional jurisdiction under Section 397/401 CrPC.", keywords: ["criminal revision", "section 397", "legality and propriety"] },
      { id: "subj_crim_murder", label: "Murder", description: "Homicide offences under Section 302 IPC / BNS 103.", keywords: ["murder", "302 ipc", "culpable homicide"] },
      { id: "subj_crim_assault", label: "Assault", description: "Hurt, grievous hurt, assault under IPC/BNS.", keywords: ["assault", "grievous hurt", "323 ipc", "326 ipc"] },
      { id: "subj_crim_theft", label: "Theft", description: "Theft, robbery, dacoity under IPC/BNS.", keywords: ["theft", "robbery", "dacoity", "stolen property"] },
      { id: "subj_crim_cheating", label: "Cheating", description: "Fraud and inducement under Section 420 IPC / BNS 318.", keywords: ["cheating", "420 ipc", "deception", "inducement"] },
      { id: "subj_crim_breach_trust", label: "Criminal Breach of Trust", description: "Misappropriation and breach of trust under Section 406/409 IPC.", keywords: ["breach of trust", "406 ipc", "409 ipc", "misappropriation"] },
      { id: "subj_crim_sexual_offences", label: "Sexual Offences", description: "Offences against bodily integrity under IPC/BNS.", keywords: ["rape", "376 ipc", "sexual assault"] },
      { id: "subj_crim_ndps", label: "NDPS", description: "Narcotic drugs and psychotropic substances contraband.", keywords: ["ndps", "contraband", "commercial quantity", "section 37"] },
      { id: "subj_crim_pocso", label: "POCSO", description: "Protection of children from sexual offences statutory proceedings.", keywords: ["pocso", "child victim", "statutory presumption"] },
      { id: "subj_crim_cybercrime", label: "Cybercrime", description: "Online identity theft, unauthorized access, hacking under IT Act.", keywords: ["cybercrime", "it act", "66d", "hacking"] },
      { id: "subj_crim_sentencing", label: "Sentencing", description: "Sentence reduction, probation, concurrent vs consecutive sentences.", keywords: ["sentencing", "probation of offenders", "mitigating circumstances"] }
    ]
  },
  {
    id: "domain_constitutional",
    number: "03",
    code: "CONST",
    label: "Constitutional Law",
    description: "Fundamental rights, writ jurisdiction, judicial review, natural justice.",
    subjects: [
      { id: "subj_const_fundamental_rights", label: "Fundamental Rights", description: "Part III rights enforcement.", keywords: ["fundamental rights", "part iii", "constitutional guarantee"] },
      { id: "subj_const_art14", label: "Article 14", description: "Equality before law and prevention of arbitrariness.", keywords: ["article 14", "arbitrary", "discrimination", "equality"] },
      { id: "subj_const_art19", label: "Article 19", description: "Freedom of speech, association, movement, and trade.", keywords: ["article 19", "freedom of speech", "reasonable restrictions"] },
      { id: "subj_const_art21", label: "Article 21", description: "Right to life and personal liberty.", keywords: ["article 21", "right to life", "personal liberty", "due process"] },
      { id: "subj_const_art226", label: "Article 226", description: "High Court extraordinary writ jurisdiction.", keywords: ["article 226", "mandamus", "certiorari", "habeas corpus"] },
      { id: "subj_const_art227", label: "Article 227", description: "Supervisory superintendence over subordinate courts/tribunals.", keywords: ["article 227", "superintendence", "tribunal order"] },
      { id: "subj_const_pil", label: "Public Interest Litigation", description: "Pro bono publico actions on governance and public duties.", keywords: ["pil", "public interest litigation", "locus standi"] },
      { id: "subj_const_validity", label: "Constitutional Validity", description: "Vires of statutes, delegated rules, or government notifications.", keywords: ["ultra vires", "constitutional validity", "legislative competence"] },
      { id: "subj_const_natural_justice", label: "Natural Justice", description: "Audi alteram partem and rule against bias.", keywords: ["natural justice", "audi alteram partem", "fair hearing", "bias"] }
    ]
  },
  {
    id: "domain_administrative_service",
    number: "04",
    code: "SERV",
    label: "Administrative and Service Law",
    description: "Government employment conditions, recruitment, disciplinary proceedings, pensions.",
    subjects: [
      { id: "subj_serv_govt_service", label: "Government Service", description: "Service conditions, regularisation, seniority lists.", keywords: ["service conditions", "seniority", "regularisation"] },
      { id: "subj_serv_recruitment", label: "Recruitment", description: "Selection process, qualifying criteria, notification challenges.", keywords: ["recruitment", "selection", "interview", "notification"] },
      { id: "subj_serv_promotion", label: "Promotion", description: "Departmental promotion committees, quota disputes.", keywords: ["promotion", "dpc", "merit-cum-seniority"] },
      { id: "subj_serv_transfer", label: "Transfer", description: "Administrative transfers, challenge on mala fides.", keywords: ["transfer", "mala fide", "posting", "deputation"] },
      { id: "subj_serv_disciplinary", label: "Disciplinary Proceedings", description: "Departmental inquiries, chargesheets, dismissal.", keywords: ["disciplinary proceedings", "inquiry officer", "chargesheet", "suspension"] },
      { id: "subj_serv_pension", label: "Pension", description: "Gratuity, retirement dues, pensionary benefits.", keywords: ["pension", "gratuity", "retirement", "superannuation"] },
      { id: "subj_serv_admin_decisions", label: "Administrative Decisions", description: "Executive discretion, quasi-judicial orders.", keywords: ["administrative decision", "reasoned order", "executive order"] },
      { id: "subj_serv_govt_orders", label: "Government Orders", description: "Challenge to GOs, policy circulars, office memoranda.", keywords: ["government order", "circular", "office memorandum"] }
    ]
  },
  {
    id: "domain_corporate_commercial",
    number: "05",
    code: "COMM",
    label: "Corporate and Commercial Law",
    description: "Mercantile transactions, corporate insolvency, arbitration, banking, IPR.",
    subjects: [
      { id: "subj_comm_company_disputes", label: "Company Disputes", description: "Oppression and mismanagement, NCLT references, amalgamation.", keywords: ["companies act", "oppression", "mismanagement", "nclt"] },
      { id: "subj_comm_insolvency", label: "Insolvency", description: "Insolvency and Bankruptcy Code (IBC) corporate resolution.", keywords: ["ibc", "insolvency", "cirp", "resolution plan", "moratorium"] },
      { id: "subj_comm_arbitration", label: "Arbitration", description: "Arbitration & Conciliation Act Sections 9, 11, 34, 37.", keywords: ["arbitration", "section 34", "section 11", "arbitral award"] },
      { id: "subj_comm_contracts", label: "Commercial Contracts", description: "Commercial division disputes, letters of credit, bank guarantees.", keywords: ["commercial court", "bank guarantee", "letter of credit"] },
      { id: "subj_comm_shareholders", label: "Shareholder Disputes", description: "Share purchase agreements, voting rights, valuation.", keywords: ["shareholders", "spa", "voting rights", "valuation"] },
      { id: "subj_comm_banking_recovery", label: "Banking Recovery", description: "SARFAESI Act, DRT proceedings, loan defaults.", keywords: ["sarfaesi", "drt", "drat", "debt recovery", "npa"] },
      { id: "subj_comm_ni_act", label: "Negotiable Instruments", description: "Section 138 NI Act cheque dishonour proceedings.", keywords: ["138 ni act", "cheque bounce", "negotiable instruments"] },
      { id: "subj_comm_insurance", label: "Insurance", description: "Repudiation of claims, policy exclusions, consumer claims.", keywords: ["insurance", "claim repudiation", "policy condition"] },
      { id: "subj_comm_competition", label: "Competition", description: "Antitrust, CCI orders, cartelisation.", keywords: ["competition act", "cci", "cartel", "dominant position"] },
      { id: "subj_comm_ipr", label: "Intellectual Property", description: "Trademarks, patents, copyright, designs, passing off.", keywords: ["trademark", "copyright", "patent", "passing off", "infringement"] }
    ]
  },
  {
    id: "domain_property_land",
    number: "06",
    code: "LAND",
    label: "Property, Revenue and Land Law",
    description: "Land acquisition, revenue records, patta, mutation, government land.",
    subjects: [
      { id: "subj_land_acquisition", label: "Land Acquisition", description: "RFCTLARR Act 2013, compensation, lapse of acquisition.", keywords: ["land acquisition", "compensation", "rfctlarr", "section 24"] },
      { id: "subj_land_compensation", label: "Compensation", description: "Enhancement of market value, solatium, interest.", keywords: ["market value", "solatium", "compensation enhancement"] },
      { id: "subj_land_revenue_records", label: "Revenue Records", description: "Jamabandi, Record of Rights (RoR), village accounts.", keywords: ["revenue records", "jamabandi", "record of rights", "ror"] },
      { id: "subj_land_patta", label: "Patta", description: "Grant, cancellation, and transfer of revenue patta.", keywords: ["patta", "patta transfer", "cancellation of patta"] },
      { id: "subj_land_mutation", label: "Mutation", description: "Mutation proceedings before Tehsildar or Revenue Divisional Officer.", keywords: ["mutation", "revenue entry", "tehsildar"] },
      { id: "subj_land_encroachment", label: "Encroachment", description: "Public land eviction, removal of encroachments.", keywords: ["encroachment", "eviction", "public premises"] },
      { id: "subj_land_govt_land", label: "Government Land", description: "Gram sabha land, waterbody protection, poramboke land.", keywords: ["government land", "poramboke", "gram sabha", "water body"] },
      { id: "subj_land_registration", label: "Registration", description: "Registration Act Section 17, refusal to register deeds.", keywords: ["registration act", "sub-registrar", "refusal to register"] },
      { id: "subj_land_stamp_duty", label: "Stamp Duty", description: "Under-valuation, Stamp Act Section 47A, impounding.", keywords: ["stamp duty", "undervaluation", "section 47a"] },
      { id: "subj_land_municipal_property", label: "Municipal Property", description: "Building plan approvals, municipal tax, unauthorized constructions.", keywords: ["municipal corporation", "building plan", "unauthorized construction"] }
    ]
  },
  {
    id: "domain_family",
    number: "07",
    code: "FAM",
    label: "Family Law",
    description: "Matrimonial disputes, divorce, maintenance, child custody, domestic violence.",
    subjects: [
      { id: "subj_fam_marriage", label: "Marriage", description: "Restitution of conjugal rights, nullity, marriage registration.", keywords: ["marriage", "restitution", "nullity", "conjugal rights"] },
      { id: "subj_fam_divorce", label: "Divorce", description: "Cruelty, desertion, mutual consent divorce under Hindu/Special Marriage Acts.", keywords: ["divorce", "cruelty", "desertion", "mutual consent"] },
      { id: "subj_fam_maintenance", label: "Maintenance", description: "Section 125 CrPC / BNSS 144, interim maintenance under HMA Section 24.", keywords: ["maintenance", "125 crpc", "interim maintenance", "alimony"] },
      { id: "subj_fam_custody", label: "Custody", description: "Child custody, visitation rights, paramount welfare of minor.", keywords: ["child custody", "visitation rights", "welfare of child"] },
      { id: "subj_fam_adoption", label: "Adoption", description: "HAMA, CARA guidelines, adoption validity.", keywords: ["adoption", "cara", "hama"] },
      { id: "subj_fam_domestic_violence", label: "Domestic Violence", description: "Protection of Women from Domestic Violence Act (PWDVA) remedies.", keywords: ["domestic violence", "pwdva", "residence order", "protection order"] },
      { id: "subj_fam_guardianship", label: "Guardianship", description: "Guardians and Wards Act proceedings.", keywords: ["guardianship", "guardian", "minor estate"] },
      { id: "subj_fam_succession", label: "Succession", description: "Personal law succession (Hindu, Muslim, Christian, Parsi).", keywords: ["family succession", "mohammedan law", "hindu succession"] }
    ]
  },
  {
    id: "domain_labour_employment",
    number: "08",
    code: "LABOUR",
    label: "Labour and Employment Law",
    description: "Industrial disputes, wrongful termination, wages, trade unions, gratuity.",
    subjects: [
      { id: "subj_labour_industrial_disputes", label: "Industrial Disputes", description: "Industrial Disputes Act references, awards, retrenchment.", keywords: ["industrial disputes act", "retrenchment", "labour court", "industrial tribunal"] },
      { id: "subj_labour_wrongful_termination", label: "Wrongful Termination", description: "Reinstatement with back wages, illegal dismissal.", keywords: ["termination", "dismissal", "reinstatement", "back wages"] },
      { id: "subj_labour_wages", label: "Wages", description: "Payment of Wages Act, Minimum Wages Act, wage settlements.", keywords: ["minimum wages", "payment of wages", "wage settlement"] },
      { id: "subj_labour_trade_unions", label: "Trade Unions", description: "Union recognition, strike legality, unfair labour practices.", keywords: ["trade union", "strike", "unfair labour practice"] },
      { id: "subj_labour_benefits", label: "Employment Benefits", description: "Provident Fund (EPF), ESI, Payment of Gratuity Act.", keywords: ["provident fund", "epf", "esi", "gratuity act"] },
      { id: "subj_labour_workplace_rights", label: "Workplace Rights", description: "Occupational safety, POSH Act inquiries at workplace.", keywords: ["posh act", "workplace harassment", "occupational safety"] }
    ]
  },
  {
    id: "domain_taxation",
    number: "09",
    code: "TAX",
    label: "Taxation Law",
    description: "Direct and indirect taxation, income tax, GST, customs, excise.",
    subjects: [
      { id: "subj_tax_income_tax", label: "Income Tax", description: "Assessment, re-assessment under Section 148, ITAT appeals.", keywords: ["income tax", "section 148", "itat", "assessment"] },
      { id: "subj_tax_gst", label: "GST", description: "Central and State GST, input tax credit (ITC), GST appeals.", keywords: ["gst", "input tax credit", "itc", "cgst", "sgst"] },
      { id: "subj_tax_customs", label: "Customs", description: "Import/export duties, classification, seizure, confiscation.", keywords: ["customs act", "customs duty", "import duty", "confiscation"] },
      { id: "subj_tax_excise", label: "Excise", description: "Central excise, CENVAT credit, manufacture disputes.", keywords: ["central excise", "cenvat", "duty of excise"] },
      { id: "subj_tax_state_taxation", label: "State Taxation", description: "VAT, entry tax, stamp duties, professional tax.", keywords: ["state vat", "entry tax", "sales tax"] },
      { id: "subj_tax_tax_appeals", label: "Tax Appeals", description: "High Court tax references under statutory provisions.", keywords: ["tax appeal", "substantial question of law", "tca"] }
    ]
  },
  {
    id: "domain_cyber_technology",
    number: "10",
    code: "CYBER",
    label: "Cyber and Technology Law",
    description: "Cybercrime, account freeze, electronic evidence, data protection, digital contracts.",
    subjects: [
      { id: "subj_cyber_online_fraud", label: "Online Fraud", description: "Phishing, identity theft, financial fraud under IT Act.", keywords: ["online fraud", "phishing", "identity theft", "section 66"] },
      { id: "subj_cyber_bank_freeze", label: "Banking Account Freeze", description: "Debit freeze petitions under Section 91/102 CrPC on cyber fraud notices.", keywords: ["account freeze", "debit freeze", "section 102 crpc", "cyber cell"] },
      { id: "subj_cyber_upi_fraud", label: "UPI Fraud", description: "Unauthorized electronic fund transfers, payment gateway disputes.", keywords: ["upi fraud", "payment gateway", "unauthorized transaction"] },
      { id: "subj_cyber_electronic_evidence", label: "Electronic Evidence", description: "Section 65B Indian Evidence Act / Section 63 BSA certificate compliance.", keywords: ["electronic evidence", "section 65b", "bsa 63", "call detail records"] },
      { id: "subj_cyber_data_protection", label: "Data Protection", description: "DPDP Act, privacy violations, unauthorized data processing.", keywords: ["data protection", "dpdp", "privacy", "personal data"] },
      { id: "subj_cyber_cybercrime", label: "Cybercrime Offences", description: "Hacking, transmission of obscene material, cyberstalking.", keywords: ["hacking", "cyberstalking", "section 67", "66e"] },
      { id: "subj_cyber_intermediary", label: "Intermediary Liability", description: "IT Act Section 79 safe harbour, social media takedown notices.", keywords: ["intermediary liability", "section 79", "safe harbour", "takedown"] },
      { id: "subj_cyber_digital_contracts", label: "Digital Contracts", description: "Click-wrap, browse-wrap agreements, digital signature validity.", keywords: ["digital signature", "electronic contract", "clickwrap"] }
    ]
  },
  {
    id: "domain_environmental_infrastructure",
    number: "11",
    code: "ENV",
    label: "Environmental and Infrastructure Law",
    description: "Pollution control, forest conservation, mining leases, highway projects.",
    subjects: [
      { id: "subj_env_forests", label: "Forests", description: "Forest Conservation Act, wildlife protection, tree felling permissions.", keywords: ["forest conservation", "wildlife protection", "reserve forest"] },
      { id: "subj_env_pollution", label: "Pollution", description: "Water Act, Air Act, PCB closure notices, effluent discharge.", keywords: ["pollution control board", "effluent", "air act", "water act"] },
      { id: "subj_env_mining", label: "Mining", description: "Mines and Minerals (MMDR Act), sand mining, illegal quarrying.", keywords: ["mmdr act", "mining lease", "sand mining", "quarry"] },
      { id: "subj_env_highways", label: "Highways", description: "National Highways Act, toll plazas, road widening acquisition.", keywords: ["national highways", "nhai", "toll plaza", "road widening"] },
      { id: "subj_env_infrastructure", label: "Infrastructure Projects", description: "Metro rail, airports, power plants, urban development projects.", keywords: ["infrastructure", "metro rail", "development authority"] },
      { id: "subj_env_clearances", label: "Environmental Clearances", description: "EIA notifications, Coastal Regulation Zone (CRZ) clearances.", keywords: ["environmental clearance", "eia", "crz", "green tribunal"] },
      { id: "subj_env_public_works", label: "Public Works", description: "Tenders for dams, bridges, public housing contracts.", keywords: ["public works", "tender", "pwd", "government contract"] },
      { id: "subj_env_land_disputes", label: "Land Acquisition Disputes", description: "Project-affected persons rehabilitation and resettlement.", keywords: ["rehabilitation", "resettlement", "project affected"] }
    ]
  },
  {
    id: "domain_education_social_welfare",
    number: "12",
    code: "EDU",
    label: "Education and Social Welfare Law",
    description: "University governance, examinations, reservations, disability rights, welfare schemes.",
    subjects: [
      { id: "subj_edu_university", label: "University Disputes", description: "Affiliation, UGC guidelines, vice-chancellor appointments.", keywords: ["university", "ugc", "affiliation", "vice-chancellor"] },
      { id: "subj_edu_admissions", label: "Admissions", description: "NEET, JEE, entrance examinations, seat quotas.", keywords: ["admission", "neet", "seat allocation", "counselling"] },
      { id: "subj_edu_examinations", label: "Examinations", description: "Paper leak, evaluation challenges, re-checking petitions.", keywords: ["examination", "re-evaluation", "answer sheet", "hall ticket"] },
      { id: "subj_edu_reservations", label: "Reservations", description: "SC/ST/OBC/EWS affirmative action, creamy layer disputes.", keywords: ["reservation", "ews", "creamy layer", "roster point"] },
      { id: "subj_edu_disability_rights", label: "Disability Rights", description: "Rights of Persons with Disabilities (RPwD) Act accessibility and quotas.", keywords: ["rpwd act", "disability", "reasonable accommodation"] },
      { id: "subj_edu_welfare_benefits", label: "Welfare Benefits", description: "PDS food security, scholarship schemes, welfare disbursement.", keywords: ["welfare scheme", "scholarship", "food security", "pds"] },
      { id: "subj_edu_public_education", label: "Public Education", description: "Right to Education (RTE) Act, teacher eligibility tests (TET).", keywords: ["rte act", "tet", "school education", "free education"] }
    ]
  },
  {
    id: "domain_special_statutes",
    number: "13",
    code: "SPEC",
    label: "Special Statutory Matters",
    description: "Specific statutory regimes: NDPS, POCSO, PC Act, Electricity, Consumer Protection.",
    subjects: [
      { id: "subj_spec_ndps", label: "NDPS", description: "Special NDPS trial procedure, search and seizure under Section 42/50.", keywords: ["ndps act", "section 50 ndps", "search and seizure"] },
      { id: "subj_spec_pocso", label: "POCSO", description: "Special POCSO court orders, compensation to minor victims.", keywords: ["pocso act", "special court", "victim compensation"] },
      { id: "subj_spec_pc_act", label: "Prevention of Corruption", description: "Sanction for prosecution under Section 19 PC Act, trap cases.", keywords: ["prevention of corruption", "pc act", "sanction", "cbi"] },
      { id: "subj_spec_electricity", label: "Electricity", description: "Electricity Act 2003, power theft, tariff fixation, APTEL references.", keywords: ["electricity act", "power theft", "tariff", "discom"] },
      { id: "subj_spec_cooperative", label: "Cooperative Societies", description: "Elections, supersession of managing committees, audit disputes.", keywords: ["cooperative society", "managing committee", "registrar"] },
      { id: "subj_spec_motor_vehicles", label: "Motor Vehicles", description: "MACT compensation awards, permit cancellations, fitness certificates.", keywords: ["mact", "motor vehicles act", "accident claim"] },
      { id: "subj_spec_consumer", label: "Consumer Protection", description: "Consumer Protection Act 2019, State/National Commission orders.", keywords: ["consumer protection", "ncdrc", "deficiency of service"] },
      { id: "subj_spec_state_statutes", label: "State-Specific Statutes", description: "Local land reforms, excise laws, panchayat raj statutes.", keywords: ["state act", "panchayat raj", "local statute"] }
    ]
  }
];

export const UNCLASSIFIED_DOMAIN = {
  id: "domain_unclassified",
  number: "00",
  code: "UNKNOWN",
  label: "Unknown / Unclassified",
  description: "Records where text evidence is insufficient for confident classification. Never hallucinated.",
  subjects: [
    { id: "subj_unclassified_pending", label: "Pending Classification Review", description: "Insufficient metadata or text evidence.", keywords: [] }
  ]
};

export function getDomainById(id: string): TaxonomyDomainV2 | undefined {
  return LEGAL_DOMAINS_V2.find(d => d.id === id);
}

export function getAllSubjects(): readonly TaxonomySubjectV2[] {
  return LEGAL_DOMAINS_V2.flatMap(d => d.subjects);
}
