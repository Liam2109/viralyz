export type OutputFormat = "Court" | "Moyen" | "Long";

// ==================== PROMPT FREE ====================
export const PROMPT_ANALYZE = `
Tu es un expert en marketing viral.
Analyse ce contenu vidéo et retourne UNIQUEMENT un JSON valide :
{
  "viralScore": number (0-100, honnête),
  "detectedLanguage": string,
  "detectedNiche": string,
  "detectedTone": string,
  "detectedFormat": string,
  "whyViral": string (100 mots minimum),
  "hookStrength": number (0-100),
  "retentionScore": number (0-100),
  "ctaScore": number (0-100),
  "viralTags": string[] (5 tags),
  "weakPoints": string[] (3 points faibles),
  "opportunities": string[] (3 opportunités)
}
Si c'est une musique sans paroles créateur : viralScore 0 et explique.
Sois honnête — ne gonfle pas les scores.
`;

// ==================== PROMPT CREATOR ====================
export const PROMPT_ANALYZE_CREATOR = `
Tu es un expert mondial en création de contenu viral et psychologie des réseaux sociaux.
Analyse ce contenu vidéo et retourne UNIQUEMENT un JSON valide :
{
  "viralScore": number (0-100, brutalement honnête),
  "detectedLanguage": string,
  "detectedNiche": string,
  "detectedTone": string,
  "detectedFormat": string,
  "whyViral": string (200 mots minimum, analyse précise avec moments clés),
  "hookAnalysis": string (analyse détaillée du hook),
  "retentionAnalysis": string (où les viewers décrochent et pourquoi),
  "ctaAnalysis": string (efficacité du CTA),
  "hookStrength": number (0-100),
  "retentionScore": number (0-100),
  "ctaScore": number (0-100),
  "viralTags": string[] (8 tags précis),
  "weakPoints": string[] (5 points faibles très précis),
  "opportunities": string[] (5 opportunités actionnables),
  "narrativeStructure": {
    "hook": string,
    "development": string,
    "climax": string,
    "cta": string
  },
  "emotions": string[] (émotions déclenchées),
  "algorithmTechniques": string[] (techniques algorithmiques détectées),
  "alternativeHooks": string[] (5 hooks alternatifs prêts à utiliser),
  "keyLearnings": string[] (5 leçons clés)
}
Si c'est une musique sans paroles créateur : viralScore 0 et explique.
Sois brutalement honnête — 85+ signifie vraiment exceptionnel.
`;

// ==================== PROMPT PRO ====================
export const PROMPT_ANALYZE_PRO = `
Tu es le meilleur analyste de contenu viral au monde.
Analyse ce contenu vidéo avec une précision chirurgicale et retourne UNIQUEMENT un JSON valide :
{
  "viralScore": number (0-100, brutalement honnête),
  "detectedLanguage": string,
  "detectedNiche": string,
  "detectedTone": string,
  "detectedFormat": string,
  "whyViral": string (300 mots minimum, analyse ultra-précise),
  "hookAnalysis": string (analyse détaillée seconde par seconde du hook),
  "retentionAnalysis": string (courbe de rétention estimée),
  "ctaAnalysis": string (analyse complète du CTA),
  "hookStrength": number (0-100),
  "retentionScore": number (0-100),
  "ctaScore": number (0-100),
  "editingScore": number (0-100),
  "thumbnailScore": number (0-100),
  "viralTags": string[] (10 tags très précis),
  "weakPoints": string[] (6 points faibles avec exemples),
  "opportunities": string[] (6 opportunités avec actions concrètes),
  "narrativeStructure": {
    "hook": string,
    "development": string,
    "climax": string,
    "cta": string
  },
  "emotions": string[] (toutes les émotions déclenchées),
  "algorithmTechniques": string[] (toutes les techniques algorithmiques),
  "alternativeHooks": string[] (10 hooks alternatifs),
  "keyLearnings": string[] (5 leçons clés actionnables),
  "shootingPlan": string (plan de tournage détaillé),
  "promptToRecreate": string (prompt IA pour recréer une vidéo similaire),
  "checkList": string[] (checklist des éléments à reprendre)
}
Si c'est une musique sans paroles créateur : viralScore 0 et explique.
Sois d'une honnêteté absolue. Un score de 90+ est rarissime.
`;

// ==================== SIMILARITY ====================
export function PROMPT_SIMILARITY(script: string, personalStyle: string): string {
  return `
Tu es un expert en analyse stylistique.
Compare ce script avec le style personnel fourni.
Retourne UNIQUEMENT un JSON : { "similarityScore": number (0-100) }

Script généré :
${script}

Style personnel :
${personalStyle}
`;
}

// ==================== SCRIPT FREE ====================
export function buildPromptScript({
  analysisContext,
  personalStyle,
  videoTitle,
}: {
  platform?: string;
  tone?: string;
  format?: string;
  outputFormat?: OutputFormat;
  language?: string;
  niche?: string;
  personalStyle?: string;
  videoTitle?: string;
  analysisContext: string;
}): string {
  return `
Tu es un expert en création de contenu viral.
Génère UN script basé sur cette analyse.

Titre de la vidéo : ${videoTitle ?? "Inconnu"}
${personalStyle ? `Style personnel : ${personalStyle}` : ""}

Analyse :
${analysisContext}

RÈGLES :
1. Détecte la langue automatiquement et génère dans cette langue
2. Identifie toi-même les grandes parties de la vidéo (hook, développement, climax, CTA) et structure le script en conséquence
3. Hook fort qui arrête le scroll
4. CTA naturel à la fin
5. Immédiatement filmable

Structure le script selon ce que tu détectes dans la vidéo — pas de timecodes imposés.
Utilise des balises claires pour chaque partie que tu identifies.
`;
}

// ==================== SCRIPT CREATOR ====================
export function buildPromptScriptCreator({
  analysisContext,
  personalStyle,
  videoTitle,
}: {
  platform?: string;
  tone?: string;
  format?: string;
  outputFormat?: OutputFormat;
  language?: string;
  niche?: string;
  personalStyle?: string;
  videoTitle?: string;
  analysisContext: string;
}): string {
  return `
Tu es un expert en création de contenu viral.
Génère un script complet et optimisé.

Titre de la vidéo analysée : ${videoTitle ?? "Inconnu"}
${personalStyle ? `Style personnel (IMITE CE STYLE FIDÈLEMENT) : ${personalStyle}` : ""}

Analyse complète :
${analysisContext}

RÈGLES :
1. Détecte la langue automatiquement et génère dans cette langue
2. Identifie les grandes parties naturelles de la vidéo et structure le script selon ces parties
3. Hook IRRÉSISTIBLE qui arrête le scroll
4. Si style personnel fourni, imite fidèlement les expressions et le rythme
5. Immédiatement filmable sans modification

Structure le script selon ce que tu détectes — laisse l'analyse guider la structure.
Utilise des balises claires pour chaque partie.
Génère aussi 5 variantes du hook à la fin.
`;
}

// ==================== SCRIPT PRO ====================
export function buildPromptScriptPro({
  analysisContext,
  personalStyle,
  videoTitle,
}: {
  platform?: string;
  tone?: string;
  format?: string;
  outputFormat?: OutputFormat;
  language?: string;
  niche?: string;
  personalStyle?: string;
  videoTitle?: string;
  analysisContext: string;
}): string {
  return `
Tu es le meilleur ghostwriter de contenu viral au monde.
Génère un script parfait et ultra-détaillé.

Titre de la vidéo analysée : ${videoTitle ?? "Inconnu"}
${personalStyle ? `Style personnel (IMITE CE STYLE À LA PERFECTION) : ${personalStyle}` : ""}

Analyse ultra-détaillée :
${analysisContext}

RÈGLES ABSOLUES :
1. Détecte la langue automatiquement et génère dans cette langue
2. Identifie les grandes parties naturelles de la vidéo selon son format et sa structure
3. Hook qui arrête le scroll en moins de 2 secondes
4. Notes de réalisation pour chaque partie (ton de voix, rythme, énergie)
5. Si style personnel fourni, imite à la perfection
6. Immédiatement filmable

Structure le script selon ce que tu détectes dans la vidéo.
Utilise des balises claires et des emojis pour chaque partie.
Ajoute des notes de réalisation entre parenthèses.
Génère aussi 10 variantes du hook, un plan de tournage et une checklist à la fin.
`;
}