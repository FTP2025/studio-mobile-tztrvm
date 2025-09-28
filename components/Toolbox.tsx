
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Shape } from '../types';
import Icon from './Icon';

interface ToolboxProps {
  onAddShape: (type: Shape['type']) => void;
}

const SHAPE_TOOLS = [
  { type: 'cube' as const, name: 'Cube', icon: 'cube' },
  { type: 'sphere' as const, name: 'Sphere', icon: 'radio-button-off' },
  { type: 'cylinder' as const, name: 'Cylinder', icon: 'ellipse' },
  { type: 'cone' as const, name: 'Cone', icon: 'triangle' },
  { type: 'plane' as const, name: 'Plane', icon: 'square' },
];

const Toolbox: React.FC<ToolboxProps> = ({ onAddShape }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Toolbox</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3D Shapes</Text>
        <View style={styles.toolGrid}>
          {SHAPE_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.type}
              style={styles.toolButton}
              onPress={() => onAddShape(tool.type)}
            >
              <View style={styles.toolIcon}>
                <Icon name={tool.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.toolName}>{tool.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  toolIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
});

export default Toolbox;
