#!/usr/bin/env python3
"""
UnitaryPhaseLogic の各演算子の真理値表を標準出力および
truth_tables.md ファイルに出力します。

TRUE  = e^(i·0°)   = 1   (θ = 0°)
FALSE = e^(i·90°)  = i   (θ = 90°)

各セルは結果の位相角（度数法）と対応するラベルを示します。
"""

from collections.abc import Callable

import numpy as np
from UnitaryPhaseLogic import UnitaryPhaseLogic

# ────────────────────────────────────────────────────────────
# 定数
# ────────────────────────────────────────────────────────────
TRUE  = UnitaryPhaseLogic(0.0)
FALSE = UnitaryPhaseLogic(np.pi / 2)

INPUTS = [
    ("T", TRUE),
    ("F", FALSE),
]

# 位相角→ラベルの対応（近似）
_LABEL = {
    0.0:   "T",    # 真
    90.0:  "F",    # 偽
    180.0: "¬T",   # 反真
    270.0: "¬F",   # 反偽
}


def _phase_deg(upl: UnitaryPhaseLogic) -> float:
    """UnitaryPhaseLogic インスタンスの位相角を 0–360° で返す。"""
    deg = round(np.degrees(np.angle(upl.U[0, 0])) % 360, 1)
    # 浮動小数点誤差: % 360 後の微小負数 (例 -3e-15) を round すると
    # 360.0 になることがあるため 0.0 に正規化する。
    return 0.0 if deg >= 360.0 else deg


def _label(upl: UnitaryPhaseLogic) -> str:
    """位相角に対応するラベル文字列を返す。"""
    deg = _phase_deg(upl)
    # 360° の折り返しを考慮して近似一致を探す
    for key, name in _LABEL.items():
        if abs(deg - key) < 0.1:
            return f"{name} ({deg:.1f}°)"
    return f"({deg:.1f}°)"


# ────────────────────────────────────────────────────────────
# 真理値表の構築
# ────────────────────────────────────────────────────────────

def build_unary_table(
    op_name: str,
    op_fn: Callable[[UnitaryPhaseLogic], UnitaryPhaseLogic],
) -> list[str]:
    """単項演算子の真理値表行を返す。"""
    rows = [f"| A | {op_name}(A) |", "| --- | --- |"]
    for a_name, a_val in INPUTS:
        result = op_fn(a_val)
        rows.append(f"| {a_name} | {_label(result)} |")
    return rows


def build_binary_table(
    op_name: str,
    op_fn: Callable[[UnitaryPhaseLogic, UnitaryPhaseLogic], UnitaryPhaseLogic],
) -> list[str]:
    """二項演算子の真理値表行を返す。"""
    rows = [f"| A | B | A {op_name} B |", "| --- | --- | --- |"]
    for a_name, a_val in INPUTS:
        for b_name, b_val in INPUTS:
            result = op_fn(a_val, b_val)
            rows.append(f"| {a_name} | {b_name} | {_label(result)} |")
    return rows


def generate() -> str:
    """全演算子の真理値表を Markdown 文字列として返す。"""
    sections = [
        "# UnitaryPhaseLogic — 真理値表\n",
        "- **T** = TRUE  (θ = 0°,  行列値 = 1)",
        "- **F** = FALSE (θ = 90°, 行列値 = i)\n",
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
