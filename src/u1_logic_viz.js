// アプリ本体：タブ切替と各パネルの組み立て
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { conj, disj, impl } from "./u1_logic_core";
import { LANGS, LangContext, REPO_URL, detectLang, useT } from "./i18n";
import { Calculator } from "./components/Calculator";
import { BinaryOpTab, NegDiagram, NegTruthTable } from "./components/operators";
import { LawsPanel } from "./components/laws";
import "./u1_logic_viz.css";

const TAB_IDS = ["calc", "neg", "conj", "disj", "impl", "laws"];
const TAB_LABEL_KEYS = {
  calc: "tabCalc",
  neg: "tabNeg",
  conj: "tabConj",
  disj: "tabDisj",
  impl: "tabImpl",
  laws: "tabLaws"
};

function LangToggle({ lang, onChange }) {
  return jsx("div", { className: "upl-lang-toggle", children: LANGS.map((l) => jsx("button", {
    onClick: () => onChange(l),
    className: `upl-lang-btn ${lang === l ? "active" : ""}`,
    children: l.toUpperCase()
  }, l)) });
}

function Footer() {
  const t = useT();
  return jsx("footer", { className: "upl-footer", children: jsx("a", {
    href: REPO_URL,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "upl-footer-link",
    children: t("footerRepo")
  }) });
}

function Main({ lang, setLang }) {
  const [tab, setTab] = useState("calc");
  const t = useT();
  return jsx("div", { className: "upl-app", children: jsxs("div", { className: "upl-container", children: [
    jsxs("div", { className: "upl-header", children: [
      jsxs("div", { className: "upl-header-top", children: [
        jsx("div", { className: "upl-eyebrow", children: "U(1) MULTI-VALUED LOGIC" }),
        jsx(LangToggle, { lang, onChange: setLang })
      ] }),
      jsx("h1", { className: "upl-title", children: t("title") }),
      jsx("div", { className: "upl-legend", children: [{ c: "#00E5FF", l: "T (±1)" }, { c: "#FF4081", l: "F (±i)" }].map(({ c, l }) => jsxs("div", { className: "upl-legend-item", children: [
        jsx("div", { className: "upl-legend-dot", style: { background: c, boxShadow: `0 0 6px ${c}` } }),
        jsx("span", { className: "upl-legend-label", children: l })
      ] }, l)) })
    ] }),
    jsx("div", { className: "upl-tabs", children: TAB_IDS.map((id) => jsx("button", { onClick: () => setTab(id), className: `upl-tab ${tab === id ? "active" : ""}`, children: t(TAB_LABEL_KEYS[id]) }, id)) }),
    jsxs("div", { className: "upl-content", children: [
      tab === "calc" && jsx(Calculator, {}),
      tab === "neg" && jsxs(Fragment, { children: [
        jsx(NegDiagram, {}),
        jsx(NegTruthTable, {})
      ] }),
      tab === "conj" && jsx(BinaryOpTab, { op: conj, opLabel: "∧", title: t("conjTitle"), note: t("conjNote"), classicalFn: (a, b) => a.iLabel === "T" && b.iLabel === "T" ? "T" : "F" }),
      tab === "disj" && jsx(BinaryOpTab, { op: disj, opLabel: "∨", title: t("disjTitle"), note: t("disjNote"), classicalFn: (a, b) => a.iLabel === "T" || b.iLabel === "T" ? "T" : "F" }),
      tab === "impl" && jsx(BinaryOpTab, { op: impl, opLabel: "⇒", title: t("implTitle"), note: t("implNote"), classicalFn: (a, b) => a.iLabel === "T" && b.iLabel === "F" ? "F" : "T" }),
      tab === "laws" && jsx(LawsPanel, {})
    ] }),
    jsx(Footer, {})
  ] }) });
}

function App() {
  const [lang, setLang] = useState(detectLang);
  return jsx(LangContext.Provider, { value: lang, children: jsx(Main, { lang, setLang }) });
}

export {
  App as default
};
