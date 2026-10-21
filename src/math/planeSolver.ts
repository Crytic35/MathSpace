import {
  PlaneEquation,
  PlaneIntersectionResult,
  Vector3
} from './types.js';
import {
  norm3,
  cross3,
  dot3,
  normalize3,
  vectorsApproxEqual3,
  approxEqual
} from './vectors.js';

const PARALLEL_EPSILON = 1e-7;
const ILL_CONDITIONED_EPSILON = 1e-5;
const COINCIDENT_DISTANCE_EPSILON = 1e-6;

export function solvePlaneIntersection(
  p1: PlaneEquation,
  p2: PlaneEquation
): PlaneIntersectionResult {
  const n1: Vector3 = [p1.a, p1.b, p1.c];
  const n2: Vector3 = [p2.a, p2.b, p2.c];

  const norm1 = norm3(n1);
  const norm2 = norm3(n2);

  // Check degenerate equations
  if (norm1 < 1e-9) {
    const isTrivial = approxEqual(p1.d, 0, 1e-9);
    return {
      classification: isTrivial ? 'DEGENERATE_ALL_SPACE' : 'DEGENERATE_EMPTY',
      isIntersecting: false,
      n1,
      n2,
      norm1,
      norm2,
      normalizedCrossMagnitude: 0,
      explanation: isTrivial
        ? 'Plane 1 is a trivial identity (0 = 0), representing the entire 3D space.'
        : `Plane 1 is inconsistent (0 = ${p1.d}), which has no solution (empty set).`,
      derivationStepsLatex: [
        `\\text{Normal vector } \\mathbf{n}_1 = (0, 0, 0) \\implies \\text{Degenerate equation.}`
      ]
    };
  }

  if (norm2 < 1e-9) {
    const isTrivial = approxEqual(p2.d, 0, 1e-9);
    return {
      classification: isTrivial ? 'DEGENERATE_ALL_SPACE' : 'DEGENERATE_EMPTY',
      isIntersecting: false,
      n1,
      n2,
      norm1,
      norm2,
      normalizedCrossMagnitude: 0,
      explanation: isTrivial
        ? 'Plane 2 is a trivial identity (0 = 0), representing the entire 3D space.'
        : `Plane 2 is inconsistent (0 = ${p2.d}), which has no solution (empty set).`,
      derivationStepsLatex: [
        `\\text{Normal vector } \\mathbf{n}_2 = (0, 0, 0) \\implies \\text{Degenerate equation.}`
      ]
    };
  }

  const cross = cross3(n1, n2);
  const crossNorm = norm3(cross);
  const normalizedCrossMagnitude = crossNorm / (norm1 * norm2);

  // Check parallel or coincident
  if (normalizedCrossMagnitude <= PARALLEL_EPSILON) {
    const u1 = normalize3(n1);
    const u2 = normalize3(n2);

    const dist1 = p1.d / norm1;
    const dist2 = p2.d / norm2;

    const sameDirection = vectorsApproxEqual3(u1, u2, 1e-5);
    const oppositeDirection = vectorsApproxEqual3(u1, [-u2[0], -u2[1], -u2[2]], 1e-5);

    const isCoincident =
      (sameDirection && approxEqual(dist1, dist2, COINCIDENT_DISTANCE_EPSILON)) ||
      (oppositeDirection && approxEqual(dist1, -dist2, COINCIDENT_DISTANCE_EPSILON));

    if (isCoincident) {
      return {
        classification: 'COINCIDENT',
        isIntersecting: false,
        n1,
        n2,
        norm1,
        norm2,
        normalizedCrossMagnitude,
        explanation:
          'The planes are coincident (identical). Both equations represent the same geometric plane, yielding an infinite 2D solution set rather than a unique 1D line.',
        derivationStepsLatex: [
          `\\mathbf{n}_1 = (${p1.a}, ${p1.b}, ${p1.c}), \\quad \\mathbf{n}_2 = (${p2.a}, ${p2.b}, ${p2.c})`,
          `\\mathbf{n}_1 \\times \\mathbf{n}_2 \\approx \\mathbf{0} \\implies \\text{Planes are parallel.}`,
          `\\text{Normalized equation comparison confirms identical sets: } \\hat{\\mathbf{n}}_1 = \\pm \\hat{\\mathbf{n}}_2 \\text{ and } \\delta_1 = \\pm \\delta_2.`
        ]
      };
    } else {
      return {
        classification: 'PARALLEL_DISTINCT',
        isIntersecting: false,
        n1,
        n2,
        norm1,
        norm2,
        normalizedCrossMagnitude,
        explanation:
          'The planes are parallel and distinct. Their normal vectors are collinear, but their distance offsets differ. There are no common points of intersection.',
        derivationStepsLatex: [
          `\\mathbf{n}_1 = (${p1.a}, ${p1.b}, ${p1.c}), \\quad \\mathbf{n}_2 = (${p2.a}, ${p2.b}, ${p2.c})`,
          `\\|\\mathbf{n}_1 \\times \\mathbf{n}_2\\| / (\\|\\mathbf{n}_1\\| \\|\\mathbf{n}_2\\|) \\le 10^{-7} \\implies \\text{Collinear normals.}`,
          `\\text{Distance offsets differ: } \\delta_1 = \\frac{${p1.d}}{\\|\\mathbf{n}_1\\|} \\neq \\pm \\frac{${p2.d}}{\\|\\mathbf{n}_2\\|} \\implies \\text{No intersection.}`
        ]
      };
    }
  }

  // Intersecting (either standard or ill-conditioned)
  const isIllConditioned = normalizedCrossMagnitude <= ILL_CONDITIONED_EPSILON;
  const classification = isIllConditioned
    ? 'ILL_CONDITIONED_INTERSECTING'
    : 'INTERSECTING';

  // Find particular point p0 using largest 2x2 minor determinant
  const Dxy = p1.a * p2.b - p2.a * p1.b;
  const Dxz = p1.a * p2.c - p2.a * p1.c;
  const Dyz = p1.b * p2.c - p2.b * p1.c;

  const absDxy = Math.abs(Dxy);
  const absDxz = Math.abs(Dxz);
  const absDyz = Math.abs(Dyz);

  let p0: Vector3;
  let pointDerivationLatex = '';

  if (absDxy >= absDxz && absDxy >= absDyz) {
    // Set z = 0, solve for x and y
    const x0 = (p1.d * p2.b - p2.d * p1.b) / Dxy;
    const y0 = (p1.a * p2.d - p2.a * p1.d) / Dxy;
    p0 = [x0, y0, 0];
    pointDerivationLatex = `\\text{Using largest minor } D_{xy} = ${formatNum(Dxy)} \\neq 0 \\text{ with } z_0 = 0: x_0 = ${formatNum(x0)}, \\; y_0 = ${formatNum(y0)}`;
  } else if (absDxz >= absDxy && absDxz >= absDyz) {
    // Set y = 0, solve for x and z
    const x0 = (p1.d * p2.c - p2.d * p1.c) / Dxz;
    const z0 = (p1.a * p2.d - p2.a * p1.d) / Dxz;
    p0 = [x0, 0, z0];
    pointDerivationLatex = `\\text{Using largest minor } D_{xz} = ${formatNum(Dxz)} \\neq 0 \\text{ with } y_0 = 0: x_0 = ${formatNum(x0)}, \\; z_0 = ${formatNum(z0)}`;
  } else {
    // Set x = 0, solve for y and z
    const y0 = (p1.d * p2.c - p2.d * p1.c) / Dyz;
    const z0 = (p1.b * p2.d - p2.b * p1.d) / Dyz;
    p0 = [0, y0, z0];
    pointDerivationLatex = `\\text{Using largest minor } D_{yz} = ${formatNum(Dyz)} \\neq 0 \\text{ with } x_0 = 0: y_0 = ${formatNum(y0)}, \\; z_0 = ${formatNum(z0)}`;
  }

  // Direction vector d = cross
  const d: Vector3 = [cross[0], cross[1], cross[2]];

  // Verification
  const val1 = dot3(n1, p0);
  const val2 = dot3(n2, p0);
  const plane1Valid = approxEqual(val1, p1.d, 1e-4);
  const plane2Valid = approxEqual(val2, p2.d, 1e-4);

  const parametricEquationLatex = `\\mathbf{r}(t) = \\begin{pmatrix} ${formatNum(p0[0])} \\\\ ${formatNum(p0[1])} \\\\ ${formatNum(p0[2])} \\end{pmatrix} + t \\begin{pmatrix} ${formatNum(d[0])} \\\\ ${formatNum(d[1])} \\\\ ${formatNum(d[2])} \\end{pmatrix}`;

  const derivationStepsLatex = [
    `\\mathbf{n}_1 = (${p1.a}, ${p1.b}, ${p1.c}), \\quad \\mathbf{n}_2 = (${p2.a}, ${p2.b}, ${p2.c})`,
    `\\mathbf{d} = \\mathbf{n}_1 \\times \\mathbf{n}_2 = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ ${p1.a} & ${p1.b} & ${p1.c} \\\\ ${p2.a} & ${p2.b} & ${p2.c} \\end{vmatrix} = (${formatNum(d[0])}, ${formatNum(d[1])}, ${formatNum(d[2])})`,
    pointDerivationLatex,
    `\\mathbf{p}_0 = (${formatNum(p0[0])}, ${formatNum(p0[1])}, ${formatNum(p0[2])})`,
    `\\text{Parametric equation: } ` + parametricEquationLatex,
    `\\text{Verification: } \\mathbf{n}_1 \\cdot \\mathbf{p}_0 = ${formatNum(val1)} \\approx ${p1.d}, \\quad \\mathbf{n}_2 \\cdot \\mathbf{p}_0 = ${formatNum(val2)} \\approx ${p2.d}`
  ];

  const explanation = isIllConditioned
    ? 'The planes intersect in a line, but their normal vectors are nearly parallel (ill-conditioned). Small variations in coefficients will cause large displacements in the line.'
    : 'The planes intersect along a unique straight line in 3D space, whose direction vector is perpendicular to both normal vectors.';

  return {
    classification,
    isIntersecting: true,
    n1,
    n2,
    norm1,
    norm2,
    normalizedCrossMagnitude,
    directionVector: d,
    particularPoint: p0,
    parametricEquationLatex,
    verification: {
      plane1Sub: `${p1.a}(${formatNum(p0[0])}) + ${p1.b}(${formatNum(p0[1])}) + ${p1.c}(${formatNum(p0[2])}) = ${formatNum(val1)}`,
      plane2Sub: `${p2.a}(${formatNum(p0[0])}) + ${p2.b}(${formatNum(p0[1])}) + ${p2.c}(${formatNum(p0[2])}) = ${formatNum(val2)}`,
      plane1Valid,
      plane2Valid
    },
    explanation,
    derivationStepsLatex
  };
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const rounded = Math.round(n * 1000) / 1000;
  return rounded.toString();
}
