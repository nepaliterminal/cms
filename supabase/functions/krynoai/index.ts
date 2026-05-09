const SYSTEM = `You are KrynoAI, the writing assistant for KrynoluxDC — a local news organization covering the Washington DC metro area. You help journalists and editors write, improve, and polish news articles for a community audience: students, parents, educators, and residents.

Guidelines:
- Professional, clear, journalistic tone
- AP Style (abbreviate months with 6+ letters, titles before names, etc.)
- Active voice preferred
- Lead with the most important facts (inverted pyramid)
- Accessible language — no unnecessary jargon
- Keep headlines under 70 characters
- DC local context matters — these stories affect real community members`;

const PROMPTS = {
  improve:   (c) => `Improve the writing of this article excerpt — fix grammar, clarity, flow, and style while preserving all facts:\n\n${c}\n\nReturn only the improved text.`,
  headlines: (c, t) => `Suggest 5 strong news headlines for this article. Punchy, accurate, under 70 characters.\n\nCurrent title: ${t || "(none)"}\n\nArticle:\n${c}\n\nList only the 5 headlines, numbered.`,
  intro:     (c, t) => `Write a strong news lede (opening paragraph) answering Who/What/When/Where/Why in 2–3 sentences.\n\nTitle: ${t || "(none)"}\nContent:\n${c}\n\nReturn only the lede.`,
  expand:    (c) => `Expand this passage with more detail and context, keeping journalistic tone:\n\n${c}\n\nReturn only the expanded version.`,
  shorten:   (c) => `Tighten this text — cut unnecessary words while keeping all key facts:\n\n${c}\n\nReturn only the shortened version.`,
  tone:      (c) => `Analyze this excerpt: voice (active/passive), readability, journalistic quality, AP style issues, and overall tone. Give specific, actionable suggestions.\n\n${c}`,
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { action, content = "", title = "", message = "" } = await req.json();

    let userMsg;
    if (action === "chat") {
      userMsg = message || "Hello";
    } else {
      const fn = PROMPTS[action];
      if (!fn) {
        return new Response(JSON.stringify({ error: "Unknown action: " + action }), {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
      userMsg = fn(content, title);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      return new Response(JSON.stringify({ error: `Anthropic API error ${anthropicRes.status}: ${errBody}` }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const result = await anthropicRes.json();
    const text = result.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return new Response(JSON.stringify({ text }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
