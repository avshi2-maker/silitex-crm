// types.ts (src/lib/types.ts) · updated 10.10.2026 05:50 (Asia/Jerusalem)
export type Product = {
  id: string; product_name: string; brand_family: string; category_sector: string;
  application_field: string; appearance: string; active_content_pct: string; active_matter_type: string;
  viscosity: string; ionicity: string; ph_range: string; dilution_solubility: string; key_features: string;
  food_grade_certifications: string; inci_chemical_name: string; dow_corning_offset_benchmark: string;
};
export type OffsetRow = {
  category_id: string; family: string; dow_corning: string; inci: string; silitex_product: string;
  kosher: string; fda: string; eco_certs: string; offsets: Record<string, string>;
};
export type FoodGrade = { trade_name: string; composition: string; kosher: string; fda: string; application: string; dosage: string; performance: string };
export type Stage = "prospect" | "contacted" | "sample" | "rfq" | "quote" | "negotiation" | "won" | "lost";
export type Lead = {
  id: string; name: string; industry: string; sub_industry: string; product_match: string; use_case: string;
  volume_tons: number; value_usd: number; tier: string; department: string; contact_role: string;
  status: string; stage: Stage;
  contact_name?: string; contact_phone?: string; contact_email?: string; notes?: string; next_action_at?: string;
  // from sales action plan CSV
  recommended_sku?: string; competitor_offset?: string; plan_phase?: string; plan_next_action?: string; plan_stage?: string; plan_target_stage?: Stage;
  city?: string; lat?: number; lon?: number;
  created_at?: string; updated_at?: string;
  intake?: Record<string, string>; // 8-section fact-finding form (config/intake.ts)
  source?: string; // website form / cold call / referral / exhibition / silitex
};
export type DocKind = "tds" | "msds" | "offer" | "other";
export type DocStatus = "sent" | "accepted" | "rejected" | "expired";
export type Doc = { id: string; lead_id: string; lead_name: string; kind: DocKind; title: string; sent_at: string; via: string; status: DocStatus; amount_eur?: number; valid_until?: string; body?: string };
export type SampleStatus = "requested" | "shipped" | "in_lab" | "passed" | "failed";
export type Sample = { id: string; lead_id: string; lead_name: string; sku: string; kg: number; sent_at: string; status: SampleStatus; result?: string; followup_at?: string };
export type Priority = { rank: number; family: string; skus: string; specs: string; targets: string; use_case: string; offsets: string; volume_tons: number; value_usd: number };
export type SniperHit = { query: string; product: string; family: string; category: string; via: string; score: number };
export type Task = { id: string; lead_id: string; lead_name: string; title: string; due: string; cadence: "daily" | "weekly" | "once"; done: boolean; kind: string };
export type Activity = { id: string; lead_id: string; at: string; kind: string; text: string };
export type KbDoc = { id: string; title: string; doc_type: "TDS" | "MSDS" | "SALES" | "OTHER"; product_ref: string; created_at: string; chunks: number };
export type KbChunk = { id: string; doc_id: string; title: string; doc_type: string; product_ref: string; text: string };
export type Usage = { input_tokens: number; output_tokens: number; cost_usd: number; model: string; mock?: boolean };
export type ShipLine = { sku: string; kg: number; pack: string };
export type Shipment = { id: string; ref: string; lead_id?: string; lead_name: string; consignee: "sapirim" | "customer"; mode: "sea" | "air"; lines: ShipLine[]; values: Record<string, string>; docs: Record<string, boolean>; status: string; created_at: string; eta?: string; notes?: string };
export type SilitexContact = { id: string; dept: string; name: string; role: string; email: string; phone?: string; mobile?: string; linkedin?: string; address?: string; notes?: string };
export type ThreadRefs = { shipment_id?: string; shipment_ref?: string; lead_id?: string; lead_name?: string; sku?: string; po?: string; invoice?: string; lot?: string };
export type Thread = { id: string; dept: string; contact_id?: string; subject: string; topic: string; refs: ThreadRefs; due?: string; owner: "sapirim" | "silitex"; status: string; next?: string; created_at: string; last_at: string; conversation_id?: string };
export type HubMsg = { id: string; thread_id: string; at: string; from: string; to: string; direction: "in" | "out"; body: string; source: "paste" | "graph" | "manual"; external_id?: string };
