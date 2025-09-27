
import { useState, useCallback } from 'react';
import { Shape, Transform } from '../types';

export const useShapes = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const addShape = useCallback((type: Shape['type']) => {
    const newShape: Shape = {
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: { x: 0, y: 0, z: 0 },
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

  return {
    shapes,
    selectedShapeId,
    addShape,
    selectShape,
    updateShape,
    deleteShape,
    clearSelection,
    getSelectedShape,
  };
};
