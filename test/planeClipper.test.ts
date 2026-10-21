import { describe, it, expect } from 'vitest';
import { clipPlaneToCube, clipLineToCube } from '../src/math/planeClipper.js';
import { dot3 } from '../src/math/vectors.js';

describe('Plane & Line Cube Clipper', () => {
  it('clips coordinate plane z = 0 to a 4-vertex square', () => {
    // z = 0 in cube [-10, 10]^3
    const plane = { a: 0, b: 0, c: 1, d: 0 };
    const poly = clipPlaneToCube(plane, 10);

    expect(poly).not.toBeNull();
    expect(poly!.vertices.length).toBe(4);

    // All vertices must have z = 0 and lie on the boundary [-10, 10]
    for (const v of poly!.vertices) {
      expect(v[2]).toBeCloseTo(0);
      expect(Math.abs(v[0])).toBeCloseTo(10);
      expect(Math.abs(v[1])).toBeCloseTo(10);
    }

    // Triangle fan indices: length should be (4 - 2) * 3 = 6
    expect(poly!.indices.length).toBe(6);
  });

  it('clips diagonal plane x + y + z = 0 into a 6-vertex hexagon', () => {
    const plane = { a: 1, b: 1, c: 1, d: 0 };
    const poly = clipPlaneToCube(plane, 10);

    expect(poly).not.toBeNull();
    expect(poly!.vertices.length).toBe(6);

    for (const v of poly!.vertices) {
      // Must satisfy x + y + z = 0
      expect(dot3([1, 1, 1], v)).toBeCloseTo(0);
      // Coordinates inside [-10, 10]
      expect(Math.abs(v[0])).toBeLessThanOrEqual(10.001);
      expect(Math.abs(v[1])).toBeLessThanOrEqual(10.001);
      expect(Math.abs(v[2])).toBeLessThanOrEqual(10.001);
    }
  });

  it('returns null for plane outside the cube (e.g. z = 50)', () => {
    const plane = { a: 0, b: 0, c: 1, d: 50 };
    const poly = clipPlaneToCube(plane, 10);
    expect(poly).toBeNull();
  });

  it('clips a 3D line passing through the cube', () => {
    // Line passing through origin along X: r(t) = (0, 0, 0) + t(1, 0, 0)
    const p0 = [0, 0, 0] as [number, number, number];
    const d = [1, 0, 0] as [number, number, number];

    const seg = clipLineToCube(p0, d, 10);
    expect(seg).not.toBeNull();
    expect(seg![0]).toEqual([-10, 0, 0]);
    expect(seg![1]).toEqual([10, 0, 0]);
  });

  it('returns null for line outside the cube', () => {
    // Line at y = 50 along X
    const p0 = [0, 50, 0] as [number, number, number];
    const d = [1, 0, 0] as [number, number, number];

    const seg = clipLineToCube(p0, d, 10);
    expect(seg).toBeNull();
  });
});
