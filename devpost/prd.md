---
doc: prd
status: approved
---

# MathSpace — Product Requirements

An interactive 2D and 3D analytical geometry workspace that unifies equation definition, step-by-step mathematical derivation, and real-time visualization for university students, engineers, and educators.
Source: `scope.md > Product Overview`, `scope.md > Target Users`.

## The Core Journey

1. **Arrival & Initial State:**
   - The user opens MathSpace in their browser.
   - The application immediately displays the workspace in the default **Dark Slate** theme with the **Orthogonal Intersecting Planes** preset loaded:
     - Plane 1: $x + y = 2$ (Cyan)
     - Plane 2: $x - y = 0$ (Amber)
   - The 3D viewport shows both planes intersecting within a bounded coordinate volume $[-10, 10]^3$ with a bright yellow intersection line and labeled axes ($X, Y, Z$).
   - The derivation panel displays the normal vectors $\mathbf{n}_1 = (1, 1, 0)$ and $\mathbf{n}_2 = (1, -1, 0)$, computes their cross product $\mathbf{d} = (0, 0, -2)$ (simplified/normalized for direction), identifies a particular point $\mathbf{p}_0 = (1, 1, 0)$, provides the parametric line equation $\mathbf{r}(t) = (1, 1, t)$, and verifies the solution against both plane equations.

2. **Interactive 3D Exploration:**
   - The user rotates, pans, and zooms the 3D viewport using mouse or touch controls.
   - The user clicks camera shortcut buttons (**Default Isometric**, **Top XY**, **Front XZ**, **Side YZ**, **Reset Camera**) to quickly inspect the geometry from standard viewpoints without disturbing the mathematical state.

3. **Dynamic Parameter Modification:**
   - The user drags a coefficient slider or edits a numerical input for Plane 1 or Plane 2.
   - As parameters change, the 3D plane mesh translates or rotates smoothly, the intersection line recalculates and shifts, and the derivation and verification steps update responsively.

4. **Singularity & Classification Inspection:**
   - The user loads the **Parallel Distinct Planes** preset ($x + y + z = 3$ and $x + y + z = 6$).
   - The intersection line disappears immediately from the 3D viewport.
   - The derivation panel explains that the unit normal vectors are parallel while their normalized distance offsets differ, concluding that the planes are parallel and distinct with no intersection.
   - The user loads the **Coincident Planes** preset ($x - 2y + z = 4$ and $2x - 4y + 2z = 8$). The panel explains that the equations represent the exact same geometric plane, resulting in an infinite two-dimensional solution set rather than a unique line.

5. **2D Linear-System Bridge Exploration:**
   - The user toggles to the **2D Linear System** view.
   - The workspace presents two linear equations ($a_1x + b_1y = c_1$ and $a_2x + b_2y = c_2$), a 2D coordinate grid with the two plotted lines, the highlighted intersection point, and step-by-step algebraic elimination solving for $(x, y)$.

6. **Theme Toggling:**
   - The user toggles between the Dark Slate theme and the Light theme at any time via a header control without resetting the scene, camera position, or inputs.

## Screens and Layout

MathSpace operates as a unified single-window responsive workspace:

- **Header:**
  - Product title: **MathSpace** with subtitle *"Interactive Analytical Geometry Workspace"*.
  - Mode Switcher: **3D Planes Mode** (flagship) / **2D Linear Systems Mode** (bridge).
  - Preset Selector dropdown.
  - Theme Toggle: Dark Slate / Light Mode.

- **Three-Panel Layout (Desktop & Tablet Landscape):**
  - **Left Panel (Equations & Controls, ~280–320px):**
    - Collapsible equation cards for Plane 1 and Plane 2.
    - Direct numerical inputs for coefficients $a, b, c, d$ ($ax + by + cz = d$).
    - Coefficient sliders for dynamic manipulation (default range $[-10, 10]$ with step $0.1$ or $0.5$).
    - Sliders sync with text inputs; manually entered values outside $[-10, 10]$ are preserved and never clamped silently.
    - Object visibility toggles: [x] Plane 1, [x] Plane 2, [x] Intersection Line, [ ] Normal Vectors.
  - **Center Panel (Interactive 3D Viewport, Flex-grow):**
    - High-performance WebGL canvas rendered via Three.js targeting smooth 60 FPS on standard desktop hardware.
    - Bounded coordinate volume $[-10, 10]^3$ with subtle reference grid and labeled axes ($X$ in red/slate, $Y$ in green/slate, $Z$ in blue/slate).
    - Floating camera toolbar: Isometric, Top (XY), Front (XZ), Side (YZ), Reset.
    - Plane meshes and intersection line cleanly clipped to the viewing volume.
  - **Right Panel (Derivation & Verification, ~320–360px):**
    - Geometric Classification badge (*Intersecting Line*, *Parallel Distinct*, *Coincident*, *Degenerate*, or *Ill-Conditioned*).
    - Step 1: Normal Vectors ($\mathbf{n}_1, \mathbf{n}_2$) with magnitude checks.
    - Step 2: Direction Vector ($\mathbf{d} = \mathbf{n}_1 \times \mathbf{n}_2$) with cross-product expansion.
    - Step 3: Particular Point ($\mathbf{p}_0$) derived using the largest $2 \times 2$ minor determinant for improved numerical conditioning.
    - Step 4: Parametric Line Equation ($\mathbf{r}(t) = \mathbf{p}_0 + t\mathbf{d}$).
    - Step 5: Algebraic Verification (substituting $\mathbf{r}(t)$ into Plane 1 and Plane 2 equations showing consistency).
    - Expandable/collapsible steps with formatted KaTeX equations.

- **Responsive Adaptations (Mobile & Small Screens):**
  - Side panels collapse into accessible drawer tabs ("Controls" and "Derivation") accessible via floating buttons, preserving the 3D viewport's visibility and touch controls.

## Look and Feel

- **Aesthetic:** High-precision scientific workbench; restrained, clean, and legible.
- **Color Palette (Dark Theme - Default):**
  - Workspace Background: `#0F172A` (Slate 900)
  - Panel Surfaces: `#1E293B` (Slate 800)
  - Borders & Dividers: `#334155` (Slate 700)
  - Plane 1 Mesh & Accents: `#22D3EE` (Cyan 400) with 0.5 opacity
  - Plane 2 Mesh & Accents: `#F59E0B` (Amber 500) with 0.5 opacity
  - Intersection Line: `#FDE047` (Bright Gold/Yellow) with prominent line weight
  - Primary Typography: `#F8FAFC` (Slate 50)
  - Secondary / Muted Text: `#94A3B8` (Slate 400)
  - Error / Warning Badge: `#EF4444` (Rose 500) / `#F59E0B` (Amber 500)
- **Color Palette (Light Theme):**
  - Workspace Background: `#F8FAFC` (Slate 50)
  - Panel Surfaces: `#FFFFFF` (Pure White)
  - Borders: `#E2E8F0` (Slate 200)
  - Plane 1: `#0891B2` (Cyan 600)
  - Plane 2: `#D97706` (Amber 600)
  - Intersection Line: `#B45309` (Deep Gold/Amber)
  - Primary Text: `#0F172A` (Slate 900)
- **Typography:**
  - UI Font: Clean modern sans-serif (Inter or system-ui).
  - Mathematical Expressions: KaTeX rendered with standard mathematical fonts (Computer Modern style).

## Features and Behavior

### 1. Plane Definition and Coefficient Controls
- **User Action:** Enters coefficients or drags sliders for Plane 1 ($a_1, b_1, c_1, d_1$) and Plane 2 ($a_2, b_2, c_2, d_2$).
- **Responsiveness:** Rendering targets smooth 60 FPS interaction in the 3D viewport, with mathematical derivations updating responsively without UI freezing.
- **Acceptance Criteria:**
  - [ ] Inputs accept positive, negative, and zero floating-point values.
  - [ ] Sliders update values smoothly with bidirectional sync between text fields and sliders.
  - [ ] When a coefficient is entered that exceeds the default slider range $[-10, 10]$ (e.g., $d = 25$), the input preserves the exact entered value, the slider displays an out-of-range indicator, and no silent clamping occurs.
  - [ ] Visibility toggles immediately hide/show corresponding 3D meshes without recalculating or losing mathematical state.

### 2. Geometric Classification & Derivation Engine
- **User Action:** Inspects the right panel for any pair of plane equations.
- **Mathematical Methodology:**
  - Normal vectors $\mathbf{n}_1 = (a_1, b_1, c_1)$ and $\mathbf{n}_2 = (a_2, b_2, c_2)$ are evaluated.
  - Direction vector $\mathbf{d} = \mathbf{n}_1 \times \mathbf{n}_2$.
  - Scale-aware parallel check: evaluates the normalized cross product $\sigma = \frac{\|\mathbf{n}_1 \times \mathbf{n}_2\|}{\|\mathbf{n}_1\| \|\mathbf{n}_2\|}$.
- **Acceptance Criteria:**
  - [ ] **Intersecting Line:** When $\sigma > 10^{-5}$, classifies as intersecting.
  - [ ] **Near-Parallel / Ill-Conditioned:** When $10^{-7} < \sigma \le 10^{-5}$, flags as *Ill-Conditioned / Near-Parallel* with an informative notice that small perturbations significantly displace the intersection line.
  - [ ] **Point Derivation & Conditioning:** To find a point $\mathbf{p}_0 = (x_0, y_0, z_0)$ on the line, the engine evaluates the three $2 \times 2$ minor determinants:
    $D_{xy} = a_1b_2 - a_2b_1$, $D_{xz} = a_1c_2 - a_2c_1$, and $D_{yz} = b_1c_2 - b_2c_1$.
    The variable corresponding to the minor with the largest absolute determinant is set to $0$, improving the numerical conditioning of the resulting $2 \times 2$ system.
  - [ ] **Coincident vs. Parallel Distinct Classification:** When $\sigma \le 10^{-7}$ (parallel normals):
    The normalized plane representations are compared:
    $\hat{\mathbf{n}}_i = \frac{\mathbf{n}_i}{\|\mathbf{n}_i\|}$ and $\delta_i = \frac{d_i}{\|\mathbf{n}_i\|}$.
    If $(\hat{\mathbf{n}}_1 \approx \hat{\mathbf{n}}_2 \text{ and } |\delta_1 - \delta_2| \le \epsilon)$ or $(\hat{\mathbf{n}}_1 \approx -\hat{\mathbf{n}}_2 \text{ and } |\delta_1 + \delta_2| \le \epsilon)$ using scale tolerance $\epsilon = 10^{-6}$, classifies as **Coincident Planes**.
    Otherwise, classifies as **Parallel Distinct Planes**.
    *(This normalized-distance formulation correctly handles zero coefficients and sign reversals without division-by-zero or coefficient ratios).*
  - [ ] **Verification:** Substitutes the parametric line $\mathbf{r}(t) = \mathbf{p}_0 + t\mathbf{d}$ into both plane equations, displaying the algebraic consistency check in KaTeX.

### 3. Interactive 3D Visualization and Clipping
- **User Action:** Interacts with the canvas using mouse or touch.
- **Behavior:** Renders the bounded planes, intersection line, axes, and optional normal vectors in WebGL.
- **Acceptance Criteria:**
  - [ ] Both plane meshes and the intersection line are consistently clipped to the $[-10, 10]^3$ viewing volume so infinite geometry does not overflow the scene.
  - [ ] Transparent materials use appropriate depth sorting / blending so overlapping geometry remains clearly visible.
  - [ ] Intersection line is rendered with prominent line width in high-contrast gold.
  - [ ] OrbitControls allow smooth 360-degree rotation, right-click/two-finger pan, and zoom.
  - [ ] Camera toolbar buttons (Isometric, Top, Front, Side, Reset) smoothly reposition the camera.

### 4. Input Validation and Stale-Geometry Handling
- **User Action:** Enters invalid, incomplete, or degenerate coefficients.
- **Behavior:** Detects the condition immediately, flags the issue, and manages geometric objects without collateral deletion of valid geometry.
- **Acceptance Criteria:**
  - [ ] If $a_i = b_i = c_i = 0$ with $d_i \neq 0$: flags Plane $i$ as **Inconsistent Degenerate Equation (Empty Set)**.
  - [ ] If $a_i = b_i = c_i = d_i = 0$: flags Plane $i$ as **Trivial Identity (Entire $\mathbb{R}^3$ Space)**.
  - [ ] Non-numeric strings or empty fields display an immediate inline validation badge on that specific input.
  - [ ] **Independent Geometry Clearing:** If Plane 1 has valid input and Plane 2 is invalid, Plane 1 remains rendered in the 3D viewport. The invalid Plane 2 mesh and the dependent intersection line are cleared immediately, preventing any stale or misleading intersection from remaining on screen.
  - [ ] When input is corrected, full computation and visualization recover automatically.

### 5. Curated Presets
- **User Action:** Selects a preset from the dropdown.
- **Behavior:** Instantly populates the plane coefficients, repositions the camera to the optimal vantage point, and recalculates the entire workspace.
- **Acceptance Criteria:**
  - [ ] **Preset 1 (Orthogonal Intersecting):** $x + y = 2$ and $x - y = 0$ (perpendicular planes, vertical intersection line along Z).
  - [ ] **Preset 2 (Oblique Intersecting):** $2x - y + z = 3$ and $x + 2y - z = 1$ (general 3D line).
  - [ ] **Preset 3 (Parallel Distinct):** $x + y + z = 3$ and $x + y + z = 6$ (no intersection line, parallel spacing).
  - [ ] **Preset 4 (Coincident Planes):** $x - 2y + z = 4$ and $2x - 4y + 2z = 8$ (single overlapping plane, infinite solutions).

### 6. 2D Linear System Bridge
- **User Action:** Clicks "2D Linear Systems" in the mode switcher.
- **Behavior:** Switches to a 2D Cartesian coordinate plane plotting two linear equations ($a_1x + b_1y = c_1$ and $a_2x + b_2y = c_2$).
- **Acceptance Criteria:**
  - [ ] Evaluates normal vectors $\mathbf{n}_1 = (a_1, b_1)$ and $\mathbf{n}_2 = (a_2, b_2)$ and normalized determinant $\sigma_{2D} = \frac{|a_1b_2 - a_2b_1|}{\|\mathbf{n}_1\| \|\mathbf{n}_2\|}$.
  - [ ] When $\sigma_{2D} > 10^{-6}$, computes unique intersection $(x^*, y^*)$ via elimination / Cramer's rule, plots lines and intersection point on the 2D grid, and details algebraic elimination steps.
  - [ ] When $\sigma_{2D} \le 10^{-6}$, applies normalized distance check to classify as **Parallel Distinct Lines** or **Coincident Lines**.
  - [ ] Detects degenerate 2D equations ($a_i = b_i = 0$) consistently with the 3D engine.

## States and Boundaries

- **First Use State:** Workspace opens with Orthogonal Intersecting Planes preset loaded, camera in default isometric view, Dark Slate theme active, and derivation steps expanded.
- **Normal Interactive State:** Sliders adjust values, 3D viewport renders smoothly at 60 FPS, KaTeX derivations refresh cleanly.
- **Singular / Edge State (Parallel or Coincident):** Intersection line is cleanly unmounted; derivation panel shows explanatory banner rather than an error.
- **Degenerate State (Zero Normal Vector):** Shows inline error on affected input, clears only the invalid plane and intersection line, retains any valid companion plane, and explains the mathematical limitation.
- **Persistence:** Current active theme (dark/light) persists in `localStorage` across page reloads.

## Product Decisions

- **Normalized Distance Method for Coincidence:** Rather than unstable coefficient ratios ($a_1/a_2$) that fail when coefficients are zero, MathSpace compares unit normals $\hat{\mathbf{n}}_1, \hat{\mathbf{n}}_2$ and signed normalized distances $\delta_1, \delta_2$. This provides complete mathematical rigor across all coefficient permutations.
- **Unclamped Slider Sync:** Preserves numerical input integrity. Inputs accept any valid real number, while sliders provide rapid exploration within typical bounds $[-10, 10]$ without silently modifying user inputs.
- **Partial Geometry Retention:** Invalidating one plane removes only that plane and the dependent intersection, leaving the other valid plane intact so the user's workspace context is preserved.
- **Conditioning Transparency:** Explicitly labels near-parallel systems as *Ill-Conditioned*, teaching the difference between mathematical singularity and numerical sensitivity.

## What We're Building
- Complete three-panel workspace with responsive mobile drawers.
- Real-time 3D Three.js canvas with orbit controls, camera shortcuts, bounded coordinate volume, and clipped plane/line meshes.
- Analytical derivation engine computing cross products, point derivation, parametric form, and algebraic verification.
- Scale-aware geometric classification (Intersecting, Parallel Distinct, Coincident, Degenerate, Ill-Conditioned).
- Four 3D curated presets and one 2D linear-system bridge mode.
- Dark Slate default theme and accessible Light theme.

## Deferred From the POC
- **Three-Plane Intersection ($3 \times 3$ linear system):** Deferred to post-PoC.
- **Arbitrary Vector Operations Sandbox:** Dedicated vector calculator deferred.
- **Graph Export / URL State Sharing:** Deferred to post-PoC.

## Non-Goals
- Full Computer Algebra System (CAS) or arbitrary non-linear equation parsing.
- Arbitrary non-linear 3D surfaces ($z = f(x, y)$) or implicit quadric surfaces.
- Calculus (derivatives/integrals) or differential equation solvers.

## Open Questions
All consequential questions are resolved. Ready for technical specification in `4-spec`.
