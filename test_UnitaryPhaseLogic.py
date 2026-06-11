#!/usr/bin/env python3

import unittest
import numpy as np

from UnitaryPhaseLogic import UnitaryPhaseLogic


class TestUnitaryTheorems(unittest.TestCase):
    """ユニタリ行列表現による公理系が、諸定理を完璧に満たすことを証明するテスト。"""

    def setUp(self):
        self.TRUE = UnitaryPhaseLogic(0.0)            # 真 (0°)
        self.FALSE = UnitaryPhaseLogic(np.pi / 2)     # 偽 (90°, i)
        # 任意の不確定なグラデーションを持つ命題 A, B を定義
        self.A = UnitaryPhaseLogic(np.radians(45))    # 45°の未知・矛盾状態
        self.B = UnitaryPhaseLogic(np.radians(120))   # 120°の命題

    def test_double_negation(self):
        """定理1 [二重否定除去]: ¬(¬A) = A が行列演算で成立。"""
        self.assertEqual(self.A.NOT().NOT(), self.A)

    def test_de_morgan(self):
        """定理2 [ド・モルガン則]: 双対の対称性が完全に一致。"""
        A, B = self.A, self.B
        # ¬(A ∨ B) = ¬A ∧ ¬B
        self.assertEqual(A.OR(B).NOT(), A.NOT().AND(B.NOT()))
        # ¬(A ∧ B) = ¬A ∨ ¬B
        self.assertEqual(A.AND(B).NOT(), A.NOT().OR(B.NOT()))

    def test_modus_ponens(self):
        """定理3 [モーダスポネンス]: A @ (B @ A^†) = B が恒等式として成立。"""
        A, B = self.A, self.B
        # A ∧ (A ⇒ B) = B
        self.assertEqual(A.AND(A.IMPLIES(B)), B)

    def test_excluded_middle(self):
        """定理4 [排中律]: 任意の位相で A ∨ ¬A = True(+1) に大域的収束。"""
        self.assertEqual(self.A.OR(self.A.NOT()), self.TRUE)

    def test_contradiction(self):
        """定理5 [矛盾律]: 矛盾 A ∧ ¬A は常に i (偽の定数行列) に確定。"""
        self.assertEqual(self.A.AND(self.A.NOT()), self.FALSE)

    def test_explosion_suppression(self):
        """定理6 [爆発律抑止]: ⊥ ⇒ B は -90°のユニタリ変換として決定論的に吸収。"""
        B = self.B
        bot = self.A.AND(self.A.NOT())  # 矛盾行列 [i]
        # ⊥ ⇒ B は、-i * B と同値になる
        expected_shift = UnitaryPhaseLogic(matrix=-1j * B.U)
        self.assertEqual(bot.IMPLIES(B), expected_shift)


if __name__ == "__main__":
    unittest.main()
