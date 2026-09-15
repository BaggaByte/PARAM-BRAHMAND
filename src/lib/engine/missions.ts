import type { Mission } from "./types";
import { fc, line, point, poly } from "./geo";

export const MISSIONS: Mission[] = [
  {
    id: "kaziranga",
    code: "KS-FL-07",
    title: "Kaziranga sub-canopy flood",
    region: "Assam · Brahmaputra",
    problem: "Optical sensors see only monsoon cloud. Villages under forest stay unmapped.",
    agent: "kaal_radar",
    secondaryAgents: ["sparsh_grounding", "bhoomi_rakshak", "surya_caption"],
    center: [26.62, 93.35],
    zoom: 11,
    gsdM: 8,
    mapMode: "sar",
    swipeEnabled: false,
    landcover: "flood_canopy",
    predictedClass: "subcanopy_inundation",
    samples: [
      { lang: "en", text: "Map flood water under tree canopy in Kaziranga" },
      { lang: "hi", text: "काजीरंगा में पेड़ों के नीचे बाढ़ का पानी दिखाओ" },
      { lang: "as", text: "কাজিৰঙাত গছৰ তলৰ বানপানী দেখুৱাওক" },
    ],
    geojson: fc([
      poly(
        [
          [93.12, 26.5],
          [93.28, 26.47],
          [93.48, 26.5],
          [93.62, 26.55],
          [93.66, 26.66],
          [93.52, 26.74],
          [93.32, 26.76],
          [93.16, 26.7],
          [93.08, 26.6],
        ],
        { kind: "flood", name: "Open water (specular SAR)", value: 612, unit: "km²" },
      ),
      poly(
        [
          [93.22, 26.56],
          [93.38, 26.54],
          [93.5, 26.58],
          [93.48, 26.66],
          [93.34, 26.68],
          [93.22, 26.64],
        ],
        {
          kind: "canopy_flood",
          name: "Sub-canopy inundation (Pd double-bounce)",
          value: 312,
          unit: "km²",
        },
      ),
      line(
        [
          [93.05, 26.52],
          [93.18, 26.55],
          [93.32, 26.57],
          [93.48, 26.58],
          [93.64, 26.6],
        ],
        { kind: "road", name: "NH-37", value: 18.4, unit: "km inundated" },
      ),
      point([93.4, 26.58], {
        kind: "village",
        name: "Kohora range",
        value: 14,
        unit: "hamlets",
      }),
      point([93.24, 26.61], {
        kind: "village",
        name: "Bagori range",
        value: 11,
        unit: "hamlets",
      }),
    ]),
    geocp: {
      ece: 0.024,
      coverage: 0.955,
      moranI: 0.47,
      interval: [0.81, 0.98],
      zone: "Assam floodplain forest",
    },
    answer:
      "RISAT C-band sees through the cloud deck. Double-bounce Pd spikes map 312 km² of water under canopy plus 612 km² of open flood. NH-37 is overtopped for 18.4 km between Kohora and Bagori.",
    vqa: {
      question: "Is there flood water under the forest canopy?",
      answer: "Yes. 312 km² of sub-canopy inundation with Pd dominance (0.58) and RVoG hv ≈ 18 m.",
      confidence: 0.972,
    },
    report: {
      t1: "Kaziranga and the south bank of the Brahmaputra are inundated under 100% cloud. Radar confirms 924 km² of water, of which 312 km² sits under tree canopy that optical satellites cannot see.",
      t2: "NH-37 is overtopped for 18.4 km. 25 hamlets in Kohora and Bagori ranges are isolated. Recommend NDMA SOP: boat staging at Bokakhat, halt eastbound traffic at Nagaon, airdrop to elevated chaporis. Elephant corridors along the park edge are also flooded — wildlife displacement likely onto the highway berm.",
      t3: "Kaal-Radar inversion: T3 deoriented, helix Ph = 0.03, volume Pv from 15/8 T33, double-bounce Pd dominates over surface inside the forest mask. RVoG coherence γ(w) = 0.61, hv = Δφ / kz ≈ 18.4 m. OSWI fused MNDWI×σ⁰VV flags open water; Pd residual after volume removal flags trunk-water dihedrals. Vivek-Causal not required — monsoon hydrograph is the parent cause.",
      t4: [
        { label: "Open water", value: "612 km²" },
        { label: "Sub-canopy water", value: "312 km²" },
        { label: "NH-37 overtopped", value: "18.4 km" },
        { label: "Pd / Pv ratio", value: "2.07" },
        { label: "Cloud cover (optical)", value: "100%" },
      ],
    },
    ndmaSop:
      "[NDMA-SOP-2026/AS-07] BOKAKHAT SECTOR COMMAND\n1. Stage 14 motorized inflatable boats at Bokakhat Sub-Divisional HQ.\n2. Impose immediate traffic diversion on NH-37 between Kohora (KM 142) and Bagori (KM 160) — flood overtopping 18.4 km.\n3. Establish elevated relief camp on Diffaloo Chapori for 25 marooned hamlets.\n4. Forest Guard anti-poaching patrol activated for flood-migrating wildlife across southern highway berm.\n5. Air Force ALH Dhruv helicopters on standby at Tezpur AFS for winch rescue operations.",
  },
  {
    id: "joshimath",
    code: "JH-DN-02",
    title: "Joshimath crustal slip",
    region: "Uttarakhand · Chamoli",
    problem: "Optical scenes look unchanged while buildings crack. Motion is millimetric.",
    agent: "ratna_garbha",
    secondaryAgents: ["samay_change", "sparsh_grounding", "surya_caption"],
    center: [30.555, 79.565],
    zoom: 15,
    gsdM: 3,
    mapMode: "sar",
    swipeEnabled: true,
    beforeLabel: "T0 · 2022-10",
    afterLabel: "T1 · 2023-01",
    landcover: "mountain_town",
    predictedClass: "built_up",
    slopeOverride: 18.6,
    samples: [
      { lang: "en", text: "Detect land sinking at Joshimath" },
      { lang: "hi", text: "जोशीमठ में भूमि धंसाव कितना है?" },
      { lang: "ne", text: "जोशीमठमा जमिन भास्सिएको छ कि?" },
    ],
    geojson: fc([
      poly(
        [
          [79.555, 30.549],
          [79.562, 30.548],
          [79.566, 30.552],
          [79.561, 30.556],
          [79.554, 30.554],
        ],
        { kind: "subsidence", name: "Manohar Bagh · 4.1 mm/mo", value: 4.1, unit: "mm/mo" },
      ),
      poly(
        [
          [79.562, 30.553],
          [79.569, 30.552],
          [79.572, 30.557],
          [79.566, 30.56],
          [79.56, 30.557],
        ],
        { kind: "subsidence", name: "Singhdhar · 2.8 mm/mo", value: 2.8, unit: "mm/mo" },
      ),
      poly(
        [
          [79.568, 30.548],
          [79.575, 30.547],
          [79.577, 30.552],
          [79.571, 30.554],
        ],
        { kind: "subsidence", name: "Marwari · 2.2 mm/mo", value: 2.2, unit: "mm/mo" },
      ),
      line(
        [
          [79.55, 30.545],
          [79.56, 30.55],
          [79.57, 30.555],
          [79.58, 30.56],
        ],
        { kind: "road", name: "NH-7 / Badrinath Road", value: 0, unit: "km" },
      ),
    ]),
    geocp: {
      ece: 0.019,
      coverage: 0.968,
      moranI: 0.33,
      interval: [1.6, 3.1],
      zone: "Western Himalaya · seismic",
    },
    answer:
      "DInSAR LOS displacement peaks at 4.1 mm/month in Manohar Bagh. 214 structures sit inside the 2 mm/month contour. Optical pixels are unchanged — the signal is phase, not radiance.",
    vqa: {
      question: "Is Joshimath sinking?",
      answer: "Yes. Three wards show coherent LOS subsidence of 2.2–4.1 mm/month (coherence 0.72).",
      confidence: 0.96,
    },
    report: {
      t1: "Joshimath is sliding. Radar phase, not photographs, shows 2.2 to 4.1 mm of line-of-sight subsidence per month across Manohar Bagh, Singhdhar and Marwari — weeks of warning before visible cracks.",
      t2: "214 buildings intersect the 2 mm/month contour. NH-7 (Badrinath Road) crosses the Singhdhar lobe. Recommend: vacate red-tagged houses in Manohar Bagh, survey the JP hydel drain, freeze new cutting on the toe slope, and keep a 24 h geodetic prism on the temple terrace.",
      t3: "Ratna-Garbha unwraps a 12-day RISAT/Sentinel-1 pair. After topographic phase removal with CartoDEM, residual φ maps to δr = λ φ / 4π. Mean velocity 2.4 mm/mo; peak 4.1. Coherence 0.72 rules out decorrelated snow. Samay-Change optical residual is < 0.4% — Vivek-Causal attributes motion to toe erosion + drain saturation, not a new tectonic event.",
      t4: [
        { label: "Peak LOS", value: "4.1 mm/mo" },
        { label: "Ward mean", value: "2.4 mm/mo" },
        { label: "Coherence γ", value: "0.72" },
        { label: "Structures in 2 mm contour", value: "214" },
        { label: "Slope", value: "18.6°" },
      ],
    },
    ndmaSop:
      "[SDMA-UK-SOP-2026/CH-02] CHAMOLI DISTRICT EMERGENCY COMMAND\n1. Immediate structural red-tagging and evacuation of 214 high-risk residences in Manohar Bagh and Singhdhar wards.\n2. Total moratorium on subsurface excavation, slope toe cutting, and heavy construction on the Marwari slope.\n3. Install automated geodetic laser prisms and continuous tiltmeters on temple terrace and NH-7 bridge.\n4. Route subterranean drainage water away from saturated toe faults via pre-cast collector flumes.\n5. Keep SDRF search-and-rescue teams stationed at Joshimath ITBP Barracks for immediate deployment.",
  },
  {
    id: "chambal",
    code: "CB-CA-11",
    title: "Chambal harvest vs forest",
    region: "Madhya Pradesh / Rajasthan",
    problem: "Pixel differencing flags wheat harvest as illegal deforestation.",
    agent: "vivek_causal",
    secondaryAgents: ["samay_change", "bhoomi_optical", "surya_caption"],
    center: [26.48, 78.15],
    zoom: 11,
    gsdM: 10,
    mapMode: "optical",
    swipeEnabled: true,
    beforeLabel: "Rabi peak · Feb",
    afterLabel: "Post-harvest · Apr",
    landcover: "ravine_agri",
    predictedClass: "harvested_cropland",
    samples: [
      { lang: "en", text: "Is this deforestation or harvest along the Chambal?" },
      { lang: "hi", text: "चंबल के किनारे यह जंगल कटाई है या फसल?" },
      { lang: "mr", text: "चंबळ काठावरील बदल वृक्षतोड आहे की कापणी?" },
    ],
    geojson: fc([
      poly(
        [
          [78.02, 26.42],
          [78.18, 26.4],
          [78.28, 26.46],
          [78.2, 26.54],
          [78.06, 26.52],
        ],
        { kind: "harvest", name: "Rabi wheat harvest (false alarm)", value: 4372, unit: "ha" },
      ),
      poly(
        [
          [78.22, 26.5],
          [78.3, 26.49],
          [78.34, 26.54],
          [78.28, 26.57],
          [78.22, 26.55],
        ],
        { kind: "deforest", name: "Persistent forest loss", value: 438, unit: "ha" },
      ),
      line(
        [
          [77.98, 26.5],
          [78.1, 26.47],
          [78.22, 26.48],
          [78.36, 26.52],
        ],
        { kind: "road", name: "Chambal ravine edge", value: 0, unit: "" },
      ),
    ]),
    geocp: {
      ece: 0.022,
      coverage: 0.957,
      moranI: 0.29,
      interval: [0.72, 0.94],
      zone: "Central plateau · Chambal",
    },
    answer:
      "Of 4,810 ha of NDVI drop, 4,372 ha (91%) is Rabi wheat harvest conditioned on the crop calendar. 438 ha is persistent woody loss that survives the do-operator and should be field-verified.",
    vqa: {
      question: "Is the NDVI drop illegal deforestation?",
      answer: "Mostly no. 91% is harvest (do(calendar)=Rabi). 9% remains as forest-loss residual.",
      confidence: 0.948,
    },
    report: {
      t1: "A naive change mask over the Chambal ravines screams deforestation. After Pearl do-calculus on the crop calendar, 91% of the NDVI drop is wheat leaving the field. 438 ha of woody loss remains.",
      t2: "Do not raise an SDMA forest offence on the 4,372 ha harvest polygon. Dispatch a beat guard only to the 438 ha persistent-loss patch on the northern ravine lip. Kharif sowing is six weeks out — the harvest class will green up; the woody class will not.",
      t3: "Samay-Change F1 on the raw mask is high but causally confounded. Vivek-Causal SCM: season → NDVI, harvest → NDVI, illegal felling → NDVI. P(ΔY | do(harvest), calendar=Rabi) explains the large polygon. The residual after intervening on harvest is the 438 ha forest node. MESMA soil fraction jumps from 0.18 to 0.44 on harvest; it stays veg-dominated on the forest residual.",
      t4: [
        { label: "NDVI-drop area", value: "4,810 ha" },
        { label: "Harvest (suppressed)", value: "4,372 ha · 91%" },
        { label: "Persistent forest loss", value: "438 ha · 9%" },
        { label: "False-alarm cut", value: "94.8%" },
        { label: "Calendar", value: "Rabi wheat · Apr" },
      ],
    },
    ndmaSop:
      "[FOREST-DEPT-SOP-2026/MP-11] CHAMBAL SANCTUARY BEAT PROTOCOL\n1. STAND DOWN tactical forest offence alert on 4,372 ha agricultural plain (verified Rabi wheat harvest; false alarm suppressed by Vivek-Causal).\n2. Dispatch 2 beat guard patrol teams exclusively to the 438 ha northern ravine lip exhibiting persistent woody loss.\n3. Coordinate with District Collectorate for drone photogrammetry over active land-clearing coordinates (26.54°N, 78.28°E).\n4. Notify local revenue officials that harvest green-up is projected within 6 weeks for Kharif prep.",
  },
  {
    id: "kuttanad",
    code: "KL-HW-04",
    title: "Kuttanad highway inundation",
    region: "Kerala · Alappuzha",
    problem: "Below-MSL paddy and NH-66 flood together. Operators need vernacular answers.",
    agent: "bhoomi_rakshak",
    secondaryAgents: ["kaal_radar", "sparsh_grounding", "surya_caption"],
    center: [9.5, 76.45],
    zoom: 11,
    gsdM: 10,
    mapMode: "sar",
    swipeEnabled: false,
    landcover: "kuttanad",
    predictedClass: "standing_water",
    slopeOverride: 0.3,
    samples: [
      { lang: "hi", text: "क्या बाढ़ का पानी हाईवे तक पहुँच गया है?" },
      { lang: "ml", text: "ഹൈവേ വെള്ളത്തിനടിയിലായോ?" },
      { lang: "en", text: "Has flood water reached the highway?" },
    ],
    geojson: fc([
      poly(
        [
          [76.32, 9.38],
          [76.48, 9.36],
          [76.58, 9.44],
          [76.52, 9.58],
          [76.38, 9.6],
          [76.28, 9.5],
        ],
        { kind: "flood", name: "Kuttanad padasekharam inundation", value: 186, unit: "km²" },
      ),
      line(
        [
          [76.3, 9.42],
          [76.38, 9.46],
          [76.46, 9.5],
          [76.54, 9.54],
          [76.6, 9.58],
        ],
        { kind: "road", name: "NH-66", value: 7.6, unit: "km overtopped" },
      ),
      point([76.33, 9.5], { kind: "village", name: "Kuttanad taluk", value: 22, unit: "wards" }),
      point([76.52, 9.48], { kind: "village", name: "Alappuzha approach", value: 6, unit: "wards" }),
    ]),
    geocp: {
      ece: 0.018,
      coverage: 0.971,
      moranI: 0.52,
      interval: [0.88, 0.99],
      zone: "Kerala backwater · below MSL",
    },
    answer:
      "हाँ. NH-66 के 7.6 किमी खंड बाढ़ के पानी में हैं. कुट्टनाड के 186 वर्ग किमी धान के खेत जलमग्न हैं — यह क्षेत्र समुद्र तल से नीचे है, ढलान 0.3°.",
    vqa: {
      question: "क्या बाढ़ का पानी हाईवे तक पहुँच गया है?",
      answer: "हाँ. NH-66 overtopped for 7.6 km. 22 wards isolated. SOP: ferry from Alappuzha jetty.",
      confidence: 0.97,
    },
    report: {
      t1: "Yes — flood water has reached the highway. NH-66 is overtopped for 7.6 km across the Kuttanad padasekharams, which already sit below mean sea level.",
      t2: "22 wards are isolated. NDMA SOP: close NH-66 between Kommady and Ambalappuzha, stage IRBN boats at Punnamada, keep medical boats on the AC Canal, and do not pump outward until the Thottappally spillway is at free flow. Power isolation on the submerged 11 kV spurs.",
      t3: "Bhoomi-Rakshak intersects the OSWI mask with the Bhuvan road graph. Slope 0.3° satisfies the hydrodynamic postulate (standing water legal). σ⁰VV = −19.8 dB (specular). Dharma-Chakra passes all four gates. Bhasha-Brahmand retained the toponyms Kuttanad, taluk, nullah and the query language.",
      t4: [
        { label: "Highway overtopped", value: "7.6 km · NH-66" },
        { label: "Inundated paddy", value: "186 km²" },
        { label: "Elevation", value: "−1.2 to 0.4 m MSL" },
        { label: "Slope", value: "0.3°" },
        { label: "Voice latency", value: "< 350 ms" },
      ],
    },
    ndmaSop:
      "[NDMA-SOP-2026/KL-04] ALAPPUZHA DISASTER MANAGEMENT CELL\n1. Close NH-66 between Kommady and Ambalappuzha — overtopped 7.6 km.\n2. Deploy 18 Kerala Police IRBN water taxis and rescue barges from Alappuzha jetty to evacuate 22 isolated padasekharam wards.\n3. Activate emergency medical boat service along the AC Canal corridor.\n4. De-energize submerged 11 kV KSEB distribution transformers across inundated polders.\n5. Open Thottappally spillway gates to full discharge capacity during low tide window to drain backwater flood pulse.",
  },
];

export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m])) as Record<
  Mission["id"],
  Mission
>;
