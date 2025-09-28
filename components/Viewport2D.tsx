
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Shape, ViewportCamera } from '../types';
import Icon from './Icon';

interface Viewport2DProps {
  shapes: Shape[];
  onShapeSelect: (id: string) => void;
  onShapeDeselect: () => void;
  selectedShapeId?: string | null;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Viewport2D: React.FC<Viewport2DProps> = ({
  shapes,
  onShapeSelect,
  onShapeDeselect,
  selectedShapeId,
}) => {
  const [camera, setCamera] = useState<ViewportCamera>({
    position: { x: 0, y: 0 },
    zoom: 1,
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedShapeId, setDraggedShapeId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  
  // Animation values
  const cameraShake = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(0.3)).current;

  const animateCamera = useCallback(() => {
    Animated.sequence([
      Animated.timing(cameraShake, {
        toValue: 2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cameraShake, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cameraShake]);

  const viewportPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !draggedShapeId && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        Vibration.vibrate(25);
        console.log('Viewport pan started');
      },
      onPanResponderMove: (evt, gestureState) => {
        if (draggedShapeId) return;
        
        const { dx, dy } = gestureState;
        const sensitivity = 1 / camera.zoom;
        
        setCamera(prev => ({
          ...prev,
          position: {
            x: prev.position.x - dx * sensitivity,
            y: prev.position.y - dy * sensitivity,
          },
        }));
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        setDraggedShapeId(null);
        console.log('Viewport pan ended');
      },
    })
  ).current;

  const createShapePanResponder = useCallback((shape: Shape) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return shape.selected && (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3);
      },
      onPanResponderGrant: () => {
        setDraggedShapeId(shape.id);
        Vibration.vibrate(50);
        console.log('Shape drag started:', shape.id);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!shape.selected) return;
        
        const { dx, dy } = gestureState;
        const sensitivity = 2 / camera.zoom;
        
        const newPosition = {
          x: shape.position.x + dx * sensitivity,
          y: shape.position.y + dy * sensitivity,
        };
        
        console.log('Shape position update:', shape.id, newPosition);
      },
      onPanResponderRelease: () => {
        setDraggedShapeId(null);
        Vibration.vibrate(25);
        console.log('Shape drag ended:', shape.id);
      },
    });
  }, [camera.zoom]);

  const worldToScreen = useCallback((worldPos: { x: number; y: number }) => {
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;
    
    return {
      x: centerX + (worldPos.x - camera.position.x) * camera.zoom * 50,
      y: centerY + (worldPos.y - camera.position.y) * camera.zoom * 50,
    };
  }, [camera]);

  const renderShape = useCallback((shape: Shape, index: number) => {
    const screenPos = worldToScreen(shape.position);
    const shapePanResponder = createShapePanResponder(shape);
    
    const baseSize = 60;
    const finalWidth = baseSize * shape.scale.x * camera.zoom;
    const finalHeight = baseSize * shape.scale.y * camera.zoom;
    
    const getShapeStyle = () => {
      const baseStyle = {
        position: 'absolute' as const,
        left: screenPos.x - finalWidth / 2,
        top: screenPos.y - finalHeight / 2,
        width: finalWidth,
        height: finalHeight,
        backgroundColor: shape.color,
        borderWidth: shape.selected ? 3 : 1,
        borderColor: shape.selected ? colors.accent : colors.border,
        transform: [{ rotate: `${shape.rotation}deg` }],
        zIndex: 100 + index,
      };

      switch (shape.type) {
        case 'sphere':
          return { 
            ...baseStyle, 
            borderRadius: finalWidth / 2,
          };
        case 'cylinder':
          return { 
            ...baseStyle, 
            borderRadius: 8,
          };
        case 'cone':
          return { 
            ...baseStyle, 
            borderRadius: finalWidth / 2,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          };
        case 'plane':
          return {
            ...baseStyle,
            borderRadius: 4,
            height: Math.max(4, finalHeight * 0.1),
          };
        default: // cube
          return {
            ...baseStyle,
            borderRadius: 4,
          };
      }
    };

    return (
      <Animated.View
        key={shape.id}
        style={[
          getShapeStyle(),
          draggedShapeId === shape.id && {
            transform: [
              { rotate: `${shape.rotation}deg` },
              { scale: 1.1 },
            ],
          },
        ]}
        {...shapePanResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.shapeTouch}
          onPress={() => {
            onShapeSelect(shape.id);
            Vibration.vibrate(25);
            animateCamera();
          }}
          activeOpacity={0.8}
        >
          {shape.selected && (
            <View style={styles.selectionIndicator}>
              <Text style={styles.selectionText}>{shape.type}</Text>
              <View style={styles.selectionCorners}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }, [worldToScreen, createShapePanResponder, onShapeSelect, draggedShapeId, animateCamera, camera.zoom]);

  const resetCamera = useCallback(() => {
    setCamera({
      position: { x: 0, y: 0 },
      zoom: 1,
    });
    animateCamera();
    Vibration.vibrate(50);
  }, [animateCamera]);

  const toggleGrid = useCallback(() => {
    setShowGrid(!showGrid);
    Animated.timing(gridOpacity, {
      toValue: showGrid ? 0 : 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Vibration.vibrate(25);
  }, [showGrid, gridOpacity]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { translateX: cameraShake },
            { translateY: cameraShake },
          ],
        },
      ]}
    >
      <View style={styles.viewport} {...viewportPanResponder.panHandlers}>
        {/* Grid */}
        {showGrid && (
          <Animated.View style={[styles.grid, { opacity: gridOpacity }]}>
            {Array.from({ length: 41 }).map((_, i) => {
              const screenY = worldToScreen({ x: 0, y: (i - 20) * 2 }).y;
              return (
                <View 
                  key={`grid-h-${i}`} 
                  style={[
                    styles.gridLineHorizontal, 
                    { 
                      top: screenY,
                      opacity: i % 5 === 0 ? 0.6 : 0.2 
                    }
                  ]} 
                />
              );
            })}
            {Array.from({ length: 41 }).map((_, i) => {
              const screenX = worldToScreen({ x: (i - 20) * 2, y: 0 }).x;
              return (
                <View 
                  key={`grid-v-${i}`} 
                  style={[
                    styles.gridLineVertical, 
                    { 
                      left: screenX,
                      opacity: i % 5 === 0 ? 0.6 : 0.2 
                    }
                  ]} 
                />
              );
            })}
          </Animated.View>
        )}

        {/* Origin */}
        <View style={[styles.origin, worldToScreen({ x: 0, y: 0 })]}>
          <View style={styles.originX} />
          <View style={styles.originY} />
          <Text style={styles.originLabel}>0,0</Text>
        </View>

        {/* Render shapes */}
        {shapes.map(renderShape)}

        {/* Viewport Info */}
        <View style={styles.viewportInfo}>
          <Text style={styles.infoText}>
            Camera: X:{camera.position.x.toFixed(1)} Y:{camera.position.y.toFixed(1)}
          </Text>
          <Text style={styles.infoText}>
            Zoom: {camera.zoom.toFixed(2)}x | Shapes: {shapes.length}
          </Text>
          <Text style={styles.infoText}>
            {isDragging ? 'Panning...' : draggedShapeId ? 'Moving Shape' : 'Ready'}
          </Text>
        </View>

        {/* Instructions overlay */}
        {shapes.length === 0 && (
          <View style={styles.instructionsOverlay}>
            <Text style={styles.instructionsTitle}>Welcome To Grantic Studio 2D</Text>
            <Text style={styles.instructionsText}>
              • Tap the toolbox to add shapes
            </Text>
            <Text style={styles.instructionsText}>
              • Drag to pan the camera
            </Text>
            <Text style={styles.instructionsText}>
              • Tap shapes to select them
            </Text>
            <Text style={styles.instructionsText}>
              • Drag selected shapes to move them
            </Text>
            <Text style={styles.instructionsText}>
              • Pinch to zoom (coming soon)
            </Text>
          </View>
        )}
      </View>

      {/* Camera Controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            setCamera(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.2) }));
            Vibration.vibrate(25);
          }}
        >
          <Icon name="add" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={resetCamera}
        >
          <Icon name="home" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            setCamera(prev => ({ ...prev, zoom: Math.max(0.3, prev.zoom - 0.2) }));
            Vibration.vibrate(25);
          }}
        >
          <Icon name="remove" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !showGrid && styles.controlButtonInactive]}
          onPress={toggleGrid}
        >
          <Icon name="grid" size={20} color={showGrid ? colors.text : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Zoom Indicator */}
      <View style={styles.zoomIndicator}>
        <Text style={styles.zoomText}>{(camera.zoom * 100).toFixed(0)}%</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  viewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.primary,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.primary,
  },
  origin: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  originX: {
    position: 'absolute',
    top: 14,
    left: 0,
    width: 30,
    height: 2,
    backgroundColor: colors.error,
  },
  originY: {
    position: 'absolute',
    top: 0,
    left: 14,
    width: 2,
    height: 30,
    backgroundColor: colors.success,
  },
  originLabel: {
    position: 'absolute',
    top: 32,
    left: -10,
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  shapeTouch: {
    flex: 1,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: -35,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  selectionCorners: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  cornerTL: {
    top: -4,
    left: -4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: -4,
    right: -4,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: -4,
    left: -4,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: -4,
    right: -4,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  viewportInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.backgroundAlt,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  infoText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: '25%',
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  cameraControls: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  controlButtonInactive: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zoomText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
});

export default Viewport2D;
