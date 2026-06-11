import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { L4, conj, disj, getElem, impl, neg } from "./u1_logic_core";
import "./u1_logic_viz.css";
const R = 90;
const CX = 130, CY = 130;
function polarToXY(phase, r = R) {
  return {
    x: CX + r * Math.cos(phase), // 実軸 → 右
    y: CY - r * Math.sin(phase) // 虚軸 → 上（SVG y軸反転補正）
  };
}
function NodeDot({ elem, size = 10, opacity = 1, pulse = false }) {
  const { x, y } = polarToXY(elem.phase);
  return jsxs("g", { children: [
    pulse && jsxs("circle", { cx: x, cy: y, r: size + 6, fill: elem.color, opacity: 0.2, children: [
      jsx("animate", { attributeName: "r", values: `${size + 4};${size + 12};${size + 4}`, dur: "1.5s", repeatCount: "indefinite" }),
      jsx("animate", { attributeName: "opacity", values: "0.3;0;0.3", dur: "1.5s", repeatCount: "indefinite" })
    ] }),
    jsx("circle", { cx: x, cy: y, r: size, fill: elem.color, opacity, style: { filter: `drop-shadow(0 0 6px ${elem.color})` } })
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
  return jsxs("g", { children: [
    jsx("defs", { children: jsx("marker", { id, markerWidth: "8", markerHeight: "8", refX: "6", refY: "3", orient: "auto", children: jsx("path", { d: "M0,0 L0,6 L8,3 z", fill: color }) }) }),
    jsx("path", {
      d,
      stroke: color,
      strokeWidth: "2.5",
      fill: "none",
      strokeDasharray: dashed ? "5,4" : void 0,
      markerEnd: `url(#${id})`,
      style: { filter: `drop-shadow(0 0 3px ${color})` }
    })
  ] });
}
function DiagramGrid() {
  return jsxs(Fragment, { children: [
    jsx("line", { x1: CX, y1: 10, x2: CX, y2: 250, className: "upl-grid-line" }),
    jsx("line", { x1: 10, y1: CY, x2: 250, y2: CY, className: "upl-grid-line" }),
    jsx("circle", { cx: CX, cy: CY, r: R, className: "upl-grid-circle" })
  ] });
}
function ElemLabels() {
  return L4.map((e) => {
    const { x, y } = polarToXY(e.phase, R + 20);
    return jsx("text", { x, y, fill: e.color, className: "upl-elem-text", children: e.label }, e.id);
  });
}
function CircleDiagram({ title, children, note }) {
  return jsxs("div", { className: "upl-card upl-card--center", children: [
    jsx("div", { className: "upl-card-title", children: title }),
    jsxs("svg", { width: 260, height: 260, viewBox: "0 0 260 260", children: [
      jsx(DiagramGrid, {}),
      jsx("text", { x: CX + R + 8, y: CY + 4, className: "upl-axis-text", children: "+1 (T)" }),
      jsx("text", { x: CX + 4, y: CY - R - 8, className: "upl-axis-text", children: "+i (F)" }),
      jsx("text", { x: CX - R - 48, y: CY + 4, className: "upl-axis-text", children: "−1 (T)" }),
      jsx("text", { x: CX - 18, y: CY + R + 16, className: "upl-axis-text", children: "−i (F)" }),
      children
    ] }),
    note && jsx("div", { className: "upl-note", children: note })
  ] });
}
function NegDiagram() {
  return jsxs(CircleDiagram, { title: "¬A = iA⁻¹", note: "¬¬A = A（値レベル対合）　θ(¬A) = π/2 − θ(A)", children: [
    L4.map((a) => {
      const nb = getElem(neg(a.id));
      return jsx(Arrow, { from: a, to: nb, color: a.color }, a.id);
    }),
    L4.map((a) => jsx(NodeDot, { elem: a, pulse: true }, a.id)),
    jsx(ElemLabels, {})
  ] });
}
function BinaryDiagram({ op, opLabel, title, note }) {
  const [selA, setSelA] = useState("+1");
  const [selB, setSelB] = useState("+i");
  const result = op(selA, selB);
  const resElem = getElem(result);
  const aElem = getElem(selA);
  const bElem = getElem(selB);
  return jsxs("div", { className: "upl-card upl-card--center", children: [
    jsx("div", { className: "upl-card-title", children: title }),
    jsx("div", { className: "upl-picker-pair", children: [["A", selA, setSelA], ["B", selB, setSelB]].map(([lbl, val, setter]) => jsxs("div", { className: "upl-picker upl-picker--tight", children: [
      jsx("span", { className: "upl-picker-label upl-picker-label--sm", children: lbl }),
      jsx("div", { className: "upl-btn-row upl-btn-row--tight", children: L4.map((e) => jsx("button", { onClick: () => setter(e.id), className: "upl-val-btn upl-val-btn--sm", style: {
        background: val === e.id ? e.color : "#11112a",
        color: val === e.id ? "#000" : e.color,
        border: `1px solid ${e.color}`
      }, children: e.label }, e.id)) })
    ] }, lbl)) }),
    jsxs("svg", { width: 260, height: 260, viewBox: "0 0 260 260", children: [
      jsx(DiagramGrid, {}),
      jsx("text", { x: CX + R + 8, y: CY + 4, className: "upl-axis-text", children: "+1" }),
      jsx("text", { x: CX + 4, y: CY - R - 8, className: "upl-axis-text", children: "+i" }),
      jsx("text", { x: CX - R - 28, y: CY + 4, className: "upl-axis-text", children: "−1" }),
      jsx("text", { x: CX - 18, y: CY + R + 16, className: "upl-axis-text", children: "−i" }),
      L4.map((e) => {
        const { x, y } = polarToXY(e.phase);
        return jsx("circle", { cx: x, cy: y, r: 7, fill: "#11112a", stroke: e.color, strokeWidth: 1, opacity: 0.4 }, e.id);
      }),
      jsx(Arrow, { from: aElem, to: resElem, color: "#00E5FF", curved: selA !== result }),
      selB !== selA && jsx(Arrow, { from: bElem, to: resElem, color: "#FF4081", curved: true, dashed: true }),
      jsx(NodeDot, { elem: aElem, size: 9 }),
      selB !== selA && jsx(NodeDot, { elem: bElem, size: 9 }),
      jsx(NodeDot, { elem: resElem, size: 11, pulse: true }),
      jsx(ElemLabels, {})
    ] }),
    jsxs("div", { className: "upl-result", children: [
      jsx("span", { style: { color: aElem.color }, children: selA }),
      jsxs("span", { className: "upl-dim", children: [" ", opLabel, " "] }),
      jsx("span", { style: { color: bElem.color }, children: selB }),
      jsx("span", { className: "upl-dim", children: " = " }),
      jsx("span", { style: { color: resElem.color, fontWeight: "bold" }, children: result }),
      jsxs("span", { className: "upl-dim", children: [" [", resElem.iLabel, "]"] })
    ] }),
    note && jsx("div", { className: "upl-note", children: note })
  ] });
}
function TautologyRow({ label, fn, expected }) {
  const results = L4.map((a) => {
    const r = fn(a.id);
    const re = getElem(r);
    return { a, r, re, ok: re.iLabel === expected };
  });
  const allOk = results.every((r) => r.ok);
  return jsxs("div", { className: "upl-law-row", children: [
    jsx("div", { className: "upl-law-label", children: label }),
    jsx("div", { className: "upl-chips", children: results.map(({ a, r, ok }) => jsxs("div", { className: `upl-chip ${ok ? "ok" : "ng"}`, children: [a.label, "→", r] }, a.id)) }),
    jsx("div", { className: `upl-law-status ${allOk ? "ok" : "ng"}`, children: allOk ? "✓ 恒成立" : "✗" })
  ] });
}
function LawRow({ label, fn, expect }) {
  const results = L4.map((a) => {
    const r = fn(a.id);
    return { a, r, ok: r === expect(a.id) };
  });
  const allOk = results.every((r) => r.ok);
  return jsxs("div", { className: "upl-law-row", children: [
    jsx("div", { className: "upl-law-label", children: label }),
    jsx("div", { className: "upl-chips", children: results.map(({ a, r, ok }) => jsxs("div", { className: `upl-chip ${ok ? "ok" : "ng"}`, children: [a.label, "→", r] }, a.id)) }),
    jsx("div", { className: `upl-law-status ${allOk ? "ok" : "ng"}`, children: allOk ? "✓ 恒成立" : "✗" })
  ] });
}
function BinaryLawTable({ label, lhs, rhs }) {
  const results = L4.map((a) => L4.map((b) => {
    const l = lhs(a.id, b.id);
    const r = rhs(a.id, b.id);
    return { l, r, ok: l === r };
  }));
  const allOk = results.every((row) => row.every((c) => c.ok));
  return jsxs("div", { className: "upl-law-table-block", children: [
    jsxs("div", { className: "upl-law-table-caption", children: [
      jsx("span", { children: label }),
      jsx("span", { className: `upl-status ${allOk ? "ok" : "ng"}`, children: allOk ? "✓ 恒成立" : "✗" })
    ] }),
    jsxs("table", { className: "upl-table upl-law-table", children: [
      jsx("thead", { children: jsxs("tr", { children: [
        jsx("th", { className: "upl-corner upl-row-head", children: "A \\ B" }),
        L4.map((e) => jsx("th", { style: { color: e.color }, children: e.label }, e.id))
      ] }) }),
      jsx("tbody", { children: L4.map((a, i) => jsxs("tr", { children: [
        jsx("td", { className: "upl-row-head", style: { color: a.color }, children: a.label }),
        L4.map((b, j) => {
          const { l, r, ok } = results[i][j];
          return jsx("td", { className: ok ? "ok" : "ng", children: ok ? `${l} ✓` : `${l}≠${r}` }, b.id);
        })
      ] }, a.id)) })
    ] })
  ] });
}
const CALC_OPS = [
  { id: "neg", sym: "¬", arity: 1, fn: neg, label: "¬A = iA⁻¹", color: "#B388FF" },
  { id: "conj", sym: "∧", arity: 2, fn: conj, label: "A∧B = AB", color: "#00E5FF" },
  { id: "disj", sym: "∨", arity: 2, fn: disj, label: "A∨B = −iAB", color: "#FF4081" },
  { id: "impl", sym: "⇒", arity: 2, fn: impl, label: "A⇒B = BA⁻¹", color: "#FFD740" }
];
function ValuePicker({ label, value, onChange }) {
  return jsxs("div", { className: "upl-picker", children: [
    jsx("span", { className: "upl-picker-label", children: label }),
    jsx("div", { className: "upl-btn-row", children: L4.map((e) => jsxs("button", { onClick: () => onChange(e.id), className: "upl-val-btn", style: {
      background: value === e.id ? e.color : "#11112a",
      color: value === e.id ? "#000" : e.color,
      border: `1px solid ${e.color}`
    }, children: [
      jsx("div", { children: e.label }),
      jsx("div", { className: "upl-val-btn-sub", children: e.iLabel })
    ] }, e.id)) })
  ] });
}
function Calculator() {
  const [selA, setSelA] = useState("+1");
  const [opId, setOpId] = useState("conj");
  const [selB, setSelB] = useState("+i");
  const op = CALC_OPS.find((o) => o.id === opId);
  const result = op.arity === 1 ? op.fn(selA) : op.fn(selA, selB);
  const aElem = getElem(selA);
  const bElem = getElem(selB);
  const resElem = getElem(result);
  return jsxs("div", { className: "upl-card upl-card--calc", children: [
    jsx("div", { className: "upl-card-title", children: "論理演算電卓" }),
    jsxs("div", { className: "upl-picker-group", children: [
      jsx(ValuePicker, { label: "A", value: selA, onChange: setSelA }),
      jsxs("div", { className: "upl-picker", children: [
        jsx("span", { className: "upl-picker-label", children: "演算子" }),
        jsx("div", { className: "upl-btn-row", children: CALC_OPS.map((o) => jsx("button", { onClick: () => setOpId(o.id), title: o.label, className: "upl-val-btn upl-val-btn--op", style: {
          background: opId === o.id ? o.color : "#11112a",
          color: opId === o.id ? "#000" : o.color,
          border: `1px solid ${o.color}`
        }, children: o.sym }, o.id)) })
      ] }),
      op.arity === 2 && jsx(ValuePicker, { label: "B", value: selB, onChange: setSelB })
    ] }),
    jsxs("svg", { width: 260, height: 260, viewBox: "0 0 260 260", children: [
      jsx(DiagramGrid, {}),
      L4.map((e) => {
        const { x, y } = polarToXY(e.phase);
        return jsx("circle", { cx: x, cy: y, r: 7, fill: "#11112a", stroke: e.color, strokeWidth: 1, opacity: 0.4 }, e.id);
      }),
      jsx(Arrow, { from: aElem, to: resElem, color: "#00E5FF", curved: selA !== result }),
      op.arity === 2 && selB !== selA && jsx(Arrow, { from: bElem, to: resElem, color: "#FF4081", curved: true, dashed: true }),
      jsx(NodeDot, { elem: aElem, size: 9 }),
      op.arity === 2 && selB !== selA && jsx(NodeDot, { elem: bElem, size: 9 }),
      jsx(NodeDot, { elem: resElem, size: 11, pulse: true }),
      jsx(ElemLabels, {})
    ] }),
    jsxs("div", { className: "upl-result upl-result--lg", children: [
      op.arity === 1 ? jsxs(Fragment, { children: [
        jsx("span", { className: "upl-dim", children: op.sym }),
        jsx("span", { style: { color: aElem.color }, children: selA })
      ] }) : jsxs(Fragment, { children: [
        jsx("span", { style: { color: aElem.color }, children: selA }),
        jsxs("span", { className: "upl-dim", children: [" ", op.sym, " "] }),
        jsx("span", { style: { color: bElem.color }, children: selB })
      ] }),
      jsx("span", { className: "upl-dim", children: " = " }),
      jsx("span", { style: { color: resElem.color, fontWeight: "bold" }, children: result }),
      jsxs("span", { className: "upl-dim upl-result-sub", children: [" [", resElem.iLabel, "]"] })
    ] }),
    jsx("div", { className: "upl-note", children: op.label })
  ] });
}
function TruthTable({ opSym, opFn, classical }) {
  return jsxs("div", { className: "upl-card", children: [
    jsx("div", { className: "upl-card-title upl-card-title--mb12", children: "L₄ 全真理表" }),
    jsxs("table", { className: "upl-table", children: [
      jsx("thead", { children: jsxs("tr", { children: [
        jsx("th", { className: "upl-corner", children: opSym }),
        L4.map((e) => jsx("th", { style: { color: e.color }, children: e.label }, e.id))
      ] }) }),
      jsx("tbody", { children: L4.map((a) => jsxs("tr", { children: [
        jsx("td", { className: "upl-row-head", style: { color: a.color }, children: a.label }),
        L4.map((b) => {
          const r = opFn(a.id, b.id);
          const re = getElem(r);
          const classicalR = classical(a, b);
          const cellColor = re.iLabel !== classicalR ? "#B388FF" : re.color;
          return jsx("td", { style: { color: cellColor }, children: r }, b.id);
        })
      ] }, a.id)) })
    ] })
  ] });
}
const TABS = [
  { id: "calc", label: "電卓" },
  { id: "neg", label: "否定 ¬" },
  { id: "conj", label: "連言 ∧" },
  { id: "disj", label: "選言 ∨" },
  { id: "impl", label: "含意 ⇒" },
  { id: "laws", label: "諸法則" }
];
function App() {
  const [tab, setTab] = useState("calc");
  return jsx("div", { className: "upl-app", children: jsxs("div", { className: "upl-container", children: [
    jsxs("div", { className: "upl-header", children: [
      jsx("div", { className: "upl-eyebrow", children: "U(1) MULTI-VALUED LOGIC" }),
      jsx("h1", { className: "upl-title", children: "L₄ = {+1, −1, +i, −i} 位相図解" }),
      jsx("div", { className: "upl-legend", children: [{ c: "#00E5FF", l: "T (±1)" }, { c: "#FF4081", l: "F (±i)" }].map(({ c, l }) => jsxs("div", { className: "upl-legend-item", children: [
        jsx("div", { className: "upl-legend-dot", style: { background: c, boxShadow: `0 0 6px ${c}` } }),
        jsx("span", { className: "upl-legend-label", children: l })
      ] }, l)) })
    ] }),
    jsx("div", { className: "upl-tabs", children: TABS.map((t) => jsx("button", { onClick: () => setTab(t.id), className: `upl-tab ${tab === t.id ? "active" : ""}`, children: t.label }, t.id)) }),
    jsxs("div", { className: "upl-content", children: [
      tab === "calc" && jsx(Calculator, {}),
      tab === "neg" && jsxs(Fragment, { children: [
        jsx(NegDiagram, {}),
        jsxs("div", { className: "upl-card upl-card--column", children: [
          jsx("div", { className: "upl-card-title", children: "真理表" }),
          jsxs("table", { className: "upl-table upl-table--md", children: [
            jsx("thead", { children: jsx("tr", { children: ["A", "I(A)", "¬A", "I(¬A)"].map((h) => jsx("th", { className: "upl-corner", children: h }, h)) }) }),
            jsx("tbody", { children: L4.map((a) => {
              const na = neg(a.id);
              const ne = getElem(na);
              return jsxs("tr", { children: [
                jsx("td", { style: { color: a.color }, children: a.label }),
                jsx("td", { style: { color: a.iLabel === "T" ? "#00E5FF" : "#FF4081" }, children: a.iLabel }),
                jsx("td", { style: { color: ne.color }, children: na }),
                jsx("td", { style: { color: ne.iLabel === "T" ? "#00E5FF" : "#FF4081" }, children: ne.iLabel })
              ] }, a.id);
            }) })
          ] }),
          jsx("div", { className: "upl-note upl-note--left", children: "¬¬A = A（値レベル・対合）" })
        ] })
      ] }),
      tab === "conj" && jsxs(Fragment, { children: [
        jsx(BinaryDiagram, { op: conj, opLabel: "∧", title: "連言 A∧B = AB", note: "位相の和 = 複素乗法" }),
        jsx(TruthTable, { opSym: "∧", opFn: conj, classical: (a, b) => a.iLabel === "T" && b.iLabel === "T" ? "T" : "F" })
      ] }),
      tab === "disj" && jsxs(Fragment, { children: [
        jsx(BinaryDiagram, { op: disj, opLabel: "∨", title: "選言 A∨B = −iAB", note: "ド・モルガン定義" }),
        jsx(TruthTable, { opSym: "∨", opFn: disj, classical: (a, b) => a.iLabel === "T" || b.iLabel === "T" ? "T" : "F" })
      ] }),
      tab === "impl" && jsxs(Fragment, { children: [
        jsx(BinaryDiagram, { op: impl, opLabel: "⇒", title: "含意 A⇒B = BA⁻¹", note: "論理商 = 位相差" }),
        jsx(TruthTable, { opSym: "⇒", opFn: impl, classical: (a, b) => a.iLabel === "T" && b.iLabel === "F" ? "F" : "T" })
      ] }),
      tab === "laws" && jsxs("div", { className: "upl-card upl-card--laws", children: [
        jsx("div", { className: "upl-card-title upl-card-title--mb20", children: "諸法則の検証" }),
        jsx(TautologyRow, { label: "排中律 A∨¬A", fn: (a) => disj(a, neg(a)), expected: "T" }),
        jsx(TautologyRow, { label: "矛盾律 A∧¬A", fn: (a) => conj(a, neg(a)), expected: "F" }),
        jsx(TautologyRow, { label: "二重否定 ¬¬A = A", fn: (a) => {
          const r = neg(neg(a));
          return r === a ? "+1" : "+i";
        }, expected: "T" }),
        jsx(LawRow, { label: "含意の反射律 A⇒A = T", fn: (a) => impl(a, a), expect: () => "+1" }),
        jsx(LawRow, { label: "背理法 ¬A⇒⊥ = A", fn: (a) => impl(neg(a), "+i"), expect: (a) => a }),
        jsx(LawRow, { label: "爆発抑制 ⊥⇒B = −iB", fn: (b) => impl("+i", b), expect: (b) => conj("-i", b) }),
        jsx(BinaryLawTable, { label: "ド・モルガン第一法則　¬(A∧B) = ¬A∨¬B", lhs: (a, b) => neg(conj(a, b)), rhs: (a, b) => disj(neg(a), neg(b)) }),
        jsx(BinaryLawTable, { label: "ド・モルガン第二法則　¬(A∨B) = ¬A∧¬B", lhs: (a, b) => neg(disj(a, b)), rhs: (a, b) => conj(neg(a), neg(b)) }),
        jsx(BinaryLawTable, { label: "対偶律　(A⇒B) = (¬B⇒¬A)", lhs: (a, b) => impl(a, b), rhs: (a, b) => impl(neg(b), neg(a)) }),
        jsx(BinaryLawTable, { label: "モーダスポネンス　A∧(A⇒B) = B", lhs: (a, b) => conj(a, impl(a, b)), rhs: (a, b) => b }),
        jsx(BinaryLawTable, { label: "モーダストレンス　¬B∧(A⇒B) = ¬A", lhs: (a, b) => conj(neg(b), impl(a, b)), rhs: (a, b) => neg(a) }),
        jsx(BinaryLawTable, { label: "普遍的双条件　(A⇒B)∧(B⇒A) = T", lhs: (a, b) => conj(impl(a, b), impl(b, a)), rhs: () => "+1" })
      ] })
    ] })
  ] }) });
}
export {
  App as default
};
