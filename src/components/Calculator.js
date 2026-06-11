// 論理演算電卓タブ
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { L4, conj, disj, getElem, impl, neg } from "../u1_logic_core";
import { OpDiagramSvg, valButtonStyle } from "./diagram";

export const CALC_OPS = [
  { id: "neg", sym: "¬", arity: 1, fn: neg, label: "¬A = iA⁻¹", color: "#B388FF" },
  { id: "conj", sym: "∧", arity: 2, fn: conj, label: "A∧B = AB", color: "#00E5FF" },
  { id: "disj", sym: "∨", arity: 2, fn: disj, label: "A∨B = −iAB", color: "#FF4081" },
  { id: "impl", sym: "⇒", arity: 2, fn: impl, label: "A⇒B = BA⁻¹", color: "#FFD740" }
];

function ValuePicker({ label, value, onChange }) {
  return jsxs("div", { className: "upl-picker", children: [
    jsx("span", { className: "upl-picker-label", children: label }),
    jsx("div", { className: "upl-btn-row", children: L4.map((e) => jsxs("button", { onClick: () => onChange(e.id), className: "upl-val-btn", style: valButtonStyle(value === e.id, e.color), children: [
      jsx("div", { children: e.label }),
      jsx("div", { className: "upl-val-btn-sub", children: e.iLabel })
    ] }, e.id)) })
  ] });
}

export function Calculator() {
  const [selA, setSelA] = useState("+1");
  const [opId, setOpId] = useState("conj");
  const [selB, setSelB] = useState("+i");
  const op = CALC_OPS.find((o) => o.id === opId);
  const result = op.arity === 1 ? op.fn(selA) : op.fn(selA, selB);
  const aElem = getElem(selA);
  const bElem = getElem(selB);
  const resElem = getElem(result);
  const showB = op.arity === 2 && selB !== selA;
  return jsxs("div", { className: "upl-card upl-card--calc", children: [
    jsx("div", { className: "upl-card-title", children: "論理演算電卓" }),
    jsxs("div", { className: "upl-picker-group", children: [
      jsx(ValuePicker, { label: "A", value: selA, onChange: setSelA }),
      jsxs("div", { className: "upl-picker", children: [
        jsx("span", { className: "upl-picker-label", children: "演算子" }),
        jsx("div", { className: "upl-btn-row", children: CALC_OPS.map((o) => jsx("button", { onClick: () => setOpId(o.id), title: o.label, className: "upl-val-btn upl-val-btn--op", style: valButtonStyle(opId === o.id, o.color), children: o.sym }, o.id)) })
      ] }),
      op.arity === 2 && jsx(ValuePicker, { label: "B", value: selB, onChange: setSelB })
    ] }),
    jsx(OpDiagramSvg, { aElem, bElem, resElem, showB }),
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
