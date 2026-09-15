import type { LangCode } from "./types";

export interface Language {
  code: LangCode;
  name: string;
  native: string;
  bcp47: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", native: "English", bcp47: "en-IN" },
  { code: "hi", name: "Hindi", native: "हिन्दी", bcp47: "hi-IN" },
  { code: "bn", name: "Bengali", native: "বাংলা", bcp47: "bn-IN" },
  { code: "te", name: "Telugu", native: "తెలుగు", bcp47: "te-IN" },
  { code: "mr", name: "Marathi", native: "मराठी", bcp47: "mr-IN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", bcp47: "ta-IN" },
  { code: "ur", name: "Urdu", native: "اردو", bcp47: "ur-IN" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", bcp47: "gu-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", bcp47: "kn-IN" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", bcp47: "or-IN" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", bcp47: "ml-IN" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", bcp47: "pa-IN" },
  { code: "as", name: "Assamese", native: "অসমীয়া", bcp47: "as-IN" },
  { code: "mai", name: "Maithili", native: "मैथिली", bcp47: "hi-IN" },
  { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", bcp47: "hi-IN" },
  { code: "ks", name: "Kashmiri", native: "کٲشُر", bcp47: "ur-IN" },
  { code: "ne", name: "Nepali", native: "नेपाली", bcp47: "ne-NP" },
  { code: "kok", name: "Konkani", native: "कोंकणी", bcp47: "hi-IN" },
  { code: "sd", name: "Sindhi", native: "سنڌي", bcp47: "ur-IN" },
  { code: "doi", name: "Dogri", native: "डोगरी", bcp47: "hi-IN" },
  { code: "mni", name: "Manipuri", native: "মৈতৈলোন্", bcp47: "hi-IN" },
  { code: "brx", name: "Bodo", native: "बर'", bcp47: "hi-IN" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्", bcp47: "hi-IN" },
];

export const LANG_BY_CODE: Record<LangCode, Language> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
) as Record<LangCode, Language>;

/** Compact glossary — Bhasha-Brahmand keeps agro/GIS terms untranslated. */
const GLOSSARY: [RegExp, string][] = [
  [/बाढ़|बाढ|बाढ़|வெள்ளம்|వరద|पूर|বন্যা|വെള്ളപ്പൊക്കം|પૂર|ಪ್ರವಾಹ|ବନ୍ୟା|ਹੜ੍ਹ|سيلاب/gi, "flood"],
  [/पानी|நீர்|నీరు|पाणी|জল|വെള്ളം|પાણી|ನೀರು|ପାଣି|ਪਾਣੀ|آب/gi, "water"],
  [/हाईवे|राजमार्ग|நெடுஞ்சாலை|హైవే|মহাসড়ক|ഹൈവേ|હાઇવે|ಹೆದ್ದಾರಿ/gi, "highway"],
  [/जंगल|वन|காடு|అటవీ|जंगल|বন|വനം|જંગલ|ಅರಣ್ಯ|ଜଙ୍ଗଲ|ਜੰਗਲ/gi, "forest"],
  [/फसल|அறுவடை|పంట|कापणी|ফসল|വിള|પાક|ಬೆಳೆ|ଫସଲ|ਫਸਲ/gi, "harvest"],
  [/कटाई|వననాశనం|অরণ্যচ্ছেদন|വനനശീകരണം/gi, "deforestation"],
  [/भूस्खलन|நிலச்சரிவு|కొండచరియలు|ধস|മണ്ണിടിച്ചിൽ/gi, "landslide"],
  [/धंसाव|த sagging|కుంగుదల|নরম|താണൽ/gi, "subsidence"],
  [/गाँव|ग्राम|கிராமம்|గ్రామం|गाव|গ্রাম|ഗ്രാമം|ગામ|ಗ್ರಾಮ|ଗାଁ|ਪਿੰਡ/gi, "village"],
  [/बादल|மேகம்|మేఘం|मेघ|মেঘ|മേഘം|વાદળ|ಮೋಡ/gi, "cloud"],
  [/पेड़|மரம்|చెట్టు|झाड|গাছ|മരം|વૃક્ષ|ಮರ/gi, "tree"],
  [/जोशीमठ/gi, "Joshimath"],
  [/काजीरंगा|কাজিৰঙা/gi, "Kaziranga"],
  [/चंबल/gi, "Chambal"],
  [/केरल|கேரளம்|కేరళ|কেরল|കേരളം/gi, "Kerala"],
  [/असम|অসম|ஆசாம்/gi, "Assam"],
  [/क्या|कितना|कहाँ|है\?|है\s/gi, ""],
];

export function toEnglishPrompt(text: string): string {
  let out = text;
  for (const [re, en] of GLOSSARY) out = out.replace(re, ` ${en} `);
  return out.replace(/\s+/g, " ").trim() || text;
}

export function detectLang(text: string): LangCode | null {
  if (/[\u0900-\u097F]/.test(text)) {
    if (/जोशीमठ|काजीरंगा|चंबल|बाढ़|हिन्दी/.test(text)) return "hi";
    return "hi";
  }
  if (/[\u0980-\u09FF]/.test(text)) return /অসম|কাজিৰঙা/.test(text) ? "as" : "bn";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  if (/[\u0B00-\u0B7F]/.test(text)) return "or";
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml";
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa";
  if (/[\u0600-\u06FF]/.test(text)) return "ur";
  return null;
}
