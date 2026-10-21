import katex from 'katex';
import { store, AppState } from '../state/store.js';
import { solvePlaneIntersection } from '../math/planeSolver.js';
import { solveLinearSystem2D } from '../math/linearSolver2D.js';

export function renderDerivationPanel(container: HTMLElement) {
  store.subscribe((state: AppState) => {
    if (state.viewMode === '3D') {
      render3DDerivation(container, state);
    } else {
      render2DDerivation(container, state);
    }
  });
}

function render3DDerivation(container: HTMLElement, state: AppState) {
  const p1 = state.plane1;
  const p2 = state.plane2;

  if (!p1.valid || !p2.valid) {
    container.innerHTML = `
      <div class="badge badge-degenerate">Invalid or Degenerate Input</div>
      <div class="card" style="margin-top: 10px;">
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
          ${!p1.valid ? 'Plane 1 contains an invalid or zero-normal equation.' : ''}
          ${!p2.valid ? 'Plane 2 contains an invalid or zero-normal equation.' : ''}
          Please enter non-zero coefficients for (a, b, c).
        </p>
      </div>
    `;
    return;
  }

  const result = solvePlaneIntersection(p1, p2);

  let badgeClass = 'badge-intersecting';
  let badgeLabel = 'Intersecting Line in ℝ³';

  switch (result.classification) {
    case 'ILL_CONDITIONED_INTERSECTING':
      badgeClass = 'badge-parallel';
      badgeLabel = 'Near-Parallel (Ill-Conditioned)';
      break;
    case 'PARALLEL_DISTINCT':
      badgeClass = 'badge-parallel';
      badgeLabel = 'Parallel Distinct Planes';
      break;
    case 'COINCIDENT':
      badgeClass = 'badge-coincident';
      badgeLabel = 'Coincident Planes (Identical)';
      break;
    case 'DEGENERATE_EMPTY':
    case 'DEGENERATE_ALL_SPACE':
      badgeClass = 'badge-degenerate';
      badgeLabel = 'Degenerate Equation';
      break;
  }

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span class="badge ${badgeClass}">${badgeLabel}</span>
      <span style="font-size: 0.75rem; color: var(--text-muted);">
        ||n₁×n₂|| / (||n₁|| ||n₂||) = ${formatDecimal(result.normalizedCrossMagnitude)}
      </span>
    </div>

    <!-- Explanation -->
    <div class="card">
      <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
        ${result.explanation}
      </p>
    </div>

    <!-- Steps -->
    <div id="steps-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
  `;

  const stepsList = container.querySelector('#steps-list');
  if (!stepsList) return;

  result.derivationStepsLatex.forEach((latex, idx) => {
    const box = document.createElement('div');
    box.className = 'step-box';

    const lbl = document.createElement('div');
    lbl.className = 'step-label';
    lbl.textContent = `Step ${idx + 1}`;
    box.appendChild(lbl);

    const mathEl = document.createElement('div');
    mathEl.className = 'step-math';
    try {
      katex.render(latex, mathEl, { displayMode: true, throwOnError: false });
    } catch {
      mathEl.textContent = latex;
    }
    box.appendChild(mathEl);

    stepsList.appendChild(box);
  });

  // Verification Box
  if (result.verification) {
    const vBox = document.createElement('div');
    vBox.className = 'step-box';
    vBox.style.borderLeft = '3px solid var(--badge-intersect)';
    vBox.innerHTML = `
      <div class="step-label" style="color: var(--badge-intersect);">Algebraic Verification</div>
      <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
        <div>Plane 1 check: <code>${result.verification.plane1Sub}</code> ✓</div>
        <div>Plane 2 check: <code>${result.verification.plane2Sub}</code> ✓</div>
      </div>
    `;
    stepsList.appendChild(vBox);
  }
}

function render2DDerivation(container: HTMLElement, state: AppState) {
  const result = solveLinearSystem2D(state.line1, state.line2);

  let badgeClass = 'badge-intersecting';
  let badgeLabel = 'Unique Solution (x, y)';

  if (result.classification === 'PARALLEL_DISTINCT') {
    badgeClass = 'badge-parallel';
    badgeLabel = 'No Solution (Parallel Lines)';
  } else if (result.classification === 'COINCIDENT') {
    badgeClass = 'badge-coincident';
    badgeLabel = 'Infinite Solutions (Coincident)';
  } else if (result.classification === 'DEGENERATE') {
    badgeClass = 'badge-degenerate';
    badgeLabel = 'Degenerate System';
  }

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span class="badge ${badgeClass}">${badgeLabel}</span>
      <span style="font-size: 0.75rem; color: var(--text-muted);">
        Determinant D = ${result.determinant}
      </span>
    </div>

    <div class="card">
      <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
        ${result.explanation}
      </p>
    </div>

    <div id="steps-2d-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
  `;

  const stepsList = container.querySelector('#steps-2d-list');
  if (!stepsList) return;

  result.stepsLatex.forEach((latex, idx) => {
    const box = document.createElement('div');
    box.className = 'step-box';

    const lbl = document.createElement('div');
    lbl.className = 'step-label';
    lbl.textContent = `Elimination Step ${idx + 1}`;
    box.appendChild(lbl);

    const mathEl = document.createElement('div');
    mathEl.className = 'step-math';
    try {
      katex.render(latex, mathEl, { displayMode: true, throwOnError: false });
    } catch {
      mathEl.textContent = latex;
    }
    box.appendChild(mathEl);

    stepsList.appendChild(box);
  });
}

function formatDecimal(n: number): string {
  if (n === 0) return '0';
  if (n < 0.0001) return n.toExponential(2);
  return (Math.round(n * 10000) / 10000).toString();
}
