// UI 文言の日英対訳と言語コンテキスト
import { createContext, useContext } from "react";

export const REPO_URL = "https://github.com/worthmine/UnitaryPhaseLogic";

export const LANGS = ["ja", "en"];

export const MESSAGES = {
  ja: {
    title: "L₄ = {+1, −1, +i, −i} 位相図解",
    tabCalc: "電卓",
    tabNeg: "否定 ¬",
    tabConj: "連言 ∧",
    tabDisj: "選言 ∨",
    tabImpl: "含意 ⇒",
    tabLaws: "諸法則",
    conjTitle: "連言 A∧B = AB",
    conjNote: "位相の和 = 複素乗法",
    disjTitle: "選言 A∨B = −iAB",
    disjNote: "ド・モルガン定義",
    implTitle: "含意 A⇒B = BA⁻¹",
    implNote: "論理商 = 位相差",
    calcTitle: "論理演算電卓",
    operator: "演算子",
    negNote: "¬¬A = A（値レベル対合）　θ(¬A) = π/2 − θ(A)",
    truthTable: "真理表",
    negInvolution: "¬¬A = A（値レベル・対合）",
    fullTruthTable: "L₄ 全真理表",
    lawsTitle: "諸法則の検証",
    alwaysHolds: "✓ 恒成立",
    lawExcludedMiddle: "排中律 A∨¬A",
    lawContradiction: "矛盾律 A∧¬A",
    lawDoubleNeg: "二重否定 ¬¬A = A",
    lawReflexivity: "含意の反射律 A⇒A = T",
    lawReductio: "背理法 ¬A⇒⊥ = A",
    lawExplosion: "爆発抑制 ⊥⇒B = −iB",
    lawDeMorgan1: "ド・モルガン第一法則　¬(A∧B) = ¬A∨¬B",
    lawDeMorgan2: "ド・モルガン第二法則　¬(A∨B) = ¬A∧¬B",
    lawContraposition: "対偶律　(A⇒B) = (¬B⇒¬A)",
    lawModusPonens: "モーダスポネンス　A∧(A⇒B) = B",
    lawModusTollens: "モーダストレンス　¬B∧(A⇒B) = ¬A",
    lawBiconditional: "普遍的双条件　(A⇒B)∧(B⇒A) = T",
    footerRepo: "GitHub リポジトリ"
  },
  en: {
    title: "L₄ = {+1, −1, +i, −i} Phase Diagrams",
    tabCalc: "Calculator",
    tabNeg: "Negation ¬",
    tabConj: "Conjunction ∧",
    tabDisj: "Disjunction ∨",
    tabImpl: "Implication ⇒",
    tabLaws: "Laws",
    conjTitle: "Conjunction A∧B = AB",
    conjNote: "Phase sum = complex multiplication",
    disjTitle: "Disjunction A∨B = −iAB",
    disjNote: "De Morgan definition",
    implTitle: "Implication A⇒B = BA⁻¹",
    implNote: "Logical quotient = phase difference",
    calcTitle: "Logic Calculator",
    operator: "Operator",
    negNote: "¬¬A = A (value-level involution)　θ(¬A) = π/2 − θ(A)",
    truthTable: "Truth Table",
    negInvolution: "¬¬A = A (value-level involution)",
    fullTruthTable: "Full L₄ Truth Table",
    lawsTitle: "Verification of Logical Laws",
    alwaysHolds: "✓ Always holds",
    lawExcludedMiddle: "Excluded Middle A∨¬A",
    lawContradiction: "Non-Contradiction A∧¬A",
    lawDoubleNeg: "Double Negation ¬¬A = A",
    lawReflexivity: "Reflexivity of Implication A⇒A = T",
    lawReductio: "Reductio ad Absurdum ¬A⇒⊥ = A",
    lawExplosion: "Explosion Suppression ⊥⇒B = −iB",
    lawDeMorgan1: "De Morgan's First Law　¬(A∧B) = ¬A∨¬B",
    lawDeMorgan2: "De Morgan's Second Law　¬(A∨B) = ¬A∧¬B",
    lawContraposition: "Contraposition　(A⇒B) = (¬B⇒¬A)",
    lawModusPonens: "Modus Ponens　A∧(A⇒B) = B",
    lawModusTollens: "Modus Tollens　¬B∧(A⇒B) = ¬A",
    lawBiconditional: "Universal Biconditional　(A⇒B)∧(B⇒A) = T",
    footerRepo: "GitHub Repository"
  }
};

export function detectLang() {
  if (typeof navigator !== "undefined" && !navigator.language?.startsWith("ja")) return "en";
  return "ja";
}

export const LangContext = createContext("ja");

export function useT() {
  const lang = useContext(LangContext);
  return (key) => MESSAGES[lang]?.[key] ?? MESSAGES.ja[key] ?? key;
}
