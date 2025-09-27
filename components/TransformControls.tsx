
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  PanResponder,
  Animated,
  Vibration,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Shape, TransformMode } from '../types';
import Icon from './Icon';

interface TransformControlsProps {
  selectedShape: Shape | null;
  onUpdateShape: (id: string, updates: Partial<Shape>) => void;
  onDeleteShape: (id: string) => void;
}

const TransformControls: React.FC<TransformControlsProps> = ({
  selectedShape,
  onUpdateShape,
  onDeleteShape,
}) => {
  const [transformMode, setTransformMode] = useState<TransformMode>('move');
  const [precisionMode, setPrecisionMode] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  
  // Animation values for visual feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTransforming) {
      // Start feedback animation
      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      // Stop feedback animation
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
    }
  }, [isTransforming]);

  if (!selectedShape) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="hand-left-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Select a shape to edit</Text>
        </View>
      </View>
    );
  }

  const getStepSize = () => precisionMode ? 0.01 : 0.1;
  const getRotationStep = () => precisionMode ? 1 : 15;
  const getScaleStep = () => precisionMode ? 0.01 : 0.1;

  const updatePosition = (axis: 'x' | 'y' | 'z', value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onUpdateShape(selectedShape.id, {
      position: { ...selectedShape.position, [axis]: numValue }
    });
  };

  const updateRotation = (axis: 'x' | 'y' | 'z', value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    // Normalize rotation to -180 to 180 degrees
    const normalizedValue = ((numValue % 360) + 360) % 360;
    const finalValue = normalizedValue > 180 ? normalizedValue - 360 : normalizedValue;
    
    onUpdateShape(selectedShape.id, {
      rotation: { ...selectedShape.rotation, [axis]: finalValue }
    });
  };

  const updateScale = (axis: 'x' | 'y' | 'z', value: string | number) => {
    const numValue = typeof value === 'string' ? Math.max(0.01, parseFloat(value) || 1) : Math.max(0.01, value);
    onUpdateShape(selectedShape.id, {
      scale: { ...selectedShape.scale, [axis]: numValue }
    });
  };

  const updateColor = (color: string) => {
    onUpdateShape(selectedShape.id, { color });
    Vibration.vibrate(50); // Haptic feedback
  };

  const handleQuickAdjust = (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
    setIsTransforming(true);
    Vibration.vibrate(25); // Light haptic feedback
    
    setTimeout(() => setIsTransforming(false), 300);

    const getValue = () => {
      switch (transformMode) {
        case 'move': return selectedShape.position[axis];
        case 'rotate': return selectedShape.rotation[axis];
        case 'scale': return selectedShape.scale[axis];
      }
    };

    const getStep = () => {
      switch (transformMode) {
        case 'move': return getStepSize();
        case 'rotate': return getRotationStep();
        case 'scale': return getScaleStep();
      }
    };

    const newValue = getValue() + (direction * getStep());

    switch (transformMode) {
      case 'move': updatePosition(axis, newValue); break;
      case 'rotate': updateRotation(axis, newValue); break;
      case 'scale': updateScale(axis, newValue); break;
    }
  };

  const resetTransform = () => {
    onUpdateShape(selectedShape.id, {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
    Vibration.vibrate([50, 50, 50]); // Triple vibration for reset
  };

  const duplicateShape = () => {
    const newShape: Shape = {
      ...selectedShape,
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: selectedShape.position.x + 1,
        y: selectedShape.position.y + 1,
        z: selectedShape.position.z,
      },
      selected: false,
    };
    
    // This would need to be handled by the parent component
    console.log('Duplicate shape requested:', newShape);
    Vibration.vibrate(100);
  };

  const COLORS = [
    '#0066FF', '#FF6B35', '#4CAF50', '#FF9800', 
    '#9C27B0', '#F44336', '#2196F3', '#795548',
    '#607D8B', '#E91E63', '#00BCD4', '#8BC34A'
  ];

  const createSliderPanResponder = (axis: 'x' | 'y' | 'z') => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsTransforming(true);
        Vibration.vibrate(25);
      },
      onPanResponderMove: (evt, gestureState) => {
        const sensitivity = precisionMode ? 0.01 : 0.1;
        const delta = gestureState.dx * sensitivity;
        
        const getValue = () => {
          switch (transformMode) {
            case 'move': return selectedShape.position[axis];
            case 'rotate': return selectedShape.rotation[axis];
            case 'scale': return selectedShape.scale[axis];
          }
        };

        const newValue = getValue() + delta;

        switch (transformMode) {
          case 'move': updatePosition(axis, newValue); break;
          case 'rotate': updateRotation(axis, newValue); break;
          case 'scale': updateScale(axis, newValue); break;
        }
      },
      onPanResponderRelease: () => {
        setIsTransforming(false);
        Vibration.vibrate(25);
      },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Transform Feedback Overlay */}
      <Animated.View 
        style={[
          styles.feedbackOverlay,
          {
            opacity: feedbackOpacity,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Text style={styles.feedbackText}>
          {transformMode.toUpperCase()} MODE
        </Text>
      </Animated.View>

      {/* Shape Info */}
      <View style={styles.section}>
        <View style={styles.shapeHeader}>
          <View style={styles.shapeInfo}>
            <Text style={styles.shapeName}>{selectedShape.type.toUpperCase()}</Text>
            <Text style={styles.shapeId}>ID: {selectedShape.id.slice(-8)}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeleteShape(selectedShape.id)}
          >
            <Icon name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Precision Mode Toggle */}
      <View style={styles.section}>
        <View style={styles.precisionToggle}>
          <Text style={styles.sectionTitle}>Precision Mode</Text>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              precisionMode && styles.toggleButtonActive
            ]}
            onPress={() => {
              setPrecisionMode(!precisionMode);
              Vibration.vibrate(50);
            }}
          >
            <Text style={[
              styles.toggleText,
              precisionMode && styles.toggleTextActive
            ]}>
              {precisionMode ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.precisionInfo}>
          Step size: {transformMode === 'move' ? getStepSize() : 
                     transformMode === 'rotate' ? `${getRotationStep()}°` : 
                     getScaleStep()}
        </Text>
      </View>

      {/* Transform Mode Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transform Mode</Text>
        <View style={styles.modeSelector}>
          {(['move', 'rotate', 'scale'] as TransformMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                transformMode === mode && styles.modeButtonActive
              ]}
              onPress={() => {
                setTransformMode(mode);
                Vibration.vibrate(25);
              }}
            >
              <Icon 
                name={
                  mode === 'move' ? 'move-outline' :
                  mode === 'rotate' ? 'refresh-outline' : 'resize-outline'
                } 
                size={16} 
                color={transformMode === mode ? colors.backgroundAlt : colors.text}
              />
              <Text style={[
                styles.modeText,
                transformMode === mode && styles.modeTextActive
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Enhanced Transform Values */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {transformMode === 'move' ? 'Position' :
           transformMode === 'rotate' ? 'Rotation (degrees)' : 'Scale'}
        </Text>
        
        {(['x', 'y', 'z'] as const).map((axis) => {
          const getValue = () => {
            switch (transformMode) {
              case 'move': return selectedShape.position[axis];
              case 'rotate': return selectedShape.rotation[axis];
              case 'scale': return selectedShape.scale[axis];
            }
          };

          const handleChange = (value: string) => {
            switch (transformMode) {
              case 'move': updatePosition(axis, value); break;
              case 'rotate': updateRotation(axis, value); break;
              case 'scale': updateScale(axis, value); break;
            }
          };

          const sliderPanResponder = createSliderPanResponder(axis);

          return (
            <View key={axis} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{axis.toUpperCase()}</Text>
              
              {/* Slider Track */}
              <View style={styles.sliderContainer} {...sliderPanResponder.panHandlers}>
                <View style={styles.sliderTrack}>
                  <View style={[
                    styles.sliderThumb,
                    { left: `${Math.min(100, Math.max(0, (getValue() + 5) * 10))}%` }
                  ]} />
                </View>
              </View>

              <TextInput
                style={styles.input}
                value={getValue().toFixed(precisionMode ? 2 : 1)}
                onChangeText={handleChange}
                keyboardType="numeric"
                placeholder="0"
              />
              
              <View style={styles.quickButtons}>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleQuickAdjust(axis, -1)}
                >
                  <Text style={styles.quickButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleQuickAdjust(axis, 1)}
                >
                  <Text style={styles.quickButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Uniform Scale Toggle for Scale Mode */}
        {transformMode === 'scale' && (
          <TouchableOpacity
            style={styles.uniformScaleButton}
            onPress={() => {
              const avgScale = (selectedShape.scale.x + selectedShape.scale.y + selectedShape.scale.z) / 3;
              updateScale('x', avgScale);
              updateScale('y', avgScale);
              updateScale('z', avgScale);
              Vibration.vibrate(50);
            }}
          >
            <Icon name="link-outline" size={16} color={colors.text} />
            <Text style={styles.uniformScaleText}>Uniform Scale</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Enhanced Color Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedShape.color === color && styles.colorButtonSelected
              ]}
              onPress={() => updateColor(color)}
            >
              {selectedShape.color === color && (
                <Icon name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Enhanced Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={resetTransform}
          >
            <Icon name="refresh-outline" size={16} color={colors.text} />
            <Text style={styles.actionText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={duplicateShape}
          >
            <Icon name="copy-outline" size={16} color={colors.text} />
            <Text style={styles.actionText}>Duplicate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Snap to grid (round to nearest 0.5)
              const snapValue = (val: number) => Math.round(val * 2) / 2;
              onUpdateShape(selectedShape.id, {
                position: {
                  x: snapValue(selectedShape.position.x),
                  y: snapValue(selectedShape.position.y),
                  z: snapValue(selectedShape.position.z),
                }
              });
              Vibration.vibrate(50);
            }}
          >
            <Icon name="grid-outline" size={16} color={colors.text} />
            <Text style={styles.actionText}>Snap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  feedbackText: {
    color: colors.backgroundAlt,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  shapeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shapeInfo: {
    flex: 1,
  },
  shapeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  shapeId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  precisionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  toggleTextActive: {
    color: colors.backgroundAlt,
  },
  precisionInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    gap: 4,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  modeTextActive: {
    color: colors.backgroundAlt,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  inputLabel: {
    width: 20,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sliderContainer: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    marginRight: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    top: -6,
    marginLeft: -8,
  },
  input: {
    width: 80,
    height: 36,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  quickButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.background,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  uniformScaleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  uniformScaleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonSelected: {
    borderColor: colors.text,
    borderWidth: 3,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});

export default TransformControls;
