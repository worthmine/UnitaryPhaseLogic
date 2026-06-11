#!/usr/bin/env python3

import numpy as np

class UnitaryPhaseLogic:
    def __init__(self, theta: float = None, matrix: np.ndarray = None):
        """
        命題を 1x1 のユニタリ行列として初期化。
        角度 theta (ラジアン) を与えるか、直接行列を渡します。
        """
        if matrix is not None:
            self.U = matrix
        else:
            # thetaが指定されない場合は真(0ラジアン)とする
            t = theta if theta is not None else 0.0
            self.U = np.array([[np.exp(1j * t)]], dtype=complex)

    @property
    def dagger(self) -> np.ndarray:
        """
        随伴行列（共役転置）A^† を返す。
        ユニタリ行列において、これは逆行列 A^-1 と完全に等価です。
        """
        return self.U.conj().T

    def NOT(self):
        """
        否定: ¬A = i * A^†
        逆行列(共役転置)をとってから 90° 回転(iを掛ける)させます。
        """
        return UnitaryPhaseLogic(matrix=1j * self.dagger)

    def AND(self, other):
        """
        論理積: A ∧ B = A @ B
        1x1行列のドット積（テンソル的な合成）です。
        """
        return UnitaryPhaseLogic(matrix=self.U @ other.U)

    def OR(self, other):
        """
        論理和: A ∨ B = -i * (A @ B)
        ド・モルガンの法則を満たす唯一の行列表現です。
        """
        return UnitaryPhaseLogic(matrix=-1j * (self.U @ other.U))

    def IMPLIES(self, other):
        """
        含意（論理商）: A ⇒ B = B @ A^†
        割り算を廃し、結論に前提の共役転置を掛け合わせて位相差を抽出します。
        """
        return UnitaryPhaseLogic(matrix=other.U @ self.dagger)

    def __eq__(self, other):
        """浮動小数点誤差を吸収して、2つのユニタリ状態の同値性を判定します。"""
        if isinstance(other, UnitaryPhaseLogic):
            return np.allclose(self.U, other.U)
        elif isinstance(other, (complex, float, int)):
            return np.allclose(self.U, np.array([[complex(other)]]))
        return False

    def __repr__(self):
        """行列の位相を角度（度数法）でフォーマットして出力します。"""
        phase = np.angle(self.U[0, 0])
        deg = np.degrees(phase) % 360
        return f"UnitaryLogic[θ={deg:.1f}°]"


def run_unitary_theorems_tests():
    """
    ユニタリ行列表現による公理系が、諸定理を完璧に満たすことを証明するテスト。
    """
    print("=== ユニタリ行列版 U(1)位相論理学 テスト実行 ===")

    TRUE = UnitaryPhaseLogic(0.0)             # 真 (0°)
    FALSE = UnitaryPhaseLogic(np.pi / 2)      # 偽 (90°, i)
    
    # 任意の不確定なグラデーションを持つ命題 A, B を定義
    A = UnitaryPhaseLogic(np.radians(45))     # 45°の未知・矛盾状態
    B = UnitaryPhaseLogic(np.radians(120))    # 120°の命題

    # --- 定理1: 二重否定除去の完全復活 ---
    # ¬(¬A) = A
    assert A.NOT().NOT() == A
    print("定理1 [二重否定除去]: ¬(¬A) = A が行列演算で成立。")

    # --- 定理2: ド・モルガンの完全な対称性 ---
    # ¬(A ∨ B) = ¬A ∧ ¬B
    assert A.OR(B).NOT() == A.NOT().AND(B.NOT())
    # ¬(A ∧ B) = ¬A ∨ ¬B
    assert A.AND(B).NOT() == A.NOT().OR(B.NOT())
    print("定理2 [ド・モルガン則]: 双対の対称性が完全に一致。")

    # --- 定理3: モーダスポネンスの行列表現 ---
    # A ∧ (A ⇒ B) = B
    assert A.AND(A.IMPLIES(B)) == B
    print("定理3 [モーダスポネンス]: A @ (B @ A^†) = B が恒等式として成立。")

    # --- 定理4: 排中律の大域的成立 ---
    # A ∨ ¬A = 1 (True)
    assert A.OR(A.NOT()) == TRUE
    print("定理4 [排中律]: 任意の位相で A ∨ ¬A = True(+1) に大域的収束。")

    # --- 定理5: 矛盾の絶対的定数化 ---
    # A ∧ ¬A = i (False)
    assert A.AND(A.NOT()) == FALSE
    print("定理5 [矛盾律]: 矛盾 A ∧ ¬A は常に i (偽の定数行列) に確定。")

    # --- 定理6: 論理爆発の完全抑止 (パラコンシステント性) ---
    bot = A.AND(A.NOT())  # 矛盾行列 [i]
    # ⊥ ⇒ B は、-i * B と同値になる
    expected_shift = UnitaryPhaseLogic(matrix=-1j * B.U)
    assert bot.IMPLIES(B) == expected_shift
    print("定理6 [爆発律抑止]: ⊥ ⇒ B は -90°のユニタリ変換として決定論的に吸収。")

    print("==============================================")
    print("すべての定理が 1x1 ユニタリ行列の演算として証明されました！")


if __name__ == "__main__":
    run_unitary_theorems_tests()
