
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../styles/commonStyles';
import { useShapes } from '../hooks/useShapes';
import { useFileOperations } from '../hooks/useFileOperations';
import Viewport2D from '../components/Viewport2D';
import Toolbox from '../components/Toolbox';
import TransformControls from '../components/TransformControls';
import FileOperations from '../components/FileOperations';
import MainMenu from '../components/MainMenu';
import SimpleBottomSheet from '../components/BottomSheet';
import Icon from '../components/Icon';

const GRANTIC: React.FC = () => {
  const {
    shapes,
    selectedShapeId,
    addShape,
    selectShape,
    updateShape,
    deleteShape,
    clearSelection,
    getSelectedShape,
    duplicateShape,
    loadShapes,
    clearAllShapes,
    getProjectData,
  } = useShapes();

  const { saveProject, loadProject, exportProject } = useFileOperations();

  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);
  const [showTransformControls, setShowTransformControls] = useState(false);
  const [showFileOperations, setShowFileOperations] = useState(false);

  const selectedShape = getSelectedShape();

  const handleShapeSelect = (id: string) => {
    try {
      selectShape(id);
      console.log('Selected shape:', id);
    } catch (error) {
      console.error('Error selecting shape:', error);
    }
  };

  const handleShapeDeselect = () => {
    try {
      clearSelection();
      console.log('Deselected all shapes');
    } catch (error) {
      console.error('Error deselecting shapes:', error);
    }
  };

  const handleAddShape = (type: any) => {
    try {
      addShape(type);
      closeAllBottomSheets();
      console.log('Added shape:', type);
    } catch (error) {
      console.error('Error adding shape:', error);
      Alert.alert('Error', 'Failed to add shape');
    }
  };

  const handleUpdateShape = (id: string, updates: any) => {
    try {
      updateShape(id, updates);
      console.log('Updated shape:', id, updates);
    } catch (error) {
      console.error('Error updating shape:', error);
    }
  };

  const handleDeleteShape = (id: string) => {
    Alert.alert(
      'Delete Shape',
      'Are you sure you want to delete this shape?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            try {
              deleteShape(id);
              closeAllBottomSheets();
              console.log('Deleted shape:', id);
            } catch (error) {
              console.error('Error deleting shape:', error);
              Alert.alert('Error', 'Failed to delete shape');
            }
          }
        },
      ]
    );
  };

  const handleDuplicateShape = () => {
    try {
      if (selectedShapeId) {
        duplicateShape(selectedShapeId);
        console.log('Duplicated shape:', selectedShapeId);
      }
    } catch (error) {
      console.error('Error duplicating shape:', error);
      Alert.alert('Error', 'Failed to duplicate shape');
    }
  };

  const handleLoadProject = (projectData: any) => {
    try {
      if (projectData.shapes) {
        loadShapes(projectData.shapes);
        console.log('Loaded project with shapes:', projectData.shapes.length);
      } else if (Array.isArray(projectData)) {
        loadShapes(projectData);
        console.log('Loaded project with shapes:', projectData.length);
      }
      closeAllBottomSheets();
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project');
    }
  };

  const closeAllBottomSheets = () => {
    try {
      setShowMainMenu(false);
      setShowToolbox(false);
      setShowTransformControls(false);
      setShowFileOperations(false);
    } catch (error) {
      console.error('Error closing bottom sheets:', error);
    }
  };

  const handleNewProject = () => {
    Alert.alert(
      'New Project',
      'This will clear all shapes. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            try {
              clearAllShapes();
              closeAllBottomSheets();
              console.log('Started new project');
            } catch (error) {
              console.error('Error creating new project:', error);
              Alert.alert('Error', 'Failed to create new project');
            }
          },
        },
      ]
    );
  };

  const handleSaveProject = async () => {
    try {
      console.log('Starting save project...');
      const projectData = getProjectData();
      const result = await saveProject(projectData.shapes);
      
      if (result.success) {
        console.log('Project saved successfully');
        Alert.alert('Success', 'Project saved successfully!');
      } else {
        console.error('Save failed:', result.error);
        Alert.alert('Save Failed', result.error || 'Could not save the project.');
      }
      closeAllBottomSheets();
    } catch (error) {
      console.error('Save failed with exception:', error);
      Alert.alert('Save Failed', 'Could not save the project.');
      closeAllBottomSheets();
    }
  };

  const handleLoadProjectFromMenu = () => {
    try {
      setShowFileOperations(true);
      setShowMainMenu(false);
    } catch (error) {
      console.error('Error opening file operations:', error);
    }
  };

  const handleExportProject = async () => {
    try {
      console.log('Starting export project...');
      const projectData = getProjectData();
      const result = await exportProject(projectData.shapes);
      
      if (result.success) {
        console.log('Project exported successfully');
        Alert.alert('Success', 'Project exported successfully!');
      } else {
        console.error('Export failed:', result.error);
        Alert.alert('Export Failed', result.error || 'Could not export the project.');
      }
      closeAllBottomSheets();
    } catch (error) {
      console.error('Export failed with exception:', error);
      Alert.alert('Export Failed', 'Could not export the project.');
      closeAllBottomSheets();
    }
  };

  const handleOpenToolbox = () => {
    try {
      setShowToolbox(true);
      setShowMainMenu(false);
    } catch (error) {
      console.error('Error opening toolbox:', error);
    }
  };

  const handleOpenTransformControls = () => {
    try {
      setShowTransformControls(true);
      setShowMainMenu(false);
    } catch (error) {
      console.error('Error opening transform controls:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Viewport2D
          shapes={shapes}
          onShapeSelect={handleShapeSelect}
          onShapeDeselect={handleShapeDeselect}
          selectedShapeId={selectedShapeId}
        />

        {/* Main Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMainMenu(true)}
        >
          <Icon name="menu" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowToolbox(true)}
          >
            <Icon name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>

          {selectedShape && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowTransformControls(true)}
            >
              <Icon name="settings" size={24} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Sheets */}
      <SimpleBottomSheet
        isVisible={showMainMenu}
        onClose={() => setShowMainMenu(false)}
      >
        <MainMenu
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onLoadProject={handleLoadProjectFromMenu}
          onExportProject={handleExportProject}
          onOpenToolbox={handleOpenToolbox}
          onOpenTransformControls={handleOpenTransformControls}
          onClose={() => setShowMainMenu(false)}
          shapesCount={shapes.length}
          hasSelectedShape={!!selectedShape}
        />
      </SimpleBottomSheet>

      <SimpleBottomSheet
        isVisible={showToolbox}
        onClose={() => setShowToolbox(false)}
      >
        <Toolbox onAddShape={handleAddShape} />
      </SimpleBottomSheet>

      <SimpleBottomSheet
        isVisible={showTransformControls}
        onClose={() => setShowTransformControls(false)}
      >
        <TransformControls
          selectedShape={selectedShape}
          onUpdateShape={handleUpdateShape}
          onDeleteShape={handleDeleteShape}
        />
      </SimpleBottomSheet>

      <SimpleBottomSheet
        isVisible={showFileOperations}
        onClose={() => setShowFileOperations(false)}
      >
        <FileOperations
          shapes={shapes}
          onLoadProject={handleLoadProject}
          onClose={() => setShowFileOperations(false)}
        />
      </SimpleBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 48,
    height: 48,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  quickActions: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    gap: 12,
  },
  quickActionButton: {
    width: 56,
    height: 56,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
});

export default GRANTIC;
