
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
import Icon from './Icon';
import { Shape, TransformMode } from '../types';

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
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isTransforming, feedbackOpacity, scaleAnim]);

  if (!selectedShape) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSelectionText}>No shape selected</Text>
      </View>
    );
  }

  const getStepSize = () => 0.3;
  const getRotationStep = () => 15;
  const getScaleStep = () => 0.1;

  const updatePosition = (axis: 'x' | 'y', value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onUpdateShape(selectedShape.id, {
      position: {
        ...selectedShape.position,
        [axis]: numValue,
      },
    });
  };

  const updateRotation = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onUpdateShape(selectedShape.id, {
      rotation: numValue % 360,
    });
  };

  const updateScale = (axis: 'x' | 'y', value: string | number) => {
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

  const handleQuickAdjust = (axis: 'x' | 'y', direction: 1 | -1) => {
    setIsTransforming(true);
    Vibration.vibrate(10);
    
    const currentValue = selectedShape.position[axis];
    updatePosition(axis, currentValue + (direction * getStepSize()));
    
    setTimeout(() => setIsTransforming(false), 300);
  };

  const resetTransform = () => {
    onUpdateShape(selectedShape.id, {
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
    });
  };

  const duplicateEntity = () => {
    // This would be handled by the parent component
    console.log('Duplicate requested for shape:', selectedShape.id);
  };

  const createSliderPanResponder = (axis: 'x' | 'y') => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsTransforming(true);
        Vibration.vibrate(5);
      },
      onPanResponderMove: (evt, gestureState) => {
        const sensitivity = 0.01;
        const delta = gestureState.dx * sensitivity;
        const currentValue = selectedShape.position[axis];
        updatePosition(axis, currentValue + delta);
      },
      onPanResponderRelease: () => {
        setIsTransforming(false);
      },
    });
  };

  const positionSliderX = createSliderPanResponder('x');
  const positionSliderY = createSliderPanResponder('y');

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
        <Text style={styles.subtitle}>{selectedShape.type}</Text>
      </Animated.View>

      {/* Position Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Position</Text>
        
        {(['x', 'y'] as const).map((axis) => (
          <View key={axis} style={styles.controlRow}>
            <Text style={styles.axisLabel}>{axis.toUpperCase()}</Text>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleQuickAdjust(axis, -1)}
            >
              <Icon name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.sliderContainer} {...(axis === 'x' ? positionSliderX.panHandlers : positionSliderY.panHandlers)}>
              <TextInput
                style={styles.valueInput}
                value={selectedShape.position[axis].toFixed(2)}
                onChangeText={(text) => updatePosition(axis, text)}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>
            
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleQuickAdjust(axis, 1)}
            >
              <Icon name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Rotation Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rotation</Text>
        
        <View style={styles.controlRow}>
          <Text style={styles.axisLabel}>ROT</Text>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => updateRotation(selectedShape.rotation - getRotationStep())}
          >
            <Icon name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.valueInput}
            value={selectedShape.rotation.toFixed(0)}
            onChangeText={(text) => updateRotation(text)}
            keyboardType="numeric"
            selectTextOnFocus
          />
          
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => updateRotation(selectedShape.rotation + getRotationStep())}
          >
            <Icon name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scale Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scale</Text>
        
        {(['x', 'y'] as const).map((axis) => (
          <View key={axis} style={styles.controlRow}>
            <Text style={styles.axisLabel}>{axis.toUpperCase()}</Text>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => updateScale(axis, selectedShape.scale[axis] - getScaleStep())}
            >
              <Icon name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.valueInput}
              value={selectedShape.scale[axis].toFixed(2)}
              onChangeText={(text) => updateScale(axis, text)}
              keyboardType="numeric"
              selectTextOnFocus
            />
            
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => updateScale(axis, selectedShape.scale[axis] + getScaleStep())}
            >
              <Icon name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Color Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorRow}>
          {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorButton, { backgroundColor: color }]}
              onPress={() => updateColor(color)}
            />
          ))}
        </View>
        <TextInput
          style={styles.colorInput}
          value={selectedShape.color}
          onChangeText={updateColor}
          placeholder="#0066FF"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={resetTransform}>
          <Icon name="refresh" size={20} color={colors.text} />
          <Text style={styles.actionButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={duplicateEntity}>
          <Icon name="copy" size={20} color={colors.text} />
          <Text style={styles.actionButtonText}>Duplicate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => onDeleteShape(selectedShape.id)}
        >
          <Icon name="trash" size={20} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  noSelectionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  axisLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    width: 30,
  },
  adjustButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sliderContainer: {
    flex: 1,
    height: 32,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  valueInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: colors.text,
    paddingHorizontal: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorInput: {
    height: 40,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default TransformControls;
