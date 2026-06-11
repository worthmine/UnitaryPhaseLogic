const TAU = 2 * Math.PI;

export const L4 = [
  { id: "+1", phase: 0, label: "+1", iLabel: "T", color: "#00E5FF" },
  { id: "+i", phase: Math.PI / 2, label: "+i", iLabel: "F", color: "#FF4081" },
  { id: "-1", phase: Math.PI, label: "−1", iLabel: "T", color: "#00E5FF" },
  { id: "-i", phase: (3 * Math.PI) / 2, label: "−i", iLabel: "F", color: "#FF4081" },
];

export function getElem(id) {
  const elem = L4.find((e) => e.id === id);
  if (!elem) {
    throw new Error(`Unknown L4 id: ${id}`);
  }
  return elem;
}

export function phaseToId(ph) {
  const p = ((ph % TAU) + TAU) % TAU;
  if (Math.abs(p - 0) < 0.001 || Math.abs(p - TAU) < 0.001) return "+1";
  if (Math.abs(p - Math.PI / 2) < 0.001) return "+i";
  if (Math.abs(p - Math.PI) < 0.001) return "-1";
  if (Math.abs(p - (3 * Math.PI) / 2) < 0.001) return "-i";
  return null;
}

export function neg(id) {
  const a = getElem(id);
  const ph = ((Math.PI / 2 - a.phase) % TAU + TAU) % TAU;
  return phaseToId(ph);
}

export function conj(idA, idB) {
  const a = getElem(idA);
  const b = getElem(idB);
  return phaseToId(a.phase + b.phase);
}

export function disj(idA, idB) {
  const a = getElem(idA);
  const b = getElem(idB);
  return phaseToId(a.phase + b.phase - Math.PI / 2);
}

export function impl(idA, idB) {
  const a = getElem(idA);
  const b = getElem(idB);
  return phaseToId(b.phase - a.phase);
}
