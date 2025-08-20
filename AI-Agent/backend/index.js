const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Agent } = require('alith');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Initialize Alith agent with the appropriate model
const agent = new Agent({
  model: process.env.ALITH_MODEL || "gemini-2.5-pro", // Default to gemini if not specified
  apiKey: process.env.GEMINI_API_KEY,
  baseUrl: process.env.ALITH_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai", // Default to Gemini's OpenAI compatible endpoint
});

// Helpers to safely parse/normalize AI output
function sanitizeFences(text) {
  return String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
}

function extractJson(text) {
  const cleaned = sanitizeFences(text);
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Try to slice between first '{' and last '}'
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const sliced = cleaned.slice(start, end + 1);
      try { return JSON.parse(sliced); } catch (_) {}
    }
  }
  return null;
}

function coerceEvaluation(obj, fallbackText) {
  const feedback = (obj && obj.feedback != null)
    ? String(obj.feedback)
    : (fallbackText ? String(fallbackText).slice(0, 1200) : "");
  let pct = obj ? obj.completionPct : undefined;
  if (typeof pct === 'string') pct = parseInt(pct, 10);
  if (!Number.isFinite(pct)) pct = 0;
  pct = Math.max(0, Math.min(100, Math.round(pct)));
  return { feedback, completionPct: pct };
}

app.post('/api/evaluate', async (req, res) => {
  const { title, description, gitcode } = req.body;

  if (!title || !description || !gitcode) {
    return res.status(400).json({ error: 'Please provide all fields.' });
  }

  try {
        const prompt = `
        # ROLE: You are a technical project reviewer.
        # TASK: 
        Evaluate the completion status of the software project described below. Analyze the project's stated goals against the provided codebase.
        # PROJECT DETAILS:
        - Project Title: ${title}
        - Project Description: ${description}
        - GitHub Codebase: ${gitcode}
        # INSTRUCTIONS:
        Based on your analysis of the codebase (e.g., README, file structure, source code), evaluate the project's progress towards fulfilling its description. Your feedback should touch upon:
        1.  **Feature Implementation:** Are the core features from the description present in the code?
        2.  **Project Structure:** Is the code organized in a logical way?
        3.  **Documentation:** Is there a helpful README and are there comments in the code?
        # OUTPUT FORMAT:
        Provide your response strictly in a JSON format with two keys: 'feedback' and 'completionPct'.
        - 'feedback': A qualitative analysis summarizing your findings on the points above.
        - 'completionPct': An estimated completion percentage (an integer from 0 to 100).
        # EXAMPLE RESPONSE:
        {
          "feedback": "The project has a solid foundation with a well-organized file structure. The core feature of user authentication is implemented, but the data processing module described is still a placeholder. The README is minimal and needs setup instructions.",
          "completionPct": 60
        }
      `;

    // Use Alith agent to generate response
    const response = await agent.prompt(prompt, {
      responseFormat: { type: "json_object" }
    });

    // Normalize possible response shapes
    const maybeText = (typeof response === 'string')
      ? response
      : (response?.content ?? response?.choices?.[0]?.message?.content ?? response?.toString?.());

    let parsed = null;
    // If response is already an object with desired keys
    if (response && typeof response === 'object' && (response.feedback != null || response.completionPct != null)) {
      parsed = response;
    } else if (maybeText) {
      parsed = extractJson(maybeText);
    }

    if (!parsed) {
      console.warn('Model returned non-JSON or empty output; returning fallback. Raw:', maybeText);
      return res.json(coerceEvaluation(null, maybeText || 'Unable to parse model output.'));
    }

    // Validate and coerce final shape
    const jsonResponse = coerceEvaluation(parsed, maybeText);
    return res.json(jsonResponse);
  } catch (error) {
    console.error('Error evaluating project:', error);
    res.status(502).json({ error: 'Failed to evaluate project.', details: String(error.message || error) });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
