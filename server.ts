import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { ruleBasedTriage } from './src/utils/triage.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini client with recommended telemetry headers
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * 1. AI-assisted Triage Endpoint
 * Categorizes the maintenance issue and calculates priority with reasoning.
 * Automatically falls back to rule-based engine if AI is unavailable.
 */
app.post('/api/ai/triage', async (req, res) => {
  const { title, description, building, roomNumber } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required for triage.' });
  }

  // Fallback helper
  const runFallback = (errorReason?: string) => {
    const fallback = ruleBasedTriage(title, description);
    return res.json({
      category: fallback.category,
      priority: fallback.priority,
      reasoning: fallback.reasoning + (errorReason ? ` (${errorReason})` : ''),
      suggestedAction: fallback.suggestedAction,
      isRuleBased: true,
      modelUsed: 'rule-based-engine'
    });
  };

  if (!ai || !process.env.GEMINI_API_KEY) {
    return runFallback('Gemini API key not configured, using built-in rule engine');
  }

  try {
    const prompt = `You are the lead triage engineer for a college campus facility management system.
Analyze this student maintenance complaint and return a JSON object.

Title: "${title}"
Description: "${description}"
Location: "${building || 'Campus'} - ${roomNumber || 'Unknown Room'}"

Allowed Categories (choose EXACTLY ONE):
- "electrical" (switches, sockets, lights, tube lights, MCB, sparks, power cuts)
- "hvac_fan" (ceiling fans, ACs, cooling, ventilation, heaters)
- "av_projector" (classroom projectors, HDMI cables, audio systems, smartboards, podium mics)
- "plumbing" (water leakage, taps, washrooms, flush, sinks, drain blockages)
- "internet_wifi" (campus Wi-Fi, Ethernet ports, router down, login portal issues)
- "furniture" (broken desks, benches, chairs, tables, doors, whiteboard)
- "civil_structural" (broken floor tiles, wall cracks, roof seepage, staircase railings)
- "other" (any miscellaneous issue)

Allowed Priorities (choose EXACTLY ONE):
- "emergency": Immediate safety danger, active water flood near electronics, sparks, fire hazard, or blocking total facility access
- "high": Disrupted ongoing or upcoming lecture/exam, major classroom projector breakdown, total washroom shutdown
- "medium": Annoying functional defect that needs fix within 24-48 hrs (e.g. slow ceiling fan, dripping tap, single desk broken)
- "low": Minor cosmetic issue or non-urgent request (e.g. squeaky hinge, scuffed paint, loose non-load screw)

Respond with ONLY valid JSON with this structure:
{
  "category": "category_string",
  "priority": "priority_string",
  "reasoning": "1-2 sentences explaining why this category and priority were chosen, noting safety or academic impact.",
  "suggestedAction": "1 short practical recommendation for maintenance staff (e.g., 'Inspect breaker panel first', 'Bring replacement HDMI cable & projector remote')"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      category: parsed.category || 'other',
      priority: parsed.priority || 'medium',
      reasoning: parsed.reasoning || 'Categorized via Gemini AI.',
      suggestedAction: parsed.suggestedAction || 'Assign to campus facility team.',
      isRuleBased: false,
      modelUsed: 'gemini-3.8-flash'
    });
  } catch (err) {
    console.warn('Gemini triage failed, falling back to rule engine:', err);
    return runFallback('Gemini request failed, fell back to rule-based engine');
  }
});

/**
 * 2. Grounded Diagnostic Search with Google Search Tool
 * Uses gemini-3.8-flash with googleSearch to fetch real equipment manuals,
 * safety codes, and official troubleshooting procedures for campus technicians.
 */
app.post('/api/ai/diagnose', async (req, res) => {
  const { equipment, issueDescription } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'Gemini service unavailable. Please check API key configuration.',
      fallbackSteps: [
        'Turn off main power to the affected room or fixture before inspection.',
        'Visually inspect cables, plugs, and breakers for signs of thermal stress.',
        'Consult the campus equipment logbook and check manufacturer warranty.'
      ]
    });
  }

  try {
    const prompt = `The college maintenance team is repairing equipment on campus:
Equipment / Fixture: ${equipment}
Reported Issue: ${issueDescription}

Use Google Search to find current manufacturer troubleshooting guides, common failure modes, and electrical safety codes.
Provide:
1. Common root causes
2. Step-by-step diagnostic procedure for the campus technician
3. Essential safety precautions (e.g. lock-out tag-out, voltage testing)
4. Recommended replacement parts or tools`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
      title: chunk.web?.title || 'Web Reference',
      uri: chunk.web?.uri || ''
    })).filter(s => s.uri) || [];

    return res.json({
      diagnosis: response.text,
      sources,
      modelUsed: 'gemini-3.8-flash (Search Grounded)'
    });
  } catch (err: any) {
    console.error('Diagnostic search failed:', err);
    return res.status(500).json({
      error: 'Could not generate grounded diagnosis.',
      details: err?.message || String(err)
    });
  }
});

/**
 * 3. Thinking Mode: Deep Root-Cause Failure Analysis
 * Uses gemini-3.8-flash with ThinkingLevel.HIGH to analyze complex recurring issues
 * (e.g. repeated power outages, HVAC failure under load, Wi-Fi channel interference).
 */
app.post('/api/ai/root-cause', async (req, res) => {
  const { building, failureHistory, issueDetails } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'Gemini service unavailable.',
      analysis: 'Manual inspection recommended: Check transformer balance and local substation load log.'
    });
  }

  try {
    const prompt = `You are a Senior Infrastructure and MEP (Mechanical, Electrical, Plumbing) Consultant analyzing a recurring campus failure pattern.
Building: ${building}
Failure Pattern & Symptoms: ${failureHistory || issueDetails}

Perform a rigorous, step-by-step systemic root-cause failure analysis (RCFA).
Evaluate:
1. Immediate trigger vs. latent systemic cause (e.g., undersized wiring, harmonic distortion, poor grounding, thermal throttling, scale buildup in pipes).
2. Failure propagation risk across adjacent classrooms or dormitories.
3. Preventative permanent fix vs temporary patch.
4. Estimated downtime and recommended execution schedule (e.g. weekend or off-hours).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    return res.json({
      analysis: response.text,
      thinkingLevel: 'HIGH',
      modelUsed: 'gemini-3.8-flash'
    });
  } catch (err: any) {
    console.error('Root cause thinking failed:', err);
    return res.status(500).json({
      error: 'Root cause analysis failed.',
      details: err?.message || String(err)
    });
  }
});

/**
 * 4. Multi-Turn CampusFix Chatbot
 * Maintains conversation history and acts as a 24/7 campus assistant.
 */
app.post('/api/ai/chat', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  if (!ai || !process.env.GEMINI_API_KEY) {
    return res.json({
      reply: "Hello! I'm CampusFix AI Bot (Offline Mode). You can report any campus issues like ceiling fans, projectors, Wi-Fi, or water leakage directly using the 'Report Issue' button on the dashboard!",
      role: 'model'
    });
  }

  try {
    // Format conversation history for Gemini SDK
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: `You are CampusFix Bot, the 24/7 smart assistant for the college campus maintenance platform.
Your goals:
1. Help students troubleshoot common campus issues before raising tickets (e.g., checking if classroom projector HDMI is set to input 1, checking if campus Wi-Fi requires eduroam login, checking if fan regulator is set to 0).
2. If the issue is a genuine infrastructure defect (broken fan, sparking switchboard, leaking tap, cracked bench), encourage them to file a ticket and suggest what details to include (Building, Room number, clear photos).
3. Always emphasize electrical and physical safety: if there's smoke, sparks, or water near power outlets, tell them immediately to stay clear and inform facility security.
4. Keep replies crisp, empathetic, helpful, and student-friendly. You can use clear English or friendly Hinglish if the user asks in Hindi/Hinglish.`
      }
    });

    return res.json({
      reply: response.text || 'I am ready to help you with campus infrastructure issues.',
      role: 'model'
    });
  } catch (err: any) {
    console.error('Chatbot error:', err);
    return res.status(500).json({
      error: 'Chat generation failed.',
      reply: 'Sorry, I hit a temporary network hiccup. Please try asking again or submit your complaint directly via the ticket form!'
    });
  }
});

// Start Express and integrate Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`CampusFix AI server listening at http://localhost:${port}`);
  });
}

startServer();
