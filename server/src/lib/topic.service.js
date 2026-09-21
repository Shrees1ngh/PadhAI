import { resolveApiKey, callGemini } from "./gemini.service.js";
import { classifyTopicWithGemini } from "./cheatsheet.service.js";
import {
  generatedTopicContentSchema,
  DOMAINS,
} from "../modules/topics/topic.validator.js";

/**
 * Keep the 7 DSA interactive visualizers ONLY when classify() says domain is programming/computer_science
 * and the topic matches one of the algorithmic data structure patterns.
 */
export const detectMatchingDsaVisualization = (domain = "", topic = "") => {
  if (domain !== "programming" && domain !== "computer_science") {
    return "none";
  }
  const t = (topic || "").toLowerCase().trim();
  if (/\b(bst|binary search tree)\b/i.test(t)) return "bst";
  if (/\b(binary tree|avl tree|red black tree|tree traversal|binary trees)\b/i.test(t)) return "binary-tree";
  if (/\b(linked list|singly linked|doubly linked|circular linked list|linked lists)\b/i.test(t)) return "linked-list";
  if (/\b(stack|stacks|call stack|lifo)\b/i.test(t)) return "stack";
  if (/\b(queue|queues|priority queue|fifo|deque|circular queue)\b/i.test(t)) return "queue";
  if (/\b(sort|sorting|bubble sort|quick sort|merge sort|insertion sort|selection sort)\b/i.test(t)) return "sorting";
  if (/\b(graph|graphs|bfs|dfs|dijkstra|shortest path|breadth first search|depth first search)\b/i.test(t)) return "graph";
  if (/\b(array|arrays|dynamic array|matrix|2d array)\b/i.test(t)) return "array";
  return "none";
};

// Legacy alias for compatibility
export const detectVisualizationType = (topic = "") => {
  return detectMatchingDsaVisualization("computer_science", topic);
};

/**
 * Generate rich domain-adaptive mock Quick Learn content for DEMO_MODE in non-production.
 */
export const generateDemoQuickLearnContent = ({
  topic = "General Subject",
  level = "Beginner",
  language = "english",
  classification,
}) => {
  const isHinglish = language === "hinglish";
  const domain = classification?.domain || "economics";
  const subdomain = classification?.subdomain || domain;
  const visType = detectMatchingDsaVisualization(domain, topic);

  let blocks = [];

  if (domain === "economics") {
    blocks = [
      {
        type: "definition",
        text: isHinglish
          ? `**${topic}** ka core principle yeh hai ki jaise jaise hum kisi commodity ya service ke successive units consume karte hain, har extra unit se milne wali marginal satisfaction kam hoti jati hai.`
          : `**${topic}** is a cornerstone economic law stating that as consumption of a good increases, the marginal utility derived from each additional unit decreases, holding other factors constant.`,
      },
      {
        type: "simple_explanation",
        text: isHinglish
          ? `Socho aapko bohot tez pyas lagi hai. Pehla glass paani amrit jaisa lagta hai (maximum satisfaction). Dusra glass accha lagta hai, lekin teesre aur chauthe glass tak aate aate satisfaction lagbhag zero ho jati hai.`
          : `Imagine you are extremely thirsty after a workout. The first glass of water gives immense satisfaction. The second glass is refreshing, but by the fourth glass, you gain almost zero additional pleasure. This diminishing return per unit governs consumer behavior and pricing.`,
      },
      {
        type: "real_life",
        scenario: isHinglish
          ? "Buffet restaurants aur consumer shopping discounts (e.g., 'Buy 1 Get 2nd at 50% off')."
          : "All-you-can-eat buffets and volume discounting ('Buy 1 Get 2nd at 50% off').",
        connection: isHinglish
          ? "Retailers jante hain ki customers agle unit ke liye kam pay karna chahenge, isliye tiered pricing use karte hain."
          : "Retailers understand buyers will not pay full price for subsequent units once their urgent need is satiated.",
      },
      {
        type: "formula",
        name: "Marginal Utility Equation",
        latex: "MU_n = TU_n - TU_{n-1} = \\frac{\\Delta TU}{\\Delta Q}",
        explanation: isHinglish
          ? "Marginal Utility ($MU$) total utility mein aaye change ($\\Delta TU$) ko quantity change ($\\Delta Q$) se divide karke nikali jati hai."
          : "Marginal Utility ($MU$) measures the change in Total Utility ($\\Delta TU$) resulting from a one-unit change in quantity consumed ($\\Delta Q$).",
        variables: [
          { symbol: "MU_n", meaning: "Marginal Utility of the n-th unit" },
          { symbol: "TU_n", meaning: "Total Utility of n units" },
          { symbol: "\\Delta Q", meaning: "Change in quantity of units" },
        ],
      },
      {
        type: "chart",
        chartType: "line",
        title: "Total Utility vs. Marginal Utility Curve",
        xLabel: "Units Consumed",
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
          "TU peaks at 30 utils where MU = 0 (Point of Satiety). Consuming beyond Unit 6 leads to negative MU and declining TU.",
        markers: [
          { x: 6, y: 0, label: "Point of Satiety (MU=0)" },
          { x: 7, y: -3, label: "Disutility" },
        ],
      },
      {
        type: "table",
        title: "Consumption Schedule & Utility Progression",
        headers: ["Units (Q)", "Total Utility (TU)", "Marginal Utility (MU)", "Consumer State"],
        rows: [
          ["1 Unit", "10", "10", "Initial High Need"],
          ["2 Units", "18", "8", "Pleasurable Satisfaction"],
          ["3 Units", "24", "6", "Moderate Gain"],
          ["4 Units", "28", "4", "Near Saturation"],
          ["5 Units", "30", "2", "Almost Full"],
          ["6 Units", "30", "0", "Point of Satiety (Max TU)"],
          ["7 Units", "27", "-3", "Disutility / Oversatiation"],
        ],
      },
      {
        type: "step_by_step",
        title: "How Consumers Reach Equilibrium",
        steps: [
          { step: 1, title: "Initial Evaluation", explanation: "Evaluate marginal utility per dollar spent across available goods." },
          { step: 2, title: "Optimal Allocation", explanation: "Allocate budget where MU per rupee/dollar is highest." },
          { step: 3, title: "Equi-Marginal Equilibrium", explanation: "Reach equilibrium when MU_x / P_x = MU_y / P_y across all goods." },
        ],
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Confusing Total Utility (TU) with Marginal Utility (MU).",
            fix: "TU is the cumulative satisfaction; MU is only the additional satisfaction from the last unit.",
          },
        ],
      },
      {
        type: "takeaways",
        items: [
          "Marginal utility consistently declines as consumption increases.",
          "Total utility is maximized exactly when marginal utility reaches zero.",
          "Explains why essential water is cheap while non-essential diamonds are expensive (Diamond-Water Paradox).",
        ],
      },
      {
        type: "mini_quiz",
        questions: [
          {
            question: "What happens to Total Utility when Marginal Utility is equal to zero?",
            options: [
              "Total Utility reaches its maximum point",
              "Total Utility becomes zero",
              "Total Utility begins to increase exponentially",
              "Total Utility becomes negative",
            ],
            correctOptionIndex: 0,
            explanation: "When MU = 0, the consumer has extracted maximum possible satisfaction (Point of Satiety). Any further unit causes disutility.",
          },
        ],
      },
    ];
  } else if (domain === "computer_science" || domain === "programming") {
    blocks = [
      {
        type: "definition",
        text: `**${topic}** is a hierarchical data structure where each node has at most two children, organized such that the left subtree holds values smaller than the parent node and the right subtree holds values greater.`,
      },
      {
        type: "simple_explanation",
        text: `Think of a phonebook or dictionary arranged in a binary split. Instead of scanning item by item, at each node you compare values and eliminate half the search space.`,
      },
      {
        type: "real_life",
        scenario: "Database B-Trees and indexing systems looking up millions of records in milliseconds.",
        connection: "Maintains sorted order dynamically without needing full array re-allocation on insertions.",
      },
      {
        type: "diagram",
        mermaid: `graph TD\n  50((50)) --> 30((30))\n  50 --> 70((70))\n  30 --> 20((20))\n  30 --> 40((40))\n  70 --> 60((60))\n  70 --> 80((80))\n  style 50 fill:#4f46e5,stroke:#818cf8,color:#fff\n  style 30 fill:#059669,stroke:#34d399,color:#fff\n  style 70 fill:#059669,stroke:#34d399,color:#fff`,
        caption: "Balanced Binary Search Tree: left children < parent < right children",
      },
      {
        type: "table",
        title: "Time & Space Complexity Invariants",
        headers: ["Operation", "Average Case", "Worst Case (Skewed)", "Space Complexity"],
        rows: [
          ["Search", "O(log n)", "O(n)", "O(1) iterative / O(h) recursive"],
          ["Insertion", "O(log n)", "O(n)", "O(h)"],
          ["Deletion", "O(log n)", "O(n)", "O(h)"],
          ["Inorder Traversal", "O(n)", "O(n)", "O(h) stack"],
        ],
      },
      {
        type: "code",
        language: "javascript",
        code: `class TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nfunction searchBST(root, target) {\n  if (!root || root.val === target) return root;\n  if (target < root.val) return searchBST(root.left, target);\n  return searchBST(root.right, target);\n}`,
        explanation: "Recursively branches left if target is smaller, or right if target is larger, eliminating half the subtrees per step.",
      },
      {
        type: "step_by_step",
        title: "BST Search Algorithm",
        steps: [
          { step: 1, title: "Root Comparison", explanation: "Compare target with current root value. If matched, return node." },
          { step: 2, title: "Branch Left or Right", explanation: "If target < root.val, navigate to left child; else navigate right child." },
          { step: 3, title: "Base Termination", explanation: "Repeat until target is found or null pointer is reached (target absent)." },
        ],
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Assuming all BSTs guarantee O(log n) operations.",
            fix: "Degenerate/skewed BSTs degrade into linked lists with O(n) performance. Use self-balancing trees (AVL/Red-Black) to guarantee O(log n).",
          },
        ],
      },
      {
        type: "takeaways",
        items: [
          "Inorder traversal of a BST always yields keys in strictly sorted ascending order.",
          "Average search, insert, and delete complexity is O(log n).",
          "Balanced tree height h = floor(log2(n)).",
        ],
      },
      {
        type: "mini_quiz",
        questions: [
          {
            question: "Which tree traversal on a Binary Search Tree produces values in sorted ascending order?",
            options: ["Inorder traversal", "Preorder traversal", "Postorder traversal", "Level-order traversal"],
            correctOptionIndex: 0,
            explanation: "Inorder traversal visits Left Subtree -> Root -> Right Subtree, which directly matches the BST ordering invariant.",
          },
        ],
      },
    ];
  } else if (domain === "history") {
    blocks = [
      {
        type: "definition",
        text: `The **${topic}** (1789–1799) was a watershed period of radical political and societal transformation in France that dismantled the Ancien Régime, overthrew the absolute monarchy, and established foundational principles of modern democratic sovereignty.`,
      },
      {
        type: "simple_explanation",
        text: `Faced with catastrophic national debt, severe crop failures, and an unfair social structure where the 3rd Estate (98% of the population) paid all taxes while nobles and clergy were exempt, the people revolted to demand liberty, equality, and fraternity.`,
      },
      {
        type: "real_life",
        scenario: "Modern constitutional democracies, separation of church and state, and universal human rights frameworks.",
        connection: "Directly gave rise to the Declaration of the Rights of Man and Citizen, inspiring global anti-feudal constitutions.",
      },
      {
        type: "timeline",
        events: [
          { when: "May 1789", what: "Estates-General convenes at Versailles; 3rd Estate creates National Assembly." },
          { when: "July 14, 1789", what: "Storming of the Bastille prison in Paris, symbolizing the collapse of absolute royal authority." },
          { when: "August 1789", what: "Feudalism abolished; Declaration of the Rights of Man and of the Citizen proclaimed." },
          { when: "January 1793", what: "Execution of King Louis XVI by guillotine; Reign of Terror begins under Robespierre." },
          { when: "November 1799", what: "Coup of 18 Brumaire: Napoleon Bonaparte seizes power, ending the revolutionary republic." },
        ],
      },
      {
        type: "table",
        title: "The Three Estates of Pre-Revolutionary France",
        headers: ["Estate", "Composition", "Population Share", "Tax Burden & Privileges"],
        rows: [
          ["First Estate", "Catholic Clergy", "~1%", "Paid no taxes, collected tithes, owned 10% of land"],
          ["Second Estate", "Nobility / Aristocracy", "~2%", "Exempt from direct taxes, held top military and court posts"],
          ["Third Estate", "Peasants, Bourgeoisie, Workers", "~97%", "Paid virtually all taxes (taille, gabelle), zero political power"],
        ],
      },
      {
        type: "step_by_step",
        title: "Catalysts of the Revolution",
        steps: [
          { step: 1, title: "Financial Bankruptcy", explanation: "Massive war debts from funding the American Revolution and Seven Years' War." },
          { step: 2, title: "Enlightenment Ideas", explanation: "Philosophes like Rousseau and Voltaire questioned divine right of kings." },
          { step: 3, title: "Bread Crises", explanation: "Severe winters and droughts created runaway food prices and bread riots." },
        ],
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Believing the French Revolution ended with a stable democracy immediately.",
            fix: "The revolution transitioned through radical terror, the Directory, and culminated in Napoleon's military dictatorship.",
          },
        ],
      },
      {
        type: "takeaways",
        items: [
          "Ended centuries of absolute monarchy and feudal privileges in Western Europe.",
          "Secularized state institutions and established civil legal codes.",
          "Popularized the motto: Liberté, Égalité, Fraternité.",
        ],
      },
      {
        type: "mini_quiz",
        questions: [
          {
            question: "Which event on July 14, 1789 is commemorated as the symbol of the French Revolution's beginning?",
            options: [
              "Storming of the Bastille",
              "Execution of King Louis XVI",
              "Tennis Court Oath",
              "Coup of 18 Brumaire",
            ],
            correctOptionIndex: 0,
            explanation: "The Storming of the Bastille was the defining popular uprising that showed the royal military could no longer suppress the populace.",
          },
        ],
      },
    ];
  } else if (domain === "biology") {
    blocks = [
      {
        type: "definition",
        text: `**${topic}** is the biological process by which autotrophic organisms (plants, algae, and cyanobacteria) convert light energy into chemical energy stored in carbohydrate bonds, releasing oxygen as a byproduct.`,
      },
      {
        type: "simple_explanation",
        text: `Plants act as solar-powered food factories. They absorb sunlight via green chlorophyll in chloroplasts, draw water from roots, and capture carbon dioxide from the air to build glucose sugar and release oxygen.`,
      },
      {
        type: "real_life",
        scenario: "Global food webs and planetary carbon cycle maintenance.",
        connection: "Every breath you take and nearly all calories consumed across the globe trace back to primary photosynthetic production.",
      },
      {
        type: "formula",
        name: "Overall Photosynthesis Chemical Equation",
        latex: "6CO_2 + 6H_2O + \\text{Light Energy} \\xrightarrow{\\text{Chlorophyll}} C_6H_{12}O_6 + 6O_2",
        explanation: "Six carbon dioxide molecules and six water molecules react in the presence of photon energy to yield one glucose molecule and six oxygen gas molecules.",
        variables: [
          { symbol: "CO_2", meaning: "Carbon Dioxide absorbed from stomata" },
          { symbol: "H_2O", meaning: "Water absorbed by plant root xylem" },
          { symbol: "C_6H_{12}O_6", meaning: "Glucose energy storage molecule" },
          { symbol: "O_2", meaning: "Oxygen released into the atmosphere" },
        ],
      },
      {
        type: "diagram",
        mermaid: `graph LR\n  Sun[Solar Energy] --> Thylakoid[Light Reactions in Thylakoids]\n  Water[H2O] --> Thylakoid\n  Thylakoid --> Oxygen[O2 Released]\n  Thylakoid --> ATP[ATP & NADPH]\n  ATP --> Stroma[Calvin Cycle in Stroma]\n  CO2[CO2 Input] --> Stroma\n  Stroma --> Glucose[Glucose Sugar]\n  style Thylakoid fill:#059669,stroke:#34d399,color:#fff\n  style Stroma fill:#4f46e5,stroke:#818cf8,color:#fff`,
        caption: "Dual Stage Architecture: Light Reactions (Thylakoids) vs. Calvin Cycle (Stroma)",
      },
      {
        type: "table",
        title: "Comparison: Light Reactions vs. Calvin Cycle (Dark Reactions)",
        headers: ["Feature", "Light-Dependent Reactions", "Calvin Cycle (Light-Independent)"],
        rows: [
          ["Location", "Thylakoid membranes of chloroplasts", "Stroma of chloroplasts"],
          ["Requirements", "Photons (Sunlight), H2O", "CO2, ATP, NADPH"],
          ["Key Output", "ATP, NADPH, O2 gas", "G3P / Glucose sugar"],
          ["Key Enzyme", "Photosystems I & II, ATP Synthase", "RuBisCO (Carbon fixing enzyme)"],
        ],
      },
      {
        type: "step_by_step",
        title: "The Calvin Cycle Stages",
        steps: [
          { step: 1, title: "Carbon Fixation", explanation: "RuBisCO fixes CO2 onto 5-carbon RuBP to form 3-PGA." },
          { step: 2, title: "Reduction Phase", explanation: "ATP and NADPH convert 3-PGA into high-energy G3P sugars." },
          { step: 3, title: "RuBP Regeneration", explanation: "Remaining G3P molecules use ATP to regenerate RuBP for the next cycle." },
        ],
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Thinking dark reactions (Calvin Cycle) only occur at night.",
            fix: "The Calvin cycle is light-independent, but it requires ATP and NADPH produced during daylight and halts shortly after dark.",
          },
        ],
      },
      {
        type: "takeaways",
        items: [
          "Chlorophyll absorbs blue and red wavelengths while reflecting green light.",
          "Water molecules are split (photolysis) to provide replacement electrons, generating O2.",
          "RuBisCO is the most abundant enzyme on Earth.",
        ],
      },
      {
        type: "mini_quiz",
        questions: [
          {
            question: "Where do the light-dependent reactions of photosynthesis take place in plant cells?",
            options: ["Thylakoid membranes", "Chloroplast Stroma", "Mitochondrial matrix", "Cell cytoplasm"],
            correctOptionIndex: 0,
            explanation: "Light-dependent reactions occur within the thylakoid membranes where Photosystems I and II and ATP synthase are embedded.",
          },
        ],
      },
    ];
  } else if (domain === "business_finance") {
    blocks = [
      {
        type: "definition",
        text: `A **${topic}** is a financial venue where long-term debt (maturities over one year) and equity-backed securities are bought and sold, channeling savings from suppliers of capital to institutions needing long-term funding.`,
      },
      {
        type: "simple_explanation",
        text: `When governments need to build highways or corporations want to construct semiconductor factories, bank loans are often insufficient. Capital markets allow them to raise billions directly from public and institutional investors via stocks and bonds.`,
      },
      {
        type: "real_life",
        scenario: "Initial Public Offerings (IPOs) like Reddit/Arm or 10-year Sovereign Government Bonds.",
        connection: "Facilitates long-term productive investments while giving investors liquidity to exit anytime.",
      },
      {
        type: "table",
        title: "Primary Market vs. Secondary Market",
        headers: ["Parameter", "Primary Market", "Secondary Market"],
        rows: [
          ["Activity", "Issuance of brand new securities (IPOs, bond issues)", "Trading of existing securities among investors"],
          ["Beneficiary of Funds", "Directly funds the issuing company/government", "Funds flow between buyer and seller investors"],
          ["Price Determination", "Set by underwriting syndicate & issuer", "Continuous auction based on supply and demand"],
          ["Example", "Company issuing new shares in an IPO", "Trading Apple or Treasury bonds on an exchange"],
        ],
      },
      {
        type: "step_by_step",
        title: "How Capital Flows in the Market",
        steps: [
          { step: 1, title: "Capital Sourcing", explanation: "Households and pension funds allocate excess savings into investment accounts." },
          { step: 2, title: "Intermediation", explanation: "Investment banks underwrite securities and syndicate offerings." },
          { step: 3, title: "Deployment & Growth", explanation: "Enterprises deploy capital into R&D and facilities, generating economic return." },
        ],
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Confusing Money Markets with Capital Markets.",
            fix: "Money markets trade short-term debt (< 1 year, e.g., T-bills, commercial paper); Capital markets trade long-term securities (> 1 year, e.g., stocks, 10-year bonds).",
          },
        ],
      },
      {
        type: "takeaways",
        items: [
          "Primary markets create new capital; secondary markets provide vital liquidity.",
          "Prices in efficient capital markets reflect all publicly available information.",
          "Regulated by bodies like SEBI, SEC, and FCA to protect retail investors.",
        ],
      },
      {
        type: "mini_quiz",
        questions: [
          {
            question: "What is the primary difference between Capital Markets and Money Markets?",
            options: [
              "Capital markets trade long-term securities (>1 yr), while money markets trade short-term instruments (<1 yr)",
              "Capital markets only deal with cash, while money markets deal with gold",
              "Money markets are illegal unregulated exchanges",
              "Capital markets only allow government participation",
            ],
            correctOptionIndex: 0,
            explanation: "The distinguishing criterion is instrument maturity: money markets operate under 1 year, whereas capital markets focus on long-term funding beyond 1 year.",
          },
        ],
      },
    ];
  } else {
    // General / Physics / Math fallback
    blocks = [
      {
        type: "definition",
        text: `**${topic}** is a core subject area in ${domain.replace("_", " ").toUpperCase()}. Mastering ${topic} provides foundational principles and predictive mental models at the ${level} level.`,
      },
      {
        type: "simple_explanation",
        text: `Understanding ${topic} helps analyze and solve problems systematically in ${domain.replace("_", " ")} by breaking down complex interactions into fundamental rules.`,
      },
      {
        type: "real_life",
        scenario: `Practical real-world implementation across ${domain.replace("_", " ")} applications.`,
        connection: `Provides intuitive frameworks used by domain practitioners daily.`,
      },
      {
        type: "table",
        title: "Key Framework Comparison",
        headers: ["Component", "Function", "Impact"],
        rows: [
          ["Primary State", "Baseline behavior under standard conditions", "Standard analysis"],
          ["Dynamic Response", "Behavior during system shifts", "Adaptive control"],
          ["Equilibrium State", "Balanced system outcome", "Optimal efficiency"],
        ],
      },
      {
        type: "step_by_step",
        title: `Core Workflow for ${topic}`,
        steps: [
          { step: 1, title: "Initialize Conditions", explanation: "Establish baseline variables and constraints." },
          { step: 2, title: "Apply Governing Principles", explanation: "Execute transformations according to domain laws." },
          { step: 3, title: "Evaluate Outcome", explanation: "Validate results against known invariants." },
        ],
      },
      {
        type: "common_mistakes",
        items: [
          {
            mistake: "Ignoring boundary conditions and assumptions.",
            fix: "Always verify operational assumptions before applying theoretical models.",
          },
        ],
      },
      {
        type: "takeaways",
        items: [
          "Understand foundational principles before memorizing specific edge cases.",
          "Check invariant relationships across system changes.",
        ],
      },
      {
        type: "mini_quiz",
        questions: [
          {
            question: `What is the primary objective when analyzing ${topic}?`,
            options: [
              "Understanding fundamental principles and boundary constraints",
              "Ignoring mathematical or structural relationships",
              "Assuming random unpredictable behavior",
              "Skipping all validation steps",
            ],
            correctOptionIndex: 0,
            explanation: `Systematic analysis requires understanding core principles and checking boundary constraints.`,
          },
        ],
      },
    ];
  }

  // Extract miniQuiz questions for top-level backward compatibility
  const quizBlock = blocks.find((b) => b.type === "mini_quiz");
  const miniQuiz = quizBlock ? quizBlock.questions : [];

  return {
    isDemo: true,
    title: topic,
    topic,
    domain,
    subdomain,
    level,
    language,
    estimatedReadingTime: "6 mins",
    visualizationType: visType,
    blocks,
    miniQuiz,
    // Provide string summary fields for older UI readers if needed
    simpleExplanation: blocks.find((b) => b.type === "simple_explanation" || b.type === "definition")?.text || "",
    whyItMatters: blocks.find((b) => b.type === "real_life")?.connection || "",
    realLifeAnalogy: blocks.find((b) => b.type === "real_life")?.scenario || "",
  };
};

/**
 * Generate domain-adaptive Quick Learn topic content with Gemini.
 * Stage 1: Classify topic domain & needs
 * Stage 2: Generate rich structured blocks with strict Zod validation + 1 retry on errors
 */
export const generateQuickLearnContentWithGemini = async ({
  topic,
  level = "Beginner",
  language = "english",
  apiKey,
}) => {
  const activeKey = resolveApiKey(apiKey);

  if (!activeKey) {
    const error = new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in server/.env or configure your key in Settings."
    );
    error.status = 400;
    error.code = "MISSING_API_KEY";
    throw error;
  }

  // 1. Stage 1: Classify Topic
  const classification = await classifyTopicWithGemini({
    topic,
    level,
    apiKey: activeKey,
  });

  const domain = classification.domain || "general";
  const subdomain = classification.subdomain || domain;
  const isCsDomain = domain === "programming" || domain === "computer_science";
  const visType = detectMatchingDsaVisualization(domain, topic);

  if (activeKey === "DEMO_MODE") {
    if (process.env.NODE_ENV === "production") {
      const error = new Error(
        "Demo mode is disabled in production. Please configure a valid Gemini API key."
      );
      error.status = 401;
      error.code = "INVALID_API_KEY";
      throw error;
    }
    return generateDemoQuickLearnContent({
      topic,
      level,
      language,
      classification,
    });
  }

  // 2. Stage 2: Prompt engineering for domain-adaptive structured blocks
  const isHinglish = language === "hinglish";
  const languageInstruction = isHinglish
    ? "Generate ALL text in natural conversational Hinglish (Hindi written in Roman/English script with technical terms in clear English, e.g., 'Jab consumer kisi product ko consume karta hai...')."
    : "Generate all text in clear, accessible, intuitive English.";

  const domainGuidance = `
DOMAIN-SPECIFIC REQUIREMENTS FOR DOMAIN "${domain}":
- Analogies and real-world examples MUST come from the topic's own field:
  * Economics/Business/Finance: use shopping, budgeting, market equilibrium, banking, inflation, corporate cases. NO code blocks.
  * History/Law/Political Science: use historical milestones, societal causes, legal precedents. Include timeline block. NO code blocks.
  * Biology/Chemistry/Physics: use natural systems, body processes, chemical reactions, physical laws. Include formula (with LaTeX) and mermaid diagrams. NO code blocks unless computational biology.
  * Programming/Computer Science: include code blocks (with syntax highlighting), time/space complexity tables, and mermaid diagrams.
${!isCsDomain ? "- CRITICAL RULE: DO NOT generate any code or syntax blocks for this non-computer-science topic." : "- Include practical code snippet with line-by-line explanation."}
`;

  const prompt = `You are PadhAI's master pedagogical AI tutor.
Generate an engaging, structured, intuitive, and domain-calibrated learning guide for: "${topic}".
TARGET LEVEL: ${level}
LANGUAGE: ${language} (${languageInstruction})
CLASSIFICATION: Domain = ${domain}, Subdomain = ${subdomain}

${domainGuidance}

BLOCKS STRUCTURE:
Return 7 to 12 blocks chosen from the following discriminated union types:
- definition: { type: "definition", text: string }
- simple_explanation: { type: "simple_explanation", text: string }
- real_life: { type: "real_life", scenario: string, connection: string }
- formula: { type: "formula", name: string, latex: string (raw LaTeX WITHOUT outer $$), explanation: string, variables: [{ symbol: string, meaning: string }] } (Use ONLY if topic has real formulas; must be valid KaTeX)
- chart: { type: "chart", chartType: "line"|"bar"|"area"|"scatter", title: string, xLabel: string, yLabel: string, series: [{ name: string, points: [{ x: number, y: number }] (at least 5 points) }], insight: string, markers?: [{ x: number, y: number, label: string }] } (Include when topic naturally has numeric curves)
- diagram: { type: "diagram", mermaid: string, caption: string } (Use valid mermaid graph TD or graph LR syntax)
- table: { type: "table", title: string, headers: string[], rows: string[][] }
- code: { type: "code", language: string, code: string, explanation: string } (ONLY if CS/programming)
- step_by_step: { type: "step_by_step", title: string, steps: [{ step: number, title: string, explanation: string }] }
- common_mistakes: { type: "common_mistakes", items: [{ mistake: string, fix: string }] }
- takeaways: { type: "takeaways", items: string[] }
- mini_quiz: { type: "mini_quiz", questions: [{ question: string, options: string[] (exactly 4 options), correctOptionIndex: number (integer 0-3), explanation: string }] }

OUTPUT SCHEMA:
Return ONLY valid JSON matching this schema:
{
  "title": "${topic}",
  "topic": "${topic}",
  "domain": "${domain}",
  "subdomain": "${subdomain}",
  "level": "${level}",
  "language": "${language}",
  "estimatedReadingTime": "6 mins",
  "visualizationType": "${visType}",
  "blocks": [ ...array of block objects... ]
}`;

  let parsedOutput = null;

  try {
    parsedOutput = await callGemini({
      prompt,
      responseSchema: generatedTopicContentSchema,
      temperature: 0.3,
      apiKey: activeKey,
    });
  } catch (initialErr) {
    console.warn("Initial Quick Learn generation failed schema/API call:", initialErr.message);

    // 1-Time Retry feeding validation/parse errors back to the model
    try {
      const retryPrompt = `${prompt}\n\nIMPORTANT CORRECTION: The previous output failed validation with error: "${initialErr.message}". Ensure strict compliance with the JSON schema, KaTeX LaTeX syntax (no outer $$ wrappers), exactly 4 options with correctOptionIndex (0-3) for mini quiz, and NO code blocks for non-CS domains.`;
      parsedOutput = await callGemini({
        prompt: retryPrompt,
        responseSchema: generatedTopicContentSchema,
        temperature: 0.1,
        apiKey: activeKey,
      });
    } catch (retryErr) {
      console.error("Retry Quick Learn generation also failed:", retryErr.message);
      const validationError = new Error(
        `AI generated invalid structured content for "${topic}": ${retryErr.message}`
      );
      validationError.status = 502;
      validationError.code = "AI_OUTPUT_INVALID";
      throw validationError;
    }
  }

  // Final server-side Zod validation
  const validated = generatedTopicContentSchema.safeParse(parsedOutput);
  if (!validated.success) {
    const errorDetails = validated.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    const validationError = new Error(
      `AI generated invalid structured content for "${topic}": ${errorDetails}`
    );
    validationError.status = 502;
    validationError.code = "AI_OUTPUT_INVALID";
    throw validationError;
  }

  const finalTopic = validated.data;
  finalTopic.visualizationType = visType;

  // Extract miniQuiz questions for backward compatibility
  const quizBlock = finalTopic.blocks.find((b) => b.type === "mini_quiz");
  finalTopic.miniQuiz = quizBlock ? quizBlock.questions : [];

  return finalTopic;
};
