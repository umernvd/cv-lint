export function buildRewritePrompt(
  bulletText: string,
  jdText: string,
  missingKeywords: string[],
): string {
  const truncatedJd = jdText.substring(0, 2000)
  const keywordList = missingKeywords.slice(0, 10).join(', ')

  return `You are an expert resume writer specializing in ATS optimization.

Rewrite the resume bullet point below to better match the job description.
Naturally incorporate these missing keywords where relevant: ${keywordList}

You MUST return a single valid JSON object ONLY.
Do NOT include markdown, code fences, or any text outside the JSON.
Return raw JSON only.

Return this exact structure:
{
  "suggestions": [
    { "text": "<rewritten bullet>", "explanation": "<why this version is better, max 15 words>" },
    { "text": "<alternative rewrite>", "explanation": "<why this version is better, max 15 words>" },
    { "text": "<third option>", "explanation": "<why this version is better, max 15 words>" }
  ]
}

Rules for rewrites:
- Keep the same role/responsibility — do not invent fake experience
- Use strong action verbs at the start
- Be specific and quantifiable where possible
- Each rewrite must be 1 sentence, max 25 words
- Naturally include relevant missing keywords, do not force them

ORIGINAL BULLET:
---
${bulletText}
---

JOB DESCRIPTION (for context):
---
${truncatedJd}
---

Return raw JSON only.`
}
