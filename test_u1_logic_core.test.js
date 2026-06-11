import assert from "node:assert/strict";
import test from "node:test";

import { conj, disj, impl, neg, L4 } from "./src/u1_logic_core.js";

test("negation is involutive on L4", () => {
  for (const value of L4) {
    const once = neg(value.id);
    assert.notEqual(once, null);
    assert.equal(neg(once), value.id);
  }
});

test("conjunction examples match expected outputs", () => {
  assert.equal(conj("+1", "+1"), "+1");
  assert.equal(conj("+i", "+i"), "-1");
  assert.equal(conj("-i", "+i"), "+1");
});

test("disjunction examples match expected outputs", () => {
  assert.equal(disj("+1", "+1"), "-i");
  assert.equal(disj("+i", "-i"), "-i");
  assert.equal(disj("-1", "-1"), "-i");
});

test("implication examples match expected outputs", () => {
  assert.equal(impl("+1", "+1"), "+1");
  assert.equal(impl("+1", "+i"), "+i");
  assert.equal(impl("+i", "+1"), "-i");
});
