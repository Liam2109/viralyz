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
  "hookStrength": number (0-100),
  "retentionScore": number (0-100),
  "ctaScore": number (0-100),
  "viralTags": string[] (5 tags),
  "whyViral": string (100 mots minimum),
  "weakPoints": string[] (3 points faibles),
  "opportunities": string[] (3 opportunités),
  "fullReport": string (rapport complet en markdown avec ces sections : ## Pourquoi cette vidéo performe\n## Points forts\n## Points faibles\n## Ce que tu dois retenir\n\nUtilise du gras, des bullet points, des emojis. Minimum 300 mots. Sois précis et actionnable.)
}
Si c'est une musique sans paroles créateur : viralScore 0 et explique dans fullReport.
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
  "hookStrength": number (0-100),
  "hookAnalysis": string,
  "retentionScore": number (0-100),
  "retentionAnalysis": string,
  "ctaScore": number (0-100),
  "ctaAnalysis": string,
  "viralTags": string[] (8 tags précis),
  "whyViral": string (200 mots minimum),
  "weakPoints": string[] (5 points faibles),
  "opportunities": string[] (5 opportunités),
  "narrativeStructure": { "hook": string, "development": string, "climax": string, "cta": string },
  "emotions": string[],
  "algorithmTechniques": string[],
  "alternativeHooks": string[] (5 hooks),
  "keyLearnings": string[] (5 leçons),
  "fullReport": string (rapport complet en markdown avec ces sections : ## 🎯 Analyse virale\n## 🪝 Hook\n## 📈 Rétention\n## 💬 Call to Action\n## 💪 Points forts\n## ⚠️ Points faibles\n## 🚀 Opportunités\n## 🧠 Ce que tu dois retenir\n## 🎣 5 hooks alternatifs\n\nUtilise du gras, des bullet points, des emojis. Minimum 600 mots. Sois chirurgical et actionnable.)
}
Si c'est une musique sans paroles créateur : viralScore 0 et explique dans fullReport.
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
  "hookStrength": number (0-100),
  "hookAnalysis": string,
  "retentionScore": number (0-100),
  "retentionAnalysis": string,
  "ctaScore": number (0-100),
  "ctaAnalysis": string,
  "editingScore": number (0-100),
  "thumbnailScore": number (0-100),
  "viralTags": string[] (10 tags),
  "whyViral": string (300 mots minimum),
  "weakPoints": string[] (6 points faibles),
  "opportunities": string[] (6 opportunités),
  "narrativeStructure": { "hook": string, "development": string, "climax": string, "cta": string },
  "emotions": string[],
  "algorithmTechniques": string[],
  "alternativeHooks": string[] (10 hooks),
  "keyLearnings": string[] (5 leçons),
  "shootingPlan": string,
  "promptToRecreate": string,
  "checkList": string[],
  "fullReport": string (rapport complet en markdown avec ces sections : ## 🎯 Analyse virale complète\n## 🪝 Analyse du hook\n## 📈 Courbe de rétention\n## 💬 Analyse du CTA\n## 🎬 Montage et production\n## 💪 Points forts détaillés\n## ⚠️ Points faibles détaillés\n## 🚀 Opportunités concrètes\n## 🧠 Leçons clés\n## 🎣 10 hooks alternatifs\n## 🎬 Plan de tournage\n## ✅ Checklist\n\nUtilise du gras, des bullet points, des emojis. Minimum 1000 mots. Sois d'une précision chirurgicale.)
}
Si c'est une musique sans paroles créateur : viralScore 0 et explique dans fullReport.
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
2. Identifie les grandes parties naturelles de la vidéo et structure le script en conséquence
3. Hook fort qui arrête le scroll
4. CTA naturel à la fin
5. Immédiatement filmable
6. Utilise des balises claires pour chaque partie
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
6. Utilise des balises claires avec emojis pour chaque partie
7. Génère 5 variantes du hook à la fin
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
7. Utilise des balises claires avec emojis et notes de réalisation
8. Génère 10 variantes du hook, un plan de tournage et une checklist à la fin
`;
}