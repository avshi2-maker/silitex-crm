# Partner access (Silitex staff) — 13/10/2026
Purpose: let Federica / Silitex agents use the knowledge tools (not the sales CRM) — proof of capability, relationship hook, usage evidence for a later service-fee conversation.

## Setup (Vercel → Environment Variables)
`PARTNER_PINS` = `federica:4821,marco:7733` (name:pin pairs, comma separated; names lower-case). Redeploy after changing.
Supabase: run the `partner_usage` block at the end of `supabase/schema.sql`.

## Sign-in
https://silitex.marble-art.co.il/login → tab **Silitex partner** → name + PIN (or link `/login?partner=1`). Cookie 90 days.

## What a partner can open (PARTNER_PREFIXES in src/lib/gate.ts)
/partner (landing) · /ask · /products (catalogue 2026 + site list) · /offsets · /formulations · /faq · /catalogues/*.pdf · /api/ai
Everything else (leads, pipeline, hub, pricing, notes, market, partners) → 403 / redirect to /partner. Nav shows only these items + confidentiality footer. UI defaults to English for partners.

## Usage analytics (owner only)
/partners — logins, AI questions, tokens, $ per partner + last 50 questions. Source: table `partner_usage`, written by /api/ai when the request carries the `x-partner` header (set by middleware).

## What to say
"I built a knowledge tool on your catalogues for my own sales work. You're welcome to use it — here's a login. If it's useful to your other agents we can talk about that later."

## "Ask Sapirim" button (13/10/2026 07:20)
Floating 💬 on every partner page → popup (page auto-filled, topic optional, note) → POST /api/partner/feedback → Supabase `partner_feedback` + email to FORMS_TO (avshi@sapirim.com) via Resend (RESEND_API_KEY / FORMS_FROM as for customer forms). Owner inbox: /partners (mark replied). Follow-up date shown on /partner: env `NEXT_PUBLIC_FOLLOWUP_DATE` (default 27/10/2026).
Run the `partner_feedback` block in supabase/schema.sql.
