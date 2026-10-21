# MathSpace — Interactive 2D & 3D Analytical Geometry Workspace

An interactive mathematics visualizer and analytical geometry workspace that unifies equation definition, step-by-step mathematical derivation, and real-time 3D/2D visualization.

Built for the **Devpost Build With AI: Basics** hackathon following a disciplined plan-first engineering workflow.

---

## The Core Concept

MathSpace closes the gap between abstract vector algebra and spatial intuition:
**Define Mathematical Objects $\rightarrow$ Compute & Classify $\rightarrow$ Derive & Verify in KaTeX $\rightarrow$ Visualize in 3D/2D $\rightarrow$ Tweak Sliders Responsively.**

### Flagship Features

1. **3D Plane Intersection Engine:**
   - Define planes in Cartesian form ($a_1x + b_1y + c_1z = d_1$).
   - Interactive 3D WebGL viewport rendered with Three.js with full OrbitControls (rotate, pan, zoom).
   - Planes cleanly clipped to a bounded coordinate volume $[-10, 10]^3$ using cube-edge polygon intersection with convex angular winding.
   - Dynamic real-time coefficient sliders synchronized with direct numerical inputs.
   - Highlighted intersection line rendered with prominent line weight.
   - Quick camera viewpoints: Isometric, Top (XY), Front (XZ), Side (YZ), and Reset.

2. **Rigorous Singularity & Classification Handling:**
   - **Scale-Aware Tolerance:** Detects collinear normals via normalized cross product magnitude $\sigma = \frac{\|\mathbf{n}_1 \times \mathbf{n}_2\|}{\|\mathbf{n}_1\| \|\mathbf{n}_2\|}$.
   - **Normalized Distance Method:** Robustly classifies **Parallel Distinct** vs. **Coincident** planes using unit normals $\hat{\mathbf{n}}$ and distance offsets $\delta$ without dividing by zero.
   - **Improved Numerical Conditioning:** Evaluates all three $2 \times 2$ minor determinants and solves the particular point $\mathbf{p}_0$ using the largest absolute minor.
   - **Ill-Conditioned Near-Parallel Detection:** Warns users when planes are nearly parallel ($10^{-7} < \sigma \le 10^{-5}$) and sensitive to small perturbations.
   - **Degenerate Equation Handling:** Identifies zero-normal equations ($a=b=c=0$) and removes dependent geometry without collateral deletion of valid companion planes.

3. **Step-by-Step KaTeX Derivations & Verification:**
   - Direction vector calculation ($\mathbf{d} = \mathbf{n}_1 \times \mathbf{n}_2$).
   - Particular point derivation ($\mathbf{p}_0$).
   - Parametric line equation ($\mathbf{r}(t) = \mathbf{p}_0 + t\mathbf{d}$).
   - Algebraic verification showing substitution into both plane equations.

4. **2D Linear System Bridge:**
   - Interactive 2D coordinate canvas plotting two linear equations ($a_1x + b_1y = c_1$ and $a_2x + b_2y = c_2$).
   - Solves for unique intersection points using Cramer's rule / Gaussian elimination.
   - Renders step-by-step elimination in KaTeX.

5. **Curated Presets:**
   - **Orthogonal Intersecting Planes** ($x + y = 2$ and $x - y = 0$)
   - **Oblique Intersecting Planes** ($2x - y + z = 3$ and $x + 2y - z = 1$)
   - **Parallel Distinct Planes** ($x + y + z = 3$ and $x + y + z = 6$)
   - **Coincident Planes** ($x - 2y + z = 4$ and $2x - 4y + 2z = 8$)

6. **Theming:**
   - Default Dark Slate theme (`#0F172A`) and accessible Light theme.
   - Theme toggle persists across page reloads via `localStorage`.

---

## Project Structure

```
BuildWithAI/
├── index.html                   # Single-page application entry point
├── package.json                 # Dependencies and build scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── LICENSE                      # MIT Open Source License
├── devpost/                     # Devpost hackathon planning workspace
│   ├── scope.md                 # Approved project scope
│   ├── prd.md                   # Approved product requirements document
│   ├── spec.md                  # Approved technical specification
│   ├── checklist.md             # Verified build checklist
│   └── app-map.html             # Architecture reference & learning wrap-up
├── src/
│   ├── main.ts                  # Application bootstrap and layout mounting
│   ├── math/                    # Pure decoupled mathematical engine
│   │   ├── types.ts             # Mathematical vector & equation types
│   │   ├── vectors.ts           # 3D/2D vector operations
│   │   ├── planeSolver.ts       # Plane classification, cross product, point derivation
│   │   ├── planeClipper.ts      # Bounded cube [-10, 10]^3 polygon clipper
│   │   └── linearSolver2D.ts    # 2D linear system solver & steps
│   ├── state/
│   │   ├── store.ts             # Observable typed central state
│   │   └── presets.ts           # Curated 3D and 2D mathematical presets
│   ├── viewport/
│   │   ├── viewport3d.ts        # Three.js 3D scene, materials, lights, camera
│   │   └── viewport2d.ts        # HTML5 Canvas 2D linear system visualizer
│   └── ui/
│       ├── controlPanel.ts      # Coefficient inputs, sliders, toggles
│       ├── derivationPanel.ts   # KaTeX derivation, verification, and badges
│       ├── cameraToolbar.ts     # Viewport floating camera buttons
│       └── styles/
│           ├── tokens.css       # Color palettes, typography, spacing variables
│           └── layout.css       # Responsive three-panel grid and component styles
└── test/                        # Vitest unit test suite (21 tests)
    ├── vectors.test.ts          # Unit tests for vector math
    ├── planeSolver.test.ts      # Unit tests for plane classification & derivation
    ├── planeClipper.test.ts     # Unit tests for cube-edge plane clipping & edge cases
    └── linearSolver2D.test.ts   # Unit tests for 2D linear systems
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd BuildWithAI

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Tests

```bash
# Run the complete unit test suite (21 tests)
npm run test
```

### Building for Production

```bash
# Compile TypeScript and bundle production assets
npm run build
```

---

## Hackathon Submission Documents

All planning and architectural artifacts developed under the Devpost Learn Skill Pack are preserved:
- [`devpost/scope.md`](devpost/scope.md) — Initial concept, audience, and PoC boundary.
- [`devpost/prd.md`](devpost/prd.md) — Product requirements, user journey, and acceptance criteria.
- [`devpost/spec.md`](devpost/spec.md) — Technical blueprint, architecture, and tolerances.
- [`devpost/checklist.md`](devpost/checklist.md) — Slices, verification logs, and review checkpoints.
- [`devpost/app-map.html`](devpost/app-map.html) — Standalone architecture diagram and code tour.

---

## License

This project is licensed under the [MIT License](LICENSE).
