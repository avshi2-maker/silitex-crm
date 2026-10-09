// types.ts (src/lib/types.ts) · updated 09.10.2026 12:30 (Asia/Jerusalem)
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
export type Stage = "prospect" | "contacted" | "sample" | "quote" | "negotiation" | "won" | "lost";
export type Lead = {
  id: string; name: string; industry: string; sub_industry: string; product_match: string; use_case: string;
  volume_tons: number; value_usd: number; tier: string; department: string; contact_role: string;
  status: string; stage: Stage;
  contact_name?: string; contact_phone?: string; contact_email?: string; notes?: string; next_action_at?: string;
  // from sales action plan CSV
  recommended_sku?: string; competitor_offset?: string; plan_phase?: string; plan_next_action?: string; plan_stage?: string; plan_target_stage?: Stage;
  city?: string; lat?: number; lon?: number;
};
export type SampleStatus = "requested" | "shipped" | "in_lab" | "passed" | "failed";
export type Sample = { id: string; lead_id: string; lead_name: string; sku: string; kg: number; sent_at: string; status: SampleStatus; result?: string; followup_at?: string };
export type Priority = { rank: number; family: string; skus: string; specs: string; targets: string; use_case: string; offsets: string; volume_tons: number; value_usd: number };
export type SniperHit = { query: string; product: string; family: string; category: string; via: string; score: number };
export type Task = { id: string; lead_id: string; lead_name: string; title: string; due: string; cadence: "daily" | "weekly" | "once"; done: boolean; kind: string };
export type Activity = { id: string; lead_id: string; at: string; kind: string; text: string };
export type KbDoc = { id: string; title: string; doc_type: "TDS" | "MSDS" | "SALES" | "OTHER"; product_ref: string; created_at: string; chunks: number };
export type KbChunk = { id: string; doc_id: string; title: string; doc_type: string; product_ref: string; text: string };
export type Usage = { input_tokens: number; output_tokens: number; cost_usd: number; model: string; mock?: boolean };
