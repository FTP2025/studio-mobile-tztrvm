
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
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

  const updatePosition = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdateShape(selectedShape.id, {
      position: { ...selectedShape.position, [axis]: numValue }
    });
  };

  const updateRotation = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdateShape(selectedShape.id, {
      rotation: { ...selectedShape.rotation, [axis]: numValue }
    });
  };

  const updateScale = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = Math.max(0.1, parseFloat(value) || 1);
    onUpdateShape(selectedShape.id, {
      scale: { ...selectedShape.scale, [axis]: numValue }
    });
  };

  const updateColor = (color: string) => {
    onUpdateShape(selectedShape.id, { color });
  };

  const COLORS = [
    '#0066FF', '#FF6B35', '#4CAF50', '#FF9800', 
    '#9C27B0', '#F44336', '#2196F3', '#795548'
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                transformMode === mode && styles.modeTextActive
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transform Values */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {transformMode === 'move' ? 'Position' :
           transformMode === 'rotate' ? 'Rotation' : 'Scale'}
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

          return (
            <View key={axis} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{axis.toUpperCase()}</Text>
              <TextInput
                style={styles.input}
                value={getValue().toString()}
                onChangeText={handleChange}
                keyboardType="numeric"
                placeholder="0"
              />
              <View style={styles.quickButtons}>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleChange((getValue() - 0.1).toString())}
                >
                  <Text style={styles.quickButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleChange((getValue() + 0.1).toString())}
                >
                  <Text style={styles.quickButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Color Picker */}
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
            />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              onUpdateShape(selectedShape.id, {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
              });
            }}
          >
            <Icon name="refresh-outline" size={16} color={colors.text} />
            <Text style={styles.actionText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Duplicate shape logic would go here
              console.log('Duplicate shape:', selectedShape.id);
            }}
          >
            <Icon name="copy-outline" size={16} color={colors.text} />
            <Text style={styles.actionText}>Duplicate</Text>
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
    marginBottom: 12,
    gap: 8,
  },
  inputLabel: {
    width: 20,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    flex: 1,
    height: 36,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  quickButton: {
    width: 28,
    height: 28,
    backgroundColor: colors.background,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
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
