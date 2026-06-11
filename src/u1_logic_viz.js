import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { L4, conj, disj, getElem, impl, neg } from "./u1_logic_core";
const R = 90;
const CX = 130, CY = 130;
function polarToXY(phase, r = R) {
  return {
    x: CX + r * Math.cos(phase),
    // 実軸 → 右
    y: CY - r * Math.sin(phase)
    // 虚軸 → 上（SVG y軸反転補正）
  };
}
function NodeDot({ elem, size = 10, opacity = 1, pulse = false }) {
  const { x, y } = polarToXY(elem.phase);
  return /* @__PURE__ */ jsxs("g", { children: [
    pulse && /* @__PURE__ */ jsxs("circle", { cx: x, cy: y, r: size + 6, fill: elem.color, opacity: 0.2, children: [
      /* @__PURE__ */ jsx("animate", { attributeName: "r", values: `${size + 4};${size + 12};${size + 4}`, dur: "1.5s", repeatCount: "indefinite" }),
      /* @__PURE__ */ jsx("animate", { attributeName: "opacity", values: "0.3;0;0.3", dur: "1.5s", repeatCount: "indefinite" })
    ] }),
    /* @__PURE__ */ jsx(
      "circle",
      {
        cx: x,
        cy: y,
        r: size,
        fill: elem.color,
        opacity,
        style: { filter: `drop-shadow(0 0 6px ${elem.color})` }
      }
    )
  ] });
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
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", { id, markerWidth: "8", markerHeight: "8", refX: "6", refY: "3", orient: "auto", children: /* @__PURE__ */ jsx("path", { d: "M0,0 L0,6 L8,3 z", fill: color }) }) }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d,
        stroke: color,
        strokeWidth: "2.5",
        fill: "none",
        strokeDasharray: dashed ? "5,4" : void 0,
        markerEnd: `url(#${id})`,
        style: { filter: `drop-shadow(0 0 3px ${color})` }
      }
    )
  ] });
}
function CircleDiagram({ title, children, note }) {
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "#0d0d1a",
    border: "1px solid #1e1e3a",
    borderRadius: 16,
    padding: "20px 16px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    minWidth: 280
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }, children: title }),
    /* @__PURE__ */ jsxs("svg", { width: 260, height: 260, viewBox: "0 0 260 260", children: [
      /* @__PURE__ */ jsx("line", { x1: CX, y1: 10, x2: CX, y2: 250, stroke: "#1e1e3a", strokeWidth: 1 }),
      /* @__PURE__ */ jsx("line", { x1: 10, y1: CY, x2: 250, y2: CY, stroke: "#1e1e3a", strokeWidth: 1 }),
      /* @__PURE__ */ jsx("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: "#1e1e3a", strokeWidth: 1.5 }),
      /* @__PURE__ */ jsx("text", { x: CX + R + 8, y: CY + 4, fill: "#2a2a50", fontSize: 11, fontFamily: "monospace", children: "+1 (T)" }),
      /* @__PURE__ */ jsx("text", { x: CX + 4, y: CY - R - 8, fill: "#2a2a50", fontSize: 11, fontFamily: "monospace", children: "+i (F)" }),
      /* @__PURE__ */ jsx("text", { x: CX - R - 48, y: CY + 4, fill: "#2a2a50", fontSize: 11, fontFamily: "monospace", children: "\u22121 (T)" }),
      /* @__PURE__ */ jsx("text", { x: CX - 18, y: CY + R + 16, fill: "#2a2a50", fontSize: 11, fontFamily: "monospace", children: "\u2212i (F)" }),
      children
    ] }),
    note && /* @__PURE__ */ jsx("div", { style: { color: "#4a4a7a", fontSize: 11, fontFamily: "monospace", textAlign: "center", maxWidth: 240 }, children: note })
  ] });
}
function NegDiagram() {
  return /* @__PURE__ */ jsxs(CircleDiagram, { title: "\xACA = iA\u207B\xB9", note: "\xAC\xACA = A\uFF08\u5024\u30EC\u30D9\u30EB\u5BFE\u5408\uFF09\u3000\u03B8(\xACA) = \u03C0/2 \u2212 \u03B8(A)", children: [
    L4.map((a) => {
      const nb = getElem(neg(a.id));
      return /* @__PURE__ */ jsx(Arrow, { from: a, to: nb, color: a.color }, a.id);
    }),
    L4.map((a) => /* @__PURE__ */ jsx(NodeDot, { elem: a, pulse: true }, a.id)),
    L4.map((a) => {
      const { x, y } = polarToXY(a.phase, R + 20);
      return /* @__PURE__ */ jsx("text", { x, y, fill: a.color, fontSize: 12, fontFamily: "monospace", textAnchor: "middle", dominantBaseline: "middle", children: a.label }, a.id);
    })
  ] });
}
function BinaryDiagram({ op, opLabel, title, note, color }) {
  const [selA, setSelA] = useState("+1");
  const [selB, setSelB] = useState("+i");
  const result = op(selA, selB);
  const resElem = getElem(result);
  const aElem = getElem(selA);
  const bElem = getElem(selB);
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "#0d0d1a",
    border: "1px solid #1e1e3a",
    borderRadius: 16,
    padding: "20px 16px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    minWidth: 280
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }, children: title }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 16, alignItems: "center" }, children: [["A", selA, setSelA], ["B", selB, setSelB]].map(([lbl, val, setter]) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }, children: [
      "            ",
      /* @__PURE__ */ jsx("span", { style: { color: "#4a4a7a", fontSize: 11, fontFamily: "monospace" }, children: lbl }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 4 }, children: L4.map((e) => /* @__PURE__ */ jsx("button", { onClick: () => setter(e.id), style: {
        background: val === e.id ? e.color : "#11112a",
        color: val === e.id ? "#000" : e.color,
        border: `1px solid ${e.color}`,
        borderRadius: 6,
        padding: "3px 7px",
        fontSize: 11,
        fontFamily: "monospace",
        cursor: "pointer",
        transition: "all 0.15s"
      }, children: e.label }, e.id)) })
    ] }, lbl)) }),
    /* @__PURE__ */ jsxs("svg", { width: 260, height: 260, viewBox: "0 0 260 260", children: [
      /* @__PURE__ */ jsx("line", { x1: CX, y1: 10, x2: CX, y2: 250, stroke: "#1e1e3a", strokeWidth: 1 }),
      /* @__PURE__ */ jsx("line", { x1: 10, y1: CY, x2: 250, y2: CY, stroke: "#1e1e3a", strokeWidth: 1 }),
      /* @__PURE__ */ jsx("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: "#1e1e3a", strokeWidth: 1.5 }),
      /* @__PURE__ */ jsx("text", { x: CX + R + 8, y: CY + 4, fill: "#2a2a50", fontSize: 11, fontFamily: "monospace", children: "+1" }),
      /* @__PURE__ */ jsx("text", { x: CX + 4, y: CY - R - 8, fill: "#2a2a50", fontSize: 11, fontFamily: "monospace", children: "+i" }),
      /* @__PURE__ */ jsx("text", { x: CX - R - 28, y: CY + 4, fill: "#2a2a50", fontSize: 11, fontFamily: "monospace", children: "\u22121" }),
      /* @__PURE__ */ jsx("text", { x: CX - 18, y: CY + R + 16, fill: "#2a2a50", fontSize: 11, fontFamily: "monospace", children: "\u2212i" }),
      L4.map((e) => {
        const { x, y } = polarToXY(e.phase);
        return /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: 7, fill: "#11112a", stroke: e.color, strokeWidth: 1, opacity: 0.4 }, e.id);
      }),
      /* @__PURE__ */ jsx(Arrow, { from: aElem, to: resElem, color: "#00E5FF", curved: selA !== result }),
      selB !== selA && /* @__PURE__ */ jsx(Arrow, { from: bElem, to: resElem, color: "#FF4081", curved: true, dashed: true }),
      /* @__PURE__ */ jsx(NodeDot, { elem: aElem, size: 9 }),
      selB !== selA && /* @__PURE__ */ jsx(NodeDot, { elem: bElem, size: 9 }),
      /* @__PURE__ */ jsx(NodeDot, { elem: resElem, size: 11, pulse: true }),
      L4.map((e) => {
        const { x, y } = polarToXY(e.phase, R + 20);
        return /* @__PURE__ */ jsx("text", { x, y, fill: e.color, fontSize: 12, fontFamily: "monospace", textAnchor: "middle", dominantBaseline: "middle", children: e.label }, e.id);
      })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { fontFamily: "monospace", fontSize: 14, color: "#ffffff", letterSpacing: "0.05em" }, children: [
      /* @__PURE__ */ jsx("span", { style: { color: aElem.color }, children: selA }),
      /* @__PURE__ */ jsxs("span", { style: { color: "#4a4a7a" }, children: [
        " ",
        opLabel,
        " "
      ] }),
      /* @__PURE__ */ jsx("span", { style: { color: bElem.color }, children: selB }),
      /* @__PURE__ */ jsx("span", { style: { color: "#4a4a7a" }, children: " = " }),
      /* @__PURE__ */ jsx("span", { style: { color: resElem.color, fontWeight: "bold" }, children: result }),
      /* @__PURE__ */ jsxs("span", { style: { color: "#4a4a7a" }, children: [
        " [",
        resElem.iLabel,
        "]"
      ] })
    ] }),
    note && /* @__PURE__ */ jsx("div", { style: { color: "#4a4a7a", fontSize: 11, fontFamily: "monospace", textAlign: "center", maxWidth: 240 }, children: note })
  ] });
}
function LawDiagram({ law, title, note }) {
  const results = L4.map((a) => {
    const lhs = law.lhs(a.id);
    const rhs = law.rhs(a.id);
    return { a, lhs, rhs, ok: lhs === rhs };
  });
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "#0d0d1a",
    border: "1px solid #1e1e3a",
    borderRadius: 16,
    padding: "20px 16px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    minWidth: 280
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }, children: title }),
    /* @__PURE__ */ jsxs("svg", { width: 260, height: 260, viewBox: "0 0 260 260", children: [
      /* @__PURE__ */ jsx("line", { x1: CX, y1: 10, x2: CX, y2: 250, stroke: "#1e1e3a", strokeWidth: 1 }),
      /* @__PURE__ */ jsx("line", { x1: 10, y1: CY, x2: 250, y2: CY, stroke: "#1e1e3a", strokeWidth: 1 }),
      /* @__PURE__ */ jsx("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: "#1e1e3a", strokeWidth: 1.5 }),
      results.map(({ a, lhs, rhs, ok }) => {
        const le = getElem(lhs);
        const re = getElem(rhs);
        return /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx(NodeDot, { elem: a, size: 8, opacity: 0.5 }),
          /* @__PURE__ */ jsx(Arrow, { from: a, to: le, color: ok ? "#00ff88" : "#ff4444" }),
          !ok && /* @__PURE__ */ jsx(Arrow, { from: a, to: re, color: "#ff4444", dashed: true })
        ] }, a.id);
      }),
      L4.map((e) => {
        const { x, y } = polarToXY(e.phase, R + 20);
        return /* @__PURE__ */ jsx("text", { x, y, fill: e.color, fontSize: 12, fontFamily: "monospace", textAnchor: "middle", dominantBaseline: "middle", children: e.label }, e.id);
      })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }, children: results.map(({ a, lhs, rhs, ok }) => /* @__PURE__ */ jsxs("div", { style: {
      fontFamily: "monospace",
      fontSize: 11,
      color: ok ? "#00ff88" : "#ff4444",
      background: ok ? "#001a0d" : "#1a0000",
      border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
      borderRadius: 6,
      padding: "3px 8px"
    }, children: [
      "A=",
      a.label,
      ": ",
      lhs,
      " ",
      ok ? "=" : "\u2260",
      " ",
      rhs
    ] }, a.id)) }),
    note && /* @__PURE__ */ jsx("div", { style: { color: "#4a4a7a", fontSize: 11, fontFamily: "monospace", textAlign: "center", maxWidth: 240 }, children: note })
  ] });
}
function TautologyRow({ label, fn, expected }) {
  const results = L4.map((a) => {
    const r = fn(a.id);
    const re = getElem(r);
    return { a, r, re, ok: re.iLabel === expected };
  });
  const allOk = results.every((r) => r.ok);
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid #1e1e3a"
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontFamily: "monospace", fontSize: 13, width: 160 }, children: label }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6 }, children: results.map(({ a, r, re, ok }) => /* @__PURE__ */ jsxs("div", { style: {
      fontFamily: "monospace",
      fontSize: 11,
      color: ok ? "#00ff88" : "#ff4444",
      background: ok ? "#001a0d" : "#1a0000",
      border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
      borderRadius: 6,
      padding: "3px 8px"
    }, children: [
      a.label,
      "\u2192",
      r
    ] }, a.id)) }),
    /* @__PURE__ */ jsx("div", { style: {
      marginLeft: "auto",
      fontFamily: "monospace",
      fontSize: 12,
      color: allOk ? "#00ff88" : "#ff4444"
    }, children: allOk ? "\u2713 \u6052\u6210\u7ACB" : "\u2717" })
  ] });
}
const TABS = [
  { id: "neg", label: "\u5426\u5B9A \xAC" },
  { id: "conj", label: "\u9023\u8A00 \u2227" },
  { id: "disj", label: "\u9078\u8A00 \u2228" },
  { id: "impl", label: "\u542B\u610F \u21D2" },
  { id: "laws", label: "\u8AF8\u6CD5\u5247" }
];
function App() {
  const [tab, setTab] = useState("neg");
  return /* @__PURE__ */ jsx("div", { style: {
    minHeight: "100vh",
    background: "#080812",
    color: "#ffffff",
    fontFamily: "'Space Mono', 'Courier New', monospace",
    padding: "32px 24px"
  }, children: /* @__PURE__ */ jsxs("div", { style: { maxWidth: 900, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 32, borderBottom: "1px solid #1e1e3a", paddingBottom: 20 }, children: [
      /* @__PURE__ */ jsx("div", { style: { color: "#4a4a7a", fontSize: 11, letterSpacing: "0.15em", marginBottom: 6 }, children: "U(1) MULTI-VALUED LOGIC" }),
      /* @__PURE__ */ jsx("h1", { style: { margin: 0, fontSize: 22, fontWeight: 400, letterSpacing: "0.05em", color: "#e0e0ff" }, children: "L\u2084 = {+1, \u22121, +i, \u2212i} \u4F4D\u76F8\u56F3\u89E3" }),
      /* @__PURE__ */ jsx("div", { style: { marginTop: 10, display: "flex", gap: 12 }, children: [{ c: "#00E5FF", l: "T (\xB11)" }, { c: "#FF4081", l: "F (\xB1i)" }].map(({ c, l }) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx("div", { style: { width: 10, height: 10, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` } }),
        /* @__PURE__ */ jsx("span", { style: { color: "#4a4a7a", fontSize: 11 }, children: l })
      ] }, l)) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 4, marginBottom: 28 }, children: TABS.map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setTab(t.id), style: {
      background: tab === t.id ? "#1e1e3a" : "transparent",
      color: tab === t.id ? "#e0e0ff" : "#4a4a7a",
      border: `1px solid ${tab === t.id ? "#3a3a6a" : "#1e1e3a"}`,
      borderRadius: 8,
      padding: "7px 14px",
      fontSize: 12,
      fontFamily: "monospace",
      cursor: "pointer",
      transition: "all 0.15s",
      letterSpacing: "0.05em"
    }, children: t.label }, t.id)) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }, children: [
      tab === "neg" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(NegDiagram, {}),
        /* @__PURE__ */ jsxs("div", { style: {
          background: "#0d0d1a",
          border: "1px solid #1e1e3a",
          borderRadius: 16,
          padding: "20px 16px",
          minWidth: 280,
          display: "flex",
          flexDirection: "column",
          gap: 10
        }, children: [
          /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }, children: "\u771F\u7406\u8868" }),
          /* @__PURE__ */ jsxs("table", { style: { borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }, children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: ["A", "I(A)", "\xACA", "I(\xACA)"].map((h) => /* @__PURE__ */ jsx("th", { style: { color: "#4a4a7a", padding: "6px 14px", textAlign: "center", borderBottom: "1px solid #1e1e3a" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsx("tbody", { children: L4.map((a) => {
              const na = neg(a.id);
              const ne = getElem(na);
              return /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("td", { style: { color: a.color, padding: "6px 14px", textAlign: "center" }, children: a.label }),
                /* @__PURE__ */ jsx("td", { style: { color: a.iLabel === "T" ? "#00E5FF" : "#FF4081", padding: "6px 14px", textAlign: "center" }, children: a.iLabel }),
                /* @__PURE__ */ jsx("td", { style: { color: ne.color, padding: "6px 14px", textAlign: "center" }, children: na }),
                /* @__PURE__ */ jsx("td", { style: { color: ne.iLabel === "T" ? "#00E5FF" : "#FF4081", padding: "6px 14px", textAlign: "center" }, children: ne.iLabel })
              ] }, a.id);
            }) })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { color: "#4a4a7a", fontSize: 11, marginTop: 8 }, children: "\xAC\xACA = A\uFF08\u5024\u30EC\u30D9\u30EB\u30FB\u5BFE\u5408\uFF09" })
        ] })
      ] }),
      tab === "conj" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(BinaryDiagram, { op: conj, opLabel: "\u2227", title: "\u9023\u8A00 A\u2227B = AB", note: "\u4F4D\u76F8\u306E\u548C = \u8907\u7D20\u4E57\u6CD5", color: "#00E5FF" }),
        /* @__PURE__ */ jsxs("div", { style: {
          background: "#0d0d1a",
          border: "1px solid #1e1e3a",
          borderRadius: 16,
          padding: "20px 16px",
          minWidth: 280
        }, children: [
          /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }, children: "L\u2084 \u5168\u771F\u7406\u8868" }),
          /* @__PURE__ */ jsxs("table", { style: { borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }, children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { style: { color: "#4a4a7a", padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }, children: "\u2227" }),
              L4.map((e) => /* @__PURE__ */ jsx("th", { style: { color: e.color, padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }, children: e.label }, e.id))
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: L4.map((a) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { style: { color: a.color, padding: "4px 10px", borderRight: "1px solid #1e1e3a" }, children: a.label }),
              L4.map((b) => {
                const r = conj(a.id, b.id);
                const re = getElem(r);
                return /* @__PURE__ */ jsx("td", { style: { color: re.color, padding: "4px 10px", textAlign: "center" }, children: r }, b.id);
              })
            ] }, a.id)) })
          ] })
        ] })
      ] }),
      tab === "disj" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(BinaryDiagram, { op: disj, opLabel: "\u2228", title: "\u9078\u8A00 A\u2228B = \u2212iAB", note: "\u30C9\u30FB\u30E2\u30EB\u30AC\u30F3\u5B9A\u7FA9", color: "#FF4081" }),
        /* @__PURE__ */ jsxs("div", { style: {
          background: "#0d0d1a",
          border: "1px solid #1e1e3a",
          borderRadius: 16,
          padding: "20px 16px",
          minWidth: 280
        }, children: [
          /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }, children: "L\u2084 \u5168\u771F\u7406\u8868" }),
          /* @__PURE__ */ jsxs("table", { style: { borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }, children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { style: { color: "#4a4a7a", padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }, children: "\u2228" }),
              L4.map((e) => /* @__PURE__ */ jsx("th", { style: { color: e.color, padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }, children: e.label }, e.id))
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: L4.map((a) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { style: { color: a.color, padding: "4px 10px", borderRight: "1px solid #1e1e3a" }, children: a.label }),
              L4.map((b) => {
                const r = disj(a.id, b.id);
                const re = getElem(r);
                return /* @__PURE__ */ jsx("td", { style: { color: re.color, padding: "4px 10px", textAlign: "center" }, children: r }, b.id);
              })
            ] }, a.id)) })
          ] })
        ] })
      ] }),
      tab === "impl" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(BinaryDiagram, { op: impl, opLabel: "\u21D2", title: "\u542B\u610F A\u21D2B = BA\u207B\xB9", note: "\u8AD6\u7406\u5546 = \u4F4D\u76F8\u5DEE", color: "#FFD740" }),
        /* @__PURE__ */ jsxs("div", { style: {
          background: "#0d0d1a",
          border: "1px solid #1e1e3a",
          borderRadius: 16,
          padding: "20px 16px",
          minWidth: 280
        }, children: [
          /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }, children: "L\u2084 \u5168\u771F\u7406\u8868" }),
          /* @__PURE__ */ jsxs("table", { style: { borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }, children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { style: { color: "#4a4a7a", padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }, children: "\u21D2" }),
              L4.map((e) => /* @__PURE__ */ jsx("th", { style: { color: e.color, padding: "4px 10px", borderBottom: "1px solid #1e1e3a" }, children: e.label }, e.id))
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: L4.map((a) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { style: { color: a.color, padding: "4px 10px", borderRight: "1px solid #1e1e3a" }, children: a.label }),
              L4.map((b) => {
                const r = impl(a.id, b.id);
                const re = getElem(r);
                return /* @__PURE__ */ jsx("td", { style: { color: re.color, padding: "4px 10px", textAlign: "center" }, children: r }, b.id);
              })
            ] }, a.id)) })
          ] })
        ] })
      ] }),
      tab === "laws" && /* @__PURE__ */ jsxs("div", { style: {
        background: "#0d0d1a",
        border: "1px solid #1e1e3a",
        borderRadius: 16,
        padding: "24px 20px",
        width: "100%",
        maxWidth: 700
      }, children: [
        /* @__PURE__ */ jsx("div", { style: { color: "#a0a0c0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }, children: "\u8AF8\u6CD5\u5247\u306E\u691C\u8A3C" }),
        /* @__PURE__ */ jsx(TautologyRow, { label: "\u6392\u4E2D\u5F8B A\u2228\xACA", fn: (a) => disj(a, neg(a)), expected: "T" }),
        /* @__PURE__ */ jsx(TautologyRow, { label: "\u77DB\u76FE\u5F8B A\u2227\xACA", fn: (a) => conj(a, neg(a)), expected: "F" }),
        /* @__PURE__ */ jsx(TautologyRow, { label: "\u4E8C\u91CD\u5426\u5B9A \xAC\xACA = A", fn: (a) => {
          const r = neg(neg(a));
          return r === a ? r : "__mismatch__";
        }, expected: "T" }),
        /* @__PURE__ */ jsx("div", { style: { marginTop: 24, marginBottom: 12, color: "#4a4a7a", fontSize: 11 }, children: "\u30C9\u30FB\u30E2\u30EB\u30AC\u30F3\u7B2C\u4E00\u6CD5\u5247\u3000\xAC(A\u2227B) = \xACA\u2228\xACB\u3000\uFF08\u516816\u7D44\uFF09" }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: L4.flatMap((a) => L4.map((b) => {
          const lhs = neg(conj(a.id, b.id));
          const rhs = disj(neg(a.id), neg(b.id));
          const ok = lhs === rhs;
          return /* @__PURE__ */ jsxs("div", { style: {
            fontFamily: "monospace",
            fontSize: 10,
            color: ok ? "#00ff88" : "#ff4444",
            background: ok ? "#001a0d" : "#1a0000",
            border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
            borderRadius: 5,
            padding: "2px 7px"
          }, children: [
            a.label,
            ",",
            b.label,
            ":",
            ok ? "\u2713" : "\u2717"
          ] }, `${a.id}${b.id}`);
        })) }),
        /* @__PURE__ */ jsx("div", { style: { marginTop: 20, marginBottom: 12, color: "#4a4a7a", fontSize: 11 }, children: "\u30C9\u30FB\u30E2\u30EB\u30AC\u30F3\u7B2C\u4E8C\u6CD5\u5247\u3000\xAC(A\u2228B) = \xACA\u2227\xACB\u3000\uFF08\u516816\u7D44\uFF09" }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: L4.flatMap((a) => L4.map((b) => {
          const lhs = neg(disj(a.id, b.id));
          const rhs = conj(neg(a.id), neg(b.id));
          const ok = lhs === rhs;
          return /* @__PURE__ */ jsxs("div", { style: {
            fontFamily: "monospace",
            fontSize: 10,
            color: ok ? "#00ff88" : "#ff4444",
            background: ok ? "#001a0d" : "#1a0000",
            border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
            borderRadius: 5,
            padding: "2px 7px"
          }, children: [
            a.label,
            ",",
            b.label,
            ":",
            ok ? "\u2713" : "\u2717"
          ] }, `${a.id}${b.id}`);
        })) }),
        /* @__PURE__ */ jsx("div", { style: { marginTop: 20, marginBottom: 12, color: "#4a4a7a", fontSize: 11 }, children: "\u5BFE\u5076\u5F8B\u3000(A\u21D2B) = (\xACB\u21D2\xACA)\u3000\uFF08\u516816\u7D44\uFF09" }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: L4.flatMap((a) => L4.map((b) => {
          const lhs = impl(a.id, b.id);
          const rhs = impl(neg(b.id), neg(a.id));
          const ok = lhs === rhs;
          return /* @__PURE__ */ jsxs("div", { style: {
            fontFamily: "monospace",
            fontSize: 10,
            color: ok ? "#00ff88" : "#ff4444",
            background: ok ? "#001a0d" : "#1a0000",
            border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
            borderRadius: 5,
            padding: "2px 7px"
          }, children: [
            a.label,
            ",",
            b.label,
            ":",
            ok ? "\u2713" : "\u2717"
          ] }, `${a.id}${b.id}`);
        })) }),
        /* @__PURE__ */ jsx("div", { style: { marginTop: 20, marginBottom: 12, color: "#4a4a7a", fontSize: 11 }, children: "\u30E2\u30FC\u30C0\u30B9\u30DD\u30CD\u30F3\u30B9\u3000A\u2227(A\u21D2B) = B\u3000\uFF08\u516816\u7D44\uFF09" }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: L4.flatMap((a) => L4.map((b) => {
          const lhs = conj(a.id, impl(a.id, b.id));
          const ok = lhs === b.id;
          return /* @__PURE__ */ jsxs("div", { style: {
            fontFamily: "monospace",
            fontSize: 10,
            color: ok ? "#00ff88" : "#ff4444",
            background: ok ? "#001a0d" : "#1a0000",
            border: `1px solid ${ok ? "#00ff8840" : "#ff444440"}`,
            borderRadius: 5,
            padding: "2px 7px"
          }, children: [
            a.label,
            ",",
            b.label,
            ":",
            ok ? "\u2713" : "\u2717"
          ] }, `${a.id}${b.id}`);
        })) })
      ] })
    ] })
  ] }) });
}
export {
  App as default
};
