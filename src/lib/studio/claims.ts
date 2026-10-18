// claims.ts (src/lib/studio/claims.ts) · updated 18.10.2026 19:20 (Asia/Jerusalem) — POST STUDIO honesty check: finds over-claims in generated text (full / identical replacement, same chemistry / compliance, exclusive / official distributor, price claims) in HE / EN / RU / IT. Shown as a warning on the result — fix before publishing.
const RULES: [RegExp, string][] = [
  [/תחליפ\S*\s+מל[או]\S*|תחליף\s+זהה|זה(ה|ים)\s+ל|אותה\s+כימיה|אותן\s+תקינות|אותן\s+תעודות|100%\s*תחליף/u, "תחליף מלא / זהה / אותה כימיה"],
  [/\b(full|identical|exact|100%|drop-in)\s+(replacement|substitute|equivalent)|same\s+(chemistry|performance|certification|compliance)/i, "full / identical replacement, same chemistry"],
  [/полн\S*\s+замен|идентичн|т(а|у)\s+же\s+хими/iu, "полная замена / идентичный"],
  [/sostitut\S*\s+(identic|complet)|stessa\s+chimica|identic\S*/i, "sostituto identico / stessa chimica"],
  [/בלעדי|רשמי|exclusive|official\s+distributor|эксклюзивн|официальн|esclusiv|ufficiale/iu, "exclusive / official"],
  [/זול\s+יותר|cheaper|дешевле|più\s+economic/iu, "price claim"],
];
export function claimIssues(text: string): string[] { return RULES.filter(([re]) => re.test(text)).map(([, label]) => label); }
