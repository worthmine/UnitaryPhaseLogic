# UnitaryPhaseLogic

A logical framework that represents propositions as 1×1 unitary matrices (complex numbers on the unit circle, `e^(iθ)`).
Logical operations are defined as unitary transformations, extending classical two-valued logic into a richer phase-based structure.

## Live Demo

🌐 **[View Interactive Visualization](https://worthmine.github.io/UnitaryPhaseLogic/)**

The interactive demo allows you to explore the Unitary Phase Logic operations visually on the complex plane.

## Value System

| Label | Matrix value | Phase | cos(θ) | Classical mapping |
|-------|-------------|-------|--------|-------------------|
| T  (True)       |  1 | θ = 0    | > 0 | T |
| F  (False)      |  i | θ = π/2  | = 0 | F |
| ¬T (Anti-True)  | -1 | θ = π    | < 0 | — (outside classical domain) |
| ¬F (Anti-False) | -i | θ = 3π/2 | = 0 | F |
| N  (Neither)    | any other | any other θ | — | — |

The classical mapping uses `cos(θ)`: positive → T, zero → F, negative → outside the classical domain.

## Operators

| Operator | Definition | Description |
|----------|-----------|-------------|
| NOT   | ¬A = i · A†      | Conjugate transpose (phase inversion) followed by a 90° rotation |
| AND   | A ∧ B = A · B    | Matrix (complex) multiplication — phase addition on the unit circle |
| OR    | A ∨ B = −i·(A·B) | AND followed by a −90° rotation |
| IMPLIES | A ⇒ B = B · A† | Phase difference from A to B |
| EQAL  | A ⇔ B = (A⇒B) ∧ (B⇒A) | Mutual implication |

## Logical Consequences

### Theorems that hold universally (for all phases)

The following identities are proven for arbitrary propositions A and B represented as any unitary phase (not just the canonical four values). All six are verified by the test suite.

| # | Theorem | Identity | Note |
|---|---------|----------|------|
| 1 | **Double Negation Elimination** | ¬(¬A) = A | Holds for every phase θ |
| 2 | **De Morgan's Laws** | ¬(A ∨ B) = ¬A ∧ ¬B  and  ¬(A ∧ B) = ¬A ∨ ¬B | Full duality holds |
| 3 | **Modus Ponens** | A ∧ (A ⇒ B) = B | Preserved exactly |
| 4 | **Law of Excluded Middle** | A ∨ ¬A = T | Converges to T for every phase |
| 5 | **Law of Non-Contradiction** | A ∧ ¬A = F | Always yields the constant matrix i |
| 6 | **Explosion Suppression** | ⊥ ⇒ B = −i · B | Contradiction implies a deterministic −90° phase shift, not arbitrary truth |

**Proofs** (for 1×1 unitary matrices where A = e^(iθ)):

- *Double Negation*: ¬(¬A) = i·(i·A†)† = i·(−i·A) = A ✓
- *Excluded Middle*: A ∨ ¬A = −i·(A·i·A†) = −i·i·(A·A†) = 1 = T ✓
- *Non-Contradiction*: A ∧ ¬A = A·(i·A†) = i·(A·A†) = i = F ✓
- *Modus Ponens*: A ∧ (A⇒B) = A·(B·A†) = B·(A·A†) = B ✓

### Additional structural consequences

| Consequence | Identity | Meaning |
|-------------|----------|---------|
| **Reflexivity of implication** | A ⇒ A = T | Every proposition implies itself |
| **Unitarity identity** | A · A† = T | Every proposition composed with its own conjugate collapses to True |
| **Universal biconditional** | A ⇔ B = T for all A, B | Every pair of propositions is biconditionally equivalent (phase cancellation) |

**Proof of universal biconditional**:
A ⇔ B = (B·A†)·(A·B†) = B·(A†·A)·B† = B·T·B† = B·B† = T ✓

This is a fundamental departure from classical logic: the `EQAL` operator always returns T regardless of the operands. It measures structural biconditional equivalence within the unitary framework, not value equality.

### Algebraic structure

The four canonical values {T, F, ¬T, ¬F} = {1, i, −1, −i} form the **cyclic group Z₄** under AND (complex multiplication). The NOT operator acts as a 90° rotation combined with conjugation:

```
NOT cycle:  T → F → T   (order 2)
            ¬T → ¬F → ¬T   (order 2)
AND cycle:  T → F → ¬T → ¬F → T   (order 4)
```

N (Neither) — any phase not in {0, π/2, π, 3π/2} — is **absorbing** under all binary operators: if either operand is N, the result is N.

### Divergences from classical logic

The following cases produce results that differ from classical two-valued logic when the classical mapping `cos(θ)` is applied:

| Operation | UPL result | Classical expectation | Reason |
|-----------|-----------|-----------------------|--------|
| F ∧ F     | ¬T        | F | Phase addition: π/2 + π/2 = π |
| T ∨ T     | ¬F        | T | −90° rotation after AND: 0 − π/2 = −π/2 |
| F ⇒ T     | ¬F        | T | Vacuous truth does not hold in UPL |

These divergences are by design. UPL tracks exact phase rather than projecting to binary truth, so the classical mapping produces warnings (not errors) for these edge cases.

## Usage

```python
import numpy as np
from UnitaryPhaseLogic import UnitaryPhaseLogic

T = UnitaryPhaseLogic(0.0)           # True  (θ = 0)
F = UnitaryPhaseLogic(np.pi / 2)     # False (θ = π/2)

print(T.NOT())          # UnitaryLogic[θ=90.0°]  → F
print(F.NOT())          # UnitaryLogic[θ=0.0°]   → T
print(T.AND(F))         # UnitaryLogic[θ=90.0°]  → F
print(T.OR(F))          # UnitaryLogic[θ=0.0°]   → T

A = UnitaryPhaseLogic(np.radians(45))
print(A.OR(A.NOT()))    # UnitaryLogic[θ=0.0°]   → T  (Excluded Middle)
print(A.AND(A.NOT()))   # UnitaryLogic[θ=90.0°]  → F  (Non-Contradiction)
```

See [`truth_tables.md`](truth_tables.md) for full operator truth tables across all canonical values.
