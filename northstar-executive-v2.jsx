import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────
const T = {
  bg: "#0A0A0F",
  surface: "#12121A",
  surfaceHigh: "#1A1A26",
  surfaceHover: "#22222E",
  border: "#2A2A3E",
  borderHigh: "#3A3A55",
  accent: "#7B6EF6",
  accentGlow: "rgba(123,110,246,0.15)",
  accentSoft: "rgba(123,110,246,0.08)",
  gold: "#F0A500",
  goldGlow: "rgba(240,165,0,0.12)",
  green: "#22C880",
  greenGlow: "rgba(34,200,128,0.12)",
  red: "#FF4D6A",
  redGlow: "rgba(255,77,106,0.12)",
  amber: "#FF8C42",
  text: "#E8E8F0",
  textMid: "#9090B0",
  textLo: "#5A5A7A",
  mono: "'DM Mono', monospace",
  sans: "'Syne', sans-serif",
  serif: "'Lora', serif",
  // Animation
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
};

// ─── GLOBAL STYLES ───────────────────────────────────────────────
const GlobalStyles = memo(() => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    ::-webkit-scrollbar { display: none; }
    html { scroll-behavior: smooth; }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.85); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(100%); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    textarea, input {
      color: ${T.text};
      font-family: ${T.sans};
    }
    textarea::placeholder, input::placeholder {
      color: ${T.textLo};
    }

    button {
      font-family: inherit;
      transition: transform 0.15s ${T.easeOut}, opacity 0.15s ease;
    }
    button:active {
      transform: scale(0.98);
    }
  `}</style>
));

// ─── DATA ─────────────────────────────────────────────────────────
const ALERTS = [
  {
    id: "rocatinlimab",
    priority: "CRITICAL",
    priorityColor: T.red,
    icon: "🔴",
    compound: "Rocatinlimab",
    company: "Eli Lilly",
    indication: "Atopic Dermatitis",
    phase: "Phase III",
    detectedAt: "09:05 AM",
    agentSource: "ClinicalTrials.gov + PubMed",
    headline: "Phase III efficacy gap: 18.1pp vs. Dupixent",
    impact: "-$60M",
    impactLabel: "Est. Revenue Impact",
    window: "6 mo",
    windowLabel: "Window to Act",
    consensus: 93,
    analystCount: 3,
    analysts: [
      { name: "Sarah Chen", role: "Dermatology CI", badge: "THREAT", badgeColor: T.amber, confidence: 95 },
      { name: "Tom Wilson", role: "Competitive Intel", badge: "VALIDATED", badgeColor: T.green, confidence: 96 },
      { name: "Maria Lopez", role: "Market Analytics", badge: "URGENT", badgeColor: T.red, confidence: 92 },
    ],
    recommendation: "Accelerate Phase IIb to Q4 2025",
    insight: "ML model (94% historical accuracy) flags this as a Phase III acceleration trigger. 3 of 4 comparable scenarios in 2019–2023 resulted in market share erosion >12% when Sanofi delayed >9 months after competitor readout.",
    detail: {
      efficacy: { lilly: 60.2, sanofi: 42.1, label: "EASI-75 Response Rate" },
      timeline: [
        { event: "Lilly Ph III readout", date: "Jan 2025", type: "competitor" },
        { event: "Sanofi Ph IIb planned", date: "Q2 2026", type: "sanofi" },
        { event: "Lilly FDA submission est.", date: "Q3 2025", type: "competitor" },
        { event: "Accelerated target", date: "Q4 2025", type: "opportunity" },
      ],
      keyData: [
        { label: "Lilly EASI-75", value: "60.2%", delta: null, sentiment: "threat" },
        { label: "Sanofi current", value: "42.1%", delta: null, sentiment: "neutral" },
        { label: "Gap", value: "18.1pp", delta: null, sentiment: "threat" },
        { label: "Confidence", value: "98%", delta: null, sentiment: "positive" },
        { label: "N patients (Lilly)", value: "1,204", delta: null, sentiment: "neutral" },
        { label: "Primary endpoint", value: "Met", delta: null, sentiment: "threat" },
      ],
      scenarios: [
        { label: "Accelerate Ph IIb", prob: 68, impact: "+$34M", color: T.green },
        { label: "Maintain timeline", prob: 24, impact: "-$60M", color: T.red },
        { label: "Pivot indication", prob: 8, impact: "-$12M", color: T.amber },
      ],
    },
  },
  {
    id: "rinvoq",
    priority: "WARNING",
    priorityColor: T.amber,
    icon: "⚠️",
    compound: "Rinvoq",
    company: "AbbVie",
    indication: "Long-Term Safety",
    phase: "52-week data",
    detectedAt: "08:42 AM",
    agentSource: "PubMed + FDA Safety DB",
    headline: "52-week safety data complete — no new signals",
    impact: "+$18M",
    impactLabel: "Retained Revenue",
    window: "Ongoing",
    windowLabel: "Monitoring Status",
    consensus: 89,
    analystCount: 3,
    analysts: [
      { name: "Tom Wilson", role: "Competitive Intel", badge: "VALIDATED", badgeColor: T.green, confidence: 96 },
      { name: "Ana Reyes", role: "Safety Analytics", badge: "MONITORING", badgeColor: T.amber, confidence: 88 },
      { name: "James Park", role: "Regulatory CI", badge: "VALIDATED", badgeColor: T.green, confidence: 83 },
    ],
    recommendation: "Continue monitoring, proceed with next phase",
    insight: "Safety trajectory model shows 0 new MACE signals at 52 weeks — consistent with Sanofi JAK class profile. Probability of label restriction in next 18 months: 4.2% (vs. 22% industry average for JAK inhibitors).",
    detail: {
      efficacy: { lilly: 0, sanofi: 0, label: "" },
      safetyData: [
        { label: "MACE events", value: "0 new", sentiment: "positive" },
        { label: "Serious AEs", value: "6.3%", sentiment: "neutral" },
        { label: "Discontinuation", value: "8.1%", sentiment: "neutral" },
        { label: "Label risk", value: "4.2%", sentiment: "positive" },
      ],
      keyData: [
        { label: "52-week safety", value: "Complete", delta: null, sentiment: "positive" },
        { label: "New signals", value: "None", delta: null, sentiment: "positive" },
        { label: "Safety params", value: "Nominal", delta: null, sentiment: "positive" },
        { label: "Confidence", value: "97%", delta: null, sentiment: "positive" },
        { label: "Patients followed", value: "2,340", delta: null, sentiment: "neutral" },
        { label: "Follow-up period", value: "52 weeks", delta: null, sentiment: "neutral" },
      ],
      scenarios: [
        { label: "Maintain positioning", prob: 81, impact: "+$18M", color: T.green },
        { label: "Label expansion", prob: 14, impact: "+$42M", color: T.green },
        { label: "Safety concern emerges", prob: 5, impact: "-$90M", color: T.red },
      ],
    },
  },
  {
    id: "cibinqo",
    priority: "INFO",
    priorityColor: T.accent,
    icon: "📊",
    compound: "Cibinqo",
    company: "Sanofi",
    indication: "Atopic Dermatitis",
    phase: "Q4 2025 Sales",
    detectedAt: "07:30 AM",
    agentSource: "IQVIA + Internal TM1",
    headline: "Q4 sales +12% vs. forecast — pediatric uptake driver",
    impact: "+$28M",
    impactLabel: "Above Forecast",
    window: "Q1 2026",
    windowLabel: "Next Review",
    consensus: 91,
    analystCount: 3,
    analysts: [
      { name: "Nicolas Goeldel", role: "Corp. Strategy", badge: "VALIDATED", badgeColor: T.green, confidence: 94 },
      { name: "Sarah Chen", role: "Dermatology CI", badge: "VALIDATED", badgeColor: T.green, confidence: 89 },
      { name: "Maria Lopez", role: "Market Analytics", badge: "MONITOR", badgeColor: T.amber, confidence: 90 },
    ],
    recommendation: "Expand pediatric indication targeting in US/EU markets",
    insight: "Pediatric segment driving 34% of Q4 growth despite representing 18% of labeled population. ML attribution model identifies HCP outreach program launched Sep 2025 as primary driver (correlation: 0.87). Comparable expansion in EU could yield +$45M annually.",
    detail: {
      keyData: [
        { label: "Q4 actual", value: "$284M", delta: "+12%", sentiment: "positive" },
        { label: "Q4 forecast", value: "$253M", delta: null, sentiment: "neutral" },
        { label: "Pediatric share", value: "34%", delta: "+16pp", sentiment: "positive" },
        { label: "New Rx", value: "4,820", delta: "+22%", sentiment: "positive" },
        { label: "Market share AD", value: "18.4%", delta: "+2.1pp", sentiment: "positive" },
        { label: "NPS HCPs", value: "72", delta: "+8", sentiment: "positive" },
      ],
      scenarios: [
        { label: "EU pediatric expansion", prob: 74, impact: "+$45M", color: T.green },
        { label: "Maintain current strategy", prob: 20, impact: "+$12M", color: T.accent },
        { label: "Competitive erosion", prob: 6, impact: "-$18M", color: T.amber },
      ],
    },
  },
];

// ─── GENUI CHAT RESPONSES ─────────────────────────────────────────
const CHAT_RESPONSES = {
  rocatinlimab: {
    "¿Por qué 6 meses?": {
      text: "La ventana de 6 meses surge de 3 factores convergentes:",
      ui: { type: "timeline", items: [
        { label: "Lilly FDA submission", date: "Q3 2025", note: "Estimado por agente" },
        { label: "Sanofi Ph IIb acelerado", date: "Q4 2025", note: "Objetivo propuesto" },
        { label: "FDA review estándar", date: "Q1–Q2 2026", note: "12 meses típicos" },
        { label: "Posible aprobación Lilly", date: "Q3 2026", note: "Riesgo máximo" },
      ]},
    },
    "¿Cuál es el riesgo de acelerar?": {
      text: "Análisis de riesgo de aceleración a Q4 2025:",
      ui: { type: "riskmatrix", items: [
        { risk: "Datos insuficientes", prob: "Media", impact: "Alto", mitigation: "Interim analysis a 16 semanas" },
        { risk: "Recruitment lento", prob: "Baja", impact: "Medio", mitigation: "3 nuevos sites EU ya identificados" },
        { risk: "Overlap regulatorio", prob: "Baja", impact: "Bajo", mitigation: "Pre-submission meeting programado" },
      ]},
    },
    "Comparar con Dupixent": {
      text: "Posicionamiento actual vs. Dupixent en EASI-75:",
      ui: { type: "barchart", items: [
        { label: "Dupixent (IL-4/13)", value: 74, color: T.textMid },
        { label: "Rocatinlimab (Lilly)", value: 60.2, color: T.red },
        { label: "Sanofi asset (current)", value: 42.1, color: T.accent },
        { label: "Sanofi target Ph IIb", value: 58, color: T.green },
      ]},
    },
    "¿Qué han decidido antes?": {
      text: "Decision Memory — situaciones comparables en Sanofi:",
      ui: { type: "decisions", items: [
        { date: "Mar 2022", decision: "Dupixent pediatric AD: aceleración aprobada", outcome: "Aprobación 4 meses antes. +$112M en 18 meses.", positive: true },
        { date: "Oct 2020", decision: "Itepekimab COPD: mantuvo timeline original", outcome: "Competitor aprobado antes. Pérdida de first-mover.", positive: false },
      ]},
    },
  },
  default: {
    "¿Qué recomienda el sistema?": {
      text: "Basado en el análisis de los agentes y la base de conocimiento validada:",
      ui: { type: "recommendation", priority: "HIGH", action: "Accelerate Phase IIb", confidence: 93, analysts: 3 },
    },
  },
};

// ─── UTILITY COMPONENTS ───────────────────────────────────────────

const PriorityBadge = memo(({ priority, color }) => (
  <span style={{
    fontFamily: T.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: color,
    border: `1px solid ${color}`,
    padding: "3px 8px",
    borderRadius: 3,
    textTransform: "uppercase",
    background: `${color}10`,
  }}>
    {priority}
  </span>
));

const AgentBadge = memo(({ time }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: T.accent,
      display: "inline-block",
      boxShadow: `0 0 8px ${T.accent}`,
      animation: "pulse 2s infinite",
    }} />
    <span style={{
      fontFamily: T.mono,
      fontSize: 9,
      color: T.textMid,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    }}>
      Agent detected · {time}
    </span>
  </div>
));

const AnalystChip = memo(({ analyst }) => (
  <div style={{
    background: T.surfaceHigh,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    flex: 1,
    minWidth: 0,
    transition: `all 0.2s ${T.easeOut}`,
  }}>
    <div style={{
      fontFamily: T.sans,
      fontSize: 11,
      color: T.text,
      fontWeight: 600,
      marginBottom: 4,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}>
      {analyst.name}
    </div>
    <div style={{
      fontFamily: T.mono,
      fontSize: 8,
      color: T.textLo,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 1,
    }}>
      {analyst.role}
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{
        fontFamily: T.mono,
        fontSize: 8,
        color: analyst.badgeColor,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        padding: "2px 6px",
        background: `${analyst.badgeColor}15`,
        borderRadius: 3,
      }}>
        {analyst.badge}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textMid }}>{analyst.confidence}%</span>
    </div>
  </div>
));

const LoadingDots = memo(() => (
  <div style={{ display: "flex", gap: 5, padding: "12px 4px" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: T.accent,
        animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
      }} />
    ))}
  </div>
));

const MetricCard = memo(({ label, value, color, sub }) => (
  <div style={{
    background: T.surfaceHigh,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: 14,
    transition: `all 0.2s ${T.easeOut}`,
  }}>
    <div style={{
      fontFamily: T.mono,
      fontSize: 22,
      color: color,
      fontWeight: 700,
      marginBottom: 2,
    }}>
      {value}
    </div>
    <div style={{
      fontFamily: T.mono,
      fontSize: 9,
      color: T.textLo,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 2,
    }}>
      {label}
    </div>
    {sub && (
      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.textLo }}>{sub}</div>
    )}
  </div>
));

// ─── GENUI COMPONENTS ─────────────────────────────────────────────

const GenUIBarChart = memo(({ items }) => {
  const max = useMemo(() => Math.max(...items.map(i => i.value)), [items]);

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      padding: 16,
      marginTop: 12,
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: i < items.length - 1 ? 12 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{
              fontFamily: T.mono,
              fontSize: 9,
              color: T.textMid,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              {item.label}
            </span>
            <span style={{
              fontFamily: T.mono,
              fontSize: 11,
              color: item.color,
              fontWeight: 600,
            }}>
              {item.value}%
            </span>
          </div>
          <div style={{
            height: 6,
            background: T.surfaceHigh,
            borderRadius: 3,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(item.value / max) * 100}%`,
              background: item.color,
              borderRadius: 3,
              transition: `width 0.8s ${T.easeOut}`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
});

const GenUITimeline = memo(({ items }) => (
  <div style={{ marginTop: 12 }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: T.accent,
            border: `2px solid ${T.accentGlow}`,
            flexShrink: 0,
            boxShadow: `0 0 8px ${T.accentGlow}`,
          }} />
          {i < items.length - 1 && (
            <div style={{
              width: 1,
              height: 28,
              background: `linear-gradient(to bottom, ${T.border}, transparent)`,
              marginTop: 4,
            }} />
          )}
        </div>
        <div style={{ paddingBottom: 4 }}>
          <div style={{
            fontFamily: T.sans,
            fontSize: 12,
            color: T.text,
            fontWeight: 500,
          }}>
            {item.label}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.gold }}>{item.date}</span>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.textLo }}>{item.note}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
));

const GenUIRiskMatrix = memo(({ items }) => (
  <div style={{ marginTop: 12 }}>
    {items.map((item, i) => {
      const probColor = item.prob === "Alta" ? T.red : item.prob === "Media" ? T.amber : T.green;
      return (
        <div key={i} style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 14,
          marginBottom: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.text, fontWeight: 600 }}>{item.risk}</span>
            <span style={{
              fontFamily: T.mono,
              fontSize: 9,
              color: probColor,
              border: `1px solid ${probColor}`,
              padding: "2px 8px",
              borderRadius: 3,
              background: `${probColor}10`,
            }}>
              PROB {item.prob}
            </span>
          </div>
          <div style={{
            fontFamily: T.mono,
            fontSize: 10,
            color: T.textMid,
            lineHeight: 1.5,
            paddingLeft: 10,
            borderLeft: `2px solid ${T.green}40`,
          }}>
            ↳ {item.mitigation}
          </div>
        </div>
      );
    })}
  </div>
));

const GenUIDecisions = memo(({ items }) => (
  <div style={{ marginTop: 12 }}>
    {items.map((item, i) => (
      <div key={i} style={{
        background: T.surface,
        border: `1px solid ${item.positive ? T.green : T.red}25`,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderLeft: `3px solid ${item.positive ? T.green : T.red}`,
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.textLo, marginBottom: 6 }}>{item.date}</div>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.text, fontWeight: 600, marginBottom: 8 }}>{item.decision}</div>
        <div style={{
          fontFamily: T.serif,
          fontSize: 11,
          color: item.positive ? T.green : T.red,
          fontStyle: "italic",
          lineHeight: 1.5,
        }}>
          "{item.outcome}"
        </div>
      </div>
    ))}
  </div>
));

const GenUIRecommendation = memo(({ ui }) => (
  <div style={{
    marginTop: 12,
    background: `linear-gradient(135deg, ${T.accentGlow}, ${T.goldGlow})`,
    border: `1px solid ${T.borderHigh}`,
    borderRadius: 12,
    padding: 18,
  }}>
    <div style={{
      fontFamily: T.mono,
      fontSize: 9,
      color: T.accent,
      letterSpacing: 2,
      marginBottom: 10,
      textTransform: "uppercase",
    }}>
      System Recommendation
    </div>
    <div style={{
      fontFamily: T.sans,
      fontSize: 17,
      color: T.text,
      fontWeight: 700,
      marginBottom: 12,
    }}>
      {ui.action}
    </div>
    <div style={{ display: "flex", gap: 20 }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 20, color: T.gold, fontWeight: 600 }}>{ui.confidence}%</div>
        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.textLo, textTransform: "uppercase", letterSpacing: 1 }}>Consensus</div>
      </div>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 20, color: T.green, fontWeight: 600 }}>{ui.analysts}</div>
        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.textLo, textTransform: "uppercase", letterSpacing: 1 }}>Analysts</div>
      </div>
    </div>
  </div>
));

const GenUIBlock = memo(({ ui }) => {
  if (!ui) return null;

  switch (ui.type) {
    case "barchart": return <GenUIBarChart items={ui.items} />;
    case "timeline": return <GenUITimeline items={ui.items} />;
    case "riskmatrix": return <GenUIRiskMatrix items={ui.items} />;
    case "decisions": return <GenUIDecisions items={ui.items} />;
    case "recommendation": return <GenUIRecommendation ui={ui} />;
    default: return null;
  }
});

// ─── CHAT PANEL ───────────────────────────────────────────────────

function ChatPanel({ alertId, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "system",
      text: "Estoy conectado a la base de conocimiento validada por tu equipo para este asset. Puedo explicarte el análisis, mostrar datos comparativos, y ayudarte a estructurar tu decisión.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const allResponses = useMemo(() => ({
    ...(CHAT_RESPONSES[alertId] || {}),
    ...CHAT_RESPONSES.default,
  }), [alertId]);

  const suggestions = useMemo(() => Object.keys(allResponses).slice(0, 4), [allResponses]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    const localKey = Object.keys(allResponses).find(k =>
      text.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(text.toLowerCase())
    );

    if (localKey && allResponses[localKey]) {
      setTimeout(() => {
        setMessages(m => [...m, {
          role: "assistant",
          text: allResponses[localKey].text,
          ui: allResponses[localKey].ui,
        }]);
        setLoading(false);
      }, 800);
      return;
    }

    // Fallback response for demo
    setTimeout(() => {
      setMessages(m => [...m, {
        role: "assistant",
        text: "Basado en la base de conocimiento, puedo confirmar que este análisis ha sido validado por el equipo. ¿Te gustaría explorar algún aspecto específico de los datos?",
      }]);
      setLoading(false);
    }, 1200);
  }, [allResponses]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: T.bg,
      display: "flex",
      flexDirection: "column",
      animation: "fadeIn 0.3s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`,
        background: T.surface,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            background: T.surfaceHigh,
            border: `1px solid ${T.border}`,
            color: T.textMid,
            fontSize: 16,
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 8,
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 700 }}>Ask OneStrat</div>
          <div style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.accent,
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}>
            Knowledge Base · Analyst-Validated
          </div>
        </div>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: T.green,
          boxShadow: `0 0 10px ${T.green}`,
        }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 0" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            animation: "fadeIn 0.3s ease",
          }}>
            {msg.role === "system" && (
              <div style={{
                background: T.surfaceHigh,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                borderTopLeftRadius: 4,
                padding: "12px 16px",
                maxWidth: "88%",
              }}>
                <div style={{
                  fontFamily: T.mono,
                  fontSize: 8,
                  color: T.accent,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}>
                  OneStrat
                </div>
                <div style={{
                  fontFamily: T.serif,
                  fontSize: 13,
                  color: T.textMid,
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}>
                  {msg.text}
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div style={{
                background: T.accent,
                borderRadius: 14,
                borderTopRightRadius: 4,
                padding: "12px 16px",
                maxWidth: "80%",
              }}>
                <div style={{ fontFamily: T.sans, fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{msg.text}</div>
              </div>
            )}
            {msg.role === "assistant" && (
              <div style={{ maxWidth: "92%" }}>
                <div style={{
                  background: T.surfaceHigh,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  borderTopLeftRadius: 4,
                  padding: "14px 16px",
                }}>
                  <div style={{
                    fontFamily: T.mono,
                    fontSize: 8,
                    color: T.accent,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}>
                    OneStrat · GenUI
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: T.text, lineHeight: 1.6 }}>{msg.text}</div>
                  {msg.ui && <GenUIBlock ui={msg.ui} />}
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && <LoadingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div style={{ padding: "14px 16px 0", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              style={{
                background: T.surfaceHigh,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: "8px 14px",
                fontFamily: T.mono,
                fontSize: 10,
                color: T.textMid,
                cursor: "pointer",
                letterSpacing: 0.5,
                transition: `all 0.2s ${T.easeOut}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "16px",
        borderTop: `1px solid ${T.border}`,
        display: "flex",
        gap: 12,
        background: T.surface,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta sobre este asset..."
          style={{
            flex: 1,
            background: T.surfaceHigh,
            border: `1px solid ${T.border}`,
            borderRadius: 24,
            padding: "12px 18px",
            fontFamily: T.sans,
            fontSize: 14,
            color: T.text,
            outline: "none",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          aria-label="Send message"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: input.trim() ? T.accent : T.border,
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: input.trim() ? "#fff" : T.textLo,
            flexShrink: 0,
            transition: `all 0.2s ${T.easeOut}`,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

// ─── DECISION MODAL ───────────────────────────────────────────────

function DecisionModal({ alert, onClose }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const options = useMemo(() => [
    { id: "proceed", label: "Proceder con recomendación", desc: alert.recommendation, color: T.green },
    { id: "discuss", label: "Abrir discusión con equipo", desc: "Escalar para alineación antes de decidir", color: T.amber },
    { id: "wait", label: "Tomar más tiempo", desc: "Reservar decisión para próximo IC", color: T.accent },
  ], [alert.recommendation]);

  if (submitted) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.3s ease",
      }}>
        <div style={{
          background: T.surface,
          border: `1px solid ${T.green}`,
          borderRadius: 20,
          padding: 36,
          textAlign: "center",
          maxWidth: 320,
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{
            fontSize: 48,
            marginBottom: 20,
            filter: `drop-shadow(0 0 12px ${T.green})`,
          }}>
            ✓
          </div>
          <div style={{
            fontFamily: T.sans,
            fontSize: 20,
            color: T.green,
            fontWeight: 700,
            marginBottom: 10,
          }}>
            Decisión registrada
          </div>
          <div style={{
            fontFamily: T.serif,
            fontSize: 13,
            color: T.textMid,
            fontStyle: "italic",
            marginBottom: 28,
            lineHeight: 1.6,
          }}>
            Quedará en la base de conocimiento con seguimiento de outcome.
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.green,
              border: "none",
              borderRadius: 10,
              padding: "14px 32px",
              fontFamily: T.sans,
              fontSize: 14,
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 200,
      background: "rgba(0,0,0,0.85)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
    }}>
      <div
        onClick={onClose}
        style={{ flex: 1 }}
        aria-label="Close modal"
      />
      <div style={{
        background: T.surface,
        borderRadius: "24px 24px 0 0",
        padding: 24,
        border: `1px solid ${T.border}`,
        animation: "slideUp 0.35s ease",
      }}>
        <div style={{
          width: 40,
          height: 4,
          background: T.border,
          borderRadius: 2,
          margin: "0 auto 24px",
        }} />

        <div style={{
          fontFamily: T.sans,
          fontSize: 18,
          color: T.text,
          fontWeight: 700,
          marginBottom: 6,
        }}>
          Registrar decisión
        </div>
        <div style={{
          fontFamily: T.mono,
          fontSize: 10,
          color: T.textLo,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 24,
        }}>
          {alert.compound} · {alert.indication}
        </div>

        <div style={{ marginBottom: 20 }}>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                width: "100%",
                textAlign: "left",
                background: selected === opt.id ? `${opt.color}15` : T.surfaceHigh,
                border: `1px solid ${selected === opt.id ? opt.color : T.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 10,
                cursor: "pointer",
                transition: `all 0.2s ${T.easeOut}`,
              }}
            >
              <div style={{
                fontFamily: T.sans,
                fontSize: 14,
                color: selected === opt.id ? opt.color : T.text,
                fontWeight: 600,
                marginBottom: 4,
              }}>
                {opt.label}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textLo }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Nota de contexto (opcional) — quedará en Decision Memory..."
          style={{
            width: "100%",
            background: T.surfaceHigh,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 14,
            fontFamily: T.serif,
            fontSize: 13,
            color: T.text,
            height: 80,
            resize: "none",
            outline: "none",
            marginBottom: 20,
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "none",
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 16,
              fontFamily: T.sans,
              fontSize: 14,
              color: T.textMid,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => selected && setSubmitted(true)}
            style={{
              flex: 2,
              background: selected ? T.accent : T.border,
              border: "none",
              borderRadius: 12,
              padding: 16,
              fontFamily: T.sans,
              fontSize: 14,
              color: selected ? "#fff" : T.textLo,
              fontWeight: 700,
              cursor: selected ? "pointer" : "default",
              transition: `all 0.2s ${T.easeOut}`,
            }}
          >
            Confirmar decisión
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ALERT DETAIL ─────────────────────────────────────────────────

function AlertDetail({ alert, onBack }) {
  const [showChat, setShowChat] = useState(false);
  const [showDecision, setShowDecision] = useState(false);

  const keyMetrics = useMemo(() => [
    { label: alert.impactLabel, value: alert.impact, color: alert.impact.startsWith("+") ? T.green : T.red },
    { label: alert.windowLabel, value: alert.window, color: T.gold },
    { label: "Analyst Consensus", value: `${alert.consensus}%`, color: T.accent },
    { label: "Analysts", value: `${alert.analystCount} validated`, color: T.textMid },
  ], [alert]);

  if (showChat) {
    return <ChatPanel alertId={alert.id} onClose={() => setShowChat(false)} />;
  }

  return (
    <div style={{ minHeight: "100dvh", background: T.bg, paddingBottom: 110 }}>
      {showDecision && <DecisionModal alert={alert} onClose={() => setShowDecision(false)} />}

      {/* Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: `${T.bg}EE`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        padding: "18px 20px",
        borderBottom: `1px solid ${T.border}22`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button
            onClick={onBack}
            style={{
              background: T.surfaceHigh,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "8px 14px",
              fontFamily: T.mono,
              fontSize: 11,
              color: T.textMid,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <PriorityBadge priority={alert.priority} color={alert.priorityColor} />
        </div>
        <div style={{ fontSize: 24, marginBottom: 6 }}>{alert.icon}</div>
        <div style={{
          fontFamily: T.sans,
          fontSize: 22,
          color: T.text,
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 6,
        }}>
          {alert.compound}
        </div>
        <div style={{
          fontFamily: T.mono,
          fontSize: 10,
          color: T.textLo,
          textTransform: "uppercase",
          letterSpacing: 1.5,
        }}>
          {alert.company} · {alert.phase}
        </div>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        {/* Agent source */}
        <div style={{ marginBottom: 24 }}>
          <AgentBadge time={alert.detectedAt} />
          <div style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.textLo,
            marginTop: 6,
            letterSpacing: 0.5,
          }}>
            Source: {alert.agentSource}
          </div>
        </div>

        {/* Headline */}
        <div style={{
          background: `linear-gradient(135deg, ${alert.priorityColor}12, transparent)`,
          border: `1px solid ${alert.priorityColor}30`,
          borderRadius: 14,
          padding: 18,
          marginBottom: 24,
        }}>
          <div style={{
            fontFamily: T.sans,
            fontSize: 16,
            color: T.text,
            fontWeight: 600,
            lineHeight: 1.45,
          }}>
            {alert.headline}
          </div>
        </div>

        {/* Key metrics grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {keyMetrics.map((m, i) => (
            <MetricCard key={i} label={m.label} value={m.value} color={m.color} />
          ))}
        </div>

        {/* ML Insight */}
        <div style={{
          background: T.surfaceHigh,
          border: `1px solid ${T.accent}40`,
          borderRadius: 14,
          padding: 18,
          marginBottom: 24,
        }}>
          <div style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.accent,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>🤖</span> ML Agent Insight
          </div>
          <div style={{
            fontFamily: T.serif,
            fontSize: 13,
            color: T.textMid,
            lineHeight: 1.75,
            fontStyle: "italic",
          }}>
            "{alert.insight}"
          </div>
        </div>

        {/* Key data grid */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.textLo,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 14,
          }}>
            Key Data Points
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {alert.detail.keyData.map((d, i) => {
              const col = d.sentiment === "positive" ? T.green : d.sentiment === "threat" ? T.red : T.textMid;
              return (
                <div key={i} style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: 12,
                }}>
                  <div style={{
                    fontFamily: T.mono,
                    fontSize: 9,
                    color: T.textLo,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 6,
                  }}>
                    {d.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 15, color: col, fontWeight: 600 }}>{d.value}</span>
                    {d.delta && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.green }}>{d.delta}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Efficacy comparison */}
        {alert.detail.efficacy?.label && (
          <div style={{
            background: T.surfaceHigh,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 18,
            marginBottom: 24,
          }}>
            <div style={{
              fontFamily: T.mono,
              fontSize: 9,
              color: T.textLo,
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 16,
            }}>
              {alert.detail.efficacy.label}
            </div>
            {[
              { label: `${alert.company} (competitor)`, value: alert.detail.efficacy.lilly, color: T.red },
              { label: "Sanofi (current)", value: alert.detail.efficacy.sanofi, color: T.accent },
            ].map((bar, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textMid }}>{bar.label}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 13, color: bar.color, fontWeight: 700 }}>{bar.value}%</span>
                </div>
                <div style={{ height: 8, background: T.surface, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(bar.value / 80) * 100}%`,
                    background: bar.color,
                    borderRadius: 4,
                    transition: `width 0.6s ${T.easeOut}`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scenarios */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.textLo,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 14,
          }}>
            Scenario Analysis
          </div>
          {alert.detail.scenarios.map((s, i) => (
            <div key={i} style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: `2px solid ${s.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: `${s.color}10`,
              }}>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: s.color, fontWeight: 700 }}>{s.prob}%</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: T.sans,
                  fontSize: 13,
                  color: T.text,
                  fontWeight: 600,
                  marginBottom: 4,
                }}>
                  {s.label}
                </div>
                <div style={{ height: 4, background: T.surfaceHigh, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${s.prob}%`,
                    background: s.color,
                    borderRadius: 2,
                    transition: `width 0.6s ${T.easeOut}`,
                  }} />
                </div>
              </div>
              <div style={{
                fontFamily: T.mono,
                fontSize: 14,
                color: s.color,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {s.impact}
              </div>
            </div>
          ))}
        </div>

        {/* Analysts */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.textLo,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 14,
          }}>
            Analyst Consensus · {alert.consensus}%
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {alert.analysts.map((a, i) => <AnalystChip key={i} analyst={a} />)}
          </div>
        </div>

        {/* Recommendation */}
        <div style={{
          background: `linear-gradient(135deg, ${T.goldGlow}, ${T.accentGlow})`,
          border: `1px solid ${T.gold}40`,
          borderRadius: 14,
          padding: 18,
        }}>
          <div style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.gold,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>🎯</span> Recommendation
          </div>
          <div style={{
            fontFamily: T.sans,
            fontSize: 16,
            color: T.text,
            fontWeight: 600,
          }}>
            {alert.recommendation}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: `${T.bg}F8`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${T.border}`,
        padding: "14px 20px 28px",
        display: "flex",
        gap: 12,
      }}>
        <button
          onClick={() => setShowChat(true)}
          style={{
            flex: 1,
            background: T.surfaceHigh,
            border: `1px solid ${T.accent}`,
            borderRadius: 14,
            padding: 16,
            fontFamily: T.sans,
            fontSize: 14,
            color: T.accent,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          💬 Ask AI
        </button>
        <button
          onClick={() => setShowDecision(true)}
          style={{
            flex: 2,
            background: T.accent,
            border: "none",
            borderRadius: 14,
            padding: 16,
            fontFamily: T.sans,
            fontSize: 14,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Review & Decide →
        </button>
      </div>
    </div>
  );
}

// ─── ALERT CARD ───────────────────────────────────────────────────

const AlertCard = memo(({ alert, onClick, index }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      textAlign: "left",
      background: T.surface,
      border: `1px solid ${index === 0 ? `${alert.priorityColor}40` : T.border}`,
      borderRadius: 16,
      padding: 20,
      marginBottom: 14,
      cursor: "pointer",
      transition: `all 0.2s ${T.easeOut}`,
      animation: `fadeIn 0.5s ${T.easeOut} ${index * 0.1}s both`,
    }}
  >
    {/* Header */}
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>{alert.icon}</span>
        <div>
          <div style={{
            fontFamily: T.sans,
            fontSize: 16,
            color: T.text,
            fontWeight: 700,
            marginBottom: 2,
          }}>
            {alert.compound}
          </div>
          <div style={{
            fontFamily: T.mono,
            fontSize: 9,
            color: T.textLo,
            letterSpacing: 1,
          }}>
            {alert.company} · {alert.phase}
          </div>
        </div>
      </div>
      <PriorityBadge priority={alert.priority} color={alert.priorityColor} />
    </div>

    <AgentBadge time={alert.detectedAt} />

    {/* Headline */}
    <div style={{
      background: T.surfaceHigh,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      padding: 14,
      margin: "14px 0",
    }}>
      <div style={{
        fontFamily: T.serif,
        fontSize: 13,
        color: T.textMid,
        lineHeight: 1.65,
        fontStyle: "italic",
      }}>
        {alert.headline}
      </div>
    </div>

    {/* Metrics */}
    <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
      <div>
        <div style={{
          fontFamily: T.mono,
          fontSize: 15,
          color: alert.impact.startsWith("+") ? T.green : T.red,
          fontWeight: 700,
        }}>
          {alert.impact}
        </div>
        <div style={{
          fontFamily: T.mono,
          fontSize: 8,
          color: T.textLo,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}>
          {alert.impactLabel}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 15, color: T.gold, fontWeight: 700 }}>{alert.window}</div>
        <div style={{
          fontFamily: T.mono,
          fontSize: 8,
          color: T.textLo,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}>
          {alert.windowLabel}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 15, color: T.accent, fontWeight: 700 }}>{alert.consensus}%</div>
        <div style={{
          fontFamily: T.mono,
          fontSize: 8,
          color: T.textLo,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}>
          Consensus
        </div>
      </div>
    </div>

    {/* Recommendation preview */}
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      background: `${T.gold}10`,
      border: `1px solid ${T.gold}20`,
      borderRadius: 8,
    }}>
      <span style={{
        fontFamily: T.mono,
        fontSize: 8,
        color: T.gold,
        textTransform: "uppercase",
        letterSpacing: 1.5,
      }}>
        Rec:
      </span>
      <span style={{ fontFamily: T.sans, fontSize: 12, color: T.text }}>{alert.recommendation}</span>
    </div>

    {/* CTA */}
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 14,
      gap: 6,
    }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.accent, letterSpacing: 1 }}>Review & Decide</span>
      <span style={{ color: T.accent, fontSize: 14 }}>→</span>
    </div>
  </button>
));

// ─── MAIN APP ─────────────────────────────────────────────────────

export default function NorthStarExecutive() {
  const [activeAlert, setActiveAlert] = useState(null);

  const summaryMetrics = useMemo(() => [
    { label: "Revenue at risk", value: "-$60M", color: T.red, sub: "1 critical asset" },
    { label: "Consensus", value: "93%", color: T.green, sub: "3 analysts aligned" },
    { label: "Window to act", value: "6 mo", color: T.gold, sub: "Rocatinlimab" },
    { label: "Alerts today", value: "3", color: T.accent, sub: "1 critical · 2 info" },
  ], []);

  if (activeAlert) {
    return <AlertDetail alert={activeAlert} onBack={() => setActiveAlert(null)} />;
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: T.bg,
      maxWidth: 430,
      margin: "0 auto",
      fontFamily: T.sans,
    }}>
      <GlobalStyles />

      {/* Top nav */}
      <div style={{
        padding: "22px 20px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontFamily: T.mono,
            fontSize: 11,
            color: T.accent,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 2,
          }}>
            OneStrat
          </div>
          <div style={{
            fontFamily: T.mono,
            fontSize: 8,
            color: T.textLo,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}>
            NorthStar · Executive
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.text, fontWeight: 600 }}>Robert Amezquita</div>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.textLo, letterSpacing: 1 }}>VP Corporate Strategy</div>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ padding: "32px 20px 0" }}>
        <div style={{
          fontFamily: T.sans,
          fontSize: 28,
          color: T.text,
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 10,
        }}>
          Good morning,<br />Robert.
        </div>
        <div style={{
          fontFamily: T.serif,
          fontSize: 14,
          color: T.textMid,
          fontStyle: "italic",
          lineHeight: 1.5,
        }}>
          Atopic Dermatitis Program · 3 alerts ready for your decision
        </div>
      </div>

      {/* Summary metrics */}
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {summaryMetrics.map((m, i) => (
            <MetricCard key={i} label={m.label} value={m.value} color={m.color} sub={m.sub} />
          ))}
        </div>
      </div>

      {/* Alert cards */}
      <div style={{ padding: "32px 20px 0" }}>
        <div style={{
          fontFamily: T.mono,
          fontSize: 9,
          color: T.textLo,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 18,
        }}>
          Today's Intelligence Feed
        </div>

        {ALERTS.map((alert, i) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            index={i}
            onClick={() => setActiveAlert(alert)}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px 52px", textAlign: "center" }}>
        <div style={{
          fontFamily: T.mono,
          fontSize: 8,
          color: T.textLo,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}>
          OneStrat · Continuous Strategic Intelligence · North Star Preview
        </div>
      </div>
    </div>
  );
}
