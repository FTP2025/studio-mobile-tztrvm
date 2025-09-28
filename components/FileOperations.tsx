
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import { useFileOperations } from '../hooks/useFileOperations';
import { Shape } from '../types';

interface FileOperationsProps {
  shapes: Shape[];
  onLoadProject: (shapes: Shape[]) => void;
  onClose?: () => void;
}

const FileOperations: React.FC<FileOperationsProps> = ({
  shapes,
  onLoadProject,
  onClose,
}) => {
  const [projectName, setProjectName] = useState('');
  const { saveProject, loadProject, exportProject, isSaving, isLoading } = useFileOperations();

  const handleSave = async () => {
    try {
      if (!shapes || shapes.length === 0) {
        Alert.alert('No Shapes', 'Add some shapes to your project before saving.');
        return;
      }

      const name = projectName.trim() || `GRANTIC_Project_${new Date().toISOString().split('T')[0]}`;
      console.log('Saving project with name:', name);

      const result = await saveProject(shapes, name);
      
      if (result.success) {
        Alert.alert(
          'Project Saved',
          `Your project "${name}" has been saved successfully!`,
          [{ text: 'OK', onPress: onClose }]
        );
        setProjectName('');
      } else {
        console.error('Save failed:', result.error);
        Alert.alert('Save Failed', result.error || 'Failed to save project');
      }
    } catch (error) {
      console.error('Save operation failed:', error);
      Alert.alert('Save Failed', 'An unexpected error occurred while saving');
    }
  };

  const handleLoad = async () => {
    try {
      console.log('Loading project...');
      
      const result = await loadProject();
      
      if (result.success && result.data) {
        Alert.alert(
          'Load Project',
          `Load "${result.data.name}" with ${result.data.shapes.length} shapes? This will replace your current project.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Load',
              onPress: () => {
                try {
                  onLoadProject(result.data!.shapes);
                  Alert.alert('Project Loaded', `"${result.data!.name}" loaded successfully!`);
                  onClose?.();
                } catch (loadError) {
                  console.error('Error during project load callback:', loadError);
                  Alert.alert('Load Error', 'Failed to load project data');
                }
              },
            },
          ]
        );
      } else {
        console.error('Load failed:', result.error);
        Alert.alert('Load Failed', result.error || 'Failed to load project');
      }
    } catch (error) {
      console.error('Load operation failed:', error);
      Alert.alert('Load Failed', 'An unexpected error occurred while loading');
    }
  };

  const handleExport = async () => {
    try {
      if (!shapes || shapes.length === 0) {
        Alert.alert('No Shapes', 'Add some shapes to your project before exporting.');
        return;
      }

      const name = projectName.trim() || `GRANTIC_Export_${new Date().toISOString().split('T')[0]}`;
      console.log('Exporting project with name:', name);

      const result = await exportProject(shapes, name);
      
      if (result.success) {
        Alert.alert(
          'Project Exported',
          `Your project "${name}" has been exported successfully!`
        );
        setProjectName('');
      } else {
        console.error('Export failed:', result.error);
        Alert.alert('Export Failed', result.error || 'Failed to export project');
      }
    } catch (error) {
      console.error('Export operation failed:', error);
      Alert.alert('Export Failed', 'An unexpected error occurred while exporting');
    }
  };

  const handleNewProject = () => {
    try {
      if (shapes.length > 0) {
        Alert.alert(
          'New Project',
          'This will clear all current shapes. Are you sure?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'New Project',
              style: 'destructive',
              onPress: () => {
                try {
                  onLoadProject([]);
                  Alert.alert('New Project', 'Started a new project!');
                  onClose?.();
                } catch (newProjectError) {
                  console.error('Error creating new project:', newProjectError);
                  Alert.alert('Error', 'Failed to create new project');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('New Project', 'Already working on a new project!');
      }
    } catch (error) {
      console.error('New project operation failed:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Manager</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Name</Text>
        <TextInput
          style={styles.input}
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Enter project name (optional)"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Project</Text>
        <Text style={styles.info}>
          {shapes.length} shape{shapes.length !== 1 ? 's' : ''} in project
        </Text>
      </View>

      <View style={styles.buttonGrid}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Icon name="save-outline" size={24} color={colors.background} />
          )}
          <Text style={[styles.buttonText, styles.saveButtonText]}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.loadButton]}
          onPress={handleLoad}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Icon name="folder-open-outline" size={24} color={colors.background} />
          )}
          <Text style={[styles.buttonText, styles.loadButtonText]}>
            {isLoading ? 'Loading...' : 'Load'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.exportButton]}
          onPress={handleExport}
          disabled={isSaving}
        >
          <Icon name="share-outline" size={24} color={colors.background} />
          <Text style={[styles.buttonText, styles.exportButtonText]}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.newButton]}
          onPress={handleNewProject}
        >
          <Icon name="add-outline" size={24} color={colors.background} />
          <Text style={[styles.buttonText, styles.newButtonText]}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          • Save: Save your project and share the file
        </Text>
        <Text style={styles.infoText}>
          • Load: Open a previously saved .grantic file
        </Text>
        <Text style={styles.infoText}>
          • Export: Share your project as a file
        </Text>
        <Text style={styles.infoText}>
          • New: Start a fresh project
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  info: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...commonStyles.shadow,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.background,
  },
  loadButton: {
    backgroundColor: colors.secondary || '#34C759',
  },
  loadButtonText: {
    color: colors.background,
  },
  exportButton: {
    backgroundColor: '#FF9500',
  },
  exportButtonText: {
    color: colors.background,
  },
  newButton: {
    backgroundColor: '#FF3B30',
  },
  newButtonText: {
    color: colors.background,
  },
  infoSection: {
    backgroundColor: colors.backgroundAlt,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});

export default FileOperations;
