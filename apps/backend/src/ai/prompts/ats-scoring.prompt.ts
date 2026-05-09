export function buildAtsScoringPrompt(
  cvText: string,
  jdText: string,
): string {
  const truncatedCv = cvText.substring(0, 5000)
  const truncatedJd = jdText.substring(0, 3500)

  return `You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of how real ATS platforms (Workday, Greenhouse, Lever, Taleo) parse and score resumes.

Analyze the CV against the Job Description below using a weighted multi-factor scoring model.

You MUST return a single valid JSON object ONLY.
Do NOT include any markdown, code fences, explanation, or text outside the JSON.
Do NOT wrap in \`\`\`json. Return raw JSON only.

Return this exact structure:
{
  "atsScore": <integer 0-100, weighted overall>,
  "scoreBreakdown": {
    "keywordMatch": <integer 0-100>,
    "contextualRelevance": <integer 0-100>,
    "experienceAlignment": <integer 0-100>,
    "educationMatch": <integer 0-100>,
    "formatQuality": <integer 0-100>
  },
  "matchedKeywords": [<string>, ...],
  "missingKeywords": [<string>, ...],
  "topRecommendations": [<string>, <string>, <string>, <string>, <string>],
  "jobTitle": "<detected job title from JD or null>"
}

SCORING MODEL (use these weights for the overall atsScore):
- keywordMatch (40% weight): Are critical technical skills, tools, frameworks, and certifications from the JD present in the CV? Exact and synonym matches count.
- contextualRelevance (25% weight): Are keywords used in meaningful professional context (not just listed)? Does the CV demonstrate actual application of skills?
- experienceAlignment (15% weight): Does the candidate's experience level, career progression, and role history match the JD requirements?
- educationMatch (10% weight): Does the candidate meet education requirements (degree, field, certifications)?
- formatQuality (10% weight): Is the CV well-structured with clear sections, quantifiable achievements, action verbs, and contact info?

OVERALL SCORE CALCULATION:
atsScore = round(keywordMatch * 0.40 + contextualRelevance * 0.25 + experienceAlignment * 0.15 + educationMatch * 0.10 + formatQuality * 0.10)

SCORE INTERPRETATION:
- 70 to 100: Strong match. Most critical keywords present, used in context.
- 40 to 69: Moderate match. Several important gaps exist.
- 0 to 39: Weak match. Major required elements are absent.

KEYWORD ANALYSIS RULES:
- matchedKeywords: Skills/terms found in BOTH the CV and JD (max 20 items)
- missingKeywords: Important skills/terms in the JD but NOT in the CV (max 20 items)
- Focus on: technical skills, programming languages, frameworks, tools, platforms, certifications, methodologies (Agile, Scrum, CI/CD), soft skills explicitly required
- Include synonyms (e.g., "JS" matches "JavaScript", "k8s" matches "Kubernetes")
- Ignore: generic terms like "team player", "hard working", company names, location names

RECOMMENDATIONS RULES:
- Provide 5 specific, actionable recommendations (max 20 words each)
- Prioritize: missing critical skills > experience gaps > formatting issues > education
- Be specific: instead of "add more skills", say "add React and TypeScript to skills section"
- If the candidate already has strong formatting, suggest content improvements

FORMAT QUALITY CHECK:
- Has clear sections: Experience, Education, Skills
- Contains contact info (email, phone, LinkedIn)
- Uses action verbs (developed, led, implemented, achieved)
- Includes quantifiable metrics (percentages, dollar amounts, team sizes)
- Has date ranges for positions and education

CV TEXT:
---
${truncatedCv}
---

JOB DESCRIPTION:
---
${truncatedJd}
---

Return raw JSON only. No extra text before or after.`
}
