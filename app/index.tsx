
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
    selectShape(id);
    console.log('Selected shape:', id);
  };

  const handleShapeDeselect = () => {
    clearSelection();
    console.log('Deselected all shapes');
  };

  const handleAddShape = (type: any) => {
    addShape(type);
    closeAllBottomSheets();
  };

  const handleUpdateShape = (id: string, updates: any) => {
    updateShape(id, updates);
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
            deleteShape(id);
            closeAllBottomSheets();
          }
        },
      ]
    );
  };

  const handleDuplicateShape = () => {
    if (selectedShapeId) {
      duplicateShape(selectedShapeId);
    }
  };

  const handleLoadProject = (projectData: any) => {
    if (projectData.shapes) {
      loadShapes(projectData.shapes);
    }
    closeAllBottomSheets();
  };

  const closeAllBottomSheets = () => {
    setShowMainMenu(false);
    setShowToolbox(false);
    setShowTransformControls(false);
    setShowFileOperations(false);
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
            clearAllShapes();
            closeAllBottomSheets();
          },
        },
      ]
    );
  };

  const handleSaveProject = async () => {
    try {
      const projectData = getProjectData();
      await saveProject(projectData);
      closeAllBottomSheets();
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Save Failed', 'Could not save the project.');
    }
  };

  const handleLoadProjectFromMenu = () => {
    setShowFileOperations(true);
    setShowMainMenu(false);
  };

  const handleExportProject = async () => {
    try {
      const projectData = getProjectData();
      await exportProject(projectData);
      closeAllBottomSheets();
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Could not export the project.');
    }
  };

  const handleOpenToolbox = () => {
    setShowToolbox(true);
    setShowMainMenu(false);
  };

  const handleOpenTransformControls = () => {
    setShowTransformControls(true);
    setShowMainMenu(false);
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
