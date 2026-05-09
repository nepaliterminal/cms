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

async function tavilySearch(query: string, apiKey: string) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: true,
    }),
  });
  if (!res.ok) throw new Error(`Tavily error ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function callGroq(messages: object[], apiKey: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "llama-3.1-8b-instant", max_tokens: 1500, messages }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const { action, content = "", title = "", message = "" } = await req.json();

    const groqKey = Deno.env.get("GROQ_API_KEY");
    const tavilyKey = Deno.env.get("TAVILY_API_KEY");

    if (!groqKey) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not set" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── RESEARCH action ──────────────────────────────────────────────────────
    if (action === "research") {
      if (!tavilyKey) {
        return new Response(JSON.stringify({ error: "TAVILY_API_KEY not set" }), {
          status: 500, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
      const query = message || title || content.slice(0, 120);
      if (!query.trim()) {
        return new Response(JSON.stringify({ error: "Provide a search query, article title, or body text to research." }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }

      const searchData = await tavilySearch(query, tavilyKey);
      const sources = (searchData.results || [])
        .map((r: { title: string; url: string; content: string }, i: number) =>
          `[${i + 1}] ${r.title}\n${r.url}\n${r.content?.slice(0, 400)}`
        )
        .join("\n\n");

      const synthesis = await callGroq([
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `I'm writing a news article about: "${query}"\n\nHere are web search results:\n\n${sources}\n\nSummarize the key facts, context, and relevant details a journalist should know. Cite the sources by number. Keep it concise and factual.`,
        },
      ], groqKey);

      const sourceList = (searchData.results || [])
        .map((r: { title: string; url: string }, i: number) => `[${i + 1}] ${r.title} — ${r.url}`)
        .join("\n");

      return new Response(JSON.stringify({ text: synthesis + "\n\n── Sources ──\n" + sourceList }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── All other actions ────────────────────────────────────────────────────
    let userMsg: string;
    if (action === "chat") {
      userMsg = message || "Hello";
    } else {
      const fn = PROMPTS[action];
      if (!fn) {
        return new Response(JSON.stringify({ error: "Unknown action: " + action }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
      userMsg = fn(content, title);
    }

    const text = await callGroq([
      { role: "system", content: SYSTEM },
      { role: "user", content: userMsg },
    ], groqKey);

    return new Response(JSON.stringify({ text }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
