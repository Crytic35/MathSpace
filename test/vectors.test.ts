import { describe, it, expect } from 'vitest';
import {
  dot3,
  cross3,
  norm3,
  normalize3,
  vectorsApproxEqual3
} from '../src/math/vectors.js';

describe('Vector Mathematics', () => {
  it('computes dot product correctly in 3D', () => {
    expect(dot3([1, 2, 3], [4, -5, 6])).toBe(1 * 4 + 2 * -5 + 3 * 6); // 4 - 10 + 18 = 12
    expect(dot3([1, 0, 0], [0, 1, 0])).toBe(0); // Orthogonal vectors
  });

  it('computes cross product correctly in 3D', () => {
    const i = [1, 0, 0] as [number, number, number];
    const j = [0, 1, 0] as [number, number, number];
    const k = cross3(i, j);
    expect(k).toEqual([0, 0, 1]);

    const crossSelf = cross3(i, i);
    expect(crossSelf).toEqual([0, 0, 0]);
  });

  it('computes vector norms and normalizes vectors', () => {
    expect(norm3([3, 4, 0])).toBe(5);
    const unit = normalize3([0, 0, 10]);
    expect(unit).toEqual([0, 0, 1]);
    expect(norm3(unit)).toBeCloseTo(1);
  });

  it('handles near-zero vectors gracefully during normalization', () => {
    const zero = normalize3([0, 0, 0]);
    expect(zero).toEqual([0, 0, 0]);
  });

  it('evaluates vector approximate equality correctly', () => {
    expect(vectorsApproxEqual3([1, 2, 3], [1.00000001, 2, 2.99999999], 1e-6)).toBe(true);
    expect(vectorsApproxEqual3([1, 2, 3], [1.1, 2, 3])).toBe(false);
  });
});
