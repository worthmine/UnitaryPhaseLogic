import { useState } from "react";
import { L4, conj, disj, getElem, impl, neg } from "./u1_logic_core";

// SVG helpers
const R = 90;
const CX = 130, CY = 130;

function polarToXY(phase, r = R) {
  return {
    x: CX + r * Math.cos(phase),        // 実軸 → 右
    y: CY - r * Math.sin(phase),         // 虚軸 → 上（SVG y軸反転補正）
  };
}

function NodeDot({ elem, size = 10, opacity = 1, pulse = false }) {
  const { x, y } = polarToXY(elem.phase);
  return (
    <g>
      {pulse && (
        <circle cx={x} cy={y} r={size + 6} fill={elem.color} opacity={0.2}>
          <animate attributeName="r" values={`${size+4};${size+12};${size+4}`} dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={x} cy={y} r={size} fill={elem.color} opacity={opacity}
        style={{ filter: `drop-shadow(0 0 6px ${elem.color})` }} />
    </g>
  );
}

function Arrow({ from, to, color, dashed = false, curved = false }) {
  const f = polarToXY(from.phase);
  const t = polarToXY(to.phase);
  const id = `arr-${Math.random().toString(36).slice(2)}`;

  let d;
  if (curved) {
    const mx = CX, my = CY;
    d = `M ${f.x} ${f.y} Q ${mx} ${my} ${t.x} ${t.y}`;
  } else {
    d = `M ${f.x} ${f.y} L ${t.x} ${t.y}`;
  }

  return (
    <g>
      <defs>
        <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={color} />
        </marker>
      </defs>
      <path d={d} stroke={color} strokeWidth="2.5" fill="none"
        strokeDasharray={dashed ? "5,4" : undefined}
        markerEnd={`url(#${id})`}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </g>
  );
}

function CircleDiagram({ title, children, note }) {
  return (
    <div style={{
      background: "#0d0d1a",
      border: "1px solid #1e1e3a",
      borderRadius: 16,
      padding: "20px 16px 14px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      minWidth: 280,
    }}>
      <div style={{ color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>{title}</div>
      <svg width={260} height={260} viewBox="0 0 260 260">
        {/* Grid lines */}
        <line x1={CX} y1={10} x2={CX} y2={250} stroke="#1e1e3a" strokeWidth={1} />
        <line x1={10} y1={CY} x2={250} y2={CY} stroke="#1e1e3a" strokeWidth={1} />
        {/* Main circle */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e1e3a" strokeWidth={1.5} />
        {/* Axis labels: 数学標準 +1→右 +i→上 −1→左 −i→下 */}
        <text x={CX+R+8}  y={CY+4}    fill="#2a2a50" fontSize={11} fontFamily="monospace">+1 (T)</text>
        <text x={CX+4}    y={CY-R-8}  fill="#2a2a50" fontSize={11} fontFamily="monospace">+i (F)</text>
        <text x={CX-R-48} y={CY+4}    fill="#2a2a50" fontSize={11} fontFamily="monospace">−1 (T)</text>
        <text x={CX-18}   y={CY+R+16} fill="#2a2a50" fontSize={11} fontFamily="monospace">−i (F)</text>
        {children}
      </svg>
      {note && <div style={{ color: "#4a4a7a", fontSize: 11, fontFamily: "monospace", textAlign: "center", maxWidth: 240 }}>{note}</div>}
    </div>
  );
}

// ── individual diagrams ──────────────────────────────────────────────

function NegDiagram() {
  return (
    <CircleDiagram title="¬A = iA⁻¹" note="¬¬A = A（値レベル対合）　θ(¬A) = π/2 − θ(A)">
      {L4.map(a => {
        const nb = getElem(neg(a.id));
        return <Arrow key={a.id} from={a} to={nb} color={a.color} />;
      })}
      {L4.map(a => <NodeDot key={a.id} elem={a} pulse />)}
      {L4.map(a => {
        const { x, y } = polarToXY(a.phase, R + 20);
        return <text key={a.id} x={x} y={y} fill={a.color} fontSize={12} fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">{a.label}</text>;
      })}
    </CircleDiagram>
  );
}

function BinaryDiagram({ op, opLabel, title, note, color }) {
  const [selA, setSelA] = useState("+1");
  const [selB, setSelB] = useState("+i");

  const result = op(selA, selB);
  const resElem = getElem(result);
  const aElem = getElem(selA);
  const bElem = getElem(selB);

  return (
    <div style={{
      background: "#0d0d1a",
      border: "1px solid #1e1e3a",
      borderRadius: 16,
      padding: "20px 16px 14px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      minWidth: 280,
    }}>
      <div style={{ color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>{title}</div>

      {/* Selectors */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {[["A", selA, setSelA], ["B", selB, setSelB]].map(([lbl, val, setter]) => (
          <div key={lbl} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#4a4a7a", fontSize: 11, fontFamily: "monospace" }}>{lbl}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {L4.map(e => (
                <button key={e.id} onClick={() => setter(e.id)} style={{
                  background: val === e.id ? e.color : "#11112a",
                  color: val === e.id ? "#000" : e.color,
                  border: `1px solid ${e.color}`,
                  borderRadius: 6,
                  padding: "3px 7px",
                  fontSize: 11,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>{e.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <svg width={260} height={260} viewBox="0 0 260 260">
        <line x1={CX} y1={10} x2={CX} y2={250} stroke="#1e1e3a" strokeWidth={1} />
        <line x1={10} y1={CY} x2={250} y2={CY} stroke="#1e1e3a" strokeWidth={1} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e1e3a" strokeWidth={1.5} />
        <text x={CX+R+8}  y={CY+4}    fill="#2a2a50" fontSize={11} fontFamily="monospace">+1</text>
        <text x={CX+4}    y={CY-R-8}  fill="#2a2a50" fontSize={11} fontFamily="monospace">+i</text>
        <text x={CX-R-28} y={CY+4}    fill="#2a2a50" fontSize={11} fontFamily="monospace">−1</text>
        <text x={CX-18}   y={CY+R+16} fill="#2a2a50" fontSize={11} fontFamily="monospace">−i</text>

        {/* Background nodes */}
        {L4.map(e => {
          const { x, y } = polarToXY(e.phase);
          return <circle key={e.id} cx={x} cy={y} r={7} fill="#11112a" stroke={e.color} strokeWidth={1} opacity={0.4} />;
        })}

        {/* Arc from A to result */}
        <Arrow from={aElem} to={resElem} color="#00E5FF" curved={selA !== result} />
        {selB !== selA && <Arrow from={bElem} to={resElem} color="#FF4081" curved dashed />}

        {/* Highlighted nodes */}
        <NodeDot elem={aElem} size={9} />
        {selB !== selA && <NodeDot elem={bElem} size={9} />}
        <NodeDot elem={resElem} size={11} pulse />

        {/* Labels */}
        {L4.map(e => {
          const { x, y } = polarToXY(e.phase, R + 20);
          return <text key={e.id} x={x} y={y} fill={e.color} fontSize={12} fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">{e.label}</text>;
        })}
      </svg>

      {/* Result display */}
      <div style={{ fontFamily: "monospace", fontSize: 14, color: "#ffffff", letterSpacing: "0.05em" }}>
        <span style={{ color: aElem.color }}>{selA}</span>
        <span style={{ color: "#4a4a7a" }}> {opLabel} </span>
        <span style={{ color: bElem.color }}>{selB}</span>
        <span style={{ color: "#4a4a7a" }}> = </span>
        <span style={{ color: resElem.color, fontWeight: "bold" }}>{result}</span>
        <span style={{ color: "#4a4a7a" }}> [{resElem.iLabel}]</span>
      </div>

      {note && <div style={{ color: "#4a4a7a", fontSize: 11, fontFamily: "monospace", textAlign: "center", maxWidth: 240 }}>{note}</div>}
    </div>
  );
}

function LawDiagram({ law, title, note }) {
  // Show the law holds for all A (and B) in L4
  const results = L4.map(a => {
    const lhs = law.lhs(a.id);
    const rhs = law.rhs(a.id);
    return { a, lhs, rhs, ok: lhs === rhs };
  });

  return (
    <div style={{
      background: "#0d0d1a",
      border: "1px solid #1e1e3a",
      borderRadius: 16,
      padding: "20px 16px 14px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      minWidth: 280,
    }}>
      <div style={{ color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>{title}</div>

      <svg width={260} height={260} viewBox="0 0 260 260">
        <line x1={CX} y1={10} x2={CX} y2={250} stroke="#1e1e3a" strokeWidth={1} />
        <line x1={10} y1={CY} x2={250} y2={CY} stroke="#1e1e3a" strokeWidth={1} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e1e3a" strokeWidth={1.5} />

        {results.map(({ a, lhs, rhs, ok }) => {
          const le = getElem(lhs);
          const re = getElem(rhs);
          return (
            <g key={a.id}>
              <NodeDot elem={a} size={8} opacity={0.5} />
              <Arrow from={a} to={le} color={ok ? "#00ff88" : "#ff4444"} />
              {!ok && <Arrow from={a} to={re} color="#ff4444" dashed />}
            </g>
          );
        })}

        {L4.map(e => {
          const { x, y } = polarToXY(e.phase, R + 20);
          return <text key={e.id} x={x} y={y} fill={e.color} fontSize={12} fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">{e.label}</text>;
        })}
      </svg>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {results.map(({ a, lhs, rhs, ok }) => (
          <div key={a.id} style={{
            fontFamily: "monospace", fontSize: 11,
            color: ok ? "#00ff88" : "#ff4444",
            background: ok ? "#001a0d" : "#1a0000",
            border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
            borderRadius: 6, padding: "3px 8px",
          }}>
            A={a.label}: {lhs} {ok ? "=" : "≠"} {rhs}
          </div>
        ))}
      </div>

      {note && <div style={{ color: "#4a4a7a", fontSize: 11, fontFamily: "monospace", textAlign: "center", maxWidth: 240 }}>{note}</div>}
    </div>
  );
}

function TautologyRow({ label, fn, expected }) {
  const results = L4.map(a => {
    const r = fn(a.id);
    const re = getElem(r);
    return { a, r, re, ok: re.iLabel === expected };
  });
  const allOk = results.every(r => r.ok);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "8px 0", borderBottom: "1px solid #1e1e3a",
    }}>
      <div style={{ color: "#a0a0c0", fontFamily: "monospace", fontSize: 13, width: 160 }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {results.map(({ a, r, re, ok }) => (
          <div key={a.id} style={{
            fontFamily: "monospace", fontSize: 11,
            color: ok ? "#00ff88" : "#ff4444",
            background: ok ? "#001a0d" : "#1a0000",
            border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
            borderRadius: 6, padding: "3px 8px",
          }}>
            {a.label}→{r}
          </div>
        ))}
      </div>
      <div style={{
        marginLeft: "auto", fontFamily: "monospace", fontSize: 12,
        color: allOk ? "#00ff88" : "#ff4444",
      }}>
        {allOk ? "✓ 恒成立" : "✗"}
      </div>
    </div>
  );
}

// ── tabs ────────────────────────────────────────────────────────────

const TABS = [
  { id: "neg",  label: "否定 ¬" },
  { id: "conj", label: "連言 ∧" },
  { id: "disj", label: "選言 ∨" },
  { id: "impl", label: "含意 ⇒" },
  { id: "laws", label: "諸法則" },
];

export default function App() {
  const [tab, setTab] = useState("neg");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080812",
      color: "#ffffff",
      fontFamily: "'Space Mono', 'Courier New', monospace",
      padding: "32px 24px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, borderBottom: "1px solid #1e1e3a", paddingBottom: 20 }}>
          <div style={{ color: "#4a4a7a", fontSize: 11, letterSpacing: "0.15em", marginBottom: 6 }}>U(1) MULTI-VALUED LOGIC</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 400, letterSpacing: "0.05em", color: "#e0e0ff" }}>
            L₄ = &#123;+1, −1, +i, −i&#125; 位相図解
          </h1>
          <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
            {[{c:"#00E5FF",l:"T (±1)"},{c:"#FF4081",l:"F (±i)"}].map(({c,l}) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
                <span style={{ color: "#4a4a7a", fontSize: 11 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "#1e1e3a" : "transparent",
              color: tab === t.id ? "#e0e0ff" : "#4a4a7a",
              border: `1px solid ${tab === t.id ? "#3a3a6a" : "#1e1e3a"}`,
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12,
              fontFamily: "monospace",
              cursor: "pointer",
              transition: "all 0.15s",
              letterSpacing: "0.05em",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>

          {tab === "neg" && (
            <>
              <NegDiagram />
              <div style={{
                background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 16,
                padding: "20px 16px", minWidth: 280, display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>真理表</div>
                <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["A","I(A)","¬A","I(¬A)"].map(h => (
                        <th key={h} style={{ color: "#4a4a7a", padding: "6px 14px", textAlign: "center", borderBottom: "1px solid #1e1e3a" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {L4.map(a => {
                      const na = neg(a.id);
                      const ne = getElem(na);
                      return (
                        <tr key={a.id}>
                          <td style={{ color: a.color, padding: "6px 14px", textAlign: "center" }}>{a.label}</td>
                          <td style={{ color: a.iLabel === "T" ? "#00E5FF" : "#FF4081", padding: "6px 14px", textAlign: "center" }}>{a.iLabel}</td>
                          <td style={{ color: ne.color, padding: "6px 14px", textAlign: "center" }}>{na}</td>
                          <td style={{ color: ne.iLabel === "T" ? "#00E5FF" : "#FF4081", padding: "6px 14px", textAlign: "center" }}>{ne.iLabel}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ color: "#4a4a7a", fontSize: 11, marginTop: 8 }}>¬¬A = A（値レベル・対合）</div>
              </div>
            </>
          )}

          {tab === "conj" && (
            <>
              <BinaryDiagram op={conj} opLabel="∧" title="連言 A∧B = AB" note="位相の和 = 複素乗法" color="#00E5FF" />
              <div style={{
                background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 16,
                padding: "20px 16px", minWidth: 280,
              }}>
                <div style={{ color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>L₄ 全真理表</div>
                <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ color: "#4a4a7a", padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }}>∧</th>
                      {L4.map(e => <th key={e.id} style={{ color: e.color, padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }}>{e.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {L4.map(a => (
                      <tr key={a.id}>
                        <td style={{ color: a.color, padding: "4px 10px", borderRight: "1px solid #1e1e3a" }}>{a.label}</td>
                        {L4.map(b => {
                          const r = conj(a.id, b.id);
                          const re = getElem(r);
                          return <td key={b.id} style={{ color: re.color, padding: "4px 10px", textAlign: "center" }}>{r}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "disj" && (
            <>
              <BinaryDiagram op={disj} opLabel="∨" title="選言 A∨B = −iAB" note="ド・モルガン定義" color="#FF4081" />
              <div style={{
                background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 16,
                padding: "20px 16px", minWidth: 280,
              }}>
                <div style={{ color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>L₄ 全真理表</div>
                <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ color: "#4a4a7a", padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }}>∨</th>
                      {L4.map(e => <th key={e.id} style={{ color: e.color, padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }}>{e.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {L4.map(a => (
                      <tr key={a.id}>
                        <td style={{ color: a.color, padding: "4px 10px", borderRight: "1px solid #1e1e3a" }}>{a.label}</td>
                        {L4.map(b => {
                          const r = disj(a.id, b.id);
                          const re = getElem(r);
                          return <td key={b.id} style={{ color: re.color, padding: "4px 10px", textAlign: "center" }}>{r}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "impl" && (
            <>
              <BinaryDiagram op={impl} opLabel="⇒" title="含意 A⇒B = BA⁻¹" note="論理商 = 位相差" color="#FFD740" />
              <div style={{
                background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 16,
                padding: "20px 16px", minWidth: 280,
              }}>
                <div style={{ color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>L₄ 全真理表</div>
                <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ color: "#4a4a7a", padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }}>⇒</th>
                      {L4.map(e => <th key={e.id} style={{ color: e.color, padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }}>{e.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {L4.map(a => (
                      <tr key={a.id}>
                        <td style={{ color: a.color, padding: "4px 10px", borderRight: "1px solid #1e1e3a" }}>{a.label}</td>
                        {L4.map(b => {
                          const r = impl(a.id, b.id);
                          const re = getElem(r);
                          return <td key={b.id} style={{ color: re.color, padding: "4px 10px", textAlign: "center" }}>{r}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "laws" && (
            <div style={{
              background: "#0d0d1a", border: "1px solid #1e1e3a", borderRadius: 16,
              padding: "24px 20px", width: "100%", maxWidth: 700,
            }}>
              <div style={{ color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>諸法則の検証</div>

              <TautologyRow label="排中律 A∨¬A" fn={a => disj(a, neg(a))} expected="T" />
              <TautologyRow label="矛盾律 A∧¬A" fn={a => conj(a, neg(a))} expected="F" />
              <TautologyRow label="二重否定 ¬¬A = A" fn={a => { const r = neg(neg(a)); return r === a ? r : "__mismatch__"; }} expected="T" />

              <div style={{ marginTop: 24, marginBottom: 12, color: "#4a4a7a", fontSize: 11 }}>ド・モルガン第一法則　¬(A∧B) = ¬A∨¬B　（全16組）</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {L4.flatMap(a => L4.map(b => {
                  const lhs = neg(conj(a.id, b.id));
                  const rhs = disj(neg(a.id), neg(b.id));
                  const ok = lhs === rhs;
                  return (
                    <div key={`${a.id}${b.id}`} style={{
                      fontFamily: "monospace", fontSize: 10,
                      color: ok ? "#00ff88" : "#ff4444",
                      background: ok ? "#001a0d" : "#1a0000",
                      border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
                      borderRadius: 5, padding: "2px 7px",
                    }}>
                      {a.label},{b.label}:{ok ? "✓" : "✗"}
                    </div>
                  );
                }))}
              </div>

              <div style={{ marginTop: 20, marginBottom: 12, color: "#4a4a7a", fontSize: 11 }}>ド・モルガン第二法則　¬(A∨B) = ¬A∧¬B　（全16組）</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {L4.flatMap(a => L4.map(b => {
                  const lhs = neg(disj(a.id, b.id));
                  const rhs = conj(neg(a.id), neg(b.id));
                  const ok = lhs === rhs;
                  return (
                    <div key={`${a.id}${b.id}`} style={{
                      fontFamily: "monospace", fontSize: 10,
                      color: ok ? "#00ff88" : "#ff4444",
                      background: ok ? "#001a0d" : "#1a0000",
                      border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
                      borderRadius: 5, padding: "2px 7px",
                    }}>
                      {a.label},{b.label}:{ok ? "✓" : "✗"}
                    </div>
                  );
                }))}
              </div>

              <div style={{ marginTop: 20, marginBottom: 12, color: "#4a4a7a", fontSize: 11 }}>対偶律　(A⇒B) = (¬B⇒¬A)　（全16組）</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {L4.flatMap(a => L4.map(b => {
                  const lhs = impl(a.id, b.id);
                  const rhs = impl(neg(b.id), neg(a.id));
                  const ok = lhs === rhs;
                  return (
                    <div key={`${a.id}${b.id}`} style={{
                      fontFamily: "monospace", fontSize: 10,
                      color: ok ? "#00ff88" : "#ff4444",
                      background: ok ? "#001a0d" : "#1a0000",
                      border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
                      borderRadius: 5, padding: "2px 7px",
                    }}>
                      {a.label},{b.label}:{ok ? "✓" : "✗"}
                    </div>
                  );
                }))}
              </div>

              <div style={{ marginTop: 20, marginBottom: 12, color: "#4a4a7a", fontSize: 11 }}>モーダスポネンス　A∧(A⇒B) = B　（全16組）</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {L4.flatMap(a => L4.map(b => {
                  const lhs = conj(a.id, impl(a.id, b.id));
                  const ok = lhs === b.id;
                  return (
                    <div key={`${a.id}${b.id}`} style={{
                      fontFamily: "monospace", fontSize: 10,
                      color: ok ? "#00ff88" : "#ff4444",
                      background: ok ? "#001a0d" : "#1a0000",
                      border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
                      borderRadius: 5, padding: "2px 7px",
                    }}>
                      {a.label},{b.label}:{ok ? "✓" : "✗"}
                    </div>
                  );
                }))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
