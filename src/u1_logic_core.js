const TAU = 2 * Math.PI;
const HALF_PI = Math.PI / 2;
const PHASE_EPS = 0.001;

export const L4 = [
  { id: "+1", phase: 0, label: "+1", iLabel: "T", color: "#00E5FF" },
  { id: "+i", phase: HALF_PI, label: "+i", iLabel: "F", color: "#FF4081" },
  { id: "-1", phase: Math.PI, label: "−1", iLabel: "T", color: "#00E5FF" },
  { id: "-i", phase: 3 * HALF_PI, label: "−i", iLabel: "F", color: "#FF4081" },
];

const ELEM_BY_ID = new Map(L4.map((e) => [e.id, e]));

export function getElem(id) {
  const elem = ELEM_BY_ID.get(id);
  if (!elem) {
    throw new Error(`Unknown L4 id: ${id}`);
  }
  return elem;
}

export function phaseToId(ph) {
  const p = ((ph % TAU) + TAU) % TAU;
  const k = Math.round(p / HALF_PI);
  if (Math.abs(p - k * HALF_PI) >= PHASE_EPS) return null;
  return L4[k % 4].id;
}

export function neg(id) {
  return phaseToId(HALF_PI - getElem(id).phase);
}

export function conj(idA, idB) {
  return phaseToId(getElem(idA).phase + getElem(idB).phase);
}

export function disj(idA, idB) {
  return phaseToId(getElem(idA).phase + getElem(idB).phase - HALF_PI);
}

export function impl(idA, idB) {
  return phaseToId(getElem(idB).phase - getElem(idA).phase);
}
