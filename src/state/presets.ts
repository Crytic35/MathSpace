import { PlaneEquation, LineEquation2D } from '../math/types.js';

export interface MathematicalPreset {
  id: string;
  name: string;
  description: string;
  plane1: PlaneEquation;
  plane2: PlaneEquation;
  cameraView?: 'isometric' | 'top' | 'front' | 'side';
}

export const PRESETS_3D: MathematicalPreset[] = [
  {
    id: 'orthogonal',
    name: '1. Orthogonal Intersecting Planes',
    description: 'Two perpendicular planes (x + y = 2 and x - y = 0) with a vertical intersection line along the Z axis.',
    plane1: { a: 1, b: 1, c: 0, d: 2 },
    plane2: { a: 1, b: -1, c: 0, d: 0 },
    cameraView: 'isometric'
  },
  {
    id: 'oblique',
    name: '2. Oblique Intersecting Planes',
    description: 'Two oblique planes (2x - y + z = 3 and x + 2y - z = 1) intersecting along a general 3D spatial line.',
    plane1: { a: 2, b: -1, c: 1, d: 3 },
    plane2: { a: 1, b: 2, c: -1, d: 1 },
    cameraView: 'isometric'
  },
  {
    id: 'parallel',
    name: '3. Parallel Distinct Planes',
    description: 'Two planes with identical normal vectors but differing distance constants (x + y + z = 3 and x + y + z = 6). No intersection.',
    plane1: { a: 1, b: 1, c: 1, d: 3 },
    plane2: { a: 1, b: 1, c: 1, d: 6 },
    cameraView: 'isometric'
  },
  {
    id: 'coincident',
    name: '4. Coincident Planes',
    description: 'Two proportional plane equations describing the exact same geometric plane (x - 2y + z = 4 and 2x - 4y + 2z = 8). Infinite 2D solutions.',
    plane1: { a: 1, b: -2, c: 1, d: 4 },
    plane2: { a: 2, b: -4, c: 2, d: 8 },
    cameraView: 'isometric'
  }
];

export interface Preset2D {
  id: string;
  name: string;
  description: string;
  line1: LineEquation2D;
  line2: LineEquation2D;
}

export const PRESETS_2D: Preset2D[] = [
  {
    id: 'intersecting-2d',
    name: 'Unique Intersection',
    description: '2x + y = 4 and x - y = -1 intersecting at (1, 2)',
    line1: { a: 2, b: 1, c: 4 },
    line2: { a: 1, b: -1, c: -1 }
  },
  {
    id: 'parallel-2d',
    name: 'Parallel Distinct Lines',
    description: 'x + 2y = 4 and x + 2y = 8 (no solution)',
    line1: { a: 1, b: 2, c: 4 },
    line2: { a: 1, b: 2, c: 8 }
  },
  {
    id: 'coincident-2d',
    name: 'Coincident Lines',
    description: '2x + 4y = 6 and x + 2y = 3 (infinite solutions)',
    line1: { a: 2, b: 4, c: 6 },
    line2: { a: 1, b: 2, c: 3 }
  }
];
