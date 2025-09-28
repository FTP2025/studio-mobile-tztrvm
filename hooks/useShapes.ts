
import { useState, useCallback } from 'react';
import { Shape, Transform } from '../types';

export const useShapes = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const addShape = useCallback((type: Shape['type']) => {
    const newShape: Shape = {
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: { 
        x: Math.random() * 10 - 5, // Random position between -5 and 5
        y: Math.random() * 10 - 5, 
        z: Math.random() * 10 - 5,
      },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#0066FF',
      selected: false,
    };

    setShapes(prev => {
      const updated = prev.map(shape => ({ ...shape, selected: false }));
      return [...updated, { ...newShape, selected: true }];
    });
    
    setSelectedShapeId(newShape.id);
    console.log('Added new shape:', newShape);
  }, []);

  const selectShape = useCallback((id: string) => {
    setShapes(prev => prev.map(shape => ({
      ...shape,
      selected: shape.id === id
    })));
    setSelectedShapeId(id);
    console.log('Selected shape:', id);
  }, []);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setShapes(prev => prev.map(shape => 
      shape.id === id ? { ...shape, ...updates } : shape
    ));
    console.log('Updated shape:', id, updates);
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapes(prev => prev.filter(shape => shape.id !== id));
    if (selectedShapeId === id) {
      setSelectedShapeId(null);
    }
    console.log('Deleted shape:', id);
  }, [selectedShapeId]);

  const clearSelection = useCallback(() => {
    setShapes(prev => prev.map(shape => ({ ...shape, selected: false })));
    setSelectedShapeId(null);
  }, []);

  const getSelectedShape = useCallback(() => {
    return shapes.find(shape => shape.id === selectedShapeId) || null;
  }, [shapes, selectedShapeId]);

  const duplicateShape = useCallback((id: string) => {
    const shapeToDuplicate = shapes.find(shape => shape.id === id);
    if (!shapeToDuplicate) return;

    const newShape: Shape = {
      ...shapeToDuplicate,
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: shapeToDuplicate.position.x + 2,
        y: shapeToDuplicate.position.y + 2,
        z: shapeToDuplicate.position.z,
      },
      selected: false,
    };

    setShapes(prev => {
      const updated = prev.map(shape => ({ ...shape, selected: false }));
      return [...updated, { ...newShape, selected: true }];
    });
    
    setSelectedShapeId(newShape.id);
    console.log('Duplicated shape:', newShape);
  }, [shapes]);

  const moveShape = useCallback((id: string, delta: { x: number; y: number; z: number }) => {
    setShapes(prev => prev.map(shape => 
      shape.id === id ? {
        ...shape,
        position: {
          x: shape.position.x + delta.x,
          y: shape.position.y + delta.y,
          z: shape.position.z + delta.z,
        }
      } : shape
    ));
  }, []);

  const rotateShape = useCallback((id: string, delta: { x: number; y: number; z: number }) => {
    setShapes(prev => prev.map(shape => 
      shape.id === id ? {
        ...shape,
        rotation: {
          x: (shape.rotation.x + delta.x) % 360,
          y: (shape.rotation.y + delta.y) % 360,
          z: (shape.rotation.z + delta.z) % 360,
        }
      } : shape
    ));
  }, []);

  const scaleShape = useCallback((id: string, delta: { x: number; y: number; z: number }) => {
    setShapes(prev => prev.map(shape => 
      shape.id === id ? {
        ...shape,
        scale: {
          x: Math.max(0.01, shape.scale.x + delta.x),
          y: Math.max(0.01, shape.scale.y + delta.y),
          z: Math.max(0.01, shape.scale.z + delta.z),
        }
      } : shape
    ));
  }, []);

  const resetShapeTransform = useCallback((id: string) => {
    updateShape(id, {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
  }, [updateShape]);

  const snapShapeToGrid = useCallback((id: string, gridSize: number = 1) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape) return;

    const snapValue = (val: number) => Math.round(val / gridSize) * gridSize;
    
    updateShape(id, {
      position: {
        x: snapValue(shape.position.x),
        y: snapValue(shape.position.y),
        z: snapValue(shape.position.z),
      }
    });
  }, [shapes, updateShape]);

  const loadShapes = useCallback((newShapes: Shape[]) => {
    setShapes(newShapes);
    setSelectedShapeId(null);
    console.log('Loaded shapes from project:', newShapes.length);
  }, []);

  const clearAllShapes = useCallback(() => {
    setShapes([]);
    setSelectedShapeId(null);
    console.log('Cleared all shapes');
  }, []);

  const getProjectData = useCallback(() => {
    return {
      shapes: shapes.map(shape => ({ ...shape, selected: false })),
      shapeCount: shapes.length,
    };
  }, [shapes]);

  return {
    shapes,
    selectedShapeId,
    addShape,
    selectShape,
    updateShape,
    deleteShape,
    clearSelection,
    getSelectedShape,
    duplicateShape,
    moveShape,
    rotateShape,
    scaleShape,
    resetShapeTransform,
    snapShapeToGrid,
    loadShapes,
    clearAllShapes,
    getProjectData,
  };
};
