export type Vector3 = [number, number, number];
export type Vector2 = [number, number];

export interface PlaneEquation {
  a: number;
  b: number;
  c: number;
  d: number;
}

export type PlaneClassification =
  | 'INTERSECTING'
  | 'ILL_CONDITIONED_INTERSECTING'
  | 'PARALLEL_DISTINCT'
  | 'COINCIDENT'
  | 'DEGENERATE_EMPTY'
  | 'DEGENERATE_ALL_SPACE';

export interface PlaneIntersectionResult {
  classification: PlaneClassification;
  isIntersecting: boolean;
  n1: Vector3;
  n2: Vector3;
  norm1: number;
  norm2: number;
  normalizedCrossMagnitude: number; // ||n1 x n2|| / (||n1|| * ||n2||)
  directionVector?: Vector3;
  particularPoint?: Vector3;
  parametricEquationLatex?: string;
  verification?: {
    plane1Sub: string;
    plane2Sub: string;
    plane1Valid: boolean;
    plane2Valid: boolean;
  };
  explanation: string;
  derivationStepsLatex: string[];
}

export interface LineEquation2D {
  a: number;
  b: number;
  c: number; // ax + by = c
}

export type Line2DClassification =
  | 'UNIQUE_INTERSECTION'
  | 'PARALLEL_DISTINCT'
  | 'COINCIDENT'
  | 'DEGENERATE';

export interface LinearSystem2DResult {
  classification: Line2DClassification;
  determinant: number;
  normalizedDeterminant: number;
  intersectionPoint?: Vector2;
  explanation: string;
  stepsLatex: string[];
}
