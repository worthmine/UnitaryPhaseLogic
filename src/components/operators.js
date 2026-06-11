// 否定・連言・選言・含意の各演算タブ（位相図 + 真理表）
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { L4, getElem, neg } from "../u1_logic_core";
import { Arrow, CircleDiagram, ElemLabels, NodeDot, OpDiagramSvg, valButtonStyle } from "./diagram";

export function NegDiagram() {
  return jsxs(CircleDiagram, { title: "¬A = iA⁻¹", note: "¬¬A = A（値レベル対合）　θ(¬A) = π/2 − θ(A)", children: [
    L4.map((a) => {
      const nb = getElem(neg(a.id));
      return jsx(Arrow, { from: a, to: nb, color: a.color }, a.id);
    }),
    L4.map((a) => jsx(NodeDot, { elem: a, pulse: true }, a.id)),
    jsx(ElemLabels, {})
  ] });
}

export function NegTruthTable() {
  return jsxs("div", { className: "upl-card upl-card--column", children: [
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
  ] });
}

export function BinaryDiagram({ op, opLabel, title, note }) {
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
      jsx("div", { className: "upl-btn-row upl-btn-row--tight", children: L4.map((e) => jsx("button", { onClick: () => setter(e.id), className: "upl-val-btn upl-val-btn--sm", style: valButtonStyle(val === e.id, e.color), children: e.label }, e.id)) })
    ] }, lbl)) }),
    jsx(OpDiagramSvg, { aElem, bElem, resElem, showB: selB !== selA, axisLabels: true }),
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

export function TruthTable({ opSym, opFn, classicalFn }) {
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
          const classicalR = classicalFn(a, b);
          const cellColor = re.iLabel !== classicalR ? "#B388FF" : re.color;
          return jsx("td", { style: { color: cellColor }, children: r }, b.id);
        })
      ] }, a.id)) })
    ] })
  ] });
}

export function BinaryOpTab({ op, opLabel, title, note, classicalFn }) {
  return jsxs(Fragment, { children: [
    jsx(BinaryDiagram, { op, opLabel, title, note }),
    jsx(TruthTable, { opSym: opLabel, opFn: op, classicalFn })
  ] });
}
