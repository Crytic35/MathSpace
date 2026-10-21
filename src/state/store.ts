import { PlaneEquation, LineEquation2D } from '../math/types.js';
import { PRESETS_3D, PRESETS_2D } from './presets.js';

export interface PlaneState extends PlaneEquation {
  visible: boolean;
  valid: boolean;
}

export interface AppState {
  viewMode: '3D' | '2D';
  theme: 'dark' | 'light';
  plane1: PlaneState;
  plane2: PlaneState;
  line1: LineEquation2D;
  line2: LineEquation2D;
  showNormals: boolean;
  showIntersection: boolean;
  activePresetId: string | null;
}

type Listener = (state: AppState) => void;

class Store {
  private state: AppState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    const savedTheme = (localStorage.getItem('mathspace_theme') as 'dark' | 'light') || 'dark';
    const defaultPreset = PRESETS_3D[0];
    const default2D = PRESETS_2D[0];

    this.state = {
      viewMode: '3D',
      theme: savedTheme,
      plane1: { ...defaultPreset.plane1, visible: true, valid: true },
      plane2: { ...defaultPreset.plane2, visible: true, valid: true },
      line1: { ...default2D.line1 },
      line2: { ...default2D.line2 },
      showNormals: false,
      showIntersection: true,
      activePresetId: defaultPreset.id
    };
  }

  public getState(): AppState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public setState(partial: Partial<AppState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public updatePlane1(update: Partial<PlaneState>) {
    this.state = {
      ...this.state,
      activePresetId: null,
      plane1: { ...this.state.plane1, ...update }
    };
    this.notify();
  }

  public updatePlane2(update: Partial<PlaneState>) {
    this.state = {
      ...this.state,
      activePresetId: null,
      plane2: { ...this.state.plane2, ...update }
    };
    this.notify();
  }

  public updateLine1(update: Partial<LineEquation2D>) {
    this.state = {
      ...this.state,
      activePresetId: null,
      line1: { ...this.state.line1, ...update }
    };
    this.notify();
  }

  public updateLine2(update: Partial<LineEquation2D>) {
    this.state = {
      ...this.state,
      activePresetId: null,
      line2: { ...this.state.line2, ...update }
    };
    this.notify();
  }

  public loadPreset(presetId: string) {
    const p3d = PRESETS_3D.find((p) => p.id === presetId);
    if (p3d) {
      this.state = {
        ...this.state,
        viewMode: '3D',
        activePresetId: presetId,
        plane1: { ...p3d.plane1, visible: true, valid: true },
        plane2: { ...p3d.plane2, visible: true, valid: true }
      };
      this.notify();
      return;
    }

    const p2d = PRESETS_2D.find((p) => p.id === presetId);
    if (p2d) {
      this.state = {
        ...this.state,
        viewMode: '2D',
        activePresetId: presetId,
        line1: { ...p2d.line1 },
        line2: { ...p2d.line2 }
      };
      this.notify();
    }
  }

  public toggleTheme() {
    const next = this.state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mathspace_theme', next);
    this.setState({ theme: next });
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const store = new Store();
