import { store, AppState } from './state/store.js';
import { PRESETS_3D, PRESETS_2D } from './state/presets.js';
import { Viewport3D } from './viewport/viewport3d.js';
import { Viewport2D } from './viewport/viewport2d.js';
import { renderCameraToolbar } from './ui/cameraToolbar.js';
import { renderControlPanel } from './ui/controlPanel.js';
import { renderDerivationPanel } from './ui/derivationPanel.js';
import { solvePlaneIntersection } from './math/planeSolver.js';

let viewport3d: Viewport3D | null = null;
let viewport2d: Viewport2D | null = null;

function init() {
  const container3d = document.getElementById('viewport-3d-wrapper');
  const canvas2D = document.getElementById('viewport-2d-canvas') as HTMLCanvasElement;
  const controlsContent = document.getElementById('controls-content');
  const derivationContent = document.getElementById('derivation-content');
  if (!container3d || !canvas2D) return;

  // Initialize UI panels
  if (controlsContent) renderControlPanel(controlsContent);
  if (derivationContent) renderDerivationPanel(derivationContent);

  // Initialize Viewports
  viewport3d = new Viewport3D(container3d);
  viewport2d = new Viewport2D(canvas2D);
  renderCameraToolbar(container3d, viewport3d);

  // Setup Presets Dropdown
  const presetSelect = document.getElementById('preset-selector') as HTMLSelectElement;
  if (presetSelect) {
    populatePresetsDropdown(presetSelect, store.getState().viewMode);
    presetSelect.addEventListener('change', (e) => {
      const id = (e.target as HTMLSelectElement).value;
      store.loadPreset(id);
    });
  }

  // Setup Mode Switcher
  const btn3D = document.getElementById('btn-mode-3d');
  const btn2D = document.getElementById('btn-mode-2d');

  if (btn3D && btn2D) {
    btn3D.addEventListener('click', () => {
      store.setState({ viewMode: '3D' });
      btn3D.classList.add('active');
      btn2D.classList.remove('active');
      container3d.classList.remove('hidden');
      canvas2D.classList.add('hidden');
      if (presetSelect) populatePresetsDropdown(presetSelect, '3D');
    });

    btn2D.addEventListener('click', () => {
      store.setState({ viewMode: '2D' });
      btn2D.classList.add('active');
      btn3D.classList.remove('active');
      container3d.classList.add('hidden');
      canvas2D.classList.remove('hidden');
      if (presetSelect) populatePresetsDropdown(presetSelect, '2D');
      if (viewport2d) {
        const s = store.getState();
        viewport2d.render(s.line1, s.line2, s.theme);
      }
    });
  }

  // Setup Theme Toggle Button
  const themeBtn = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  if (themeBtn && themeIcon && themeText) {
    themeBtn.addEventListener('click', () => {
      store.toggleTheme();
    });
  }

  // Subscribe to store updates
  store.subscribe((state: AppState) => {
    // Update theme
    document.body.setAttribute('data-theme', state.theme);
    if (themeIcon && themeText) {
      themeIcon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
      themeText.textContent = state.theme === 'dark' ? 'Light' : 'Dark';
    }
    if (viewport3d) {
      viewport3d.updateTheme(state.theme);
    }
    if (viewport2d && state.viewMode === '2D') {
      viewport2d.render(state.line1, state.line2, state.theme);
    }

    // Update 3D viewport if in 3D mode
    if (viewport3d && state.viewMode === '3D') {
      const p1 = state.plane1.valid ? state.plane1 : null;
      const p2 = state.plane2.valid ? state.plane2 : null;

      viewport3d.updatePlanes(p1, p2, state.plane1.visible, state.plane2.visible);
      viewport3d.setShowNormals(state.showNormals, p1, p2);

      if (p1 && p2) {
        const res = solvePlaneIntersection(p1, p2);
        if (res.isIntersecting && res.particularPoint && res.directionVector) {
          viewport3d.updateIntersectionLine(
            res.particularPoint,
            res.directionVector,
            state.showIntersection
          );
        } else {
          viewport3d.updateIntersectionLine(null, null);
        }
      } else {
        viewport3d.updateIntersectionLine(null, null);
      }
    }

    // Sync preset dropdown value
    if (presetSelect && state.activePresetId) {
      presetSelect.value = state.activePresetId;
    }
  });
}

function populatePresetsDropdown(select: HTMLSelectElement, mode: '3D' | '2D') {
  select.innerHTML = '';
  if (mode === '3D') {
    PRESETS_3D.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
  } else {
    PRESETS_2D.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', init);
