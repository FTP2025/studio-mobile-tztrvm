
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface MainMenuProps {
  onNewProject: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onExportProject: () => void;
  onOpenToolbox: () => void;
  onOpenTransformControls: () => void;
  onClose?: () => void;
  shapesCount: number;
  hasSelectedShape: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onNewProject,
  onSaveProject,
  onLoadProject,
  onExportProject,
  onOpenToolbox,
  onOpenTransformControls,
  onClose,
  shapesCount,
  hasSelectedShape,
}) => {
  const menuItems = [
    {
      title: 'Project',
      items: [
        {
          icon: 'add-outline',
          label: 'New Project',
          description: 'Start a fresh project',
          onPress: onNewProject,
          color: '#FF3B30',
        },
        {
          icon: 'save-outline',
          label: 'Save Project',
          description: 'Save current project',
          onPress: onSaveProject,
          color: colors.primary,
          disabled: shapesCount === 0,
        },
        {
          icon: 'folder-open-outline',
          label: 'Load Project',
          description: 'Open saved project',
          onPress: onLoadProject,
          color: '#34C759',
        },
        {
          icon: 'share-outline',
          label: 'Export Project',
          description: 'Share project file',
          onPress: onExportProject,
          color: '#FF9500',
          disabled: shapesCount === 0,
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          icon: 'add-circle-outline',
          label: 'Add Shapes',
          description: 'Open shape toolbox',
          onPress: onOpenToolbox,
          color: colors.secondary || '#007AFF',
        },
        {
          icon: 'options-outline',
          label: 'Transform',
          description: 'Edit selected shape',
          onPress: onOpenTransformControls,
          color: '#5856D6',
          disabled: !hasSelectedShape,
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>GRANTIC Studio</Text>
        <Text style={styles.subtitle}>3D Shape Designer</Text>
        
        <View style={styles.projectInfo}>
          <View style={styles.infoItem}>
            <Icon name="cube-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {shapesCount} shape{shapesCount !== 1 ? 's' : ''}
            </Text>
          </View>
          {hasSelectedShape && (
            <View style={styles.infoItem}>
              <Icon name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.infoText}>Shape selected</Text>
            </View>
          )}
        </View>
      </View>

      {menuItems.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          
          <View style={styles.itemsGrid}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  item.disabled && styles.menuItemDisabled,
                ]}
                onPress={() => {
                  if (!item.disabled) {
                    console.log('Menu item pressed:', item.label);
                    item.onPress();
                    onClose?.();
                  }
                }}
                disabled={item.disabled}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <Icon 
                    name={item.icon as any} 
                    size={24} 
                    color={colors.background} 
                  />
                </View>
                
                <View style={styles.itemContent}>
                  <Text style={[
                    styles.itemLabel,
                    item.disabled && styles.itemLabelDisabled,
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={[
                    styles.itemDescription,
                    item.disabled && styles.itemDescriptionDisabled,
                  ]}>
                    {item.description}
                  </Text>
                </View>
                
                {!item.disabled && (
                  <Icon 
                    name="chevron-forward" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <View style={styles.tipContainer}>
          <Icon name="bulb-outline" size={16} color={colors.primary} />
          <Text style={styles.tipText}>
            Tip: Tap and hold shapes in the viewport to select them
          </Text>
        </View>
        
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>GRANTIC Studio v1.0</Text>
          <Text style={styles.versionText}>Mobile 3D Designer</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  itemsGrid: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 16,
    ...commonStyles.shadow,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  itemLabelDisabled: {
    color: colors.textSecondary,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemDescriptionDisabled: {
    color: colors.textSecondary,
    opacity: 0.7,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    fontStyle: 'italic',
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.7,
  },
});

export default MainMenu;
