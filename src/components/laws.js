// 諸法則タブ（恒真式・法則・二項法則の検証表示）
import { jsx, jsxs } from "react/jsx-runtime";
import { L4, conj, disj, getElem, impl, neg } from "../u1_logic_core";
import { useT } from "../i18n";

function LawRowBase({ label, results }) {
  const t = useT();
  const allOk = results.every((r) => r.ok);
  return jsxs("div", { className: "upl-law-row", children: [
    jsx("div", { className: "upl-law-label", children: label }),
    jsx("div", { className: "upl-chips", children: results.map(({ a, r, ok }) => jsxs("div", { className: `upl-chip ${ok ? "ok" : "ng"}`, children: [a.label, "→", r] }, a.id)) }),
    jsx("div", { className: `upl-law-status ${allOk ? "ok" : "ng"}`, children: allOk ? t("alwaysHolds") : "✗" })
  ] });
}

function TautologyRow({ label, fn, expected }) {
  const results = L4.map((a) => {
    const r = fn(a.id);
    return { a, r, ok: getElem(r).iLabel === expected };
  });
  return jsx(LawRowBase, { label, results });
}

function LawRow({ label, fn, expectFn }) {
  const results = L4.map((a) => {
    const r = fn(a.id);
    return { a, r, ok: r === expectFn(a.id) };
  });
  return jsx(LawRowBase, { label, results });
}

function BinaryLawTable({ label, lhs, rhs }) {
  const t = useT();
  const results = L4.map((a) => L4.map((b) => {
    const l = lhs(a.id, b.id);
    const r = rhs(a.id, b.id);
    return { l, r, ok: l === r };
  }));
  const allOk = results.every((row) => row.every((c) => c.ok));
  return jsxs("div", { className: "upl-law-table-block", children: [
    jsxs("div", { className: "upl-law-table-caption", children: [
      jsx("span", { children: label }),
      jsx("span", { className: `upl-status ${allOk ? "ok" : "ng"}`, children: allOk ? t("alwaysHolds") : "✗" })
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

export function LawsPanel() {
  const t = useT();
  return jsxs("div", { className: "upl-card upl-card--laws", children: [
    jsx("div", { className: "upl-card-title upl-card-title--mb20", children: t("lawsTitle") }),
    jsx(TautologyRow, { label: t("lawExcludedMiddle"), fn: (a) => disj(a, neg(a)), expected: "T" }),
    jsx(TautologyRow, { label: t("lawContradiction"), fn: (a) => conj(a, neg(a)), expected: "F" }),
    jsx(TautologyRow, { label: t("lawDoubleNeg"), fn: (a) => {
      const r = neg(neg(a));
      return r === a ? "+1" : "+i";
    }, expected: "T" }),
    jsx(LawRow, { label: t("lawReflexivity"), fn: (a) => impl(a, a), expectFn: () => "+1" }),
    jsx(LawRow, { label: t("lawReductio"), fn: (a) => impl(neg(a), "+i"), expectFn: (a) => a }),
    jsx(LawRow, { label: t("lawExplosion"), fn: (b) => impl("+i", b), expectFn: (b) => conj("-i", b) }),
    jsx(BinaryLawTable, { label: t("lawDeMorgan1"), lhs: (a, b) => neg(conj(a, b)), rhs: (a, b) => disj(neg(a), neg(b)) }),
    jsx(BinaryLawTable, { label: t("lawDeMorgan2"), lhs: (a, b) => neg(disj(a, b)), rhs: (a, b) => conj(neg(a), neg(b)) }),
    jsx(BinaryLawTable, { label: t("lawContraposition"), lhs: (a, b) => impl(a, b), rhs: (a, b) => impl(neg(b), neg(a)) }),
    jsx(BinaryLawTable, { label: t("lawModusPonens"), lhs: (a, b) => conj(a, impl(a, b)), rhs: (a, b) => b }),
    jsx(BinaryLawTable, { label: t("lawModusTollens"), lhs: (a, b) => conj(neg(b), impl(a, b)), rhs: (a, b) => neg(a) }),
    jsx(BinaryLawTable, { label: t("lawBiconditional"), lhs: (a, b) => conj(impl(a, b), impl(b, a)), rhs: () => "+1" })
  ] });
}
