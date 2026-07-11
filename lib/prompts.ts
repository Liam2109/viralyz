export type OutputFormat = "Court" | "Moyen" | "Long";

export const PROMPT_ANALYZE = `
Tu es un expert en marketing viral et en algorithmes des réseaux sociaux.
Analyse cette transcription ou ce contenu vidéo et retourne UNIQUEMENT un JSON valide avec exactement cette structure :
{
  "viralScore": number (0-100, sois honnête et précis),
  "whyViral": string (explication détaillée, minimum 150 mots, 5 points clés précis),
  "viralTags": string[] (5-8 tags décrivant les techniques virales utilisées),
  "hookStrength": number (0-100),
  "hookExplanation": string (explication précise du hook),
  "retentionScore": number (0-100),
  "retentionExplanation": string (pourquoi les gens restent ou partent),
  "ctaScore": number (0-100),
  "ctaExplanation": string (analyse du call to action),
  "weakPoints": string[] (3-5 points faibles précis),
  "opportunities": string[] (3-5 opportunités d'amélioration actionnables),
  "narrativeStructure": {
    "hook": string,
    "development": string,
    "climax": string,
    "cta": string
  },
  "emotions": string[] (émotions déclenchées chez le viewer),
  "algorithmTechniques": string[] (techniques algorithmiques détectées)
}

RÈGLES IMPORTANTES :
- Si le contenu est une musique sans paroles créateur, retourne viralScore: 0 et explique dans whyViral que ce contenu n'est pas analysable comme vidéo créateur.
- Sois absolument honnête dans ta notation. Ne gonfle pas les scores.
- Analyse uniquement ce qui est réellement présent dans le contenu.
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
  platform,
  tone,
  format,
  outputFormat,
  language,
  niche,
  personalStyle,
  videoTitle,
  analysisContext,
}: {
  platform: string;
  tone: string;
  format: string;
  outputFormat: OutputFormat;
  language: string;
  niche: string;
  personalStyle?: string;
  videoTitle?: string;
  analysisContext: string;
}): string {
  const durationMap: Record<OutputFormat, string> = {
    Court: "30 à 60 secondes (environ 100-150 mots parlés)",
    Moyen: "2 à 3 minutes (environ 300-450 mots parlés)",
    Long: "5 à 10 minutes (environ 750-1500 mots parlés)",
  };

  return `
Tu es un expert en création de contenu viral.
En te basant sur l'analyse fournie, génère un script complet et prêt à filmer.

Paramètres :
- Plateforme : ${platform}
- Ton : ${tone}
- Format narratif : ${format}
- Durée cible : ${durationMap[outputFormat]}
- Langue et registre : ${language}
- Niche : ${niche}
- Titre de la vidéo analysée : ${videoTitle ?? "Non disponible"}
${personalStyle ? `- Style personnel de l'auteur : ${personalStyle}` : ""}

Analyse de référence :
${analysisContext}

RÈGLES DU SCRIPT :
1. Hook irrésistible dans les 3 premières secondes
2. Respecte exactement la durée cible
3. Utilise le format narratif demandé
4. Imite le style personnel si fourni
5. Inclus des timecodes approximatifs
6. Termine par un CTA fort et naturel
7. Le script doit être immédiatement filmable

Format de sortie obligatoire :
[Hook — 0:00]
(texte du hook)

[Acte 1 — 0:05]
(développement)

[Acte 2 — 0:25]
(climax)

[CTA — 0:45]
(call to action)
`;
}