import { describe, it, expect } from 'vitest';
import { solveLinearSystem2D } from '../src/math/linearSolver2D.js';

describe('2D Linear System Solver', () => {
  it('solves standard intersecting lines correctly', () => {
    // 2x + y = 4 and x - y = -1 -> x = 1, y = 2
    const l1 = { a: 2, b: 1, c: 4 };
    const l2 = { a: 1, b: -1, c: -1 };

    const res = solveLinearSystem2D(l1, l2);
    expect(res.classification).toBe('UNIQUE_INTERSECTION');
    expect(res.intersectionPoint).toBeDefined();
    expect(res.intersectionPoint![0]).toBeCloseTo(1);
    expect(res.intersectionPoint![1]).toBeCloseTo(2);
  });

  it('classifies parallel distinct lines', () => {
    // x + 2y = 4 and x + 2y = 8
    const l1 = { a: 1, b: 2, c: 4 };
    const l2 = { a: 1, b: 2, c: 8 };

    const res = solveLinearSystem2D(l1, l2);
    expect(res.classification).toBe('PARALLEL_DISTINCT');
    expect(res.intersectionPoint).toBeUndefined();
  });

  it('classifies coincident lines', () => {
    // 2x + 4y = 6 and x + 2y = 3
    const l1 = { a: 2, b: 4, c: 6 };
    const l2 = { a: 1, b: 2, c: 3 };

    const res = solveLinearSystem2D(l1, l2);
    expect(res.classification).toBe('COINCIDENT');
    expect(res.intersectionPoint).toBeUndefined();
  });

  it('detects degenerate equations with zero coefficients', () => {
    const l1 = { a: 0, b: 0, c: 4 };
    const l2 = { a: 1, b: 1, c: 2 };

    const res = solveLinearSystem2D(l1, l2);
    expect(res.classification).toBe('DEGENERATE');
  });
});
