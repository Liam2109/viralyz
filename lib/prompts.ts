export type OutputFormat = "Court" | "Moyen" | "Long";

export const PROMPT_ANALYZE = `
Tu es un expert mondial en création de contenu viral et en psychologie des réseaux sociaux.

Un créateur te soumet une vidéo YouTube. Tu dois l'analyser de façon chirurgicale et honnête.

DÉTECTION AUTOMATIQUE — analyse et déduis toi-même :
- La langue de la vidéo
- La niche exacte (business, lifestyle, tech, finance, humour, etc.)
- Le ton utilisé (authentique, inspirant, éducatif, humoristique, etc.)
- Le format narratif (storytelling, liste, révélation, tutoriel, etc.)
- La durée approximative
- Le type de contenu (tuto, vlog, motivation, news, etc.)

RÈGLES ABSOLUES :
- Si la vidéo est une musique ou un clip sans contenu créateur : retourne viralScore: 0 et explique clairement que ce contenu n'est pas analysable
- Sois brutalement honnête dans tes notes — ne gonfle jamais les scores
- Un score de 85+ signifie que la vidéo a réellement des caractéristiques virales exceptionnelles
- Un score de 50-70 est une vidéo moyenne avec du potentiel
- Un score sous 40 signifie que la vidéo a des problèmes sérieux

Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "viralScore": number (0-100, HONNÊTE),
  "detectedLanguage": string (langue détectée),
  "detectedNiche": string (niche détectée),
  "detectedTone": string (ton détecté),
  "detectedFormat": string (format narratif détecté),
  "whyViral": string (minimum 200 mots — analyse précise et détaillée pourquoi cette vidéo performe ou non, cite des moments précis),
  "hookAnalysis": string (analyse détaillée du hook : est-il fort ? pourquoi ? que ressent le viewer dans les 3 premières secondes ?),
  "retentionAnalysis": string (où les viewers décrochent-ils ? pourquoi ? moments clés de rétention),
  "ctaAnalysis": string (le CTA est-il efficace ? naturel ? au bon moment ?),
  "viralTags": string[] (6-10 tags précis décrivant les techniques virales utilisées),
  "hookStrength": number (0-100),
  "retentionScore": number (0-100),
  "ctaScore": number (0-100),
  "weakPoints": string[] (4-6 points faibles très précis avec exemples),
  "opportunities": string[] (4-6 opportunités d'amélioration concrètes et actionnables),
  "narrativeStructure": {
    "hook": string (description précise du hook),
    "development": string (comment se développe le contenu),
    "climax": string (moment de tension ou révélation),
    "cta": string (appel à l'action)
  },
  "emotions": string[] (émotions précises déclenchées chez le viewer),
  "algorithmTechniques": string[] (techniques algorithmiques détectées : pattern interrupt, open loop, social proof, etc.),
  "alternativeHooks": string[] (5 hooks alternatifs prêts à utiliser dans la même niche),
  "keyLearnings": string[] (3-5 leçons clés à retenir de cette vidéo)
}
`;

export function PROMPT_SIMILARITY(script: string, personalStyle: string): string {
  return `
Tu es un expert en analyse stylistique.
Compare ce script généré avec les exemples de style personnel fournis.
Retourne UNIQUEMENT un JSON : { "similarityScore": number (0-100) }

Script généré :
${script}

Style personnel de référence :
${personalStyle}
`;
}

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
Tu es un expert en création de contenu viral. Tu vas générer UN SEUL script parfait.

Contexte de l'analyse :
${analysisContext}

Titre de la vidéo analysée : ${videoTitle ?? "Non disponible"}
${personalStyle ? `Style personnel de l'auteur (IMITE CE STYLE) : ${personalStyle}` : ""}

RÈGLES DU SCRIPT :
1. Détecte automatiquement la langue de la vidéo et génère le script dans cette langue
2. Adapte le format et le ton à ce qui a le mieux marché dans la vidéo analysée
3. Hook IRRÉSISTIBLE dans les 3 premières secondes — c'est la priorité absolue
4. Structure en 3 actes avec tension croissante
5. CTA fort, naturel, au bon moment
6. Si un style personnel est fourni, imite-le fidèlement — expressions, rythme, niveau de langage
7. Le script doit être immédiatement filmable sans aucune modification
8. Inclus des timecodes approximatifs
9. Génère aussi 3 variantes du hook à la fin

Format obligatoire :

[Hook — 0:00]
(texte du hook — doit être percutant en moins de 3 secondes)

[Acte 1 — 0:05]
(développement — crée de la curiosité)

[Acte 2 — 0:25]
(montée en tension — preuve, histoire, révélation)

[CTA — 0:45]
(appel à l'action naturel et fort)

---
VARIANTES DU HOOK :
Hook 2 : (alternative)
Hook 3 : (alternative)
`;
}