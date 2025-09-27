
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Shape, ViewportCamera } from '../types';

interface Viewport3DProps {
  shapes: Shape[];
  onShapeSelect: (id: string) => void;
  onShapeDeselect: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Viewport3D: React.FC<Viewport3DProps> = ({
  shapes,
  onShapeSelect,
  onShapeDeselect,
}) => {
  const [camera, setCamera] = useState<ViewportCamera>({
    position: { x: 0, y: 0, z: 5 },
    rotation: { x: 0, y: 0 },
    zoom: 1,
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log('Viewport pan started');
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        setCamera(prev => ({
          ...prev,
          rotation: {
            x: Math.max(-90, Math.min(90, prev.rotation.x + dy * 0.5)),
            y: prev.rotation.y + dx * 0.5,
          },
        }));
      },
      onPanResponderRelease: () => {
        console.log('Viewport pan ended');
      },
    })
  ).current;

  const renderShape = (shape: Shape, index: number) => {
    // Simple 2D projection of 3D shapes for mobile display
    const projectedX = shape.position.x * 50 + SCREEN_WIDTH / 2;
    const projectedY = -shape.position.y * 50 + 200;
    
    const getShapeStyle = () => {
      const baseStyle = {
        position: 'absolute' as const,
        left: projectedX - 25,
        top: projectedY - 25,
        width: 50 * shape.scale.x,
        height: 50 * shape.scale.y,
        backgroundColor: shape.color,
        borderWidth: shape.selected ? 3 : 1,
        borderColor: shape.selected ? colors.accent : colors.border,
      };

      switch (shape.type) {
        case 'sphere':
          return { ...baseStyle, borderRadius: 25 * shape.scale.x };
        case 'cylinder':
          return { ...baseStyle, borderRadius: 8 };
        case 'cone':
          return { 
            ...baseStyle, 
            borderRadius: 25 * shape.scale.x,
            transform: [{ rotate: '45deg' }],
          };
        default: // cube
          return baseStyle;
      }
    };

    return (
      <TouchableOpacity
        key={shape.id}
        style={getShapeStyle()}
        onPress={() => onShapeSelect(shape.id)}
        activeOpacity={0.8}
      >
        {shape.selected && (
          <View style={styles.selectionIndicator}>
            <Text style={styles.selectionText}>{shape.type}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewport} {...panResponder.panHandlers}>
        {/* Grid background */}
        <View style={styles.grid}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, { top: i * 40 }]} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 40 }]} />
          ))}
        </View>

        {/* Center origin indicator */}
        <View style={styles.origin}>
          <View style={styles.originX} />
          <View style={styles.originY} />
        </View>

        {/* Render shapes */}
        {shapes.map(renderShape)}

        {/* Viewport info */}
        <View style={styles.viewportInfo}>
          <Text style={styles.infoText}>
            Camera: X:{camera.rotation.x.toFixed(1)}° Y:{camera.rotation.y.toFixed(1)}°
          </Text>
          <Text style={styles.infoText}>
            Shapes: {shapes.length}
          </Text>
        </View>

        {/* Instructions overlay */}
        {shapes.length === 0 && (
          <View style={styles.instructionsOverlay}>
            <Text style={styles.instructionsTitle}>Welcome To Grantic Studion</Text>
            <Text style={styles.instructionsText}>
              • Tap the toolbox below to add shapes
            </Text>
            <Text style={styles.instructionsText}>
              • Drag to rotate the camera
            </Text>
            <Text style={styles.instructionsText}>
              • Tap shapes to select them
            </Text>
          </View>
        )}
      </View>

      {/* Camera controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setCamera(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.2) }))}
        >
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setCamera({
            position: { x: 0, y: 0, z: 5 },
            rotation: { x: 0, y: 0 },
            zoom: 1,
          })}
        >
          <Text style={styles.controlButtonText}>⌂</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setCamera(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.2) }))}
        >
          <Text style={styles.controlButtonText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.grey,
    opacity: 0.3,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.grey,
    opacity: 0.3,
  },
  origin: {
    position: 'absolute',
    top: 200,
    left: SCREEN_WIDTH / 2,
    width: 20,
    height: 20,
  },
  originX: {
    position: 'absolute',
    top: 9,
    left: 0,
    width: 20,
    height: 2,
    backgroundColor: colors.error,
  },
  originY: {
    position: 'absolute',
    top: 0,
    left: 9,
    width: 2,
    height: 20,
    backgroundColor: colors.success,
  },
  selectionIndicator: {
    position: 'absolute',
    top: -25,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewportInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.backgroundAlt,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  instructionsOverlay: {
    position: 'absolute',
    top: '30%',
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
    width: 44,
    height: 44,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});

export default Viewport3D;
