import { Vector2 } from "../core/vector2"

function gcd(a: number, b: number): number {
  if (!b) {
    return a;
  }

  return gcd(b, a % b);
}

export function calculateLineEquation(point1: Vector2, point2: Vector2) {
  let A: number = point1.y - point2.y
  let B: number = point2.x - point1.x
  let C: number = point1.x * point2.y - point1.y * point2.x

  let aString = ""
  let bString = ""
  let cString = ""

  try {
    const g = [A, B, C].filter(val => val != 0).reduce(gcd)
    A /= g
    B /= g
    C /= g

    if (A !== 0) {
      if (Math.abs(A) != 1) {
        aString = `${A}x`
      } else {
        aString = A < 0 ? "-x" : "x"
      }
    }

    if (B !== 0) {
      if (Math.abs(B) != 1) {
        bString = (A != 0 && B > 0 ? "+" : "") + B + "y";
      } else {
        bString = A != 0 && B > 0 ? "+y" : "y"
      }
    }

    if (C !== 0) {
      cString += (A != 0 || B != 0) && C > 0 ? "+" + C : C;
    }
  } catch (err) {
    if (err instanceof TypeError) {
      bString = "y"
    }
  }
  return `${aString} ${bString} ${cString} = 0`
}
