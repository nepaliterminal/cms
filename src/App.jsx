import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const C = {
  bg: "#0a0a18", sidebar: "#0f0f22", card: "#13132a",
  cardHover: "#1a1a35", border: "#252545", accent: "#7B2FFF",
  blue: "#1E90FF", grad: "linear-gradient(135deg,#7B2FFF,#1E90FF)",
  white: "#f0f0ff", gray: "#8080aa", muted: "#5555aa",
  red: "#FF4466", gold: "#FFB830", green: "#22C87A",
};

const CATS = ["Local News","Schools","Sports","Events","Student Spotlight","Opinion","Weather"];

function GradText(props) {
  return <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{props.children}</span>;
}

function LogoWithFallback(props) {
  const [err, setErr] = useState(false);
  var s = props.size || 36;
  if (err) {
    return (
      <div style={{ width: s, height: s, borderRadius: props.circle ? "50%" : s*0.2, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: s*0.48, color: "#fff", flexShrink: 0 }}>K</div>
    );
  }
  return (
    <img src={props.circle ? "/logo-circle.png" : "/logo-square.png"} alt="KrynoluxDC" onError={function(){setErr(true);}}
      style={{ width: s, height: s, borderRadius: props.circle ? "50%" : s*0.2, objectFit: "cover", flexShrink: 0 }} />
  );
}

function Badge(props) {
  var color = props.color || C.accent;
  return <span style={{ background: color+"22", color: color, border: "1px solid "+color+"44", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{props.text}</span>;
}

function Stat(props) {
  return (
    <div style={{ background: C.card, borderRadius: 12, padding: "16px 18px", border: "1px solid "+C.border, flex: 1, minWidth: 100, transition: "transform 0.2s" }}
      onMouseEnter={function(e){e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={function(e){e.currentTarget.style.transform="none";}}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{props.icon}</div>
      <div style={{ color: props.color||C.accent, fontWeight: 900, fontSize: 26 }}>{props.value}</div>
      <div style={{ color: C.gray, fontSize: 12 }}>{props.label}</div>
    </div>
  );
}

function Toast(props) {
  if (!props.toast) return null;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, background: props.toast.color, color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
      {props.toast.msg}
    </div>
  );
}

function Empty(props) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{props.icon || "📭"}</div>
      <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{props.title}</div>
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
  const [loading, setLoading] = useState(false);

  function submit() {
    if (tries >= 3) { setErr("Too many attempts. Please wait."); return; }
    setLoading(true);
    setTimeout(function() {
      if (user === import.meta.env.VITE_ADMIN_USER && pass === import.meta.env.VITE_ADMIN_PASS) {
        props.onLogin();
      } else {
        var n = tries + 1;
        setTries(n);
        setErr(n >= 3 ? "Too many attempts." : "Wrong credentials. " + (3-n) + " left.");
      }
      setLoading(false);
    }, 600);
  }

  var inp = { width: "100%", padding: "11px 14px", background: "#0a0a18", border: "1px solid "+C.border, borderRadius: 8, color: C.white, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>
      <div style={{ background: C.card, borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 380, border: "1px solid "+C.border, boxShadow: "0 0 60px rgba(123,47,255,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <LogoWithFallback size={60} />
          </div>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}><GradText>KrynoluxDC CMS</GradText></div>
          <div style={{ color: C.gray, fontSize: 12 }}>Authorized Personnel Only</div>
        </div>
        <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Username</label>
        <input value={user} onChange={function(e){setUser(e.target.value);}} placeholder="Enter username" autoComplete="off" style={Object.assign({},inp,{marginBottom:12,borderColor:err?C.red:C.border})} />
        <label style={{ color: C.gray, fontSize: 12, display: "block", marginBottom: 5 }}>Password</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input value={pass} onChange={function(e){setPass(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")submit();}} type={show?"text":"password"} placeholder="Enter password" autoComplete="off" style={Object.assign({},inp,{paddingRight:44,borderColor:err?C.red:C.border})} />
          <span onClick={function(){setShow(!show);}} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.gray, fontSize: 16 }}>
            {show ? "🙈" : "👁️"}
          </span>
        </div>
        {err ? <div style={{ background: C.red+"22", border: "1px solid "+C.red+"44", borderRadius: 8, padding: "8px 12px", color: C.red, fontSize: 12, marginBottom: 14 }}>⚠️ {err}</div> : null}
        <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "12px", background: loading?C.border:C.grad, border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading?"not-allowed":"pointer", transition: "opacity 0.2s" }}>
          {loading ? "Signing in..." : "🔐 Sign In"}
        </button>
        <div style={{ textAlign: "center", marginTop: 14, color: C.muted, fontSize: 11 }}>🔒 KrynoluxDC Secure Admin</div>
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
  const [dataLoading, setDataLoading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ siteName: "KrynoluxDC", tagline: "News by Kids. For the Community.", breakingNews: "", showWeather: true, showPoll: true });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [aTitle, setATitle] = useState("");
  const [aAuthor, setAAuthor] = useState("");
  const [aSchool, setASchool] = useState("");
  const [aCat, setACat] = useState("Local News");
  const [aBody, setABody] = useState("");
  const [aDate, setADate] = useState("");
  const [aImage, setAImage] = useState("");
  const [aImageFile, setAImageFile] = useState(null);
  const [aImagePreview, setAImagePreview] = useState("");

  const [wName, setWName] = useState("");
  const [wSchool, setWSchool] = useState("");
  const [wEmail, setWEmail] = useState("");

  useEffect(function() { if (loggedIn) { loadArticles(); loadWriters(); loadSettings(); } }, [loggedIn]);

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 3000);
  }

  async function loadArticles() {
    setDataLoading(true);
    const { data } = await supabase.from("submissions").select("*").order("created_at",{ascending:false});
    if (data) setArticles(data);
    setDataLoading(false);
  }

  async function loadWriters() {
    const { data } = await supabase.from("writers").select("*").order("created_at",{ascending:false});
    if (data) setWriters(data);
  }

  async function loadSettings() {
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (data) setSiteSettings(data);
  }

  async function saveSettings() {
    const { error } = await supabase.from("site_settings").upsert(Object.assign({}, siteSettings, { id: 1 }));
    if (!error) { showToast("✅ Settings saved!"); setSettingsSaved(true); setTimeout(function(){setSettingsSaved(false);},3000); }
    else showToast("Failed to save settings.", C.red);
  }

  async function setStatus(id, status) {
    const { error } = await supabase.from("submissions").update({status:status}).eq("id",id);
    if (!error) {
      setArticles(function(arr){return arr.map(function(x){return x.id===id?Object.assign({},x,{status:status}):x;});});
      showToast(status==="approved"?"✅ Published!":status==="rejected"?"❌ Rejected.":"🔄 Set to pending.", status==="approved"?C.green:status==="rejected"?C.red:C.gold);
      setOpenId(null);
    } else showToast("Failed to update.", C.red);
  }

  async function flagToggle(id, current) {
    const { error } = await supabase.from("submissions").update({flagged:!current}).eq("id",id);
    if (!error) { setArticles(function(arr){return arr.map(function(x){return x.id===id?Object.assign({},x,{flagged:!current}):x;});}); showToast(!current?"🚩 Flagged.":"✅ Unflagged."); }
  }

  async function delArticle(id) {
    const { error } = await supabase.from("submissions").delete().eq("id",id);
    if (!error) { setArticles(function(arr){return arr.filter(function(x){return x.id!==id;});}); showToast("🗑️ Deleted.",C.red); setOpenId(null); }
  }

  async function uploadImage(file) {
    if (!file) return null;
    setImgUploading(true);
    var ext = file.name.split(".").pop();
    var path = "articles/" + Date.now() + "." + ext;
    const { error } = await supabase.storage.from("article-images").upload(path, file, { upsert: true });
    if (error) { showToast("Image upload failed.", C.red); setImgUploading(false); return null; }
    const { data } = supabase.storage.from("article-images").getPublicUrl(path);
    setImgUploading(false);
    return data.publicUrl;
  }

  function handleImageSelect(e) {
    var file = e.target.files[0];
    if (!file) return;
    setAImageFile(file);
    var reader = new FileReader();
    reader.onload = function(ev) { setAImagePreview(ev.target.result); };
    reader.readAsDataURL(file);
  }

  async function publish() {
    if (!aTitle || !aAuthor) { showToast("Title and author required.", C.red); return; }
    var imageUrl = aImage;
    if (aImageFile) { imageUrl = await uploadImage(aImageFile); if (!imageUrl) return; }
    const { data, error } = await supabase.from("submissions").insert([{
      name: aAuthor, school: aSchool, headline: aTitle, category: aCat,
      body: aBody, status: aDate ? "scheduled" : "approved",
      flagged: false, views: 0, image_url: imageUrl || null,
    }]).select();
    if (!error && data) {
      setArticles(function(arr){return [data[0]].concat(arr);});
      setATitle(""); setAAuthor(""); setASchool(""); setABody(""); setADate(""); setACat("Local News"); setAImage(""); setAImageFile(null); setAImagePreview("");
      showToast(aDate?"🗓️ Scheduled!":"🚀 Published live!");
    } else showToast("Failed to publish.",C.red);
  }

  async function addWriter() {
    if (!wName || !wEmail) { showToast("Name and email required.",C.red); return; }
    const { data, error } = await supabase.from("writers").insert([{name:wName,school:wSchool,email:wEmail,articles:0,badge:"New Writer",status:"active"}]).select();
    if (!error && data) { setWriters(function(arr){return [data[0]].concat(arr);}); setWName(""); setWSchool(""); setWEmail(""); showToast("Writer added!"); }
    else showToast("Failed to add writer.",C.red);
  }

  async function toggleWriter(id, status) {
    var ns = status==="active"?"suspended":"active";
    const { error } = await supabase.from("writers").update({status:ns}).eq("id",id);
    if (!error) { setWriters(function(arr){return arr.map(function(x){return x.id===id?Object.assign({},x,{status:ns}):x;});}); showToast("Writer updated."); }
  }

  async function delWriter(id) {
    const { error } = await supabase.from("writers").delete().eq("id",id);
    if (!error) { setWriters(function(arr){return arr.filter(function(x){return x.id!==id;});}); showToast("Writer removed.",C.red); }
  }

  var filtered = articles.filter(function(a) {
    var ms = (a.headline||"").toLowerCase().indexOf(search.toLowerCase())!==-1||(a.name||"").toLowerCase().indexOf(search.toLowerCase())!==-1;
    var mf = fStatus==="all"||a.status===fStatus;
    return ms&&mf;
  });

  var pending = articles.filter(function(a){return a.status==="pending";}).length;
  var approved = articles.filter(function(a){return a.status==="approved";}).length;
  var rejected = articles.filter(function(a){return a.status==="rejected";}).length;
  var flagged = articles.filter(function(a){return a.flagged;}).length;

  var tabs = [["dashboard","📊","Dashboard"],["submissions","📥","Submissions"],["publish","✍️","Publish"],["writers","👥","Writers"],["analytics","📈","Analytics"],["settings","⚙️","Site Settings"]];
  var inp = { width:"100%", padding:"10px 14px", background:"#0a0a18", border:"1px solid "+C.border, borderRadius:8, color:C.white, fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10, fontFamily:"inherit" };

  if (!loggedIn) return <Login onLogin={function(){setLoggedIn(true);}} />;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Inter,sans-serif", display:"flex" }}>
      <Toast toast={toast} />

      <div style={{ width:210, background:C.sidebar, borderRight:"1px solid "+C.border, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"18px 16px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:10 }}>
          <LogoWithFallback size={34} />
          <div>
            <div style={{ fontWeight:900, fontSize:14 }}><GradText>KrynoluxDC</GradText></div>
            <div style={{ color:C.muted, fontSize:10 }}>CMS Admin Panel</div>
          </div>
        </div>
        <div style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {tabs.map(function(t) {
            var active = tab===t[0];
            return (
              <button key={t[0]} onClick={function(){setTab(t[0]);if(t[0]==="submissions")loadArticles();}} style={{ width:"100%", textAlign:"left", padding:"10px 12px", marginBottom:3, background:active?"linear-gradient(135deg,rgba(123,47,255,0.2),rgba(30,144,255,0.1))":"transparent", border:active?"1px solid rgba(123,47,255,0.4)":"1px solid transparent", borderRadius:9, color:active?C.white:C.gray, cursor:"pointer", fontSize:13, fontWeight:active?700:400, display:"flex", alignItems:"center", gap:8, transition:"all 0.2s" }}>
                <span>{t[1]}</span>
                <span>{t[2]}</span>
                {t[0]==="submissions"&&pending>0&&<span style={{ marginLeft:"auto", background:C.red, color:"white", fontSize:10, fontWeight:900, padding:"1px 6px", borderRadius:10 }}>{pending}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ padding:"12px 10px", borderTop:"1px solid "+C.border }}>
          <button onClick={function(){setLoggedIn(false);setArticles([]);setWriters([]);}} style={{ width:"100%", padding:"9px", background:"transparent", border:"1px solid "+C.border, borderRadius:8, color:C.gray, cursor:"pointer", fontSize:12 }}>🚪 Sign Out</button>
        </div>
      </div>

      <div style={{ flex:1, overflow:"auto", padding:26 }}>

        {tab==="dashboard" && (
          <div>
            <div style={{ marginBottom:22 }}>
              <h2 style={{ color:C.white, margin:"0 0 4px" }}>📊 Dashboard</h2>
              <p style={{ color:C.gray, fontSize:13, margin:0 }}>Welcome back, Admin. Here is your overview.</p>
            </div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
              <Stat icon="📥" label="Pending" value={pending} color={C.gold} />
              <Stat icon="✅" label="Published" value={approved} color={C.green} />
              <Stat icon="❌" label="Rejected" value={rejected} color={C.red} />
              <Stat icon="🚩" label="Flagged" value={flagged} color={C.red} />
              <Stat icon="👥" label="Writers" value={writers.length} color={C.accent} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
              <div style={{ background:C.card, borderRadius:14, padding:20, border:"1px solid "+C.border }}>
                <div style={{ color:C.white, fontWeight:700, marginBottom:14, fontSize:15 }}>🕐 Recent Submissions</div>
                {dataLoading ? <div style={{ color:C.gray, textAlign:"center", padding:30 }}>Loading...</div>
                  : articles.length===0 ? <Empty icon="📭" title="No submissions yet." sub="Articles from the website appear here." />
                  : articles.slice(0,6).map(function(a) {
                      return (
                        <div key={a.id} onClick={function(){setTab("submissions");setOpenId(a.id);}} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid "+C.border, cursor:"pointer" }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ color:C.white, fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.headline||"Untitled"}</div>
                            <div style={{ color:C.gray, fontSize:11 }}>{a.name} · {a.created_at?a.created_at.slice(0,10):""}</div>
                          </div>
                          <Badge text={(a.status||"pending").toUpperCase()} color={a.status==="approved"?C.green:a.status==="rejected"?C.red:C.gold} />
                        </div>
                      );
                    })
                }
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:C.card, borderRadius:14, padding:18, border:"1px solid "+C.border }}>
                  <div style={{ color:C.white, fontWeight:700, marginBottom:12 }}>✅ Checklist</div>
                  {[["Review pending submissions",pending===0],["Check flagged content",flagged===0],["Add student writers",writers.length>0],["Publish an article",approved>0]].map(function(item){
                    return (
                      <div key={item[0]} style={{ display:"flex", gap:8, alignItems:"center", padding:"7px 0", borderBottom:"1px solid "+C.border }}>
                        <span style={{ fontSize:14 }}>{item[1]?"✅":"⬜"}</span>
                        <span style={{ color:item[1]?C.muted:C.white, fontSize:12, textDecoration:item[1]?"line-through":"none" }}>{item[0]}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:"linear-gradient(135deg,rgba(123,47,255,0.15),rgba(30,144,255,0.1))", borderRadius:14, padding:18, border:"1px solid rgba(123,47,255,0.3)" }}>
                  <div style={{ color:C.white, fontWeight:700, marginBottom:8, fontSize:14 }}>🚀 Quick Actions</div>
                  {[["✍️ Publish Article","publish"],["👥 Add Writer","writers"],["⚙️ Site Settings","settings"]].map(function(a){
                    return <button key={a[0]} onClick={function(){setTab(a[1]);}} style={{ display:"block", width:"100%", padding:"8px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid "+C.border, borderRadius:8, color:C.white, cursor:"pointer", fontSize:12, fontWeight:600, marginBottom:6, textAlign:"left" }}>{a[0]}</button>;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="submissions" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ color:C.white, margin:0 }}>📥 Submissions</h2>
              <button onClick={loadArticles} style={{ padding:"7px 14px", background:C.card, border:"1px solid "+C.border, borderRadius:8, color:C.accent, cursor:"pointer", fontSize:12 }}>🔄 Refresh</button>
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Search articles..." style={{ flex:1, minWidth:160, padding:"9px 14px", background:C.card, border:"1px solid "+C.border, borderRadius:8, color:C.white, fontSize:13, outline:"none" }} />
              {["all","pending","approved","rejected"].map(function(s){
                return <button key={s} onClick={function(){setFStatus(s);}} style={{ padding:"9px 14px", background:fStatus===s?C.accent:C.card, border:"1px solid "+C.border, borderRadius:8, color:fStatus===s?"#fff":C.gray, cursor:"pointer", fontSize:12, fontWeight:600, textTransform:"capitalize" }}>{s}</button>;
              })}
            </div>
            {dataLoading ? <div style={{ color:C.gray, textAlign:"center", padding:50 }}>Loading submissions...</div>
              : filtered.length===0 ? <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border }}><Empty icon="📭" title="No articles found." sub="Submissions from the website appear here." /></div>
              : filtered.map(function(a) {
                  var open = openId===a.id;
                  return (
                    <div key={a.id} onClick={function(){setOpenId(open?null:a.id);}} style={{ background:open?C.cardHover:C.card, borderRadius:12, padding:"14px 16px", marginBottom:8, border:"1px solid "+(a.flagged?C.red:open?"rgba(123,47,255,0.5)":C.border), cursor:"pointer", transition:"all 0.2s" }}>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                        {a.flagged?<Badge text="FLAGGED" color={C.red}/>:null}
                        <Badge text={(a.status||"pending").toUpperCase()} color={a.status==="approved"?C.green:a.status==="rejected"?C.red:C.gold} />
                        <Badge text={a.category||"Uncategorized"} color={C.accent} />
                        {a.image_url?<Badge text="📷 Has Image" color={C.blue}/>:null}
                      </div>
                      <div style={{ color:C.white, fontWeight:700, fontSize:14, marginBottom:3 }}>{a.headline||"Untitled"}</div>
                      <div style={{ color:C.gray, fontSize:12 }}>by {a.name} · {a.school} · {a.created_at?a.created_at.slice(0,10):""}</div>
                      {open && (
                        <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid "+C.border }}>
                          {a.image_url && <img src={a.image_url} alt="Article" style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:8, marginBottom:12 }} onClick={function(e){e.stopPropagation();}} />}
                          <p style={{ color:C.gray, fontSize:13, lineHeight:1.6, marginBottom:12 }}>{a.body||"No body."}</p>
                          <div style={{ color:C.gray, fontSize:12, marginBottom:12 }}>📧 {a.email}</div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            <button onClick={function(e){e.stopPropagation();setStatus(a.id,"approved");}} style={{ padding:"8px 16px", background:C.green, border:"none", borderRadius:8, color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>✅ Approve & Publish</button>
                            <button onClick={function(e){e.stopPropagation();setStatus(a.id,"rejected");}} style={{ padding:"8px 16px", background:C.red, border:"none", borderRadius:8, color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>❌ Reject</button>
                            <button onClick={function(e){e.stopPropagation();setStatus(a.id,"pending");}} style={{ padding:"8px 16px", background:C.gold, border:"none", borderRadius:8, color:"#000", cursor:"pointer", fontSize:12, fontWeight:700 }}>🔄 Pending</button>
                            <button onClick={function(e){e.stopPropagation();flagToggle(a.id,a.flagged);}} style={{ padding:"8px 16px", background:"transparent", border:"1px solid "+C.red, borderRadius:8, color:C.red, cursor:"pointer", fontSize:12 }}>{a.flagged?"Unflag":"🚩 Flag"}</button>
                            <button onClick={function(e){e.stopPropagation();delArticle(a.id);}} style={{ padding:"8px 14px", background:"transparent", border:"1px solid "+C.border, borderRadius:8, color:C.gray, cursor:"pointer", fontSize:12 }}>🗑️</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
            }
          </div>
        )}

        {tab==="publish" && (
          <div>
            <h2 style={{ color:C.white, marginBottom:4 }}>✍️ Publish Article</h2>
            <p style={{ color:C.gray, fontSize:13, marginBottom:20 }}>Write and publish directly to KrynoluxDC.</p>
            <div style={{ background:C.card, borderRadius:14, padding:24, border:"1px solid "+C.border, maxWidth:660 }}>
              <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Headline *</label>
              <input value={aTitle} onChange={function(e){setATitle(e.target.value);}} style={inp} placeholder="Article headline" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Author *</label>
                  <input value={aAuthor} onChange={function(e){setAAuthor(e.target.value);}} style={inp} placeholder="Author name" />
                </div>
                <div>
                  <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>School</label>
                  <input value={aSchool} onChange={function(e){setASchool(e.target.value);}} style={inp} placeholder="School" />
                </div>
              </div>
              <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Category</label>
              <select value={aCat} onChange={function(e){setACat(e.target.value);}} style={Object.assign({},inp,{color:C.white})}>
                {CATS.map(function(c){return <option key={c} value={c}>{c}</option>;})}
              </select>
              <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Article Body</label>
              <textarea value={aBody} onChange={function(e){setABody(e.target.value);}} rows={6} placeholder="Write the article here..." style={Object.assign({},inp,{resize:"vertical"})} />

              <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>📷 Article Image</label>
              <div style={{ border:"2px dashed "+C.border, borderRadius:10, padding:20, textAlign:"center", marginBottom:10, cursor:"pointer", position:"relative" }}
                onClick={function(){document.getElementById("img-upload").click();}}>
                {aImagePreview ? (
                  <img src={aImagePreview} alt="Preview" style={{ maxHeight:180, borderRadius:8, objectFit:"cover", maxWidth:"100%" }} />
                ) : (
                  <div>
                    <div style={{ fontSize:32, marginBottom:8 }}>🖼️</div>
                    <div style={{ color:C.gray, fontSize:13 }}>Click to upload image</div>
                    <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>JPG, PNG, WEBP supported</div>
                  </div>
                )}
                <input id="img-upload" type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageSelect} />
              </div>
              {aImagePreview && (
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <button onClick={function(){setAImageFile(null);setAImagePreview("");setAImage("");}} style={{ padding:"6px 12px", background:"transparent", border:"1px solid "+C.red, borderRadius:6, color:C.red, cursor:"pointer", fontSize:12 }}>Remove Image</button>
                </div>
              )}
              <div style={{ marginBottom:0 }}>
                <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Or paste image URL</label>
                <input value={aImage} onChange={function(e){setAImage(e.target.value);if(e.target.value)setAImagePreview(e.target.value);}} style={inp} placeholder="https://..." />
              </div>
              <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>🗓️ Schedule (optional)</label>
              <input type="datetime-local" value={aDate} onChange={function(e){setADate(e.target.value);}} style={inp} />
              <div style={{ display:"flex", gap:10, marginTop:6 }}>
                <button onClick={publish} disabled={imgUploading} style={{ flex:1, padding:"12px", background:imgUploading?C.border:C.grad, border:"none", borderRadius:9, color:"#fff", fontSize:14, fontWeight:700, cursor:imgUploading?"not-allowed":"pointer" }}>
                  {imgUploading?"Uploading image...":aDate?"🗓️ Schedule":"🚀 Publish Now"}
                </button>
                <button onClick={function(){setATitle("");setAAuthor("");setASchool("");setABody("");setADate("");setACat("Local News");setAImage("");setAImageFile(null);setAImagePreview("");}} style={{ padding:"12px 16px", background:"transparent", border:"1px solid "+C.border, borderRadius:9, color:C.gray, cursor:"pointer", fontSize:13 }}>Clear</button>
              </div>
            </div>
          </div>
        )}

        {tab==="writers" && (
          <div>
            <h2 style={{ color:C.white, marginBottom:4 }}>👥 Writers</h2>
            <p style={{ color:C.gray, fontSize:13, marginBottom:16 }}>{writers.length} journalist(s) registered.</p>
            <div style={{ background:C.card, borderRadius:14, padding:20, border:"1px solid "+C.border, maxWidth:500, marginBottom:20 }}>
              <div style={{ color:C.white, fontWeight:700, marginBottom:12 }}>➕ Add Writer</div>
              <input value={wName} onChange={function(e){setWName(e.target.value);}} placeholder="Full Name *" style={inp} />
              <input value={wSchool} onChange={function(e){setWSchool(e.target.value);}} placeholder="School" style={inp} />
              <input value={wEmail} onChange={function(e){setWEmail(e.target.value);}} placeholder="Email *" style={inp} />
              <button onClick={addWriter} style={{ width:"100%", padding:"10px", background:C.grad, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>Add Writer</button>
            </div>
            {writers.length===0 ? <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border }}><Empty icon="👤" title="No writers yet." sub="Add your first student journalist above." /></div>
              : writers.map(function(w) {
                  return (
                    <div key={w.id} style={{ background:C.card, borderRadius:12, padding:"14px 18px", marginBottom:8, border:"1px solid "+(w.status==="suspended"?C.red:C.border), display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:42, height:42, borderRadius:10, background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"white" }}>
                          {(w.name||"?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color:C.white, fontWeight:700, fontSize:14 }}>{w.name}</div>
                          <div style={{ color:C.gray, fontSize:12 }}>{w.school} · {w.email}</div>
                          <div style={{ display:"flex", gap:5, marginTop:4 }}>
                            <Badge text={w.badge||"Writer"} color={C.accent} />
                            <Badge text={(w.status||"active").toUpperCase()} color={w.status==="active"?C.green:C.red} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:7 }}>
                        <button onClick={function(){toggleWriter(w.id,w.status);}} style={{ padding:"7px 14px", background:"transparent", border:"1px solid "+(w.status==="active"?C.red:C.green), borderRadius:8, color:w.status==="active"?C.red:C.green, cursor:"pointer", fontSize:12, fontWeight:700 }}>
                          {w.status==="active"?"Suspend":"Restore"}
                        </button>
                        <button onClick={function(){delWriter(w.id);}} style={{ padding:"7px 12px", background:"transparent", border:"1px solid "+C.border, borderRadius:8, color:C.gray, cursor:"pointer" }}>🗑️</button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {tab==="analytics" && (
          <div>
            <h2 style={{ color:C.white, marginBottom:4 }}>📈 Analytics</h2>
            <p style={{ color:C.gray, fontSize:13, marginBottom:18 }}>KrynoluxDC site overview.</p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
              <Stat icon="👁️" label="Total Views" value={articles.reduce(function(s,a){return s+(a.views||0);},0)} color={C.accent} />
              <Stat icon="📰" label="Published" value={approved} color={C.green} />
              <Stat icon="✍️" label="Active Writers" value={writers.filter(function(w){return w.status==="active";}).length} color={C.blue} />
              <Stat icon="📥" label="Pending" value={pending} color={C.gold} />
            </div>
            <div style={{ background:C.card, borderRadius:14, padding:18, border:"1px solid "+C.border, marginBottom:14 }}>
              <div style={{ color:C.white, fontWeight:700, marginBottom:12 }}>🔥 Top Articles</div>
              {articles.filter(function(a){return a.status==="approved";}).length===0
                ? <Empty icon="📊" title="No published articles yet." sub="Publish your first article to see analytics." />
                : articles.filter(function(a){return a.status==="approved";}).sort(function(a,b){return (b.views||0)-(a.views||0);}).slice(0,6).map(function(a,i){
                    return (
                      <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid "+C.border }}>
                        <div style={{ background:C.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontWeight:900, fontSize:17, width:26 }}>{"#"+(i+1)}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ color:C.white, fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.headline||"Untitled"}</div>
                          <div style={{ color:C.gray, fontSize:11 }}>{a.name} · {a.category}</div>
                        </div>
                        <div style={{ color:C.accent, fontWeight:700, fontSize:13 }}>{(a.views||0).toLocaleString()} views</div>
                      </div>
                    );
                  })
              }
            </div>
            <div style={{ background:C.card, borderRadius:14, padding:18, border:"1px solid "+C.border }}>
              <div style={{ color:C.white, fontWeight:700, marginBottom:12 }}>📊 By Category</div>
              {CATS.map(function(cat){
                var count = articles.filter(function(a){return a.category===cat&&a.status==="approved";}).length;
                var pct = approved>0?Math.round((count/approved)*100):0;
                return (
                  <div key={cat} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", color:C.gray, fontSize:12, marginBottom:3 }}>
                      <span>{cat}</span><span>{count}</span>
                    </div>
                    <div style={{ background:"#1a1a35", borderRadius:5, height:7 }}>
                      <div style={{ width:pct+"%", height:"100%", background:C.grad, borderRadius:5, transition:"width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="settings" && (
          <div>
            <h2 style={{ color:C.white, marginBottom:4 }}>⚙️ Site Settings</h2>
            <p style={{ color:C.gray, fontSize:13, marginBottom:22 }}>Update your website without touching any code.</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:800 }}>
              <div style={{ background:C.card, borderRadius:14, padding:22, border:"1px solid "+C.border, gridColumn:"span 2" }}>
                <div style={{ color:C.white, fontWeight:700, marginBottom:14, fontSize:15 }}>🌐 General</div>
                <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Site Name</label>
                <input value={siteSettings.siteName||""} onChange={function(e){setSiteSettings(function(s){return Object.assign({},s,{siteName:e.target.value});});}} style={inp} />
                <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Tagline</label>
                <input value={siteSettings.tagline||""} onChange={function(e){setSiteSettings(function(s){return Object.assign({},s,{tagline:e.target.value});});}} style={inp} />
                <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>🔴 Breaking News Ticker (leave blank to hide)</label>
                <input value={siteSettings.breakingNews||""} onChange={function(e){setSiteSettings(function(s){return Object.assign({},s,{breakingNews:e.target.value});});}} style={inp} placeholder="Enter breaking news message..." />
              </div>
              <div style={{ background:C.card, borderRadius:14, padding:22, border:"1px solid "+C.border }}>
                <div style={{ color:C.white, fontWeight:700, marginBottom:14, fontSize:15 }}>🎛️ Features</div>
                {[["showWeather","Show Weather Widget"],["showPoll","Show Community Poll"]].map(function(item){
                  return (
                    <div key={item[0]} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid "+C.border }}>
                      <span style={{ color:C.white, fontSize:13 }}>{item[1]}</span>
                      <div onClick={function(){setSiteSettings(function(s){var u=Object.assign({},s);u[item[0]]=!u[item[0]];return u;});}}
                        style={{ width:44, height:24, borderRadius:12, background:siteSettings[item[0]]?C.grad:"#2a2a4a", cursor:"pointer", position:"relative", transition:"background 0.3s" }}>
                        <div style={{ width:18, height:18, borderRadius:"50%", background:"white", position:"absolute", top:3, left:siteSettings[item[0]]?23:3, transition:"left 0.3s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:C.card, borderRadius:14, padding:22, border:"1px solid "+C.border }}>
                <div style={{ color:C.white, fontWeight:700, marginBottom:14, fontSize:15 }}>📞 Contact Info</div>
                <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Contact Email</label>
                <input value={siteSettings.contactEmail||""} onChange={function(e){setSiteSettings(function(s){return Object.assign({},s,{contactEmail:e.target.value});});}} style={inp} placeholder="contact@krynolux.work" />
                <label style={{ color:C.gray, fontSize:12, display:"block", marginBottom:5 }}>Coverage Area</label>
                <input value={siteSettings.coverageArea||""} onChange={function(e){setSiteSettings(function(s){return Object.assign({},s,{coverageArea:e.target.value});});}} style={inp} placeholder="Fairfax, Loudoun, DC" />
              </div>
            </div>
            <div style={{ marginTop:20, maxWidth:800 }}>
              <button onClick={saveSettings} style={{ padding:"12px 28px", background:settingsSaved?C.green:C.grad, border:"none", borderRadius:9, color:"white", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 3px 14px rgba(123,47,255,0.3)", transition:"background 0.3s" }}>
                {settingsSaved?"✅ Settings Saved!":"💾 Save Settings"}
              </button>
              <span style={{ color:C.muted, fontSize:12, marginLeft:14 }}>Changes go live on the website immediately.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}