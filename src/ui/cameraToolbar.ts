import { Viewport3D } from '../viewport/viewport3d.js';

export function renderCameraToolbar(
  container: HTMLElement,
  viewport: Viewport3D
): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'camera-toolbar';

  const presets: { id: 'isometric' | 'top' | 'front' | 'side' | 'reset'; label: string }[] = [
    { id: 'isometric', label: 'Isometric' },
    { id: 'top', label: 'Top (XY)' },
    { id: 'front', label: 'Front (XZ)' },
    { id: 'side', label: 'Side (YZ)' },
    { id: 'reset', label: 'Reset' }
  ];

  presets.forEach((p, idx) => {
    const btn = document.createElement('button');
    btn.className = `cam-btn ${idx === 0 ? 'active' : ''}`;
    btn.textContent = p.label;
    btn.onclick = () => {
      bar.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      viewport.setCameraPreset(p.id);
    };
    bar.appendChild(btn);
  });

  container.appendChild(bar);
  return bar;
}
