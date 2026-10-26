// outlook.ts (src/config/outlook.ts) · created 26.10.2026 05:50 (Asia/Jerusalem)
// Microsoft 365 connection (Entra app "Silitex CRM", tenant Sapirim, registered 26/10/2026). These IDs are public, not secrets —
// the app is a single-page app (PKCE): no password is stored anywhere. Permission: Mail.ReadWrite (drafts only — the CRM never sends).
export const MS = {
  clientId: "9c8b9bfe-9aec-42e9-af82-46a8c1bdebf2",
  tenant: "2459bf1f-5726-409d-bf21-b780576aa860",
  callbackPath: "/outlook-callback",
  scope: "openid profile offline_access User.Read Mail.ReadWrite",
  loginHint: "avshi@sapirim.com",
};
