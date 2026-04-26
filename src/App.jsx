import { useState } from "react";

const C = {
  navy: "#0A0F2C", accent: "#00D4FF", neon: "#7B2FFF",
  white: "#F0F4FF", gray: "#8892B0", card: "#0F1A3E",
  cardHover: "#162040", red: "#FF3B5C", gold: "#FFD700", green: "#00C853",
};

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;
const CATS = ["Local News","Schools","Sports","Events","Student Spotlight","Opinion","Weather"];

const inputStyle = {
  width: "100%", padding: "10px 14px", background: "#0a0f2c",
  border: "1px solid #1a2a5e", borderRadius: 8, color: "#F0F4FF",
  fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10,
};

function Chip(props) {
  return (
    <span style={{
      background: props.color + "33", color: props.color,
      border: "1px solid " + props.color + "55",
      fontSize: 11, fontWeight: 700, padding: "2px 8px",
      borderRadius: 4, letterSpacing: 0.5,
    }}>
      {props.text}
    </span>
  );
}

function Stat(props) {
  return (
    <div style={{ background: C.card, borderRadius: 12, padding: "16px 18px", border: "1px solid #1a2a5e", flex: 1, minWidth: 100 }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{props.icon}</div>
      <div style={{ color: props.color || C.accent, fontWeight: 900, fontSize: 24 }}>{props.value}</div>
      <div style={{ color: C.gray, fontSize: 12 }}>{props.label}</div>
    </div>
  );
}

function Empty(props) {
  return (
    <div style={{ textAlign: "center", padding: "44px 20px" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{props.icon}</div>
      <div style={{ color: C.white, fontWeight: 600, marginBottom: 6 }}>{props.title}</div>
      <div style={{ color: C.gray, fontSize: 13 }}>{props.sub}</div>
    </div>
  );
}

function Login(props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [tries, setTries] = useState(0);

  function submit() {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      props.onLogin();
    } else {
      const n = tries + 1;
      setTries(n);
      setErr(n >= 3 ? "Too many attempts." : "Wrong credentials. " + (3 - n) + " left.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: C.card, borderRadius: 20, padding: "40px 34px", width: "100%", maxWidth: 370, border: "1px solid #1a2a5e" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: "linear-gradient(135deg,#7B2FFF,#00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, color: "#fff", margin: "0 auto 10px" }}>K</div>
          <div style={{ fontWeight: 900, fontSize: 19, color: C.accent }}>KrynoluxDC CMS</div>
          <div style={{ color: C.gray, fontSize: 12, marginTop: 3 }}>Authorized Personnel Only</div>
        </div>
        <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Username</label>
        <input
          value={user}
          onChange={function(e) { setUser(e.target.value); }}
          placeholder="Enter username"
          autoComplete="off"
          style={Object.assign({}, inputStyle, { border: "1px solid " + (err ? C.red : "#1a2a5e") })}
        />
        <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Password</label>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            value={pass}
            onChange={function(e) { setPass(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") { submit(); } }}
            type={show ? "text" : "password"}
            placeholder="Enter password"
            autoComplete="off"
            style={Object.assign({}, inputStyle, { marginBottom: 0, paddingRight: 40, border: "1px solid " + (err ? C.red : "#1a2a5e") })}
          />
          <span
            onClick={function() { setShow(!show); }}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.gray }}
          >
            {show ? "🙈" : "👁️"}
          </span>
        </div>
        {err ? <div style={{ background: C.red + "22", border: "1px solid " + C.red + "44", borderRadius: 8, padding: "8px 12px", color: C.red, fontSize: 12, marginBottom: 12 }}>⚠️ {err}</div> : null}
        <button
          onClick={submit}
          style={{ width: "100%", padding: "12px", background: "linear-gradient(90deg,#7B2FFF,#00D4FF)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          🔐 Sign In
        </button>
        <div style={{ textAlign: "center", marginTop: 14, color: C.gray, fontSize: 11 }}>🔒 KrynoluxDC Secured System</div>
      </div>
    </div>
  );
}

export default function CMS() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [articles, setArticles] = useState([]);
  const [writers, setWriters] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [toast, setToast] = useState(null);
  const [aTitle, setATitle] = useState("");
  const [aAuthor, setAAuthor] = useState("");
  const [aSchool, setASchool] = useState("");
  const [aCat, setACat] = useState("Local News");
  const [aBody, setABody] = useState("");
  const [aDate, setADate] = useState("");
  const [wName, setWName] = useState("");
  const [wSchool, setWSchool] = useState("");
  const [wEmail, setWEmail] = useState("");

  function toast_(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 3000);
  }

  function setStatus(id, status) {
    setArticles(function(arr) {
      return arr.map(function(x) {
        return x.id === id ? Object.assign({}, x, { status: status }) : x;
      });
    });
    toast_(
      status === "approved" ? "Published!" : status === "rejected" ? "Rejected." : "Set to pending.",
      status === "approved" ? C.green : status === "rejected" ? C.red : C.gold
    );
    setOpenId(null);
  }

  function flagToggle(id) {
    setArticles(function(arr) {
      return arr.map(function(x) {
        return x.id === id ? Object.assign({}, x, { flagged: !x.flagged }) : x;
      });
    });
  }

  function delArticle(id) {
    setArticles(function(arr) { return arr.filter(function(x) { return x.id !== id; }); });
    toast_("Deleted.", C.red);
    setOpenId(null);
  }

  function suspendToggle(id) {
    setWriters(function(arr) {
      return arr.map(function(x) {
        return x.id === id ? Object.assign({}, x, { status: x.status === "active" ? "suspended" : "active" }) : x;
      });
    });
    toast_("Writer updated.");
  }

  function delWriter(id) {
    setWriters(function(arr) { return arr.filter(function(x) { return x.id !== id; }); });
    toast_("Writer removed.", C.red);
  }

  function addWriter() {
    if (!wName || !wEmail) { toast_("Name and email required.", C.red); return; }
    setWriters(function(arr) {
      return [{ id: Date.now(), name: wName, school: wSchool, email: wEmail, articles: 0, badge: "New Writer", joined: new Date().toISOString().slice(0, 10), status: "active" }].concat(arr);
    });
    setWName(""); setWSchool(""); setWEmail("");
    toast_("Writer added!");
  }

  function publish() {
    if (!aTitle || !aAuthor) { toast_("Title and author required.", C.red); return; }
    setArticles(function(arr) {
      return [{
        id: Date.now(), title: aTitle, author: aAuthor, school: aSchool,
        category: aCat, summary: aBody, flagged: false, views: 0,
        status: aDate ? "scheduled" : "approved",
        submitted: new Date().toISOString().slice(0, 16).replace("T", " "),
      }].concat(arr);
    });
    setATitle(""); setAAuthor(""); setASchool(""); setABody(""); setADate(""); setACat("Local News");
    toast_(aDate ? "Scheduled!" : "Published live!");
  }

  const pending = articles.filter(function(a) { return a.status === "pending"; }).length;
  const approved = articles.filter(function(a) { return a.status === "approved"; }).length;
  const rejected = articles.filter(function(a) { return a.status === "rejected"; }).length;
  const flagged = articles.filter(function(a) { return a.flagged; }).length;
  const activeW = writers.filter(function(w) { return w.status === "active"; }).length;

  const filtered = articles.filter(function(a) {
    const ms = a.title.toLowerCase().indexOf(search.toLowerCase()) !== -1 || a.author.toLowerCase().indexOf(search.toLowerCase()) !== -1;
    const mf = fStatus === "all" || a.status === fStatus;
    return ms && mf;
  });

  const tabs = [["dashboard","📊","Dashboard"],["submissions","📥","Submissions"],["publish","✍️","Publish"],["writers","👥","Writers"],["analytics","📈","Analytics"]];

  if (!loggedIn) {
    return <Login onLogin={function() { setLoggedIn(true); }} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.navy, fontFamily: "Inter, sans-serif", display: "flex" }}>

      <div style={{ width: 190, background: C.card, borderRight: "1px solid #1a2a5e", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #1a2a5e" }}>
          <div style={{ fontWeight: 900, color: C.accent, fontSize: 15 }}>KrynoluxDC</div>
          <div style={{ color: C.gray, fontSize: 10 }}>CMS Admin Panel</div>
        </div>
        <div style={{ flex: 1, padding: "10px 8px" }}>
          {tabs.map(function(t) {
            return (
              <button key={t[0]} onClick={function() { setTab(t[0]); }} style={{ width: "100%", textAlign: "left", padding: "9px 11px", marginBottom: 3, background: tab === t[0] ? "#7B2FFF22" : "transparent", border: tab === t[0] ? "1px solid #00D4FF44" : "1px solid transparent", borderRadius: 8, color: tab === t[0] ? C.accent : C.gray, cursor: "pointer", fontSize: 13, fontWeight: tab === t[0] ? 700 : 400 }}>
                {t[1]} {t[2]}
              </button>
            );
          })}
        </div>
        <div style={{ padding: "10px 8px", borderTop: "1px solid #1a2a5e" }}>
          {pending > 0 ? <div style={{ background: C.red + "22", border: "1px solid " + C.red + "44", borderRadius: 8, padding: "6px 10px", color: C.red, fontSize: 11, marginBottom: 8 }}>⚠️ {pending} pending</div> : null}
          <button onClick={function() { setLoggedIn(false); }} style={{ width: "100%", padding: "8px", background: "transparent", border: "1px solid #1a2a5e", borderRadius: 8, color: C.gray, cursor: "pointer", fontSize: 12 }}>🚪 Sign Out</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 22 }}>
        {toast ? <div style={{ position: "fixed", top: 18, right: 18, background: toast.color, color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: 14, zIndex: 999 }}>{toast.msg}</div> : null}

        {tab === "dashboard" && (
          <div>
            <h2 style={{ color: C.white, marginBottom: 4 }}>📊 Dashboard</h2>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 18 }}>Welcome back, Admin.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <Stat icon="📥" label="Pending" value={pending} color={C.gold} />
              <Stat icon="✅" label="Published" value={approved} color={C.green} />
              <Stat icon="❌" label="Rejected" value={rejected} color={C.red} />
              <Stat icon="🚩" label="Flagged" value={flagged} color={C.red} />
              <Stat icon="👥" label="Writers" value={writers.length} color={C.accent} />
            </div>
            <div style={{ background: C.card, borderRadius: 14, padding: 18, border: "1px solid #1a2a5e", marginBottom: 16 }}>
              <div style={{ color: C.white, fontWeight: 700, marginBottom: 12 }}>🕐 Recent Submissions</div>
              {articles.length === 0
                ? <Empty icon="📭" title="No submissions yet." sub="Articles will appear here once submitted." />
                : articles.slice(0, 5).map(function(a) {
                    return (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #1a2a5e", cursor: "pointer" }} onClick={function() { setTab("submissions"); setOpenId(a.id); }}>
                        <div>
                          <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{a.title.length > 50 ? a.title.slice(0, 50) + "..." : a.title}</div>
                          <div style={{ color: C.gray, fontSize: 11 }}>{a.author} · {a.submitted}</div>
                        </div>
                        <Chip text={a.status.toUpperCase()} color={a.status === "approved" ? C.green : a.status === "rejected" ? C.red : C.gold} />
                      </div>
                    );
                  })
              }
            </div>
            <div style={{ background: C.card, borderRadius: 14, padding: 18, border: "1px solid #1a2a5e" }}>
              <div style={{ color: C.white, fontWeight: 700, marginBottom: 12 }}>📋 Checklist</div>
              {[
                ["Review pending submissions", pending === 0],
                ["Check flagged content", flagged === 0],
                ["Add student writers", writers.length > 0],
                ["Publish an article today", approved > 0],
              ].map(function(item) {
                return (
                  <div key={item[0]} style={{ display: "flex", gap: 8, alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1a2a5e" }}>
                    <span>{item[1] ? "✅" : "⬜"}</span>
                    <span style={{ color: item[1] ? C.gray : C.white, fontSize: 13, textDecoration: item[1] ? "line-through" : "none" }}>{item[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "submissions" && (
          <div>
            <h2 style={{ color: C.white, marginBottom: 4 }}>📥 Submissions</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Search..." style={{ flex: 1, minWidth: 160, padding: "8px 12px", background: C.card, border: "1px solid #1a2a5e", borderRadius: 8, color: C.white, fontSize: 13, outline: "none" }} />
              {["all","pending","approved","rejected"].map(function(s) {
                return (
                  <button key={s} onClick={function() { setFStatus(s); }} style={{ padding: "8px 12px", background: fStatus === s ? C.accent : C.card, border: "1px solid #1a2a5e", borderRadius: 8, color: fStatus === s ? "#000" : C.gray, cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{s}</button>
                );
              })}
            </div>
            {filtered.length === 0
              ? <div style={{ background: C.card, borderRadius: 14, border: "1px solid #1a2a5e" }}><Empty icon="📭" title="No articles found." sub="Submissions from the website will appear here." /></div>
              : filtered.map(function(a) {
                  const open = openId === a.id;
                  return (
                    <div key={a.id} onClick={function() { setOpenId(open ? null : a.id); }} style={{ background: open ? C.cardHover : C.card, borderRadius: 12, padding: "13px 15px", marginBottom: 8, border: "1px solid " + (a.flagged ? C.red : open ? C.accent : "#1a2a5e"), cursor: "pointer" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                        {a.flagged ? <Chip text="FLAGGED" color={C.red} /> : null}
                        <Chip text={a.status.toUpperCase()} color={a.status === "approved" ? C.green : a.status === "rejected" ? C.red : C.gold} />
                        <Chip text={a.category} color={C.accent} />
                      </div>
                      <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{a.title}</div>
                      <div style={{ color: C.gray, fontSize: 12 }}>by {a.author} · {a.school} · {a.submitted}</div>
                      {open ? (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a2a5e" }}>
                          <p style={{ color: C.gray, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{a.summary || "No body provided."}</p>
                          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                            <button onClick={function(e) { e.stopPropagation(); setStatus(a.id, "approved"); }} style={{ padding: "7px 14px", background: C.green, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✅ Approve</button>
                            <button onClick={function(e) { e.stopPropagation(); setStatus(a.id, "rejected"); }} style={{ padding: "7px 14px", background: C.red, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>❌ Reject</button>
                            <button onClick={function(e) { e.stopPropagation(); setStatus(a.id, "pending"); }} style={{ padding: "7px 14px", background: C.gold, border: "none", borderRadius: 7, color: "#000", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🔄 Pending</button>
                            <button onClick={function(e) { e.stopPropagation(); flagToggle(a.id); }} style={{ padding: "7px 14px", background: "transparent", border: "1px solid " + C.red, borderRadius: 7, color: C.red, cursor: "pointer", fontSize: 12 }}>{a.flagged ? "Unflag" : "🚩 Flag"}</button>
                            <button onClick={function(e) { e.stopPropagation(); delArticle(a.id); }} style={{ padding: "7px 12px", background: "transparent", border: "1px solid #1a2a5e", borderRadius: 7, color: C.gray, cursor: "pointer", fontSize: 12 }}>🗑️</button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })
            }
          </div>
        )}

        {tab === "publish" && (
          <div>
            <h2 style={{ color: C.white, marginBottom: 4 }}>✍️ Publish Article</h2>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 18 }}>Write and publish directly to KrynoluxDC.</p>
            <div style={{ background: C.card, borderRadius: 14, padding: 22, border: "1px solid #1a2a5e", maxWidth: 600 }}>
              <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Headline *</label>
              <input value={aTitle} onChange={function(e) { setATitle(e.target.value); }} style={inputStyle} placeholder="Article headline" />
              <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Author *</label>
              <input value={aAuthor} onChange={function(e) { setAAuthor(e.target.value); }} style={inputStyle} placeholder="Author name" />
              <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>School / Organization</label>
              <input value={aSchool} onChange={function(e) { setASchool(e.target.value); }} style={inputStyle} placeholder="School or organization" />
              <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Category</label>
              <select value={aCat} onChange={function(e) { setACat(e.target.value); }} style={Object.assign({}, inputStyle, { color: C.white })}>
                {CATS.map(function(c) { return <option key={c} value={c}>{c}</option>; })}
              </select>
              <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Article Body</label>
              <textarea value={aBody} onChange={function(e) { setABody(e.target.value); }} rows={5} placeholder="Write the article here..." style={Object.assign({}, inputStyle, { resize: "vertical" })} />
              <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Schedule (optional)</label>
              <input type="datetime-local" value={aDate} onChange={function(e) { setADate(e.target.value); }} style={inputStyle} />
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button onClick={publish} style={{ flex: 1, padding: "12px", background: "linear-gradient(90deg,#7B2FFF,#00D4FF)", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  {aDate ? "🗓️ Schedule" : "🚀 Publish Now"}
                </button>
                <button onClick={function() { setATitle(""); setAAuthor(""); setASchool(""); setABody(""); setADate(""); setACat("Local News"); }} style={{ padding: "12px 16px", background: "transparent", border: "1px solid #1a2a5e", borderRadius: 9, color: C.gray, cursor: "pointer", fontSize: 13 }}>Clear</button>
              </div>
            </div>
          </div>
        )}

        {tab === "writers" && (
          <div>
            <h2 style={{ color: C.white, marginBottom: 4 }}>👥 Writers</h2>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 16 }}>{writers.length} journalist(s) registered.</p>
            <div style={{ background: C.card, borderRadius: 14, padding: 20, border: "1px solid #1a2a5e", maxWidth: 480, marginBottom: 20 }}>
              <div style={{ color: C.white, fontWeight: 700, marginBottom: 12 }}>➕ Add Writer</div>
              <input value={wName} onChange={function(e) { setWName(e.target.value); }} placeholder="Full Name *" style={inputStyle} />
              <input value={wSchool} onChange={function(e) { setWSchool(e.target.value); }} placeholder="School" style={inputStyle} />
              <input value={wEmail} onChange={function(e) { setWEmail(e.target.value); }} placeholder="Email *" style={inputStyle} />
              <button onClick={addWriter} style={{ width: "100%", padding: "10px", background: "linear-gradient(90deg,#7B2FFF,#00D4FF)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add Writer</button>
            </div>
            {writers.length === 0
              ? <div style={{ background: C.card, borderRadius: 14, border: "1px solid #1a2a5e" }}><Empty icon="👤" title="No writers yet." sub="Add your first student journalist above." /></div>
              : writers.map(function(w) {
                  return (
                    <div key={w.id} style={{ background: C.card, borderRadius: 12, padding: "13px 16px", marginBottom: 8, border: "1px solid " + (w.status === "suspended" ? C.red : "#1a2a5e"), display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#7B2FFF,#00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                        <div>
                          <div style={{ color: C.white, fontWeight: 700, fontSize: 14 }}>{w.name}</div>
                          <div style={{ color: C.gray, fontSize: 12 }}>{w.school} · {w.email}</div>
                          <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                            <Chip text={w.badge} color={C.accent} />
                            <Chip text={w.articles + " articles"} color={C.neon} />
                            <Chip text={w.status.toUpperCase()} color={w.status === "active" ? C.green : C.red} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 7 }}>
                        <button onClick={function() { suspendToggle(w.id); }} style={{ padding: "6px 12px", background: "transparent", border: "1px solid " + (w.status === "active" ? C.red : C.green), borderRadius: 7, color: w.status === "active" ? C.red : C.green, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                          {w.status === "active" ? "Suspend" : "Restore"}
                        </button>
                        <button onClick={function() { delWriter(w.id); }} style={{ padding: "6px 10px", background: "transparent", border: "1px solid #1a2a5e", borderRadius: 7, color: C.gray, cursor: "pointer", fontSize: 12 }}>🗑️</button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <h2 style={{ color: C.white, marginBottom: 4 }}>📈 Analytics</h2>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 18 }}>KrynoluxDC site overview.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <Stat icon="👁️" label="Total Views" value={articles.reduce(function(s, a) { return s + a.views; }, 0)} color={C.accent} />
              <Stat icon="📰" label="Published" value={approved} color={C.green} />
              <Stat icon="✍️" label="Active Writers" value={activeW} color={C.neon} />
              <Stat icon="📥" label="Pending" value={pending} color={C.gold} />
            </div>
            <div style={{ background: C.card, borderRadius: 14, padding: 18, border: "1px solid #1a2a5e", marginBottom: 14 }}>
              <div style={{ color: C.white, fontWeight: 700, marginBottom: 12 }}>🔥 Top Articles</div>
              {articles.filter(function(a) { return a.status === "approved"; }).length === 0
                ? <Empty icon="📊" title="No published articles yet." sub="Publish your first article to see analytics." />
                : articles.filter(function(a) { return a.status === "approved"; }).sort(function(a, b) { return b.views - a.views; }).slice(0, 5).map(function(a, i) {
                    return (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #1a2a5e" }}>
                        <div style={{ color: C.accent, fontWeight: 900, fontSize: 17, width: 24 }}>{"#" + (i + 1)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{a.title.length > 50 ? a.title.slice(0, 50) + "..." : a.title}</div>
                          <div style={{ color: C.gray, fontSize: 11 }}>{a.author} · {a.category}</div>
                        </div>
                        <div style={{ color: C.accent, fontWeight: 700, fontSize: 13 }}>{a.views} views</div>
                      </div>
                    );
                  })
              }
            </div>
            <div style={{ background: C.card, borderRadius: 14, padding: 18, border: "1px solid #1a2a5e" }}>
              <div style={{ color: C.white, fontWeight: 700, marginBottom: 12 }}>📊 By Category</div>
              {CATS.map(function(cat) {
                const count = articles.filter(function(a) { return a.category === cat && a.status === "approved"; }).length;
                const pct = approved > 0 ? Math.round((count / approved) * 100) : 0;
                return (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: C.gray, fontSize: 12, marginBottom: 3 }}>
                      <span>{cat}</span><span>{count}</span>
                    </div>
                    <div style={{ background: "#1a2a5e", borderRadius: 5, height: 7 }}>
                      <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg,#7B2FFF,#00D4FF)", borderRadius: 5 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}