import { LineEquation2D, Vector2 } from '../math/types.js';
import { solveLinearSystem2D } from '../math/linearSolver2D.js';

export class Viewport2D {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentTheme: 'dark' | 'light' = 'dark';
  private bound = 10;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    window.addEventListener('resize', () => this.resizeAndDraw());
    this.resizeAndDraw();
  }

  public render(l1: LineEquation2D, l2: LineEquation2D, theme: 'dark' | 'light') {
    this.currentTheme = theme;
    this.drawScene(l1, l2);
  }

  private resizeAndDraw() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  private drawScene(l1: LineEquation2D, l2: LineEquation2D) {
    const w = parseFloat(this.canvas.style.width) || this.canvas.width;
    const h = parseFloat(this.canvas.style.height) || this.canvas.height;
    if (w <= 0 || h <= 0) return;

    const ctx = this.ctx;
    const isDark = this.currentTheme === 'dark';

    // Background
    ctx.fillStyle = isDark ? '#0F172A' : '#F8FAFC';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / (this.bound * 2.2);

    // Coordinate transforms: world -> screen
    const toScreenX = (x: number) => cx + x * scale;
    const toScreenY = (y: number) => cy - y * scale;

    // Draw Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? '#1E293B' : '#E2E8F0';

    for (let x = -this.bound; x <= this.bound; x += 2) {
      if (x === 0) continue;
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
      ctx.stroke();
    }
    for (let y = -this.bound; y <= this.bound; y += 2) {
      if (y === 0) continue;
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
      ctx.stroke();
    }

    // Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark ? '#475569' : '#94A3B8';

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // Ticks & Labels
    ctx.fillStyle = isDark ? '#64748B' : '#94A3B8';
    ctx.font = '10px var(--font-sans)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = -this.bound; x <= this.bound; x += 2) {
      if (x === 0) continue;
      ctx.fillText(x.toString(), toScreenX(x), cy + 4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = -this.bound; y <= this.bound; y += 2) {
      if (y === 0) continue;
      ctx.fillText(y.toString(), cx - 6, toScreenY(y));
    }

    // Solve for lines
    const result = solveLinearSystem2D(l1, l2);

    // Draw Line 1 (Cyan)
    this.drawLine(l1, isDark ? '#22D3EE' : '#0891B2', toScreenX, toScreenY);

    // Draw Line 2 (Amber)
    this.drawLine(l2, isDark ? '#F59E0B' : '#D97706', toScreenX, toScreenY);

    // Draw Intersection Point if exists
    if (result.classification === 'UNIQUE_INTERSECTION' && result.intersectionPoint) {
      const [ix, iy] = result.intersectionPoint;
      const sx = toScreenX(ix);
      const sy = toScreenY(iy);

      // Outer Glow
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(253, 224, 71, 0.3)' : 'rgba(180, 83, 9, 0.2)';
      ctx.fill();

      // Point Dot
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#FDE047' : '#B45309';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = isDark ? '#F8FAFC' : '#0F172A';
      ctx.font = '600 12px var(--font-mono)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(` (${round(ix, 2)}, ${round(iy, 2)})`, sx + 6, sy - 6);
    }
  }

  private drawLine(
    line: LineEquation2D,
    color: string,
    toScreenX: (x: number) => number,
    toScreenY: (y: number) => number
  ) {
    const { a, b, c } = line;
    const ctx = this.ctx;
    const B = this.bound * 2;

    const points: Vector2[] = [];

    // Intersect with box [-B, B] on X and Y
    if (Math.abs(b) > 1e-9) {
      // y = (c - a*x) / b
      const yLeft = (c - a * -B) / b;
      const yRight = (c - a * B) / b;
      points.push([-B, yLeft], [B, yRight]);
    } else if (Math.abs(a) > 1e-9) {
      // Vertical line x = c / a
      const x = c / a;
      points.push([x, -B], [x, B]);
    }

    if (points.length >= 2) {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(toScreenX(points[0][0]), toScreenY(points[0][1]));
      ctx.lineTo(toScreenX(points[1][0]), toScreenY(points[1][1]));
      ctx.stroke();
    }
  }
}

function round(n: number, decimals = 2): number {
  const p = Math.pow(10, decimals);
  return Math.round(n * p) / p;
}
