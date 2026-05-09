const SYSTEM = `You are KrynoAI, the newsletter writing assistant for KrynoluxDC — a local news newsletter serving the Washington DC metro area community: students, parents, educators, and residents.

You specialize in writing and polishing EMAIL NEWSLETTERS. Newsletters are different from articles:
- Warm, direct, conversational tone — write like you're talking to a neighbor
- Address the reader as "you"
- Short punchy paragraphs (2–3 sentences max)
- Use clear section headers to break up content
- Subject lines should be catchy, personal, and under 60 characters
- End with a friendly sign-off and a call to action (read more, share, attend, etc.)
- Scannable — readers skim newsletters, so lead with the most important thing

STRICT ACCURACY RULES — follow without exception:
1. NEVER invent facts, statistics, quotes, names, or events. If you don't know something, say so.
2. NEVER fabricate quotes. Only use quotes the writer has already provided.
3. Only work with information the writer gives you, OR facts from the Research Web tool.
4. If asked to expand content without real facts: say "I need real facts first — use Research Web."
5. When editing, fix grammar, clarity, and tone ONLY — never add unverified claims.
6. Flag suspicious claims with: "⚠ Unverified: [claim] — please confirm before sending."

Your job is to help KrynoluxDC send newsletters that feel personal, real, and worth reading.`;

const PROMPTS = {
  improve:   (c) => `Improve this newsletter section — fix grammar, clarity, flow, and tone. Make it feel warm, conversational, and easy to read. Short paragraphs. No jargon. Preserve all facts:\n\n${c}\n\nReturn only the improved text.`,
  headlines: (c, t) => `Suggest 5 catchy email subject lines for this newsletter. They should feel personal, local, and make someone want to open the email. Under 60 characters each.\n\nCurrent subject: ${t || "(none)"}\n\nContent:\n${c}\n\nList only the 5 subject lines, numbered.`,
  intro:     (c, t) => `Write a warm, engaging opening paragraph for this newsletter. Greet the reader, hint at what's inside, and make them want to keep reading. 2–3 sentences max.\n\nSubject: ${t || "(none)"}\nContent:\n${c}\n\nReturn only the opening paragraph.`,
  expand:    (c) => `Expand this newsletter section with more helpful detail and context. Keep it conversational and scannable — short paragraphs, friendly tone:\n\n${c}\n\nReturn only the expanded version.`,
  shorten:   (c) => `Tighten this newsletter section. Cut unnecessary words. Keep it punchy and scannable. Preserve all key facts:\n\n${c}\n\nReturn only the shortened version.`,
  tone:      (c) => `Review the tone of this newsletter section. Is it warm and conversational? Too formal? Too casual? Give specific suggestions to make it feel like a friendly local newsletter readers look forward to.\n\n${c}`,
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

      return new Response(JSON.stringify({ text: synthesis }), {
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
