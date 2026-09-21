import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAndParseJson, resolveApiKey } from "./gemini.service.js";
import { generatedCheatsheetSchema } from "../modules/cheatsheets/cheatsheet.validator.js";
import { ENV } from "../config/env.js";

/**
 * Detect topic domain to specialize fallback & context
 */
export const detectTopicDomain = (title = "", content = "") => {
  const text = `${title} ${content}`.toLowerCase();
  
  if (
    /marginal utility|utility|elasticity|macroeconomics|microeconomics|monetary policy|fiscal policy|inflation|deflation|gdp|demand|supply|consumer equilibrium|indifference curve|monopoly|oligopoly|opportunity cost|keynesian|banking|finance|commerce|taxation|revenue|cost curve|law of diminishing/i.test(
      text
    )
  ) {
    return "economics";
  }
  
  if (
    /algorithm|data structure|binary search|tree|graph|dynamic programming|sorting|array|linked list|javascript|python|react|database|sql|nosql|async|pipeline|backend|frontend|node|api|complexity|big-o|git|recursion|hash/i.test(
      text
    )
  ) {
    return "computer_science";
  }

  if (
    /calculus|derivative|integral|matrix|algebra|geometry|trigonometry|thermodynamics|quantum|physics|chemistry|organic chemistry|newton|force|velocity|acceleration|probability|statistics|vector/i.test(
      text
    )
  ) {
    return "science_math";
  }

  if (
    /constitution|fundamental right|article|jurisdiction|law of tort|contract|history|revolution|parliament|governance|sociology|philosophy|civil/i.test(
      text
    )
  ) {
    return "law_humanities";
  }

  return "general";
};

/**
 * Generate a domain-intelligent fallback cheatsheet when API key is demo or rate-limited.
 */
const generateDynamicFallbackCheatsheet = ({ lessonTitle, currentLevel = "Intermediate" }) => {
  const domain = detectTopicDomain(lessonTitle);

  if (domain === "economics") {
    return {
      unitNumber: "ECONOMICS REVISION",
      topicDomain: "economics",
      title: `${lessonTitle} — High-Yield Economics Cheatsheet`,
      subtitle: "Micro & Macro Economic Principles, Curves, Formulas & Schedules",
      overview: `A high-yield conceptual breakdown of ${lessonTitle}. Features visual curves, mathematical relationship schedules, intuitive consumer behavior examples, and exam-critical rules at the ${currentLevel} level.`,
      cards: [
        {
          number: 1,
          title: "Core Definition & Meaning",
          categoryType: "Core Principle",
          definition: "Marginal Utility (MU) is the additional satisfaction or utility gained from consuming one more unit of a good or service.",
          bulletPoints: [
            "**Total Utility (TU):** The overall sum of satisfaction derived from all units consumed ($TU = \\sum MU$).",
            "**Marginal Utility (MU):** The rate of change in Total Utility per additional unit consumed ($MU = \\Delta TU / \\Delta Q$).",
            "**Initial Utility:** The utility derived from the very first unit of consumption.",
          ],
          formula: "MU_n = TU_n - TU_{n-1} \\quad \\text{or} \\quad MU = \\frac{\\Delta TU}{\\Delta Q}",
          example: "Drinking Water: The 1st glass when thirsty provides immense satisfaction (20 utils), the 2nd gives 12 utils, the 3rd gives 4 utils, and the 4th gives 0 utils (quenched).",
          visualDiagram: `   +---------------+---------------+---------------+
   | Units (Q)     | Total Util(TU)| Marginal(MU)  |
   +---------------+---------------+---------------+
   | 1 Slice       | 20 Utils      | 20 (Initial)  |
   | 2 Slices      | 32 Utils      | 12            |
   | 3 Slices      | 38 Utils      | 6             |
   | 4 Slices (Max)| 40 Utils      | 2             |
   | 5 Slices (Sat)| 40 Utils (Max)| 0 (Point Sat) |
   | 6 Slices      | 35 Utils      | -5 (Negative) |
   +---------------+---------------+---------------+`,
          examTip: "Exam Trap: Total Utility (TU) is maximum when Marginal Utility (MU) equals ZERO, NOT when MU is maximum!",
        },
        {
          number: 2,
          title: "Law of Diminishing Marginal Utility (DMU)",
          categoryType: "Fundamental Law",
          definition: "As a consumer consumes more and more units of a specific commodity continuously, the utility derived from each successive unit keeps declining.",
          bulletPoints: [
            "**Formulated By:** H.H. Gossen (Gossen's First Law of Consumption).",
            "**Psychological Basis:** Intensity of desire for a good decreases as more of it is consumed.",
            "**Universal Rule:** Applies to virtually all normal consumption goods in daily life.",
          ],
          formula: "\\frac{d(TU)}{dQ} = MU > 0 \\text{ (rising)}, \\quad MU = 0 \\text{ (peak)}, \\quad MU < 0 \\text{ (falling)}",
          example: "Eating Pizza Slices: 1st slice is delicious. By the 5th slice, you feel full. By the 6th slice, you feel sick (negative utility/disutility).",
          visualDiagram: `   Utils ^
         |        .--* (TU Curve Peaks at MU=0)
      40 |       /    \\
      30 |      /      \\
      20 |     /        \\
       0 +----+----+----+----+----+---> Quantity (Q)
         |   1    2    3    4    5    6
     -10 |                   \\ (MU slopes downward & crosses zero)`,
          examTip: "Direct Question: State Gossen's First Law. Answer always starts with standard units & continuous consumption conditions.",
        },
        {
          number: 3,
          title: "Assumptions of the Law",
          categoryType: "Assumptions & Preconditions",
          definition: "The Law of Diminishing Marginal Utility holds true only under specific realistic economic assumptions.",
          bulletPoints: [
            "**Rational Consumer:** Consumer aims to maximize total satisfaction.",
            "**Standard Units:** Commodity must be consumed in reasonable, normal sizes (a cup of tea, not spoonfuls).",
            "**Continuous Consumption:** No long intervals or time gaps between successive units.",
            "**Constant Income & Prices:** Income, tastes, and prices of related goods remain unchanged.",
            "**Constant MU of Money:** The value of money itself is assumed constant during the analysis.",
          ],
          example: "Giving spoonfuls of water to a thirsty person increases desire instead of diminishing it; standard glass size is required.",
          visualDiagram: `   [Assumptions Checklist]
   ├── Rational Consumer (Seeks Max Satisfaction)
   ├── Standard & Uniform Quantity (No mini portions)
   ├── Continuous Sequence (No 4-hour gaps)
   └── Unaltered Preferences & Prices`,
          examTip: "Always list at least 4 assumptions in university 5-mark questions to secure full marks.",
        },
        {
          number: 4,
          title: "Consumer's Equilibrium (Single & Multi-Commodity)",
          categoryType: "Equilibrium Condition",
          definition: "A consumer reaches equilibrium when they allocate their limited income such that the marginal utility per rupee spent is equal across all goods.",
          bulletPoints: [
            "**Single Good Condition:** $MU_x / P_x = MU_m$ (where $MU_m$ is marginal utility of money).",
            "**Two Goods Condition (Law of Equi-Marginal Utility):** $\\frac{MU_x}{P_x} = \\frac{MU_y}{P_y} = MU_m$.",
            "**Budget Equality:** $P_x \\cdot Q_x + P_y \\cdot Q_y = \\text{Total Income}$.",
          ],
          formula: "\\frac{MU_x}{P_x} = \\frac{MU_y}{P_y} = \\dots = \\frac{MU_n}{P_n} = MU_m",
          example: "If $MU_x/P_x = 10$ utils/₹ and $MU_y/P_y = 6$ utils/₹, the consumer should spend more on Good X and less on Good Y until ratios balance.",
          visualDiagram: `   Equilibrium Condition:
   +-------------------------------------------------+
   |      MU of Good X            MU of Good Y       |
   |   -------------------   =   ------------------- |
   |     Price of Good X         Price of Good Y     |
   +-------------------------------------------------+`,
          examTip: "If $MU_x/P_x > MU_y/P_y$, the consumer buys more of X, which lowers $MU_x$ until equality is restored.",
        },
        {
          number: 5,
          title: "Exceptions & Paradox of Value (Water-Diamond Paradox)",
          categoryType: "Exceptions & Nuances",
          definition: "Certain items appear to violate DMU initially or demonstrate why price depends on Marginal Utility rather than Total Utility.",
          bulletPoints: [
            "**Water vs Diamond:** Water has massive Total Utility (essential for life) but low Marginal Utility (abundant, low price). Diamonds have low Total Utility but high Marginal Utility (rare, high price).",
            "**Hobbies & Collections:** Rare stamps, coins, or antique art where each addition increases passion.",
            "**Addictions & Habits:** Alcohol or narcotics where initial units may heighten craving (irrational behavior).",
            "**Knowledge & Reading:** Acquiring knowledge often stimulates desire to learn even more.",
          ],
          example: "Water is plentiful so $MU_{water}$ is tiny, making it cheap. Diamonds are scarce so $MU_{diamond}$ is immense, making them expensive.",
          visualDiagram: `   WATER                vs        DIAMOND
   ------------------             ------------------
   Total Utility: HUGE            Total Utility: Low
   Marginal Utility: Tiny         Marginal Utility: HUGE
   Market Price: Cheap            Market Price: Expensive`,
          examTip: "Adam Smith's paradox was resolved by Alfred Marshall: Price is governed by Marginal Utility, NOT Total Utility!",
        },
        {
          number: 6,
          title: "Relationship: TU and MU Key Stages",
          categoryType: "Mathematical Curve Relationship",
          definition: "The three distinct stages summarizing the mathematical relationship between Total Utility and Marginal Utility curves.",
          bulletPoints: [
            "**Stage 1 (Positive MU):** As long as MU is positive ($MU > 0$), TU increases at a diminishing rate.",
            "**Stage 2 (Zero MU - Point of Satiety):** When $MU = 0$, TU reaches its maximum point.",
            "**Stage 3 (Negative MU - Disutility):** When $MU < 0$, TU begins to decline.",
          ],
          formula: "MU = 0 \\iff TU = \\text{Maximum (Satiety Point)}",
          example: "At the 4th slice of pizza, you are 100% full (TU is max, MU = 0). The 5th slice causes pain (MU is negative, TU drops).",
          visualDiagram: `   Stage 1: MU > 0  ===> TU is Increasing (at diminishing rate)
   Stage 2: MU = 0  ===> TU is MAXIMUM (Point of Satiety)
   Stage 3: MU < 0  ===> TU is Decreasing (Disutility)`,
          examTip: "Draw both curves vertically aligned in your exam copy for guaranteed 100% diagram marks.",
        },
      ],
      comparisonTable: {
        title: "Total Utility (TU) vs Marginal Utility (MU) Comparison Matrix",
        headers: ["Parameter", "Total Utility (TU)", "Marginal Utility (MU)", "Economic Significance"],
        rows: [
          {
            type: "Definition",
            definition: "Sum total of satisfaction from consuming all units.",
            example: "TU of 3 slices = 20 + 12 + 6 = 38 utils",
            use: "Measures overall consumer well-being",
            badgeColor: "indigo",
          },
          {
            type: "Formula",
            definition: "TU = \\sum MU or TU_n = MU_1 + MU_2 + ... + MU_n",
            example: "MU = TU_n - TU_{n-1} or \\Delta TU / \\Delta Q",
            use: "Calculates marginal rate of change",
            badgeColor: "emerald",
          },
          {
            type: "At Satiety Point",
            definition: "Reaches its absolute highest maximum value.",
            example: "MU drops exactly to ZERO (0).",
            use: "Optimal consumption point for free goods",
            badgeColor: "amber",
          },
          {
            type: "When Over-consumed",
            definition: "Starts sloping downward and decreases.",
            example: "Becomes NEGATIVE (causing disutility).",
            use: "Explains downward sloping demand curve",
            badgeColor: "rose",
          },
        ],
      },
      quickRevisionPoints: [
        "MU = Change in TU / Change in Quantity (Slope of TU curve).",
        "When MU is positive, TU is rising at a decreasing rate.",
        "When MU is ZERO, TU is at its MAXIMUM (Point of Satiety).",
        "When MU is negative, TU declines (Disutility zone).",
        "Gossen's 1st Law = Law of Diminishing Marginal Utility.",
        "Gossen's 2nd Law = Law of Equi-Marginal Utility (MUx/Px = MUy/Py).",
        "Price of a commodity is determined by Marginal Utility, not Total Utility.",
        "Law fails if units are non-standard or consumption is discontinuous.",
      ],
      examPoints: [
        "Explain the Law of Diminishing Marginal Utility with a schedule and diagram.",
        "Derive the relationship between Total Utility (TU) and Marginal Utility (MU).",
        "How does a consumer achieve equilibrium in case of two commodities?",
        "Explain the Diamond-Water Paradox using Marginal Utility theory.",
        "What are the main assumptions and exceptions to the Law of DMU?",
        "Why does the Demand Curve slope downward? Relate with MU.",
      ],
      topperTip: "Draw the TU and MU curves on top of each other sharing the same X-axis. Show MU=0 aligned with the peak of TU.",
    };
  }

  // Fallback for Computer Science / Tech topics
  if (domain === "computer_science") {
    return {
      unitNumber: "CS REVISION",
      topicDomain: "computer_science",
      title: `${lessonTitle} — High-Yield Tech Cheatsheet`,
      subtitle: "Syntax, Complexity Tables, Architectural Diagrams & Real-World Code",
      overview: `Dense, high-yield technical summary of ${lessonTitle}. Designed for rapid recall of syntax patterns, Big-O complexities, data structures, and edge-case handling at the ${currentLevel} level.`,
      cards: [
        {
          number: 1,
          title: "Core Definition & Invariants",
          categoryType: "Fundamentals",
          definition: `Core architecture and fundamental invariants defining ${lessonTitle}.`,
          bulletPoints: [
            "**Primary Purpose:** Provides efficient computation and structured state management.",
            "**Invariant Guarantee:** Guarantees predictable behavior under high concurrency and load.",
            "**Optimal Access:** Optimized for fast retrieval and clean abstractions.",
          ],
          codeSnippet: `// Standard Clean Implementation Pattern\nfunction processItem(input) {\n  if (!input) throw new Error("Invalid input");\n  return { success: true, timestamp: Date.now() };\n}`,
          codeLanguage: "javascript",
          example: "Used in low-latency cache stores, routing layers, and indexed search pipelines.",
          visualDiagram: `   [Client Request] ──> [Validation Gate] ──> [Execution Engine] ──> [Store]`,
          examTip: "Always verify base-case termination and boundary inputs in technical interviews.",
        },
        {
          number: 2,
          title: "Time & Space Complexity Matrix",
          categoryType: "Big-O Analysis",
          definition: "Asymptotic time and memory bounds across best, average, and worst-case execution paths.",
          bulletPoints: [
            "**Lookup / Search:** Average $O(\\log n)$, Worst $O(n)$ in unbalanced cases.",
            "**Insertion / Deletion:** $O(\\log n)$ amortized with rebalancing.",
            "**Space Complexity:** $O(n)$ auxiliary memory allocation.",
          ],
          formula: "T(n) = 2T(n/2) + O(n) \\implies O(n \\log n) \\quad \\text{(Master Theorem)}",
          example: "Binary search on 1,000,000 items takes at most 20 comparisons ($2^{20} \\approx 10^6$).",
          visualDiagram: `   Operation | Average | Worst Case | Space\n   ----------+---------+------------+-------\n   Search    | O(log n)| O(n)       | O(1)\n   Insert    | O(log n)| O(n)       | O(1)\n   Delete    | O(log n)| O(n)       | O(1)`,
          examTip: "Always mention both Time AND Auxiliary Space complexity when answering Big-O questions.",
        },
        {
          number: 3,
          title: "Common Pitfalls & Edge Cases",
          categoryType: "Defensive Coding",
          definition: "High-frequency production bugs and how to prevent them cleanly.",
          bulletPoints: [
            "**Null / Undefined checks:** Always validate external inputs before running core logic.",
            "**Off-by-one errors:** Carefully track loop bounds ($i < n$ vs $i \\le n$).",
            "**Memory leaks:** Clean up lingering listeners and unbound recursive stacks.",
          ],
          codeSnippet: `// Guard against edge cases\nif (!root) return null;\nif (root.left === null && root.right === null) return root.val;`,
          codeLanguage: "javascript",
          example: "Unchecked recursive depth on large inputs causes Stack Overflow (Maximum call stack size exceeded).",
          visualDiagram: `   [Input] ──> Is Valid? ──No──> Early Return / Guard\n                  │\n                 Yes ──> Execute Core Routine`,
          examTip: "Interviewers look for defensive boundary checks before jumping to the core algorithm.",
        },
      ],
      comparisonTable: {
        title: "Paradigms & Approaches Matrix",
        headers: ["Approach", "Time Complexity", "Space Complexity", "Best Use Case"],
        rows: [
          {
            type: "Iterative Approach",
            definition: "Uses loops and explicit pointers.",
            example: "while (curr) { curr = curr.next; }",
            use: "Memory-constrained production systems ($O(1)$ space).",
            badgeColor: "emerald",
          },
          {
            type: "Recursive (Divide & Conquer)",
            definition: "Breaks problem into sub-problems via call stack.",
            example: "solve(left); solve(right);",
            use: "Hierarchical trees, graphs, and nested structures.",
            badgeColor: "indigo",
          },
          {
            type: "Memoized / DP",
            definition: "Stores previously computed results in lookup table.",
            example: "if (memo[key]) return memo[key];",
            use: "Overlapping subproblems with optimal substructure.",
            badgeColor: "amber",
          },
        ],
      },
      quickRevisionPoints: [
        "Always define state invariants and base cases first.",
        "Verify Time and Auxiliary Space bounds for worst-case scenarios.",
        "Use defensive boundary guards to eliminate null-pointer exceptions.",
        "Prefer iterative solutions when call-stack depth exceeds limit.",
      ],
      examPoints: [
        `What are the core properties and invariants of ${lessonTitle}?`,
        "Derive the time and space complexity in best, average, and worst cases.",
        "Compare the iterative vs recursive implementations.",
        "How do you handle edge cases such as empty inputs or duplicates?",
      ],
      topperTip: "State the algorithm's mental model first, trace a mini test input, then write clean modular code.",
    };
  }

  // Fallback for General / Science / Math
  return {
    unitNumber: "REVISION UNIT",
    topicDomain: domain,
    title: `${lessonTitle} — High-Yield Revision Cheatsheet`,
    subtitle: "Core Principles, Visual Mental Models & Solved Examples",
    overview: `Comprehensive visual revision matrix for ${lessonTitle}. Designed for rapid recall and exam excellence at the ${currentLevel} level.`,
    cards: [
      {
        number: 1,
        title: "Core Definition & Fundamentals",
        categoryType: "Fundamental Concept",
        definition: `Primary principles and core definitions governing ${lessonTitle}.`,
        bulletPoints: [
          "**Primary Concept:** Fundamental foundation upon which the topic is constructed.",
          "**Core Functionality:** Explains how variables and forces interact systematically.",
          "**Key Relevance:** High-frequency exam topic with direct practical applications.",
        ],
        example: "Applicable to standard exam problems and real-world system analysis.",
        visualDiagram: `   [Input Condition] ──────> [Governing Rule] ──────> [Outcome / Equilibrium]`,
        examTip: "Always write standard definitions verbatim before adding real-life examples.",
      },
      {
        number: 2,
        title: "Key Rules, Formulas & Models",
        categoryType: "Rules & Formulations",
        definition: "Mathematical formulation or structural mechanics governing this domain.",
        bulletPoints: [
          "**Governing Formula / Rule:** Direct relationship between dependent and independent factors.",
          "**Boundary Conditions:** Limits within which the principle remains valid.",
        ],
        formula: "\\text{Output} = f(\\text{Inputs}, \\text{Parameters})",
        example: "Step-by-step application in standard test numericals or case problems.",
        visualDiagram: `   +-------------------------------------------------+
   |  Rule / Principle Breakdown                     |
   |  • Factor A (Directly Proportional)             |
   |  • Factor B (Inversely Proportional)            |
   +-------------------------------------------------+`,
        examTip: "Remember to state all constant variables and boundary conditions.",
      },
    ],
    comparisonTable: {
      title: "Core Concepts Comparison Matrix",
      headers: ["Element", "Definition", "Example", "Primary Use"],
      rows: [
        {
          type: "Primary Method",
          definition: "Standard established technique.",
          example: "Direct application",
          use: "Standard textbook problems",
          badgeColor: "indigo",
        },
        {
          type: "Alternative Approach",
          definition: "Optimized or modern variation.",
          example: "Shortcut calculation",
          use: "Competitive speed tests",
          badgeColor: "emerald",
        },
      ],
    },
    quickRevisionPoints: [
      "Understand the foundational definition in simple terms.",
      "Identify the core governing rule and its limitations.",
      "Practice step-by-step numerical/case applications.",
      "Review high-frequency exam traps and counter-examples.",
    ],
    examPoints: [
      `Define ${lessonTitle} and state its primary properties.`,
      "What are the main assumptions or boundary conditions?",
      "Provide a concrete real-world example illustrating the concept.",
      "Explain the step-by-step mechanism or derivation.",
    ],
    topperTip: "Understand Concepts ➔ Practice Examples ➔ Write Definitions ➔ Revise Regularly",
  };
};

/**
 * Generates an AI-powered high-yield revision cheatsheet using Gemini.
 *
 * @param {Object} params
 * @param {string} params.lessonTitle
 * @param {string} params.lessonContent
 * @param {string} [params.courseTopic]
 * @param {string} [params.currentLevel="Intermediate"]
 * @param {string} [params.apiKey]
 */
export const generateCheatsheetWithGemini = async ({
  lessonTitle,
  lessonContent,
  courseTopic = "",
  currentLevel = "Intermediate",
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in server/.env or provide your key."
    );
    error.status = 400;
    error.code = "MISSING_API_KEY";
    throw error;
  }

  if (activeKey === "DEMO_MODE") {
    return generateDynamicFallbackCheatsheet({ lessonTitle, currentLevel });
  }

  let contentText = "";
  if (typeof lessonContent === "string") {
    contentText = lessonContent;
  } else if (lessonContent && typeof lessonContent === "object") {
    contentText = JSON.stringify(lessonContent, null, 2);
  }

  const detectedDomain = detectTopicDomain(lessonTitle, courseTopic || contentText);

  const prompt = `You are PadhAI's Master Academic Infographic Cheatsheet Architect. Your mission is to generate an ULTRA-HIGH-YIELD, BEAUTIFULLY STRUCTURED 1-PAGE VISUAL REVISION CHEATSHEET on "${lessonTitle}"${
    courseTopic ? ` (in the context of "${courseTopic}")` : ""
  } for a student at the **${currentLevel}** level.

IMPORTANT PEDAGOGICAL & DOMAIN-SPECIFIC DIRECTIVES:
First, recognize the academic subject domain:
- Detected Domain: "${detectedDomain.toUpperCase()}" (or determine from the topic name: Economics, Computer Science / Tech, Mathematics / Statistics, Physical & Natural Sciences, Law / Humanities / Commerce).

STRICT DOMAIN ADAPTATION RULES:
1. IF ECONOMICS / COMMERCE / FINANCE TOPIC (e.g. "Marginal Utility", "Supply & Demand", "Elasticity", "Monetary Policy", "Inflation", "Cost Curves"):
   - DEFINITIONS: Explain concepts in easy-to-understand, crystal-clear, intuitive language (not impenetrable jargon).
   - FORMULAS & MATH: Include relevant formulas (e.g., $MU = \\Delta TU / \\Delta Q$, $E_d = \\frac{\\%\\Delta Q}{\\%\\Delta P}$, $MU_x / P_x = MU_y / P_y$).
   - VISUAL GRAPHS & SCHEDULES: You MUST include ASCII art visual graphs/curves and schedules showing the curves (e.g., Marginal Utility downward sloping curve, Total Utility peak at MU=0, Demand-Supply intersection, schedules with units and utils).
   - REAL-WORLD CONSUMER EXAMPLES: Include everyday relatable examples (e.g., eating consecutive pizza slices, drinking water in a desert, shopping choices).
   - ASSUMPTIONS, EXCEPTIONS & EXAM TRAPS: Detail key assumptions (continuous consumption, rational consumer) and exceptions (Water-Diamond Paradox, addictions, collectors).
   - ABSOLUTE PROHIBITION: DO NOT output computer programming syntax or pseudo-code (like javascript or python) unless explicitly requested!

2. IF COMPUTER SCIENCE / CODING / DSA TOPIC (e.g. "Binary Search Trees", "Dynamic Programming", "React Hooks", "Graph BFS"):
   - Code snippets & syntax patterns in real programming language (Python, JavaScript, C++, or SQL).
   - Time & Space Big-O complexity tables ($O(1)$, $O(\\log n)$, $O(n)$).
   - ASCII visual tree / memory / architecture / flowchart diagrams.
   - Real software production use cases and common bugs/edge cases.

3. IF MATHEMATICS / PHYSICS / NATURAL SCIENCES TOPIC (e.g. "Calculus Derivatives", "Thermodynamics", "Quantum Mechanics"):
   - Principle/law definition with physical intuition.
   - Core mathematical formulas with variable legends.
   - ASCII graphs / schematic coordinate plots / vector diagrams.
   - Step-by-step worked numerical example with real numbers.
   - Common calculation traps and unit conversion mistakes.

4. IF LAW / HUMANITIES / HISTORY / GENERAL TOPIC (e.g. "Fundamental Rights", "Law of Torts", "French Revolution"):
   - Core doctrine / principle / article explained clearly.
   - Historical context, timeline, or legal hierarchy flowchart in ASCII.
   - Landmark cases / case study / policy examples.
   - Key distinctions and comparisons. No programming code.

JSON STRUCTURE & REQUIRED FIELDS:
Return STRICT valid JSON matching this exact structure:
{
  "unitNumber": "UNIT REVISION",
  "topicDomain": "${detectedDomain}",
  "title": "${lessonTitle}",
  "subtitle": "${courseTopic || 'High-Yield Visual Revision Cheatsheet'}",
  "overview": "Ultra-concise 2-sentence synthesis of this topic in simple, easy-to-understand language.",
  "cards": [
    {
      "number": 1,
      "title": "CLEAR BOLD CONCEPT NAME",
      "categoryType": "Core Law / Graph / Formula / Real-Life Example / Algorithm / Assumption / Pitfall",
      "definition": "1-2 sentence crystal clear explanation in simple, easy language.",
      "bulletPoints": [
        "**Key Sub-Point 1:** Explanation",
        "**Key Sub-Point 2:** Explanation",
        "**Key Sub-Point 3:** Explanation"
      ],
      "formula": "LaTeX or clean formula string (if math/econ/science applicable, otherwise empty string)",
      "codeSnippet": "Working code snippet (ONLY if CS/tech topic, otherwise empty string)",
      "codeLanguage": "javascript / python / sql (ONLY if CS/tech topic, otherwise empty string)",
      "example": "Concrete everyday relatable real-life example illustrating this concept.",
      "visualDiagram": "ASCII visual graph / curve / schedule / tree / flowchart diagram",
      "examTip": "High-yield exam trap or mnemonic rule to remember."
    }
  ],
  "comparisonTable": {
    "title": "Key Comparisons & Paradigms Matrix",
    "headers": ["Concept / Variant", "Definition", "Example / Curve Behavior", "Primary Exam Use"],
    "rows": [
      {
        "type": "Name",
        "definition": "Definition text",
        "example": "Concrete example / curve description",
        "use": "Where to use / exam significance",
        "badgeColor": "indigo"
      }
    ]
  },
  "quickRevisionPoints": [
    "Punchy high-yield takeaway rule 1",
    "Punchy high-yield takeaway rule 2",
    "Punchy high-yield takeaway rule 3",
    "Punchy high-yield takeaway rule 4",
    "Punchy high-yield takeaway rule 5",
    "Punchy high-yield takeaway rule 6"
  ],
  "examPoints": [
    "Important University / Exam Question 1?",
    "Important University / Exam Question 2?",
    "Important University / Exam Question 3?",
    "Important University / Exam Question 4?",
    "Important University / Exam Question 5?"
  ],
  "topperTip": "Actionable, high-impact topper study advice for this specific subject."
}

Generate between 6 and 10 rich, comprehensive, domain-tailored cards covering all crucial aspects of "${lessonTitle}".

SOURCE MATERIAL CONTENT:
"""
${(contentText || lessonTitle).slice(0, 75000)}
"""`;

  let rawOutput = "";

  try {
    // Attempt 1: @google/genai SDK
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const response = await ai.models.generateContent({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      rawOutput =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        response?.text ||
        "";
    } catch (sdkErr) {
      console.warn(
        "Primary @google/genai call failed for cheatsheet, falling back to @google/generative-ai:",
        sdkErr.message
      );
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({
        model: ENV.GEMINI_MODEL || "gemini-3.6-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    }

    const parsed = cleanAndParseJson(rawOutput);
    return generatedCheatsheetSchema.parse(parsed);
  } catch (error) {
    console.error("Cheatsheet generation failed:", error.message);
    if (
      error.message?.includes("429") ||
      error.message?.includes("Quota exceeded") ||
      error.message?.includes("RESOURCE_EXHAUSTED") ||
      error.message?.includes("API key not valid")
    ) {
      console.warn("Cheatsheet hit rate limit or quota, returning dynamic domain-aware cheatsheet fallback.");
      return generateDynamicFallbackCheatsheet({ lessonTitle, currentLevel });
    }
    if (error.name === "ZodError" || error.issues) {
      console.warn("Schema validation issue, returning dynamic domain-aware fallback:", error.message);
      return generateDynamicFallbackCheatsheet({ lessonTitle, currentLevel });
    }
    // Fallback if all else fails so user experience is always rich
    return generateDynamicFallbackCheatsheet({ lessonTitle, currentLevel });
  }
};
