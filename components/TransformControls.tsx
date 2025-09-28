
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
  
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isTransforming) {
      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  }, [isTransforming, feedbackOpacity, scaleAnim]);

  if (!selectedShape) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSelectionText}>Select a shape to transform</Text>
      </View>
    );
  }

  const getStepSize = (): number => {
    return precisionMode ? 0.01 : 0.1;
  };

  const getRotationStep = (): number => {
    return precisionMode ? 1 : 15;
  };

  const getScaleStep = (): number => {
    return precisionMode ? 0.01 : 0.1;
  };

  const updatePosition = (axis: 'x' | 'y' | 'z', value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onUpdateShape(selectedShape.id, {
      position: {
        ...selectedShape.position,
        [axis]: numValue,
      },
    });
  };

  const updateRotation = (axis: 'x' | 'y' | 'z', value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onUpdateShape(selectedShape.id, {
      rotation: {
        ...selectedShape.rotation,
        [axis]: numValue % 360,
      },
    });
  };

  const updateScale = (axis: 'x' | 'y' | 'z', value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0.01 : value;
    onUpdateShape(selectedShape.id, {
      scale: {
        ...selectedShape.scale,
        [axis]: Math.max(0.01, numValue),
      },
    });
  };

  const updateColor = (color: string) => {
    onUpdateShape(selectedShape.id, { color });
  };

  const handleQuickAdjust = (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
    setIsTransforming(true);
    Vibration.vibrate(10);

    setTimeout(() => setIsTransforming(false), 200);

    switch (transformMode) {
      case 'move':
        updatePosition(axis, selectedShape.position[axis] + (getStepSize() * direction));
        break;
      case 'rotate':
        updateRotation(axis, selectedShape.rotation[axis] + (getRotationStep() * direction));
        break;
      case 'scale':
        updateScale(axis, selectedShape.scale[axis] + (getScaleStep() * direction));
        break;
    }
  };

  const resetTransform = () => {
    onUpdateShape(selectedShape.id, {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
    console.log('Reset transform for shape:', selectedShape.id);
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
  };

  const createSliderPanResponder = (axis: 'x' | 'y' | 'z') => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsTransforming(true);
        Vibration.vibrate(10);
      },
      onPanResponderMove: (_, gestureState) => {
        const sensitivity = precisionMode ? 0.001 : 0.01;
        const delta = gestureState.dx * sensitivity;
        
        switch (transformMode) {
          case 'move':
            updatePosition(axis, selectedShape.position[axis] + delta);
            break;
          case 'rotate':
            updateRotation(axis, selectedShape.rotation[axis] + (delta * 10));
            break;
          case 'scale':
            updateScale(axis, selectedShape.scale[axis] + delta);
            break;
        }
      },
      onPanResponderRelease: () => {
        setIsTransforming(false);
      },
    });
  };

  const colors_list = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000'
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: feedbackOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Transform Controls</Text>
        <Text style={styles.subtitle}>{selectedShape.type} - {selectedShape.id.slice(-8)}</Text>
      </Animated.View>

      {/* Transform Mode Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transform Mode</Text>
        <View style={styles.modeSelector}>
          {(['move', 'rotate', 'scale'] as TransformMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                transformMode === mode && styles.modeButtonActive,
              ]}
              onPress={() => setTransformMode(mode)}
            >
              <Icon
                name={
                  mode === 'move' ? 'move-outline' :
                  mode === 'rotate' ? 'refresh-outline' : 'resize-outline'
                }
                size={20}
                color={transformMode === mode ? colors.background : colors.text}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  transformMode === mode && styles.modeButtonTextActive,
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Precision Mode Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.precisionToggle, precisionMode && styles.precisionToggleActive]}
          onPress={() => setPrecisionMode(!precisionMode)}
        >
          <Icon
            name="settings-outline"
            size={20}
            color={precisionMode ? colors.background : colors.text}
          />
          <Text
            style={[
              styles.precisionText,
              precisionMode && styles.precisionTextActive,
            ]}
          >
            Precision Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transform Values */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {transformMode === 'move' ? 'Position' :
           transformMode === 'rotate' ? 'Rotation' : 'Scale'}
        </Text>
        
        {(['x', 'y', 'z'] as const).map((axis) => {
          const currentValue = transformMode === 'move' ? selectedShape.position[axis] :
                              transformMode === 'rotate' ? selectedShape.rotation[axis] :
                              selectedShape.scale[axis];
          
          return (
            <View key={axis} style={styles.axisControl}>
              <Text style={styles.axisLabel}>{axis.toUpperCase()}</Text>
              
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust(axis, -1)}
              >
                <Icon name="remove" size={16} color={colors.background} />
              </TouchableOpacity>
              
              <View
                style={styles.sliderContainer}
                {...createSliderPanResponder(axis).panHandlers}
              >
                <Text style={styles.valueText}>
                  {currentValue.toFixed(precisionMode ? 3 : 2)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust(axis, 1)}
              >
                <Icon name="add" size={16} color={colors.background} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.valueInput}
                value={currentValue.toFixed(precisionMode ? 3 : 2)}
                onChangeText={(text) => {
                  if (transformMode === 'move') updatePosition(axis, text);
                  else if (transformMode === 'rotate') updateRotation(axis, text);
                  else updateScale(axis, text);
                }}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>
          );
        })}
      </View>

      {/* Color Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorGrid}>
          {colors_list.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedShape.color === color && styles.colorButtonSelected,
              ]}
              onPress={() => updateColor(color)}
            />
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={resetTransform}>
            <Icon name="refresh-outline" size={20} color={colors.background} />
            <Text style={styles.actionButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={duplicateShape}>
            <Icon name="copy-outline" size={20} color={colors.background} />
            <Text style={styles.actionButtonText}>Duplicate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDeleteShape(selectedShape.id)}
          >
            <Icon name="trash-outline" size={20} color={colors.background} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  noSelectionText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  modeButtonTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  precisionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
  },
  precisionToggleActive: {
    backgroundColor: colors.primary,
  },
  precisionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  precisionTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  axisControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  axisLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    width: 20,
  },
  adjustButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 8,
  },
  sliderContainer: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  valueInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: colors.text,
    borderWidth: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 6,
  },
});

export default TransformControls;
