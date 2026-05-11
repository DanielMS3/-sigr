import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME & CONSTANTS ────────────────────────────────────────────────────────
const COLORS = {
  bg: "#0f0e0c",
  bgCard: "#181714",
  bgElevated: "#201e1b",
  border: "#2a2724",
  borderLight: "#3a3632",
  accent: "#e8a045",
  accentDim: "#b87830",
  accentBg: "rgba(232,160,69,0.1)",
  text: "#f0ece4",
  textMuted: "#8a8278",
  textFaint: "#4a4642",
  success: "#4caf82",
  successBg: "rgba(76,175,130,0.1)",
  danger: "#e05252",
  dangerBg: "rgba(224,82,82,0.1)",
  info: "#5b9bd5",
  infoBg: "rgba(91,155,213,0.1)",
  warning: "#e8a045",
  warningBg: "rgba(232,160,69,0.08)",
};

// Datos iniciales
const INITIAL_MENU = [
  { id: 1, nombre: "Ceviche clásico", categoria: "Entradas", precio: 28000, disponible: true, descripcion: "Camarón fresco, limón, cebolla morada, cilantro" },
  { id: 2, nombre: "Carpaccio de res", categoria: "Entradas", precio: 32000, disponible: true, descripcion: "Láminas finas de res, alcaparras, parmesano, rúgula" },
  { id: 3, nombre: "Filete al carbón", categoria: "Principales", precio: 68000, disponible: true, descripcion: "300g filete, papas rústicas, ensalada verde" },
  { id: 4, nombre: "Salmón a la plancha", categoria: "Principales", precio: 55000, disponible: true, descripcion: "Salmón noruego, puré de papa, espárragos" },
  { id: 5, nombre: "Pollo provenzal", categoria: "Principales", precio: 42000, disponible: true, descripcion: "Pechuga al horno, tomates cherry, aceitunas" },
  { id: 6, nombre: "Pasta carbonara", categoria: "Principales", precio: 36000, disponible: false, descripcion: "Espagueti, panceta, yema de huevo, parmesano" },
  { id: 7, nombre: "Tiramisú", categoria: "Postres", precio: 18000, disponible: true, descripcion: "Mascarpone, café, bizcochos, cacao" },
  { id: 8, nombre: "Panna cotta", categoria: "Postres", precio: 16000, disponible: true, descripcion: "Crema italiana, frutos rojos, miel" },
  { id: 9, nombre: "Limonada de menta", categoria: "Bebidas", precio: 12000, disponible: true, descripcion: "Limón, menta fresca, agua con gas" },
  { id: 10, nombre: "Vino de la casa", categoria: "Bebidas", precio: 22000, disponible: true, descripcion: "Copa de vino tinto o blanco selección del sommelier" },
];

const INITIAL_MESAS = [1,2,3,4,5,6,7,8,9,10].map(n => ({ id: n, capacidad: n <= 4 ? 2 : n <= 7 ? 4 : 6, estado: "libre" }));

const INITIAL_RESERVAS = [
  { id: 1, cliente: "Carlos Mendoza", fecha: "2026-05-10", hora: "19:00", personas: 4, mesa: 5, estado: "confirmada", telefono: "3001234567" },
  { id: 2, cliente: "María García", fecha: "2026-05-10", hora: "20:30", personas: 2, mesa: 2, estado: "confirmada", telefono: "3109876543" },
  { id: 3, cliente: "Familia Rodríguez", fecha: "2026-05-11", hora: "13:00", personas: 6, mesa: 9, estado: "pendiente", telefono: "3205551234" },
];

const INITIAL_PEDIDOS = [
  { id: 1001, mesa: 3, mesero: "Luis", items: [{menuId:1,nombre:"Ceviche clásico",precio:28000,qty:2},{menuId:9,nombre:"Limonada de menta",precio:12000,qty:2}], estado: "listo", hora: "19:15", total: 80000 },
  { id: 1002, mesa: 5, mesero: "Ana", items: [{menuId:3,nombre:"Filete al carbón",precio:68000,qty:1},{menuId:7,nombre:"Tiramisú",precio:18000,qty:1},{menuId:10,nombre:"Vino de la casa",precio:22000,qty:2}], estado: "en_cocina", hora: "19:42", total: 130000 },
  { id: 1003, mesa: 7, mesero: "Luis", items: [{menuId:4,nombre:"Salmón a la plancha",precio:55000,qty:2}], estado: "pendiente", hora: "20:01", total: 110000 },
];

const USUARIOS = [
  { id: 1, nombre: "Admin", rol: "admin", pass: "admin123", avatar: "A" },
  { id: 2, nombre: "Luis Pérez", rol: "mesero", pass: "mesero1", avatar: "L" },
  { id: 3, nombre: "Ana Torres", rol: "mesero", pass: "mesero2", avatar: "A" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
const fmtShort = (n) => `$${(n/1000).toFixed(0)}k`;
const today = () => new Date().toISOString().split("T")[0];

async function askClaude(messages, system = "") {
  // Proxy serverless — evita CORS y mantiene la API key segura en el servidor
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: system || "Eres el asistente inteligente del Sistema Integral de Gestión de Restaurante (SIGR). Responde en español, de forma concisa y práctica. No uses markdown excesivo.",
      messages,
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "Sin respuesta";
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Badge({ children, color = "accent" }) {
  const map = {
    accent: { bg: COLORS.accentBg, color: COLORS.accent },
    success: { bg: COLORS.successBg, color: COLORS.success },
    danger: { bg: COLORS.dangerBg, color: COLORS.danger },
    info: { bg: COLORS.infoBg, color: COLORS.info },
    muted: { bg: "rgba(255,255,255,0.05)", color: COLORS.textMuted },
  };
  const s = map[color] || map.accent;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", small, disabled, style: extra }) {
  const base = {
    border: "none", cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8,
    fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s",
    fontSize: small ? 12 : 14, padding: small ? "5px 12px" : "9px 18px",
    opacity: disabled ? 0.4 : 1,
  };
  const variants = {
    primary: { background: COLORS.accent, color: "#0f0e0c" },
    secondary: { background: COLORS.bgElevated, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.dangerBg, color: COLORS.danger, border: `1px solid ${COLORS.danger}30` },
    ghost: { background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}` },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...extra }} onClick={disabled ? undefined : onClick}>
      {children}
    </button>
  );
}

function Card({ children, style: extra }) {
  return (
    <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "1.25rem 1.5rem", ...extra }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, style: extra }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 12px", color: COLORS.text, fontSize: 14, fontFamily: "inherit", outline: "none", ...extra }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, style: extra }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 12px", color: COLORS.text, fontSize: 14, fontFamily: "inherit", outline: "none", ...extra }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── AI CHAT WIDGET ───────────────────────────────────────────────────────────
function AIChat({ context }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "¡Hola! Soy tu asistente IA del SIGR. Pregúntame sobre pedidos, menú, reservas o reportes." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const system = `Eres el asistente inteligente del SIGR. Contexto actual del restaurante: ${JSON.stringify(context)}. Responde en español, de forma concisa y útil para el personal del restaurante.`;
      const reply = await askClaude(newMsgs.filter(m => m.role !== "system").slice(-10), system);
      setMsgs(m => [...m, { role: "assistant", content: reply }]);
    } catch { setMsgs(m => [...m, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]); }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position: "fixed", bottom: 24, right: 24, width: 52, height: 52, borderRadius: "50%", background: COLORS.accent, border: "none", cursor: "pointer", fontSize: 22, zIndex: 1000, boxShadow: "0 4px 20px rgba(232,160,69,0.4)" }}>
        {open ? "✕" : "✦"}
      </button>
      {open && (
        <div style={{ position: "fixed", bottom: 88, right: 24, width: 340, height: 420, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, display: "flex", flexDirection: "column", zIndex: 999, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: COLORS.accent, fontSize: 16 }}>✦</span>
            <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>Asistente SIGR</span>
            <Badge color="success">IA activa</Badge>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "85%", background: m.role === "user" ? COLORS.accentBg : COLORS.bgElevated, color: m.role === "user" ? COLORS.accent : COLORS.text, border: `1px solid ${m.role === "user" ? COLORS.accent + "40" : COLORS.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, lineHeight: 1.5 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Pensando…</div>}
            <div ref={endRef} />
          </div>
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Escribe tu pregunta…"
              style={{ flex: 1, background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 10px", color: COLORS.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            <Btn onClick={send} disabled={loading} small>→</Btn>
          </div>
        </div>
      )}
    </>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    const found = USUARIOS.find(u => u.nombre.toLowerCase() === user.toLowerCase() && u.pass === pass);
    if (found) { setErr(""); onLogin(found); }
    else setErr("Usuario o contraseña incorrectos");
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>🍽</div>
          <h1 style={{ color: COLORS.accent, fontSize: 28, fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>SIGR</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "6px 0 0", fontFamily: "system-ui" }}>Sistema Integral de Gestión de Restaurante</p>
        </div>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Usuario" value={user} onChange={setUser} placeholder="nombre de usuario" />
            <Input label="Contraseña" value={pass} onChange={setPass} type="password" placeholder="••••••••" />
            {err && <p style={{ color: COLORS.danger, fontSize: 12, margin: 0 }}>{err}</p>}
            <Btn onClick={handleLogin}>Ingresar al sistema</Btn>
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
              <p style={{ color: COLORS.textFaint, fontSize: 11, margin: 0, textAlign: "center" }}>
                Admin: Admin / admin123 · Mesero: Luis Pérez / mesero1
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── MÓDULO: DASHBOARD ────────────────────────────────────────────────────────
function Dashboard({ pedidos, reservas, menu, usuario }) {
  const [insight, setInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  const ventasHoy = pedidos.filter(p => p.estado === "cerrado").reduce((s, p) => s + p.total, 0);
  const pedidosActivos = pedidos.filter(p => p.estado !== "cerrado" && p.estado !== "cancelado").length;
  const reservasHoy = reservas.filter(r => r.fecha === today()).length;
  const platosDisponibles = menu.filter(m => m.disponible).length;

  const getInsight = async () => {
    setLoadingInsight(true);
    const ctx = { ventasHoy, pedidosActivos, reservasHoy, platosDisponibles, pedidos: pedidos.slice(0,5) };
    const reply = await askClaude([{ role: "user", content: `Dame 3 insights accionables sobre el estado actual del restaurante. Datos: ${JSON.stringify(ctx)}` }]);
    setInsight(reply);
    setLoadingInsight(false);
  };

  const stats = [
    { label: "Ventas hoy", value: fmtShort(ventasHoy), icon: "💰", color: COLORS.success },
    { label: "Pedidos activos", value: pedidosActivos, icon: "🍴", color: COLORS.accent },
    { label: "Reservas hoy", value: reservasHoy, icon: "📅", color: COLORS.info },
    { label: "Platos disponibles", value: platosDisponibles, icon: "📋", color: COLORS.textMuted },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ color: COLORS.text, fontSize: 22, fontWeight: 400, margin: 0 }}>Bienvenido, {usuario.nombre}</h2>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <Badge color={usuario.rol === "admin" ? "accent" : "info"}>{usuario.rol}</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ padding: "1rem" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ color: COLORS.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Pedidos recientes</h3>
          </div>
          {pedidos.slice(0, 4).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>Mesa {p.mesa}</span>
                <span style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: 8 }}>{p.hora}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>{fmtShort(p.total)}</span>
                <Badge color={p.estado === "listo" ? "success" : p.estado === "en_cocina" ? "warning" : "muted"}>
                  {p.estado.replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ color: COLORS.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Análisis IA</h3>
            <Btn onClick={getInsight} small disabled={loadingInsight}>{loadingInsight ? "Analizando…" : "✦ Generar"}</Btn>
          </div>
          {insight ? (
            <p style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{insight}</p>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ color: COLORS.textFaint, fontSize: 13 }}>Haz clic en "Generar" para obtener insights inteligentes sobre el restaurante</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── MÓDULO: MENÚ ─────────────────────────────────────────────────────────────
function MenuModule({ menu, setMenu, rol }) {
  const [filtro, setFiltro] = useState("Todos");
  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", categoria: "Principales", precio: "", descripcion: "", disponible: true });
  const [aiSuggest, setAiSuggest] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const categorias = ["Todos", ...new Set(menu.map(m => m.categoria))];
  const filtrado = menu.filter(m => (filtro === "Todos" || m.categoria === filtro) && (m.nombre.toLowerCase().includes(search.toLowerCase())));

  const abrirForm = (plato = null) => {
    if (plato) { setForm({ ...plato }); setEditando(plato.id); }
    else { setForm({ nombre: "", categoria: "Principales", precio: "", descripcion: "", disponible: true }); setEditando("nuevo"); }
  };

  const guardar = () => {
    if (!form.nombre || !form.precio) return;
    if (editando === "nuevo") {
      setMenu(m => [...m, { ...form, id: Date.now(), precio: Number(form.precio) }]);
    } else {
      setMenu(m => m.map(p => p.id === editando ? { ...form, id: editando, precio: Number(form.precio) } : p));
    }
    setEditando(null);
  };

  const eliminar = (id) => setMenu(m => m.filter(p => p.id !== id));
  const toggleDisp = (id) => setMenu(m => m.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));

  const sugerirIA = async () => {
    setLoadingAI(true);
    const reply = await askClaude([{ role: "user", content: `Tengo este menú: ${menu.map(m=>m.nombre).join(", ")}. Sugiere 3 platos nuevos creativos con descripción y precio en COP para un restaurante de cocina contemporánea en Colombia. Sé breve.` }]);
    setAiSuggest(reply);
    setLoadingAI(false);
  };

  const catOpts = ["Entradas","Principales","Postres","Bebidas"].map(c => ({ value: c, label: c }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 400, margin: 0 }}>Menú Digital</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={sugerirIA} variant="secondary" small disabled={loadingAI}>✦ {loadingAI ? "Generando…" : "Sugerir con IA"}</Btn>
          {rol === "admin" && <Btn onClick={() => abrirForm()} small>+ Agregar plato</Btn>}
        </div>
      </div>

      {aiSuggest && (
        <Card style={{ borderColor: COLORS.accent + "40", background: COLORS.accentBg }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>✦ Sugerencias IA</span>
            <Btn onClick={() => setAiSuggest("")} variant="ghost" small>✕</Btn>
          </div>
          <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.7, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{aiSuggest}</p>
        </Card>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plato…"
          style={{ background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 12px", color: COLORS.text, fontSize: 13, fontFamily: "inherit", outline: "none", width: 200 }} />
        {categorias.map(c => (
          <button key={c} onClick={() => setFiltro(c)}
            style={{ background: filtro === c ? COLORS.accent : COLORS.bgElevated, color: filtro === c ? "#0f0e0c" : COLORS.textMuted, border: `1px solid ${filtro === c ? COLORS.accent : COLORS.border}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {filtrado.map(plato => (
          <Card key={plato.id} style={{ opacity: plato.disponible ? 1 : 0.55 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ color: COLORS.text, fontWeight: 600, fontSize: 14 }}>{plato.nombre}</span>
                  {!plato.disponible && <Badge color="danger">Agotado</Badge>}
                </div>
                <Badge color="muted">{plato.categoria}</Badge>
                <p style={{ color: COLORS.textMuted, fontSize: 12, margin: "8px 0", lineHeight: 1.5 }}>{plato.descripcion}</p>
                <span style={{ color: COLORS.accent, fontWeight: 700, fontSize: 16 }}>{fmt(plato.precio)}</span>
              </div>
            </div>
            {rol === "admin" && (
              <div style={{ display: "flex", gap: 6, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
                <Btn onClick={() => abrirForm(plato)} variant="secondary" small>Editar</Btn>
                <Btn onClick={() => toggleDisp(plato.id)} variant="ghost" small>{plato.disponible ? "Desactivar" : "Activar"}</Btn>
                <Btn onClick={() => eliminar(plato.id)} variant="danger" small>✕</Btn>
              </div>
            )}
          </Card>
        ))}
      </div>

      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <Card style={{ width: 420 }}>
            <h3 style={{ color: COLORS.text, margin: "0 0 16px", fontWeight: 600 }}>{editando === "nuevo" ? "Nuevo plato" : "Editar plato"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Nombre" value={form.nombre} onChange={v => setForm(f => ({...f, nombre: v}))} />
              <Select label="Categoría" value={form.categoria} onChange={v => setForm(f => ({...f, categoria: v}))} options={catOpts} />
              <Input label="Precio (COP)" type="number" value={form.precio} onChange={v => setForm(f => ({...f, precio: v}))} />
              <Input label="Descripción" value={form.descripcion} onChange={v => setForm(f => ({...f, descripcion: v}))} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.disponible} onChange={e => setForm(f => ({...f, disponible: e.target.checked}))} />
                <span style={{ color: COLORS.textMuted, fontSize: 13 }}>Disponible</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Btn onClick={guardar}>Guardar</Btn>
              <Btn onClick={() => setEditando(null)} variant="ghost">Cancelar</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── MÓDULO: PEDIDOS ──────────────────────────────────────────────────────────
function PedidosModule({ pedidos, setPedidos, menu, usuario }) {
  const [nuevoPedido, setNuevoPedido] = useState(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState("");
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [aiNota, setAiNota] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const estados = ["todos", "pendiente", "en_cocina", "listo", "cerrado"];
  const filtrados = pedidos.filter(p => filtroEstado === "todos" || p.estado === filtroEstado);

  const agregarItem = (plato) => {
    setItemsSeleccionados(items => {
      const ex = items.find(i => i.menuId === plato.id);
      if (ex) return items.map(i => i.menuId === plato.id ? {...i, qty: i.qty+1} : i);
      return [...items, { menuId: plato.id, nombre: plato.nombre, precio: plato.precio, qty: 1 }];
    });
  };

  const quitarItem = (menuId) => setItemsSeleccionados(items => items.filter(i => i.menuId !== menuId));

  const crearPedido = () => {
    if (!mesaSeleccionada || itemsSeleccionados.length === 0) return;
    const total = itemsSeleccionados.reduce((s, i) => s + i.precio * i.qty, 0);
    const nuevo = { id: Date.now(), mesa: Number(mesaSeleccionada), mesero: usuario.nombre, items: itemsSeleccionados, estado: "pendiente", hora: new Date().toLocaleTimeString("es-CO", {hour:"2-digit",minute:"2-digit"}), total };
    setPedidos(p => [nuevo, ...p]);
    setNuevoPedido(null); setMesaSeleccionada(""); setItemsSeleccionados([]);
  };

  const cambiarEstado = (id, estado) => setPedidos(p => p.map(pe => pe.id === id ? {...pe, estado} : pe));

  const siguienteEstado = { pendiente: "en_cocina", en_cocina: "listo", listo: "cerrado" };

  const analizarPedidos = async () => {
    setLoadingAI(true);
    const top = menu.map(m => ({ nombre: m.nombre, veces: pedidos.flatMap(p=>p.items).filter(i=>i.menuId===m.id).reduce((s,i)=>s+i.qty,0) })).sort((a,b)=>b.veces-a.veces).slice(0,5);
    const reply = await askClaude([{ role: "user", content: `Analiza estos datos de pedidos: ${pedidos.length} pedidos totales, top platos: ${JSON.stringify(top)}. Dame recomendaciones operativas breves.` }]);
    setAiNota(reply);
    setLoadingAI(false);
  };

  const statColor = { pendiente: "muted", en_cocina: "warning", listo: "success", cerrado: "info", cancelado: "danger" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 400, margin: 0 }}>Pedidos en tiempo real</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={analizarPedidos} variant="secondary" small disabled={loadingAI}>✦ {loadingAI ? "…" : "Analizar"}</Btn>
          <Btn onClick={() => setNuevoPedido(true)} small>+ Nuevo pedido</Btn>
        </div>
      </div>

      {aiNota && (
        <Card style={{ borderColor: COLORS.accent+"40", background: COLORS.accentBg }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>✦ Análisis IA</span>
            <Btn onClick={() => setAiNota("")} variant="ghost" small>✕</Btn>
          </div>
          <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.7, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{aiNota}</p>
        </Card>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {estados.map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)}
            style={{ background: filtroEstado === e ? COLORS.accent : COLORS.bgElevated, color: filtroEstado === e ? "#0f0e0c" : COLORS.textMuted, border: `1px solid ${filtroEstado === e ? COLORS.accent : COLORS.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
            {e.replace("_"," ")}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtrados.length === 0 && <p style={{ color: COLORS.textFaint, textAlign: "center", padding: 40 }}>Sin pedidos</p>}
        {filtrados.map(p => (
          <Card key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 16 }}>Mesa {p.mesa}</span>
                  <Badge color={statColor[p.estado] || "muted"}>{p.estado.replace("_"," ")}</Badge>
                  <span style={{ color: COLORS.textMuted, fontSize: 12 }}>#{p.id} · {p.hora} · {p.mesero}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.items.map((it,i) => (
                    <span key={i} style={{ background: COLORS.bgElevated, color: COLORS.textMuted, fontSize: 12, padding: "3px 8px", borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
                      {it.nombre} ×{it.qty}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: COLORS.accent, fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{fmtShort(p.total)}</div>
                {siguienteEstado[p.estado] && (
                  <Btn onClick={() => cambiarEstado(p.id, siguienteEstado[p.estado])} small>
                    → {siguienteEstado[p.estado].replace("_"," ")}
                  </Btn>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {nuevoPedido && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <Card style={{ width: 520, maxHeight: "80vh", overflowY: "auto" }}>
            <h3 style={{ color: COLORS.text, margin: "0 0 16px", fontWeight: 600 }}>Nuevo pedido</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Select label="Mesa" value={mesaSeleccionada} onChange={setMesaSeleccionada}
                options={[{value:"",label:"Seleccionar mesa"},...Array.from({length:10},(_,i)=>({value:i+1,label:`Mesa ${i+1}`}))]} />
              <div>
                <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500, display: "block", marginBottom: 8 }}>Menú disponible</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                  {menu.filter(m=>m.disponible).map(m => (
                    <button key={m.id} onClick={() => agregarItem(m)}
                      style={{ background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 10px", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                      <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 600 }}>{m.nombre}</div>
                      <div style={{ color: COLORS.accent, fontSize: 12 }}>{fmtShort(m.precio)}</div>
                    </button>
                  ))}
                </div>
              </div>
              {itemsSeleccionados.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500, display: "block", marginBottom: 8 }}>Seleccionados</label>
                  {itemsSeleccionados.map(it => (
                    <div key={it.menuId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ color: COLORS.text, fontSize: 13 }}>{it.nombre} ×{it.qty}</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ color: COLORS.accent, fontSize: 13 }}>{fmtShort(it.precio*it.qty)}</span>
                        <Btn onClick={() => quitarItem(it.menuId)} variant="danger" small>✕</Btn>
                      </div>
                    </div>
                  ))}
                  <div style={{ textAlign: "right", marginTop: 8, color: COLORS.accent, fontWeight: 700, fontSize: 16 }}>
                    Total: {fmtShort(itemsSeleccionados.reduce((s,i)=>s+i.precio*i.qty,0))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Btn onClick={crearPedido} disabled={!mesaSeleccionada||itemsSeleccionados.length===0}>Crear pedido</Btn>
              <Btn onClick={() => { setNuevoPedido(null); setMesaSeleccionada(""); setItemsSeleccionados([]); }} variant="ghost">Cancelar</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── MÓDULO: RESERVAS ─────────────────────────────────────────────────────────
function ReservasModule({ reservas, setReservas, usuario }) {
  const [form, setForm] = useState({ cliente: "", fecha: today(), hora: "19:00", personas: 2, mesa: 1, telefono: "" });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [aiRecomend, setAiRecomend] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState(today());

  const filtradas = reservas.filter(r => !filtroFecha || r.fecha === filtroFecha);

  const crear = () => {
    if (!form.cliente || !form.fecha || !form.hora) return;
    setReservas(r => [...r, { ...form, id: Date.now(), personas: Number(form.personas), mesa: Number(form.mesa), estado: "pendiente" }]);
    setMostrarForm(false);
    setForm({ cliente: "", fecha: today(), hora: "19:00", personas: 2, mesa: 1, telefono: "" });
  };

  const cambiarEstado = (id, estado) => setReservas(r => r.map(re => re.id === id ? {...re, estado} : re));
  const eliminar = (id) => setReservas(r => r.filter(re => re.id !== id));

  const recomendar = async () => {
    setLoadingAI(true);
    const resHoy = reservas.filter(r => r.fecha === today());
    const reply = await askClaude([{ role: "user", content: `Tenemos ${resHoy.length} reservas hoy con un total de ${resHoy.reduce((s,r)=>s+r.personas,0)} personas. Analiza la carga del restaurante y da 2-3 recomendaciones operativas breves para optimizar el servicio.` }]);
    setAiRecomend(reply);
    setLoadingAI(false);
  };

  const estadoColor = { confirmada: "success", pendiente: "warning", cancelada: "danger" };
  const horas = ["12:00","12:30","13:00","13:30","14:00","19:00","19:30","20:00","20:30","21:00","21:30"].map(h=>({value:h,label:h}));
  const mesaOpts = Array.from({length:10},(_,i)=>({value:i+1,label:`Mesa ${i+1}`}));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 400, margin: 0 }}>Reservas</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={recomendar} variant="secondary" small disabled={loadingAI}>✦ {loadingAI ? "…" : "Analizar carga"}</Btn>
          <Btn onClick={() => setMostrarForm(true)} small>+ Nueva reserva</Btn>
        </div>
      </div>

      {aiRecomend && (
        <Card style={{ borderColor: COLORS.accent+"40", background: COLORS.accentBg }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>✦ Análisis IA</span>
            <Btn onClick={() => setAiRecomend("")} variant="ghost" small>✕</Btn>
          </div>
          <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.7, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{aiRecomend}</p>
        </Card>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ fontSize: 13, color: COLORS.textMuted }}>Filtrar por fecha:</label>
        <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
          style={{ background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "6px 10px", color: COLORS.text, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
        <Btn onClick={() => setFiltroFecha("")} variant="ghost" small>Ver todas</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtradas.length === 0 && <p style={{ color: COLORS.textFaint, textAlign: "center", padding: 40 }}>Sin reservas para esta fecha</p>}
        {filtradas.map(r => (
          <Card key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ color: COLORS.text, fontWeight: 600, fontSize: 15 }}>{r.cliente}</span>
                  <Badge color={estadoColor[r.estado] || "muted"}>{r.estado}</Badge>
                </div>
                <div style={{ color: COLORS.textMuted, fontSize: 13 }}>
                  📅 {r.fecha} · ⏰ {r.hora} · 👥 {r.personas} personas · 🪑 Mesa {r.mesa}
                  {r.telefono && ` · 📞 ${r.telefono}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {r.estado === "pendiente" && <Btn onClick={() => cambiarEstado(r.id, "confirmada")} small>Confirmar</Btn>}
                {r.estado !== "cancelada" && <Btn onClick={() => cambiarEstado(r.id, "cancelada")} variant="danger" small>Cancelar</Btn>}
                <Btn onClick={() => eliminar(r.id)} variant="ghost" small>✕</Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {mostrarForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <Card style={{ width: 420 }}>
            <h3 style={{ color: COLORS.text, margin: "0 0 16px", fontWeight: 600 }}>Nueva reserva</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Nombre del cliente" value={form.cliente} onChange={v => setForm(f=>({...f,cliente:v}))} />
              <Input label="Teléfono" value={form.telefono} onChange={v => setForm(f=>({...f,telefono:v}))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Input label="Fecha" type="date" value={form.fecha} onChange={v => setForm(f=>({...f,fecha:v}))} />
                <Select label="Hora" value={form.hora} onChange={v => setForm(f=>({...f,hora:v}))} options={horas} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Input label="Personas" type="number" value={form.personas} onChange={v => setForm(f=>({...f,personas:v}))} />
                <Select label="Mesa" value={form.mesa} onChange={v => setForm(f=>({...f,mesa:v}))} options={mesaOpts} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Btn onClick={crear}>Crear reserva</Btn>
              <Btn onClick={() => setMostrarForm(false)} variant="ghost">Cancelar</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── MÓDULO: CAJA Y REPORTES ──────────────────────────────────────────────────
function CajaModule({ pedidos, setPedidos, menu }) {
  const [reporteIA, setReporteIA] = useState("");
  const [loadingIA, setLoadingIA] = useState(false);

  const cerrados = pedidos.filter(p => p.estado === "cerrado");
  const activos = pedidos.filter(p => p.estado !== "cerrado" && p.estado !== "cancelado");
  const totalVentas = cerrados.reduce((s, p) => s + p.total, 0);
  const ticketPromedio = cerrados.length ? totalVentas / cerrados.length : 0;

  const vendasPorCat = menu.map(m => {
    const veces = pedidos.flatMap(p=>p.items).filter(i=>i.menuId===m.id).reduce((s,i)=>s+i.qty,0);
    return { nombre: m.nombre, categoria: m.categoria, veces, ingresos: veces * m.precio };
  }).filter(m => m.veces > 0).sort((a,b) => b.ingresos - a.ingresos);

  const cerrarPedido = (id) => setPedidos(p => p.map(pe => pe.id === id ? {...pe, estado:"cerrado"} : pe));

  const generarReporte = async () => {
    setLoadingIA(true);
    const ctx = { totalVentas, ticketPromedio, pedidosCerrados: cerrados.length, topPlatos: vendasPorCat.slice(0,5) };
    const reply = await askClaude([{ role: "user", content: `Genera un reporte ejecutivo de ventas del día para un restaurante. Datos: ${JSON.stringify(ctx)}. Incluye análisis, conclusiones y recomendaciones para mañana. Sé profesional y conciso.` }]);
    setReporteIA(reply);
    setLoadingIA(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 400, margin: 0 }}>Caja y Reportes</h2>
        <Btn onClick={generarReporte} disabled={loadingIA}>✦ {loadingIA ? "Generando reporte…" : "Reporte IA del día"}</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { label: "Total ventas", value: fmtShort(totalVentas), icon: "💰", color: COLORS.success },
          { label: "Pedidos cerrados", value: cerrados.length, icon: "✅", color: COLORS.info },
          { label: "Ticket promedio", value: fmtShort(ticketPromedio), icon: "🧾", color: COLORS.accent },
        ].map(s => (
          <Card key={s.label} style={{ padding: "1rem" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {reporteIA && (
        <Card style={{ borderColor: COLORS.accent+"40", background: COLORS.accentBg }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: COLORS.accent, fontSize: 14, fontWeight: 600 }}>✦ Reporte ejecutivo IA</span>
            <Btn onClick={() => setReporteIA("")} variant="ghost" small>✕</Btn>
          </div>
          <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{reporteIA}</p>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h3 style={{ color: COLORS.text, fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Top platos por ingresos</h3>
          {vendasPorCat.slice(0,6).map((p,i) => (
            <div key={p.nombre} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: COLORS.textFaint, fontSize: 11, width: 16 }}>#{i+1}</span>
                <div>
                  <div style={{ color: COLORS.text, fontSize: 13 }}>{p.nombre}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{p.veces} unid. · {p.categoria}</div>
                </div>
              </div>
              <span style={{ color: COLORS.accent, fontWeight: 600, fontSize: 13 }}>{fmtShort(p.ingresos)}</span>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ color: COLORS.text, fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Pedidos por cerrar</h3>
          {activos.length === 0 && <p style={{ color: COLORS.textFaint, fontSize: 13, textAlign: "center", padding: "20px 0" }}>Todos los pedidos están cerrados</p>}
          {activos.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>Mesa {p.mesa}</span>
                <span style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: 6 }}>{p.hora}</span>
                <Badge color="warning" style={{ marginLeft: 6 }}>{p.estado.replace("_"," ")}</Badge>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: COLORS.accent, fontWeight: 600, fontSize: 13 }}>{fmtShort(p.total)}</span>
                {p.estado === "listo" && <Btn onClick={() => cerrarPedido(p.id)} small>Cerrar</Btn>}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SIGR() {
  const [usuario, setUsuario] = useState(null);
  const [modulo, setModulo] = useState("dashboard");
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [pedidos, setPedidos] = useState(INITIAL_PEDIDOS);
  const [reservas, setReservas] = useState(INITIAL_RESERVAS);

  if (!usuario) return <Login onLogin={setUsuario} />;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞", roles: ["admin","mesero"] },
    { id: "pedidos", label: "Pedidos", icon: "🍴", roles: ["admin","mesero"] },
    { id: "menu", label: "Menú", icon: "📋", roles: ["admin","mesero"] },
    { id: "reservas", label: "Reservas", icon: "📅", roles: ["admin","mesero"] },
    { id: "caja", label: "Caja", icon: "💰", roles: ["admin"] },
  ].filter(n => n.roles.includes(usuario.rol));

  const modulos = { dashboard: Dashboard, pedidos: PedidosModule, menu: MenuModule, reservas: ReservasModule, caja: CajaModule };
  const ModuloActivo = modulos[modulo];

  const ctx = { pedidos: pedidos.length, reservasHoy: reservas.filter(r=>r.fecha===today()).length, platosDisponibles: menu.filter(m=>m.disponible).length };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Georgia', 'Times New Roman', serif", color: COLORS.text, display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: COLORS.bgCard, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, minHeight: "100vh" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 20, color: COLORS.accent, fontWeight: 400, letterSpacing: "-0.02em" }}>🍽 SIGR</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontFamily: "system-ui" }}>Sistema de Gestión</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setModulo(n.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: modulo === n.id ? COLORS.accentBg : "transparent", color: modulo === n.id ? COLORS.accent : COLORS.textMuted, border: modulo === n.id ? `1px solid ${COLORS.accent}30` : "1px solid transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: modulo === n.id ? 600 : 400, width: "100%", textAlign: "left", transition: "all 0.15s" }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: COLORS.accentBg, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, fontSize: 12, fontWeight: 700 }}>{usuario.avatar}</div>
            <div>
              <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 600 }}>{usuario.nombre}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 11 }}>{usuario.rol}</div>
            </div>
          </div>
          <Btn onClick={() => setUsuario(null)} variant="ghost" small style={{ width: "100%" }}>Cerrar sesión</Btn>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 28, overflowY: "auto", maxHeight: "100vh" }}>
        <ModuloActivo
          pedidos={pedidos} setPedidos={setPedidos}
          menu={menu} setMenu={setMenu}
          reservas={reservas} setReservas={setReservas}
          usuario={usuario} rol={usuario.rol}
        />
      </div>

      <AIChat context={ctx} />
    </div>
  );
}
