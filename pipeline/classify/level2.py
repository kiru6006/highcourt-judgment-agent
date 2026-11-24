"""
Nyaya AI Reader — Level 2 Rule-Based Classification Subsystem
Extracts deterministic subject classifications from judgment text for a narrow 10-rule set.
STRICT CONTRACT: A rule fires ONLY if its evidence paragraph anchor is retrievable.
No evidence paragraph -> No label emitted. Never fabricates.
"""

import re
from typing import List, Dict, Any, Pattern, Callable

TAXONOMY_VERSION = "1.0"

class ClassificationRule:
    def __init__(
        self,
        rule_id: str,
        domain_id: str,
        domain_label: str,
        subject_ids: List[str],
        jurisdiction_type: str,
        patterns: List[str],
        evidence_requirement: str,
    ):
        self.rule_id = rule_id
        self.domain_id = domain_id
        self.domain_label = domain_label
        self.subject_ids = subject_ids
        self.jurisdiction_type = jurisdiction_type
        self.patterns = [re.compile(p, re.IGNORECASE) for p in patterns]
        self.evidence_requirement = evidence_requirement

    def evaluate_paragraph(self, text: str) -> bool:
        """Returns True if any pattern matches the paragraph text."""
        return any(pattern.search(text) is not None for pattern in self.patterns)


# Narrow 10-Rule Suite strictly defined by v1.2.0 Specification
LEVEL2_RULES: List[ClassificationRule] = [
    ClassificationRule(
        rule_id="RULE_CRIM_BAIL",
        domain_id="domain_criminal",
        domain_label="Criminal Law",
        subject_ids=["subj_crim_bail"],
        jurisdiction_type="Original",
        patterns=[
            r"\b(section\s+439|section\s+437)\b.*?\b(cr\.?p\.?c|code of criminal procedure)\b",
            r"\b(section\s+480|section\s+482)\b.*?\b(bnss|bharatiya nagarik suraksha sanhita)\b",
            r"\bgrant\s+of\s+(regular\s+)?bail\b",
            r"\bapplication\s+for\s+bail\b",
            r"\bpetitioner\s+is\s+enlarged\s+on\s+bail\b",
        ],
        evidence_requirement="Explicit mention of bail statutory provision (Sec 437/439 CrPC / BNSS 480/482) or prayer for grant of bail.",
    ),
    ClassificationRule(
        rule_id="RULE_CRIM_ANT_BAIL",
        domain_id="domain_criminal",
        domain_label="Criminal Law",
        subject_ids=["subj_crim_bail", "subj_crim_anticipatory_bail"],
        jurisdiction_type="Original",
        patterns=[
            r"\bsection\s+438\b.*?\b(cr\.?p\.?c|code of criminal procedure)\b",
            r"\bsection\s+482\b.*?\b(bnss|bharatiya nagarik suraksha sanhita)\b.*?\banticipatory\b",
            r"\banticipatory\s+bail\b",
            r"\bpre-?arrest\s+bail\b",
            r"\bin\s+the\s+event\s+of\s+arrest\b",
        ],
        evidence_requirement="Explicit mention of pre-arrest/anticipatory bail or Sec 438 CrPC.",
    ),
    ClassificationRule(
        rule_id="RULE_CRIM_FIR_QUASH",
        domain_id="domain_criminal",
        domain_label="Criminal Law",
        subject_ids=["subj_crim_quashing"],
        jurisdiction_type="Original",
        patterns=[
            r"\bsection\s+482\b.*?\b(cr\.?p\.?c|code of criminal procedure)\b.*?\bquash",
            r"\bsection\s+528\b.*?\b(bnss|bharatiya nagarik suraksha sanhita)\b.*?\bquash",
            r"\bquash(ing)?\s+(of\s+)?(the\s+)?(first\s+information\s+report|fir|charge\s*sheet|proceedings)\b",
            r"\bprayer\s+to\s+quash\b",
            r"\bexercise\s+inherent\s+powers\s+under\s+section\s+482\b",
        ],
        evidence_requirement="Invocation of inherent powers under Sec 482 CrPC / Sec 528 BNSS to quash FIR, chargesheet, or criminal proceedings.",
    ),
    ClassificationRule(
        rule_id="RULE_CIVIL_LAND_ACQ",
        domain_id="domain_civil_property",
        domain_label="Civil & Property Law",
        subject_ids=["subj_civil_land_acquisition"],
        jurisdiction_type="Original",
        patterns=[
            r"\bland\s+acquisition\s+act\b",
            r"\bright\s+to\s+fair\s+compensation\s+and\s+transparency\b",
            r"\brfctlarr\b",
            r"\benhancement\s+of\s+compensation\b.*?\b(acquired\s+land|acquisition)\b",
            r"\bnotification\s+under\s+section\s+(4|6|11|19)\b.*?\bland\s+acquisition\b",
        ],
        evidence_requirement="Citation of Land Acquisition Act or RFCTLARR Act with respect to acquisition award or compensation.",
    ),
    ClassificationRule(
        rule_id="RULE_SERV_MATTERS",
        domain_id="domain_service_labour",
        domain_label="Service & Labour Law",
        subject_ids=["subj_serv_disciplinary", "subj_serv_seniority_promotion"],
        jurisdiction_type="Writ",
        patterns=[
            r"\bdisciplinary\s+proceedings\b",
            r"\bdepartmental\s+enquiry\b",
            r"\bseniority\s+list\b",
            r"\bcompassionate\s+appointment\b",
            r"\bpensionary\s+benefits\b",
            r"\btermination\s+of\s+service\b",
            r"\bdenial\s+of\s+promotion\b",
        ],
        evidence_requirement="Disputes relating to public employment conditions, departmental inquiries, seniority, or pension.",
    ),
    ClassificationRule(
        rule_id="RULE_COMM_TENDERS",
        domain_id="domain_commercial_corporate",
        domain_label="Commercial & Corporate",
        subject_ids=["subj_comm_government_tenders"],
        jurisdiction_type="Writ",
        patterns=[
            r"\bnotice\s+inviting\s+tender\b",
            r"\b(e-?tender|tender\s+document|rfp|request\s+for\s+proposal)\b",
            r"\btechnical\s+bid\b.*?\b(financial\s+bid|disqualification|rejection)\b",
            r"\bl-?1\s+bidder\b",
            r"\bcancellation\s+of\s+tender\b",
        ],
        evidence_requirement="Public procurement or government contract dispute involving tender conditions, bids, or award.",
    ),
    ClassificationRule(
        rule_id="RULE_FAM_MATRIMONIAL",
        domain_id="domain_family_matrimonial",
        domain_label="Family & Matrimonial",
        subject_ids=["subj_fam_divorce", "subj_fam_maintenance"],
        jurisdiction_type="Appellate",
        patterns=[
            r"\bhindu\s+marriage\s+act\b",
            r"\bdissolution\s+of\s+marriage\b",
            r"\bdecree\s+of\s+divorce\b",
            r"\bsection\s+13\b.*?\bhindu\s+marriage\s+act\b",
            r"\brestitution\s+of\s+conjugal\s+rights\b",
            r"\bsection\s+125\b.*?\b(cr\.?p\.?c|code of criminal procedure)\b.*?\bmaintenance\b",
            r"\bpermanent\s+alimony\b",
        ],
        evidence_requirement="Matrimonial dispute under Hindu Marriage Act, Special Marriage Act, or maintenance under Sec 125 CrPC.",
    ),
    ClassificationRule(
        rule_id="RULE_COMM_ARBITRATION",
        domain_id="domain_commercial_corporate",
        domain_label="Commercial & Corporate",
        subject_ids=["subj_comm_arbitration"],
        jurisdiction_type="Original",
        patterns=[
            r"\barbitration\s+and\s+conciliation\s+act\b",
            r"\bsection\s+11\(?6\)?\b.*?\barbitrat",
            r"\bsection\s+34\b.*?\barbitral\s+award\b",
            r"\bsection\s+9\b.*?\binterim\s+measures\b",
            r"\bappointment\s+of\s+(sole\s+)?arbitrator\b",
        ],
        evidence_requirement="Arbitration dispute under Arbitration & Conciliation Act 1996 for appointment, interim relief, or award challenge.",
    ),
    ClassificationRule(
        rule_id="RULE_COMM_INSOLVENCY",
        domain_id="domain_commercial_corporate",
        domain_label="Commercial & Corporate",
        subject_ids=["subj_comm_insolvency"],
        jurisdiction_type="Appellate",
        patterns=[
            r"\binsolvency\s+and\s+bankruptcy\s+code\b",
            r"\bibc,?\s*2016\b",
            r"\bcorporate\s+insolvency\s+resolution\s+process\b",
            r"\bcirp\b",
            r"\bsection\s+[79]\b.*?\b(ibc|insolvency)\b",
            r"\bnclat\b",
        ],
        evidence_requirement="Insolvency resolution proceedings under the Insolvency and Bankruptcy Code (IBC 2016).",
    ),
    ClassificationRule(
        rule_id="RULE_CONST_PETITION",
        domain_id="domain_constitutional",
        domain_label="Constitutional Law",
        subject_ids=["subj_const_fundamental_rights", "subj_const_writ_jurisdiction"],
        jurisdiction_type="Writ",
        patterns=[
            r"\barticle\s+226\b.*?\bconstitution\s+of\s+india\b",
            r"\bwrit\s+of\s+(mandamus|certiorari|habeas\s+corpus|quo\s+warranto|prohibition)\b",
            r"\bviolation\s+of\s+article\s+(14|19|21)\b",
            r"\bultra\s+vires\s+the\s+constitution\b",
            r"\bexercise\s+of\s+extraordinary\s+writ\s+jurisdiction\b",
        ],
        evidence_requirement="Extraordinary writ jurisdiction under Article 226 or constitutional challenge to statute/executive action.",
    ),
]


def classify_level2(paragraphs: List[str]) -> List[Dict[str, Any]]:
    """
    Evaluates judgment text paragraphs against the 10 narrow Level 2 classification rules.
    Returns list of ClassificationRecord dicts.
    RULE ENFORCEMENT: A rule fires ONLY if its evidence paragraph is found.
    If evidenceParagraphs is empty, no classification record is emitted.
    """
    if not paragraphs:
        return []

    inferred_records: List[Dict[str, Any]] = []

    for rule in LEVEL2_RULES:
        evidence_indices: List[int] = []

        for idx, para in enumerate(paragraphs):
            if rule.evaluate_paragraph(para):
                evidence_indices.append(idx)

        # STRICT SPEC CONTRACT: No evidence -> No label.
        if evidence_indices:
            inferred_records.append({
                "ruleId": rule.rule_id,
                "method": "rule",
                "taxonomyVersion": TAXONOMY_VERSION,
                "domainId": rule.domain_id,
                "domainLabel": rule.domain_label,
                "subjectIds": rule.subject_ids,
                "jurisdictionType": rule.jurisdiction_type,
                "confidence": 0.85,
                "evidenceParagraphs": evidence_indices,
                "evidenceRequirement": rule.evidence_requirement,
                "reviewStatus": "pending",
            })

    return inferred_records
