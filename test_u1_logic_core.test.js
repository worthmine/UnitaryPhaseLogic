import { describe, expect, test } from "@jest/globals";

import { conj, disj, getElem, impl, neg, phaseToId, L4 } from "./src/u1_logic_core.js";

const IDS = L4.map((e) => e.id);

describe("L4", () => {
  test("contains the four unit phases", () => {
    expect(IDS).toEqual(["+1", "+i", "-1", "-i"]);
  });
});

describe("getElem", () => {
  test("returns the element for a known id", () => {
    expect(getElem("+i").phase).toBeCloseTo(Math.PI / 2);
  });

  test("throws for an unknown id", () => {
    expect(() => getElem("+2")).toThrow("Unknown L4 id: +2");
  });
});

describe("phaseToId", () => {
  test("maps the four canonical phases to their ids", () => {
    expect(phaseToId(0)).toBe("+1");
    expect(phaseToId(Math.PI / 2)).toBe("+i");
    expect(phaseToId(Math.PI)).toBe("-1");
    expect(phaseToId((3 * Math.PI) / 2)).toBe("-i");
  });

  test("normalizes phases outside [0, 2π)", () => {
    expect(phaseToId(2 * Math.PI)).toBe("+1");
    expect(phaseToId(-Math.PI / 2)).toBe("-i");
    expect(phaseToId(5 * Math.PI)).toBe("-1");
  });

  test("returns null for non-canonical phases", () => {
    expect(phaseToId(Math.PI / 4)).toBeNull();
  });
});

describe("neg", () => {
  test.each([
    ["+1", "+i"],
    ["+i", "+1"],
    ["-1", "-i"],
    ["-i", "-1"],
  ])("neg(%s) = %s", (input, expected) => {
    expect(neg(input)).toBe(expected);
  });

  test("is involutive on L4", () => {
    for (const id of IDS) {
      expect(neg(neg(id))).toBe(id);
    }
  });
});

describe("conj", () => {
  test.each([
    ["+1", "+1", "+1"],
    ["+1", "+i", "+i"],
    ["+1", "-1", "-1"],
    ["+1", "-i", "-i"],
    ["+i", "+i", "-1"],
    ["+i", "-1", "-i"],
    ["+i", "-i", "+1"],
    ["-1", "-1", "+1"],
    ["-1", "-i", "+i"],
    ["-i", "-i", "-1"],
  ])("conj(%s, %s) = %s", (a, b, expected) => {
    expect(conj(a, b)).toBe(expected);
  });

  test("is commutative", () => {
    for (const a of IDS) {
      for (const b of IDS) {
        expect(conj(a, b)).toBe(conj(b, a));
      }
    }
  });
});

describe("disj", () => {
  test.each([
    ["+1", "+1", "-i"],
    ["+1", "+i", "+1"],
    ["+1", "-1", "+i"],
    ["+1", "-i", "-1"],
    ["+i", "+i", "+i"],
    ["+i", "-1", "-1"],
    ["+i", "-i", "-i"],
    ["-1", "-1", "-i"],
    ["-1", "-i", "+1"],
    ["-i", "-i", "+i"],
  ])("disj(%s, %s) = %s", (a, b, expected) => {
    expect(disj(a, b)).toBe(expected);
  });

  test("is commutative", () => {
    for (const a of IDS) {
      for (const b of IDS) {
        expect(disj(a, b)).toBe(disj(b, a));
      }
    }
  });
});

describe("impl", () => {
  test.each([
    ["+1", "+1", "+1"],
    ["+1", "+i", "+i"],
    ["+1", "-1", "-1"],
    ["+1", "-i", "-i"],
    ["+i", "+1", "-i"],
    ["+i", "+i", "+1"],
    ["+i", "-1", "+i"],
    ["+i", "-i", "-1"],
    ["-1", "+1", "-1"],
    ["-1", "+i", "-i"],
    ["-1", "-1", "+1"],
    ["-1", "-i", "+i"],
    ["-i", "+1", "+i"],
    ["-i", "+i", "-1"],
    ["-i", "-1", "-i"],
    ["-i", "-i", "+1"],
  ])("impl(%s, %s) = %s", (a, b, expected) => {
    expect(impl(a, b)).toBe(expected);
  });

  test("a → a is +1 for every element", () => {
    for (const id of IDS) {
      expect(impl(id, id)).toBe("+1");
    }
  });
});
