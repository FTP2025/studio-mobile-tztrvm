
export interface Shape {
  id: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'cone' | 'plane';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  selected: boolean;
}

export interface Transform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export type TransformMode = 'move' | 'rotate' | 'scale';

export interface ViewportCamera {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
  zoom: number;
}
