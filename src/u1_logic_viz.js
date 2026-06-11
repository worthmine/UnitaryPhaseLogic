// アプリ本体：タブ切替と各パネルの組み立て
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { conj, disj, impl } from "./u1_logic_core";
import { Calculator } from "./components/Calculator";
import { BinaryOpTab, NegDiagram, NegTruthTable } from "./components/operators";
import { LawsPanel } from "./components/laws";
import "./u1_logic_viz.css";

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
        jsx(NegTruthTable, {})
      ] }),
      tab === "conj" && jsx(BinaryOpTab, { op: conj, opLabel: "∧", title: "連言 A∧B = AB", note: "位相の和 = 複素乗法", classicalFn: (a, b) => a.iLabel === "T" && b.iLabel === "T" ? "T" : "F" }),
      tab === "disj" && jsx(BinaryOpTab, { op: disj, opLabel: "∨", title: "選言 A∨B = −iAB", note: "ド・モルガン定義", classicalFn: (a, b) => a.iLabel === "T" || b.iLabel === "T" ? "T" : "F" }),
      tab === "impl" && jsx(BinaryOpTab, { op: impl, opLabel: "⇒", title: "含意 A⇒B = BA⁻¹", note: "論理商 = 位相差", classicalFn: (a, b) => a.iLabel === "T" && b.iLabel === "F" ? "F" : "T" }),
      tab === "laws" && jsx(LawsPanel, {})
    ] })
  ] }) });
}

export {
  App as default
};
