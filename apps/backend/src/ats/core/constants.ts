export const ATS_CONFIG = {
  WEIGHTS: {
    KEYWORD_MATCH: 0.4,
    CONTEXTUAL_RELEVANCE: 0.25,
    EXPERIENCE_ALIGNMENT: 0.15,
    EDUCATION_MATCH: 0.1,
    FORMAT_QUALITY: 0.1,
  },

  KEYWORD_IMPORTANCE: {
    critical: 1.5,
    high: 1.2,
    medium: 1.0,
    low: 0.8,
  },

  THRESHOLDS: {
    EXACT_MATCH: 1.0,
    FUZZY_MATCH: 0.85,
    PARTIAL_MATCH: 0.7,
    CONTEXT_RELEVANCE: 0.75,
  },

  TEXT_PROCESSING: {
    MIN_KEYWORD_LENGTH: 2,
    MAX_KEYWORD_LENGTH: 50,
    STOP_WORDS: [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'a', 'an', 'as', 'by', 'is', 'was', 'are',
      'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'shall', 'can', 'need', 'dare', 'ought', 'used', 'it',
      'its', 'i', 'you', 'he', 'she', 'we', 'they', 'me',
      'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our',
      'their', 'this', 'that', 'these', 'those', 'what', 'which',
      'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
      'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too',
      'very', 'just', 'about', 'over', 'after', 'from', 'into',
    ],
    COMMON_TECH_SYNONYMS: {
      javascript: ['js', 'ecmascript'],
      typescript: ['ts'],
      python: ['py'],
      kubernetes: ['k8s'],
      'ci/cd': ['continuous integration', 'continuous deployment', 'continuous integration/continuous deployment'],
      'machine learning': ['ml', 'ai'],
      'natural language processing': ['nlp'],
      react: ['reactjs', 'react.js'],
      nodejs: ['node.js', 'node'],
      postgresql: ['postgres'],
      mongodb: ['mongo'],
      elasticsearch: ['elastic'],
      express: ['expressjs', 'express.js'],
      angular: ['angularjs', 'angular.js'],
      vue: ['vuejs', 'vue.js'],
      docker: ['containerization'],
      'microservices': ['micro services'],
      rest: ['restful', 'rest api'],
      graphql: ['gql'],
      aws: ['amazon web services'],
      gcp: ['google cloud platform'],
      cicd: ['ci/cd', 'continuous integration', 'continuous deployment'],
    } as Record<string, readonly string[]>,
  },

  LIMITS: {
    MAX_PDF_SIZE: 10 * 1024 * 1024,
    MAX_TEXT_LENGTH: 50000,
    ANALYSIS_TIMEOUT: 30000,
    MAX_KEYWORDS: 100,
  },
} as const

export const SECTION_PATTERNS = {
  EXPERIENCE: /^(work\s+)?experience|employment\s+history|professional\s+experience|career\s+history/i,
  EDUCATION: /^education|academic\s+background|qualifications|academic\s+qualifications/i,
  SKILLS: /^(technical\s+)?skills|competencies|expertise|core\s+competencies|technical\s+proficiencies/i,
  SUMMARY: /^(professional\s+)?summary|profile|objective|about\s+me|professional\s+profile/i,
  CERTIFICATIONS: /^certifications?|licenses?|credentials|professional\s+certifications/i,
  PROJECTS: /^projects?|portfolio|key\s+projects/i,
} as const

export const TECH_SKILL_PATTERNS = [
  /\b(react|angular|vue\.?js|svelte|next\.?js|nuxt)\b/gi,
  /\b(node\.?js|python|java|c\+\+|c#|go|rust|kotlin|swift|scala|php|ruby|dart)\b/gi,
  /\b(typescript|javascript|ecmascript)\b/gi,
  /\b(aws|azure|gcp|google cloud|heroku|digitalocean|vercel|netlify)\b/gi,
  /\b(docker|kubernetes|k8s|terraform|ansible|jenkins|github actions|circleci)\b/gi,
  /\b(sql|postgresql|mysql|mongodb|redis|elasticsearch|cassandra|dynamodb|sqlite)\b/gi,
  /\b(git|svn|mercurial|ci\/cd|devops|agile|scrum|kanban)\b/gi,
  /\b(rest|graphql|grpc|api|microservices|serverless|lambda)\b/gi,
  /\b(html|css|sass|less|tailwind|bootstrap|webpack|vite|babel)\b/gi,
  /\b(express|django|flask|fastapi|spring|laravel|rails|nest\.?js)\b/gi,
  /\b(tensorflow|pytorch|scikit-?learn|pandas|numpy|matplotlib)\b/gi,
  /\b(figma|sketch|adobe|photoshop|illustrator)\b/gi,
] as const

export const SOFT_SKILL_PATTERNS = [
  /\b(leadership|communication|teamwork|collaboration|mentoring)\b/gi,
  /\b(problem.?solving|analytical|critical.?thinking|creativity)\b/gi,
  /\b(agile|scrum|project.?management|time.?management|organization)\b/gi,
  /\b(adaptability|flexibility|resilience|initiative|self.?motivated)\b/gi,
] as const

export const ACTION_VERBS = [
  'achieved', 'developed', 'implemented', 'led', 'managed',
  'created', 'designed', 'improved', 'increased', 'reduced',
  'built', 'launched', 'delivered', 'optimized', 'streamlined',
  'engineered', 'architected', 'deployed', 'scaled', 'automated',
  'spearheaded', 'orchestrated', 'transformed', 'accelerated',
  'established', 'generated', 'maximized', 'drove', 'executed',
] as const

export const CRITICAL_SKILLS = [
  'react', 'angular', 'vue', 'node.js', 'python', 'java', 'c++',
  'aws certified', 'security clearance', 'typescript', 'javascript',
] as const

export const HIGH_SKILLS = [
  'typescript', 'graphql', 'docker', 'kubernetes', 'ci/cd', 'agile',
  'node.js', 'react', 'postgresql', 'mongodb', 'aws', 'azure',
] as const

export const MEDIUM_SKILLS = [
  'git', 'testing', 'debugging', 'documentation', 'code review',
  'rest api', 'ci/cd', 'linux', 'css', 'html',
] as const
