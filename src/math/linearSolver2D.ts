import { LineEquation2D, LinearSystem2DResult, Vector2 } from './types.js';
import { norm2, dot2, approxEqual } from './vectors.js';

export function solveLinearSystem2D(
  l1: LineEquation2D,
  l2: LineEquation2D
): LinearSystem2DResult {
  const n1: Vector2 = [l1.a, l1.b];
  const n2: Vector2 = [l2.a, l2.b];

  const norm1 = norm2(n1);
  const norm2Val = norm2(n2);

  if (norm1 < 1e-9 || norm2Val < 1e-9) {
    return {
      classification: 'DEGENERATE',
      determinant: 0,
      normalizedDeterminant: 0,
      explanation:
        'At least one of the equations has zero coefficients (0x + 0y = c), which does not form a valid geometric line.',
      stepsLatex: [
        `\\text{Degenerate equation detected: normal vector magnitude is zero.}`
      ]
    };
  }

  const D = l1.a * l2.b - l2.a * l1.b;
  const normalizedDeterminant = Math.abs(D) / (norm1 * norm2Val);

  if (normalizedDeterminant <= 1e-6) {
    // Parallel or coincident
    const u1: Vector2 = [l1.a / norm1, l1.b / norm1];
    const u2: Vector2 = [l2.a / norm2Val, l2.b / norm2Val];

    const d1 = l1.c / norm1;
    const d2 = l2.c / norm2Val;

    const dotNormals = dot2(u1, u2);
    const isSameDir = approxEqual(dotNormals, 1, 1e-5);
    const isOppDir = approxEqual(dotNormals, -1, 1e-5);

    const isCoincident =
      (isSameDir && approxEqual(d1, d2, 1e-5)) ||
      (isOppDir && approxEqual(d1, -d2, 1e-5));

    if (isCoincident) {
      return {
        classification: 'COINCIDENT',
        determinant: D,
        normalizedDeterminant,
        explanation:
          'The lines are coincident (identical). Both equations describe the exact same line, yielding infinitely many solutions.',
        stepsLatex: [
          `D = a_1 b_2 - a_2 b_1 = (${l1.a})(${l2.b}) - (${l2.a})(${l1.b}) = ${formatNum(D)} \\approx 0`,
          `\\text{Collinear normal vectors with proportional constants } \\implies \\text{Infinitely many solutions.}`
        ]
      };
    } else {
      return {
        classification: 'PARALLEL_DISTINCT',
        determinant: D,
        normalizedDeterminant,
        explanation:
          'The lines are parallel and distinct. They have equal slopes but different intercepts, so they never intersect.',
        stepsLatex: [
          `D = a_1 b_2 - a_2 b_1 = (${l1.a})(${l2.b}) - (${l2.a})(${l1.b}) = ${formatNum(D)} \\approx 0`,
          `\\text{Normal vectors are collinear, but constant terms differ } \\implies \\text{No solution.}`
        ]
      };
    }
  }

  // Unique intersection via Cramer's rule
  const Dx = l1.c * l2.b - l2.c * l1.b;
  const Dy = l1.a * l2.c - l2.a * l1.c;

  const x = Dx / D;
  const y = Dy / D;

  const stepsLatex = [
    `\\text{System determinant: } D = a_1 b_2 - a_2 b_1 = (${l1.a})(${l2.b}) - (${l2.a})(${l1.b}) = ${formatNum(D)}`,
    `D_x = c_1 b_2 - c_2 b_1 = (${l1.c})(${l2.b}) - (${l2.c})(${l1.b}) = ${formatNum(Dx)}`,
    `D_y = a_1 c_2 - a_2 c_1 = (${l1.a})(${l2.c}) - (${l2.a})(${l1.c}) = ${formatNum(Dy)}`,
    `x = \\frac{D_x}{D} = \\frac{${formatNum(Dx)}}{${formatNum(D)}} = ${formatNum(x)}, \\quad y = \\frac{D_y}{D} = \\frac{${formatNum(Dy)}}{${formatNum(D)}} = ${formatNum(y)}`,
    `\\text{Intersection point: } (x, y) = (${formatNum(x)}, ${formatNum(y)})`
  ];

  return {
    classification: 'UNIQUE_INTERSECTION',
    determinant: D,
    normalizedDeterminant,
    intersectionPoint: [x, y],
    explanation: 'The system has a unique solution corresponding to the single intersection point of the two lines.',
    stepsLatex
  };
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const rounded = Math.round(n * 1000) / 1000;
  return rounded.toString();
}
