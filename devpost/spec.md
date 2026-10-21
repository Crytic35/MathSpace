---
doc: spec
status: approved
---

# MathSpace — Technical Spec

## How This Works, In Plain Language

MathSpace is an in-browser mathematical instrument built with **Vite, TypeScript, Three.js, KaTeX, and HTML5 Canvas2D**. It has four cleanly separated layers:

1. **The Mathematical Engine (`src/math/`):** A pure, deterministic TypeScript library with zero DOM or rendering dependencies. It takes numerical coefficients, computes vector and matrix operations, classifies geometric configurations using scale-aware tolerances, derives exact intersection parameters, and verifies solutions algebraically.
2. **The State Store (`src/state/`):** A lightweight, typed observable store that holds the current mathematical inputs, active preset, visualization visibility toggles, and user preferences (such as dark/light theme). Components subscribe to specific state slices.
3. **The Viewports (`src/viewport/`):**
   - **3D Viewport (`src/viewport/viewport3d.ts`):** Renders the bounded coordinate volume $[-10, 10]^3$ using Three.js. It clips infinite planes to convex polygon meshes within the cube, renders the intersection line and vectors, and manages camera views (Isometric, Top, Front, Side, Reset) with OrbitControls.
   - **2D Viewport (`src/viewport/viewport2d.ts`):** Renders the $2 \times 2$ linear system onto an HTML5 Canvas with auto-scaled coordinate grid, axes, lines, and highlighted intersection point.
4. **The User Interface (`src/ui/`):** Responsive HTML/CSS panels for coefficient entry, sliders, preset selection, camera toolbars, and KaTeX-rendered mathematical derivations.

Calculations, 3D geometry updates, and KaTeX typography re-renders are decoupled so slider interaction stays fluid at 60 FPS without layout thrashing.

---

## The Core Journey Through the System

Traces `prd.md > The Core Journey`:

1. **Initialization:**
   - `main.ts` initializes `AppStore` with default state (**Orthogonal Intersecting Planes** preset).
   - `Viewport3D` mounts to `#viewport-3d-container`, builds the static coordinate grid $[-10, 10]^3$, and initializes `OrbitControls`.
   - `DerivationPanel` and `ControlPanel` render into their respective containers.
   - Initial state triggers `MathEngine.solvePlaneIntersection(plane1, plane2)`.
   - The result is dispatched to `Viewport3D` (which computes clipped polygons and line geometry) and `DerivationPanel` (which formats steps in KaTeX).

2. **Parameter Adjustment (Slider or Text Input):**
   - User moves a slider $\rightarrow$ `ControlPanel` emits `updatePlaneCoefficients(planeId, values)`.
   - `AppStore` updates without cloning unrelated state.
   - `MathEngine` recomputes the analytical solution in $<1\text{ms}$.
   - `Viewport3D` updates the existing plane mesh vertices directly (or rebuilds the polygon buffer) without recreating materials or scene lights.
   - `DerivationPanel` updates LaTeX expressions synchronously using KaTeX.

3. **Singularity Handling (Parallel / Coincident / Degenerate):**
   - User loads Parallel or Coincident preset $\rightarrow$ `MathEngine` detects normalized cross product $\sigma \le 10^{-7}$.
   - `MathEngine` evaluates normalized signed distances $\delta_1, \delta_2$.
   - `Viewport3D` unmounts the intersection line mesh while maintaining plane rendering.
   - `DerivationPanel` renders an explanation badge and mathematical reasoning.

4. **2D Mode Toggle:**
   - User toggles mode $\rightarrow$ `AppStore` sets `viewMode = '2D'`.
   - UI hides 3D container, shows Canvas2D container, and triggers `Viewport2D.render()`.

---

## Stack

- **Language & Runtime:** TypeScript 5.x / Modern Browser ES Modules.
  - *Doc:* [TypeScript Documentation](https://www.typescriptlang.org/docs/)
  - *Rationale:* Ensures compile-time type safety across mathematical vectors, matrix operations, and component interfaces.
- **Build Tool:** Vite 6.x.
  - *Doc:* [Vite Documentation](https://vitejs.dev/)
  - *Rationale:* Sub-second cold starts, fast HMR, and zero-config bundling.
- **3D Graphics:** Three.js (r170+) with `OrbitControls`.
  - *Doc:* [Three.js Documentation](https://threejs.org/docs/)
  - *Rationale:* Robust WebGL abstractions, efficient geometry buffers, and proven camera manipulation.
- **2D Graphics:** Native HTML5 Canvas2D Context.
  - *Doc:* [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
  - *Rationale:* Native browser API with zero overhead for crisp 2D line and point rendering.
- **Math Typesetting:** KaTeX 0.16+.
  - *Doc:* [KaTeX Documentation](https://katex.org/docs/)
  - *Rationale:* Ultra-fast synchronous client-side rendering with zero network latency.
- **Unit Testing:** Vitest 2.x.
  - *Doc:* [Vitest Documentation](https://vitest.dev/)
  - *Rationale:* Native Vite test runner with instant execution for mathematical unit test suites.

---

## Where It Runs and How Someone Tries It

- **Runtime:** Any modern desktop or mobile browser with WebGL support (Chrome, Firefox, Safari, Edge).
- **Local Dev Server:**
  ```bash
  npm install
  npm run dev
  ```
  Open `http://localhost:5173` in the browser.
- **Running Tests:**
  ```bash
  npm run test
  ```
- **Demo Recording:** Local browser recording of `http://localhost:5173` executing the 1–3 minute demo flow specified in `prd.md > The Core Journey`.

---

## Look and Feel

Implements `prd.md > Look and Feel`:

- **CSS Design Tokens (`src/ui/styles/tokens.css`):**
  - `--bg-workspace-dark`: `#0F172A` (Slate 900)
  - `--bg-panel-dark`: `#1E293B` (Slate 800)
  - `--border-dark`: `#334155` (Slate 700)
  - `--plane1-color`: `#22D3EE` (Cyan 400)
  - `--plane2-color`: `#F59E0B` (Amber 500)
  - `--line-intersection`: `#FDE047` (Gold/Yellow 300)
  - `--text-primary-dark`: `#F8FAFC` (Slate 50)
  - `--text-secondary-dark`: `#94A3B8` (Slate 400)
  - `--bg-workspace-light`: `#F8FAFC`
  - `--bg-panel-light`: `#FFFFFF`
  - `--border-light`: `#E2E8F0`
- **Typography:** System sans-serif stack (`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) for UI labels; Computer Modern / KaTeX fonts for equations.

---

## Components

### 1. Mathematical Engine (`src/math/`)
Implements `prd.md > Features and Behavior > 1 & 2`.
- **`types.ts`:** Type definitions for `Vector3`, `Vector2`, `PlaneEquation`, `IntersectionResult`, `LineEquation2D`, `LinearSystem2DResult`.
- **`vectors.ts`:** Pure vector functions: `dot3`, `cross3`, `norm3`, `normalize3`, `add3`, `sub3`, `scale3`, `distance3`.
- **`planeSolver.ts`:**
  - `classifyPlanes(p1: PlaneEquation, p2: PlaneEquation): PlaneClassification`
  - Scale-aware tolerance: $\sigma = \frac{\|\mathbf{n}_1 \times \mathbf{n}_2\|}{\|\mathbf{n}_1\| \|\mathbf{n}_2\|}$.
  - Thresholds:
    - $\sigma > 10^{-5}$: `INTERSECTING`
    - $10^{-7} < \sigma \le 10^{-5}$: `ILL_CONDITIONED_INTERSECTING`
    - $\sigma \le 10^{-7}$: Parallel or Coincident.
  - Coincidence test: Compares normalized equations $\hat{\mathbf{n}}_i = \frac{\mathbf{n}_i}{\|\mathbf{n}_i\|}$ and signed distances $\delta_i = \frac{d_i}{\|\mathbf{n}_i\|}$. If $\hat{\mathbf{n}}_1 \approx \pm \hat{\mathbf{n}}_2$ and $|\delta_1 \mp \delta_2| \le 10^{-6}$, returns `COINCIDENT`. Otherwise `PARALLEL_DISTINCT`.
  - Point selection: Evaluates $D_{xy} = a_1b_2 - a_2b_1$, $D_{xz} = a_1c_2 - a_2c_1$, $D_{yz} = b_1c_2 - b_2c_1$. Sets the coordinate corresponding to the maximum $|D|$ to $0$ and solves the remaining well-conditioned $2 \times 2$ system.
- **`planeClipper.ts`:**
  - Implements bounded plane-cube polygon clipping for $[-10, 10]^3$.
  - Intersects plane $ax + by + cz = d$ against the 12 box edges $[-B, B]^3$.
  - Deduplicates intersection points within $\epsilon = 10^{-6}$.
  - Rejects degenerate polygons ($< 3$ unique vertices).
  - Sorts vertices angularly around the normal vector to ensure counter-clockwise convex winding.
  - Generates triangle fan index buffer for Three.js `BufferGeometry`.
- **`linearSolver2D.ts`:**
  - Implements `prd.md > Features and Behavior > 6`.
  - Solves $2 \times 2$ systems using normalized determinant $\sigma_{2D} = \frac{|a_1b_2 - a_2b_1|}{\|\mathbf{n}_1\| \|\mathbf{n}_2\|}$.
  - Generates step-by-step Gaussian/Cramer elimination steps.

### 2. Viewport Layer (`src/viewport/`)
Implements `prd.md > Features and Behavior > 3`.
- **`viewport3d.ts`:**
  - Manages Three.js `WebGLRenderer`, `PerspectiveCamera`, `Scene`, and `OrbitControls`.
  - Renders coordinate bounding box $[-10, 10]^3$ with grid lines and labeled axes ($X$ Red, $Y$ Green, $Z$ Blue).
  - Updates plane meshes using double-sided translucent `MeshStandardMaterial` with `transparent: true, opacity: 0.5, depthWrite: false`.
  - Renders intersection line as an illuminated thick cylindrical tube or high-contrast line.
  - Implements camera presets: `setCameraPreset('isometric' | 'top' | 'front' | 'side' | 'reset')`.
- **`viewport2d.ts`:**
  - Manages HTML5 2D Canvas rendering for $a_1x + b_1y = c_1$ and $a_2x + b_2y = c_2$.
  - Draws centered Cartesian grid, axis ticks, colored lines, and intersection dot.

### 3. State Store (`src/state/`)
Implements `prd.md > States and Boundaries`.
- **`store.ts`:**
  - Lightweight observable store with subscription mechanism.
  - State interface:
    ```typescript
    interface AppState {
      viewMode: '3D' | '2D';
      theme: 'dark' | 'light';
      plane1: { a: number; b: number; c: number; d: number; visible: boolean; valid: boolean };
      plane2: { a: number; b: number; c: number; d: number; visible: boolean; valid: boolean };
      line2d_1: { a: number; b: number; c: number };
      line2d_2: { a: number; b: number; c: number };
      activePreset: string | null;
      showNormals: boolean;
      showIntersection: boolean;
    }
    ```
  - State changes notify only subscribed components.

### 4. User Interface Layer (`src/ui/`)
Implements `prd.md > Screens and Layout`.
- **`controlPanel.ts`:** Renders equation cards, coefficient inputs, synchronized sliders, visibility checkboxes, and preset dropdown. Manages out-of-range indicators when input values exceed $[-10, 10]$.
- **`derivationPanel.ts`:** Formats and renders KaTeX mathematical expressions, step-by-step vector derivations, verification identities, and singularity badges.
- **`cameraToolbar.ts`:** Renders compact camera navigation buttons overlaid on the 3D viewport.
- **`themeManager.ts`:** Toggles dark/light theme, updates CSS classes, and synchronizes Three.js scene background color without camera disruption.

---

## Data Model

```
User Input (Coefficients)
       │
       ▼
┌──────────────────┐
│    AppStore      │◄── Preset Selection
└────────┬─────────┘
         │
         ├───► MathEngine (pure calculation)
         │        ├── PlaneClassification
         │        ├── DirectionVector & ParticularPoint
         │        ├── ParametricEquation & Verification
         │        └── PolygonVertices (clipped to [-10, 10]^3)
         │
         ├───► Viewport3D / Viewport2D (WebGL / Canvas)
         │        └── Updates vertex buffers & line meshes
         │
         └───► DerivationPanel (KaTeX DOM)
                  └── Formats step-by-step derivation in LaTeX
```

---

## File Structure

```
BuildWithAI/
├── index.html                   # Single-page application entry point
├── package.json                 # Dependencies and build scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration with Vitest setup
├── devpost/                     # Devpost hackathon planning workspace
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
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
│       ├── themeManager.ts      # Dark/light theme state and styling
│       └── styles/
│           ├── tokens.css       # Color palettes, typography, spacing variables
│           └── layout.css       # Responsive three-panel grid and component styles
└── test/                        # Vitest test suite
    ├── vectors.test.ts          # Unit tests for vector math
    ├── planeSolver.test.ts      # Unit tests for plane classification & derivation
    ├── planeClipper.test.ts     # Unit tests for cube-edge plane clipping & edge cases
    └── linearSolver2D.test.ts   # Unit tests for 2D linear systems
```

---

## External Services and Dependencies

- **`three` (v0.170+)**: WebGL 3D rendering engine. No external network requests; bundled locally.
- **`katex` (v0.16+)**: Fast LaTeX equation typesetting. CSS and web fonts bundled via npm.
- **`vitest` (v2.x)**: Development dependency for unit and integration testing.
- *Zero external API keys, databases, or cloud services required.* The application runs completely client-side in the browser.

---

## Important Failure Modes

1. **Ill-Conditioned Near-Parallel Planes ($\sigma \approx 10^{-6}$):**
   - *Risk:* Cross product magnitude is tiny; minor determinants are near zero, causing numerical explosion in point calculation.
   - *Fallback:* Flagged as `ILL_CONDITIONED_INTERSECTING`. Derivation panel warns the user that the planes are nearly parallel and numerical coordinates are highly sensitive to small perturbations.
2. **Degenerate Equation ($a=b=c=0$):**
   - *Risk:* Zero normal vector cannot define a plane.
   - *Fallback:* `MathEngine` detects $\|\mathbf{n}\| = 0$, marks equation invalid, clears the affected plane mesh and the intersection line, and explains the degenerate condition without removing the companion valid plane.
3. **Plane Outside Bounded Volume (e.g. $z = 50$ with volume $[-10, 10]^3$):**
   - *Risk:* Plane does not intersect the bounding box; clipping produces 0 vertices.
   - *Fallback:* `planeClipper` safely returns an empty polygon; `Viewport3D` omits the mesh without throwing an error, while the derivation panel continues to display the valid algebraic solution and indicates the plane lies outside the visible viewport.

---

## What Was Simplified and Why

- **Cube Edge Clipping instead of General CSG:**
  - *Choice:* Calculating edge intersections with the 12 box segments $[-10, 10]^3$ rather than using a complex constructive solid geometry (CSG) library.
  - *Why:* CSG libraries in JavaScript are heavy, computationally expensive, and prone to precision artifacts. Edge intersection is lightweight, exact for convex boxes, and executes in $< 0.1\text{ms}$.
- **Analytical Minor-Determinant Point Selection instead of Full SVD:**
  - *Choice:* Evaluating the three $2 \times 2$ determinants and solving with Cramer's rule.
  - *Why:* SVD (Singular Value Decomposition) requires substantial numerical code. Selecting the maximum $2 \times 2$ minor determinant is analytically transparent, easy to verify, and well-conditioned for any non-parallel plane pair.

---

## Decisions and Open Issues

- **Coordinate System Mapping:**
  - In standard Three.js, $Y$ is vertical (up), $X$ is horizontal (right), and $Z$ is forward (depth).
  - In standard multivariable mathematics, $Z$ is vertical (up), $X$ is depth/forward, and $Y$ is horizontal.
  - *Agreed Decision:* `Viewport3D` aligns the 3D scene so that the mathematical $Z$-axis points upward (`camera.up.set(0, 0, 1)` or a rotated coordinate container). This guarantees that mathematical equations match user spatial intuition directly.
- **Technical Uncertainty Clarified:**
  - The plane-cube clipping algorithm deduplicates vertices within $10^{-6}$ tolerance, correctly handles planes passing through cube vertices or edges, sorts vertices angularly around the normal vector, and rejects any polygon with fewer than 3 vertices. This behavior is covered by dedicated unit tests in `test/planeClipper.test.ts`.

---

## Acceptance Criteria for the Build

- [ ] `npm run dev` starts the application without build or runtime errors.
- [ ] `npm run test` passes all unit tests for vector operations, plane classification, clipping, and 2D solving.
- [ ] Orthogonal, Oblique, Parallel Distinct, and Coincident presets render expected 3D geometry and KaTeX derivations.
- [ ] Camera toolbar buttons (Isometric, Top, Front, Side, Reset) correctly reposition the Three.js camera.
- [ ] Dragging coefficient sliders updates 3D geometry and KaTeX derivations smoothly without UI freezing.
- [ ] Invalid inputs (letters, zero normals) show inline error badges, remove dependent geometry, and preserve any valid companion plane.
- [ ] 2D linear-system mode correctly plots lines, calculates intersections, and displays algebraic elimination steps.
- [ ] Dark and Light themes toggle cleanly and persist across page reloads.
