import type { AgentId, LangCode, MissionId } from "./types";
import { detectLang, toEnglishPrompt } from "./languages";
import { MISSIONS } from "./missions";

export interface RouteDecision {
  agent: AgentId;
  secondary: AgentId[];
  missionId?: MissionId;
  translated: string;
  language: LangCode;
}

export function routeQuery(raw: string, uiLang: LangCode): RouteDecision {
  const detected = detectLang(raw);
  const language = detected ?? uiLang;
  const translated = toEnglishPrompt(raw);
  const q = `${raw} ${translated}`.toLowerCase();

  const missionHit = MISSIONS.find((m) => {
    const bag = [
      m.id,
      m.title,
      m.region,
      m.code,
      ...m.samples.map((s) => s.text),
    ]
      .join(" ")
      .toLowerCase();
    const keys = [
      m.id,
      "kaziranga",
      "kohora",
      "brahmaputra",
      "joshimath",
      "जोशीमठ",
      "chambal",
      "चंबल",
      "kuttanad",
      "alappuzha",
      "nh-66",
      "nh-37",
      "काजीरंगा",
      "केरल",
      "sundarban",
      "সুন্দরবন",
      "lhonak",
      "glof",
      "sikkim",
      "stubble",
      "पराली",
      "delhi",
      "degana",
      "lithium",
      "लीथियम",
    ];
    return keys.some((k) => q.includes(k.toLowerCase()) && bag.includes(k.toLowerCase())) ||
      m.samples.some((s) => s.text.toLowerCase() === raw.trim().toLowerCase());
  });

  // Direct toponym routing
  let missionId = missionHit?.id;
  if (!missionId) {
    if (/kaziranga|kohora|bagori|brahmaputra|assam|काजीरंगा|অসম/.test(q)) missionId = "kaziranga";
    else if (/joshimath|chamoli|badrinath|जोशीमठ|manohar|singhdhar/.test(q)) missionId = "joshimath";
    else if (/chambal|रबी|rabi|harvest|deforest|चंबल/.test(q) && /forest|harvest|deforest|कटाई|फसल|जंगल/.test(q))
      missionId = "chambal";
    else if (/kuttanad|alappuzha|kerala|nh-?66|केरल|कुट्ट|हाईवे|highway/.test(q) && /flood|बाढ़|water|पानी|highway|हाईवे/.test(q))
      missionId = "kuttanad";
    else if (/sundarban|gosaba|kultali|delta|mangrove|সুন্দরবন|मैंग्रोव/.test(q))
      missionId = "sundarbans";
    else if (/lhonak|glof|glacial|teesta|sikkim|moraine|ल्हाेनक|सिक्किम/.test(q))
      missionId = "lhonak_glof";
    else if (/delhi|ncr|stubble|पराली|inversion|smog|anand vihar|दिल्ली/.test(q))
      missionId = "delhi_thermal";
    else if (/degana|lithium|pegmatite|mineral|greisen|लीथियम|खनिज|डेगाना|aravalli/.test(q))
      missionId = "rajasthan_mineral";
    else if (/chambal|चंबल/.test(q)) missionId = "chambal";
    else if (/kuttanad|kerala|केरल/.test(q)) missionId = "kuttanad";
  }

  let agent: AgentId = "surya_caption";
  const secondary: AgentId[] = ["surya_caption", "sparsh_grounding"];

  if (/sink|subsiden|landslide|mm\/|dinsar|phase|जोशीमठ|धंसा/.test(q)) {
    agent = "ratna_garbha";
    secondary.push("samay_change", "ratna_garbha");
  } else if (/deforest|harvest|फसल|जंगल|कटाई|causal|false alarm/.test(q)) {
    agent = "vivek_causal";
    secondary.push("vivek_causal", "samay_change");
  } else if (/highway|हाईवे|ndma|evacuat|sop|ward|taluk/.test(q)) {
    agent = "bhoomi_rakshak";
    secondary.push("bhoomi_rakshak", "kaal_radar");
  } else if (/flood|radar|inundat|canopy|cloud|बाढ़|water under|sar\b/.test(q)) {
    agent = "kaal_radar";
    secondary.push("kaal_radar", "bhoomi_rakshak");
  } else if (/change|before|after|bi-?temporal|परिवर्तन/.test(q)) {
    agent = "samay_change";
    secondary.push("samay_change");
  } else if (/count|vehicle|building|घर|वाहन/.test(q)) {
    agent = "bhoomi_optical";
    secondary.push("bhoomi_optical");
  } else if (/forecast|36 month|world model|future/.test(q)) {
    agent = "kala_chakra";
    secondary.push("kala_chakra");
  } else if (missionId) {
    agent = MISSIONS.find((m) => m.id === missionId)!.agent;
    secondary.push(...MISSIONS.find((m) => m.id === missionId)!.secondaryAgents);
  }

  if (missionId) {
    const m = MISSIONS.find((x) => x.id === missionId)!;
    agent = m.agent;
    return {
      agent,
      secondary: unique([m.agent, ...m.secondaryAgents]),
      missionId,
      translated,
      language,
    };
  }

  return { agent, secondary: unique(secondary), translated, language };
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
