import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  bg: "#f4f3ef", card: "#ffffff", border: "#e0ddd6",
  text: "#111111", sub: "#333333", muted: "#888888",
  sidebar: "#111318", sideHover: "#1c1f26", sideActive: "#23272f",
  sideText: "#f0f0f0", sideMuted: "#555b66", sideBorder: "#1e2128",
  input: "#ffffff", inputBorder: "#d0cdc6", inputText: "#111111",
  accent: "#7B2FFF", red: "#c0392b", green: "#1e7e34",
  gold: "#b7950b", blue: "#1a6faf", orange: "#d35400",
  teal: "#148a7a", divider: "#e8e5df",
};

const CATS = ["Local News", "Schools", "Sports", "Events", "Student Spotlight", "Opinion", "Weather"];
const CAT_COLOR = {
  "Local News": "#c0392b", "Schools": "#1a6faf", "Sports": "#1e7e34",
  "Events": "#7d3c98", "Weather": "#d35400", "Opinion": "#2c3e50", "Student Spotlight": "#b7950b",
};
const BADGES = ["New Writer", "Contributor", "Rising Star", "Staff Writer", "Senior Writer", "Editor", "Top Contributor", "Investigative Reporter"];
const TABS = [
  { id: "dashboard",   label: "Dashboard",   icon: "◈" },
  { id: "submissions", label: "Submissions",  icon: "✦" },
  { id: "publish",     label: "Publish",      icon: "✎" },
  { id: "media",       label: "Media",        icon: "⊞" },
  { id: "writers",     label: "Writers",      icon: "◉" },
  { id: "schools",     label: "Schools",      icon: "⬡" },
  { id: "polls",       label: "Polls",        icon: "◑" },
  { id: "analytics",   label: "Analytics",    icon: "▲" },
  { id: "settings",    label: "Settings",     icon: "⚙" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(str) {
  if (!str) return "";
  const diff = Date.now() - new Date(str).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function sendEmail(payload) {
  try {
    const { error } = await supabase.functions.invoke("notify-writer", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    return !error;
  } catch {
    return false;
  }
}

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, sans-serif; background: ${T.bg}; }

  @keyframes tabEnter {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(120%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(120%); }
  }
  @keyframes loginShake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-5px); }
    80%       { transform: translateX(5px); }
  }
  @keyframes expandDown {
    from { opacity: 0; transform: scaleY(0.92); }
    to   { opacity: 1; transform: scaleY(1); }
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .tab-enter  { animation: tabEnter 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .expand-down { animation: expandDown 0.22s ease both; transform-origin: top; }

  button {
    transition: transform 0.1s ease, opacity 0.1s ease, background 0.18s ease;
  }
  button:active:not(:disabled) {
    transform: scale(0.95) !important;
    opacity: 0.8;
  }
  button:disabled { cursor: not-allowed !important; opacity: 0.5 !important; }

  input, textarea, select {
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${T.accent} !important;
    box-shadow: 0 0 0 3px ${T.accent}22;
  }

  .sidebar-btn {
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .sidebar-btn:hover { background: ${T.sideHover} !important; color: ${T.sideText} !important; }

  .row-hover { transition: background 0.15s; }
  .row-hover:hover { background: ${T.bg} !important; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
`;

// ── BASE UI ───────────────────────────────────────────────────────────────────
function Logo({ size = 36, circle = false }) {
  const [err, setErr] = useState(false);
  const r = circle ? "50%" : 5;
  if (err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: r, flexShrink: 0,
        background: `linear-gradient(135deg, ${T.accent}, #3b82f6)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: size * 0.48, color: "#fff", fontFamily: "Georgia,serif",
      }}>K</div>
    );
  }
  return (
    <img
      src={circle ? "/logo-circle.png" : "/logo-square.jpg"}
      alt="KrynoluxDC"
      onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: r, objectFit: "cover", flexShrink: 0, display: "block" }}
    />
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, fullWidth = false, style: extra = {} }) {
  const base = {
    border: "none", cursor: "pointer", fontFamily: "Inter,sans-serif",
    fontWeight: 700, display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 6, borderRadius: 3, flexShrink: 0,
    width: fullWidth ? "100%" : undefined,
  };
  const sizes = { sm: { padding: "5px 12px", fontSize: 11 }, md: { padding: "8px 16px", fontSize: 13 }, lg: { padding: "11px 22px", fontSize: 14 } };
  const variants = {
    primary: { background: T.text, color: "#fff" },
    accent:  { background: T.accent, color: "#fff" },
    green:   { background: T.green, color: "#fff" },
    red:     { background: T.red, color: "#fff" },
    gold:    { background: T.gold, color: "#fff" },
    ghost:   { background: "transparent", border: `1px solid ${T.border}`, color: T.sub },
    danger:  { background: "transparent", border: `1px solid ${T.red}`, color: T.red },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}>
      {children}
    </button>
  );
}

const INP = {
  width: "100%", padding: "9px 12px", background: T.input,
  border: `1px solid ${T.inputBorder}`, borderRadius: 3,
  color: T.inputText, fontSize: 13, outline: "none",
  boxSizing: "border-box", fontFamily: "Inter,sans-serif", display: "block",
};

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 800,
        color: T.muted, display: "block", marginBottom: 5,
        letterSpacing: 0.8, textTransform: "uppercase",
      }}>{label}{required && <span style={{ color: T.red }}> *</span>}</label>
      {children}
      {hint && <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: value ? T.accent : "#cccccc",
        cursor: "pointer", position: "relative",
        transition: "background 0.25s",
        boxShadow: value ? `0 0 0 3px ${T.accent}33` : "none",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: value ? 23 : 3,
        transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved:  { bg: T.green,  label: "Approved" },
    rejected:  { bg: T.red,    label: "Rejected" },
    pending:   { bg: T.gold,   label: "Pending" },
    scheduled: { bg: T.blue,   label: "Scheduled" },
  };
  const s = map[status] || { bg: T.muted, label: status };
  return (
    <span style={{
      background: s.bg + "18", color: s.bg,
      border: `1px solid ${s.bg}44`,
      fontSize: 10, fontWeight: 800, padding: "2px 8px",
      borderRadius: 2, letterSpacing: 0.8, textTransform: "uppercase",
      fontFamily: "Inter,sans-serif", whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

function CatChip({ cat }) {
  return (
    <span style={{
      fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 800,
      letterSpacing: 1, textTransform: "uppercase",
      color: CAT_COLOR[cat] || T.muted,
    }}>{cat}</span>
  );
}

function StatCard({ label, value, color, sub, subColor }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderTop: `3px solid ${color || T.accent}`,
      padding: "16px 18px", flex: 1, minWidth: 120,
    }}>
      <div style={{ fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700, color: color || T.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: subColor || T.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function SectionHead({ section, title, sub, actions }) {
  return (
    <div style={{
      marginBottom: 28, paddingBottom: 16,
      borderBottom: `2px solid ${T.border}`,
      display: "flex", alignItems: "flex-end",
      justifyContent: "space-between", flexWrap: "wrap", gap: 12,
    }}>
      <div>
        <div style={{ fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 800, color: T.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>{section || "KrynoluxDC CMS"}</div>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: T.text, margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: T.muted, margin: "5px 0 0" }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

function Empty({ icon = "📭", title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 18, color: T.text, marginBottom: 6 }}>{title}</div>
      <div style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: T.muted }}>{sub}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.divider, margin: "4px 0" }} />;
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setLeaving(true), 3400);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: toast.color || T.green, color: "#fff",
      padding: "12px 18px 12px 14px", borderRadius: 4,
      fontWeight: 700, fontSize: 13, fontFamily: "Inter,sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", gap: 10,
      maxWidth: 360, borderLeft: "4px solid rgba(255,255,255,0.3)",
      animation: leaving ? "toastOut 0.3s ease forwards" : "toastIn 0.3s ease both",
    }}>
      <span style={{ flex: 1 }}>{toast.msg}</span>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tries, setTries] = useState(0);
  const [shake, setShake] = useState(false);
  const locked = tries >= 3;

  function submit() {
    if (locked) return;
    setLoading(true);
    setTimeout(() => {
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        onLogin();
      } else {
        const n = tries + 1;
        setTries(n);
        setErr(n >= 3 ? "Account locked. Refresh to try again." : `Incorrect credentials. ${3 - n} attempt(s) remaining.`);
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
      setLoading(false);
    }, 700);
  }

  return (
    <div style={{ minHeight: "100vh", background: T.sidebar, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{
        background: T.card, width: "100%", maxWidth: 380,
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        animation: shake ? "loginShake 0.5s ease" : "none",
      }}>
        {/* Header */}
        <div style={{ background: "#0f0f0f", padding: "32px 32px 28px", textAlign: "center", borderBottom: `3px solid ${T.accent}` }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Logo size={56} circle />
          </div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>KrynoluxDC</div>
          <div style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Editorial Management System</div>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px 32px" }}>
          <Field label="Username" required>
            <input
              value={u}
              onChange={e => { setU(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Enter username"
              autoComplete="off"
              style={{ ...INP, borderColor: err ? T.red : T.inputBorder }}
            />
          </Field>
          <Field label="Password" required>
            <div style={{ position: "relative" }}>
              <input
                value={p}
                onChange={e => { setP(e.target.value); setErr(""); }}
                onKeyDown={e => e.key === "Enter" && submit()}
                type={show ? "text" : "password"}
                placeholder="Enter password"
                autoComplete="off"
                style={{ ...INP, paddingRight: 44, borderColor: err ? T.red : T.inputBorder }}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2, color: T.muted }}
              >{show ? "🙈" : "👁️"}</button>
            </div>
          </Field>

          {err && (
            <div style={{ background: "#fdf0f0", border: `1px solid ${T.red}33`, borderLeft: `3px solid ${T.red}`, padding: "9px 12px", marginBottom: 14, borderRadius: 2 }}>
              <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.red, fontWeight: 600 }}>⚠ {err}</span>
            </div>
          )}

          <Btn onClick={submit} disabled={loading || locked} fullWidth size="lg" style={{ marginTop: 4 }}>
            {loading ? "Signing in…" : locked ? "Account Locked" : "Sign In →"}
          </Btn>

          <div style={{ textAlign: "center", marginTop: 16, fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted }}>
            KrynoluxDC · Authorized Personnel Only
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD TAB ─────────────────────────────────────────────────────────────
function Dashboard({ articles, writers, settings, setSetting, saveSettings, setTab, setOpenId, dataLoading, pollOpts }) {
  const pending    = articles.filter(a => a.status === "pending").length;
  const approved   = articles.filter(a => a.status === "approved").length;
  const rejected   = articles.filter(a => a.status === "rejected").length;
  const scheduled  = articles.filter(a => a.status === "scheduled").length;
  const flagged    = articles.filter(a => a.flagged).length;
  const featured   = articles.filter(a => a.featured).length;
  const activeW    = writers.filter(w => w.status === "active").length;
  const totalViews = articles.reduce((s, a) => s + (a.views || 0), 0);
  const approvalRate = articles.length > 0 ? Math.round((approved / articles.length) * 100) : 0;
  const catCounts  = Object.fromEntries(CATS.map(c => [c, articles.filter(a => a.category === c && a.status === "approved").length]));
  const topCat     = CATS.reduce((a, b) => (catCounts[a] || 0) >= (catCounts[b] || 0) ? a : b, CATS[0]);

  const publishedThisWeek = articles.filter(a => a.status === "approved" && new Date(a.created_at) > new Date(Date.now() - 604800000)).length > 0;

  return (
    <div className="tab-enter">
      <SectionHead
        section="Overview" title="Dashboard"
        sub={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        actions={[
          <Btn key="p" onClick={() => setTab("publish")} variant="accent" size="sm">+ New Article</Btn>,
        ]}
      />

      {settings.maintenanceMode && (
        <div style={{ background: "#fdf0f0", border: `1px solid ${T.red}33`, borderLeft: `4px solid ${T.red}`, padding: "12px 18px", marginBottom: 20, borderRadius: 3, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "Inter,sans-serif", color: T.red, fontWeight: 700, fontSize: 13 }}>⚠ Maintenance Mode is ON — Website is hidden from all visitors.</span>
          <Btn variant="green" size="sm" onClick={() => { setSetting("maintenanceMode", false); saveSettings(); }}>Turn Off</Btn>
        </div>
      )}

      {/* Stat rows */}
      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 2 }}>
        <StatCard label="Pending"   value={pending}   color={T.gold}  sub={pending > 0 ? "Needs review" : "All clear"} subColor={pending > 0 ? T.gold : T.green} />
        <StatCard label="Published" value={approved}  color={T.green} />
        <StatCard label="Scheduled" value={scheduled} color={T.blue} />
        <StatCard label="Rejected"  value={rejected}  color={T.red} />
        <StatCard label="Flagged"   value={flagged}   color={T.orange} sub={flagged > 0 ? "Needs review" : "None"} subColor={flagged > 0 ? T.orange : T.green} />
        <StatCard label="Featured"  value={featured}  color={T.teal} />
      </div>
      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Total Views"    value={totalViews.toLocaleString()} color={T.accent} />
        <StatCard label="Active Writers" value={activeW}   color={T.text} sub={`${writers.length} total`} />
        <StatCard label="Approval Rate"  value={`${approvalRate}%`} color={approvalRate > 60 ? T.green : T.red} />
        <StatCard label="Top Category"   value={topCat}  color={CAT_COLOR[topCat] || T.text} sub={`${catCounts[topCat]} articles`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Recent submissions */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text }}>Recent Submissions</span>
              <Btn variant="ghost" size="sm" onClick={() => setTab("submissions")}>View all →</Btn>
            </div>
            {dataLoading ? (
              <div style={{ color: T.muted, fontSize: 13, padding: "20px 0" }}>Loading…</div>
            ) : articles.length === 0 ? (
              <Empty icon="📭" title="No submissions yet." sub="Articles from the website appear here." />
            ) : articles.slice(0, 7).map(a => (
              <div
                key={a.id}
                onClick={() => { setTab("submissions"); setOpenId(a.id); }}
                className="row-hover"
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.divider}`, cursor: "pointer" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{a.headline || "Untitled"}</div>
                  <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted }}>{a.name || "Unknown"} · {timeAgo(a.created_at)}</div>
                </div>
                <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
                  {a.featured && <span title="Featured">⭐</span>}
                  {a.flagged  && <span title="Flagged">🚩</span>}
                  <StatusBadge status={a.status || "pending"} />
                </div>
              </div>
            ))}
          </div>

          {/* Site health */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20 }}>
            <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>Site Health</div>
            {[
              ["Website Live",         !settings.maintenanceMode,             "Turn off maintenance mode"],
              ["Ticker Message Set",   !!(settings.tickerMsg?.trim()),        "Add a message in Settings"],
              ["Active Writers",       activeW > 0,                           "Add writers in Writers tab"],
              ["Articles Published",   approved > 0,                          "Publish your first article"],
              ["Featured Article",     featured > 0,                          "Feature an article"],
              ["No Flagged Content",   flagged === 0,                          "Review flagged content"],
              ["Poll Configured",      pollOpts.length > 1,                   "Set up poll in Polls tab"],
            ].map(([label, ok, fix]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.divider}` }}>
                <span style={{ fontSize: 12 }}>{ok ? "🟢" : "🔴"}</span>
                <div>
                  <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, fontWeight: 600, color: ok ? T.text : T.muted }}>{label}</div>
                  {!ok && <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted }}>{fix}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Editorial checklist */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20 }}>
            <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>Editorial Checklist</div>
            {[
              ["Review pending submissions", pending === 0],
              ["Clear flagged content",      flagged === 0],
              ["Feature an article",         featured > 0],
              ["Writers on board",           activeW > 0],
              ["Published this week",        publishedThisWeek],
              ["Ticker message set",         !!(settings.tickerMsg?.trim())],
              ["Site live",                  !settings.maintenanceMode],
            ].map(([label, done]) => (
              <div key={label} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.divider}` }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>{done ? "✅" : "⬜"}</span>
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: done ? T.muted : T.text, textDecoration: done ? "line-through" : "none" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20 }}>
            <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>Quick Actions</div>
            {[["Write Article", "publish"], ["Review Submissions", "submissions"], ["Add Writer", "writers"], ["Edit Poll", "polls"], ["Analytics", "analytics"], ["Settings", "settings"]].map(([label, target]) => (
              <button
                key={label}
                onClick={() => setTab(target)}
                style={{ display: "block", width: "100%", padding: "9px 12px", background: T.bg, border: `1px solid ${T.border}`, color: T.text, cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 6, textAlign: "left", fontFamily: "Inter,sans-serif", borderRadius: 2 }}
              >{label} →</button>
            ))}
          </div>

          {/* By category */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20 }}>
            <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>By Category</div>
            {CATS.map(cat => {
              const cnt = catCounts[cat] || 0;
              const pct = approved > 0 ? Math.round((cnt / approved) * 100) : 0;
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter,sans-serif", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: CAT_COLOR[cat] || T.muted, fontWeight: 700 }}>{cat}</span>
                    <span style={{ color: T.muted }}>{cnt}</span>
                  </div>
                  <div style={{ background: T.divider, height: 4, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: CAT_COLOR[cat] || T.accent, borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SUBMISSIONS TAB ───────────────────────────────────────────────────────────
function Submissions({ articles, openId, setOpenId, editArt, setEditArt, dataLoading, loadArticles, rejectReason, setRejectReason, emailStatus, onSetStatus, onToggleFlag, onToggleFeature, onDelete, onSaveEdit, subscriberCount }) {
  const [search, setSearch]     = useState("");
  const [fStatus, setFStatus]   = useState("all");
  const [fCat, setFCat]         = useState("all");
  const [sendToNL, setSendToNL] = useState(false);

  const filtered = articles.filter(a => {
    const ms = (a.headline || "").toLowerCase().includes(search.toLowerCase()) || (a.name || "").toLowerCase().includes(search.toLowerCase());
    const mf = fStatus === "all" || a.status === fStatus;
    const mc = fCat === "all" || a.category === fCat;
    return ms && mf && mc;
  });

  return (
    <div className="tab-enter">
      <SectionHead
        section="Editorial" title="Submissions"
        sub={`${filtered.length} article${filtered.length !== 1 ? "s" : ""}`}
        actions={[<Btn key="r" variant="ghost" size="sm" onClick={loadArticles}>↻ Refresh</Btn>]}
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search headline or author…"
          style={{ ...INP, flex: 1, minWidth: 200 }}
        />
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ ...INP, width: "auto" }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <select value={fCat} onChange={e => setFCat(e.target.value)} style={{ ...INP, width: "auto" }}>
          <option value="all">All Categories</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Inline editor */}
      {editArt && (
        <div className="expand-down" style={{ background: "#f0eaff", border: `1px solid ${T.accent}40`, borderLeft: `4px solid ${T.accent}`, padding: 22, marginBottom: 16, borderRadius: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text }}>Editing Article</span>
            <Btn variant="ghost" size="sm" onClick={() => setEditArt(null)}>Cancel</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Headline">
              <input value={editArt.headline || ""} onChange={e => setEditArt(a => ({ ...a, headline: e.target.value }))} style={INP} />
            </Field>
            <Field label="Category">
              <select value={editArt.category || ""} onChange={e => setEditArt(a => ({ ...a, category: e.target.value }))} style={INP}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Author">
              <input value={editArt.name || ""} onChange={e => setEditArt(a => ({ ...a, name: e.target.value }))} style={INP} />
            </Field>
            <Field label="School">
              <input value={editArt.school || ""} onChange={e => setEditArt(a => ({ ...a, school: e.target.value }))} style={INP} />
            </Field>
          </div>
          <Field label="Body">
            <textarea value={editArt.body || ""} onChange={e => setEditArt(a => ({ ...a, body: e.target.value }))} rows={5} style={{ ...INP, resize: "vertical", fontFamily: "Georgia,serif", lineHeight: 1.8 }} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={onSaveEdit}>Save Changes</Btn>
            <Btn variant="ghost" onClick={() => setEditArt(null)}>Cancel</Btn>
          </div>
        </div>
      )}

      {dataLoading ? (
        <div style={{ color: T.muted, fontSize: 13, padding: 30 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: T.card, border: `1px solid ${T.border}` }}>
          <Empty icon="📭" title="No articles found." sub="Try adjusting your filters." />
        </div>
      ) : filtered.map(a => {
        const open = openId === a.id;
        const leftColor = a.flagged ? T.red : a.featured ? T.gold : a.status === "approved" ? T.green : a.status === "rejected" ? T.red : a.status === "scheduled" ? T.blue : T.border;
        return (
          <div key={a.id} style={{ background: T.card, marginBottom: 2, border: `1px solid ${T.border}`, borderLeft: `4px solid ${leftColor}`, borderRadius: 3 }}>
            {/* Row header */}
            <div
              onClick={() => setOpenId(open ? null : a.id)}
              className="row-hover"
              style={{ padding: "13px 18px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 7, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <CatChip cat={a.category || "News"} />
                  <StatusBadge status={a.status || "pending"} />
                  {a.featured && <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: T.gold, fontWeight: 700 }}>⭐ Featured</span>}
                  {a.flagged  && <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: T.red,  fontWeight: 700 }}>🚩 Flagged</span>}
                  {a.image_url && <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: T.blue, fontWeight: 700 }}>📷</span>}
                  {a.email    && <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: T.green, fontWeight: 700 }}>📧</span>}
                </div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3 }}>{a.headline || "Untitled"}</div>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted }}>
                  By {a.name || "Unknown"}{a.school ? ` · ${a.school}` : ""} · {fmtDate(a.created_at)} · {timeAgo(a.created_at)}
                </div>
              </div>
              <span style={{ color: T.muted, fontSize: 11, flexShrink: 0, marginTop: 2 }}>{open ? "▲" : "▼"}</span>
            </div>

            {/* Expanded panel */}
            {open && (
              <div className="expand-down" style={{ padding: "0 18px 20px", borderTop: `1px solid ${T.border}` }}>
                {a.image_url && (
                  <img src={a.image_url} alt="cover" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block", marginTop: 16, marginBottom: 14, borderRadius: 2 }} />
                )}
                <div style={{ fontFamily: "Georgia,serif", fontSize: 15, color: T.sub, lineHeight: 1.8, whiteSpace: "pre-wrap", marginTop: a.image_url ? 0 : 16, marginBottom: 16, maxHeight: 220, overflowY: "auto", padding: 14, background: T.bg, borderLeft: `3px solid ${T.border}`, borderRadius: 2 }}>
                  {a.body || "No body provided."}
                </div>

                {a.email ? (
                  <div style={{ background: "#f0faf4", border: `1px solid ${T.green}33`, borderLeft: `3px solid ${T.green}`, padding: "10px 14px", marginBottom: 14, borderRadius: 2 }}>
                    <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.green, fontWeight: 700 }}>📧 {a.email} — writer will be emailed on approval/rejection.</div>
                  </div>
                ) : (
                  <div style={{ background: "#fdf8f0", border: `1px solid ${T.gold}33`, borderLeft: `3px solid ${T.gold}`, padding: "10px 14px", marginBottom: 14, borderRadius: 2 }}>
                    <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.gold, fontWeight: 700 }}>⚠ No email on file — writer won't receive a notification.</div>
                  </div>
                )}

                <Field label="Rejection Reason (optional · sent to writer)">
                  <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Needs more sources, please revise…" style={INP} />
                </Field>

                {emailStatus && (
                  <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.blue, marginBottom: 12, fontWeight: 600 }}>⏳ {emailStatus}</div>
                )}

                {/* Newsletter option */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", marginBottom: 8, borderTop: `1px solid ${T.divider}` }}>
                  <input type="checkbox" id={`nl-${a.id}`} checked={sendToNL} onChange={e => setSendToNL(e.target.checked)} style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.accent }} />
                  <label htmlFor={`nl-${a.id}`} style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.sub, cursor: "pointer" }}>
                    Also send to newsletter subscribers
                    {subscriberCount > 0 && <span style={{ color: T.muted, marginLeft: 5 }}>({subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""})</span>}
                    {subscriberCount === 0 && <span style={{ color: T.muted, marginLeft: 5 }}>(no subscribers yet)</span>}
                  </label>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn variant="green" size="sm" onClick={() => { onSetStatus(a.id, "approved", sendToNL); setSendToNL(false); }}>✅ Approve{a.email ? " + Email" : ""}{sendToNL ? " + Newsletter" : ""}</Btn>
                  <Btn variant="red"   size="sm" onClick={() => onSetStatus(a.id, "rejected")}>❌ Reject{a.email ? " + Email" : ""}</Btn>
                  <Btn variant="gold"  size="sm" onClick={() => onSetStatus(a.id, "pending")}>↩ Pending</Btn>
                  <Btn variant="accent" size="sm" onClick={() => setEditArt(a)}>✏️ Edit</Btn>
                  <Btn variant="ghost" size="sm" style={{ borderColor: T.gold, color: T.gold }} onClick={() => onToggleFeature(a.id, a.featured)}>{a.featured ? "Unpin" : "⭐ Pin"}</Btn>
                  <Btn variant="ghost" size="sm" style={{ borderColor: T.orange, color: T.orange }} onClick={() => onToggleFlag(a.id, a.flagged)}>{a.flagged ? "Unflag" : "🚩 Flag"}</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => onDelete(a.id)}>🗑️ Delete</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── PUBLISH TAB ───────────────────────────────────────────────────────────────
function Publish({ onPublish, imgUploading, subscriberCount }) {
  const [title,        setTitle]        = useState("");
  const [author,       setAuthor]       = useState("");
  const [school,       setSchool]       = useState("");
  const [cat,          setCat]          = useState("Local News");
  const [body,         setBody]         = useState("");
  const [date,         setDate]         = useState("");
  const [imgFile,      setImgFile]      = useState(null);
  const [imgPreview,   setImgPreview]   = useState("");
  const [imgUrl,       setImgUrl]       = useState("");
  const [featured,     setFeatured]     = useState(false);
  const [sendNewsletter, setSendNewsletter] = useState(false);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  function onImgSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    const r = new FileReader();
    r.onload = ev => setImgPreview(ev.target.result);
    r.readAsDataURL(file);
  }

  function clear() {
    setTitle(""); setAuthor(""); setSchool(""); setBody(""); setDate(""); setCat("Local News");
    setImgFile(null); setImgPreview(""); setImgUrl(""); setFeatured(false); setSendNewsletter(false);
  }

  return (
    <div className="tab-enter">
      <SectionHead section="Editorial" title="Publish Article" sub="Write and publish directly to KrynoluxDC." />
      <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 28, maxWidth: 740, borderRadius: 3 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Headline" required>
            <input value={title} onChange={e => setTitle(e.target.value)} style={INP} placeholder="Article headline" />
          </Field>
          <Field label="Category">
            <select value={cat} onChange={e => setCat(e.target.value)} style={INP}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Author Name" required>
            <input value={author} onChange={e => setAuthor(e.target.value)} style={INP} placeholder="Author name" />
          </Field>
          <Field label="School / Organization">
            <input value={school} onChange={e => setSchool(e.target.value)} style={INP} placeholder="School" />
          </Field>
        </div>

        <Field label="Article Body" hint={`${wordCount} words`}>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} placeholder="Write the full article here…" style={{ ...INP, resize: "vertical", fontFamily: "Georgia,serif", lineHeight: 1.9, fontSize: 15 }} />
        </Field>

        <Field label="Cover Image">
          <div
            onClick={() => document.getElementById("cms-imgup").click()}
            style={{ border: `2px dashed ${T.border}`, padding: 20, textAlign: "center", cursor: "pointer", marginBottom: 8, borderRadius: 3, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
          >
            {imgPreview
              ? <img src={imgPreview} alt="Preview" style={{ maxHeight: 180, objectFit: "cover", maxWidth: "100%", borderRadius: 2 }} />
              : <div><div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div><div style={{ color: T.muted, fontSize: 13 }}>Click to upload a cover image</div><div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>JPG · PNG · WEBP</div></div>
            }
            <input id="cms-imgup" type="file" accept="image/*" style={{ display: "none" }} onChange={onImgSelect} />
          </div>
          {imgPreview && <Btn variant="danger" size="sm" onClick={() => { setImgFile(null); setImgPreview(""); setImgUrl(""); }}>Remove Image</Btn>}
        </Field>

        <Field label="Or paste image URL">
          <input value={imgUrl} onChange={e => { setImgUrl(e.target.value); if (e.target.value) setImgPreview(e.target.value); }} style={INP} placeholder="https://…" />
        </Field>

        <Field label="Schedule (leave blank to publish now)">
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} style={INP} />
        </Field>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontFamily: "Inter,sans-serif", fontWeight: 700, fontSize: 13, color: T.text }}>Pin to Homepage</div>
            <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted, marginTop: 2 }}>Feature this article prominently</div>
          </div>
          <Toggle value={featured} onChange={() => setFeatured(f => !f)} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: `1px solid ${T.border}`, marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "Inter,sans-serif", fontWeight: 700, fontSize: 13, color: T.text }}>Send to Newsletter</div>
            <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted, marginTop: 2 }}>
              Email all {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""} when published
              {date ? " (won't send for scheduled articles)" : ""}
            </div>
          </div>
          <Toggle value={sendNewsletter} onChange={() => setSendNewsletter(f => !f)} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn
            fullWidth size="lg"
            disabled={imgUploading}
            onClick={() => onPublish({ title, author, school, cat, body, date, imgFile, imgUrl, featured, sendNewsletter }, clear)}
          >
            {imgUploading ? "Uploading…" : date ? "Schedule Article" : sendNewsletter ? `Publish + Notify ${subscriberCount} subscribers` : "Publish Now"}
          </Btn>
          <Btn variant="ghost" onClick={clear}>Clear</Btn>
        </div>
      </div>
    </div>
  );
}

// ── MEDIA TAB ─────────────────────────────────────────────────────────────────
function Media({ articles }) {
  const imgs = articles.filter(a => a.image_url);
  return (
    <div className="tab-enter">
      <SectionHead section="Assets" title="Media Library" sub={`${imgs.length} image${imgs.length !== 1 ? "s" : ""}`} />
      {imgs.length === 0 ? (
        <div style={{ background: T.card, border: `1px solid ${T.border}` }}>
          <Empty icon="🖼️" title="No images yet." sub="Images uploaded with articles appear here." />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {imgs.map(a => (
            <div key={a.id} style={{ background: T.card, border: `1px solid ${T.border}`, overflow: "hidden", borderRadius: 3, transition: "box-shadow 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <img src={a.image_url} alt={a.headline} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 12, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.headline || "Untitled"}</div>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: T.muted, marginTop: 3 }}>{fmtDate(a.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── WRITERS TAB ───────────────────────────────────────────────────────────────
function Writers({ writers, wAdding, onAdd, onUpdateBadge, onToggle, onDelete }) {
  const [name,   setName]   = useState("");
  const [school, setSchool] = useState("");
  const [email,  setEmail]  = useState("");
  const [badge,  setBadge]  = useState("New Writer");
  const activeCount = writers.filter(w => w.status === "active").length;

  return (
    <div className="tab-enter">
      <SectionHead section="Team" title="Writers" sub={`${writers.length} journalist${writers.length !== 1 ? "s" : ""} · ${activeCount} active`} />

      {/* Add form */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 24, maxWidth: 580, marginBottom: 24, borderRadius: 3 }}>
        <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 17, color: T.text, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>Add New Writer</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Full Name" required>
            <input value={name} onChange={e => setName(e.target.value)} style={INP} placeholder="Full name" />
          </Field>
          <Field label="School">
            <input value={school} onChange={e => setSchool(e.target.value)} style={INP} placeholder="School" />
          </Field>
        </div>
        <Field label="Email Address" required>
          <input value={email} onChange={e => setEmail(e.target.value)} style={INP} placeholder="writer@email.com" type="email" />
        </Field>
        <Field label="Starting Badge">
          <select value={badge} onChange={e => setBadge(e.target.value)} style={INP}>
            {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Btn
          fullWidth size="lg" disabled={wAdding}
          onClick={() => onAdd({ name, school, email, badge }, () => { setName(""); setSchool(""); setEmail(""); setBadge("New Writer"); })}
        >
          {wAdding ? "Adding…" : "Add Writer"}
        </Btn>
      </div>

      {/* Writer list */}
      {writers.length === 0 ? (
        <div style={{ background: T.card, border: `1px solid ${T.border}` }}>
          <Empty icon="👤" title="No writers yet." sub="Use the form above to add your first student journalist." />
        </div>
      ) : writers.map(w => (
        <div
          key={w.id}
          style={{ background: T.card, marginBottom: 2, border: `1px solid ${T.border}`, borderLeft: `4px solid ${w.status === "suspended" ? T.red : T.green}`, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, borderRadius: 3 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: T.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {(w.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 15, color: T.text }}>{w.name}</div>
              <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.muted }}>{w.school || "—"} · {w.email || "—"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: T.accent, fontWeight: 700 }}>{w.badge || "Writer"}</span>
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: w.status === "active" ? T.green : T.red, fontWeight: 700 }}>{(w.status || "active").toUpperCase()}</span>
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: 10, color: T.muted }}>{w.articles || 0} articles</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select onChange={e => onUpdateBadge(w.id, e.target.value)} value={w.badge || "New Writer"} style={{ ...INP, width: "auto", fontSize: 11 }}>
              {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <Btn variant="ghost" size="sm" style={{ borderColor: w.status === "active" ? T.red : T.green, color: w.status === "active" ? T.red : T.green }} onClick={() => onToggle(w.id, w.status)}>
              {w.status === "active" ? "Suspend" : "Restore"}
            </Btn>
            <Btn variant="ghost" size="sm" onClick={() => onDelete(w.id)}>🗑️</Btn>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── POLLS TAB ─────────────────────────────────────────────────────────────────
function Polls({ pollQ, setPollQ, pollOpts, setPollOpts, onSave }) {
  return (
    <div className="tab-enter">
      <SectionHead section="Engagement" title="Poll Manager" sub="Control the community poll shown on the website." />
      <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 28, maxWidth: 560, borderRadius: 3 }}>
        <Field label="Poll Question">
          <input value={pollQ} onChange={e => setPollQ(e.target.value)} style={INP} placeholder="What should we cover more?" />
        </Field>
        <Field label={`Answer Options (${pollOpts.length}/6)`}>
          {pollOpts.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, color: T.muted, fontSize: 14, width: 20, flexShrink: 0, textAlign: "right" }}>{i + 1}.</span>
              <input
                value={opt}
                onChange={e => { const v = e.target.value; setPollOpts(o => { const n = [...o]; n[i] = v; return n; }); }}
                style={{ ...INP, flex: 1 }}
                placeholder={`Option ${i + 1}`}
              />
              {pollOpts.length > 2 && (
                <Btn variant="danger" size="sm" onClick={() => setPollOpts(o => o.filter((_, j) => j !== i))}>✕</Btn>
              )}
            </div>
          ))}
          {pollOpts.length < 6 && (
            <Btn variant="ghost" fullWidth size="sm" style={{ borderStyle: "dashed", marginTop: 4 }} onClick={() => setPollOpts(o => [...o, ""])}>+ Add Option</Btn>
          )}
        </Field>
        <Btn fullWidth size="lg" onClick={onSave} style={{ marginTop: 8 }}>Save Poll to Website</Btn>
      </div>
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function Analytics({ articles, writers, subscribers, onRefreshSubs }) {
  const approved     = articles.filter(a => a.status === "approved");
  const pending      = articles.filter(a => a.status === "pending").length;
  const rejected     = articles.filter(a => a.status === "rejected").length;
  const scheduled    = articles.filter(a => a.status === "scheduled").length;
  const flagged      = articles.filter(a => a.flagged).length;
  const featured     = articles.filter(a => a.featured).length;
  const activeW      = writers.filter(w => w.status === "active").length;
  const totalViews   = articles.reduce((s, a) => s + (a.views || 0), 0);
  const approvalRate = articles.length > 0 ? Math.round((approved.length / articles.length) * 100) : 0;
  const catCounts    = Object.fromEntries(CATS.map(c => [c, approved.filter(a => a.category === c).length]));

  return (
    <div className="tab-enter">
      <SectionHead section="Data" title="Analytics" sub="KrynoluxDC performance overview." />

      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total Views"    value={totalViews.toLocaleString()} color={T.accent} />
        <StatCard label="Published"      value={approved.length} color={T.green} />
        <StatCard label="Active Writers" value={activeW} color={T.text} />
        <StatCard label="Pending"        value={pending} color={T.gold} />
        <StatCard label="Approval Rate"  value={`${approvalRate}%`} color={approvalRate > 60 ? T.green : T.red} />
        <StatCard label="Subscribers"    value={(subscribers || []).length} color={T.teal} sub={`${(subscribers || []).filter(s => s.active).length} active`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top articles */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20, borderRadius: 3 }}>
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${T.border}` }}>Top Articles by Views</div>
          {approved.length === 0 ? (
            <Empty icon="📊" title="No published articles." sub="Publish your first article to see analytics." />
          ) : [...approved].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 7).map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${T.divider}` }}>
              <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 18, color: i < 3 ? T.gold : T.border, width: 26, flexShrink: 0 }}>#{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.headline || "Untitled"}</div>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted }}>{a.name} · {a.category}</div>
              </div>
              <div style={{ fontFamily: "Inter,sans-serif", fontWeight: 700, fontSize: 12, color: T.accent, flexShrink: 0 }}>{(a.views || 0).toLocaleString()} views</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* By category */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20, borderRadius: 3 }}>
            <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${T.border}` }}>By Category</div>
            {CATS.map(cat => {
              const cnt = catCounts[cat] || 0;
              const pct = approved.length > 0 ? Math.round((cnt / approved.length) * 100) : 0;
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter,sans-serif", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: CAT_COLOR[cat] || T.muted, fontWeight: 700 }}>{cat}</span>
                    <span style={{ color: T.muted }}>{cnt} ({pct}%)</span>
                  </div>
                  <div style={{ background: T.divider, height: 5, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: CAT_COLOR[cat] || T.accent, borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20, borderRadius: 3 }}>
            <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${T.border}` }}>Submission Summary</div>
            {[["Total", articles.length, T.text], ["Published", approved.length, T.green], ["Pending", pending, T.gold], ["Rejected", rejected, T.red], ["Scheduled", scheduled, T.blue], ["Flagged", flagged, T.orange], ["Featured", featured, T.teal]].map(([label, val, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.divider}` }}>
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: T.sub }}>{label}</span>
                <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter subscribers */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 20, borderRadius: 3, marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${T.border}` }}>
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.text }}>
            Newsletter Subscribers
            <span style={{ fontFamily: "Inter,sans-serif", fontWeight: 400, fontSize: 12, color: T.muted, marginLeft: 10 }}>{(subscribers || []).length} total · {(subscribers || []).filter(s => s.active).length} active</span>
          </div>
          <Btn variant="ghost" size="sm" onClick={onRefreshSubs}>↻ Refresh</Btn>
        </div>
        {(subscribers || []).length === 0 ? (
          <Empty icon="📧" title="No subscribers yet." sub="Subscribers from the website appear here." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter,sans-serif", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["Email", "Source", "Status", "Signed Up"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 12px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, color: T.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(subscribers || []).map(s => (
                  <tr key={s.id} className="row-hover" style={{ borderBottom: `1px solid ${T.divider}` }}>
                    <td style={{ padding: "10px 12px", color: T.text, fontWeight: 600 }}>{s.email}</td>
                    <td style={{ padding: "10px 12px", color: T.muted }}>{s.source || "website"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ background: s.active ? T.green + "20" : T.red + "20", color: s.active ? T.green : T.red, fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 10 }}>
                        {s.active ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: T.muted }}>{fmtDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SETTINGS TAB ──────────────────────────────────────────────────────────────
function Settings({ settings, setSetting, onSave, saving, saved }) {
  return (
    <div className="tab-enter">
      <SectionHead section="Configuration" title="Site Settings" sub="Control the website without touching any code." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 920 }}>

        {/* General */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 24, gridColumn: "span 2", borderRadius: 3 }}>
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 17, color: T.text, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>General</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Site Name"><input value={settings.siteName || ""} onChange={e => setSetting("siteName", e.target.value)} style={INP} /></Field>
            <Field label="Tagline"><input value={settings.tagline || ""} onChange={e => setSetting("tagline", e.target.value)} style={INP} /></Field>
            <Field label="Contact Email"><input value={settings.contactEmail || ""} onChange={e => setSetting("contactEmail", e.target.value)} style={INP} /></Field>
            <Field label="Coverage Area"><input value={settings.coverageArea || ""} onChange={e => setSetting("coverageArea", e.target.value)} style={INP} placeholder="Fairfax, Loudoun, DC" /></Field>
          </div>
        </div>

        {/* Announcements */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 24, borderRadius: 3 }}>
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 17, color: T.text, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>Announcements</div>
          <Field label="Breaking News Ticker (blank = hidden)">
            <input value={settings.tickerMsg || ""} onChange={e => setSetting("tickerMsg", e.target.value)} style={INP} placeholder="Breaking news…" />
          </Field>
          <Field label="Site-Wide Banner (blank = hidden)">
            <input value={settings.announcementBanner || ""} onChange={e => setSetting("announcementBanner", e.target.value)} style={INP} placeholder="Announcement…" />
          </Field>
          <Field label="Banner Color">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input type="color" value={settings.announcementColor || "#7B2FFF"} onChange={e => setSetting("announcementColor", e.target.value)} style={{ width: 44, height: 36, border: `1px solid ${T.inputBorder}`, cursor: "pointer", padding: 3, borderRadius: 3 }} />
              <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.muted, fontFamily: "monospace" }}>{settings.announcementColor}</span>
            </div>
          </Field>
        </div>

        {/* Toggles */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: 24, borderRadius: 3 }}>
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 17, color: T.text, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>Feature Toggles</div>
          {[
            ["showWeather", "Show Weather Widget",   "Live DMV weather on homepage"],
            ["showPoll",    "Show Community Poll",    "Reader poll widget"],
          ].map(([key, label, desc]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.divider}` }}>
              <div>
                <div style={{ fontFamily: "Inter,sans-serif", fontWeight: 600, fontSize: 13, color: T.text }}>{label}</div>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted, marginTop: 2 }}>{desc}</div>
              </div>
              <Toggle value={settings[key] !== false} onChange={() => setSetting(key, !settings[key])} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
            <div>
              <div style={{ fontFamily: "Inter,sans-serif", fontWeight: 700, fontSize: 13, color: T.red }}>Maintenance Mode</div>
              <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted, marginTop: 2 }}>Hides website from all visitors</div>
            </div>
            <Toggle value={settings.maintenanceMode || false} onChange={() => setSetting("maintenanceMode", !settings.maintenanceMode)} />
          </div>
        </div>

        {/* Save row */}
        <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 16 }}>
          <Btn size="lg" disabled={saving} variant={saved ? "green" : "primary"} onClick={onSave} style={{ minWidth: 200 }}>
            {saving ? "Saving…" : saved ? "✓ Settings Saved" : "Save All Settings"}
          </Btn>
          <span style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.muted }}>Changes go live immediately.</span>
        </div>
      </div>
    </div>
  );
}

// ── SCHOOLS TAB ───────────────────────────────────────────────────────────────
function Schools({ schools, onApprove, onReject, loading }) {
  const [rejectId, setRejectId]     = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expanded, setExpanded]     = useState(null);

  const pending  = schools.filter(s => s.status === "pending");
  const approved = schools.filter(s => s.status === "approved");
  const rejected = schools.filter(s => s.status === "rejected");

  function SchoolRow({ school, actions }) {
    const open = expanded === school.id;
    return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, marginBottom: 8, borderLeft: `4px solid ${school.status === "approved" ? T.green : school.status === "rejected" ? T.red : T.gold}` }}>
        <div
          onClick={() => setExpanded(open ? null : school.id)}
          style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 15, color: T.text }}>{school.school_name}</span>
              <StatusBadge status={school.status} />
              {school.county && <span style={{ fontFamily: "Inter,sans-serif", fontSize: 11, color: T.muted, background: T.bg, padding: "2px 8px", borderRadius: 10 }}>{school.county}</span>}
            </div>
            <div style={{ fontFamily: "Inter,sans-serif", fontSize: 12, color: T.muted, marginTop: 4 }}>
              {school.contact_name} · {school.contact_email} · Applied {fmtDate(school.created_at)}
            </div>
          </div>
          <span style={{ color: T.muted, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>

        {open && (
          <div className="expand-down" style={{ borderTop: `1px solid ${T.border}`, padding: "16px 18px" }}>
            {school.description && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>About / Reason</div>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: T.sub, lineHeight: 1.6, background: T.bg, padding: "10px 14px", borderRadius: 3 }}>{school.description}</div>
              </div>
            )}
            {school.rejection_reason && (
              <div style={{ marginBottom: 14, background: "#fdf0f0", borderLeft: `3px solid ${T.red}`, padding: "10px 14px", borderRadius: "0 3px 3px 0" }}>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 10, fontWeight: 800, color: T.red, marginBottom: 4 }}>REJECTION REASON</div>
                <div style={{ fontFamily: "Inter,sans-serif", fontSize: 13, color: T.sub }}>{school.rejection_reason}</div>
              </div>
            )}
            {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tab-enter">
      <SectionHead
        section="Partner Schools" title="School Accounts"
        sub="Schools that have applied to publish student journalism on KrynoluxDC."
      />

      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Pending"  value={pending.length}  color={T.gold}  sub={pending.length > 0 ? "Needs review" : "All clear"} subColor={pending.length > 0 ? T.gold : T.green} />
        <StatCard label="Approved" value={approved.length} color={T.green} sub="Active partners" />
        <StatCard label="Rejected" value={rejected.length} color={T.red} />
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: T.muted, fontFamily: "Inter,sans-serif", fontSize: 13 }}>Loading…</div>}

      {!loading && pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: T.gold, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{pending.length}</span>
            Pending Applications
          </div>
          {pending.map(s => (
            <SchoolRow key={s.id} school={s} actions={[
              <Btn key="a" variant="green" size="sm" onClick={() => onApprove(s)}>✓ Approve</Btn>,
              <Btn key="r" variant="danger" size="sm" onClick={() => { setRejectId(s.id); setExpanded(s.id); }}>✕ Reject</Btn>,
            ]} />
          ))}
        </div>
      )}

      {!loading && approved.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.green, marginBottom: 12 }}>Approved Schools</div>
          {approved.map(s => (
            <SchoolRow key={s.id} school={s} actions={[
              <Btn key="r" variant="danger" size="sm" onClick={() => { setRejectId(s.id); setExpanded(s.id); }}>Revoke</Btn>,
            ]} />
          ))}
        </div>
      )}

      {!loading && rejected.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>Rejected</div>
          {rejected.map(s => <SchoolRow key={s.id} school={s} />)}
        </div>
      )}

      {!loading && schools.length === 0 && (
        <Empty icon="🏫" title="No school applications yet" sub="Schools will appear here once they apply via the School Portal on krynolux.work." />
      )}

      {/* Reject / Revoke modal */}
      {rejectId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => { setRejectId(null); setRejectReason(""); }}>
          <div style={{ background: T.card, width: "100%", maxWidth: 440, padding: 28, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 18, color: T.text, marginBottom: 16 }}>Reject / Revoke School</div>
            <Field label="Reason (sent to school)">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Optional — explain why the application was rejected…"
                style={{ ...INP, resize: "vertical" }}
              />
            </Field>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn variant="ghost" onClick={() => { setRejectId(null); setRejectReason(""); }}>Cancel</Btn>
              <Btn variant="red" onClick={() => { onReject(rejectId, rejectReason); setRejectId(null); setRejectReason(""); }}>Confirm Reject</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN CMS ──────────────────────────────────────────────────────────────────
export default function CMS() {
  const [loggedIn,      setLoggedIn]      = useState(false);
  const [tab,           setTab]           = useState("dashboard");
  const [tabKey,        setTabKey]        = useState(0);
  const [articles,      setArticles]      = useState([]);
  const [writers,       setWriters]       = useState([]);
  const [openId,        setOpenId]        = useState(null);
  const [editArt,       setEditArt]       = useState(null);
  const [toast,         setToast]         = useState(null);
  const [dataLoading,   setDataLoading]   = useState(false);
  const [imgUploading,  setImgUploading]  = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved,  setSettingsSaved]  = useState(false);
  const [subscribers,    setSubscribers]    = useState([]);
  const [schools,        setSchools]        = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [rejectReason,  setRejectReason]  = useState("");
  const [emailStatus,   setEmailStatus]   = useState("");
  const [wAdding,       setWAdding]       = useState(false);
  const [pollQ,         setPollQ]         = useState("What should we cover more?");
  const [pollOpts,      setPollOpts]      = useState(["Climate & Environment", "School Policies", "Local Sports", "Youth Entrepreneurs"]);
  const [settings,      setSettings]      = useState({
    siteName: "KrynoluxDC", tagline: "News by Kids. For the Community.",
    tickerMsg: "", announcementBanner: "", announcementColor: "#7B2FFF",
    contactEmail: "contact@krynolux.work", coverageArea: "Fairfax, Loudoun, DC",
    showWeather: true, showPoll: true, maintenanceMode: false,
  });

  const toastTimer = useRef(null);

  function showToast(msg, color = T.green) {
    clearTimeout(toastTimer.current);
    setToast({ msg, color });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }

  function navigate(id) {
    setTab(id);
    setTabKey(k => k + 1);
    if (id === "submissions") loadArticles();
    if (id === "writers")     loadWriters();
    if (id === "schools")     loadSchools();
  }

  const loadArticles = useCallback(async () => {
    setDataLoading(true);
    const { data, error } = await supabase.from("submissions").select("*").order("created_at", { ascending: false });
    if (data)  setArticles(data);
    if (error) showToast("Error: " + error.message, T.red);
    setDataLoading(false);
  }, []);

  const loadWriters = useCallback(async () => {
    const { data, error } = await supabase.from("writers").select("*").order("created_at", { ascending: false });
    if (data)  setWriters(data);
    if (error) showToast("Error loading writers: " + error.message, T.red);
  }, []);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (data) setSettings(s => ({ ...s, ...data }));
  }, []);

  const loadSubscribers = useCallback(async () => {
    const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    if (data) setSubscribers(data);
  }, []);

  const loadSchools = useCallback(async () => {
    setSchoolsLoading(true);
    const { data, error } = await supabase.from("school_accounts").select("*").order("created_at", { ascending: false });
    if (data)  setSchools(data);
    if (error) showToast("Error loading schools: " + error.message, T.red);
    setSchoolsLoading(false);
  }, []);

  useEffect(() => {
    if (loggedIn) { loadArticles(); loadWriters(); loadSettings(); loadSubscribers(); loadSchools(); }
  }, [loggedIn, loadArticles, loadWriters, loadSettings, loadSubscribers, loadSchools]);

  // ── Newsletter blast ───────────────────────────────────────────────────────
  async function sendNewsletterBlast(article) {
    const active = subscribers.filter(s => s.active).map(s => s.email);
    if (active.length === 0) { showToast("No active subscribers to send to.", T.gold); return; }
    const sent = await sendEmail({
      status: "newsletter",
      emails: active,
      headline: article.headline || "New story",
      excerpt:  (article.body || "").slice(0, 280),
      author:   article.name || "KrynoluxDC",
    });
    showToast(sent ? `📧 Newsletter sent to ${active.length} subscriber${active.length !== 1 ? "s" : ""}!` : "Newsletter send failed.", sent ? T.green : T.red);
  }

  // ── Article actions ────────────────────────────────────────────────────────
  async function onSetStatus(id, status, sendNewsletter = false) {
    const article = articles.find(a => a.id === id);
    const { error } = await supabase.from("submissions").update({ status }).eq("id", id);
    if (error) { showToast("Update failed: " + error.message, T.red); return; }
    setArticles(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    if (article?.email && (status === "approved" || status === "rejected")) {
      setEmailStatus(`Sending email to ${article.email}…`);
      const sent = await sendEmail({ email: article.email, name: article.name || "Writer", headline: article.headline || "Your article", status, reason: status === "rejected" ? rejectReason : "" });
      setEmailStatus("");
      showToast(
        status === "approved"
          ? `✅ Published!${sent ? ` Email sent to ${article.email}` : " (email failed)"}`
          : `❌ Rejected.${sent ? ` Email sent to ${article.email}` : " (email failed)"}`,
        status === "approved" ? T.green : T.red
      );
    } else {
      showToast(status === "approved" ? "✅ Published." : status === "rejected" ? "❌ Rejected." : "↩ Set to pending.", status === "approved" ? T.green : status === "rejected" ? T.red : T.gold);
    }
    if (status === "approved" && sendNewsletter && article) await sendNewsletterBlast(article);
    setRejectReason("");
    setOpenId(null);
  }

  async function onToggleFlag(id, current) {
    const { error } = await supabase.from("submissions").update({ flagged: !current }).eq("id", id);
    if (!error) { setArticles(prev => prev.map(x => x.id === id ? { ...x, flagged: !current } : x)); showToast(!current ? "🚩 Flagged." : "Unflagged."); }
    else showToast("Failed: " + error.message, T.red);
  }

  async function onToggleFeature(id, current) {
    const { error } = await supabase.from("submissions").update({ featured: !current }).eq("id", id);
    if (!error) { setArticles(prev => prev.map(x => x.id === id ? { ...x, featured: !current } : x)); showToast(!current ? "⭐ Pinned." : "Unpinned."); }
    else showToast("Failed: " + error.message, T.red);
  }

  async function onDelete(id) {
    if (!window.confirm("Permanently delete this article?")) return;
    const { error } = await supabase.from("submissions").delete().eq("id", id);
    if (!error) { setArticles(prev => prev.filter(x => x.id !== id)); showToast("Deleted.", T.red); setOpenId(null); }
    else showToast("Failed: " + error.message, T.red);
  }

  async function onSaveEdit() {
    if (!editArt) return;
    const { error } = await supabase.from("submissions").update({ headline: editArt.headline, body: editArt.body, category: editArt.category, name: editArt.name, school: editArt.school }).eq("id", editArt.id);
    if (!error) { setArticles(prev => prev.map(x => x.id === editArt.id ? { ...x, ...editArt } : x)); setEditArt(null); showToast("Article updated."); }
    else showToast("Failed: " + error.message, T.red);
  }

  async function uploadImg(file) {
    if (!file) return null;
    setImgUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `articles/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("article-images").upload(path, file, { upsert: true });
    if (error) { showToast("Image upload failed: " + error.message, T.red); setImgUploading(false); return null; }
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    setImgUploading(false);
    return data.publicUrl;
  }

  async function onPublish({ title, author, school, cat, body, date, imgFile, imgUrl, featured, sendNewsletter }, clear) {
    if (!title.trim() || !author.trim()) { showToast("Headline and author are required.", T.red); return; }
    let imageUrl = imgUrl;
    if (imgFile) { imageUrl = await uploadImg(imgFile); if (!imageUrl) return; }
    const { data, error } = await supabase.from("submissions").insert([{
      headline: title.trim(), name: author.trim(), school: school.trim(),
      category: cat, body: body.trim(), status: date ? "scheduled" : "approved",
      flagged: false, featured, views: 0, image_url: imageUrl || null,
    }]).select();
    if (!error && data) {
      setArticles(prev => [data[0], ...prev]);
      if (sendNewsletter && !date) await sendNewsletterBlast(data[0]);
      clear();
      showToast(date ? "Article scheduled." : "Article published live.");
      navigate("submissions");
    } else {
      showToast("Publish failed: " + (error?.message || "Unknown error"), T.red);
    }
  }

  // ── Writer actions ─────────────────────────────────────────────────────────
  async function onAddWriter({ name, school, email, badge }, clear) {
    if (!name.trim())  { showToast("Name is required.", T.red); return; }
    if (!email.trim()) { showToast("Email is required.", T.red); return; }
    setWAdding(true);
    const { data, error } = await supabase.from("writers").insert([{ name: name.trim(), school: school.trim(), email: email.trim(), badge, articles: 0, status: "active" }]).select();
    setWAdding(false);
    if (!error && data?.length > 0) { setWriters(prev => [data[0], ...prev]); clear(); showToast("Writer added."); }
    else showToast("Failed: " + (error?.message || "No data returned"), T.red);
  }

  async function onUpdateBadge(id, badge) {
    const { error } = await supabase.from("writers").update({ badge }).eq("id", id);
    if (!error) { setWriters(prev => prev.map(x => x.id === id ? { ...x, badge } : x)); showToast("Badge updated."); }
    else showToast("Failed: " + error.message, T.red);
  }

  async function onToggleWriter(id, status) {
    const ns = status === "active" ? "suspended" : "active";
    const { error } = await supabase.from("writers").update({ status: ns }).eq("id", id);
    if (!error) { setWriters(prev => prev.map(x => x.id === id ? { ...x, status: ns } : x)); showToast(ns === "active" ? "Writer restored." : "Writer suspended."); }
    else showToast("Failed: " + error.message, T.red);
  }

  async function onDeleteWriter(id) {
    if (!window.confirm("Remove this writer?")) return;
    const { error } = await supabase.from("writers").delete().eq("id", id);
    if (!error) { setWriters(prev => prev.filter(x => x.id !== id)); showToast("Writer removed.", T.red); }
    else showToast("Failed: " + error.message, T.red);
  }

  // ── School actions ─────────────────────────────────────────────────────────
  async function onApproveSchool(school) {
    const { error } = await supabase.from("school_accounts").update({ status: "approved", approved_at: new Date().toISOString(), rejection_reason: "" }).eq("id", school.id);
    if (error) { showToast("Failed: " + error.message, T.red); return; }
    setSchools(prev => prev.map(s => s.id === school.id ? { ...s, status: "approved", approved_at: new Date().toISOString() } : s));
    await sendEmail({ status: "school_approved", name: school.contact_name, email: school.contact_email, school_name: school.school_name });
    showToast(`✓ ${school.school_name} approved — email sent.`);
  }

  async function onRejectSchool(id, reason) {
    const school = schools.find(s => s.id === id);
    const { error } = await supabase.from("school_accounts").update({ status: "rejected", rejection_reason: reason || "" }).eq("id", id);
    if (error) { showToast("Failed: " + error.message, T.red); return; }
    setSchools(prev => prev.map(s => s.id === id ? { ...s, status: "rejected", rejection_reason: reason } : s));
    if (school?.contact_email) {
      await sendEmail({ status: "school_rejected", name: school.contact_name, email: school.contact_email, school_name: school.school_name, reason });
    }
    showToast("School rejected — email sent.", T.red);
  }

  // ── Settings actions ───────────────────────────────────────────────────────
  async function onSaveSettings() {
    setSettingsSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ ...settings, id: 1 }, { onConflict: "id" });
    setSettingsSaving(false);
    if (!error) { showToast("Settings saved and live."); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }
    else showToast("Failed: " + error.message, T.red);
  }

  async function onSavePoll() {
    const { error } = await supabase.from("site_settings").upsert({ id: 1, pollQuestion: pollQ, pollOptions: pollOpts }, { onConflict: "id" });
    if (!error) showToast("Poll updated on website.");
    else showToast("Failed: " + error.message, T.red);
  }

  function setSetting(key, value) { setSettings(s => ({ ...s, [key]: value })); }

  // ── Computed ───────────────────────────────────────────────────────────────
  const pending = articles.filter(a => a.status === "pending").length;
  const flagged = articles.filter(a => a.flagged).length;
  const pendingSchools = schools.filter(s => s.status === "pending").length;

  if (!loggedIn) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Login onLogin={() => setLoggedIn(true)} />
    </>
  );

  const tabContent = {
    dashboard:   <Dashboard articles={articles} writers={writers} settings={settings} setSetting={setSetting} saveSettings={onSaveSettings} setTab={navigate} setOpenId={setOpenId} dataLoading={dataLoading} pollOpts={pollOpts} />,
    submissions: <Submissions articles={articles} openId={openId} setOpenId={setOpenId} editArt={editArt} setEditArt={setEditArt} dataLoading={dataLoading} loadArticles={loadArticles} rejectReason={rejectReason} setRejectReason={setRejectReason} emailStatus={emailStatus} onSetStatus={onSetStatus} onToggleFlag={onToggleFlag} onToggleFeature={onToggleFeature} onDelete={onDelete} onSaveEdit={onSaveEdit} subscriberCount={subscribers.length} />,
    publish:     <Publish onPublish={onPublish} imgUploading={imgUploading} subscriberCount={subscribers.length} />,
    media:       <Media articles={articles} />,
    writers:     <Writers writers={writers} wAdding={wAdding} onAdd={onAddWriter} onUpdateBadge={onUpdateBadge} onToggle={onToggleWriter} onDelete={onDeleteWriter} />,
    polls:       <Polls pollQ={pollQ} setPollQ={setPollQ} pollOpts={pollOpts} setPollOpts={setPollOpts} onSave={onSavePoll} />,
    schools:     <Schools schools={schools} onApprove={onApproveSchool} onReject={onRejectSchool} loading={schoolsLoading} />,
    analytics:   <Analytics articles={articles} writers={writers} subscribers={subscribers} onRefreshSubs={loadSubscribers} />,
    settings:    <Settings settings={settings} setSetting={setSetting} onSave={onSaveSettings} saving={settingsSaving} saved={settingsSaved} />,
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex" }}>
        <Toast toast={toast} />

        {/* SIDEBAR */}
        <div style={{ width: 210, background: T.sidebar, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          {/* Brand */}
          <div style={{ padding: "18px 16px 16px", borderBottom: `1px solid ${T.sideBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={32} circle />
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14, color: T.sideText, lineHeight: 1 }}>KrynoluxDC</div>
              <div style={{ fontFamily: "Inter,sans-serif", fontSize: 9, color: T.sideMuted, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 3 }}>CMS</div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ flex: 1, padding: "10px 8px" }}>
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(t.id)}
                  className="sidebar-btn"
                  style={{
                    width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 1,
                    background: active ? T.sideActive : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${active ? T.accent : "transparent"}`,
                    color: active ? T.sideText : T.sideMuted,
                    cursor: "pointer", fontSize: 13,
                    fontWeight: active ? 700 : 400,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderRadius: "0 3px 3px 0",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>{t.icon}</span>
                    {t.label}
                  </span>
                  <div style={{ display: "flex", gap: 3 }}>
                    {t.id === "submissions" && pending > 0 && (
                      <span style={{ background: T.red, color: "#fff", fontSize: 9, fontWeight: 900, padding: "1px 5px", borderRadius: 8 }}>{pending}</span>
                    )}
                    {t.id === "submissions" && flagged > 0 && (
                      <span style={{ background: T.orange, color: "#fff", fontSize: 9, fontWeight: 900, padding: "1px 5px", borderRadius: 8 }}>{flagged}</span>
                    )}
                    {t.id === "schools" && pendingSchools > 0 && (
                      <span style={{ background: T.gold, color: "#fff", fontSize: 9, fontWeight: 900, padding: "1px 5px", borderRadius: 8 }}>{pendingSchools}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Maintenance warning */}
          {settings.maintenanceMode && (
            <div style={{ margin: "0 8px 8px", background: T.red + "25", borderLeft: `3px solid ${T.red}`, padding: "8px 10px", borderRadius: "0 3px 3px 0" }}>
              <div style={{ color: T.red, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>⚠ MAINTENANCE ON</div>
            </div>
          )}

          {/* Sign out */}
          <div style={{ padding: "10px 8px 14px", borderTop: `1px solid ${T.sideBorder}` }}>
            <button
              onClick={() => { setLoggedIn(false); setArticles([]); setWriters([]); }}
              className="sidebar-btn"
              style={{ width: "100%", padding: "8px 12px", background: "transparent", border: `1px solid ${T.sideBorder}`, color: T.sideMuted, cursor: "pointer", fontSize: 12, borderRadius: 3, textAlign: "left" }}
            >← Sign Out</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
          <div key={tabKey}>
            {tabContent[tab]}
          </div>
        </div>
      </div>
    </>
  );
}
