# UnitaryPhaseLogic — Truth Table

Angles are expressed in radians. Classical mapping is done with cos(θ) (points with cos(θ) < 0 are outside the classical domain):

| Label | Matrix value | Phase | cos(θ) | Classical logic |
| --- | --- | --- | --- | --- |
| T  (True)      |  1 | θ = 0    | > 0 | T |
| F  (False)      |  i | θ = π/2  | = 0 | F |
| T̃ (Anti-True)    | -1 | θ = π    | < 0 | — |
| F̃ (Anti-False)    | -i | θ = 3π/2 | = 0 | F |
| N  (Neither) | other | θ = other | — | — |

---

## NOT (Negation): ¬A = i · A†

| A | NOT(A) | Classical logic |
| --- | --- | --- |
| T | F | F |
| F | T | T |
| T̃ | F̃ | F |
| F̃ | T̃ | — |
| N | N | — |

---

## AND (Conjunction): A ∧ B = A · B

| A | B | A ∧ B | Classical logic |
| --- | --- | --- | --- |
| T | T | T | T |
| T | F | F | F |
| T | T̃ | T̃ | — |
| T | F̃ | F̃ | F |
| T | N | N | — |
| F | T | F | F |
| F | F | T̃ | — |
| F | T̃ | F̃ | F |
| F | F̃ | T | T |
| F | N | N | — |
| T̃ | T | T̃ | — |
| T̃ | F | F̃ | F |
| T̃ | T̃ | T | T |
| T̃ | F̃ | F | F |
| T̃ | N | N | — |
| F̃ | T | F̃ | F |
| F̃ | F | T | T |
| F̃ | T̃ | F | F |
| F̃ | F̃ | T̃ | — |
| F̃ | N | N | — |
| N | T | N | — |
| N | F | N | — |
| N | T̃ | N | — |
| N | F̃ | N | — |
| N | N | N | — |

---

## OR (Disjunction): A ∨ B = −i · (A · B)

| A | B | A ∨ B | Classical logic |
| --- | --- | --- | --- |
| T | T | F̃ | F |
| T | F | T | T |
| T | T̃ | F | F |
| T | F̃ | T̃ | — |
| T | N | N | — |
| F | T | T | T |
| F | F | F | F |
| F | T̃ | T̃ | — |
| F | F̃ | F̃ | F |
| F | N | N | — |
| T̃ | T | F | F |
| T̃ | F | T̃ | — |
| T̃ | T̃ | F̃ | F |
| T̃ | F̃ | T | T |
| T̃ | N | N | — |
| F̃ | T | T̃ | — |
| F̃ | F | F̃ | F |
| F̃ | T̃ | T | T |
| F̃ | F̃ | F | F |
| F̃ | N | N | — |
| N | T | N | — |
| N | F | N | — |
| N | T̃ | N | — |
| N | F̃ | N | — |
| N | N | N | — |

---

## IMPLIES: A ⇒ B = B · A†

| A | B | A ⇒ B | Classical logic |
| --- | --- | --- | --- |
| T | T | T | T |
| T | F | F | F |
| T | T̃ | T̃ | — |
| T | F̃ | F̃ | F |
| T | N | N | — |
| F | T | F̃ | F |
| F | F | T | T |
| F | T̃ | F | F |
| F | F̃ | T̃ | — |
| F | N | N | — |
| T̃ | T | T̃ | — |
| T̃ | F | F̃ | F |
| T̃ | T̃ | T | T |
| T̃ | F̃ | F | F |
| T̃ | N | N | — |
| F̃ | T | F | F |
| F̃ | F | T̃ | — |
| F̃ | T̃ | F̃ | F |
| F̃ | F̃ | T | T |
| F̃ | N | N | — |
| N | T | N | — |
| N | F | N | — |
| N | T̃ | N | — |
| N | F̃ | N | — |
| N | N | T | T |
