// 位相円ダイアグラムの共有 SVG プリミティブ
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { L4 } from "../u1_logic_core";

export const R = 90;
export const CX = 130, CY = 130;

export function polarToXY(phase, r = R) {
  return {
    x: CX + r * Math.cos(phase), // 実軸 → 右
    y: CY - r * Math.sin(phase) // 虚軸 → 上（SVG y軸反転補正）
  };
}

export function valButtonStyle(selected, color) {
  return {
    background: selected ? color : "#11112a",
    color: selected ? "#000" : color,
    border: `1px solid ${color}`
  };
}

export function NodeDot({ elem, size = 10, opacity = 1, pulse = false }) {
  const { x, y } = polarToXY(elem.phase);
  return jsxs("g", { children: [
    pulse && jsxs("circle", { cx: x, cy: y, r: size + 6, fill: elem.color, opacity: 0.2, children: [
      jsx("animate", { attributeName: "r", values: `${size + 4};${size + 12};${size + 4}`, dur: "1.5s", repeatCount: "indefinite" }),
      jsx("animate", { attributeName: "opacity", values: "0.3;0;0.3", dur: "1.5s", repeatCount: "indefinite" })
    ] }),
    jsx("circle", { cx: x, cy: y, r: size, fill: elem.color, opacity, style: { filter: `drop-shadow(0 0 6px ${elem.color})` } })
  ] });
}

export function Arrow({ from, to, color, dashed = false, curved = false }) {
  const f = polarToXY(from.phase);
  const t = polarToXY(to.phase);
  const id = useId();
  const d = curved
    ? `M ${f.x} ${f.y} Q ${CX} ${CY} ${t.x} ${t.y}`
    : `M ${f.x} ${f.y} L ${t.x} ${t.y}`;
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

export function DiagramGrid() {
  return jsxs(Fragment, { children: [
    jsx("line", { x1: CX, y1: 10, x2: CX, y2: 250, className: "upl-grid-line" }),
    jsx("line", { x1: 10, y1: CY, x2: 250, y2: CY, className: "upl-grid-line" }),
    jsx("circle", { cx: CX, cy: CY, r: R, className: "upl-grid-circle" })
  ] });
}

export function ElemLabels() {
  return L4.map((e) => {
    const { x, y } = polarToXY(e.phase, R + 20);
    return jsx("text", { x, y, fill: e.color, className: "upl-elem-text", children: e.label }, e.id);
  });
}

export function GhostDots() {
  return L4.map((e) => {
    const { x, y } = polarToXY(e.phase);
    return jsx("circle", { cx: x, cy: y, r: 7, fill: "#11112a", stroke: e.color, strokeWidth: 1, opacity: 0.4 }, e.id);
  });
}

export function AxisLabels({ withTruth = false }) {
  return jsxs(Fragment, { children: [
    jsx("text", { x: CX + R + 8, y: CY + 4, className: "upl-axis-text", children: withTruth ? "+1 (T)" : "+1" }),
    jsx("text", { x: CX + 4, y: CY - R - 8, className: "upl-axis-text", children: withTruth ? "+i (F)" : "+i" }),
    jsx("text", { x: CX - R - (withTruth ? 48 : 28), y: CY + 4, className: "upl-axis-text", children: withTruth ? "−1 (T)" : "−1" }),
    jsx("text", { x: CX - 18, y: CY + R + 16, className: "upl-axis-text", children: withTruth ? "−i (F)" : "−i" })
  ] });
}

export function CircleDiagram({ title, children, note }) {
  return jsxs("div", { className: "upl-card upl-card--center", children: [
    jsx("div", { className: "upl-card-title", children: title }),
    jsxs("svg", { width: 260, height: 260, viewBox: "0 0 260 260", children: [
      jsx(DiagramGrid, {}),
      jsx(AxisLabels, { withTruth: true }),
      children
    ] }),
    note && jsx("div", { className: "upl-note", children: note })
  ] });
}

// A → 結果（B は任意）の演算結果を描く共有 SVG 本体
export function OpDiagramSvg({ aElem, bElem, resElem, showB, axisLabels = false }) {
  return jsxs("svg", { width: 260, height: 260, viewBox: "0 0 260 260", children: [
    jsx(DiagramGrid, {}),
    axisLabels && jsx(AxisLabels, {}),
    jsx(GhostDots, {}),
    jsx(Arrow, { from: aElem, to: resElem, color: "#00E5FF", curved: aElem.id !== resElem.id }),
    showB && jsx(Arrow, { from: bElem, to: resElem, color: "#FF4081", curved: true, dashed: true }),
    jsx(NodeDot, { elem: aElem, size: 9 }),
    showB && jsx(NodeDot, { elem: bElem, size: 9 }),
    jsx(NodeDot, { elem: resElem, size: 11, pulse: true }),
    jsx(ElemLabels, {})
  ] });
}
