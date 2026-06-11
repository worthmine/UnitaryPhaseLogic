#!/usr/bin/env python3
"""
generate_truth_tables の真理値表テスト。

各演算子の UPL ラベルを assertEqual で検証し、
古典論理への写像との不一致は UserWarning として記録します（エラーではない）。
"""

import unittest
import warnings

import numpy as np

from UnitaryPhaseLogic import UnitaryPhaseLogic
from generate_truth_tables import (
    TRUE, FALSE,
    _label, _classical,
)

# 古典論理の期待値 (二値: "T" or "F")
# "—" は cos(θ) < 0 であり古典論理の考察外を意味する
_CLASSICAL_EXPECTED = {
    # NOT
    ("NOT", "T"):      ("F",  "F"),   # (UPL expected, classical expected)
    ("NOT", "F"):      ("T",  "T"),
    # AND
    ("AND", "T", "T"): ("T",  "T"),
    ("AND", "T", "F"): ("F",  "F"),
    ("AND", "F", "T"): ("F",  "F"),
    ("AND", "F", "F"): ("¬T", "F"),   # UPL: ¬T (cos<0, 考察外) vs 古典: F → 警告
    # OR
    ("OR",  "T", "T"): ("¬F", "T"),   # UPL: ¬F (cos=0→F)     vs 古典: T → 警告
    ("OR",  "T", "F"): ("T",  "T"),
    ("OR",  "F", "T"): ("T",  "T"),
    ("OR",  "F", "F"): ("F",  "F"),
    # IMPLIES
    ("IMP", "T", "T"): ("T",  "T"),
    ("IMP", "T", "F"): ("F",  "F"),
    ("IMP", "F", "T"): ("¬F", "T"),   # UPL: ¬F (cos=0→F)     vs 古典: T → 警告
    ("IMP", "F", "F"): ("T",  "T"),
}


def _check_classical(
    result: UnitaryPhaseLogic,
    classical_expected: str,
    msg: str,
) -> None:
    """
    result の古典論理写像が classical_expected と一致しない場合、
    UserWarning を発行する（エラーではない）。
    """
    classical_actual = _classical(result)
    if classical_actual != classical_expected:
        warnings.warn(
            f"{msg}: UPL結果の古典写像={classical_actual!r} が "
            f"古典論理の期待値={classical_expected!r} と不一致",
            UserWarning,
            stacklevel=2,
        )


class TestTruthTableLabels(unittest.TestCase):
    """各演算子が正しい UPL ラベルを返すことを検証する。"""

    def setUp(self):
        self.T = TRUE
        self.F = FALSE

    # ── NOT ──────────────────────────────────────────────────

    def test_not_true(self):
        """NOT T = F"""
        self.assertEqual(_label(self.T.NOT()), "F")

    def test_not_false(self):
        """NOT F = T"""
        self.assertEqual(_label(self.F.NOT()), "T")

    # ── AND ──────────────────────────────────────────────────

    def test_and_tt(self):
        """T ∧ T = T"""
        self.assertEqual(_label(self.T.AND(self.T)), "T")

    def test_and_tf(self):
        """T ∧ F = F"""
        self.assertEqual(_label(self.T.AND(self.F)), "F")

    def test_and_ft(self):
        """F ∧ T = F"""
        self.assertEqual(_label(self.F.AND(self.T)), "F")

    def test_and_ff(self):
        """F ∧ F = ¬T  (非古典的結果)"""
        self.assertEqual(_label(self.F.AND(self.F)), "¬T")

    # ── OR ───────────────────────────────────────────────────

    def test_or_tt(self):
        """T ∨ T = ¬F  (非古典的結果)"""
        self.assertEqual(_label(self.T.OR(self.T)), "¬F")

    def test_or_tf(self):
        """T ∨ F = T"""
        self.assertEqual(_label(self.T.OR(self.F)), "T")

    def test_or_ft(self):
        """F ∨ T = T"""
        self.assertEqual(_label(self.F.OR(self.T)), "T")

    def test_or_ff(self):
        """F ∨ F = F"""
        self.assertEqual(_label(self.F.OR(self.F)), "F")

    # ── IMPLIES ──────────────────────────────────────────────

    def test_implies_tt(self):
        """T ⇒ T = T"""
        self.assertEqual(_label(self.T.IMPLIES(self.T)), "T")

    def test_implies_tf(self):
        """T ⇒ F = F"""
        self.assertEqual(_label(self.T.IMPLIES(self.F)), "F")

    def test_implies_ft(self):
        """F ⇒ T = ¬F  (非古典的結果)"""
        self.assertEqual(_label(self.F.IMPLIES(self.T)), "¬F")

    def test_implies_ff(self):
        """F ⇒ F = T"""
        self.assertEqual(_label(self.F.IMPLIES(self.F)), "T")


class TestClassicalMapping(unittest.TestCase):
    """_classical() が各代表値を正しく写像することを検証する。"""

    def setUp(self):
        self.T = TRUE
        self.F = FALSE

    def test_classical_T(self):
        """cos(0) = 1 > 0 → T"""
        self.assertEqual(_classical(self.T), "T")

    def test_classical_F(self):
        """cos(π/2) = 0 → F"""
        self.assertEqual(_classical(self.F), "F")

    def test_classical_not_T(self):
        """cos(π) = -1 < 0 → — (考察外)"""
        not_t = UnitaryPhaseLogic(np.pi)
        self.assertEqual(_classical(not_t), "—")

    def test_classical_not_F(self):
        """cos(3π/2) = 0 → F"""
        not_f = UnitaryPhaseLogic(3 * np.pi / 2)
        self.assertEqual(_classical(not_f), "F")


class TestClassicalConsistency(unittest.TestCase):
    """
    UPL 演算結果の古典写像が、古典論理の期待値と不一致の場合に
    UserWarning が発行されることを検証する（エラーではない）。
    """

    def setUp(self):
        self.T = TRUE
        self.F = FALSE

    # ── AND F∧F: 古典=F, cos写像=— → 警告 ─────────────────

    def test_and_ff_classical_warning(self):
        """F ∧ F の古典写像 (—) と古典期待値 (F) が不一致 → UserWarning"""
        result = self.F.AND(self.F)
        with self.assertWarns(UserWarning):
            _check_classical(result, "F", "F ∧ F")

    # ── OR T∨T: 古典=T, cos写像=F → 警告 ──────────────────

    def test_or_tt_classical_warning(self):
        """T ∨ T の古典写像 (F) と古典期待値 (T) が不一致 → UserWarning"""
        result = self.T.OR(self.T)
        with self.assertWarns(UserWarning):
            _check_classical(result, "T", "T ∨ T")

    # ── IMPLIES F⇒T: 古典=T, cos写像=F → 警告 ─────────────

    def test_implies_ft_classical_warning(self):
        """F ⇒ T の古典写像 (F) と古典期待値 (T) が不一致 → UserWarning"""
        result = self.F.IMPLIES(self.T)
        with self.assertWarns(UserWarning):
            _check_classical(result, "T", "F ⇒ T")

    # ── 一致するケースでは警告が出ないことも確認 ────────────

    def test_and_tt_no_warning(self):
        """T ∧ T の古典写像 (T) は古典期待値 (T) と一致 → 警告なし"""
        result = self.T.AND(self.T)
        with warnings.catch_warnings():
            warnings.simplefilter("error", UserWarning)
            _check_classical(result, "T", "T ∧ T")  # 警告が出ればテスト失敗

    def test_or_ff_no_warning(self):
        """F ∨ F の古典写像 (F) は古典期待値 (F) と一致 → 警告なし"""
        result = self.F.OR(self.F)
        with warnings.catch_warnings():
            warnings.simplefilter("error", UserWarning)
            _check_classical(result, "F", "F ∨ F")


if __name__ == "__main__":
    unittest.main()
