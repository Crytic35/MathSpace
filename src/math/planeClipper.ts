import { PlaneEquation, Vector3 } from './types.js';
import {
  cross3,
  dot3,
  norm3,
  normalize3,
  distance3,
  scale3,
  add3
} from './vectors.js';

export interface ClippedPolygon {
  vertices: Vector3[];
  indices: number[]; // Triangle fan indices for WebGL
}

export function clipPlaneToCube(
  plane: PlaneEquation,
  bound = 10
): ClippedPolygon | null {
  const { a, b, c, d } = plane;
  const n: Vector3 = [a, b, c];
  const nNorm = norm3(n);
  if (nNorm < 1e-9) {
    return null;
  }

  const B = bound;

  // The 12 edges of the cube [-B, B]^3
  const edges: [Vector3, Vector3][] = [
    // 4 edges parallel to X
    [[-B, -B, -B], [B, -B, -B]],
    [[-B, B, -B], [B, B, -B]],
    [[-B, -B, B], [B, -B, B]],
    [[-B, B, B], [B, B, B]],

    // 4 edges parallel to Y
    [[-B, -B, -B], [-B, B, -B]],
    [[B, -B, -B], [B, B, -B]],
    [[-B, -B, B], [-B, B, B]],
    [[B, -B, B], [B, B, B]],

    // 4 edges parallel to Z
    [[-B, -B, -B], [-B, -B, B]],
    [[B, -B, -B], [B, -B, B]],
    [[-B, B, -B], [-B, B, B]],
    [[B, B, -B], [B, B, B]]
  ];

  const candidatePoints: Vector3[] = [];

  for (const [p1, p2] of edges) {
    const f1 = a * p1[0] + b * p1[1] + c * p1[2] - d;
    const f2 = a * p2[0] + b * p2[1] + c * p2[2] - d;

    const denom = f2 - f1;
    if (Math.abs(denom) > 1e-9) {
      const t = -f1 / denom;
      if (t >= -1e-6 && t <= 1 + 1e-6) {
        const clampedT = Math.max(0, Math.min(1, t));
        const pt: Vector3 = [
          p1[0] + clampedT * (p2[0] - p1[0]),
          p1[1] + clampedT * (p2[1] - p1[1]),
          p1[2] + clampedT * (p2[2] - p1[2])
        ];

        // Deduplicate
        let isDuplicate = false;
        for (const existing of candidatePoints) {
          if (distance3(pt, existing) < 1e-4) {
            isDuplicate = true;
            break;
          }
        }

        if (!isDuplicate) {
          candidatePoints.push(pt);
        }
      }
    }
  }

  // Reject degenerate polygons with fewer than 3 vertices
  if (candidatePoints.length < 3) {
    return null;
  }

  // Compute centroid
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const pt of candidatePoints) {
    cx += pt[0];
    cy += pt[1];
    cz += pt[2];
  }
  const centroid: Vector3 = [
    cx / candidatePoints.length,
    cy / candidatePoints.length,
    cz / candidatePoints.length
  ];

  // In-plane orthogonal coordinate frame (u, w) relative to normal
  const normal = normalize3(n);
  const tempVec: Vector3 = Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const proj = dot3(tempVec, normal);
  const u = normalize3([
    tempVec[0] - proj * normal[0],
    tempVec[1] - proj * normal[1],
    tempVec[2] - proj * normal[2]
  ]);
  const w = cross3(normal, u);

  // Sort angularly around centroid
  const sortedPoints = candidatePoints
    .map((pt) => {
      const rx = pt[0] - centroid[0];
      const ry = pt[1] - centroid[1];
      const rz = pt[2] - centroid[2];
      const r: Vector3 = [rx, ry, rz];
      const uCoord = dot3(r, u);
      const wCoord = dot3(r, w);
      const angle = Math.atan2(wCoord, uCoord);
      return { pt, angle };
    })
    .sort((a, b) => a.angle - b.angle)
    .map((item) => item.pt);

  // Generate triangle fan indices: (0, 1, 2), (0, 2, 3), (0, 3, 4), ...
  const indices: number[] = [];
  for (let i = 1; i < sortedPoints.length - 1; i++) {
    indices.push(0, i, i + 1);
  }

  return {
    vertices: sortedPoints,
    indices
  };
}

export function clipLineToCube(
  p0: Vector3,
  d: Vector3,
  bound = 10
): [Vector3, Vector3] | null {
  const dNorm = norm3(d);
  if (dNorm < 1e-9) {
    return null;
  }

  let tMin = -Infinity;
  let tMax = Infinity;

  // Slab clipping for axes X, Y, Z
  for (let i = 0; i < 3; i++) {
    const origin = p0[i];
    const dir = d[i];

    if (Math.abs(dir) < 1e-9) {
      if (origin < -bound || origin > bound) {
        return null; // Line is outside slab and parallel
      }
    } else {
      let t1 = (-bound - origin) / dir;
      let t2 = (bound - origin) / dir;

      if (t1 > t2) {
        const temp = t1;
        t1 = t2;
        t2 = temp;
      }

      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);

      if (tMin > tMax) {
        return null; // No intersection with cube
      }
    }
  }

  const pStart = add3(p0, scale3(d, tMin));
  const pEnd = add3(p0, scale3(d, tMax));

  return [pStart, pEnd];
}
