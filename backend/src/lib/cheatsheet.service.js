import { resolveApiKey, callAI as callGemini } from "./gemini.service.js";
import {
  topicClassificationSchema,
  generatedCheatsheetSchema,
  DOMAINS,
} from "../modules/cheatsheets/cheatsheet.validator.js";

/**
 * Sanitize and normalize Mermaid flowchart syntax.
 * Converts accidental decision diamonds {Entity} into rectangular [Entity],
 * preserves legitimate condition diamonds ({Condition?}), and strips markdown fences.
 */
export const sanitizeMermaidCode = (code) => {
  if (!code || typeof code !== "string") return "";
  let cleaned = code.trim();

  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:mermaid)?\s*/i, "").replace(/\s*```$/, "").trim();

  // Ensure valid diagram prefix
  if (!/^(flowchart|graph|stateDiagram|sequenceDiagram|classDiagram|erDiagram|journey|gantt|pie|gitGraph)\b/i.test(cleaned)) {
    cleaned = `flowchart TD\n${cleaned}`;
  }

  // Convert accidental diamond braces {Entity} into rectangular [Entity]
  // In Mermaid, NodeId{Text} is a rhombus / decision diamond.
  // If Text does NOT end with '?' and has no comparison/condition words,
  // it's an entity or step mistakenly rendered as a decision diamond.
  cleaned = cleaned.replace(/([a-zA-Z0-9_-]+)\{([^}]+)\}/g, (match, nodeId, text) => {
    const trimmed = text.trim();
    const isCondition =
      trimmed.endsWith("?") ||
      /[=<>!]/.test(trimmed) ||
      /^(is|if|has|can|should|check|does|valid|test)\b/i.test(trimmed);

    if (isCondition) {
      return match;
    }
    const safeText = trimmed.replace(/"/g, "'");
    return `${nodeId}["${safeText}"]`;
  });

  return cleaned;
};

/**
 * Generate rich domain-adaptive mock cheatsheet for DEMO_MODE in non-production environments.
 */
const generateDemoBlocksCheatsheet = ({
  topic = "General Subject",
  level = "Beginner",
  language = "english",
  classification,
}) => {
  const isHinglish = language === "hinglish";
  const domain = classification?.domain || "economics";

  let blocks = [];

  if (domain === "economics") {
    blocks = [
      {
        type: "definition",
        text: isHinglish
          ? `**${topic}** ka core principle yeh hai ki jaise jaise hum kisi product ya service ke successive units consume karte hain, har extra unit se milne wali additional satisfaction (Marginal Utility) continuously decrease hoti jati hai.`
          : `**${topic}** states that as a consumer consumes more units of a specific commodity, the additional satisfaction or utility derived from each subsequent unit diminishes progressively, assuming constant consumer preferences and income.`,
      },
      {
        type: "formula",
        name: "Marginal Utility & Total Utility Formulation",
        latex: "MU_n = TU_n - TU_{n-1} = \\frac{\\Delta TU}{\\Delta Q}",
        explanation: isHinglish
          ? "Marginal Utility ($MU$) calculate karne ke liye total utility ke change ($\\Delta TU$) ko quantity change ($\\Delta Q$) se divide karte hain. Jab $MU = 0$ hota hai, tab $TU$ maximum (Point of Satiety) par hota hai."
          : "Marginal Utility represents the first derivative of the Total Utility function with respect to quantity consumed. When $MU = 0$, Total Utility ($TU$) reaches its maximum point of satiety.",
        variables: [
          { symbol: "MU_n", meaning: "Marginal Utility of the n-th unit consumed" },
          { symbol: "TU_n", meaning: "Total Utility accumulated from n units" },
          { symbol: "\\Delta Q", meaning: "Change in quantity of units consumed" },
        ],
      },
      {
        type: "chart",
        chartType: "line",
        title: "Total Utility (TU) vs. Marginal Utility (MU) Curve",
        xLabel: "Quantity Consumed (Units)",
        yLabel: "Utility (Utils)",
        series: [
          {
            name: "Total Utility (TU)",
            points: [
              { x: 1, y: 10 },
              { x: 2, y: 18 },
              { x: 3, y: 24 },
              { x: 4, y: 28 },
              { x: 5, y: 30 },
              { x: 6, y: 30 },
              { x: 7, y: 27 },
            ],
          },
          {
            name: "Marginal Utility (MU)",
            points: [
              { x: 1, y: 10 },
              { x: 2, y: 8 },
              { x: 3, y: 6 },
              { x: 4, y: 4 },
              { x: 5, y: 2 },
              { x: 6, y: 0 },
              { x: 7, y: -3 },
            ],
          },
        ],
        insight:
          "Key Observation: TU increases at a diminishing rate while MU is positive. When MU hits exactly 0 at Unit 6, TU peaks at 30 utils (Maximum Satisfaction). Beyond this point, MU enters negative territory and TU declines.",
        markers: [
          { x: 6, y: 0, label: "Point of Satiety (MU=0, Max TU)" },
          { x: 7, y: -3, label: "Disutility Region (Negative MU)" },
        ],
      },
      {
        type: "table",
        title: "Consumption Schedule & Utility Progression",
        headers: ["Units Consumed (Q)", "Total Utility (TU in utils)", "Marginal Utility (MU in utils)", "Consumer Psychological State"],
        rows: [
          ["1 Unit", "10", "10", "Initial High Craving"],
          ["2 Units", "18", "8", "Pleasure & Moderate Satisfaction"],
          ["3 Units", "24", "6", "Steady Utility Gain"],
          ["4 Units", "28", "4", "Nearing Full Satisfaction"],
          ["5 Units", "30", "2", "Almost Satiated"],
          ["6 Units", "30", "0", "Point of Satiety (Maximum TU)"],
          ["7 Units", "27", "-3", "Disutility / Oversaturation"],
        ],
      },
      {
        type: "real_life",
        scenario: isHinglish
          ? "Imagine aapko bohot tez pyas lagi hai aur aap paani ke glasses peete hain."
          : "Drinking consecutive glasses of cold water on a scorching summer afternoon.",
        connection: isHinglish
          ? "Pehle glass se sabse zyada relief (10 utils) milta hai. 3rd-4th glass tak pyas bujh jaati hai. Agar zabardasti 7th glass peeya jaye toh disutility (nausea) hoti hai."
          : "The 1st glass provides immense relief. By the 5th glass your thirst is completely quenched ($MU \\to 0$). Forcing a 7th glass causes physical discomfort, generating negative marginal utility.",
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Confusing Marginal Utility (MU) with Total Utility (TU).",
            fix: "Remember: TU is cumulative sum of utilities ($\\sum MU$), whereas MU is solely the incremental gain from the single latest unit.",
          },
          {
            mistake: "Assuming MU always remains strictly positive.",
            fix: "MU can and does become zero (Point of Satiety) and negative (Disutility / Waste) if consumption continues excessively.",
          },
        ],
      },
      {
        type: "key_points",
        items: [
          "**Cardinal vs. Ordinal:** Classical economics assumes utility can be quantified in cardinal numbers ('utils').",
          "**Law of Equi-Marginal Utility:** Consumers maximize satisfaction when $\\frac{MU_x}{P_x} = \\frac{MU_y}{P_y} = MU_m$.",
          "**Crucial Assumptions:** Standard quality units, continuous consumption without time gaps, and constant consumer income & taste.",
        ],
      },
      {
        type: "mnemonic",
        text: "**T.U.M.U. Rule:** 'When MU is Positive, TU rises; when MU is Zero, TU caps; when MU is Negative, TU collapses.'",
      },
      {
        type: "quick_summary",
        items: [
          "TU peaks precisely when MU equals zero (Point of Satiety).",
          "Downward sloping MU curve explains the fundamental Law of Demand (inverse price-quantity relationship).",
          "Never confuse falling marginal utility with falling total satisfaction.",
        ],
      },
    ];
  } else if (domain === "business_finance" || domain === "accounting") {
    blocks = [
      {
        type: "definition",
        text: isHinglish
          ? `**${topic}** ek structured financial ecosystem hai jahan long-term debt aur equity instruments ka trade hota hai, jisse companies aur governments capital raise karti hain.`
          : `**${topic}** is a vital component of the financial system where long-term debt and equity-backed securities are bought and sold, channeling savings from investors to productive commercial entities.`,
      },
      {
        type: "key_points",
        items: [
          "**Primary Market:** Facilitates the initial issuance of securities directly from issuers to investors (IPOs, private placements).",
          "**Secondary Market:** Provides continuous liquidity by enabling investors to trade already-issued securities (Stock exchanges).",
          "**Capital Allocation Efficiency:** Directs financial resources toward high-growth, productive economic sectors.",
        ],
      },
      {
        type: "table",
        title: "Primary Market vs. Secondary Market Matrix",
        headers: ["Parameter", "Primary Market (New Issue)", "Secondary Market (Stock Exchange)"],
        rows: [
          ["Nature of Securities", "Newly created shares / bonds", "Existing previously issued shares"],
          ["Transaction Directness", "Directly between Issuer and Investor", "Between peer investors (Buyer and Seller)"],
          ["Capital Gain Flow", "Proceeds go directly to issuing company", "Proceeds exchange hands between investors"],
          ["Price Determination", "Fixed offer price or book building band", "Dynamic market forces of supply and demand"],
        ],
      },
      {
        type: "real_life",
        scenario: isHinglish
          ? "Ek tech startup ko expansion ke liye funding chahiye aur wo public ke liye IPO announce karti hai."
          : "A growing tech company issuing shares via an Initial Public Offering (IPO) to fund manufacturing expansion.",
        connection: isHinglish
          ? "Company primary market me share bechkar 500 crore raise karti hai. Baad me daily retail investors NSE/BSE secondary market par unhi shares ko trade karte hain."
          : "The primary market provides the original 500M funding directly to the corporation, while the secondary market guarantees daily liquidity for individual retail buyers.",
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Confusing Money Market with Capital Market.",
            fix: "Money market deals exclusively with short-term instruments (< 1 year e.g. T-bills), whereas Capital market deals with long-term capital (> 1 year e.g. stocks, 10-year bonds).",
          },
        ],
      },
      {
        type: "mnemonic",
        text: "**P.S. Market Rule:** 'Primary brings new life (IPOs); Secondary gives daily liquidity.'",
      },
      {
        type: "quick_summary",
        items: [
          "Capital markets bridge the gap between capital providers (savers) and capital seekers (enterprises).",
          "Secondary market liquidity encourages risk-taking in the primary market.",
        ],
      },
    ];
  } else if (domain === "programming" || domain === "computer_science") {
    blocks = [
      {
        type: "definition",
        text: isHinglish
          ? `**${topic}** ek fundamental algorithmic technique hai jo sorted search space ko repeated binary division (half-and-half) se divide karke target element efficiently locate karta hai.`
          : `**${topic}** is an optimal divide-and-conquer search algorithm that repeatedly divides a sorted search interval in half, achieving logarithmic time complexity.`,
      },
      {
        type: "code",
        language: "javascript",
        code: `function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left <= right) {\n    // Prevent potential integer overflow\n    const mid = left + Math.floor((right - left) / 2);\n\n    if (arr[mid] === target) return mid; // Found at index mid\n    if (arr[mid] < target) left = mid + 1; // Discard left half\n    else right = mid - 1; // Discard right half\n  }\n  return -1; // Not found\n}`,
        explanation: isHinglish
          ? "Har step par `mid` calculate karke search space ko 50% reduce kar diya jata hai. Isliye time complexity $\\mathcal{O}(\\log N)$ hoti hai."
          : "Calculates the midpoint safely avoiding integer overflow and halves the search boundaries in each iteration until the key is located.",
      },
      {
        type: "diagram",
        mermaid: `flowchart TD\n  Start([Sorted Array & Target]) --> CalcMid[Calculate Mid Index]\n  CalcMid --> CheckEqual{Array[Mid] == Target?}\n  CheckEqual -- Yes --> Found([Return Mid Index])\n  CheckEqual -- No --> CheckLess{Array[Mid] < Target?}\n  CheckLess -- Yes --> MoveRight[Left = Mid + 1]\n  CheckLess -- No --> MoveLeft[Right = Mid - 1]\n  MoveRight --> CheckBound{Left <= Right?}\n  MoveLeft --> CheckBound\n  CheckBound -- Yes --> CalcMid\n  CheckBound -- No --> NotFound([Return -1])`,
        caption: "Binary Search State Machine Flowchart",
      },
      {
        type: "table",
        title: "Algorithmic Complexity & Boundary Matrix",
        headers: ["Metric / Case", "Time Complexity", "Space Complexity", "Prerequisite Invariant"],
        rows: [
          ["Best Case (Element at midpoint)", "$\\mathcal{O}(1)$", "$\\mathcal{O}(1)$ iterative", "Random access array"],
          ["Average Case (Search in partition)", "$\\mathcal{O}(\\log N)$", "$\\mathcal{O}(1)$ iterative", "Monotonically sorted order"],
          ["Worst Case (Element not present)", "$\\mathcal{O}(\\log N)$", "$\\mathcal{O}(1)$ iterative", "Strict index bounds"],
          ["Recursive Implementation", "$\\mathcal{O}(\\log N)$", "$\\mathcal{O}(\\log N)$ call stack", "Tail call / stack capacity"],
        ],
      },
      {
        type: "real_life",
        scenario: isHinglish
          ? "Dictionary me word search karna ya telephone directory me naam dhoondna."
          : "Looking up a word in a printed physical 1000-page dictionary.",
        connection: isHinglish
          ? "Aap page 1 se sequentially check nahi karte; balki dictionary ke beech se open karke decide karte hain ki left half me jana hai ya right half me."
          : "Rather than scanning sequentially page by page from page 1, you flip open to the middle page and instantly eliminate 500 pages based on alphabetical order.",
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Integer overflow in `mid = (left + right) / 2` in languages with fixed integer ranges (C++/Java).",
            fix: "Always write `mid = left + (right - left) / 2` to guarantee no overflow.",
          },
          {
            mistake: "Using `<=` vs `<` condition causing infinite loop when target is missing.",
            fix: "Standard closed-interval search requires `while (left <= right)` with `left = mid + 1` and `right = mid - 1`.",
          },
        ],
      },
      {
        type: "quick_summary",
        items: [
          "Precondition: Input array MUST be strictly sorted before running binary search.",
          "Every comparison halves the problem size ($N \\to N/2 \\to N/4 \\dots 1$).",
          "Can be generalized to search on answer spaces (monotonic predicates) in optimization problems.",
        ],
      },
    ];
  } else if (domain === "history") {
    blocks = [
      {
        type: "definition",
        text: isHinglish
          ? `**${topic}** 18th century ka ek revolutionary transformation tha jisne monarchy ko overthrow karke democratic principles, liberty, equality aur fraternity ki neev rakhi.`
          : `**${topic}** was a period of fundamental political and societal change in France that abolished the feudal regime, dismantled absolute monarchy, and championed universal principles of popular sovereignty and individual rights.`,
      },
      {
        type: "timeline",
        events: [
          { when: "May 1789", what: "Estates-General convened at Versailles amid financial crisis" },
          { when: "July 14, 1789", what: "Storming of the Bastille fortress symbolizing royal tyranny fall" },
          { when: "August 1789", what: "Adoption of the Declaration of the Rights of Man and of the Citizen" },
          { when: "January 1793", what: "Execution of King Louis XVI by the National Convention" },
          { when: "1793 - 1794", what: "Reign of Terror under Maximilien Robespierre and the Jacobins" },
          { when: "November 1799", what: "Coup of 18 Brumaire leading to the rise of Napoleon Bonaparte" },
        ],
      },
      {
        type: "table",
        title: "Three Estates of the Ancien Régime Matrix",
        headers: ["Social Estate", "Composition & Members", "Tax Privileges", "Political Representation"],
        rows: [
          ["First Estate", "Catholic Clergy & High Church Officials", "Exempt from direct land taxes (Taille)", "Disproportionately high (1 Vote)"],
          ["Second Estate", "Hereditary Nobility & Aristocracy", "Exempt from major state taxes", "Disproportionately high (1 Vote)"],
          ["Third Estate", "Peasants, Artisans, Bourgeoisie (98% population)", "Borne entire direct & indirect tax burden", "Outvoted despite majority (1 Vote)"],
        ],
      },
      {
        type: "real_life",
        scenario: isHinglish
          ? "Society ke 98% hardworking class par sara tax laga dena jabki 2% elite class sara privilege enjoy kare."
          : "A system where 98% of working citizens pay 100% of public taxes while an elite 2% enjoy complete immunity and control state voting.",
        connection: isHinglish
          ? "Yeh severe economic inequality aur political disenfranchisement public outrage aur revolutionary collapse ka primary cause banta hai."
          : "This severe structural inequality directly precipitated the constitutional collapse of the Ancien Régime.",
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Assuming the French Revolution immediately established a permanent democratic republic.",
            fix: "The revolution transitioned through constitutional monarchy, radical terror, the Directory, and eventually the Napoleonic military empire.",
          },
        ],
      },
      {
        type: "mnemonic",
        text: "**L.E.F. Doctrine:** 'Liberty (Freedom), Equality (Equal Rights), Fraternity (Universal Brotherhood) formed the cornerstone of the Republic.'",
      },
      {
        type: "quick_summary",
        items: [
          "Key catalysts: Severe state debt, unfair feudal taxation, Enlightenment philosophy, and bread shortages.",
          "Legacy: Abolition of feudalism, secularization of legal codes, and spread of modern constitutionalism across Europe.",
        ],
      },
    ];
  } else if (domain === "biology") {
    blocks = [
      {
        type: "definition",
        text: isHinglish
          ? `**${topic}** ek biological process hai jisme plants, algae aur photosynthetic bacteria light energy ko chemical energy (glucose) me convert karte hain.`
          : `**${topic}** is the fundamental biochemical process through which photoautotrophs convert solar radiant energy into chemical energy stored in carbohydrates ($C_6H_{12}O_6$), releasing oxygen as a byproduct.`,
      },
      {
        type: "formula",
        name: "Overall Photosynthetic Chemical Equation",
        latex: "6CO_2 + 6H_2O \\xrightarrow{\\text{Light, Chlorophyll}} C_6H_{12}O_6 + 6O_2",
        explanation: isHinglish
          ? "Carbon dioxide aur water chlorophyll aur sunlight ki presence me react karke Glucose aur Oxygen gas generate karte hain."
          : "Carbon dioxide and water undergo a redox transformation inside the chloroplast, synthesizing glucose while splitting water to produce molecular oxygen.",
        variables: [
          { symbol: "CO_2", meaning: "Atmospheric Carbon Dioxide" },
          { symbol: "H_2O", meaning: "Water absorbed by roots" },
          { symbol: "C_6H_{12}O_6", meaning: "Glucose synthesized in stroma" },
          { symbol: "O_2", meaning: "Oxygen gas released into atmosphere" },
        ],
      },
      {
        type: "diagram",
        mermaid: `flowchart LR\n  Sun["Solar Energy"] --> Thylakoid["Thylakoid Membrane"]\n  Water["H2O Input"] --> Thylakoid\n  Thylakoid --> O2["O2 Released"]\n  Thylakoid -->|"ATP & NADPH"| Stroma["Calvin Cycle in Stroma"]\n  CO2["CO2 Input"] --> Stroma\n  Stroma --> Glucose["Glucose C6H12O6 Output"]\n  Stroma -->|"ADP & NADP+"| Thylakoid`,
        caption: "Dual-Stage Photosynthesis: Light Reactions vs. Calvin Cycle Pathway",
      },
      {
        type: "table",
        title: "Light Reactions vs. Calvin Cycle (Dark Reactions)",
        headers: ["Parameter", "Light-Dependent Reactions", "Light-Independent (Calvin Cycle)"],
        rows: [
          ["Site of Reaction", "Thylakoid Membrane of Chloroplast", "Stroma of Chloroplast"],
          ["Primary Input", "Light photon energy & Water ($H_2O$)", "Carbon dioxide ($CO_2$), ATP, NADPH"],
          ["Primary Output", "$O_2$, ATP, NADPH", "Glyceraldehyde-3-phosphate (G3P) / Glucose"],
          ["Dependence on Light", "Directly dependent on photon absorption", "Indirectly dependent (utilizes light reaction products)"],
        ],
      },
      {
        type: "real_life",
        scenario: isHinglish
          ? "Solar panel system jo sunlight ko battery me store karta hai aur baad me appliances chalata hai."
          : "A solar panel array capturing photonic radiation to charge battery units that power household electronics.",
        connection: isHinglish
          ? "Thylakoids solar panels ki tarah ATP charge karte hain, aur Calvin cycle us stored energy se glucose food synthesize karta hai."
          : "Thylakoid membranes act as natural biological solar converters charging ATP/NADPH, which the Calvin cycle uses as biochemical currency to assemble glucose.",
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Believing that the 'Dark Reactions' (Calvin Cycle) only occur at night.",
            fix: "The Calvin cycle does not require darkness; it is light-independent, operating whenever ATP and NADPH from light reactions are available.",
          },
          {
            mistake: "Assuming the oxygen released originates from $CO_2$.",
            fix: "Isotope tracing experiments confirm that $O_2$ is produced strictly from the photolysis of water ($H_2O$), not $CO_2$.",
          },
        ],
      },
      {
        type: "mnemonic",
        text: "**T.S. Location Tip:** 'Thylakoid handles the Light; Stroma handles the Sugar (Synthesis).'",
      },
      {
        type: "quick_summary",
        items: [
          "Light reactions split $H_2O$ to release $O_2$ and generate $ATP + NADPH$.",
          "Calvin cycle utilizes RuBisCO enzyme to fix $CO_2$ into organic carbohydrates.",
        ],
      },
    ];
  } else if (domain === "physics" || domain === "mathematics" || domain === "chemistry") {
    blocks = [
      {
        type: "definition",
        text: isHinglish
          ? `**${topic}** states that steady current ($I$) flowing through a metallic conductor directly proportional hota hai potential difference ($V$) ke across its ends, provided temperature constant rahe.`
          : `**${topic}** states that the electric current ($I$) flowing through a metallic conductor between two points is directly proportional to the voltage ($V$) across the two points, provided all physical conditions and temperature remain constant.`,
      },
      {
        type: "formula",
        name: "Ohm's Law & Resistance Formulation",
        latex: "V = I \\cdot R \\implies I = \\frac{V}{R} \\implies R = \\frac{V}{I}",
        explanation: isHinglish
          ? "Voltage ($V$) current ($I$) aur resistance ($R$) ka product hota hai. Slope of V-I graph conductor ki resistance ko represent karta hai."
          : "The mathematical relationship establishes that resistance ($R$) is the constant ratio between applied potential difference ($V$) and resultant electric current ($I$).",
        variables: [
          { symbol: "V", meaning: "Potential Difference / Voltage across conductor (Volts, V)" },
          { symbol: "I", meaning: "Electric Current through conductor (Amperes, A)" },
          { symbol: "R", meaning: "Electrical Resistance of conductor (Ohms, \\Omega)" },
        ],
      },
      {
        type: "chart",
        chartType: "line",
        title: "Ohmic Conductor V-I Linear Characteristic Curve",
        xLabel: "Current I (Amperes)",
        yLabel: "Voltage V (Volts)",
        series: [
          {
            name: "Voltage (V = I * 5 Ohms)",
            points: [
              { x: 0.5, y: 2.5 },
              { x: 1.0, y: 5.0 },
              { x: 1.5, y: 7.5 },
              { x: 2.0, y: 10.0 },
              { x: 2.5, y: 12.5 },
              { x: 3.0, y: 15.0 },
              { x: 4.0, y: 20.0 },
            ],
          },
        ],
        insight:
          "Linear Slope: The straight line passing through the origin demonstrates that resistance R is constant (5 Ohms) across varying currents, fulfilling pure Ohmic conductor behavior.",
        markers: [
          { x: 2.0, y: 10.0, label: "Operating Point (2A, 10V)" },
        ],
      },
      {
        type: "example",
        problem: "A circuit has a 12V battery connected across a 4 $\\Omega$ resistor. Calculate the current flowing through the circuit.",
        solution: "Applying Ohm's Law: $I = \\frac{V}{R} = \\frac{12\\text{ V}}{4\\text{ }\\Omega} = 3.0\\text{ Amperes}$.",
      },
      {
        type: "table",
        title: "Factors Affecting Electrical Resistance Matrix",
        headers: ["Parameter", "Mathematical Relationship", "Physical Consequence"],
        rows: [
          ["Length of Conductor ($L$)", "$R \\propto L$", "Doubling length doubles total electrical resistance"],
          ["Cross-sectional Area ($A$)", "$R \\propto \\frac{1}{A}$", "Thicker wires provide lower resistance"],
          ["Material Resistivity ($\\rho$)", "$R = \\rho \\frac{L}{A}$", "Copper/Silver have low resistivity; Nichrome has high resistivity"],
          ["Temperature ($T$)", "$R_T = R_0 (1 + \\alpha \\Delta T)$", "Metallic resistance increases with rising temperature"],
        ],
      },
      {
        type: "real_life",
        scenario: isHinglish
          ? "Ghar ke electronic appliances jaise electric heater ya light bulb dimmer."
          : "A water hose with a constriction valve or household electric heating element.",
        connection: isHinglish
          ? "Water pipe me pressure voltage ki tarah hai, paani ka flow current hai, aur valve constriction resistance hai."
          : "Water pressure corresponds to Voltage, water flow volume corresponds to Current, and pipe narrowing corresponds to Resistance.",
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Assuming Ohm's Law is a universal law applying to all electronic components.",
            fix: "Ohm's Law holds strictly for Ohmic conductors (metals). It fails for non-Ohmic devices like semiconductor diodes, transistors, and electrolytes.",
          },
        ],
      },
      {
        type: "mnemonic",
        text: "**V.I.R. Triangle:** 'Cover V to get I*R; cover I to get V/R; cover R to get V/I.'",
      },
      {
        type: "quick_summary",
        items: [
          "Linear V-I characteristic with constant slope represents Ohmic resistance.",
          "Standard SI unit of Resistance is the Ohm ($\\Omega = \\text{V/A}$).",
        ],
      },
    ];
  } else {
    // General default
    blocks = [
      {
        type: "definition",
        text: isHinglish
          ? `**${topic}** is subject area ka ek prominent foundational concept hai jo theoretical principles aur systematic observations par based hai.`
          : `**${topic}** represents a core foundational principle governed by rigorous analytical relationships and empirical observations.`,
      },
      {
        type: "key_points",
        items: [
          "**Core Invariant:** Establishes predictable relationships between fundamental parameters.",
          "**Analytical Boundary:** Valid under specified equilibrium or environmental constraints.",
          "**Practical Utility:** Applied across industrial, computational, and research domains.",
        ],
      },
      {
        type: "table",
        title: "Comparative Analysis Matrix",
        headers: ["Variant / Stage", "Core Mechanism", "Key Property", "Practical Application"],
        rows: [
          ["Primary State", "Baseline behavior under standard conditions", "Linear stability", "Foundational analysis"],
          ["Transitional State", "Dynamic response during operational shifts", "Adaptive adjustment", "Process control"],
          ["Equilibrium State", "Balanced system outcome where rate in = rate out", "Optimal efficiency", "System optimization"],
        ],
      },
      {
        type: "real_life",
        scenario: "Practical real-world implementation across engineering and natural systems.",
        connection: "Provides intuitive mental models for troubleshooting complex interactions.",
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Ignoring boundary conditions and environmental constraints.",
            fix: "Always verify assumptions before applying theoretical equations.",
          },
        ],
      },
      {
        type: "quick_summary",
        items: [
          "Understand core mental models before memorizing details.",
          "Check boundary conditions and invariant relationships.",
        ],
      },
    ];
  }

  return {
    isDemo: true,
    title: topic,
    subtitle: `Domain-Calibrated Cheatsheet (${domain.replace("_", " ").toUpperCase()} • ${level} • ${language})`,
    domain,
    level,
    language,
    blocks,
  };
};

/**
 * Stage 1: Classify topic using Gemini into a precise domain and identify required visual & structural elements.
 */
export const classifyTopicWithGemini = async ({
  topic,
  level = "Beginner",
  apiKey,
}) => {
  const prompt = `You are PadhAI's master academic taxonomy classifier.
Analyze the following academic/technical topic and classify it into EXACTLY ONE domain from this specific list:
${DOMAINS.join(", ")}

TOPIC: "${topic}"
LEARNER LEVEL: ${level}

Classification Guidelines:
- "Marginal Utility", "Supply and Demand", "Inflation", "Monetary Policy", "GDP" -> "economics"
- "Capital Market", "Corporate Finance", "Derivatives", "Portfolio Theory", "Equity" -> "business_finance"
- "Binary Search", "Dynamic Programming", "QuickSort", "Hash Tables", "React Hooks", "Tree Traversal" -> "computer_science" or "programming"
- "Calculus", "Linear Algebra", "Probability Distributions", "Differential Equations" -> "mathematics"
- "Ohm's Law", "Thermodynamics", "Electromagnetism", "Newton's Laws", "Circuit Analysis" -> "physics"
- "Organic Chemistry", "Periodic Table", "Chemical Equilibrium", "Reaction Kinetics" -> "chemistry"
- "Photosynthesis", "Cellular Respiration", "Genetics", "Ecology", "DNA" -> "biology"
- "French Revolution", "World War II", "Mughal Empire", "Industrial Revolution" -> "history"
- "Constitutional Law", "Criminal Justice", "Contract Law", "Tort Law" -> "law"
- "Plate Tectonics", "Climate Zones", "Geomorphology" -> "geography"
- "International Relations", "Public Administration", "Democracy" -> "political_science"

Return ONLY valid JSON matching this schema:
{
  "domain": "one of the allowed domains",
  "subdomain": "precise subject area (e.g. Microeconomics, Data Structures, European History)",
  "needsChart": boolean (true if topic naturally has numeric curves/graphs like supply-demand, utility, V-I curve, sine wave, etc.),
  "needsCode": boolean (true ONLY if programming or computer_science topic),
  "needsFormula": boolean (true if topic has real mathematical or physical formulas),
  "needsDiagram": boolean (true if topic benefits from flowchart/state machine/pathway diagram),
  "needsTimeline": boolean (true for historical events, legal chronologies, or evolution milestones)
}`;

  try {
    const classification = await callGemini({
      prompt,
      responseSchema: topicClassificationSchema,
      temperature: 0.2,
      apiKey,
    });
    return classification;
  } catch (err) {
    console.warn("Classification call fallback/error:", err.message);
    const lowerTopic = (topic || "").toLowerCase();
    let fallbackDomain = "general";

    if (/\b(ohm|volt|ampere|circuit|electric|current|resistance|velocity|gravity|physics|quantum|newton)\b/i.test(lowerTopic)) {
      fallbackDomain = "physics";
    } else if (/\b(utility|demand|supply|inflation|gdp|monetary|fiscal|elasticity|cost|consumer equilibrium)\b/i.test(lowerTopic)) {
      fallbackDomain = "economics";
    } else if (/\b(capital market|finance|stock|bond|equity|investment|portfolio)\b/i.test(lowerTopic)) {
      fallbackDomain = "business_finance";
    } else if (/\b(binary search|tree|algorithm|search|sort|react|javascript|python|sql|array|stack|queue|pointer|code)\b/i.test(lowerTopic)) {
      fallbackDomain = "computer_science";
    } else if (/\b(photosynthesis|cell|dna|rna|biology|organism|plant|gene|respiration)\b/i.test(lowerTopic)) {
      fallbackDomain = "biology";
    } else if (/\b(revolution|war|empire|dynasty|treaty|century|bastille|historical)\b/i.test(lowerTopic)) {
      fallbackDomain = "history";
    } else if (/\b(law|constitution|court|legal|crime|contract|rights)\b/i.test(lowerTopic)) {
      fallbackDomain = "law";
    } else if (/\b(integral|derivative|matrix|calculus|math|theorem|equation)\b/i.test(lowerTopic)) {
      fallbackDomain = "mathematics";
    }

    return {
      domain: fallbackDomain,
      subdomain: fallbackDomain,
      needsChart: fallbackDomain === "economics" || fallbackDomain === "physics",
      needsCode: fallbackDomain === "computer_science" || fallbackDomain === "programming",
      needsFormula: fallbackDomain === "mathematics" || fallbackDomain === "physics" || fallbackDomain === "economics",
      needsDiagram: fallbackDomain === "biology" || fallbackDomain === "computer_science",
      needsTimeline: fallbackDomain === "history" || fallbackDomain === "law",
    };
  }
};

/**
 * Stage 2: Generate rich domain-adaptive cheatsheet blocks.
 */
export const generateCheatsheetWithGemini = async ({
  topic,
  lessonTitle,
  lessonContent = "",
  courseTopic = "",
  currentLevel = "Beginner",
  language = "english",
  apiKey,
}) => {
  const activeTopic = topic || lessonTitle;
  const activeKey = resolveApiKey(apiKey);

  

  // 1. Stage 1: Classify topic domain
  let classification;
  if (activeKey === "DEMO_MODE") {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Demo mode is disabled in production. Please configure a valid Gemini API key.");
      error.status = 401;
      error.code = "INVALID_API_KEY";
      throw error;
    }
    classification = await classifyTopicWithGemini({ topic: activeTopic, level: currentLevel, apiKey: "DEMO_MODE" });
    return generateDemoBlocksCheatsheet({
      topic: activeTopic,
      level: currentLevel,
      language,
      classification,
    });
  }

  classification = await classifyTopicWithGemini({
    topic: activeTopic,
    level: currentLevel,
    apiKey: activeKey,
  });

  const domain = classification.domain;
  const isCS = domain === "programming" || domain === "computer_science";
  const isHinglish = language === "hinglish";
  const isAlgoOrDSA =
    isCS &&
    /\b(algorithm|algorithms|sort|sorting|search|searching|tree|trees|bst|avl|graph|graphs|dp|dynamic programming|recursion|heap|heaps|hash|hashing|stack|stacks|queue|queues|linked list|binary search|dijkstra|bfs|dfs|backtracking|greedy|complexity|big o|asymptotic|trie)\b/i.test(
      `${activeTopic} ${classification.subdomain || ""}`
    );

  let contentText = "";
  if (typeof lessonContent === "string") {
    contentText = lessonContent;
  } else if (lessonContent && typeof lessonContent === "object") {
    contentText = JSON.stringify(lessonContent, null, 2);
  }

  // Domain-specific prompt rules
  let domainSpecificRules = "";
  if (domain === "economics" || domain === "business_finance" || domain === "accounting") {
    domainSpecificRules = `
DOMAIN: ECONOMICS / FINANCE
- MUST include:
  1. 'definition' in simple, crystal-clear intuitive language.
  2. 'formula' (e.g. MU_n = TU_n - TU_{n-1} or Elasticity formulas) with full LaTeX and variable breakdown.
  3. 'chart' with realistic, numerically consistent data points (at least 5-7 points) showing relationships (e.g., TU rising to peak and MU falling to 0 and becoming negative). Include meaningful axis labels, title, analytical insight, and reference markers at critical inflection points (e.g., Satiety point, Equilibrium).
  4. 'table' representing an economic schedule or comparison matrix with numerical values.
  5. 'real_life' relatable scenario (e.g., eating pizza, drinking water, buying smartphones).
  6. 'common_mistakes' highlighting frequent exam confusion.
  7. 'mnemonic' and 'quick_summary'.
- STRICT PROHIBITION: DO NOT output any 'code' or 'syntax' blocks. Economics is an analytical/social science domain.
`;
  } else if (isCS) {
    if (isAlgoOrDSA) {
      domainSpecificRules = `
DOMAIN: COMPUTER SCIENCE (ALGORITHMS & DATA STRUCTURES)
- MUST include:
  1. 'definition' of the algorithm or data structure.
  2. 'code' or 'syntax' block containing clean, commented, production-grade snippet (e.g. javascript, python, cpp).
  3. 'table' covering time complexity ($O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$) and space complexity across Best, Average, Worst cases.
  4. 'diagram' with valid, renderable Mermaid flowchart showing algorithmic logic or structure.
  5. 'real_life' practical software engineering use case.
  6. 'common_mistakes' covering edge cases, off-by-one errors, or empty inputs.
  7. 'quick_summary' actionable takeaways.
`;
    } else {
      domainSpecificRules = `
DOMAIN: COMPUTER SCIENCE & SOFTWARE ENGINEERING (TOOLS / FRAMEWORKS / DEVOPS / SYSTEMS)
- MUST include:
  1. 'definition' of the tool, framework, architecture, or paradigm.
  2. 'code' or 'syntax' block containing realistic CLI commands, configuration (e.g. Dockerfile, yaml, bash), or code snippet with explanatory notes.
  3. 'table' comparing core commands, lifecycle states, options, architecture components, or practical tradeoffs (e.g. Command | Syntax / Flags | Purpose | Practical Behavior & Notes).
  4. 'diagram' with valid, renderable Mermaid flowchart showing architecture, workflow, or container lifecycle.
  5. 'real_life' production deployment or real-world system analogy.
  6. 'common_mistakes' practical gotchas, configuration traps, permission issues, or resource leaks.
  7. 'quick_summary' actionable takeaways.
- STRICT PROHIBITION: DO NOT invent fake mathematical formulas, Big-O notations, or calculus (e.g. NEVER generate time/space complexity O(L*D) or O(P) for Docker/Git/Linux/React/DevOps). Use practical command reference or comparison tables instead!
`;
    }
  } else if (domain === "mathematics" || domain === "physics" || domain === "chemistry") {
    domainSpecificRules = `
DOMAIN: EXACT SCIENCES (MATH / PHYSICS / CHEMISTRY)
- MUST include:
  1. 'definition' with physical/mathematical intuition.
  2. 'formula' with valid, renderable KaTeX LaTeX (e.g., V = I \cdot R or \int f(x) dx) and complete variable legend.
  3. 'chart' if a graphical relationship exists (e.g., Ohm's Law V-I line, damped oscillation, reaction rate curve).
  4. 'example' worked numeric problem with step-by-step solution.
  5. 'common_mistakes' calculation traps, unit conversion errors, or sign errors.
  6. 'real_life' or industrial application.
- STRICT PROHIBITION: DO NOT output 'code' blocks unless strictly computational math.
`;
  } else if (domain === "history" || domain === "law" || domain === "geography" || domain === "political_science") {
    domainSpecificRules = `
DOMAIN: HUMANITIES / HISTORY / LAW / CIVICS
- MUST include:
  1. 'definition' or core doctrine.
  2. 'timeline' with chronological sequence of major events/acts with years/dates.
  3. 'table' comparing factions, constitutional articles, legal precedents, or treaty terms.
  4. 'example' or landmark case study.
  5. 'mnemonic' to memorize key articles, sequences, or names.
  6. 'common_mistakes' common misconceptions or misattributed events.
- STRICT PROHIBITION: DO NOT output any 'code' blocks. Use 'formula' only if a formal legal equation/test exists, otherwise omit.
`;
  } else if (domain === "biology") {
    domainSpecificRules = `
DOMAIN: BIOLOGY / LIFE SCIENCES
- MUST include:
  1. 'definition' of the biological process or system.
  2. 'diagram' with valid Mermaid flowchart showing biological steps (e.g., Light Reactions -> Calvin Cycle).
  3. 'table' comparing organelle functions, chemical inputs/outputs, or taxonomic classifications.
  4. 'real_life' biological or ecological context.
  5. 'mnemonic' for memorizing biochemical cycles or orders.
  6. 'common_mistakes'.
- STRICT PROHIBITION: DO NOT output 'code' blocks.
`;
  } else {
    domainSpecificRules = `
DOMAIN: GENERAL ACADEMIC
- MUST include 'definition', 'key_points', 'table', 'real_life', 'common_mistakes', 'quick_summary'.
- DO NOT output 'code' blocks.
`;
  }

  const prompt = `You are PadhAI's Master Academic Infographic Cheatsheet Architect.
Generate an ULTRA-HIGH-YIELD, BEAUTIFULLY STRUCTURED 1-PAGE VISUAL REVISION CHEATSHEET on "${activeTopic}"${
    courseTopic ? ` in the context of "${courseTopic}"` : ""
  }.

TARGET CALIBRATION:
- Domain: ${domain} (${classification.subdomain})
- Level: ${currentLevel}
- Language: ${language} ${
    isHinglish
      ? "(IMPORTANT: Use natural, conversational Hinglish for all explanatory sentences! e.g., 'Jab price badhta hai toh demand kam ho jati hai...', 'Is algorithm ka main advantage yeh hai ki...')"
      : "(Standard clear academic English)"
  }

${domainSpecificRules}

BLOCK SPECIFICATIONS:
The cheatsheet must contain an array of between 8 and 14 cohesive, domain-adapted blocks matching these discriminated union types:
- definition: { type: "definition", text: string }
- key_points: { type: "key_points", items: string[] }
- formula: { type: "formula", name: string, latex: string (clean valid KaTeX without enclosing $$), explanation: string, variables: [{ symbol: string, meaning: string }] }
- chart: { type: "chart", chartType: "line"|"bar"|"area"|"scatter", title: string, xLabel: string, yLabel: string, series: [{ name: string, points: [{ x: number, y: number }] (at least 5 finite numeric coordinates) }], insight: string, markers?: [{ x: number, y: number, label: string }] }
- diagram: { type: "diagram", mermaid: string (valid flowchart TD syntax without backticks), caption: string }
  * Standard Steps / Processes / Artifacts: use square brackets with quotes ["Name"], e.g. ["Dockerfile"], ["Docker Build"], ["Docker Image"], ["Docker Container"].
  * Storage / Database / Registry: use cylinder [("Docker Registry")] or [("Database")].
  * Start / Finish terminals: use rounded (["Start"]) or (["Finish"]).
  * CRITICAL: Always wrap node labels in double quotes ["..."] and edge labels in quotes -->|"..."|. NEVER use unquoted ampersands (&), plus signs (+), or parentheses inside labels.
  * CRITICAL: Diamond braces {"Condition?"} are STRICTLY RESERVED for binary branching decisions (e.g. {"Is Valid?"} -->|"Yes"| A and -->|"No"| B). NEVER use diamond braces { } for entities, tools, stages, files, or objects.
  * Edge labels: keep short and concise (e.g. A -->|"Build"| B).
- table: { type: "table", title: string, headers: string[], rows: string[][] }
- code: { type: "code", language: string, code: string, explanation: string } (ONLY if computer_science or programming)
- syntax: { type: "syntax", language: string, snippet: string, notes: string } (ONLY if computer_science or programming)
- example: { type: "example", problem: string, solution: string }
- real_life: { type: "real_life", scenario: string, connection: string }
- common_mistakes: { type: "common_mistakes", items: [{ mistake: string, fix: string }] }
- timeline: { type: "timeline", events: [{ when: string, what: string }] }
- mnemonic: { type: "mnemonic", text: string }
- quick_summary: { type: "quick_summary", items: string[] }

CRITICAL FORMATTING INSTRUCTIONS:
1. Output MUST be strictly valid JSON conforming to the schema.
2. In 'formula.latex', provide valid LaTeX that KaTeX can render (do NOT include markdown code fences or enclosing dollar signs).
3. In 'chart.series', every point MUST have numeric x and y values (no strings or NaN).
4. Code and syntax blocks are REJECTED unless domain is programming or computer_science.
5. All text should be simple, high-yield, engaging, and clear.

${contentText ? `SOURCE MATERIAL CONTENT (GROUNDING):\n"""\n${contentText.slice(0, 50000)}\n"""\n` : ""}

EXACT JSON SCHEMA TO SATISFY:
{
  "title": "${activeTopic}",
  "subtitle": "High-Yield ${classification.subdomain || domain} Revision Cheatsheet",
  "domain": "${domain}",
  "level": "${currentLevel}",
  "language": "${language}",
  "blocks": [
    ...
  ]
}`;

  // Execute with validation & 1 retry on Zod / KaTeX failure
  let attempt = 0;
  const maxAttempts = 2;
  let lastValidationError = null;
  let currentPrompt = prompt;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const result = await callGemini({
        prompt: currentPrompt,
        temperature: 0.3,
        apiKey: activeKey,
      });

      // Normalize if domain or language missing
      if (!result.domain) result.domain = domain;
      if (!result.level) result.level = currentLevel;
      if (!result.language) result.language = language;

      // Sanitize diagram blocks to prevent malformed syntax or accidental decision diamonds
      if (Array.isArray(result.blocks)) {
        result.blocks = result.blocks.map((b) => {
          if (b && b.type === "diagram" && typeof b.mermaid === "string") {
            b.mermaid = sanitizeMermaidCode(b.mermaid);
          }
          return b;
        });
      }

      // Validate against strict Zod schema (with server-side KaTeX & domain rules)
      const validated = generatedCheatsheetSchema.parse(result);
      return validated;
    } catch (err) {
      console.warn(`Cheatsheet generation attempt ${attempt}/${maxAttempts} failed:`, err.message);
      lastValidationError = err;

      const isZodOrKatex =
        err.name === "ZodError" ||
        err.issues ||
        err.message?.includes("Invalid LaTeX") ||
        err.message?.includes("prohibited for non-CS");

      if (attempt < maxAttempts && isZodOrKatex) {
        const issueList = err.issues?.map((e) => `${e.path?.join(".") || "error"}: ${e.message}`).join("; ") || err.message;
        currentPrompt = `${prompt}\n\n⚠️ PREVIOUS ATTEMPT FAILED WITH VALIDATION ERRORS:\n${issueList}\nPlease fix all of the above validation errors and output the corrected valid JSON.`;
        continue;
      }

      // Propagate classified status
      if (err.status === 429 || err.code === "QUOTA_EXCEEDED") throw err;
      if (err.status === 401 || err.code === "INVALID_API_KEY") throw err;

      const customErr = new Error(
        `AI generated output did not match expected structure: ${
          err.issues ? err.issues.map((e) => e.message).join(", ") : err.message
        }`
      );
      customErr.status = 502;
      customErr.code = "AI_OUTPUT_INVALID";
      throw customErr;
    }
  }

  const finalErr = new Error(
    `AI generation failed after retry: ${lastValidationError?.message || "Output invalid"}`
  );
  finalErr.status = 502;
  finalErr.code = "AI_OUTPUT_INVALID";
  throw finalErr;
};
