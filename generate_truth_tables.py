#!/usr/bin/env python3
"""
UnitaryPhaseLogic の各演算子の真理値表を標準出力および
truth_tables.md ファイルに出力します。

TRUE  = e^(i·0)    = 1   (θ = 0)
FALSE = e^(i·π/2)  = i   (θ = π/2)

角度表記は弧度法に統一。値の丸め演算は行わず、np.isclose による
厳密な一致判定でラベルを決定します。

代表的な真理値ラベル:
  T  (真)      θ = 0      行列値 =  1   cos(θ) > 0
  F  (偽)      θ = π/2    行列値 =  i   cos(θ) = 0
  ¬T (反真)    θ = π      行列値 = -1   cos(θ) < 0  → 古典論理への写像なし
  ¬F (反偽)    θ = 3π/2   行列値 = -i   cos(θ) = 0
  N  (Neither) その他の位相

古典論理への写像は cos(θ) で行う:
  cos(θ) > 0 → T,  cos(θ) = 0 → F,  cos(θ) < 0 → — (考察外)
"""

from collections.abc import Callable

import numpy as np
from UnitaryPhaseLogic import UnitaryPhaseLogic

# ────────────────────────────────────────────────────────────
# 定数
# ────────────────────────────────────────────────────────────
TRUE  = UnitaryPhaseLogic(0.0)
FALSE = UnitaryPhaseLogic(np.pi / 2)
NOT_T = UnitaryPhaseLogic(np.pi)            # ¬T (-1, θ = π)
NOT_F = UnitaryPhaseLogic(3 * np.pi / 2)   # ¬F (-i, θ = 3π/2)
N     = UnitaryPhaseLogic(5 * np.pi / 6)   # N  (e^{i5π/6}, θ = 5π/6)

INPUTS = [
    ("T",  TRUE),
    ("F",  FALSE),
    ("¬T", NOT_T),
    ("¬F", NOT_F),
    ("N",  N),
]

# 代表的な位相（弧度）とラベルの対応
_CANONICAL: list[tuple[complex, str]] = [
    ( 1+0j, "T"),    # θ = 0
    ( 0+1j, "F"),    # θ = π/2
    (-1+0j, "¬T"),   # θ = π
    ( 0-1j, "¬F"),   # θ = 3π/2
]


def _phase_rad(upl: UnitaryPhaseLogic) -> float:
    """UnitaryPhaseLogic インスタンスの位相角を [0, 2π) の弧度で返す。"""
    raw = np.angle(upl.U[0, 0])        # (-π, π]
    return float(raw % (2 * np.pi))    # [0, 2π)


def _label(upl: UnitaryPhaseLogic) -> str:
    """
    行列値を代表的な 4 値と np.isclose で比較しラベルを返す。
    どれにも一致しない場合は N (Neither: 非正準位相すべてを表す) を返す。
    """
    val = complex(upl.U[0, 0])
    for canonical_val, name in _CANONICAL:
        if np.isclose(val, canonical_val):
            return name
    return "N"


def _classical(upl: UnitaryPhaseLogic) -> str:
    """
    古典論理への写像: cos(θ) を用いる。
      cos(θ) > 0  → T
      cos(θ) = 0  → F
      cos(θ) < 0  → — (考察外)
    N (Neither: 非正準位相) は古典論理に対応値なし → —
    """
    if _label(upl) == "N":
        return "—"
    cos_val = float(np.real(upl.U[0, 0]))   # Re(e^iθ) = cos(θ)
    if np.isclose(cos_val, 0.0):
        return "F"
    if cos_val > 0:
        return "T"
    return "—"


# ────────────────────────────────────────────────────────────
# 真理値表の構築
# ────────────────────────────────────────────────────────────

def build_unary_table(
    op_name: str,
    op_fn: Callable[[UnitaryPhaseLogic], UnitaryPhaseLogic],
) -> list[str]:
    """単項演算子の真理値表行を返す。"""
    rows = [f"| A | {op_name}(A) | 古典論理 |", "| --- | --- | --- |"]
    for a_name, a_val in INPUTS:
        result = op_fn(a_val)
        rows.append(f"| {a_name} | {_label(result)} | {_classical(result)} |")
    return rows


def build_binary_table(
    op_name: str,
    op_fn: Callable[[UnitaryPhaseLogic, UnitaryPhaseLogic], UnitaryPhaseLogic],
) -> list[str]:
    """二項演算子の真理値表行を返す。"""
    rows = [f"| A | B | A {op_name} B | 古典論理 |", "| --- | --- | --- | --- |"]
    for a_name, a_val in INPUTS:
        for b_name, b_val in INPUTS:
            result = op_fn(a_val, b_val)
            rows.append(
                f"| {a_name} | {b_name} | {_label(result)} | {_classical(result)} |"
            )
    return rows


def generate() -> str:
    """全演算子の真理値表を Markdown 文字列として返す。"""
    sections = [
        "# UnitaryPhaseLogic — 真理値表\n",
        "角度表記は弧度法。古典論理への写像は cos(θ) で行う"
        " (cos(θ) < 0 の点は考察外):\n",
        "| ラベル | 行列値 | 位相 | cos(θ) | 古典論理 |",
        "| --- | --- | --- | --- | --- |",
        "| T  (真)      |  1 | θ = 0    | > 0 | T |",
        "| F  (偽)      |  i | θ = π/2  | = 0 | F |",
        "| ¬T (反真)    | -1 | θ = π    | < 0 | — |",
        "| ¬F (反偽)    | -i | θ = 3π/2 | = 0 | F |",
        "| N  (Neither) | その他 | θ = その他 | — | — |\n",
        "---\n",
        "## NOT (否定): ¬A = i · A†\n",
    ]
    sections += build_unary_table("NOT", lambda a: a.NOT())
    sections += [
        "\n---\n",
        "## AND (論理積): A ∧ B = A · B\n",
    ]
    sections += build_binary_table("∧", lambda a, b: a.AND(b))
    sections += [
        "\n---\n",
        "## OR (論理和): A ∨ B = −i · (A · B)\n",
    ]
    sections += build_binary_table("∨", lambda a, b: a.OR(b))
    sections += [
        "\n---\n",
        "## IMPLIES (含意): A ⇒ B = B · A†\n",
    ]
    sections += build_binary_table("⇒", lambda a, b: a.IMPLIES(b))
    # 注意: 同値 (EQAL) の導出は任意の二つの命題 A, B が恒真になる位相を
    # 作ってしまうため、演算子として定義すべきではない。真理値表からも削除。
    # sections += [
    #     "\n---\n",
    #     "## EQAL (同値): A ⇔ B = (A ⇒ B) ∧ (B ⇒ A)\n",
    # ]
    # sections += build_binary_table("⇔", lambda a, b: a.EQAL(b))
    return "\n".join(sections) + "\n"


# ────────────────────────────────────────────────────────────
# エントリーポイント
# ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    content = generate()
    print(content)

    output_path = "truth_tables.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"→ {output_path} に保存しました。")
