// mammoth-browser.d.ts (src/types/mammoth-browser.d.ts) · updated 16.10.2026 18:10 (Asia/Jerusalem) — types for the browser build of mammoth (.docx → text, used by /meetings upload)
declare module "mammoth/mammoth.browser" {
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string; messages: unknown[] }>;
}
