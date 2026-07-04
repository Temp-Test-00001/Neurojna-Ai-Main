var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");

// src/data.ts
var SOLUTIONS = [
  {
    id: "custom-app-web-dev",
    type: "service",
    title: "Custom Application & Web Development",
    subtitle: "High-performance, secure, and scalably architected web and mobile systems",
    tagline: "High-fidelity bespoke systems engineered for critical operations.",
    description: "We design, develop, and deploy enterprise-grade custom web platforms, native mobile applications, and secure partner portals. Built with responsive desktop-first precision, fluid animations, and robust backend engineering to align perfectly with your operations.",
    features: [
      "Bespoke full-stack codebases (React, TypeScript, Node.js, Python, Go)",
      "Aesthetic and intuitive user interfaces designed for complex corporate workloads",
      "Advanced role-based access control (RBAC) and high-performance querying",
      "Full facility code reviews, penetration testing, and security hardening"
    ],
    specs: [
      { label: "Frontend Technologies", value: "React, Vite, Next.js, Tailwind CSS" },
      { label: "Backend Ecosystem", value: "Node.js, Express, Python (FastAPI/Django), Go" },
      { label: "Database Support", value: "PostgreSQL, MongoDB, Redis, Drizzle ORM" },
      { label: "Security Protocols", value: "AES-256 Encryption, OWASP Top 10 Hardened" }
    ],
    iconName: "Code"
  },
  {
    id: "enterprise-erp-management",
    type: "product",
    title: "Custom ERP & Management Systems",
    subtitle: "Centralized resource planning, operational dashboards, and database controllers",
    tagline: "Your entire operational framework unified under a single, bespoke workspace.",
    description: "Tailor-made Enterprise Resource Planning (ERP) and internal administration software that integrates inventory, customer relationships, financial registers, and team workflows. Bypassing bloated generic platforms, we build lean, fast systems customized to your exact requirements.",
    features: [
      "Real-time inventory controllers, automated invoicing, and digital ledger books",
      "Interactive visual dashboards for personnel, operational telemetry, and metrics",
      "Robust database migration pathways with absolute backward-compatibility",
      "Automated reporting pipelines with high-fidelity PDF, CSV, and Excel downloads"
    ],
    specs: [
      { label: "Core Modules", value: "CRM, HRM, Inventory Management, Billing, Supply Chain" },
      { label: "Visualization Engine", value: "D3.js & Recharts Interactive Telemetry" },
      { label: "Deployment Modes", value: "On-Premise Private Server, Hybrid Cloud, Private AWS/GCP" },
      { label: "Integration Hooks", value: "RESTful API Adapters, Custom Database Listeners" }
    ],
    iconName: "Cpu"
  },
  {
    id: "janallm-suite",
    type: "product",
    title: "Sovereign AI & JanaLLM Suite",
    subtitle: "Private LLM ecosystems embedded directly within your custom management systems",
    tagline: "Sovereign local intelligence, customized to execute inside your physical firewall.",
    description: "Empower your custom ERP, client portal, or database tools with JanaLLM\u2014our proprietary sovereign AI ecosystem. Tailored using your internal operating logs, legal manuals, and structured tables with absolute privacy guaranteed.",
    features: [
      "100% localized context retrieval and secure document vectorization",
      "Fine-tuned neural weights optimized for enterprise audit and database search tasks",
      "Runs locally inside your custom management systems with zero external API dependencies",
      "Granular administrative consoles with absolute logging and prompt-auditing control"
    ],
    specs: [
      { label: "Model Dimensions", value: "8B, 14B, 32B, and 70B parameter architectures" },
      { label: "Context Bounds", value: "Up to 128k Tokens (Hardware and Software Accelerated)" },
      { label: "Integration Tier", value: "Embedded database prompts, semantic lookup pipelines" },
      { label: "Compliance Level", value: "HIPAA, ISO 27001, Indian DPDP Act, and GDPR" }
    ],
    iconName: "BrainCircuit"
  }
];
var CASE_STUDIES = [
  {
    id: "aether-management",
    client: "Aether Medical Consortia",
    industry: "Healthcare Services",
    title: "Custom Patient Portal & Clinical Management System Across 42 Hospitals",
    challenge: "Aether Medical required a unified clinical management system and patient-facing portal. National medical guidelines strictly forbade patient records from traversing public cloud channels, preventing standard SaaS solutions.",
    solution: "Designed and deployed a highly secure, private-network clinical management platform integrated with a localized JanaLLM agent. Doctors securely parse diagnostics and coordinate bed management locally.",
    results: [
      "100% compliance with high-risk health data standards with zero leaks in 12 months",
      "Patient check-in, record categorization, and room allocation times halved",
      "Eliminated monthly subscription fees for rigid off-the-shelf software"
    ],
    metrics: [
      { value: "42", label: "Hospitals Standardized" },
      { value: "100%", label: "Private Sovereignty" },
      { value: "50%", label: "Operational Speedup" }
    ]
  },
  {
    id: "narmada-erp",
    client: "Narmada Hydroelectric Grid",
    industry: "Critical Infrastructure",
    title: "Custom Air-Gapped ERP and Asset Management System",
    challenge: "Narmada operations are distributed across completely isolated mountain hydroelectric plants. They required a rugged, synchronized system to track heavy turbine inventory and personnel schedules without regular internet access.",
    solution: "Engineered a decentralized ERP system featuring progressive web apps and offline database synchronization. Inventory updates and technician shifts sync automatically via secure localized media handovers.",
    results: [
      "Active resource coordination across 114 isolated mountain substations",
      "Eliminated turbine replacement order bottlenecks, reducing downtime by 34%",
      "Complete physical security with air-gapped system integrity"
    ],
    metrics: [
      { value: "114", label: "Isolated Sub-stations" },
      { value: "34%", label: "Downtime Reduction" },
      { value: "0", label: "Internet Bytes Required" }
    ]
  },
  {
    id: "himalaya-finance",
    client: "Himalaya Credit Bank",
    industry: "Banking & Finance",
    title: "Sovereign Financial ERP & Audit Suite",
    challenge: "Himalaya Credit Bank needed a robust audit system and financial database explorer. Sending transaction ledgers and customer records to a multi-tenant cloud-hosted ERP or audit pipeline carried extreme cyber-regulatory risks.",
    solution: "Built a bespoke financial ERP and secure audit tracking system, housing an embedded JanaLLM 70B model operating on localized secure hardware inside the bank's headquarters.",
    results: [
      "Full compliance with the Indian DPDP Act via on-premise secure container architecture",
      "Financial audit times reduced from 14 business days to 12 minutes",
      "Secure ledger querying and reporting interface deployed to 120 internal audit teams"
    ],
    metrics: [
      { value: "12m", label: "Audit Search Time" },
      { value: "120", label: "Internal Audit Teams" },
      { value: "0", label: "Compliance Penalties" }
    ]
  }
];
var BLOGS = [
  {
    id: "cost-of-generic-erp",
    title: "The Hidden Costs of Off-the-Shelf Enterprise ERPs",
    excerpt: "Generic ERP systems charge high subscription rates while forcing your business processes into arbitrary boxes. We explain why a custom management platform pays for itself.",
    content: "In the rush to digitalize operations, modern enterprises often default to licensing generic ERP systems from software giants. This creates immediate friction: companies must pay high recurring per-seat fees while adapting their real-world operations to fit rigid, prefabricated software structures. We believe software should adapt to your business, not the other way around. By developing tailored, clean, and proprietary management platforms, companies regain control over their data, optimize operational flows down to the single click, and completely eliminate licensing overhead.",
    category: "Enterprise Strategy",
    date: "June 28, 2026",
    readTime: "6 min read",
    author: "Dr. Ramesh Nair, Co-Founder & CTO"
  },
  {
    id: "secure-web-architecture",
    title: "Architecting Web & Mobile Platforms for High-Risk Sectors",
    excerpt: "Standard web frameworks prioritize rapid deployment over deep network security. Here is how we build hardened systems for defense, health, and finance systems.",
    content: "Building software for high-risk, zero-trust environments requires a shift in core engineering philosophies. Standard web development stacks often pack unnecessary abstract libraries that introduce critical security leaks. At Neurojna, we follow a minimalistic, dependency-light development path. By compiling server interfaces natively, validating database bounds using type-safe queries, and keeping authorization logic entirely server-side, our applications achieve high responsive speeds while locking out intrusion pathways.",
    category: "Systems Security",
    date: "May 14, 2026",
    readTime: "9 min read",
    author: "Amit Sen, Lead Solutions Architect"
  },
  {
    id: "data-sovereignty-regulations",
    title: "Embedding Localized AI Directly in Your Custom Software",
    excerpt: "India's Digital Personal Data Protection (DPDP) Act and worldwide privacy standards make cloud API models a regulatory challenge. Embedded local LLMs offer the only bulletproof alternative.",
    content: "As data protection authorities step up enforcement, sending user transaction logs or clinical records to public APIs is becoming a legal and administrative minefield. Devising bespoke application portals that host localized neural models inside the corporate firewall is the ultimate solution. Deeply integrating local AI models into inventory ledgers or CRM dashboards lets your personnel generate reports and query datasets instantly, with absolute certainty that no data is ever leaked.",
    category: "Regulatory Compliance",
    date: "April 03, 2026",
    readTime: "5 min read",
    author: "Siddharth Deshmukh, VP of Compliance"
  }
];
var CAREER_OPENINGS = [
  {
    id: "fullstack-eng",
    title: "Senior Full-Stack Engineer (Secure Systems)",
    department: "Software Engineering Core",
    location: "Nagpur (Hybrid)",
    type: "Full-time",
    experience: "5+ Years",
    description: "We are seeking a highly skilled React & Node.js/Python engineer to construct custom web portals and core ERP platforms. You will work on writing clean, secure, type-safe interfaces, optimized PostgreSQL query pipelines, and fluid user interactions.",
    requirements: [
      "Expertise in TypeScript, React, Express, and PostgreSQL/Drizzle ORM",
      "Solid grasp of responsive CSS, layout reflow, and fluid micro-animations (Framer Motion)",
      "Experience setting up multi-user authentication systems, RBAC, and secure cookie schemas",
      "Strong commitment to architectural clean-code practices and optimization"
    ]
  },
  {
    id: "erp-architect",
    title: "Lead Enterprise Systems / ERP Architect",
    department: "Enterprise Solutions Core",
    location: "Nagpur (Onsite)",
    type: "Full-time",
    experience: "6+ Years",
    description: "Lead the architecture and delivery of bespoke ERP and corporate management systems for our premier clients. You will model complex relational database systems, construct audit trails, and integrate localized automated ledger engines.",
    requirements: [
      "Extensive experience designing enterprise database schemas and distributed synchronization layers",
      "Familiarity with financial billing, warehouse logistics, or CRM software modules",
      "Deep understanding of secure hosting architectures (Docker, Kubernetes, private VPCs)",
      "Proven track record leading complex software development lifecycles"
    ]
  },
  {
    id: "ai-integration-eng",
    title: "Sovereign AI Integration Engineer",
    department: "AI & Data Integration",
    location: "Nagpur/Mumbai (Remote-friendly)",
    type: "Full-time",
    experience: "4+ Years",
    description: "Coordinate the embedding of local AI models (JanaLLM) inside our custom-developed applications. You will construct local vector database lookup pipelines, optimize prompt embeddings, and configure local container systems for LLM inference.",
    requirements: [
      "Experience working with open LLMs (Llama 3, Mistral, Gemma) and Python/Node.js AI SDKs",
      "Knowledge of vector search technologies (pgvector, Qdrant, Chroma)",
      "Excellent communication skills to help enterprise clients integrate local neural weights",
      "Solid understanding of hardware-acceleration and local runtime stacks (Ollama, vLLM)"
    ]
  }
];

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = 3e3;
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined. The JanaLLM live sandbox will run in simulation mode.");
}
var serverSolutions = [...SOLUTIONS];
var serverCaseStudies = [...CASE_STUDIES];
var serverBlogs = [...BLOGS];
var serverCareers = [...CAREER_OPENINGS];
var contacts = [
  {
    name: "Dr. Alok Verma",
    email: "alok.verma@nagpurhealth.org.in",
    company: "Nagpur Clinical Research Institute",
    message: "Inquiring about deploying an air-gapped JanaCore ERP system to track multi-ward healthcare indices and manage patient record flows without outbound network routing. HIPAA compliance is mandatory.",
    timestamp: /* @__PURE__ */ new Date("2026-07-02T10:14:00Z")
  },
  {
    name: "Rajesh Shinde",
    email: "rshinde@mahatranzco.co.in",
    company: "Maharashtra Electricity Board",
    message: "We need a custom inventory and asset management portal to track 40+ substation metrics offline. Requesting Nagpur onsite design audit.",
    timestamp: /* @__PURE__ */ new Date("2026-07-03T14:45:00Z")
  },
  {
    name: "Neha Gupta",
    email: "neha@centraldefense.gov.in",
    company: "Sovereign Logistics Core",
    message: "Seeking a consultation regarding local compilation of neural weights with full DPDP compliance limits. Require custom enterprise ERP dashboard demo.",
    timestamp: /* @__PURE__ */ new Date("2026-07-04T08:30:00Z")
  }
];
var subscribers = [
  "director@nagpurtech.edu",
  "cybersec.lead@mahabank.co.in",
  "compliance@tatarack.com",
  "ops@defense-nagpur.gov.in"
];
app.get("/api/content", (req, res) => {
  res.json({
    success: true,
    solutions: serverSolutions,
    caseStudies: serverCaseStudies,
    blogs: serverBlogs,
    careers: serverCareers
  });
});
app.post("/api/contact", (req, res) => {
  const { name, email, company, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Please fill out all required fields." });
  }
  const newLead = { name, email, company: company || "Independent", message, timestamp: /* @__PURE__ */ new Date() };
  contacts.push(newLead);
  console.log("New Lead Received:", newLead);
  res.json({
    success: true,
    message: `Thank you, ${name}! Your consultation request has been secured. A Neurojna systems architect will reach out to ${email} within 4 hours.`
  });
});
app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "Please enter a valid email address." });
  }
  subscribers.push(email);
  console.log("New Subscriber Registered:", email);
  res.json({
    success: true,
    message: "Subscription successful! You are now subscribed to the Neurojna Sovereign Intelligence Brief."
  });
});
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "neurojna") {
    return res.json({ success: true, token: "neurojna_admin_secure_token" });
  }
  res.status(401).json({ success: false, error: "Invalid admin credentials." });
});
app.get("/api/admin/data", (req, res) => {
  res.json({
    success: true,
    contacts,
    subscribers,
    solutions: serverSolutions,
    caseStudies: serverCaseStudies,
    blogs: serverBlogs,
    careers: serverCareers
  });
});
app.post("/api/admin/solutions", (req, res) => {
  const { action, solution } = req.body;
  if (!action || !solution) {
    return res.status(400).json({ success: false, error: "Missing parameters." });
  }
  if (action === "create" || action === "update") {
    const idx = serverSolutions.findIndex((s) => s.id === solution.id);
    if (idx > -1) {
      serverSolutions[idx] = solution;
    } else {
      serverSolutions.push(solution);
    }
  } else if (action === "delete") {
    serverSolutions = serverSolutions.filter((s) => s.id !== solution.id);
  }
  res.json({ success: true, solutions: serverSolutions });
});
app.post("/api/admin/case-studies", (req, res) => {
  const { action, caseStudy } = req.body;
  if (!action || !caseStudy) {
    return res.status(400).json({ success: false, error: "Missing parameters." });
  }
  if (action === "create" || action === "update") {
    const idx = serverCaseStudies.findIndex((c) => c.id === caseStudy.id);
    if (idx > -1) {
      serverCaseStudies[idx] = caseStudy;
    } else {
      serverCaseStudies.push(caseStudy);
    }
  } else if (action === "delete") {
    serverCaseStudies = serverCaseStudies.filter((c) => c.id !== caseStudy.id);
  }
  res.json({ success: true, caseStudies: serverCaseStudies });
});
app.post("/api/admin/blogs", (req, res) => {
  const { action, blog } = req.body;
  if (!action || !blog) {
    return res.status(400).json({ success: false, error: "Missing parameters." });
  }
  if (action === "create" || action === "update") {
    const idx = serverBlogs.findIndex((b) => b.id === blog.id);
    if (idx > -1) {
      serverBlogs[idx] = blog;
    } else {
      serverBlogs.push(blog);
    }
  } else if (action === "delete") {
    serverBlogs = serverBlogs.filter((b) => b.id !== blog.id);
  }
  res.json({ success: true, blogs: serverBlogs });
});
app.post("/api/admin/careers", (req, res) => {
  const { action, career } = req.body;
  if (!action || !career) {
    return res.status(400).json({ success: false, error: "Missing parameters." });
  }
  if (action === "create" || action === "update") {
    const idx = serverCareers.findIndex((c) => c.id === career.id);
    if (idx > -1) {
      serverCareers[idx] = career;
    } else {
      serverCareers.push(career);
    }
  } else if (action === "delete") {
    serverCareers = serverCareers.filter((c) => c.id !== career.id);
  }
  res.json({ success: true, careers: serverCareers });
});
app.post("/api/admin/delete-lead", (req, res) => {
  const { index } = req.body;
  if (index === void 0 || index < 0 || index >= contacts.length) {
    return res.status(400).json({ success: false, error: "Invalid lead index." });
  }
  contacts.splice(index, 1);
  res.json({ success: true, contacts });
});
app.post("/api/admin/delete-subscriber", (req, res) => {
  const { email } = req.body;
  const idx = subscribers.indexOf(email);
  if (idx > -1) {
    subscribers.splice(idx, 1);
    return res.json({ success: true, subscribers });
  }
  res.status(400).json({ success: false, error: "Subscriber not found." });
});
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: "Message content is required." });
  }
  if (!ai) {
    const promptLower = message.toLowerCase();
    let reply = "";
    if (promptLower.includes("price") || promptLower.includes("cost")) {
      reply = "JanaLLM is licensed on a node-compute or per-accelerator basis. For standard localized deployments, we bundle JanaLLM with our custom NeuroCore Edge hardware chips. Would you like us to generate a personalized enterprise quote? Please drop your details in our Contact form under 'Enterprise consultation'.";
    } else if (promptLower.includes("spec") || promptLower.includes("speed") || promptLower.includes("hardware") || promptLower.includes("neurocore")) {
      reply = "JanaLLM v2.5 operates flawlessly on our proprietary NeuroCore Edge PCIe accelerators, drawing only 45W of power while running a 32-billion parameter dense neural network at 85 tokens per second. Complete data air-gapping means zero latency spikes caused by network overhead.";
    } else {
      reply = "Hello! I am JanaLLM v2.5, Neurojna AI's proprietary, fully air-gapped sovereign intelligence agent. I process data with absolute security inside localized enterprise server clusters in Nagpur. Let me know how I can assist with neural architecture parameters or secure offline LLM workloads!";
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    return res.json({ success: true, text: reply, simulated: true });
  }
  try {
    const formattedHistory = (history || []).map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are JanaLLM v2.5, a highly secure, sovereign offline-first enterprise intelligence model developed by Neurojna AI Pvt. Ltd. (Nagpur, India). Neurojna AI focuses on sovereign, localized, air-gapped neural network compute chips ('NeuroCore Edge' accelerators) and custom enterprise AI model fine-tuning ('JanaLLM'). Keep responses professional, highly technical, authoritative, and helpful. Mention localized offline capabilities, data security, and zero cloud leaks if users ask about deployment, privacy, or performance. Keep responses concise and structured."
      }
    });
    const text = response.text || "I was unable to formulate a response. Please verify the connection.";
    res.json({ success: true, text });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ success: false, error: "An error occurred with JanaLLM server nodes. Please try again." });
  }
});
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Neurojna AI App listening on port ${PORT}`);
  });
}
init();
//# sourceMappingURL=server.cjs.map
