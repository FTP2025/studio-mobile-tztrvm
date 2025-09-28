
export interface Shape {
  id: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'cone' | 'plane';
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  color: string;
  selected: boolean;
}

export interface Character {
  id: string;
  type: 'player' | 'enemy' | 'npc' | 'pet' | 'boss';
  name?: string;
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  color: string;
  selected: boolean;
  health: number;
  maxHealth: number;
}

export interface Transform {
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
}

export type TransformMode = 'move' | 'rotate' | 'scale';

export interface ViewportCamera {
  position: { x: number; y: number };
  zoom: number;
}

export type Entity = Shape | Character;
