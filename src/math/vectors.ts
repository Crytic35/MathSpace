import { Vector3, Vector2 } from './types.js';

export const EPSILON = 1e-7;

export function dot3(u: Vector3, v: Vector3): number {
  return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

export function cross3(u: Vector3, v: Vector3): Vector3 {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0]
  ];
}

export function norm3(v: Vector3): number {
  return Math.sqrt(dot3(v, v));
}

export function normalize3(v: Vector3): Vector3 {
  const n = norm3(v);
  if (n < EPSILON) {
    return [0, 0, 0];
  }
  return [v[0] / n, v[1] / n, v[2] / n];
}

export function add3(u: Vector3, v: Vector3): Vector3 {
  return [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
}

export function sub3(u: Vector3, v: Vector3): Vector3 {
  return [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
}

export function scale3(v: Vector3, s: number): Vector3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

export function distance3(u: Vector3, v: Vector3): number {
  return norm3(sub3(u, v));
}

export function approxEqual(a: number, b: number, eps = EPSILON): boolean {
  return Math.abs(a - b) <= eps;
}

export function vectorsApproxEqual3(u: Vector3, v: Vector3, eps = EPSILON): boolean {
  return (
    approxEqual(u[0], v[0], eps) &&
    approxEqual(u[1], v[1], eps) &&
    approxEqual(u[2], v[2], eps)
  );
}

export function dot2(u: Vector2, v: Vector2): number {
  return u[0] * v[0] + u[1] * v[1];
}

export function norm2(v: Vector2): number {
  return Math.sqrt(dot2(v, v));
}
