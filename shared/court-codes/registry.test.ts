import { describe, it, expect } from "vitest";
import { lookupCourtCode, COURT_CODE_REGISTRY } from "./registry";
import { TAXONOMY_VERSION, LEGAL_DOMAINS } from "../taxonomy/v1";
import { migrateJudgmentToV12 } from "../schema";

describe("Taxonomy & Court Code Registry v1.0", () => {
  it("exports valid versioned 8-domain taxonomy hierarchy", () => {
    expect(TAXONOMY_VERSION).toBe("1.0");
    expect(LEGAL_DOMAINS).toHaveLength(8);
    const codes = LEGAL_DOMAINS.map(d => d.code);
    expect(codes).toContain("CONST");
    expect(codes).toContain("CRIM");
    expect(codes).toContain("CIVIL");
    expect(codes).toContain("COMM");
    expect(codes).toContain("SERV");
    expect(codes).toContain("TAX");
    expect(codes).toContain("FAM");
    expect(codes).toContain("SPEC");
  });

  it("resolves Madras High Court Crl.O.P. with verified source URL", () => {
    const entry = lookupCourtCode("33_10", "CRL.OP");
    expect(entry.status).toBe("verified");
    expect(entry.normalizedType).toBe("Crl.O.P.");
    expect(entry.jurisdiction).toBe("Original");
    expect(entry.sourceUrl).toContain("hcmadras.tn.nic.in");
  });

  it("resolves Delhi High Court Bail Appln. with verified status", () => {
    const entry = lookupCourtCode("7_26", "BAIL APPLN.");
    expect(entry.status).toBe("verified");
    expect(entry.normalizedType).toBe("Bail Appln.");
    expect(entry.jurisdiction).toBe("Original");
    expect(entry.sourceUrl).toContain("delhihighcourt.nic.in");
  });

  it("preserves unverified court code as unknown without guessing", () => {
    const raw = "XYZ_UNKNOWN_CODE";
    const entry = lookupCourtCode("33_10", raw);
    expect(entry.status).toBe("unknown");
    expect(entry.code).toBe(raw);
    expect(entry.jurisdiction).toBe("Unknown");
  });

  it("every registry entry possesses a real source URL and verified status", () => {
    expect(COURT_CODE_REGISTRY.length).toBeGreaterThanOrEqual(20);
    for (const item of COURT_CODE_REGISTRY) {
      expect(item.sourceUrl).toMatch(/^https:\/\//);
      expect(item.status).toBe("verified");
      expect(item.jurisdiction).toBeDefined();
    }
  });

  it("migrates existing judgment documents to v1.2 with pending review status", () => {
    const legacyDoc = {
      jid: "test-jid-001",
      case_type: "Crl.O.P.",
      category: "Criminal"
    };
    const migrated = migrateJudgmentToV12(legacyDoc);
    expect(migrated.raw_case_type).toBe("Crl.O.P.");
    expect(migrated.classification_metadata?.reviewStatus).toBe("pending");
    expect(migrated.classification_metadata?.inferredClassification).toEqual([]);
  });
});
