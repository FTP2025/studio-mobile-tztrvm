
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
  { type: 'cube' as const, name: 'Cube', icon: 'cube-outline' as const },
  { type: 'sphere' as const, name: 'Sphere', icon: 'ellipse-outline' as const },
  { type: 'cylinder' as const, name: 'Cylinder', icon: 'radio-button-off-outline' as const },
  { type: 'cone' as const, name: 'Cone', icon: 'triangle-outline' as const },
  { type: 'plane' as const, name: 'Plane', icon: 'square-outline' as const },
];

const Toolbox: React.FC<ToolboxProps> = ({ onAddShape }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Toolbox</Text>
        <Text style={styles.subtitle}>Tap to add shapes</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolsContainer}
      >
        {SHAPE_TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.type}
            style={styles.toolButton}
            onPress={() => {
              console.log(`Adding ${tool.type} shape`);
              onAddShape(tool.type);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.toolIcon}>
              <Icon 
                name={tool.icon} 
                size={24} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.toolName}>{tool.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="copy-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="trash-outline" size={16} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="refresh-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
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
  toolsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  toolButton: {
    alignItems: 'center',
    minWidth: 70,
  },
  toolIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolName: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.background,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default Toolbox;
