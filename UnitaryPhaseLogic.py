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

    # 注意: 同値の導出は任意の二つの命題 A, B が恒真になる位相を作ってしまう
    # (A ⇔ B = (B·A†)·(A·B†) = B·B† = T) ため、演算子として定義すべきではない。
    # def EQAL(self, other):
    #     """
    #     同値: A ⇔ B = (A ⇒ B) ∧ (B ⇒ A)
    #     含意を両方向で組み合わせて、同値性を表現します。
    #     """
    #     return self.IMPLIES(other).AND(other.IMPLIES(self))

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
