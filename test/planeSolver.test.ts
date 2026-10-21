import { describe, it, expect } from 'vitest';
import { solvePlaneIntersection } from '../src/math/planeSolver.js';
import { dot3 } from '../src/math/vectors.js';

describe('Plane Intersection Solver', () => {
  it('solves orthogonal intersecting planes correctly (Preset 1)', () => {
    // x + y = 2 and x - y = 0
    const p1 = { a: 1, b: 1, c: 0, d: 2 };
    const p2 = { a: 1, b: -1, c: 0, d: 0 };

    const res = solvePlaneIntersection(p1, p2);

    expect(res.classification).toBe('INTERSECTING');
    expect(res.isIntersecting).toBe(true);
    expect(res.directionVector).toBeDefined();

    // Normal vectors: (1, 1, 0) and (1, -1, 0) -> cross is (0, 0, -2) (along Z)
    expect(res.directionVector![0]).toBeCloseTo(0);
    expect(res.directionVector![1]).toBeCloseTo(0);
    expect(Math.abs(res.directionVector![2])).toBeGreaterThan(0);

    // Particular point should satisfy both equations: x + y = 2 and x - y = 0 -> (1, 1, 0)
    expect(res.particularPoint).toBeDefined();
    expect(res.particularPoint![0]).toBeCloseTo(1);
    expect(res.particularPoint![1]).toBeCloseTo(1);
    expect(res.particularPoint![2]).toBeCloseTo(0);

    expect(res.verification?.plane1Valid).toBe(true);
    expect(res.verification?.plane2Valid).toBe(true);
  });

  it('solves oblique intersecting planes correctly (Preset 2)', () => {
    // 2x - y + z = 3 and x + 2y - z = 1
    const p1 = { a: 2, b: -1, c: 1, d: 3 };
    const p2 = { a: 1, b: 2, c: -1, d: 1 };

    const res = solvePlaneIntersection(p1, p2);

    expect(res.classification).toBe('INTERSECTING');
    expect(res.isIntersecting).toBe(true);
    expect(res.particularPoint).toBeDefined();
    expect(res.directionVector).toBeDefined();

    // Verify p0 satisfies both equations
    const p0 = res.particularPoint!;
    const val1 = dot3([p1.a, p1.b, p1.c], p0);
    const val2 = dot3([p2.a, p2.b, p2.c], p0);
    expect(val1).toBeCloseTo(p1.d, 3);
    expect(val2).toBeCloseTo(p2.d, 3);

    // Verify direction vector is perpendicular to both normals
    const d = res.directionVector!;
    expect(dot3([p1.a, p1.b, p1.c], d)).toBeCloseTo(0, 4);
    expect(dot3([p2.a, p2.b, p2.c], d)).toBeCloseTo(0, 4);
  });

  it('classifies parallel distinct planes correctly (Preset 3)', () => {
    // x + y + z = 3 and x + y + z = 6
    const p1 = { a: 1, b: 1, c: 1, d: 3 };
    const p2 = { a: 1, b: 1, c: 1, d: 6 };

    const res = solvePlaneIntersection(p1, p2);

    expect(res.classification).toBe('PARALLEL_DISTINCT');
    expect(res.isIntersecting).toBe(false);
    expect(res.directionVector).toBeUndefined();
    expect(res.particularPoint).toBeUndefined();
  });

  it('classifies coincident planes correctly (Preset 4)', () => {
    // x - 2y + z = 4 and 2x - 4y + 2z = 8
    const p1 = { a: 1, b: -2, c: 1, d: 4 };
    const p2 = { a: 2, b: -4, c: 2, d: 8 };

    const res = solvePlaneIntersection(p1, p2);

    expect(res.classification).toBe('COINCIDENT');
    expect(res.isIntersecting).toBe(false);
  });

  it('classifies coincident planes with negative proportional scaling', () => {
    // x - y + 2z = 3 and -2x + 2y - 4z = -6
    const p1 = { a: 1, b: -1, c: 2, d: 3 };
    const p2 = { a: -2, b: 2, c: -4, d: -6 };

    const res = solvePlaneIntersection(p1, p2);

    expect(res.classification).toBe('COINCIDENT');
    expect(res.isIntersecting).toBe(false);
  });

  it('detects degenerate equations with zero normal vectors', () => {
    const pInconsistent = { a: 0, b: 0, c: 0, d: 5 };
    const pTrivial = { a: 0, b: 0, c: 0, d: 0 };
    const pNormal = { a: 1, b: 1, c: 1, d: 2 };

    const res1 = solvePlaneIntersection(pInconsistent, pNormal);
    expect(res1.classification).toBe('DEGENERATE_EMPTY');

    const res2 = solvePlaneIntersection(pTrivial, pNormal);
    expect(res2.classification).toBe('DEGENERATE_ALL_SPACE');
  });

  it('identifies ill-conditioned near-parallel planes', () => {
    // Almost parallel: normal 1 is (1, 0, 0), normal 2 is (1, 0.000001, 0)
    const p1 = { a: 1, b: 0, c: 0, d: 1 };
    const p2 = { a: 1, b: 0.000005, c: 0, d: 1 };

    const res = solvePlaneIntersection(p1, p2);
    expect(res.classification).toBe('ILL_CONDITIONED_INTERSECTING');
    expect(res.isIntersecting).toBe(true);
  });
});
