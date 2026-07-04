import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { SOLUTIONS, CASE_STUDIES, BLOGS, CAREER_OPENINGS } from "./src/data";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client on server safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined. The JanaLLM live sandbox will run in simulation mode.");
}

// In-memory collections initialized with default data
let serverSolutions = [...SOLUTIONS];
let serverCaseStudies = [...CASE_STUDIES];
let serverBlogs = [...BLOGS];
let serverCareers = [...CAREER_OPENINGS];

// Contacts / Leads memory store with pre-populated Nagpur-relevant entries
const contacts: any[] = [
  {
    name: "Dr. Alok Verma",
    email: "alok.verma@nagpurhealth.org.in",
    company: "Nagpur Clinical Research Institute",
    message: "Inquiring about deploying an air-gapped JanaCore ERP system to track multi-ward healthcare indices and manage patient record flows without outbound network routing. HIPAA compliance is mandatory.",
    timestamp: new Date("2026-07-02T10:14:00Z")
  },
  {
    name: "Rajesh Shinde",
    email: "rshinde@mahatranzco.co.in",
    company: "Maharashtra Electricity Board",
    message: "We need a custom inventory and asset management portal to track 40+ substation metrics offline. Requesting Nagpur onsite design audit.",
    timestamp: new Date("2026-07-03T14:45:00Z")
  },
  {
    name: "Neha Gupta",
    email: "neha@centraldefense.gov.in",
    company: "Sovereign Logistics Core",
    message: "Seeking a consultation regarding local compilation of neural weights with full DPDP compliance limits. Require custom enterprise ERP dashboard demo.",
    timestamp: new Date("2026-07-04T08:30:00Z")
  }
];

const subscribers: string[] = [
  "director@nagpurtech.edu",
  "cybersec.lead@mahabank.co.in",
  "compliance@tatarack.com",
  "ops@defense-nagpur.gov.in"
];

// PUBLIC API: Get all customizable dynamic content
app.get("/api/content", (req, res) => {
  res.json({
    success: true,
    solutions: serverSolutions,
    caseStudies: serverCaseStudies,
    blogs: serverBlogs,
    careers: serverCareers
  });
});

// PUBLIC API: Lead Capture
app.post("/api/contact", (req, res) => {
  const { name, email, company, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Please fill out all required fields." });
  }
  
  const newLead = { name, email, company: company || "Independent", message, timestamp: new Date() };
  contacts.push(newLead);
  console.log("New Lead Received:", newLead);
  
  res.json({
    success: true,
    message: `Thank you, ${name}! Your consultation request has been secured. A Neurojna systems architect will reach out to ${email} within 4 hours.`
  });
});

// PUBLIC API: Newsletter Sign-up
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

// ADMIN API: Authenticate
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "neurojna") {
    return res.json({ success: true, token: "neurojna_admin_secure_token" });
  }
  res.status(401).json({ success: false, error: "Invalid admin credentials." });
});

// ADMIN API: Get everything (leads, subscribers, and customizable content)
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

// ADMIN API: Solutions Management
app.post("/api/admin/solutions", (req, res) => {
  const { action, solution } = req.body;
  if (!action || !solution) {
    return res.status(400).json({ success: false, error: "Missing parameters." });
  }

  if (action === "create" || action === "update") {
    const idx = serverSolutions.findIndex(s => s.id === solution.id);
    if (idx > -1) {
      serverSolutions[idx] = solution;
    } else {
      serverSolutions.push(solution);
    }
  } else if (action === "delete") {
    serverSolutions = serverSolutions.filter(s => s.id !== solution.id);
  }
  res.json({ success: true, solutions: serverSolutions });
});

// ADMIN API: Case Studies Management
app.post("/api/admin/case-studies", (req, res) => {
  const { action, caseStudy } = req.body;
  if (!action || !caseStudy) {
    return res.status(400).json({ success: false, error: "Missing parameters." });
  }

  if (action === "create" || action === "update") {
    const idx = serverCaseStudies.findIndex(c => c.id === caseStudy.id);
    if (idx > -1) {
      serverCaseStudies[idx] = caseStudy;
    } else {
      serverCaseStudies.push(caseStudy);
    }
  } else if (action === "delete") {
    serverCaseStudies = serverCaseStudies.filter(c => c.id !== caseStudy.id);
  }
  res.json({ success: true, caseStudies: serverCaseStudies });
});

// ADMIN API: Blogs Management
app.post("/api/admin/blogs", (req, res) => {
  const { action, blog } = req.body;
  if (!action || !blog) {
    return res.status(400).json({ success: false, error: "Missing parameters." });
  }

  if (action === "create" || action === "update") {
    const idx = serverBlogs.findIndex(b => b.id === blog.id);
    if (idx > -1) {
      serverBlogs[idx] = blog;
    } else {
      serverBlogs.push(blog);
    }
  } else if (action === "delete") {
    serverBlogs = serverBlogs.filter(b => b.id !== blog.id);
  }
  res.json({ success: true, blogs: serverBlogs });
});

// ADMIN API: Careers Management
app.post("/api/admin/careers", (req, res) => {
  const { action, career } = req.body;
  if (!action || !career) {
    return res.status(400).json({ success: false, error: "Missing parameters." });
  }

  if (action === "create" || action === "update") {
    const idx = serverCareers.findIndex(c => c.id === career.id);
    if (idx > -1) {
      serverCareers[idx] = career;
    } else {
      serverCareers.push(career);
    }
  } else if (action === "delete") {
    serverCareers = serverCareers.filter(c => c.id !== career.id);
  }
  res.json({ success: true, careers: serverCareers });
});

// ADMIN API: Delete Lead Contact
app.post("/api/admin/delete-lead", (req, res) => {
  const { index } = req.body;
  if (index === undefined || index < 0 || index >= contacts.length) {
    return res.status(400).json({ success: false, error: "Invalid lead index." });
  }
  contacts.splice(index, 1);
  res.json({ success: true, contacts });
});

// ADMIN API: Delete Subscriber
app.post("/api/admin/delete-subscriber", (req, res) => {
  const { email } = req.body;
  const idx = subscribers.indexOf(email);
  if (idx > -1) {
    subscribers.splice(idx, 1);
    return res.json({ success: true, subscribers });
  }
  res.status(400).json({ success: false, error: "Subscriber not found." });
});

// PUBLIC API: JanaLLM AI Chat Demo
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: "Message content is required." });
  }

  // If Gemini API key is missing, fall back to a high-quality simulated response explaining sovereign deployment
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
    
    // Add a small delay to mimic API latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    return res.json({ success: true, text: reply, simulated: true });
  }

  try {
    const formattedHistory = (history || []).map((h: any) => ({
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
        systemInstruction: "You are JanaLLM v2.5, a highly secure, sovereign offline-first enterprise intelligence model developed by Neurojna AI Pvt. Ltd. (Nagpur, India). Neurojna AI focuses on sovereign, localized, air-gapped neural network compute chips ('NeuroCore Edge' accelerators) and custom enterprise AI model fine-tuning ('JanaLLM'). Keep responses professional, highly technical, authoritative, and helpful. Mention localized offline capabilities, data security, and zero cloud leaks if users ask about deployment, privacy, or performance. Keep responses concise and structured.",
      }
    });

    const text = response.text || "I was unable to formulate a response. Please verify the connection.";
    res.json({ success: true, text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ success: false, error: "An error occurred with JanaLLM server nodes. Please try again." });
  }
});

// Configure Vite or Static Assets
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Neurojna AI App listening on port ${PORT}`);
  });
}

init();
