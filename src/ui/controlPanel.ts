import { store, AppState } from '../state/store.js';

export function renderControlPanel(container: HTMLElement) {
  container.innerHTML = `
    <!-- Plane 1 Card -->
    <div class="card card-plane1" id="card-plane1">
      <div class="card-title-row">
        <span style="color: var(--plane1-color)">Plane 1: a₁x + b₁y + c₁z = d₁</span>
        <label style="display:flex; align-items:center; gap:4px; font-size:0.75rem; cursor:pointer;">
          <input type="checkbox" id="p1-visible" checked /> Show
        </label>
      </div>
      <div id="p1-error" style="display:none; color: var(--badge-error); font-size:0.72rem; font-weight:600;"></div>
      <div class="input-grid">
        <div class="coeff-group">
          <span class="coeff-label">a₁</span>
          <input type="number" step="any" id="p1-a" class="coeff-input" />
        </div>
        <div class="coeff-group">
          <span class="coeff-label">b₁</span>
          <input type="number" step="any" id="p1-b" class="coeff-input" />
        </div>
        <div class="coeff-group">
          <span class="coeff-label">c₁</span>
          <input type="number" step="any" id="p1-c" class="coeff-input" />
        </div>
        <div class="coeff-group">
          <span class="coeff-label">d₁</span>
          <input type="number" step="any" id="p1-d" class="coeff-input" />
        </div>
      </div>
      <div class="slider-group">
        <div class="slider-row"><span>a₁</span><input type="range" id="p1-a-slider" min="-10" max="10" step="0.1" /></div>
        <div class="slider-row"><span>b₁</span><input type="range" id="p1-b-slider" min="-10" max="10" step="0.1" /></div>
        <div class="slider-row"><span>c₁</span><input type="range" id="p1-c-slider" min="-10" max="10" step="0.1" /></div>
        <div class="slider-row"><span>d₁</span><input type="range" id="p1-d-slider" min="-10" max="10" step="0.1" /></div>
      </div>
    </div>

    <!-- Plane 2 Card -->
    <div class="card card-plane2" id="card-plane2">
      <div class="card-title-row">
        <span style="color: var(--plane2-color)">Plane 2: a₂x + b₂y + c₂z = d₂</span>
        <label style="display:flex; align-items:center; gap:4px; font-size:0.75rem; cursor:pointer;">
          <input type="checkbox" id="p2-visible" checked /> Show
        </label>
      </div>
      <div id="p2-error" style="display:none; color: var(--badge-error); font-size:0.72rem; font-weight:600;"></div>
      <div class="input-grid">
        <div class="coeff-group">
          <span class="coeff-label">a₂</span>
          <input type="number" step="any" id="p2-a" class="coeff-input" />
        </div>
        <div class="coeff-group">
          <span class="coeff-label">b₂</span>
          <input type="number" step="any" id="p2-b" class="coeff-input" />
        </div>
        <div class="coeff-group">
          <span class="coeff-label">c₂</span>
          <input type="number" step="any" id="p2-c" class="coeff-input" />
        </div>
        <div class="coeff-group">
          <span class="coeff-label">d₂</span>
          <input type="number" step="any" id="p2-d" class="coeff-input" />
        </div>
      </div>
      <div class="slider-group">
        <div class="slider-row"><span>a₂</span><input type="range" id="p2-a-slider" min="-10" max="10" step="0.1" /></div>
        <div class="slider-row"><span>b₂</span><input type="range" id="p2-b-slider" min="-10" max="10" step="0.1" /></div>
        <div class="slider-row"><span>c₂</span><input type="range" id="p2-c-slider" min="-10" max="10" step="0.1" /></div>
        <div class="slider-row"><span>d₂</span><input type="range" id="p2-d-slider" min="-10" max="10" step="0.1" /></div>
      </div>
    </div>

    <!-- Display Options Card -->
    <div class="card">
      <div class="card-title-row">
        <span>Geometric Display Options</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; font-size:0.8rem; color: var(--text-secondary);">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" id="toggle-intersection" checked /> Show Intersection Line
        </label>
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" id="toggle-normals" /> Show Normal Vectors (n₁, n₂)
        </label>
      </div>
    </div>
  `;

  bindPlaneControls('p1', (update) => store.updatePlane1(update));
  bindPlaneControls('p2', (update) => store.updatePlane2(update));

  // Display toggles
  const lineToggle = document.getElementById('toggle-intersection') as HTMLInputElement;
  if (lineToggle) {
    lineToggle.addEventListener('change', () => {
      store.setState({ showIntersection: lineToggle.checked });
    });
  }

  const normalsToggle = document.getElementById('toggle-normals') as HTMLInputElement;
  if (normalsToggle) {
    normalsToggle.addEventListener('change', () => {
      store.setState({ showNormals: normalsToggle.checked });
    });
  }

  // Subscribe to sync UI
  store.subscribe((state: AppState) => {
    syncPlaneUI('p1', state.plane1);
    syncPlaneUI('p2', state.plane2);
    if (lineToggle) lineToggle.checked = state.showIntersection;
    if (normalsToggle) normalsToggle.checked = state.showNormals;
  });
}

function bindPlaneControls(
  prefix: 'p1' | 'p2',
  onUpdate: (update: { a?: number; b?: number; c?: number; d?: number; visible?: boolean; valid?: boolean }) => void
) {
  const fields = ['a', 'b', 'c', 'd'] as const;

  fields.forEach((field) => {
    const numInput = document.getElementById(`${prefix}-${field}`) as HTMLInputElement;
    const slider = document.getElementById(`${prefix}-${field}-slider`) as HTMLInputElement;

    if (numInput && slider) {
      numInput.addEventListener('input', () => {
        const val = parseFloat(numInput.value);
        if (isNaN(val)) {
          showError(prefix, `Field ${field} must be a valid number.`);
          onUpdate({ valid: false });
          return;
        }

        // Validate plane normal not zero
        const state = store.getState();
        const current = prefix === 'p1' ? state.plane1 : state.plane2;
        const candidate = { ...current, [field]: val };
        if (candidate.a === 0 && candidate.b === 0 && candidate.c === 0) {
          showError(prefix, 'Degenerate normal: a, b, c cannot all be 0.');
          onUpdate({ [field]: val, valid: false });
        } else {
          hideError(prefix);
          onUpdate({ [field]: val, valid: true });
        }

        // Unclamped slider sync: adjust slider within [-10, 10] bounds without altering input value
        if (val >= -10 && val <= 10) {
          slider.value = val.toString();
        }
      });

      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        numInput.value = val.toString();

        const state = store.getState();
        const current = prefix === 'p1' ? state.plane1 : state.plane2;
        const candidate = { ...current, [field]: val };
        if (candidate.a === 0 && candidate.b === 0 && candidate.c === 0) {
          showError(prefix, 'Degenerate normal: a, b, c cannot all be 0.');
          onUpdate({ [field]: val, valid: false });
        } else {
          hideError(prefix);
          onUpdate({ [field]: val, valid: true });
        }
      });
    }
  });

  const vis = document.getElementById(`${prefix}-visible`) as HTMLInputElement;
  if (vis) {
    vis.addEventListener('change', () => {
      onUpdate({ visible: vis.checked });
    });
  }
}

function syncPlaneUI(
  prefix: 'p1' | 'p2',
  plane: { a: number; b: number; c: number; d: number; visible: boolean; valid: boolean }
) {
  const fields = ['a', 'b', 'c', 'd'] as const;
  fields.forEach((f) => {
    const numInput = document.getElementById(`${prefix}-${f}`) as HTMLInputElement;
    const slider = document.getElementById(`${prefix}-${f}-slider`) as HTMLInputElement;

    if (numInput && document.activeElement !== numInput) {
      numInput.value = plane[f].toString();
    }
    if (slider && document.activeElement !== slider) {
      const v = plane[f];
      if (v >= -10 && v <= 10) {
        slider.value = v.toString();
      }
    }
  });

  const vis = document.getElementById(`${prefix}-visible`) as HTMLInputElement;
  if (vis && document.activeElement !== vis) {
    vis.checked = plane.visible;
  }

  if (plane.valid) {
    hideError(prefix);
  }
}

function showError(prefix: 'p1' | 'p2', msg: string) {
  const err = document.getElementById(`${prefix}-error`);
  if (err) {
    err.textContent = msg;
    err.style.display = 'block';
  }
}

function hideError(prefix: 'p1' | 'p2') {
  const err = document.getElementById(`${prefix}-error`);
  if (err) {
    err.style.display = 'none';
  }
}
