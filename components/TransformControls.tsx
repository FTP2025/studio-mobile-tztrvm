
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
import { Shape, Character, TransformMode } from '../types';
import Icon from './Icon';

interface TransformControlsProps {
  selectedShape: Shape | null;
  selectedCharacter: Character | null;
  onUpdateShape: (id: string, updates: Partial<Shape>) => void;
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
  onDeleteShape: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
}

const TransformControls: React.FC<TransformControlsProps> = ({
  selectedShape,
  selectedCharacter,
  onUpdateShape,
  onUpdateCharacter,
  onDeleteShape,
  onDeleteCharacter,
}) => {
  const [transformMode, setTransformMode] = useState<TransformMode>('move');
  const [precisionMode, setPrecisionMode] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const selectedEntity = selectedShape || selectedCharacter;
  const isCharacter = !!selectedCharacter;

  useEffect(() => {
    if (isTransforming) {
      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(feedbackOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isTransforming, feedbackOpacity, scaleAnim]);

  if (!selectedEntity) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Transform Controls</Text>
          <Text style={styles.subtitle}>Select an entity to transform</Text>
        </View>
        <View style={styles.emptyState}>
          <Icon name="hand-left-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Tap a shape or character to select it</Text>
        </View>
      </View>
    );
  }

  const getStepSize = () => precisionMode ? 0.1 : 1;
  const getRotationStep = () => precisionMode ? 1 : 15;
  const getScaleStep = () => precisionMode ? 0.01 : 0.1;

  const updatePosition = (axis: 'x' | 'y', value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const updates = {
      position: {
        ...selectedEntity.position,
        [axis]: numValue,
      },
    };
    
    if (isCharacter) {
      onUpdateCharacter(selectedEntity.id, updates);
    } else {
      onUpdateShape(selectedEntity.id, updates);
    }
  };

  const updateRotation = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const updates = { rotation: numValue % 360 };
    
    if (isCharacter) {
      onUpdateCharacter(selectedEntity.id, updates);
    } else {
      onUpdateShape(selectedEntity.id, updates);
    }
  };

  const updateScale = (axis: 'x' | 'y', value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0.01 : value;
    const updates = {
      scale: {
        ...selectedEntity.scale,
        [axis]: Math.max(0.01, numValue),
      },
    };
    
    if (isCharacter) {
      onUpdateCharacter(selectedEntity.id, updates);
    } else {
      onUpdateShape(selectedEntity.id, updates);
    }
  };

  const updateColor = (color: string) => {
    const updates = { color };
    
    if (isCharacter) {
      onUpdateCharacter(selectedEntity.id, updates);
    } else {
      onUpdateShape(selectedEntity.id, updates);
    }
  };

  const handleQuickAdjust = (axis: 'x' | 'y', direction: 1 | -1) => {
    setIsTransforming(true);
    Vibration.vibrate(25);
    
    setTimeout(() => setIsTransforming(false), 300);

    switch (transformMode) {
      case 'move':
        updatePosition(axis, selectedEntity.position[axis] + direction * getStepSize());
        break;
      case 'rotate':
        if (axis === 'x') {
          updateRotation(selectedEntity.rotation + direction * getRotationStep());
        }
        break;
      case 'scale':
        updateScale(axis, selectedEntity.scale[axis] + direction * getScaleStep());
        break;
    }
  };

  const resetTransform = () => {
    const updates = {
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
    };
    
    if (isCharacter) {
      onUpdateCharacter(selectedEntity.id, updates);
    } else {
      onUpdateShape(selectedEntity.id, updates);
    }
    
    Vibration.vibrate(50);
  };

  const duplicateEntity = () => {
    // This would need to be implemented in the parent component
    console.log('Duplicate entity:', selectedEntity.id);
    Vibration.vibrate(25);
  };

  const createSliderPanResponder = (axis: 'x' | 'y') => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsTransforming(true);
        Vibration.vibrate(25);
      },
      onPanResponderMove: (evt, gestureState) => {
        const sensitivity = precisionMode ? 0.01 : 0.05;
        const delta = gestureState.dx * sensitivity;
        
        switch (transformMode) {
          case 'move':
            updatePosition(axis, selectedEntity.position[axis] + delta);
            break;
          case 'scale':
            updateScale(axis, selectedEntity.scale[axis] + delta);
            break;
        }
      },
      onPanResponderRelease: () => {
        setIsTransforming(false);
        Vibration.vibrate(25);
      },
    });
  };

  const xSliderPanResponder = createSliderPanResponder('x');
  const ySliderPanResponder = createSliderPanResponder('y');

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isCharacter ? 'Character Controls' : 'Transform Controls'}
        </Text>
        <Text style={styles.subtitle}>
          {isCharacter 
            ? `${selectedCharacter!.name} (${selectedCharacter!.type})`
            : `${selectedEntity.type} shape`
          }
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transform Mode Selector */}
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
                size={16}
                color={transformMode === mode ? colors.backgroundAlt : colors.text}
              />
              <Text style={[
                styles.modeText,
                transformMode === mode && styles.modeTextActive,
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Precision Mode Toggle */}
        <TouchableOpacity
          style={[styles.precisionToggle, precisionMode && styles.precisionToggleActive]}
          onPress={() => setPrecisionMode(!precisionMode)}
        >
          <Icon
            name="settings-outline"
            size={16}
            color={precisionMode ? colors.backgroundAlt : colors.textSecondary}
          />
          <Text style={[
            styles.precisionText,
            precisionMode && styles.precisionTextActive,
          ]}>
            Precision Mode
          </Text>
        </TouchableOpacity>

        {/* Position Controls */}
        {transformMode === 'move' && (
          <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Position</Text>
            
            <View style={styles.controlRow}>
              <Text style={styles.axisLabel}>X:</Text>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('x', -1)}
              >
                <Icon name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              
              <View style={styles.sliderContainer} {...xSliderPanResponder.panHandlers}>
                <TextInput
                  style={styles.valueInput}
                  value={selectedEntity.position.x.toFixed(2)}
                  onChangeText={(text) => updatePosition('x', text)}
                  keyboardType="numeric"
                />
              </View>
              
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('x', 1)}
              >
                <Icon name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.controlRow}>
              <Text style={styles.axisLabel}>Y:</Text>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('y', -1)}
              >
                <Icon name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              
              <View style={styles.sliderContainer} {...ySliderPanResponder.panHandlers}>
                <TextInput
                  style={styles.valueInput}
                  value={selectedEntity.position.y.toFixed(2)}
                  onChangeText={(text) => updatePosition('y', text)}
                  keyboardType="numeric"
                />
              </View>
              
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('y', 1)}
              >
                <Icon name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Rotation Controls */}
        {transformMode === 'rotate' && (
          <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Rotation</Text>
            
            <View style={styles.controlRow}>
              <Text style={styles.axisLabel}>Angle:</Text>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('x', -1)}
              >
                <Icon name="arrow-back" size={16} color={colors.text} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.valueInput}
                value={selectedEntity.rotation.toFixed(1)}
                onChangeText={(text) => updateRotation(text)}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('x', 1)}
              >
                <Icon name="arrow-forward" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Scale Controls */}
        {transformMode === 'scale' && (
          <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Scale</Text>
            
            <View style={styles.controlRow}>
              <Text style={styles.axisLabel}>X:</Text>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('x', -1)}
              >
                <Icon name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.valueInput}
                value={selectedEntity.scale.x.toFixed(2)}
                onChangeText={(text) => updateScale('x', text)}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('x', 1)}
              >
                <Icon name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.controlRow}>
              <Text style={styles.axisLabel}>Y:</Text>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('y', -1)}
              >
                <Icon name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.valueInput}
                value={selectedEntity.scale.y.toFixed(2)}
                onChangeText={(text) => updateScale('y', text)}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleQuickAdjust('y', 1)}
              >
                <Icon name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Character-specific controls */}
        {isCharacter && (
          <View style={styles.controlGroup}>
            <Text style={styles.groupTitle}>Character Stats</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Health:</Text>
              <Text style={styles.statValue}>
                {selectedCharacter!.health}/{selectedCharacter!.maxHealth}
              </Text>
              <View style={styles.healthBar}>
                <View 
                  style={[
                    styles.healthFill, 
                    { 
                      width: `${(selectedCharacter!.health / selectedCharacter!.maxHealth) * 100}%`,
                      backgroundColor: selectedCharacter!.health > selectedCharacter!.maxHealth * 0.5 ? colors.success : 
                                     selectedCharacter!.health > selectedCharacter!.maxHealth * 0.25 ? colors.warning : colors.error
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Speed:</Text>
              <Text style={styles.statValue}>{selectedCharacter!.speed}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Name:</Text>
              <TextInput
                style={styles.nameInput}
                value={selectedCharacter!.name}
                onChangeText={(text) => onUpdateCharacter(selectedCharacter!.id, { name: text })}
                placeholder="Character name"
              />
            </View>
          </View>
        )}

        {/* Color Picker */}
        <View style={styles.controlGroup}>
          <Text style={styles.groupTitle}>Color</Text>
          <View style={styles.colorPicker}>
            {[
              colors.primary,
              colors.error,
              colors.warning,
              colors.success,
              '#FF6B6B',
              '#4ECDC4',
              '#45B7D1',
              '#96CEB4',
              '#FFEAA7',
              '#DDA0DD',
              '#98D8C8',
              '#F7DC6F',
            ].map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  selectedEntity.color === color && styles.colorSwatchSelected,
                ]}
                onPress={() => updateColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={resetTransform}>
            <Icon name="refresh-outline" size={16} color={colors.text} />
            <Text style={styles.actionText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={duplicateEntity}>
            <Icon name="copy-outline" size={16} color={colors.text} />
            <Text style={styles.actionText}>Duplicate</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => {
              if (isCharacter) {
                onDeleteCharacter(selectedEntity.id);
              } else {
                onDeleteShape(selectedEntity.id);
              }
            }}
          >
            <Icon name="trash-outline" size={16} color={colors.backgroundAlt} />
            <Text style={[styles.actionText, { color: colors.backgroundAlt }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Transform Feedback */}
      <Animated.View style={[styles.transformFeedback, { opacity: feedbackOpacity }]}>
        <Text style={styles.feedbackText}>Transforming...</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    maxHeight: 400,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
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
  precisionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.background,
    marginBottom: 16,
    gap: 6,
  },
  precisionToggleActive: {
    backgroundColor: colors.accent,
  },
  precisionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  precisionTextActive: {
    color: colors.backgroundAlt,
  },
  controlGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    width: 20,
  },
  adjustButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.background,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sliderContainer: {
    flex: 1,
    height: 32,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 60,
  },
  statValue: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
    width: 60,
  },
  healthBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 3,
  },
  nameInput: {
    flex: 1,
    height: 32,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    fontSize: 12,
    color: colors.text,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  transformFeedback: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  feedbackText: {
    fontSize: 10,
    color: colors.backgroundAlt,
    fontWeight: '600',
  },
});

export default TransformControls;
