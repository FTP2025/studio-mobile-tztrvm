
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Shape, Character } from '../types';
import Icon from './Icon';

interface ToolboxProps {
  onAddShape: (type: Shape['type']) => void;
  onSpawnCharacter: (type: Character['type']) => void;
}

const SHAPE_TOOLS = [
  { type: 'cube' as const, name: 'Cube', icon: 'cube-outline' as const },
  { type: 'sphere' as const, name: 'Sphere', icon: 'ellipse-outline' as const },
  { type: 'cylinder' as const, name: 'Cylinder', icon: 'radio-button-off-outline' as const },
  { type: 'cone' as const, name: 'Cone', icon: 'triangle-outline' as const },
  { type: 'plane' as const, name: 'Plane', icon: 'square-outline' as const },
];

const CHARACTER_TOOLS = [
  { type: 'player' as const, name: 'Player', icon: 'person' as const, color: colors.primary },
  { type: 'enemy' as const, name: 'Enemy', icon: 'skull' as const, color: colors.error },
  { type: 'npc' as const, name: 'NPC', icon: 'people' as const, color: colors.warning },
  { type: 'pet' as const, name: 'Pet', icon: 'paw' as const, color: colors.success },
  { type: 'boss' as const, name: 'Boss', icon: 'flame' as const, color: '#8B0000' },
];

const Toolbox: React.FC<ToolboxProps> = ({ onAddShape, onSpawnCharacter }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Toolbox</Text>
        <Text style={styles.subtitle}>Tap to add shapes and spawn characters</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolsContainer}
      >
        {/* Shape Tools */}
        <View style={styles.toolSection}>
          <Text style={styles.sectionTitle}>Shapes</Text>
          <View style={styles.toolRow}>
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
                    size={20} 
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.toolName}>{tool.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Character Tools */}
        <View style={styles.toolSection}>
          <Text style={styles.sectionTitle}>Characters</Text>
          <View style={styles.toolRow}>
            {CHARACTER_TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.type}
                style={styles.toolButton}
                onPress={() => {
                  console.log(`Spawning ${tool.type} character`);
                  onSpawnCharacter(tool.type);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIcon, styles.characterIcon]}>
                  <Icon 
                    name={tool.icon} 
                    size={20} 
                    color={tool.color}
                  />
                </View>
                <Text style={styles.toolName}>{tool.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="play-outline" size={16} color={colors.success} />
          <Text style={[styles.actionText, { color: colors.success }]}>Play</Text>
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
    gap: 20,
  },
  toolSection: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toolButton: {
    alignItems: 'center',
    minWidth: 60,
  },
  toolIcon: {
    width: 44,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  characterIcon: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 2,
  },
  toolName: {
    fontSize: 11,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.background,
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default Toolbox;
