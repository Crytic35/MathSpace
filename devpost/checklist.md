---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Project scaffolding and mathematical engine with full test suite**
  Becomes usable: The pure mathematical analytical engine (`src/math/`) and Vitest test suite running and passing tests for vector operations, scale-aware plane classification, intersection line calculation ($\mathbf{d} = \mathbf{n}_1 \times \mathbf{n}_2$, point $\mathbf{p}_0$ via max minor), bounded cube polygon clipping, and 2D linear systems.
  Why now: Risk first and kernel first. Proves the core analytical mathematics, clipping algorithms, and numerical tolerances with automated tests before connecting to 3D rendering and UI.
  PRD ref: `prd.md > Features and Behavior > 2 & 6`
  Spec ref: `spec.md > Components > 1. Mathematical Engine`, `spec.md > File Structure`
  Build: Initialize Vite + TypeScript project (`package.json`, `tsconfig.json`, `vite.config.ts`), implement `types.ts`, `vectors.ts`, `planeSolver.ts`, `planeClipper.ts`, and `linearSolver2D.ts`, install dependencies, and write test suites.
  Verify (mechanical): Run `npx vitest run` and confirm all mathematical unit tests pass with 0 errors.
  Learner check: Run `npx vitest run` to observe that all vector operations, plane classifications, and clipping algorithms pass.
  Commit: `Initialize project and build mathematical engine with full test suite`

- [x] **2. Three-panel scientific workspace and interactive 3D viewport with presets**
  Becomes usable: A running local web application with the responsive 3-panel layout, Three.js 3D viewport rendering the bounded coordinate cube $[-10, 10]^3$ with labeled axes, translucent clipped plane meshes, illuminated intersection line, orbit controls, camera toolbar (Isometric, Top, Front, Side, Reset), and preset loading.
  Why now: Brings the 3D visualization to life end-to-end, validating the WebGL coordinate system and bounded clipping.
  PRD ref: `prd.md > The Core Journey` (steps 1, 2, 4), `prd.md > Features and Behavior > 3 & 5`
  Spec ref: `spec.md > Components > 2. Viewport Layer`, `spec.md > Look and Feel`
  Build: Implement design tokens (`tokens.css`), workspace layout (`layout.css`), state store (`store.ts`), presets (`presets.ts`), Three.js viewport (`viewport3d.ts`), camera toolbar (`cameraToolbar.ts`), and mount in `main.ts` and `index.html`.
  Verify (mechanical): Run `npm run build` and start dev server; confirm 3D viewport mounts cleanly without WebGL errors.
  Learner check: Open `http://localhost:5173`, rotate/zoom the 3D scene, and test camera preset buttons.
  Commit: `Build three-panel workspace and interactive 3D viewport`

- [x] **3. Equation controls, synchronized sliders, and KaTeX derivation panel**
  Becomes usable: Live interactive parameter manipulation: dragging sliders or typing coefficients dynamically updates 3D planes and the intersection line in real time, while the right panel displays KaTeX mathematical steps, direction vector cross product, particular point derivation, and algebraic verification.
  Why now: Closes the flagship interaction loop ("Define → Compute → Derive & Verify → Visualize → Tweak Sliders").
  PRD ref: `prd.md > The Core Journey` (step 3), `prd.md > Features and Behavior > 1, 2, 4`
  Spec ref: `spec.md > Components > 4. User Interface Layer`
  Build: Implement `controlPanel.ts` (inputs, unclamped sliders, visibility toggles, validation badges) and `derivationPanel.ts` (KaTeX equations, singularity badges, step-by-step substitution). Connect to `AppStore`.
  Verify (mechanical): Confirm KaTeX renders equations cleanly without layout thrashing; test slider inputs update 3D scene smoothly.
  Learner check: Drag plane sliders and watch the 3D planes move and KaTeX derivation update in real time; test parallel planes preset.
  Commit: `Connect interactive equation controls and KaTeX derivation panel`

- [ ] **4. 2D linear system bridge, theme manager, and MVP completion**
  Becomes usable: The complete application with the 2D linear-system mode (Canvas2D plotting $2 \times 2$ lines, intersection point, and elimination steps), Dark Slate / Light theme toggle with local persistence, and degenerate equation error recovery.
  Why now: Completes the full scope, PRD acceptance criteria, and demo requirements.
  PRD ref: `prd.md > The Core Journey` (steps 5 & 6), `prd.md > Features and Behavior > 6`
  Spec ref: `spec.md > Components > 2. Viewport Layer (viewport2d.ts)`, `spec.md > Components > 4. User Interface Layer (themeManager.ts)`
  Build: Implement `viewport2d.ts`, `themeManager.ts`, mode switcher in header, and wire 2D solver and theme persistence.
  Verify (mechanical): Run `npm run test` and `npm run build`; verify both pass with zero errors.
  Learner check: Switch between 3D and 2D modes, toggle Dark/Light themes, and verify the 1–3 minute demo flow.
  Commit: `Add 2D linear system bridge, theme manager, and finalize MVP`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 2 (3D viewport with presets running locally)
- [ ] Final kick-the-tires exploration and feedback completed — Slice 4 (Complete app and 2D bridge)

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions
