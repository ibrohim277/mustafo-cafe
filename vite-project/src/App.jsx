  import { useState, useEffect, useRef, useCallback } from "react";

  /* ═══════════════════════════════════════════════════════════════
    MUSTAFO CAFE — Premium Restaurant ERP v2
    Uzbek language • Glassmorphism • Dark Green/Black/White
    Admin: MUSTAFO / MUSTAFO13
    ═══════════════════════════════════════════════════════════════ */

  // ── STORAGE ──────────────────────────────────────────────────────
  const DB = {
    get: (k, fb = null) => { try { const v = localStorage.getItem("mc2_" + k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
    set: (k, v) => { try { localStorage.setItem("mc2_" + k, JSON.stringify(v)); } catch {} },
  };

  // ── CONSTANTS ─────────────────────────────────────────────────────
  const DEFAULT_ADMIN = { username: "MUSTAFO", password: "MUSTAFO13" };
  const DEFAULT_TG = { token: "", chatId: "" };


  function initDB() {
    if (!DB.get("admin")) DB.set("admin", DEFAULT_ADMIN);
    if (!DB.get("tg")) DB.set("tg", DEFAULT_TG);
    if (!DB.get("cats")) DB.set("cats", DEFAULT_CATS);
    if (!DB.get("prods")) DB.set("prods", DEFAULT_PRODS);
    if (!DB.get("orders")) DB.set("orders", []);
  }

  // ── UTILS ─────────────────────────────────────────────────────────
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const money = (n) => new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
  const nowStr = () => new Date().toLocaleString("uz-UZ", { dateStyle:"short", timeStyle:"short" });
  const isoNow = () => new Date().toISOString();

  const STATUS = {
    new:       { label:"Yangi",           color:"#3b82f6", bg:"rgba(59,130,246,.15)" },
    preparing: { label:"Tayyorlanmoqda",  color:"#f59e0b", bg:"rgba(245,158,11,.15)" },
    ready:     { label:"Tayyor",          color:"#10b981", bg:"rgba(16,185,129,.15)" },
    delivered: { label:"Yetkazildi",      color:"#8b5cf6", bg:"rgba(139,92,246,.15)" },
    cancelled: { label:"Bekor qilindi",   color:"#ef4444", bg:"rgba(239,68,68,.15)" },
  };

  const STATUS_FLOW = {
    new: ["preparing"],
    preparing: ["ready"],
    ready: ["delivered"],
    delivered: [],
    cancelled: [],
  };



  // ── AUDIO ─────────────────────────────────────────────────────────
  function chime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[523.25,0],[659.25,.12],[783.99,.24],[1046.5,.38]].forEach(([f,t]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(0,.0); g.gain.linearRampToValueAtTime(.25, ctx.currentTime+t+.02);
        g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+t+.5);
        o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+.55);
      });
    } catch {}
  }

  // ── TELEGRAM CONFIG ──────────────────────────────────────────────
  const DEFAULT_TG_OVERRIDE = {
    token: "8986139311:AAHuBRabXb6u2Jr2EH30T7nn4A-yuOK0oWY",
    chatId: "-5102694765"
  };

  // ── TELEGRAM ──────────────────────────────────────────────────────
  async function sendTelegram(order) {
    const tg = DB.get("tg", DEFAULT_TG);

    if (!tg.token || !tg.chatId) {
      return {
        ok: false,
        reason: "Token yoki Chat ID kiritilmagan"
      };
    }

    const items = order.items
      .map(i => `  • ${i.name} × ${i.qty} = ${money(i.price * i.qty)}`)
      .join("\n");

    const text = [
      "🍃 *MUSTAFO CAFE — Yangi Buyurtma!*",
      "━━━━━━━━━━━━━━━━━━━━",
      `🆔 Buyurtma ID: \`${order.id}\``,
      `📅 Vaqt: ${order.time}`,
      "━━━━━━━━━━━━━━━━━━━━",
      `👤 Mijoz: *${order.name}*`,
      `📞 Telefon: ${order.phone}`,
      order.comment ? `💬 Izoh: ${order.comment}` : "",
      "━━━━━━━━━━━━━━━━━━━━",
      "🛒 *Buyurtma tarkibi:*",
      items,
      "━━━━━━━━━━━━━━━━━━━━",
      order.discount > 0
        ? `🏷 Chegirma: -${money(order.discount)}`
        : "",
      `💰 *JAMI: ${money(order.total)}*`,
      "━━━━━━━━━━━━━━━━━━━━",
      "🔔 Iltimos buyurtmani qabul qiling!"
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${tg.token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: tg.chatId,
            text,
            parse_mode: "Markdown"
          })
        }
      );

      const data = await res.json();
      return {
        ok: data.ok,
        reason: data.description
      };
    } catch (e) {
      return {
        ok: false,
        reason: e.message
      };
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // STYLES
  // ══════════════════════════════════════════════════════════════════
  const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

  const CSS = `
  ${FONTS}
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --green:#166534;--green2:#15803d;--green3:#16a34a;--green4:#22c55e;
    --greenDark:#052e16;--greenMid:#14532d;--greenLight:#dcfce7;
    --black:#080c0a;--card:#0d1410;--card2:#111a14;--card3:#162019;
    --border:rgba(34,197,94,.12);--border2:rgba(34,197,94,.22);--border3:rgba(34,197,94,.35);
    --text:#f0fdf4;--textMuted:#86efac;--textSub:#4ade80;--textDim:#6b7280;
    --gold:#d4af37;--goldLight:#fef9c3;
    --red:#ef4444;--blue:#3b82f6;
    --glass:rgba(13,20,16,.75);--glassBorder:rgba(34,197,94,.18);
    --glow:0 0 40px rgba(34,197,94,.08);
  }
  html,body{height:100%;background:var(--black);color:var(--text);font-family:'DM Sans',sans-serif;overflow-x:hidden}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--green);border-radius:2px}

  /* GLASS */
  .glass{background:var(--glass);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid var(--glassBorder)}
  .glass2{background:rgba(22,37,28,.6);backdrop-filter:blur(12px);border:1px solid var(--border)}

  /* TYPOGRAPHY */
  .serif{font-family:'Cormorant Garamond',serif}
  h1{font-size:clamp(24px,4vw,40px);font-weight:600}
  h2{font-size:clamp(18px,2.5vw,28px);font-weight:500}

  /* INPUTS */
  input,textarea,select{
    font-family:'DM Sans',sans-serif;
    background:rgba(22,37,28,.8);
    border:1px solid var(--border2);
    color:var(--text);border-radius:10px;
    padding:11px 16px;font-size:14px;outline:none;
    transition:border-color .2s,box-shadow .2s;width:100%
  }
  input:focus,textarea:focus,select:focus{border-color:var(--green3);box-shadow:0 0 0 3px rgba(34,197,94,.1)}
  input::placeholder,textarea::placeholder{color:var(--textDim)}
  select option{background:#0d1410}

  /* BUTTONS */
  .btn{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:10px;padding:11px 20px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
  .btn-primary{background:linear-gradient(135deg,var(--green2),var(--green3));color:#fff;box-shadow:0 4px 20px rgba(22,163,74,.3)}
  .btn-primary:hover{background:linear-gradient(135deg,var(--green3),#4ade80);transform:translateY(-1px);box-shadow:0 6px 24px rgba(22,163,74,.4)}
  .btn-primary:active{transform:scale(.98)}
  .btn-danger{background:rgba(239,68,68,.15);color:var(--red);border:1px solid rgba(239,68,68,.3)}
  .btn-danger:hover{background:rgba(239,68,68,.25)}
  .btn-ghost{background:rgba(34,197,94,.07);color:var(--textMuted);border:1px solid var(--border2)}
  .btn-ghost:hover{background:rgba(34,197,94,.15);color:var(--text);border-color:var(--border3)}
  .btn-gold{background:linear-gradient(135deg,#92400e,var(--gold));color:#000;font-weight:600}
  .btn-gold:hover{transform:translateY(-1px)}
  .btn-sm{padding:7px 14px;font-size:13px;border-radius:8px}
  .btn-icon{padding:8px;border-radius:8px;width:36px;height:36px;justify-content:center}

  /* CARDS */
  .card{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden}
  .card-hover{transition:transform .25s,border-color .25s,box-shadow .25s}
  .card-hover:hover{transform:translateY(-3px);border-color:var(--border3);box-shadow:0 12px 40px rgba(22,163,74,.12)}

  /* BADGE */
  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.4px}

  /* MODAL */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s}
  .modal{background:var(--card2);border:1px solid var(--border2);border-radius:20px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.7),0 0 0 1px rgba(34,197,94,.1)}

  /* SIDEBAR */
  .nav-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;cursor:pointer;border:none;background:transparent;color:var(--textDim);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;width:100%;transition:all .2s;text-align:left}
  .nav-item:hover{background:rgba(34,197,94,.08);color:var(--textMuted)}
  .nav-item.active{background:rgba(22,163,74,.18);color:var(--green4);border:1px solid rgba(34,197,94,.2)}
  .nav-item.active .nav-icon{color:var(--green3)}

  /* NOTIFY TOAST */
  .toast{position:fixed;top:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:12px;padding:14px 20px;border-radius:14px;font-size:14px;font-weight:500;animation:toastIn .35s cubic-bezier(.34,1.56,.64,1);box-shadow:0 8px 40px rgba(0,0,0,.5);max-width:340px}
  .toast-success{background:linear-gradient(135deg,rgba(22,101,52,.9),rgba(21,128,61,.9));border:1px solid rgba(34,197,94,.3);color:var(--greenLight)}
  .toast-error{background:linear-gradient(135deg,rgba(127,29,29,.9),rgba(153,27,27,.9));border:1px solid rgba(239,68,68,.3);color:#fecaca}
  .toast-info{background:linear-gradient(135deg,rgba(30,58,138,.9),rgba(29,78,216,.9));border:1px solid rgba(59,130,246,.3);color:#bfdbfe}

  /* STAT CARD */
  .stat{background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:20px 22px;transition:border-color .2s}
  .stat:hover{border-color:var(--border3)}

  /* PROGRESS */
  .prog-track{height:5px;background:rgba(34,197,94,.12);border-radius:3px;overflow:hidden}
  .prog-fill{height:100%;border-radius:3px;transition:width .6s cubic-bezier(.4,0,.2,1)}

  /* CHIP */
  .chip{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:24px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:rgba(13,20,16,.6);color:var(--textDim);transition:all .2s;white-space:nowrap}
  .chip:hover,.chip.on{border-color:var(--green3);color:var(--green4);background:rgba(22,163,74,.12)}

  /* PRODUCT CARD */
  .prod-card{background:var(--card);border:1px solid var(--border);border-radius:18px;overflow:hidden;transition:all .3s cubic-bezier(.4,0,.2,1)}
  .prod-card:hover{border-color:var(--border3);box-shadow:0 16px 48px rgba(22,163,74,.15),0 0 0 1px rgba(34,197,94,.1);transform:translateY(-4px)}

  /* DIVIDER */
  .hr{height:1px;background:var(--border);margin:16px 0}

  /* TABLE */
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:10px 16px;font-size:11px;color:var(--textDim);font-weight:600;letter-spacing:.8px;text-transform:uppercase;border-bottom:1px solid var(--border)}
  td{padding:14px 16px;font-size:13px;border-bottom:1px solid var(--border);vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tbody tr:hover td{background:rgba(34,197,94,.03)}

  /* INPUT GROUP */
  .field{display:flex;flex-direction:column;gap:7px;margin-bottom:16px}
  .field label{font-size:12px;color:var(--textMuted);font-weight:600;letter-spacing:.5px;text-transform:uppercase}

  /* ANIMATIONS */
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
  @keyframes toastIn{from{opacity:0;transform:translateY(-20px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(34,197,94,.1)}50%{box-shadow:0 0 40px rgba(34,197,94,.25)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes ripple{0%{transform:scale(0);opacity:1}100%{transform:scale(4);opacity:0}}

  .anim-up{animation:slideUp .4s ease both}
  .anim-right{animation:slideRight .3s ease both}
  .anim-fade{animation:fadeIn .4s ease both}
  .anim-float{animation:float 3s ease-in-out infinite}

  /* SCROLLBAR THIN */
  .thin-scroll::-webkit-scrollbar{width:2px}

  /* MOBILE */
  @media(max-width:900px){.hide-md{display:none!important}}
  @media(max-width:600px){.hide-sm{display:none!important};.modal{border-radius:20px 20px 0 0;max-height:95vh}}
  `;

  // ══════════════════════════════════════════════════════════════════
  // SHARED COMPONENTS
  // ══════════════════════════════════════════════════════════════════

  function Toast({ toasts }) {
    return (
      <div style={{ position:"fixed", top:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type || "success"}`}>
            <span style={{ fontSize:18 }}>{t.type === "error" ? "⚠️" : t.type === "info" ? "ℹ️" : "✓"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    );
  }

  function useToast() {
    const [toasts, setToasts] = useState([]);
    const push = useCallback((msg, type = "success") => {
      const id = uid();
      setToasts(p => [...p, { id, msg, type }]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
    }, []);
    return [toasts, push];
  }

  function Spinner() {
    return <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,.2)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} />;
  }

  function Badge({ status }) {
    const s = STATUS[status] || STATUS.new;
    return <span className="badge" style={{ background:s.bg, color:s.color, border:`1px solid ${s.color}30` }}>{s.label}</span>;
  }

  function Confirm({ msg, onYes, onNo }) {
    return (
      <div className="overlay">
        <div className="modal" style={{ maxWidth:380, padding:32, textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
          <div style={{ fontSize:16, marginBottom:8, fontWeight:600 }}>Tasdiqlash</div>
          <div style={{ color:"var(--textDim)", fontSize:14, marginBottom:28 }}>{msg}</div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button className="btn btn-danger" onClick={onYes}>Ha, o'chirish</button>
            <button className="btn btn-ghost" onClick={onNo}>Bekor qilish</button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // LOADING SCREEN
  // ══════════════════════════════════════════════════════════════════
  function LoadScreen() {
    const [dots, setDots] = useState(0);
    useEffect(() => { const t = setInterval(() => setDots(d => (d+1)%4), 400); return () => clearInterval(t); }, []);
    return (
      <div style={{ position:"fixed", inset:0, background:"var(--black)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:32, zIndex:9999 }}>
        {/* Animated orbs */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
          {[[20,20,300],[80,70,200],[10,80,250]].map(([x,y,s],i) => (
            <div key={i} style={{ position:"absolute", left:`${x}%`, top:`${y}%`, width:s, height:s, borderRadius:"50%", background:"radial-gradient(circle, rgba(22,163,74,.08) 0%, transparent 70%)", transform:"translate(-50%,-50%)" }} />
          ))}
        </div>
        <div className="anim-float" style={{ position:"relative" }}>
          <div style={{ width:90, height:90, borderRadius:"50%", background:"linear-gradient(135deg,var(--greenDark),var(--greenMid))", border:"2px solid var(--border3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, boxShadow:"0 0 60px rgba(22,163,74,.2)" }}>
            🍃
          </div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div className="serif" style={{ fontSize:36, fontWeight:700, background:"linear-gradient(135deg,#4ade80,#16a34a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6 }}>MUSTAFO CAFE</div>
          <div style={{ fontSize:13, color:"var(--textDim)" }}>Yuklanmoqda{"...".slice(0, dots + 1)}</div>
        </div>
        <div style={{ width:200, height:2, background:"var(--border)", borderRadius:1, overflow:"hidden" }}>
          <div style={{ height:"100%", background:"var(--green3)", borderRadius:1, animation:"loadBar 1.5s ease-in-out infinite" }} />
        </div>
        <style>{`@keyframes loadBar{0%{width:0;marginLeft:0}50%{width:60%;marginLeft:20%}100%{width:0;marginLeft:100%}}`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ADMIN LOGIN
  // ══════════════════════════════════════════════════════════════════
  function AdminLogin({ onLogin }) {
    const [u, setU] = useState("");
    const [p, setP] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const doLogin = () => {
      if (!u || !p) { setErr("Iltimos barcha maydonlarni to'ldiring"); return; }
      setLoading(true); setErr("");
      setTimeout(() => {
        const admin = DB.get("admin");
        if (u === admin.username && p === admin.password) { onLogin(); }
        else { setErr("Foydalanuvchi nomi yoki parol noto'g'ri"); setLoading(false); }
      }, 700);
    };

    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--black)", padding:20, position:"relative", overflow:"hidden" }}>
        {/* BG decoration */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-20%", right:"-10%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,163,74,.06) 0%,transparent 65%)" }} />
          <div style={{ position:"absolute", bottom:"-20%", left:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,163,74,.05) 0%,transparent 65%)" }} />
          {/* Grid */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.04 }} xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#22c55e" strokeWidth=".5"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
          </svg>
        </div>

        <div className="glass anim-up" style={{ width:"100%", maxWidth:420, padding:48, borderRadius:24, position:"relative" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div className="anim-float" style={{ display:"inline-flex", width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,var(--greenDark),var(--greenMid))", alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:20, border:"1px solid var(--border3)", boxShadow:"0 0 40px rgba(22,163,74,.2)" }}>🍃</div>
            <div className="serif" style={{ fontSize:28, fontWeight:700, background:"linear-gradient(135deg,#4ade80,#86efac)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>MUSTAFO CAFE</div>
            <div style={{ fontSize:13, color:"var(--textDim)", marginTop:6, letterSpacing:"2px", textTransform:"uppercase" }}>Admin Paneli</div>
          </div>

          <div className="field">
            <label>Foydalanuvchi nomi</label>
            <input placeholder="MUSTAFO" value={u} onChange={e => setU(e.target.value)} onKeyDown={e => e.key==="Enter" && doLogin()} autoComplete="username" />
          </div>
          <div className="field">
            <label>Parol</label>
            <div style={{ position:"relative" }}>
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key==="Enter" && doLogin()} style={{ paddingRight:44 }} autoComplete="current-password" />
              <button onClick={() => setShowPass(s => !s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--textDim)", fontSize:16, padding:4 }}>{showPass ? "🙈" : "👁"}</button>
            </div>
          </div>

          {err && (
            <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:10, padding:"11px 14px", color:"#fca5a5", fontSize:13, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
              <span>⚠️</span>{err}
            </div>
          )}

          <button className="btn btn-primary" style={{ width:"100%", padding:"14px 20px", fontSize:15, justifyContent:"center", marginTop:4 }} onClick={doLogin} disabled={loading}>
            {loading ? <><Spinner /> Tekshirilmoqda...</> : "Kirish →"}
          </button>

          <div style={{ textAlign:"center", marginTop:24, fontSize:12, color:"var(--textDim)", padding:"12px 0", borderTop:"1px solid var(--border)" }}>
            Standart hisob: <span style={{ color:"var(--green4)", fontWeight:600 }}>MUSTAFO</span> / <span style={{ color:"var(--green4)", fontWeight:600 }}>MUSTAFO13</span>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ADMIN SHELL
  // ══════════════════════════════════════════════════════════════════
  function AdminShell({ onLogout }) {
    const [page, setPage] = useState("dashboard");
    const [toasts, pushToast] = useToast();
    const [newBadge, setNewBadge] = useState(0);
    const [mobileSide, setMobileSide] = useState(false);
    const prevLen = useRef(DB.get("orders", []).length);

    useEffect(() => {
      const t = setInterval(() => {
        const ords = DB.get("orders", []);
        if (ords.length > prevLen.current) {
          const diff = ords.length - prevLen.current;
          setNewBadge(n => n + diff);
          chime();
          pushToast(`🔔 Yangi buyurtma keldi!`, "info");
          prevLen.current = ords.length;
        }
      }, 1500);
      return () => clearInterval(t);
    }, []);

    const nav = [
      { id:"dashboard", icon:"◈", label:"Boshqaruv paneli" },
      { id:"orders",    icon:"≡",  label:"Buyurtmalar", badge: newBadge },
      { id:"products",  icon:"⊞",  label:"Mahsulotlar" },
      { id:"categories",icon:"⊟",  label:"Kategoriyalar" },
      { id:"reports",   icon:"↗",  label:"Hisobotlar" },
      { id:"settings",  icon:"◎",  label:"Sozlamalar" },
    ];

    const go = (id) => {
      setPage(id);
      if (id === "orders") setNewBadge(0);
      setMobileSide(false);
    };

    return (
      <div style={{ display:"flex", minHeight:"100vh", position:"relative" }}>
        <Toast toasts={toasts} />

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 230, background:"linear-gradient(180deg,var(--card) 0%,var(--card2) 100%)",
          borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column",
          padding:"24px 12px", position:"fixed", top:0, left:0, height:"100vh", zIndex:200,
          transition:"transform .3s cubic-bezier(.4,0,.2,1)",
          transform: mobileSide ? "translateX(0)" : undefined,
        }} className="hide-md">
          <div style={{ padding:"0 8px 24px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,var(--greenDark),var(--greenMid))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, border:"1px solid var(--border3)" }}>🍃</div>
              <div>
                <div className="serif" style={{ fontSize:16, fontWeight:700, color:"var(--green4)", lineHeight:1 }}>MUSTAFO</div>
                <div style={{ fontSize:10, color:"var(--textDim)", letterSpacing:"1px", textTransform:"uppercase" }}>Admin Panel</div>
              </div>
            </div>
          </div>
          <nav style={{ flex:1, marginTop:16, display:"flex", flexDirection:"column", gap:3 }}>
            {nav.map(n => (
              <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => go(n.id)}>
                <span className="nav-icon" style={{ fontSize:16, width:20, textAlign:"center", fontFamily:"monospace" }}>{n.icon}</span>
                <span style={{ flex:1 }}>{n.label}</span>
                {n.badge > 0 && <span style={{ background:"var(--red)", color:"#fff", borderRadius:10, padding:"1px 7px", fontSize:11, fontWeight:700, minWidth:20, textAlign:"center" }}>{n.badge}</span>}
              </button>
            ))}
          </nav>
          <button className="nav-item" onClick={onLogout} style={{ marginTop:8, borderTop:"1px solid var(--border)", paddingTop:12 }}>
            <span style={{ fontSize:16 }}>⬡</span><span>Chiqish</span>
          </button>
        </aside>

        {/* ── MOBILE SIDEBAR ── */}
        {mobileSide && (
          <>
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:199 }} onClick={() => setMobileSide(false)} />
            <aside style={{ width:240, background:"var(--card2)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", padding:"24px 12px", position:"fixed", top:0, left:0, height:"100vh", zIndex:200, animation:"slideRight .3s ease" }}>
              <div style={{ padding:"0 8px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div className="serif" style={{ fontSize:16, color:"var(--green4)" }}>MUSTAFO CAFE</div>
                <button onClick={() => setMobileSide(false)} style={{ background:"none", border:"none", color:"var(--textDim)", fontSize:20, cursor:"pointer" }}>✕</button>
              </div>
              <nav style={{ flex:1, marginTop:12, display:"flex", flexDirection:"column", gap:3 }}>
                {nav.map(n => (
                  <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => go(n.id)}>
                    <span style={{ fontSize:16, width:20, textAlign:"center" }}>{n.icon}</span>
                    <span style={{ flex:1 }}>{n.label}</span>
                    {n.badge > 0 && <span style={{ background:"var(--red)", color:"#fff", borderRadius:10, padding:"1px 7px", fontSize:11, fontWeight:700 }}>{n.badge}</span>}
                  </button>
                ))}
              </nav>
              <button className="nav-item" onClick={onLogout}><span>⬡</span><span>Chiqish</span></button>
            </aside>
          </>
        )}

        {/* ── MAIN ── */}
        <div style={{ flex:1, marginLeft:230, display:"flex", flexDirection:"column", minWidth:0 }} className="hide-md-margin">
          <style>{`.hide-md-margin{margin-left:230px}@media(max-width:900px){.hide-md-margin{margin-left:0!important}}`}</style>

          {/* Topbar */}
          <div style={{ background:"rgba(8,12,10,.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button onClick={() => setMobileSide(true)} style={{ display:"none", background:"none", border:"1px solid var(--border)", borderRadius:8, color:"var(--textMuted)", padding:"6px 10px", cursor:"pointer", fontSize:16 }} className="show-mobile">☰</button>
              <style>{`@media(max-width:900px){.show-mobile{display:flex!important}}`}</style>
              <div>
                <div style={{ fontSize:15, fontWeight:600, color:"var(--text)" }}>{nav.find(n => n.id === page)?.label}</div>
                <div style={{ fontSize:11, color:"var(--textDim)" }}>{new Date().toLocaleDateString("uz-UZ", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {newBadge > 0 && <div style={{ background:"var(--red)", color:"#fff", borderRadius:10, padding:"3px 10px", fontSize:12, fontWeight:700, animation:"pulse 1.5s infinite" }}>{newBadge} yangi</div>}
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(22,163,74,.1)", border:"1px solid var(--border2)", borderRadius:10, padding:"7px 12px" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--green4)", boxShadow:"0 0 6px var(--green3)", animation:"glow 2s infinite" }} />
                <span style={{ fontSize:13, color:"var(--textMuted)", fontWeight:500 }}>Admin</span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex:1, padding:"28px 24px", overflowX:"hidden" }}>
            {page === "dashboard"  && <Dashboard pushToast={pushToast} />}
            {page === "orders"     && <OrdersPage pushToast={pushToast} />}
            {page === "products"   && <ProductsPage pushToast={pushToast} />}
            {page === "categories" && <CategoriesPage pushToast={pushToast} />}
            {page === "reports"    && <ReportsPage />}
            {page === "settings"   && <SettingsPage pushToast={pushToast} />}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════════════
  function Dashboard({ pushToast }) {
    const [orders] = useState(() => DB.get("orders", []));
    const [products] = useState(() => DB.get("prods", []));
    const [cats] = useState(() => DB.get("cats", []));

    const dlv = orders.filter(o => o.status === "delivered");
    const todayStr = new Date().toDateString();
    const weekAgo = Date.now() - 7*86400000;
    const monthStr = new Date().toISOString().slice(0,7);

    const todayRev  = dlv.filter(o => new Date(o.createdAt).toDateString() === todayStr).reduce((s,o) => s+o.total, 0);
    const weekRev   = dlv.filter(o => new Date(o.createdAt).getTime() > weekAgo).reduce((s,o) => s+o.total, 0);
    const monthRev  = dlv.filter(o => o.createdAt?.startsWith(monthStr)).reduce((s,o) => s+o.total, 0);
    const totalRev  = dlv.reduce((s,o) => s+o.total, 0);
    const newOrds   = orders.filter(o => o.status === "new").length;

    // Sales
    const sales = {};
    dlv.forEach(o => o.items?.forEach(i => { sales[i.name] = (sales[i.name]||0) + i.qty; }));
    const best = Object.entries(sales).sort((a,b) => b[1]-a[1]).slice(0,6);

    const statCards = [
      { label:"Bugungi daromad",  val:money(todayRev),  icon:"☀️",  color:"#4ade80" },
      { label:"Haftalik daromad", val:money(weekRev),   icon:"📅",  color:"#34d399" },
      { label:"Oylik daromad",    val:money(monthRev),  icon:"📆",  color:"var(--gold)" },
      { label:"Jami daromad",     val:money(totalRev),  icon:"💰",  color:"#a78bfa" },
      { label:"Yangi buyurtmalar",val:newOrds,           icon:"🔔",  color:"var(--red)" },
      { label:"Jami buyurtmalar", val:orders.length,    icon:"📋",  color:"#60a5fa" },
      { label:"Mahsulotlar",      val:products.length,  icon:"🍽",  color:"#f59e0b" },
      { label:"Kategoriyalar",    val:cats.length,       icon:"📁",  color:"#22d3ee" },
    ];

    return (
      <div className="anim-up">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h2 className="serif">Boshqaruv paneli</h2>
            <div style={{ fontSize:13, color:"var(--textDim)", marginTop:4 }}>Restoran faoliyatining umumiy ko'rinishi</div>
          </div>
          <div style={{ fontSize:24, animation:"float 3s ease-in-out infinite" }}>🍃</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14, marginBottom:28 }}>
          {statCards.map((s,i) => (
            <div key={s.label} className="stat anim-up" style={{ animationDelay:`${i*0.05}s` }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:12, color:"var(--textDim)", marginTop:6, lineHeight:1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:20 }}>
          <div className="card" style={{ padding:24 }}>
            <div style={{ fontWeight:600, marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>🏆</span> Eng ko'p sotilgan mahsulotlar
            </div>
            {best.length === 0 && <div style={{ color:"var(--textDim)", fontSize:13, textAlign:"center", padding:20 }}>Hali ma'lumot yo'q</div>}
            {best.map(([name, cnt], i) => (
              <div key={name} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13 }}><span style={{ color:"var(--textDim)", marginRight:6 }}>{i+1}.</span>{name}</span>
                  <span style={{ fontSize:13, color:"var(--green4)", fontWeight:600 }}>{cnt} ta</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width:`${(cnt/(best[0]?.[1]||1))*100}%`, background:`linear-gradient(90deg,var(--green2),var(--green4))` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:24 }}>
            <div style={{ fontWeight:600, marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>📋</span> So'nggi buyurtmalar
            </div>
            {[...orders].reverse().slice(0,5).map(o => (
              <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{o.name}</div>
                  <div style={{ fontSize:11, color:"var(--textDim)", marginTop:2 }}>{o.time}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, color:"var(--green4)", fontWeight:600 }}>{money(o.total)}</div>
                  <Badge status={o.status} />
                </div>
              </div>
            ))}
            {orders.length === 0 && <div style={{ color:"var(--textDim)", fontSize:13, textAlign:"center", padding:20 }}>Buyurtmalar yo'q</div>}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ORDERS PAGE
  // ══════════════════════════════════════════════════════════════════
  function OrdersPage({ pushToast }) {
    const [orders, setOrders] = useState(() => DB.get("orders", []));
    const [filter, setFilter] = useState("all");
    const [detail, setDetail] = useState(null);

    useEffect(() => {
      const t = setInterval(() => setOrders(DB.get("orders", [])), 2000);
      return () => clearInterval(t);
    }, []);

    const setStatus = (id, status) => {
      const upd = orders.map(o => o.id === id ? { ...o, status } : o);
      DB.set("orders", upd);
      setOrders(upd);
      if (detail?.id === id) setDetail(d => ({ ...d, status }));
      pushToast("Buyurtma holati yangilandi");
    };

    const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

    return (
      <div className="anim-up">
        <div style={{ marginBottom:24 }}>
          <h2 className="serif">Buyurtmalar</h2>
          <div style={{ fontSize:13, color:"var(--textDim)", marginTop:4 }}>Jami: {orders.length} ta buyurtma</div>
        </div>

        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          {[["all","Barchasi"], ...Object.entries(STATUS).map(([k,v]) => [k,v.label])].map(([k,l]) => (
            <button key={k} className={`chip ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>
              {l}
              <span style={{ background:"rgba(255,255,255,.08)", padding:"1px 6px", borderRadius:8, fontSize:11, marginLeft:2 }}>
                {k === "all" ? orders.length : orders.filter(o => o.status === k).length}
              </span>
            </button>
          ))}
        </div>

        <div>
          {[...filtered].reverse().map(o => (
            <div key={o.id} onClick={() => setDetail(o)} style={{ background:"var(--card2)", border:"1px solid var(--border)", borderRadius:14, padding:18, marginBottom:10, cursor:"pointer", transition:"all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="var(--border3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>{o.name}</div>
                  <div style={{ fontSize:12, color:"var(--textDim)", marginBottom:6 }}>📞 {o.phone} · 🕐 {o.time}</div>
                  <div style={{ fontSize:12, color:"var(--textSub)" }}>{o.items?.map(i => `${i.name}×${i.qty}`).join(", ")}</div>
                </div>
                <div style={{ textAlign:"right", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                  <div style={{ fontSize:18, fontWeight:700, color:"var(--green4)" }}>{money(o.total)}</div>
                  <Badge status={o.status} />
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--textDim)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
              <div>Buyurtmalar topilmadi</div>
            </div>
          )}
        </div>

        {detail && (
          <div className="overlay" onClick={() => setDetail(null)}>
            <div className="modal" style={{ padding:30 }} onClick={e => e.stopPropagation()}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div>
                  <div className="serif" style={{ fontSize:22 }}>Buyurtma tafsiloti</div>
                  <div style={{ fontSize:12, color:"var(--textDim)", marginTop:2 }}>ID: {detail.id}</div>
                </div>
                <button onClick={() => setDetail(null)} style={{ background:"none", border:"none", color:"var(--textDim)", fontSize:22, cursor:"pointer" }}>✕</button>
              </div>

              <div style={{ background:"rgba(22,163,74,.05)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
                {[["👤 Mijoz", detail.name], ["📞 Telefon", detail.phone], ["🕐 Vaqt", detail.time], detail.comment && ["💬 Izoh", detail.comment]].filter(Boolean).map(([k,v]) => (
                  <div key={k} style={{ display:"flex", gap:12, padding:"5px 0", fontSize:14 }}>
                    <span style={{ color:"var(--textDim)", minWidth:100 }}>{k}</span>
                    <span style={{ fontWeight:500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, color:"var(--textDim)", fontWeight:600, letterSpacing:".5px", textTransform:"uppercase", marginBottom:12 }}>Buyurtma tarkibi</div>
                {detail.items?.map((item, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                    <span style={{ fontSize:14 }}>{item.name} <span style={{ color:"var(--textDim)" }}>× {item.qty}</span></span>
                    <span style={{ fontSize:14, color:"var(--green4)", fontWeight:600 }}>{money(item.price * item.qty)}</span>
                  </div>
                ))}
                {detail.discount > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", color:"var(--red)" }}>
                    <span style={{ fontSize:13 }}>Chegirma ({detail.promoCode})</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>-{money(detail.discount)}</span>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderTop:"2px solid var(--border2)", marginTop:4 }}>
                  <span style={{ fontWeight:700, fontSize:16 }}>Jami to'lov</span>
                  <span style={{ fontWeight:700, fontSize:18, color:"var(--green4)" }}>{money(detail.total)}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize:12, color:"var(--textDim)", fontWeight:600, letterSpacing:".5px", textTransform:"uppercase", marginBottom:12 }}>Holat o'zgartirish</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {Object.entries(STATUS).map(([k,v]) => (
                    <button key={k} onClick={() => setStatus(detail.id, k)}
                      style={{ padding:"8px 16px", borderRadius:10, border:`1px solid ${k === detail.status ? v.color : "var(--border)"}`, background: k === detail.status ? v.bg : "transparent", color: k === detail.status ? v.color : "var(--textDim)", fontSize:13, fontWeight: k === detail.status ? 700 : 400, cursor:"pointer", transition:"all .2s" }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PRODUCT MODAL
  // ══════════════════════════════════════════════════════════════════
  function ProductModal({ prod, cats, onSave, onClose }) {
    const blank = { name:"", price:"", desc:"", catId: cats[0]?.id||"", image:"", available:true, discount:0, featured:false, stock:10 };
    const [f, setF] = useState(prod ? { ...prod } : blank);
    const [preview, setPreview] = useState(prod?.image || "");
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();
    const set = (k,v) => setF(p => ({ ...p, [k]:v }));

    const handleFile = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => { set("image", ev.target.result); setPreview(ev.target.result); };
      r.readAsDataURL(file);
    };

    const save = () => {
      if (!f.name.trim()) { alert("Mahsulot nomini kiriting"); return; }
      if (!f.price || isNaN(f.price)) { alert("To'g'ri narx kiriting"); return; }
      setSaving(true);
      setTimeout(() => {
        onSave({ ...f, price: parseFloat(f.price), stock: parseInt(f.stock)||0, discount: parseFloat(f.discount)||0, id: f.id || uid() });
      }, 300);
    };

    return (
      <div className="overlay">
        <div className="modal" style={{ padding:30 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <div className="serif" style={{ fontSize:22 }}>{prod ? "Mahsulotni tahrirlash" : "Mahsulot qo'shish"}</div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--textDim)", fontSize:22, cursor:"pointer" }}>✕</button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <div className="field" style={{ gridColumn:"1/-1" }}>
              <label>Mahsulot nomi *</label>
              <input placeholder="Masalan: Kapuchino" value={f.name} onChange={e => set("name",e.target.value)} />
            </div>
            <div className="field">
              <label>Narxi (so'm) *</label>
              <input type="number" placeholder="25000" value={f.price} onChange={e => set("price",e.target.value)} />
            </div>
            <div className="field">
              <label>Kategoriya</label>
              <select value={f.catId} onChange={e => set("catId",e.target.value)}>
                {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Chegirma (%)</label>
              <input type="number" min="0" max="100" placeholder="0" value={f.discount} onChange={e => set("discount",e.target.value)} />
            </div>
            <div className="field">
              <label>Ombor miqdori</label>
              <input type="number" min="0" placeholder="10" value={f.stock} onChange={e => set("stock",e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn:"1/-1" }}>
              <label>Tavsif</label>
              <textarea rows={2} placeholder="Mahsulot haqida qisqacha ma'lumot..." value={f.desc} onChange={e => set("desc",e.target.value)} style={{ resize:"vertical" }} />
            </div>
            <div className="field" style={{ gridColumn:"1/-1" }}>
              <label>Rasm</label>
              <div style={{ display:"flex", gap:8 }}>
                <input placeholder="https://images.unsplash.com/..." value={f.image} onChange={e => { set("image",e.target.value); setPreview(e.target.value); }} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()} style={{ whiteSpace:"nowrap", flexShrink:0 }}>📁 Yuklash</button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
              </div>
              {preview && <img src={preview} alt="" style={{ width:"100%", height:130, objectFit:"cover", borderRadius:10, marginTop:8, border:"1px solid var(--border)" }} onError={() => setPreview("")} />}
            </div>
            <div style={{ gridColumn:"1/-1", display:"flex", gap:24 }}>
              <label style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, cursor:"pointer" }}>
                <input type="checkbox" checked={f.available} onChange={e => set("available",e.target.checked)} style={{ width:"auto", accentColor:"var(--green3)" }} />
                <span>Mavjud</span>
              </label>
              <label style={{ display:"flex", alignItems:"center", gap:9, fontSize:14, cursor:"pointer" }}>
                <input type="checkbox" checked={f.featured} onChange={e => set("featured",e.target.checked)} style={{ width:"auto", accentColor:"var(--gold)" }} />
                <span>Tanlangan ⭐</span>
              </label>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={save} disabled={saving}>
              {saving ? <><Spinner /> Saqlanmoqda...</> : "✓ Saqlash"}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Bekor qilish</button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PRODUCTS PAGE
  // ══════════════════════════════════════════════════════════════════
  function ProductsPage({ pushToast }) {
    const [prods, setProds] = useState(() => DB.get("prods", []));
    const [cats]  = useState(() => DB.get("cats",  []));
    const [modal, setModal] = useState(null); // null | {} | product
    const [search, setSearch] = useState("");
    const [confirmId, setConfirmId] = useState(null);

    const save = (prod) => {
      const exists = prods.find(p => p.id === prod.id);
      const upd = exists ? prods.map(p => p.id === prod.id ? prod : p) : [...prods, prod];
      DB.set("prods", upd);
      setProds(upd);
      setModal(null);
      pushToast(exists ? "Mahsulot yangilandi ✓" : "Mahsulot qo'shildi ✓");
    };

    const del = (id) => {
      const upd = prods.filter(p => p.id !== id);
      DB.set("prods", upd);
      setProds(upd);
      setConfirmId(null);
      pushToast("Mahsulot o'chirildi", "error");
    };

    const filtered = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="anim-up">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 className="serif">Mahsulotlar</h2>
            <div style={{ fontSize:13, color:"var(--textDim)", marginTop:4 }}>Jami: {prods.length} ta mahsulot</div>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({})}>+ Mahsulot qo'shish</button>
        </div>

        <input placeholder="🔍 Mahsulot qidirish..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom:20, maxWidth:340 }} />

        <div style={{ overflowX:"auto" }}>
          <table>
            <thead>
              <tr>
                <th>Rasm</th><th>Nomi</th><th>Narxi</th><th>Kategoriya</th>
                <th>Holat</th><th>Chegirma</th><th>Ombor</th><th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const cat = cats.find(c => c.id === p.catId);
                const fin = p.discount > 0 ? p.price*(1-p.discount/100) : p.price;
                const avail = p.available && p.stock > 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ width:48, height:48, borderRadius:10, overflow:"hidden", border:"1px solid var(--border)" }}>
                        <img src={p.image || "https://via.placeholder.com/48"} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight:600, marginBottom:2 }}>{p.name}</div>
                      {p.featured && <span style={{ fontSize:10, color:"var(--gold)" }}>⭐ Tanlangan</span>}
                    </td>
                    <td>
                      <div style={{ color:"var(--green4)", fontWeight:700 }}>{money(fin)}</div>
                      {p.discount > 0 && <div style={{ fontSize:11, color:"var(--textDim)", textDecoration:"line-through" }}>{money(p.price)}</div>}
                    </td>
                    <td><span style={{ fontSize:13 }}>{cat?.emoji} {cat?.name || "—"}</span></td>
                    <td>
                      <span className="badge" style={{ background: avail ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)", color: avail ? "var(--green4)" : "var(--red)", border:`1px solid ${avail?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}` }}>
                        {avail ? "Mavjud" : "Mavjud emas"}
                      </span>
                    </td>
                    <td>{p.discount > 0 ? <span style={{ color:"var(--gold)", fontWeight:600 }}>-{p.discount}%</span> : <span style={{ color:"var(--textDim)" }}>—</span>}</td>
                    <td><span style={{ fontWeight:600, color: p.stock < 5 ? "var(--red)" : "var(--textMuted)" }}>{p.stock}</span></td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>✏️ Tahrirlash</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(p.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign:"center", padding:"50px 20px", color:"var(--textDim)" }}>Mahsulotlar topilmadi</div>}
        </div>

        {modal !== null && <ProductModal prod={modal.id ? modal : null} cats={cats} onSave={save} onClose={() => setModal(null)} />}
        {confirmId && <Confirm msg="Bu mahsulotni o'chirishni tasdiqlaysizmi?" onYes={() => del(confirmId)} onNo={() => setConfirmId(null)} />}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // CATEGORIES PAGE
  // ══════════════════════════════════════════════════════════════════
  function CategoriesPage({ pushToast }) {
    const [cats, setCats] = useState(() => DB.get("cats", []));
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name:"", emoji:"🍽", image:"" });
    const [preview, setPreview] = useState("");
    const [confirmId, setConfirmId] = useState(null);
    const fileRef = useRef();
    const fset = (k,v) => setForm(p => ({ ...p, [k]:v }));

    const openAdd  = () => { setForm({ name:"", emoji:"🍽", image:"" }); setPreview(""); setModal("add"); };
    const openEdit = (c) => { setForm(c); setPreview(c.image); setModal("edit"); };

    const handleFile = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => { fset("image", ev.target.result); setPreview(ev.target.result); };
      r.readAsDataURL(file);
    };

    const save = () => {
      if (!form.name.trim()) return;
      let upd;
      if (modal === "edit") upd = cats.map(c => c.id === form.id ? form : c);
      else upd = [...cats, { ...form, id: uid() }];
      DB.set("cats", upd); setCats(upd); setModal(null);
      pushToast(modal === "edit" ? "Kategoriya yangilandi ✓" : "Kategoriya qo'shildi ✓");
    };

    const del = id => {
      const upd = cats.filter(c => c.id !== id);
      DB.set("cats", upd); setCats(upd); setConfirmId(null);
      pushToast("Kategoriya o'chirildi", "error");
    };

    const EMOJIS = ["☕","🍽","🥗","🍰","🍞","🥩","🍜","🥤","🍣","🌮","🍕","🥘","🍲","🥙","🫕"];

    return (
      <div className="anim-up">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 className="serif">Kategoriyalar</h2>
            <div style={{ fontSize:13, color:"var(--textDim)", marginTop:4 }}>Jami: {cats.length} ta kategoriya</div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Kategoriya qo'shish</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16 }}>
          {cats.map((c,i) => (
            <div key={c.id} className="card card-hover anim-up" style={{ animationDelay:`${i*.06}s` }}>
              <div style={{ position:"relative", height:130, overflow:"hidden" }}>
                <img src={c.image || "https://via.placeholder.com/220x130"} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.7),transparent)" }} />
                <div style={{ position:"absolute", bottom:10, left:12, fontSize:26 }}>{c.emoji}</div>
              </div>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontWeight:600, marginBottom:12 }}>{c.name}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={() => openEdit(c)}>✏️ Tahrirlash</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(c.id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {modal && (
          <div className="overlay">
            <div className="modal" style={{ padding:30 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
                <div className="serif" style={{ fontSize:22 }}>{modal==="edit" ? "Kategoriyani tahrirlash" : "Kategoriya qo'shish"}</div>
                <button onClick={() => setModal(null)} style={{ background:"none", border:"none", color:"var(--textDim)", fontSize:22, cursor:"pointer" }}>✕</button>
              </div>
              <div className="field">
                <label>Kategoriya nomi *</label>
                <input placeholder="Masalan: Ichimliklar" value={form.name} onChange={e => fset("name",e.target.value)} />
              </div>
              <div className="field">
                <label>Emoji tanlash</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {EMOJIS.map(em => (
                    <button key={em} onClick={() => fset("emoji",em)} style={{ width:40, height:40, borderRadius:8, border:`2px solid ${form.emoji===em?"var(--green3)":"var(--border)"}`, background: form.emoji===em ? "rgba(22,163,74,.15)" : "transparent", cursor:"pointer", fontSize:20 }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Rasm URL yoki yuklash</label>
                <div style={{ display:"flex", gap:8 }}>
                  <input placeholder="https://..." value={form.image} onChange={e => { fset("image",e.target.value); setPreview(e.target.value); }} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()} style={{ flexShrink:0 }}>📁</button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
                </div>
                {preview && <img src={preview} alt="" style={{ width:"100%", height:120, objectFit:"cover", borderRadius:10, marginTop:8, border:"1px solid var(--border)" }} onError={() => setPreview("")} />}
              </div>
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={save}>✓ Saqlash</button>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Bekor qilish</button>
              </div>
            </div>
          </div>
        )}

        {confirmId && <Confirm msg="Bu kategoriyani o'chirishni tasdiqlaysizmi?" onYes={() => del(confirmId)} onNo={() => setConfirmId(null)} />}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // REPORTS PAGE
  // ══════════════════════════════════════════════════════════════════
  function ReportsPage() {
    const orders = DB.get("orders", []);
    const prods  = DB.get("prods", []);
    const cats   = DB.get("cats", []);
    const dlv    = orders.filter(o => o.status === "delivered");

    const todayStr = new Date().toDateString();
    const weekAgo  = Date.now() - 7*86400000;
    const monthStr = new Date().toISOString().slice(0,7);
    const yearStr  = new Date().getFullYear().toString();

    const r = {
      today:  dlv.filter(o => new Date(o.createdAt).toDateString()===todayStr).reduce((s,o)=>s+o.total,0),
      week:   dlv.filter(o => new Date(o.createdAt).getTime()>weekAgo).reduce((s,o)=>s+o.total,0),
      month:  dlv.filter(o => o.createdAt?.startsWith(monthStr)).reduce((s,o)=>s+o.total,0),
      year:   dlv.filter(o => o.createdAt?.startsWith(yearStr)).reduce((s,o)=>s+o.total,0),
      total:  dlv.reduce((s,o)=>s+o.total,0),
      avg:    dlv.length ? dlv.reduce((s,o)=>s+o.total,0)/dlv.length : 0,
    };

    const sales = {};
    dlv.forEach(o => o.items?.forEach(i => { sales[i.name] = (sales[i.name]||0)+i.qty; }));
    const sortedS = Object.entries(sales).sort((a,b) => b[1]-a[1]);

    const catSales = {};
    dlv.forEach(o => o.items?.forEach(i => {
      const p = prods.find(pr => pr.name===i.name);
      const c = cats.find(c => c.id===p?.catId);
      if (c) catSales[c.name] = (catSales[c.name]||0)+i.qty;
    }));

    const revRows = [
      { icon:"☀️", label:"Bugungi daromad",  val:r.today,  color:"#4ade80" },
      { icon:"📅", label:"Haftalik daromad", val:r.week,   color:"#34d399" },
      { icon:"📆", label:"Oylik daromad",    val:r.month,  color:"#a78bfa" },
      { icon:"🗓", label:"Yillik daromad",   val:r.year,   color:"var(--gold)" },
      { icon:"💳", label:"O'rtacha buyurtma",val:r.avg,    color:"#60a5fa" },
      { icon:"💰", label:"Jami daromad",     val:r.total,  color:"#f472b6" },
    ];

    return (
      <div className="anim-up">
        <div style={{ marginBottom:28 }}>
          <h2 className="serif">Hisobotlar va statistika</h2>
          <div style={{ fontSize:13, color:"var(--textDim)", marginTop:4 }}>To'liq savdo va buyurtma tahlili</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14, marginBottom:28 }}>
          {revRows.map((s,i) => (
            <div key={s.label} className="stat anim-up" style={{ animationDelay:`${i*.05}s` }}>
              <div style={{ fontSize:24, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontSize:20, fontWeight:700, color:s.color, lineHeight:1 }}>{money(s.val)}</div>
              <div style={{ fontSize:11, color:"var(--textDim)", marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
          <div className="card" style={{ padding:22 }}>
            <div style={{ fontWeight:600, marginBottom:18, fontSize:15 }}>📦 Mahsulot sotuvi reytingi</div>
            {sortedS.length===0 && <div style={{ color:"var(--textDim)", fontSize:13 }}>Ma'lumot yo'q</div>}
            {sortedS.map(([name, cnt], i) => (
              <div key={name} style={{ marginBottom:13 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13 }}><span style={{ color:"var(--textDim)", marginRight:6 }}>{i+1}.</span>{name}</span>
                  <span style={{ fontSize:13, color:"var(--green4)", fontWeight:700 }}>{cnt} ta</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width:`${(cnt/(sortedS[0]?.[1]||1))*100}%`, background:`linear-gradient(90deg,var(--green2),var(--green4))` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:22 }}>
            <div style={{ fontWeight:600, marginBottom:18, fontSize:15 }}>📁 Kategoriya savdosi</div>
            {Object.entries(catSales).length===0 && <div style={{ color:"var(--textDim)", fontSize:13 }}>Ma'lumot yo'q</div>}
            {Object.entries(catSales).sort((a,b)=>b[1]-a[1]).map(([name,cnt]) => (
              <div key={name} style={{ marginBottom:13 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13 }}>{name}</span>
                  <span style={{ fontSize:13, color:"var(--gold)", fontWeight:700 }}>{cnt} ta</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width:`${(cnt/(Object.values(catSales).sort((a,b)=>b-a)[0]||1))*100}%`, background:`linear-gradient(90deg,#92400e,var(--gold))` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:22 }}>
          <div style={{ fontWeight:600, marginBottom:18, fontSize:15 }}>📊 Buyurtma holatlari</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:12 }}>
            {Object.entries(STATUS).map(([k,v]) => (
              <div key={k} style={{ textAlign:"center", padding:"16px 10px", background:v.bg, border:`1px solid ${v.color}30`, borderRadius:12 }}>
                <div style={{ fontSize:24, fontWeight:800, color:v.color }}>{orders.filter(o=>o.status===k).length}</div>
                <div style={{ fontSize:12, color:"var(--textDim)", marginTop:6 }}>{v.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // SETTINGS PAGE
  // ══════════════════════════════════════════════════════════════════
  function SettingsPage({ pushToast }) {
    const admin = DB.get("admin");
    const tgInit = DB.get("tg", DEFAULT_TG);

    const [acc, setAcc] = useState({ username: admin.username, curPass:"", newPass:"", confirmPass:"" });
    const [tg, setTg]   = useState({ token: tgInit.token, chatId: tgInit.chatId });
    const [accErr, setAccErr] = useState("");
    const [tgStatus, setTgStatus] = useState("");
    const [testing, setTesting] = useState(false);

    const saveAcc = () => {
      setAccErr("");
      if (!acc.curPass) { setAccErr("Joriy parolni kiriting"); return; }
      if (acc.curPass !== admin.password) { setAccErr("Joriy parol noto'g'ri"); return; }
      if (acc.newPass && acc.newPass.length < 6) { setAccErr("Yangi parol kamida 6 ta belgi bo'lishi kerak"); return; }
      if (acc.newPass && acc.newPass !== acc.confirmPass) { setAccErr("Yangi parollar mos kelmaydi"); return; }
      DB.set("admin", { username: acc.username || admin.username, password: acc.newPass || admin.password });
      setAcc(a => ({ ...a, curPass:"", newPass:"", confirmPass:"" }));
      pushToast("Hisob ma'lumotlari saqlandi ✓");
    };

    const saveTg = () => {
      DB.set("tg", { token: tg.token.trim(), chatId: tg.chatId.trim() });
      pushToast("Telegram sozlamalari saqlandi ✓");
    };

    const testTg = async () => {
      setTesting(true); setTgStatus("");
      DB.set("tg", { token: tg.token.trim(), chatId: tg.chatId.trim() });
      const res = await sendTelegram({
        id: "TEST-" + uid(), name: "Test Foydalanuvchi", phone: "+998901234567",
        comment: "Bu test xabari", time: nowStr(), createdAt: isoNow(),
        items: [{ name:"Kapuchino", qty:2, price:25000 }, { name:"Lag'mon", qty:1, price:38000 }],
        subtotal: 88000, discount: 4400, promoCode:"MUSTAFO", total: 83600,
      });
      setTesting(false);
      if (res.ok) { setTgStatus("✅ Telegram xabari muvaffaqiyatli yuborildi!"); pushToast("Test xabari yuborildi ✓"); }
      else { setTgStatus(`❌ Xato: ${res.reason || "Noma'lum xato"}`); pushToast("Telegram xatosi: " + res.reason, "error"); }
    };

    return (
      <div className="anim-up" style={{ maxWidth:580 }}>
        <div style={{ marginBottom:28 }}>
          <h2 className="serif">Sozlamalar</h2>
          <div style={{ fontSize:13, color:"var(--textDim)", marginTop:4 }}>Hisob va integratsiya sozlamalari</div>
        </div>

        {/* Account */}
        <div className="card" style={{ padding:28, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
            <span style={{ fontSize:22 }}>🔐</span>
            <div>
              <div style={{ fontWeight:600, fontSize:16 }}>Hisob sozlamalari</div>
              <div style={{ fontSize:12, color:"var(--textDim)" }}>Foydalanuvchi nomi va parolni o'zgartirish</div>
            </div>
          </div>
          <div className="field">
            <label>Foydalanuvchi nomi</label>
            <input value={acc.username} onChange={e => setAcc(a=>({...a,username:e.target.value}))} />
          </div>
          <div className="hr" />
          <div className="field">
            <label>Joriy parol *</label>
            <input type="password" placeholder="••••••••" value={acc.curPass} onChange={e => setAcc(a=>({...a,curPass:e.target.value}))} />
          </div>
          <div className="field">
            <label>Yangi parol (ixtiyoriy)</label>
            <input type="password" placeholder="Yangi parol (min. 6 ta belgi)" value={acc.newPass} onChange={e => setAcc(a=>({...a,newPass:e.target.value}))} />
          </div>
          <div className="field">
            <label>Yangi parolni tasdiqlang</label>
            <input type="password" placeholder="Qaytadan kiriting" value={acc.confirmPass} onChange={e => setAcc(a=>({...a,confirmPass:e.target.value}))} />
          </div>
          {accErr && <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:10, padding:"11px 14px", color:"#fca5a5", fontSize:13, marginBottom:16 }}>⚠️ {accErr}</div>}
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={saveAcc}>Saqlash</button>
        </div>

        {/* Telegram */}
        <div className="card" style={{ padding:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
            <span style={{ fontSize:22 }}>✈️</span>
            <div>
              <div style={{ fontWeight:600, fontSize:16 }}>Telegram Bot sozlamalari</div>
              <div style={{ fontSize:12, color:"var(--textDim)" }}>Yangi buyurtmalar uchun bildirishnomalar</div>
            </div>
          </div>

          <div style={{ background:"rgba(59,130,246,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:12, padding:"14px 16px", marginBottom:20, fontSize:13, lineHeight:1.7 }}>
            <div style={{ fontWeight:600, marginBottom:8, color:"#93c5fd" }}>📋 Sozlash qo'llanmasi:</div>
            <div style={{ color:"var(--textDim)" }}>
              1. Telegram da <b style={{ color:"#93c5fd" }}>@BotFather</b> ga yozing<br/>
              2. <b style={{ color:"#93c5fd" }}>/newbot</b> buyrug'ini yuboring<br/>
              3. Bot nomini kiriting, keyin <b style={{ color:"#93c5fd" }}>BOT TOKEN</b> oling<br/>
              4. <b style={{ color:"#93c5fd" }}>@userinfobot</b> dan o'z Chat ID ingizni bilib oling<br/>
              5. Quyidagi maydonlarga kiriting va saqlang
            </div>
          </div>

          <div className="field">
            <label>Bot Token</label>
            <input
              placeholder="123456789:AABBccDDeeFFggHH..."
              value={tg.token}
              onChange={e => setTg(t=>({...t,token:e.target.value}))}
              type="password"
            />
            <div style={{ fontSize:11, color:"var(--textDim)", marginTop:4 }}>@BotFather dan olingan token — .env TELEGRAM_BOT_TOKEN</div>
          </div>
          <div className="field">
            <label>Chat ID</label>
            <input
              placeholder="-1001234567890 yoki 123456789"
              value={tg.chatId}
              onChange={e => setTg(t=>({...t,chatId:e.target.value}))}
            />
            <div style={{ fontSize:11, color:"var(--textDim)", marginTop:4 }}>Shaxsiy yoki guruh Chat ID — .env TELEGRAM_CHAT_ID</div>
          </div>

          {tgStatus && (
            <div style={{ background: tgStatus.startsWith("✅") ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.08)", border:`1px solid ${tgStatus.startsWith("✅") ? "rgba(34,197,94,.2)" : "rgba(239,68,68,.2)"}`, borderRadius:10, padding:"11px 14px", fontSize:13, marginBottom:16, color: tgStatus.startsWith("✅") ? "var(--green4)" : "#fca5a5" }}>
              {tgStatus}
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={saveTg}>💾 Saqlash</button>
            <button className="btn btn-ghost" style={{ justifyContent:"center" }} onClick={testTg} disabled={testing || !tg.token || !tg.chatId}>
              {testing ? <><Spinner /> Test...</> : "🧪 Test yuborish"}
            </button>
          </div>
          {(!tg.token || !tg.chatId) && <div style={{ fontSize:12, color:"var(--textDim)", marginTop:10, textAlign:"center" }}>Test uchun Token va Chat ID ni kiriting</div>}
        </div>

        <div className="card" style={{ padding:22, marginTop:20 }}>
          <div style={{ fontSize:13, color:"var(--textDim)", lineHeight:2 }}>
            <b style={{ color:"var(--textMuted)" }}>Tizim ma'lumotlari</b><br/>
            🍃 MUSTAFO CAFE ERP v2.0<br/>
            🌍 Til: O'zbek (Lotin)<br/>
            🗄 Saqlash: Persistent LocalStorage<br/>
            ✈️ Telegram: {tg.token && tg.chatId ? <span style={{ color:"var(--green4)" }}>Sozlangan ✓</span> : <span style={{ color:"var(--red)" }}>Sozlanmagan</span>}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // CUSTOMER MENU
  // ══════════════════════════════════════════════════════════════════
  function CustomerMenu({ onAdminClick }) {
    const [cats, setCats]       = useState(() => DB.get("cats", []));
    const [prods, setProds]     = useState(() => DB.get("prods", []));
    const [activeCat, setActive] = useState("all");
    const [cart, setCart]        = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkout, setCheckout] = useState(false);
    const [form, setForm]        = useState({ name:"", phone:"", comment:"" });
    const [promo, setPromo]      = useState("");
    const [disc, setDisc]        = useState(0);
    const [success, setSuccess]  = useState(false);
    const [toasts, pushToast]    = useToast();
    const [sending, setSending]  = useState(false);
    const [search, setSearch]    = useState("");

    useEffect(() => {
      const t = setInterval(() => {
        setCats(DB.get("cats", []));
        setProds(DB.get("prods", []));
      }, 2500);
      return () => clearInterval(t);
    }, []);

    const visibleProds = prods
      .filter(p => activeCat === "all" || p.catId === activeCat)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const addToCart = p => {
      if (!p.available || p.stock <= 0) return;
      setCart(c => {
        const ex = c.find(i => i.id === p.id);
        return ex ? c.map(i => i.id === p.id ? { ...i, qty: i.qty+1 } : i) : [...c, { ...p, qty:1 }];
      });
      pushToast(`${p.name} savatga qo'shildi`);
    };

    const updQty = (id, d) => setCart(c => c.map(i => i.id===id ? { ...i, qty: Math.max(0,i.qty+d) } : i).filter(i => i.qty > 0));

    const subtotal = cart.reduce((s,i) => s + (i.discount>0 ? i.price*(1-i.discount/100) : i.price)*i.qty, 0);
    const discAmt  = subtotal * disc;
    const total    = subtotal - discAmt;
    const cartQty  = cart.reduce((s,i) => s+i.qty, 0);

    const applyPromo = () => {
      if (promo.trim().toUpperCase() === "MUSTAFO") { setDisc(.05); pushToast("🎉 Promo kod qo'llanildi! 5% chegirma"); }
      else pushToast("Noto'g'ri promo kod", "error");
    };

    const placeOrder = async () => {
      if (!form.name.trim()) { pushToast("Ismingizni kiriting", "error"); return; }
      if (!form.phone.trim()) { pushToast("Telefon raqamingizni kiriting", "error"); return; }
      setSending(true);

      const order = {
        id: uid(), name: form.name.trim(), phone: form.phone.trim(), comment: form.comment.trim(),
        items: cart.map(i => ({ name:i.name, qty:i.qty, price: i.discount>0 ? i.price*(1-i.discount/100) : i.price })),
        subtotal, discount: discAmt, promoCode: disc>0 ? "MUSTAFO" : null, total,
        status: "new", time: nowStr(), createdAt: isoNow(),
      };

      const orders = DB.get("orders", []);
      DB.set("orders", [...orders, order]);

      // Telegram
      const tgRes = await sendTelegram(order);

      setSending(false);
      setCart([]); setDisc(0); setPromo(""); setCheckout(false); setCartOpen(false);
      setForm({ name:"", phone:"", comment:"" });
      setSuccess(true);

      if (tgRes.ok) pushToast("Buyurtma va Telegram bildirishnomasi yuborildi ✓");
      else if (!DB.get("tg")?.token) {} // silent if not configured
      else pushToast("Buyurtma saqlandi, lekin Telegram xato: " + tgRes.reason, "info");
    };

    return (
      <div style={{ minHeight:"100vh", background:"var(--black)" }}>
        <Toast toasts={toasts} />

        {/* ── HEADER ── */}
        <header style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,12,10,.92)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1160, margin:"0 auto", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,var(--greenDark),var(--greenMid))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, border:"1px solid var(--border3)" }}>🍃</div>
              <div>
                <div className="serif" style={{ fontSize:20, fontWeight:700, color:"var(--green4)", lineHeight:1 }}>MUSTAFO CAFE</div>
                <div style={{ fontSize:10, color:"var(--textDim)", letterSpacing:"1.5px", textTransform:"uppercase" }}>Premium Restaurant</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ position:"relative" }}>
                <button className="btn btn-primary" style={{ gap:10 }} onClick={() => setCartOpen(true)}>
                  <span>🛒</span>
                  <span>Savat</span>
                  {cartQty > 0 && <span style={{ background:"rgba(255,255,255,.2)", borderRadius:10, padding:"1px 7px", fontSize:12, fontWeight:700 }}>{cartQty}</span>}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <div style={{ position:"relative", overflow:"hidden", padding:"72px 20px", textAlign:"center" }}>
          {/* bg */}
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%, rgba(22,163,74,.12) 0%, transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.03 }} xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="hg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#22c55e" strokeWidth=".5"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#hg)"/>
            </svg>
          </div>
          <div style={{ position:"relative" }}>
            <div className="serif" style={{ fontSize:"clamp(32px,6vw,58px)", fontWeight:700, lineHeight:1.1, marginBottom:16 }}>
              <span style={{ background:"linear-gradient(135deg,#4ade80,#86efac,#ffffff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Bizning Menyumiz
              </span>
            </div>
            <div style={{ fontSize:16, color:"var(--textDim)", maxWidth:480, margin:"0 auto 32px", lineHeight:1.7 }}>
              O'zbekiston ta'mlarini kashf eting — har bir taom sevgi va mahorat bilan tayyorlanadi
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
              <div style={{ padding:"8px 18px", background:"rgba(22,163,74,.1)", border:"1px solid var(--border3)", borderRadius:20, fontSize:13, color:"var(--green4)" }}>⭐ Premium sifat</div>
              <div style={{ padding:"8px 18px", background:"rgba(22,163,74,.1)", border:"1px solid var(--border3)", borderRadius:20, fontSize:13, color:"var(--green4)" }}>🚀 Tez yetkazib berish</div>
            </div>
          </div>
        </div>

        {/* ── SEARCH & CATS ── */}
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"0 20px 16px" }}>
          <input placeholder="🔍 Taom qidirish..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:320, marginBottom:16 }} />
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }} className="thin-scroll">
            <button className={`chip ${activeCat==="all"?"on":""}`} onClick={() => setActive("all")}>
              <span>🍴</span> Barchasi
            </button>
            {cats.map(c => (
              <button key={c.id} className={`chip ${activeCat===c.id?"on":""}`} onClick={() => setActive(c.id)}>
                <span>{c.emoji}</span> {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCTS ── */}
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"8px 20px 60px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:20 }}>
            {visibleProds.map((p,i) => {
              const fin = p.discount>0 ? p.price*(1-p.discount/100) : p.price;
              const inCart = cart.find(c => c.id===p.id);
              const unavail = !p.available || p.stock<=0;
              return (
                <div key={p.id} className="prod-card anim-up" style={{ animationDelay:`${(i%6)*.07}s`, opacity: unavail ? .55 : 1 }}>
                  <div style={{ position:"relative", height:190, overflow:"hidden" }}>
                    <img src={p.image || "https://via.placeholder.com/300x190"} alt={p.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .5s" }}
                      onMouseEnter={e => !unavail && (e.target.style.transform="scale(1.07)")}
                      onMouseLeave={e => e.target.style.transform="scale(1)"}
                    />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 50%)" }} />
                    {p.discount>0 && <div style={{ position:"absolute", top:10, left:10, background:"var(--red)", color:"#fff", padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:700 }}>-{p.discount}%</div>}
                    {p.featured && <div style={{ position:"absolute", top:10, right:10, background:"linear-gradient(135deg,#92400e,var(--gold))", color:"#000", padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>⭐ Tanlangan</div>}
                  </div>
                  <div style={{ padding:"16px 18px 18px" }}>
                    <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:"var(--textDim)", marginBottom:14, lineHeight:1.6, minHeight:36 }}>{p.desc}</div>
                    {unavail ? (
                      <div style={{ textAlign:"center", padding:"10px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, color:"var(--red)", fontSize:13, fontWeight:600 }}>Mavjud emas</div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div>
                          <div style={{ fontSize:18, fontWeight:800, color:"var(--green4)", lineHeight:1 }}>{money(fin)}</div>
                          {p.discount>0 && <div style={{ fontSize:11, color:"var(--textDim)", textDecoration:"line-through", marginTop:3 }}>{money(p.price)}</div>}
                        </div>
                        {inCart ? (
                          <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(22,163,74,.1)", border:"1px solid var(--border3)", borderRadius:12, padding:"5px 12px" }}>
                            <button onClick={() => updQty(p.id,-1)} style={{ background:"none", border:"none", color:"var(--textMuted)", fontSize:20, cursor:"pointer", lineHeight:1, padding:0 }}>−</button>
                            <span style={{ fontWeight:800, fontSize:15, minWidth:22, textAlign:"center", color:"var(--green4)" }}>{inCart.qty}</span>
                            <button onClick={() => updQty(p.id,+1)} style={{ background:"none", border:"none", color:"var(--green4)", fontSize:20, cursor:"pointer", lineHeight:1, padding:0 }}>+</button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(p)} className="btn btn-primary btn-sm">+ Qo'shish</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {visibleProds.length === 0 && (
            <div style={{ textAlign:"center", padding:"80px 20px", color:"var(--textDim)" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
              <div style={{ fontSize:16 }}>Hech narsa topilmadi</div>
            </div>
          )}
        </div>

        {/* ── CART DRAWER ── */}
        {cartOpen && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(6px)", zIndex:500 }} onClick={() => setCartOpen(false)}>
            <div onClick={e => e.stopPropagation()} className="thin-scroll" style={{
              position:"fixed", right:0, top:0, bottom:0, width:"100%", maxWidth:400,
              background:"var(--card2)", borderLeft:"1px solid var(--border2)", padding:24,
              overflowY:"auto", animation:"slideRight .3s ease", display:"flex", flexDirection:"column"
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div className="serif" style={{ fontSize:24 }}>Savat</div>
                <button onClick={() => setCartOpen(false)} style={{ background:"none", border:"none", color:"var(--textDim)", fontSize:24, cursor:"pointer" }}>✕</button>
              </div>

              {cart.length === 0 ? (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"var(--textDim)" }}>
                  <div style={{ fontSize:56, marginBottom:16 }}>🛒</div>
                  <div style={{ fontSize:16 }}>Savat bo'sh</div>
                  <div style={{ fontSize:13, marginTop:8 }}>Mahsulot qo'shing</div>
                </div>
              ) : (
                <>
                  <div style={{ flex:1 }}>
                    {cart.map(item => {
                      const p = item.discount>0 ? item.price*(1-item.discount/100) : item.price;
                      return (
                        <div key={item.id} style={{ display:"flex", gap:12, marginBottom:14, background:"rgba(22,163,74,.04)", border:"1px solid var(--border)", borderRadius:14, padding:12 }}>
                          <img src={item.image} alt={item.name} style={{ width:60, height:60, borderRadius:10, objectFit:"cover", flexShrink:0 }} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{item.name}</div>
                            <div style={{ color:"var(--green4)", fontSize:13, fontWeight:700 }}>{money(p)}</div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                            <button onClick={() => updQty(item.id,-1)} style={{ width:28, height:28, borderRadius:8, background:"var(--card)", border:"1px solid var(--border)", color:"var(--text)", cursor:"pointer", fontSize:16 }}>−</button>
                            <span style={{ fontWeight:700, minWidth:20, textAlign:"center" }}>{item.qty}</span>
                            <button onClick={() => updQty(item.id,+1)} style={{ width:28, height:28, borderRadius:8, background:"rgba(22,163,74,.2)", border:"1px solid var(--border3)", color:"var(--green4)", cursor:"pointer", fontSize:16 }}>+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <div className="hr" />
                    <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                      <input placeholder="Promo kod — MUSTAFO" value={promo} onChange={e => setPromo(e.target.value)} onKeyDown={e => e.key==="Enter" && applyPromo()} style={{ flex:1 }} />
                      <button className="btn btn-ghost btn-sm" onClick={applyPromo} style={{ flexShrink:0 }}>Qo'llash</button>
                    </div>
                    {disc > 0 && (
                      <div style={{ padding:"10px 14px", background:"rgba(22,163,74,.08)", border:"1px solid var(--border3)", borderRadius:10, marginBottom:14, fontSize:13, color:"var(--green4)", display:"flex", justifyContent:"space-between" }}>
                        <span>✓ 5% chegirma qo'llanildi</span>
                        <span style={{ fontWeight:700 }}>-{money(discAmt)}</span>
                      </div>
                    )}
                    {disc > 0 && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13, color:"var(--textDim)" }}><span>Jami:</span><span>{money(subtotal)}</span></div>}
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18, fontSize:18, fontWeight:800 }}>
                      <span>To'lash:</span><span style={{ color:"var(--green4)" }}>{money(total)}</span>
                    </div>
                    <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", padding:"14px 20px", fontSize:15 }}
                      onClick={() => { setCartOpen(false); setCheckout(true); }}>
                      Buyurtma berish →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── CHECKOUT ── */}
        {checkout && (
          <div className="overlay">
            <div className="modal" style={{ padding:32 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div className="serif" style={{ fontSize:24 }}>Buyurtma berish</div>
                <button onClick={() => setCheckout(false)} style={{ background:"none", border:"none", color:"var(--textDim)", fontSize:22, cursor:"pointer" }}>✕</button>
              </div>
              <div className="field">
                <label>To'liq ism *</label>
                <input placeholder="Ism va familiya" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div className="field">
                <label>Telefon raqam *</label>
                <input placeholder="+998 90 123 45 67" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
              </div>
              <div className="field">
                <label>Izoh (ixtiyoriy)</label>
                <textarea rows={2} placeholder="Qo'shimcha izoh..." value={form.comment} onChange={e => setForm(f=>({...f,comment:e.target.value}))} />
              </div>
              <div style={{ background:"rgba(22,163,74,.05)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
                {cart.map(i => (
                  <div key={i.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14 }}>
                    <span style={{ color:"var(--textDim)" }}>{i.name} × {i.qty}</span>
                    <span style={{ fontWeight:600, color:"var(--green4)" }}>{money((i.discount>0?i.price*(1-i.discount/100):i.price)*i.qty)}</span>
                  </div>
                ))}
                <div className="hr" />
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:16 }}>
                  <span>Jami to'lov</span><span style={{ color:"var(--green4)" }}>{money(total)}</span>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", padding:"14px 20px", fontSize:16 }} onClick={placeOrder} disabled={sending}>
                {sending ? <><Spinner /> Yuborilmoqda...</> : "🍴 Buyurtmani tasdiqlash"}
              </button>
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {success && (
          <div className="overlay">
            <div style={{ background:"var(--card)", border:"1px solid var(--border3)", borderRadius:28, padding:"60px 48px", textAlign:"center", maxWidth:380, animation:"slideUp .4s cubic-bezier(.34,1.56,.64,1)" }}>
              <div style={{ fontSize:72, marginBottom:20, animation:"float 2s ease-in-out infinite" }}>✅</div>
              <div className="serif" style={{ fontSize:28, color:"var(--green4)", marginBottom:12 }}>Buyurtma qabul qilindi!</div>
              <div style={{ fontSize:14, color:"var(--textDim)", lineHeight:1.7, marginBottom:32 }}>
                Buyurtmangiz oshpazlarga yuborildi.<br/>Tez orada tayyorlanadi! Sabr qiling 🙏
              </div>
              <button className="btn btn-primary" style={{ padding:"12px 36px", justifyContent:"center" }} onClick={() => setSuccess(false)}>Yaxshi</button>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ background:"var(--card)", borderTop:"1px solid var(--border)", padding:"40px 20px", textAlign:"center" }}>
          <div className="serif" style={{ fontSize:22, color:"var(--green4)", marginBottom:8 }}>🍃 MUSTAFO CAFE</div>
          <div style={{ fontSize:12, color:"var(--textDim)" }}>© 2024 Barcha huquqlar himoyalangan · Premium Restaurant Experience</div>
        </div>

        {/* Admin FAB */}
        <button onClick={onAdminClick} style={{
          position:"fixed", bottom:24, right:24, width:44, height:44, borderRadius:"50%",
          background:"rgba(13,20,16,.9)", border:"1px solid var(--border2)", color:"var(--textDim)",
          fontSize:18, cursor:"pointer", backdropFilter:"blur(10px)", zIndex:400,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(0,0,0,.4)", transition:"all .2s"
        }} title="Admin panel" onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--border3)"; e.currentTarget.style.color="var(--green4)"; }} onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.color="var(--textDim)"; }}>
          🔐
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ROOT APP
  // ══════════════════════════════════════════════════════════════════
  export default function App() {
    const [loading, setLoading]   = useState(true);
    const [view, setView]         = useState("menu"); // menu | login | admin
    const [authed, setAuthed]     = useState(false);

    useEffect(() => {
      initDB();
      const t = setTimeout(() => setLoading(false), 1400);
      return () => clearTimeout(t);
    }, []);

    if (loading) return (
      <>
        <style>{CSS}</style>
        <LoadScreen />
      </>
    );

    return (
      <>
        <style>{CSS}</style>
        {view === "menu" && (
          <CustomerMenu onAdminClick={() => setView("login")} />
        )}
        {view === "login" && (
          <AdminLogin onLogin={() => { setAuthed(true); setView("admin"); }} />
        )}
        {view === "admin" && authed && (
          <AdminShell onLogout={() => { setAuthed(false); setView("menu"); }} />
        )}
      </>
    );
  } 
