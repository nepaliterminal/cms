import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

const C = {
  bg: "#09090f", sidebar: "#0d0d18", card: "#111120",
  cardHover: "#16162a", border: "#1e1e35", accent: "#7B2FFF",
  blue: "#1E90FF", grad: "linear-gradient(135deg,#7B2FFF,#1E90FF)",
  white: "#f0f0ff", gray: "#7878a0", muted: "#404060",
  red: "#ff4466", gold: "#ffb830", green: "#22c87a", orange: "#ff8c00",
  teal: "#00d4aa",
};

const CATS = ["Local News","Schools","Sports","Events","Student Spotlight","Opinion","Weather"];
const CAT_COLOR = {
  "Local News":"#c0392b","Schools":"#1a6faf","Sports":"#1e7e34",
  "Events":"#7d3c98","Weather":"#d35400","Opinion":"#2c3e50","Student Spotlight":"#b7950b",
};
const BADGES = ["New Writer","Contributor","Rising Star","Staff Writer","Senior Writer","Editor","Top Contributor","Investigative Reporter"];

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function timeAgo(str) {
  if (!str) return "";
  var diff = Date.now() - new Date(str).getTime();
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.floor(hrs / 24) + "d ago";
}

// ── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function GradText(props) {
  return <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{props.children}</span>;
}

function Logo(props) {
  var [err, setErr] = useState(false);
  var s = props.size || 36;
  if (err) return <div style={{ width: s, height: s, borderRadius: props.circle ? "50%" : 6, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: s * 0.48, color: "#fff", flexShrink: 0 }}>K</div>;
  return <img src={props.circle ? "/logo-circle.png" : "/logo-square.png"} alt="K" onError={function() { setErr(true); }} style={{ width: s, height: s, borderRadius: props.circle ? "50%" : 6, objectFit: "cover", flexShrink: 0 }} />;
}

function Chip(props) {
  var col = props.color || C.accent;
  return <span style={{ background: col + "25", color: col, border: "1px solid " + col + "40", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, letterSpacing: 0.4, whiteSpace: "nowrap", fontFamily: "Inter,sans-serif" }}>{props.text}</span>;
}

function Stat(props) {
  var [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={function() { setHov(true); }} onMouseLeave={function() { setHov(false); }}
      style={{ background: hov ? C.cardHover : C.card, borderRadius: 10, padding: "16px 18px", border: "1px solid " + (hov ? C.accent + "40" : C.border), flex: 1, minWidth: 110, transition: "all 0.2s", cursor: "default" }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{props.icon}</div>
      <div style={{ color: props.color || C.accent, fontWeight: 900, fontSize: 26, fontFamily: "Inter,sans-serif", lineHeight: 1 }}>{props.value}</div>
      <div style={{ color: C.gray, fontSize: 11, fontFamily: "Inter,sans-serif", marginTop: 4 }}>{props.label}</div>
      {props.sub && <div style={{ color: props.subColor || C.green, fontSize: 10, fontFamily: "Inter,sans-serif", marginTop: 2 }}>{props.sub}</div>}
    </div>
  );
}

function Toggle(props) {
  return (
    <div onClick={props.onChange} style={{ width: 44, height: 24, borderRadius: 12, background: props.value ? C.accent : C.muted, cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0, border: "1px solid " + (props.value ? C.accent : C.border) }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: props.value ? 22 : 2, transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
    </div>
  );
}

function Toast(props) {
  if (!props.toast) return null;
  return <div style={{ position: "fixed", top: 18, right: 18, background: props.toast.color, color: "#fff", padding: "11px 18px", borderRadius: 9, fontWeight: 700, fontSize: 13, zIndex: 9999, boxShadow: "0 4px 24px rgba(0,0,0,0.5)", fontFamily: "Inter,sans-serif", maxWidth: 320 }}>{props.toast.msg}</div>;
}

function Empty(props) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{props.icon || "📭"}</div>
      <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 5, fontFamily: "Inter,sans-serif" }}>{props.title}</div>
      <div style={{ color: C.gray, fontSize: 12, fontFamily: "Inter,sans-serif" }}>{props.sub}</div>
    </div>
  );
}

function SectionHead(props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
      <div>
        <h2 style={{ color: C.white, margin: 0, fontSize: 20, fontFamily: "Inter,sans-serif", fontWeight: 800 }}>{props.title}</h2>
        {props.sub && <p style={{ color: C.gray, fontSize: 12, margin: "4px 0 0", fontFamily: "Inter,sans-serif" }}>{props.sub}</p>}
      </div>
      {props.actions && <div style={{ display: "flex", gap: 8 }}>{props.actions}</div>}
    </div>
  );
}

var fieldStyle = { width: "100%", padding: "10px 12px", background: "#080812", border: "1px solid " + C.border, borderRadius: 7, color: C.white, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 10, fontFamily: "Inter,sans-serif" };

function Field(props) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ color: C.gray, fontSize: 10, display: "block", marginBottom: 5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "Inter,sans-serif" }}>{props.label}{props.required && " *"}</label>
      {props.children}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login(props) {
  var [u, setU] = useState("");
  var [p, setP] = useState("");
  var [err, setErr] = useState("");
  var [show, setShow] = useState(false);
  var [loading, setLoading] = useState(false);
  var [tries, setTries] = useState(0);

  function submit() {
    if (tries >= 3) { setErr("Too many attempts. Please wait."); return; }
    setLoading(true);
    setTimeout(function() {
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        props.onLogin();
      } else {
        var n = tries + 1;
        setTries(n);
        setErr(n >= 3 ? "Locked out. Refresh the page to try again." : "Incorrect credentials. " + (3 - n) + " attempt(s) remaining.");
      }
      setLoading(false);
    }, 800);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif", padding: 20 }}>
      <div style={{ background: C.card, borderRadius: 18, padding: "40px 36px", width: "100%", maxWidth: 380, border: "1px solid " + C.border, boxShadow: "0 0 100px rgba(123,47,255,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Logo size={56} /></div>
          <div style={{ fontWeight: 900, fontSize: 21, marginBottom: 4 }}><GradText>KrynoluxDC CMS</GradText></div>
          <div style={{ color: C.gray, fontSize: 12 }}>Authorized Personnel Only</div>
        </div>
        <Field label="Username" required>
          <input value={u} onChange={function(e) { setU(e.target.value); setErr(""); }} onKeyDown={function(e) { if (e.key === "Enter") submit(); }} placeholder="Enter username" autoComplete="off" style={Object.assign({}, fieldStyle, { borderColor: err ? C.red : C.border })} />
        </Field>
        <Field label="Password" required>
          <div style={{ position: "relative" }}>
            <input value={p} onChange={function(e) { setP(e.target.value); setErr(""); }} onKeyDown={function(e) { if (e.key === "Enter") submit(); }} type={show ? "text" : "password"} placeholder="Enter password" autoComplete="off" style={Object.assign({}, fieldStyle, { marginBottom: 0, paddingRight: 44, borderColor: err ? C.red : C.border })} />
            <span onClick={function() { setShow(!show); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.gray, userSelect: "none" }}>{show ? "🙈" : "👁️"}</span>
          </div>
        </Field>
        {err && <div style={{ background: C.red + "20", border: "1px solid " + C.red + "40", borderRadius: 8, padding: "9px 12px", color: C.red, fontSize: 12, marginBottom: 14 }}>⚠️ {err}</div>}
        <button onClick={submit} disabled={loading || tries >= 3} style={{ width: "100%", padding: "12px", background: loading || tries >= 3 ? C.muted : C.grad, border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading || tries >= 3 ? "not-allowed" : "pointer", marginTop: 4, fontFamily: "Inter,sans-serif" }}>
          {loading ? "Signing in..." : "🔐 Sign In"}
        </button>
        <div style={{ textAlign: "center", marginTop: 16, color: C.muted, fontSize: 11 }}>KrynoluxDC · Secured Admin System</div>
      </div>
    </div>
  );
}

// ── MAIN CMS ─────────────────────────────────────────────────────────────────
export default function CMS() {
  var [loggedIn, setLoggedIn] = useState(false);
  var [tab, setTab] = useState("dashboard");
  var [articles, setArticles] = useState([]);
  var [writers, setWriters] = useState([]);
  var [openId, setOpenId] = useState(null);
  var [editArt, setEditArt] = useState(null);
  var [search, setSearch] = useState("");
  var [fStatus, setFStatus] = useState("all");
  var [fCat, setFCat] = useState("all");
  var [toast, setToast] = useState(null);
  var [loading, setLoading] = useState(false);
  var [imgUploading, setImgUploading] = useState(false);
  var [settingsSaving, setSettingsSaving] = useState(false);
  var [settingsSaved, setSettingsSaved] = useState(false);

  // Publish form state
  var [aTitle, setATitle] = useState("");
  var [aAuthor, setAAuthor] = useState("");
  var [aSchool, setASchool] = useState("");
  var [aCat, setACat] = useState("Local News");
  var [aBody, setABody] = useState("");
  var [aDate, setADate] = useState("");
  var [aImgFile, setAImgFile] = useState(null);
  var [aImgPreview, setAImgPreview] = useState("");
  var [aImgUrl, setAImgUrl] = useState("");
  var [aFeatured, setAFeatured] = useState(false);

  // Writer form state
  var [wName, setWName] = useState("");
  var [wSchool, setWSchool] = useState("");
  var [wEmail, setWEmail] = useState("");
  var [wBadge, setWBadge] = useState("New Writer");
  var [wAdding, setWAdding] = useState(false);

  // Poll state
  var [pollQ, setPollQ] = useState("What should we cover more?");
  var [pollOpts, setPollOpts] = useState(["Climate & Environment","School Policies","Local Sports","Youth Entrepreneurs"]);

  // Site settings state
  var [settings, setSettings] = useState({
    siteName: "KrynoluxDC",
    tagline: "News by Kids. For the Community.",
    tickerMsg: "",
    announcementBanner: "",
    announcementColor: "#7B2FFF",
    contactEmail: "contact@krynolux.work",
    coverageArea: "Fairfax, Loudoun, DC",
    showWeather: true,
    showPoll: true,
    maintenanceMode: false,
  });

  function toast_(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 3500);
  }

  // ── DATA LOADING ──────────────────────────────────────────────────────────
  var loadArticles = useCallback(async function() {
    setLoading(true);
    var res = await supabase.from("submissions").select("*").order("created_at", { ascending: false });
    if (res.data) setArticles(res.data);
    if (res.error) toast_("Failed to load articles: " + res.error.message, C.red);
    setLoading(false);
  }, []);

  var loadWriters = useCallback(async function() {
    var res = await supabase.from("writers").select("*").order("created_at", { ascending: false });
    if (res.data) setWriters(res.data);
    if (res.error) toast_("Failed to load writers: " + res.error.message, C.red);
  }, []);

  var loadSettings = useCallback(async function() {
    var res = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (res.data) {
      setSettings(function(prev) { return Object.assign({}, prev, res.data); });
    }
  }, []);

  useEffect(function() {
    if (loggedIn) {
      loadArticles();
      loadWriters();
      loadSettings();
    }
  }, [loggedIn]);

  // ── ARTICLE ACTIONS ───────────────────────────────────────────────────────
  async function setStatus(id, status) {
    var res = await supabase.from("submissions").update({ status: status }).eq("id", id);
    if (!res.error) {
      setArticles(function(a) { return a.map(function(x) { return x.id === id ? Object.assign({}, x, { status: status }) : x; }); });
      toast_(status === "approved" ? "✅ Article published!" : status === "rejected" ? "❌ Article rejected." : "🔄 Set to pending.", status === "approved" ? C.green : status === "rejected" ? C.red : C.gold);
      setOpenId(null);
    } else { toast_("Update failed: " + res.error.message, C.red); }
  }

  async function toggleFlag(id, current) {
    var res = await supabase.from("submissions").update({ flagged: !current }).eq("id", id);
    if (!res.error) { setArticles(function(a) { return a.map(function(x) { return x.id === id ? Object.assign({}, x, { flagged: !current }) : x; }); }); toast_(!current ? "🚩 Flagged." : "✅ Unflagged."); }
    else toast_("Failed: " + res.error.message, C.red);
  }

  async function toggleFeature(id, current) {
    var res = await supabase.from("submissions").update({ featured: !current }).eq("id", id);
    if (!res.error) { setArticles(function(a) { return a.map(function(x) { return x.id === id ? Object.assign({}, x, { featured: !current }) : x; }); }); toast_(!current ? "⭐ Pinned to homepage!" : "Unpinned."); }
    else toast_("Failed: " + res.error.message, C.red);
  }

  async function deleteArticle(id) {
    var res = await supabase.from("submissions").delete().eq("id", id);
    if (!res.error) { setArticles(function(a) { return a.filter(function(x) { return x.id !== id; }); }); toast_("🗑️ Article deleted.", C.red); setOpenId(null); }
    else toast_("Delete failed: " + res.error.message, C.red);
  }

  async function saveEdit() {
    if (!editArt) return;
    var res = await supabase.from("submissions").update({ headline: editArt.headline, body: editArt.body, category: editArt.category, name: editArt.name, school: editArt.school }).eq("id", editArt.id);
    if (!res.error) { setArticles(function(a) { return a.map(function(x) { return x.id === editArt.id ? Object.assign({}, x, editArt) : x; }); }); setEditArt(null); toast_("✅ Article updated!"); }
    else toast_("Save failed: " + res.error.message, C.red);
  }

  async function uploadImg(file) {
    if (!file) return null;
    setImgUploading(true);
    var ext = file.name.split(".").pop();
    var path = "articles/" + Date.now() + "." + ext;
    var up = await supabase.storage.from("article-images").upload(path, file, { upsert: true });
    if (up.error) { toast_("Image upload failed: " + up.error.message, C.red); setImgUploading(false); return null; }
    var pub = supabase.storage.from("article-images").getPublicUrl(path);
    setImgUploading(false);
    return pub.data.publicUrl;
  }

  function onImgSelect(e) {
    var file = e.target.files[0];
    if (!file) return;
    setAImgFile(file);
    var r = new FileReader();
    r.onload = function(ev) { setAImgPreview(ev.target.result); };
    r.readAsDataURL(file);
  }

  async function publish() {
    if (!aTitle.trim() || !aAuthor.trim()) { toast_("Headline and author are required.", C.red); return; }
    var imageUrl = aImgUrl;
    if (aImgFile) { imageUrl = await uploadImg(aImgFile); if (!imageUrl) return; }
    var res = await supabase.from("submissions").insert([{
      headline: aTitle.trim(), name: aAuthor.trim(), school: aSchool.trim(),
      category: aCat, body: aBody.trim(), status: aDate ? "scheduled" : "approved",
      flagged: false, featured: aFeatured, views: 0, image_url: imageUrl || null,
    }]).select();
    if (!res.error && res.data) {
      setArticles(function(a) { return [res.data[0]].concat(a); });
      setATitle(""); setAAuthor(""); setASchool(""); setABody(""); setADate(""); setACat("Local News");
      setAImgFile(null); setAImgPreview(""); setAImgUrl(""); setAFeatured(false);
      toast_(aDate ? "🗓️ Article scheduled!" : "🚀 Article published live!");
      setTab("submissions");
    } else { toast_("Publish failed: " + (res.error ? res.error.message : "Unknown error"), C.red); }
  }

  // ── WRITER ACTIONS ────────────────────────────────────────────────────────
  async function addWriter() {
    if (!wName.trim()) { toast_("Writer name is required.", C.red); return; }
    if (!wEmail.trim()) { toast_("Writer email is required.", C.red); return; }
    setWAdding(true);
    var payload = { name: wName.trim(), school: wSchool.trim(), email: wEmail.trim(), badge: wBadge, articles: 0, status: "active" };
    var res = await supabase.from("writers").insert([payload]).select();
    setWAdding(false);
    if (!res.error && res.data && res.data.length > 0) {
      setWriters(function(w) { return [res.data[0]].concat(w); });
      setWName(""); setWSchool(""); setWEmail(""); setWBadge("New Writer");
      toast_("👤 Writer added successfully!");
    } else {
      toast_("Failed to add writer: " + (res.error ? res.error.message : "No data returned. Check your writers table."), C.red);
    }
  }

  async function updateWriterBadge(id, badge) {
    var res = await supabase.from("writers").update({ badge: badge }).eq("id", id);
    if (!res.error) { setWriters(function(w) { return w.map(function(x) { return x.id === id ? Object.assign({}, x, { badge: badge }) : x; }); }); toast_("Badge updated!"); }
    else toast_("Failed: " + res.error.message, C.red);
  }

  async function toggleWriter(id, status) {
    var ns = status === "active" ? "suspended" : "active";
    var res = await supabase.from("writers").update({ status: ns }).eq("id", id);
    if (!res.error) { setWriters(function(w) { return w.map(function(x) { return x.id === id ? Object.assign({}, x, { status: ns }) : x; }); }); toast_(ns === "active" ? "✅ Writer restored." : "🔴 Writer suspended."); }
    else toast_("Failed: " + res.error.message, C.red);
  }

  async function deleteWriter(id) {
    var res = await supabase.from("writers").delete().eq("id", id);
    if (!res.error) { setWriters(function(w) { return w.filter(function(x) { return x.id !== id; }); }); toast_("Writer removed.", C.red); }
    else toast_("Failed: " + res.error.message, C.red);
  }

  // ── SETTINGS ACTIONS ──────────────────────────────────────────────────────
  async function saveSettings() {
    setSettingsSaving(true);
    var payload = Object.assign({}, settings, { id: 1 });
    var res = await supabase.from("site_settings").upsert(payload, { onConflict: "id" });
    setSettingsSaving(false);
    if (!res.error) {
      toast_("✅ Settings saved and live!");
      setSettingsSaved(true);
      setTimeout(function() { setSettingsSaved(false); }, 3000);
    } else {
      toast_("Failed to save: " + res.error.message, C.red);
    }
  }

  function setSetting(key, value) {
    setSettings(function(s) { var n = Object.assign({}, s); n[key] = value; return n; });
  }

  // ── POLL ACTIONS ──────────────────────────────────────────────────────────
  async function savePoll() {
    var res = await supabase.from("site_settings").upsert({ id: 1, pollQuestion: pollQ, pollOptions: pollOpts }, { onConflict: "id" });
    if (!res.error) toast_("📊 Poll updated on website!");
    else toast_("Failed: " + res.error.message, C.red);
  }

  // ── COMPUTED VALUES ───────────────────────────────────────────────────────
  var pending = articles.filter(function(a) { return a.status === "pending"; }).length;
  var approved = articles.filter(function(a) { return a.status === "approved"; }).length;
  var rejected = articles.filter(function(a) { return a.status === "rejected"; }).length;
  var scheduled = articles.filter(function(a) { return a.status === "scheduled"; }).length;
  var flagged = articles.filter(function(a) { return a.flagged; }).length;
  var featured = articles.filter(function(a) { return a.featured; }).length;
  var activeWriters = writers.filter(function(w) { return w.status === "active"; }).length;
  var totalViews = articles.reduce(function(s, a) { return s + (a.views || 0); }, 0);
  var approvalRate = articles.length > 0 ? Math.round((approved / articles.length) * 100) : 0;

  var filtered = articles.filter(function(a) {
    var ms = (a.headline || "").toLowerCase().includes(search.toLowerCase()) || (a.name || "").toLowerCase().includes(search.toLowerCase());
    var mf = fStatus === "all" || a.status === fStatus;
    var mc = fCat === "all" || a.category === fCat;
    return ms && mf && mc;
  });

  var catCounts = {};
  CATS.forEach(function(c) { catCounts[c] = articles.filter(function(a) { return a.category === c && a.status === "approved"; }).length; });
  var topCat = CATS.reduce(function(a, b) { return (catCounts[a] || 0) >= (catCounts[b] || 0) ? a : b; }, CATS[0]);
  var topWriters = Object.values(writers.reduce(function(acc, w) { acc[w.name] = w; return acc; }, {})).sort(function(a, b) { return (b.articles || 0) - (a.articles || 0); }).slice(0, 3);

  var tabs = [
    ["dashboard","📊","Dashboard"],
    ["submissions","📥","Submissions"],
    ["publish","✍️","Publish"],
    ["media","🖼️","Media"],
    ["writers","👥","Writers"],
    ["polls","📊","Polls"],
    ["analytics","📈","Analytics"],
    ["settings","⚙️","Settings"],
  ];

  if (!loggedIn) return <Login onLogin={function() { setLoggedIn(true); }} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter,sans-serif", display: "flex" }}>
      <Toast toast={toast} />

      {/* ── SIDEBAR ── */}
      <div style={{ width: 210, background: C.sidebar, borderRight: "1px solid " + C.border, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={32} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 13 }}><GradText>KrynoluxDC</GradText></div>
            <div style={{ color: C.muted, fontSize: 9, letterSpacing: 0.5 }}>ADMIN PANEL</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "10px 8px" }}>
          {tabs.map(function(t) {
            var active = tab === t[0];
            return (
              <button key={t[0]} onClick={function() { setTab(t[0]); if (t[0] === "submissions") loadArticles(); if (t[0] === "writers") loadWriters(); }}
                style={{ width: "100%", textAlign: "left", padding: "9px 11px", marginBottom: 2, background: active ? "linear-gradient(90deg,rgba(123,47,255,0.22),rgba(30,144,255,0.06))" : "transparent", border: active ? "1px solid rgba(123,47,255,0.4)" : "1px solid transparent", borderRadius: 8, color: active ? C.white : C.gray, cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 400, display: "flex", alignItems: "center", gap: 9, transition: "all 0.15s" }}>
                <span style={{ fontSize: 14 }}>{t[1]}</span>
                <span>{t[2]}</span>
                {t[0] === "submissions" && pending > 0 && <span style={{ marginLeft: "auto", background: C.red, color: "#fff", fontSize: 9, fontWeight: 900, padding: "1px 6px", borderRadius: 8 }}>{pending}</span>}
                {t[0] === "submissions" && flagged > 0 && <span style={{ marginLeft: pending > 0 ? 2 : "auto", background: C.orange, color: "#fff", fontSize: 9, fontWeight: 900, padding: "1px 5px", borderRadius: 8 }}>🚩{flagged}</span>}
              </button>
            );
          })}
        </div>
        {settings.maintenanceMode && (
          <div style={{ margin: "4px 8px 6px", background: C.red + "20", border: "1px solid " + C.red + "40", borderRadius: 7, padding: "7px 10px", color: C.red, fontSize: 10, textAlign: "center", fontWeight: 700 }}>🔴 MAINTENANCE ON</div>
        )}
        <div style={{ padding: "10px 8px", borderTop: "1px solid " + C.border }}>
          <button onClick={function() { setLoggedIn(false); setArticles([]); setWriters([]); }} style={{ width: "100%", padding: "8px", background: "transparent", border: "1px solid " + C.border, borderRadius: 7, color: C.gray, cursor: "pointer", fontSize: 12 }}>🚪 Sign Out</button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>

        {/* ──── DASHBOARD ──── */}
        {tab === "dashboard" && (
          <div>
            <SectionHead title="📊 Dashboard" sub={"Welcome back, Admin · " + new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              actions={[
                <button key="r" onClick={function() { loadArticles(); loadWriters(); }} style={{ padding: "7px 14px", background: C.card, border: "1px solid " + C.border, borderRadius: 7, color: C.gray, cursor: "pointer", fontSize: 12 }}>🔄 Refresh All</button>,
                <button key="p" onClick={function() { setTab("publish"); }} style={{ padding: "7px 14px", background: C.grad, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✍️ New Article</button>,
              ]} />

            {settings.maintenanceMode && (
              <div style={{ background: C.red + "18", border: "1px solid " + C.red + "40", borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.red, fontWeight: 700, fontSize: 13 }}>🔴 Maintenance Mode is ON — Website is hidden from all visitors.</span>
                <button onClick={function() { setSetting("maintenanceMode", false); saveSettings(); }} style={{ padding: "6px 14px", background: C.green, border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Turn Off Now</button>
              </div>
            )}

            {/* STATS ROW 1 */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <Stat icon="📥" label="Pending Review" value={pending} color={C.gold} sub={pending > 0 ? "Needs attention" : "All clear ✓"} subColor={pending > 0 ? C.gold : C.green} />
              <Stat icon="✅" label="Published" value={approved} color={C.green} sub={"+" + articles.filter(function(a) { return a.status === "approved" && a.created_at && new Date(a.created_at) > new Date(Date.now() - 86400000 * 7); }).length + " this week"} />
              <Stat icon="🗓️" label="Scheduled" value={scheduled} color={C.blue} />
              <Stat icon="❌" label="Rejected" value={rejected} color={C.red} />
              <Stat icon="🚩" label="Flagged" value={flagged} color={C.orange} sub={flagged > 0 ? "Needs review" : "None flagged ✓"} subColor={flagged > 0 ? C.orange : C.green} />
              <Stat icon="⭐" label="Featured" value={featured} color={C.gold} sub="Pinned to homepage" />
            </div>

            {/* STATS ROW 2 */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <Stat icon="👁️" label="Total Views" value={totalViews.toLocaleString()} color={C.teal} />
              <Stat icon="👥" label="Active Writers" value={activeWriters} color={C.accent} sub={writers.length + " total registered"} />
              <Stat icon="📊" label="Approval Rate" value={approvalRate + "%"} color={approvalRate > 60 ? C.green : C.red} sub={articles.length + " total submissions"} />
              <Stat icon="🏆" label="Top Category" value={topCat} color={CAT_COLOR[topCat] || C.accent} sub={catCounts[topCat] + " articles"} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* RECENT SUBMISSIONS */}
              <div style={{ background: C.card, borderRadius: 12, padding: 18, border: "1px solid " + C.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>🕐 Recent Submissions</div>
                  <button onClick={function() { setTab("submissions"); }} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 11 }}>View all →</button>
                </div>
                {loading ? <div style={{ color: C.gray, fontSize: 13, textAlign: "center", padding: 20 }}>Loading...</div>
                  : articles.length === 0 ? <Empty icon="📭" title="No submissions yet." sub="Articles from the website appear here." />
                  : articles.slice(0, 6).map(function(a) {
                      return (
                        <div key={a.id} onClick={function() { setTab("submissions"); setOpenId(a.id); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + C.border, cursor: "pointer" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: C.white, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.headline || "Untitled"}</div>
                            <div style={{ color: C.gray, fontSize: 10, marginTop: 2 }}>{a.name} · {timeAgo(a.created_at)}</div>
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            {a.featured && <span style={{ fontSize: 11 }}>⭐</span>}
                            {a.flagged && <span style={{ fontSize: 11 }}>🚩</span>}
                            <Chip text={(a.status || "pending").slice(0, 3).toUpperCase()} color={a.status === "approved" ? C.green : a.status === "rejected" ? C.red : a.status === "scheduled" ? C.blue : C.gold} />
                          </div>
                        </div>
                      );
                    })
                }
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* CHECKLIST */}
                <div style={{ background: C.card, borderRadius: 12, padding: 18, border: "1px solid " + C.border }}>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>✅ Editorial Checklist</div>
                  {[
                    ["Review all pending submissions", pending === 0],
                    ["Clear flagged content", flagged === 0],
                    ["Feature at least one article", featured > 0],
                    ["Have active writers on board", activeWriters > 0],
                    ["Publish article this week", articles.filter(function(a) { return a.status === "approved" && a.created_at && new Date(a.created_at) > new Date(Date.now() - 86400000 * 7); }).length > 0],
                    ["Set a breaking news ticker", !!(settings.tickerMsg && settings.tickerMsg.trim())],
                    ["Site is NOT in maintenance mode", !settings.maintenanceMode],
                  ].map(function(item) {
                    return (
                      <div key={item[0]} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0", borderBottom: "1px solid " + C.border }}>
                        <span style={{ fontSize: 12, flexShrink: 0 }}>{item[1] ? "✅" : "⬜"}</span>
                        <span style={{ color: item[1] ? C.muted : C.white, fontSize: 11, textDecoration: item[1] ? "line-through" : "none" }}>{item[0]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* QUICK ACTIONS */}
                <div style={{ background: "linear-gradient(135deg,rgba(123,47,255,0.14),rgba(30,144,255,0.06))", borderRadius: 12, padding: 16, border: "1px solid rgba(123,47,255,0.3)" }}>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>⚡ Quick Actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[["✍️ Write Article","publish"],["📥 Submissions","submissions"],["👥 Add Writer","writers"],["📊 Edit Poll","polls"],["📈 Analytics","analytics"],["⚙️ Settings","settings"]].map(function(a) {
                      return <button key={a[0]} onClick={function() { setTab(a[1]); }} style={{ padding: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid " + C.border, borderRadius: 7, color: C.white, cursor: "pointer", fontSize: 11, fontWeight: 600, textAlign: "center", transition: "background 0.15s" }}>{a[0]}</button>;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECOND ROW */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {/* TOP WRITERS */}
              <div style={{ background: C.card, borderRadius: 12, padding: 18, border: "1px solid " + C.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>🏆 Top Writers</div>
                  <button onClick={function() { setTab("writers"); }} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 11 }}>Manage →</button>
                </div>
                {writers.length === 0 ? <div style={{ color: C.gray, fontSize: 12, textAlign: "center", padding: 16 }}>No writers yet.</div>
                  : topWriters.map(function(w, i) {
                      return (
                        <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + C.border }}>
                          <span style={{ color: i === 0 ? C.gold : C.gray, fontSize: 16, width: 20 }}>{"#" + (i + 1)}</span>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{(w.name || "?")[0].toUpperCase()}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>{w.name}</div>
                            <div style={{ color: C.gray, fontSize: 10 }}>{w.articles || 0} articles</div>
                          </div>
                        </div>
                      );
                    })
                }
                {writers.length === 0 && <button onClick={function() { setTab("writers"); }} style={{ width: "100%", padding: "8px", marginTop: 8, background: C.grad, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Add First Writer</button>}
              </div>

              {/* CATEGORY BREAKDOWN */}
              <div style={{ background: C.card, borderRadius: 12, padding: 18, border: "1px solid " + C.border }}>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📊 Published by Category</div>
                {CATS.map(function(cat) {
                  var cnt = catCounts[cat] || 0;
                  var pct = approved > 0 ? Math.round((cnt / approved) * 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                        <span style={{ color: CAT_COLOR[cat] || C.gray, fontWeight: 600 }}>{cat}</span>
                        <span style={{ color: C.gray }}>{cnt}</span>
                      </div>
                      <div style={{ background: "#1a1a30", borderRadius: 3, height: 5 }}>
                        <div style={{ width: pct + "%", height: "100%", background: CAT_COLOR[cat] || C.accent, borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SITE HEALTH */}
              <div style={{ background: C.card, borderRadius: 12, padding: 18, border: "1px solid " + C.border }}>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🏥 Site Health</div>
                {[
                  ["Website Live", !settings.maintenanceMode, "Turn off maintenance mode"],
                  ["Ticker Message Set", !!(settings.tickerMsg && settings.tickerMsg.trim()), "Add a message in Settings"],
                  ["Writers Active", activeWriters > 0, "Add writers in Writers tab"],
                  ["Articles Published", approved > 0, "Publish your first article"],
                  ["Featured Article Set", featured > 0, "Feature an article in Submissions"],
                  ["Poll Active", !!(pollQ && pollOpts.length > 1), "Set up poll in Polls tab"],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid " + C.border }}>
                      <span style={{ fontSize: 14 }}>{item[1] ? "🟢" : "🔴"}</span>
                      <div>
                        <div style={{ color: item[1] ? C.white : C.gray, fontSize: 12, fontWeight: 600 }}>{item[0]}</div>
                        {!item[1] && <div style={{ color: C.muted, fontSize: 10 }}>{item[2]}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ──── SUBMISSIONS ──── */}
        {tab === "submissions" && (
          <div>
            <SectionHead title="📥 Submissions" sub={filtered.length + " article(s) found"}
              actions={[<button key="r" onClick={loadArticles} style={{ padding: "7px 14px", background: C.card, border: "1px solid " + C.border, borderRadius: 7, color: C.accent, cursor: "pointer", fontSize: 12 }}>🔄 Refresh</button>]} />

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Search by title or author..." style={{ flex: 1, minWidth: 200, padding: "9px 14px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, color: C.white, fontSize: 13, outline: "none", fontFamily: "Inter,sans-serif" }} />
              <select value={fStatus} onChange={function(e) { setFStatus(e.target.value); }} style={{ padding: "9px 12px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, color: C.gray, fontSize: 12, outline: "none" }}>
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
                <option value="scheduled">🗓️ Scheduled</option>
              </select>
              <select value={fCat} onChange={function(e) { setFCat(e.target.value); }} style={{ padding: "9px 12px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, color: C.gray, fontSize: 12, outline: "none" }}>
                <option value="all">All Categories</option>
                {CATS.map(function(c) { return <option key={c} value={c}>{c}</option>; })}
              </select>
            </div>

            {/* EDIT PANEL */}
            {editArt && (
              <div style={{ background: C.card, borderRadius: 12, padding: 22, border: "2px solid " + C.accent + "60", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>✏️ Editing: {editArt.headline}</div>
                  <button onClick={function() { setEditArt(null); }} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Field label="Headline"><input value={editArt.headline || ""} onChange={function(e) { var v = e.target.value; setEditArt(function(a) { return Object.assign({}, a, { headline: v }); }); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} /></Field>
                  </div>
                  <div>
                    <Field label="Category">
                      <select value={editArt.category || ""} onChange={function(e) { var v = e.target.value; setEditArt(function(a) { return Object.assign({}, a, { category: v }); }); }} style={Object.assign({}, fieldStyle, { borderColor: C.border, color: C.white })}>
                        {CATS.map(function(c) { return <option key={c} value={c}>{c}</option>; })}
                      </select>
                    </Field>
                  </div>
                  <div>
                    <Field label="Author Name"><input value={editArt.name || ""} onChange={function(e) { var v = e.target.value; setEditArt(function(a) { return Object.assign({}, a, { name: v }); }); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} /></Field>
                  </div>
                  <div>
                    <Field label="School"><input value={editArt.school || ""} onChange={function(e) { var v = e.target.value; setEditArt(function(a) { return Object.assign({}, a, { school: v }); }); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} /></Field>
                  </div>
                </div>
                <Field label="Article Body">
                  <textarea value={editArt.body || ""} onChange={function(e) { var v = e.target.value; setEditArt(function(a) { return Object.assign({}, a, { body: v }); }); }} rows={6} style={Object.assign({}, fieldStyle, { borderColor: C.border, resize: "vertical", fontFamily: "Georgia,serif", lineHeight: 1.7, fontSize: 14 })} />
                </Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={saveEdit} style={{ flex: 1, padding: "10px", background: C.grad, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>💾 Save Changes</button>
                  <button onClick={function() { setEditArt(null); }} style={{ padding: "10px 18px", background: "transparent", border: "1px solid " + C.border, borderRadius: 8, color: C.gray, cursor: "pointer", fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            )}

            {loading ? <div style={{ color: C.gray, textAlign: "center", padding: 50, fontSize: 13 }}>Loading submissions...</div>
              : filtered.length === 0
                ? <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border }}><Empty icon="📭" title="No articles found." sub="Submissions from the website appear here." /></div>
                : filtered.map(function(a) {
                    var open = openId === a.id;
                    return (
                      <div key={a.id} style={{ background: open ? C.cardHover : C.card, borderRadius: 11, padding: "13px 16px", marginBottom: 8, border: "1px solid " + (a.flagged ? C.red : a.featured ? C.gold : open ? C.accent : C.border), transition: "all 0.15s" }}>
                        <div onClick={function() { setOpenId(open ? null : a.id); }} style={{ cursor: "pointer" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6, alignItems: "center" }}>
                            {a.featured && <Chip text="⭐ Featured" color={C.gold} />}
                            {a.flagged && <Chip text="🚩 Flagged" color={C.red} />}
                            {a.image_url && <Chip text="📷 Image" color={C.blue} />}
                            <Chip text={(a.status || "pending").toUpperCase()} color={a.status === "approved" ? C.green : a.status === "rejected" ? C.red : a.status === "scheduled" ? C.blue : C.gold} />
                            <Chip text={a.category || "Uncategorized"} color={CAT_COLOR[a.category] || C.gray} />
                            <span style={{ color: C.muted, fontSize: 10, marginLeft: "auto" }}>{timeAgo(a.created_at)}</span>
                          </div>
                          <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{a.headline || "Untitled"}</div>
                          <div style={{ color: C.gray, fontSize: 12 }}>by {a.name || "Unknown"} · {a.school || "—"} · {fmtDate(a.created_at)}</div>
                        </div>
                        {open && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid " + C.border }}>
                            {a.image_url && <img src={a.image_url} alt="img" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, marginBottom: 12, display: "block" }} />}
                            <p style={{ color: C.gray, fontSize: 13, lineHeight: 1.7, marginBottom: 12, whiteSpace: "pre-wrap" }}>{a.body ? (a.body.length > 500 ? a.body.slice(0, 500) + "…" : a.body) : "No body."}</p>
                            {a.email && <div style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>📧 {a.email}</div>}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button onClick={function() { setStatus(a.id, "approved"); }} style={{ padding: "8px 14px", background: C.green, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✅ Approve</button>
                              <button onClick={function() { setStatus(a.id, "rejected"); }} style={{ padding: "8px 14px", background: C.red, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>❌ Reject</button>
                              <button onClick={function() { setStatus(a.id, "pending"); }} style={{ padding: "8px 14px", background: C.gold, border: "none", borderRadius: 7, color: "#000", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🔄 Pending</button>
                              <button onClick={function() { setEditArt(a); }} style={{ padding: "8px 14px", background: C.accent, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✏️ Edit</button>
                              <button onClick={function() { toggleFeature(a.id, a.featured); }} style={{ padding: "8px 14px", background: "transparent", border: "1px solid " + C.gold, borderRadius: 7, color: C.gold, cursor: "pointer", fontSize: 12 }}>{a.featured ? "Unpin" : "⭐ Pin"}</button>
                              <button onClick={function() { toggleFlag(a.id, a.flagged); }} style={{ padding: "8px 14px", background: "transparent", border: "1px solid " + C.orange, borderRadius: 7, color: C.orange, cursor: "pointer", fontSize: 12 }}>{a.flagged ? "Unflag" : "🚩 Flag"}</button>
                              <button onClick={function() { if (window.confirm("Delete this article?")) deleteArticle(a.id); }} style={{ padding: "8px 12px", background: "transparent", border: "1px solid " + C.border, borderRadius: 7, color: C.gray, cursor: "pointer", fontSize: 12 }}>🗑️</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
            }
          </div>
        )}

        {/* ──── PUBLISH ──── */}
        {tab === "publish" && (
          <div>
            <SectionHead title="✍️ Publish Article" sub="Write and publish directly to KrynoluxDC." />
            <div style={{ background: C.card, borderRadius: 12, padding: 26, border: "1px solid " + C.border, maxWidth: 740 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Headline" required><input value={aTitle} onChange={function(e) { setATitle(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="Article headline" /></Field>
                <Field label="Category"><select value={aCat} onChange={function(e) { setACat(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border, color: C.white })}>{CATS.map(function(c) { return <option key={c} value={c}>{c}</option>; })}</select></Field>
                <Field label="Author Name" required><input value={aAuthor} onChange={function(e) { setAAuthor(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="Author name" /></Field>
                <Field label="School / Organization"><input value={aSchool} onChange={function(e) { setASchool(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="School or organization" /></Field>
              </div>
              <Field label="Article Body">
                <textarea value={aBody} onChange={function(e) { setABody(e.target.value); }} rows={9} placeholder="Write the full article here..." style={Object.assign({}, fieldStyle, { borderColor: C.border, resize: "vertical", fontFamily: "Georgia,serif", lineHeight: 1.8, fontSize: 15 })} />
                <div style={{ color: C.muted, fontSize: 10, marginTop: -6 }}>{aBody.split(" ").filter(Boolean).length} words</div>
              </Field>
              <Field label="📷 Cover Image">
                <div style={{ border: "2px dashed " + C.border, borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer" }} onClick={function() { document.getElementById("imgup").click(); }}>
                  {aImgPreview
                    ? <img src={aImgPreview} alt="Preview" style={{ maxHeight: 180, borderRadius: 8, objectFit: "cover", maxWidth: "100%", display: "block", margin: "0 auto" }} />
                    : <div><div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div><div style={{ color: C.gray, fontSize: 13 }}>Click to upload a cover image</div><div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>JPG · PNG · WEBP</div></div>
                  }
                  <input id="imgup" type="file" accept="image/*" style={{ display: "none" }} onChange={onImgSelect} />
                </div>
                {aImgPreview && <button onClick={function() { setAImgFile(null); setAImgPreview(""); setAImgUrl(""); }} style={{ padding: "4px 12px", background: "transparent", border: "1px solid " + C.red, borderRadius: 5, color: C.red, cursor: "pointer", fontSize: 11, marginTop: 6 }}>Remove</button>}
              </Field>
              <Field label="Or paste image URL"><input value={aImgUrl} onChange={function(e) { setAImgUrl(e.target.value); if (e.target.value) setAImgPreview(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="https://..." /></Field>
              <Field label="🗓️ Schedule for later (leave blank to publish now)"><input type="datetime-local" value={aDate} onChange={function(e) { setADate(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} /></Field>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", marginBottom: 14, borderTop: "1px solid " + C.border }}>
                <div>
                  <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>⭐ Pin to Homepage Featured Slot</div>
                  <div style={{ color: C.gray, fontSize: 11, marginTop: 2 }}>Shows this article prominently on the homepage</div>
                </div>
                <Toggle value={aFeatured} onChange={function() { setAFeatured(!aFeatured); }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={publish} disabled={imgUploading} style={{ flex: 1, padding: "12px", background: imgUploading ? C.muted : C.grad, border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700, cursor: imgUploading ? "not-allowed" : "pointer" }}>
                  {imgUploading ? "Uploading image..." : aDate ? "🗓️ Schedule Article" : "🚀 Publish Now"}
                </button>
                <button onClick={function() { setATitle(""); setAAuthor(""); setASchool(""); setABody(""); setADate(""); setACat("Local News"); setAImgFile(null); setAImgPreview(""); setAImgUrl(""); setAFeatured(false); }} style={{ padding: "12px 18px", background: "transparent", border: "1px solid " + C.border, borderRadius: 9, color: C.gray, cursor: "pointer", fontSize: 13 }}>Clear</button>
              </div>
            </div>
          </div>
        )}

        {/* ──── MEDIA ──── */}
        {tab === "media" && (
          <div>
            <SectionHead title="🖼️ Media Library" sub={articles.filter(function(a) { return a.image_url; }).length + " images attached to articles."} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
              {articles.filter(function(a) { return a.image_url; }).map(function(a) {
                return (
                  <div key={a.id} style={{ background: C.card, borderRadius: 10, overflow: "hidden", border: "1px solid " + C.border }}>
                    <img src={a.image_url} alt={a.headline} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{ color: C.white, fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.headline || "Untitled"}</div>
                      <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{fmtDate(a.created_at)}</div>
                      <Chip text={a.category || "News"} color={CAT_COLOR[a.category] || C.gray} />
                    </div>
                  </div>
                );
              })}
              {articles.filter(function(a) { return a.image_url; }).length === 0 && (
                <div style={{ gridColumn: "1/-1", background: C.card, borderRadius: 12, border: "1px solid " + C.border }}>
                  <Empty icon="🖼️" title="No images yet." sub="Images uploaded with articles will appear here." />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──── WRITERS ──── */}
        {tab === "writers" && (
          <div>
            <SectionHead title="👥 Writers" sub={writers.length + " journalist(s) registered · " + activeWriters + " active"} />
            <div style={{ background: C.card, borderRadius: 12, padding: 22, border: "1px solid " + C.border, maxWidth: 560, marginBottom: 24 }}>
              <div style={{ color: C.white, fontWeight: 700, marginBottom: 16, fontSize: 15 }}>➕ Add New Writer</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Full Name" required>
                  <input value={wName} onChange={function(e) { setWName(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="Full name" />
                </Field>
                <Field label="School">
                  <input value={wSchool} onChange={function(e) { setWSchool(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="School" />
                </Field>
              </div>
              <Field label="Email Address" required>
                <input value={wEmail} onChange={function(e) { setWEmail(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="writer@email.com" type="email" />
              </Field>
              <Field label="Starting Badge">
                <select value={wBadge} onChange={function(e) { setWBadge(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border, color: C.white })}>
                  {BADGES.map(function(b) { return <option key={b} value={b}>{b}</option>; })}
                </select>
              </Field>
              <button onClick={addWriter} disabled={wAdding} style={{ width: "100%", padding: "11px", background: wAdding ? C.muted : C.grad, border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700, cursor: wAdding ? "not-allowed" : "pointer" }}>
                {wAdding ? "Adding writer..." : "➕ Add Writer"}
              </button>
            </div>
            {writers.length === 0
              ? <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border }}><Empty icon="👤" title="No writers yet." sub="Use the form above to add your first student journalist." /></div>
              : writers.map(function(w) {
                  return (
                    <div key={w.id} style={{ background: C.card, borderRadius: 11, padding: "14px 18px", marginBottom: 8, border: "1px solid " + (w.status === "suspended" ? C.red : C.border) }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                            {(w.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>{w.name}</div>
                            <div style={{ color: C.gray, fontSize: 12 }}>{w.school || "—"} · {w.email || "—"}</div>
                            <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                              <Chip text={w.badge || "Writer"} color={C.accent} />
                              <Chip text={(w.status || "active").toUpperCase()} color={w.status === "active" ? C.green : C.red} />
                              <Chip text={(w.articles || 0) + " articles"} color={C.blue} />
                              <Chip text={"Joined " + fmtDate(w.created_at)} color={C.muted} />
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                          <select onChange={function(e) { updateWriterBadge(w.id, e.target.value); }} value={w.badge || "New Writer"} style={{ padding: "6px 10px", background: C.bg, border: "1px solid " + C.border, borderRadius: 7, color: C.gray, fontSize: 11, outline: "none", cursor: "pointer" }}>
                            {BADGES.map(function(b) { return <option key={b} value={b}>{b}</option>; })}
                          </select>
                          <button onClick={function() { toggleWriter(w.id, w.status); }} style={{ padding: "7px 12px", background: "transparent", border: "1px solid " + (w.status === "active" ? C.red : C.green), borderRadius: 7, color: w.status === "active" ? C.red : C.green, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                            {w.status === "active" ? "Suspend" : "Restore"}
                          </button>
                          <button onClick={function() { if (window.confirm("Remove " + w.name + "?")) deleteWriter(w.id); }} style={{ padding: "7px 10px", background: "transparent", border: "1px solid " + C.border, borderRadius: 7, color: C.gray, cursor: "pointer" }}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ──── POLLS ──── */}
        {tab === "polls" && (
          <div>
            <SectionHead title="📊 Poll Manager" sub="Control the community poll shown on the website." />
            <div style={{ background: C.card, borderRadius: 12, padding: 24, border: "1px solid " + C.border, maxWidth: 560 }}>
              <Field label="Poll Question">
                <input value={pollQ} onChange={function(e) { setPollQ(e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="What should we cover more?" />
              </Field>
              <Field label={"Answer Options (" + pollOpts.length + "/6)"}>
                {pollOpts.map(function(opt, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <span style={{ color: C.muted, fontSize: 12, width: 16, flexShrink: 0 }}>{i + 1}.</span>
                      <input value={opt} onChange={function(e) { var v = e.target.value; setPollOpts(function(o) { var n = o.slice(); n[i] = v; return n; }); }} style={Object.assign({}, fieldStyle, { marginBottom: 0, flex: 1, borderColor: C.border })} placeholder={"Option " + (i + 1)} />
                      {pollOpts.length > 2 && <button onClick={function() { setPollOpts(function(o) { return o.filter(function(_, j) { return j !== i; }); }); }} style={{ padding: "8px 12px", background: "transparent", border: "1px solid " + C.border, borderRadius: 6, color: C.red, cursor: "pointer", flexShrink: 0 }}>✕</button>}
                    </div>
                  );
                })}
                {pollOpts.length < 6 && (
                  <button onClick={function() { setPollOpts(function(o) { return o.concat([""]); }); }} style={{ padding: "7px 14px", background: "transparent", border: "1px dashed " + C.border, borderRadius: 7, color: C.gray, cursor: "pointer", fontSize: 12, marginTop: 4, width: "100%" }}>+ Add Option</button>
                )}
              </Field>
              <button onClick={savePoll} style={{ width: "100%", padding: "11px", background: C.grad, border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📊 Save Poll to Website</button>
            </div>
          </div>
        )}

        {/* ──── ANALYTICS ──── */}
        {tab === "analytics" && (
          <div>
            <SectionHead title="📈 Analytics" sub="KrynoluxDC performance overview." />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <Stat icon="👁️" label="Total Views" value={totalViews.toLocaleString()} color={C.teal} />
              <Stat icon="📰" label="Published" value={approved} color={C.green} />
              <Stat icon="✍️" label="Active Writers" value={activeWriters} color={C.blue} />
              <Stat icon="📥" label="Pending" value={pending} color={C.gold} />
              <Stat icon="📊" label="Approval Rate" value={approvalRate + "%"} color={approvalRate > 60 ? C.green : C.red} />
              <Stat icon="⭐" label="Featured" value={featured} color={C.gold} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: C.card, borderRadius: 12, padding: 20, border: "1px solid " + C.border }}>
                <div style={{ color: C.white, fontWeight: 700, marginBottom: 14, fontSize: 14 }}>🔥 Top Articles by Views</div>
                {articles.filter(function(a) { return a.status === "approved"; }).length === 0
                  ? <Empty icon="📊" title="No published articles." sub="Publish your first article to see analytics." />
                  : articles.filter(function(a) { return a.status === "approved"; }).sort(function(a, b) { return (b.views || 0) - (a.views || 0); }).slice(0, 7).map(function(a, i) {
                      return (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid " + C.border }}>
                          <div style={{ color: i < 3 ? C.gold : C.muted, fontWeight: 900, fontSize: 16, width: 22 }}>{"#" + (i + 1)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: C.white, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.headline || "Untitled"}</div>
                            <div style={{ color: C.gray, fontSize: 11 }}>{a.name} · {a.category}</div>
                          </div>
                          <div style={{ color: C.teal, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{(a.views || 0).toLocaleString()}</div>
                        </div>
                      );
                    })
                }
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: C.card, borderRadius: 12, padding: 20, border: "1px solid " + C.border }}>
                  <div style={{ color: C.white, fontWeight: 700, marginBottom: 14, fontSize: 14 }}>📊 Articles by Category</div>
                  {CATS.map(function(cat) {
                    var cnt = catCounts[cat] || 0;
                    var pct = approved > 0 ? Math.round((cnt / approved) * 100) : 0;
                    return (
                      <div key={cat} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                          <span style={{ color: CAT_COLOR[cat] || C.gray, fontWeight: 600 }}>{cat}</span>
                          <span style={{ color: C.gray }}>{cnt} ({pct}%)</span>
                        </div>
                        <div style={{ background: "#1a1a30", borderRadius: 3, height: 6 }}>
                          <div style={{ width: pct + "%", height: "100%", background: CAT_COLOR[cat] || C.accent, borderRadius: 3, transition: "width 0.5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: C.card, borderRadius: 12, padding: 20, border: "1px solid " + C.border }}>
                  <div style={{ color: C.white, fontWeight: 700, marginBottom: 14, fontSize: 14 }}>📋 Submission Summary</div>
                  {[["Total Submissions", articles.length, C.white],["Published", approved, C.green],["Pending", pending, C.gold],["Rejected", rejected, C.red],["Scheduled", scheduled, C.blue],["Flagged", flagged, C.orange]].map(function(row) {
                    return (
                      <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid " + C.border }}>
                        <span style={{ color: C.gray, fontSize: 13 }}>{row[0]}</span>
                        <span style={{ color: row[2], fontWeight: 700, fontSize: 13 }}>{row[1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──── SETTINGS ──── */}
        {tab === "settings" && (
          <div>
            <SectionHead title="⚙️ Site Settings" sub="Control the website without touching any code." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900 }}>

              <div style={{ background: C.card, borderRadius: 12, padding: 22, border: "1px solid " + C.border, gridColumn: "span 2" }}>
                <div style={{ color: C.white, fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🌐 General</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Site Name"><input value={settings.siteName || ""} onChange={function(e) { setSetting("siteName", e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} /></Field>
                  <Field label="Tagline"><input value={settings.tagline || ""} onChange={function(e) { setSetting("tagline", e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} /></Field>
                  <Field label="Contact Email"><input value={settings.contactEmail || ""} onChange={function(e) { setSetting("contactEmail", e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} /></Field>
                  <Field label="Coverage Area"><input value={settings.coverageArea || ""} onChange={function(e) { setSetting("coverageArea", e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="Fairfax, Loudoun, DC" /></Field>
                </div>
              </div>

              <div style={{ background: C.card, borderRadius: 12, padding: 22, border: "1px solid " + C.border }}>
                <div style={{ color: C.white, fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📢 Announcements</div>
                <Field label="Breaking News Ticker (blank = hidden)">
                  <input value={settings.tickerMsg || ""} onChange={function(e) { setSetting("tickerMsg", e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="Breaking news or update..." />
                </Field>
                <Field label="Site-Wide Banner (blank = hidden)">
                  <input value={settings.announcementBanner || ""} onChange={function(e) { setSetting("announcementBanner", e.target.value); }} style={Object.assign({}, fieldStyle, { borderColor: C.border })} placeholder="Announcement message..." />
                </Field>
                <Field label="Banner Background Color">
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="color" value={settings.announcementColor || "#7B2FFF"} onChange={function(e) { setSetting("announcementColor", e.target.value); }} style={{ width: 44, height: 36, borderRadius: 6, border: "1px solid " + C.border, background: "transparent", cursor: "pointer", padding: 2 }} />
                    <span style={{ color: C.gray, fontSize: 12 }}>{settings.announcementColor}</span>
                  </div>
                </Field>
              </div>

              <div style={{ background: C.card, borderRadius: 12, padding: 22, border: "1px solid " + C.border }}>
                <div style={{ color: C.white, fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🎛️ Feature Toggles</div>
                {[
                  ["showWeather","Show Weather Widget","Displays live DMV weather on the homepage"],
                  ["showPoll","Show Community Poll","Displays the reader poll widget"],
                ].map(function(item) {
                  return (
                    <div key={item[0]} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid " + C.border }}>
                      <div>
                        <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{item[1]}</div>
                        <div style={{ color: C.gray, fontSize: 11, marginTop: 2 }}>{item[2]}</div>
                      </div>
                      <Toggle value={settings[item[0]] !== false} onChange={function() { setSetting(item[0], !settings[item[0]]); }} />
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                  <div>
                    <div style={{ color: C.red, fontSize: 13, fontWeight: 700 }}>🔴 Maintenance Mode</div>
                    <div style={{ color: C.gray, fontSize: 11, marginTop: 2 }}>Hides the entire website from all visitors</div>
                  </div>
                  <Toggle value={settings.maintenanceMode || false} onChange={function() { setSetting("maintenanceMode", !settings.maintenanceMode); }} />
                </div>
              </div>

              <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={saveSettings} disabled={settingsSaving} style={{ padding: "12px 28px", background: settingsSaved ? C.green : settingsSaving ? C.muted : C.grad, border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700, cursor: settingsSaving ? "not-allowed" : "pointer", transition: "background 0.3s", minWidth: 180 }}>
                  {settingsSaving ? "Saving..." : settingsSaved ? "✅ Settings Saved!" : "💾 Save All Settings"}
                </button>
                <span style={{ color: C.muted, fontSize: 12 }}>Changes go live on the website immediately after saving.</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}