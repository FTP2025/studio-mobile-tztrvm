
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../styles/commonStyles';
import Viewport3D from '../components/Viewport3D';
import Toolbox from '../components/Toolbox';
import TransformControls from '../components/TransformControls';
import FileOperations from '../components/FileOperations';
import MainMenu from '../components/MainMenu';
import SimpleBottomSheet from '../components/BottomSheet';
import Icon from '../components/Icon';
import { useShapes } from '../hooks/useShapes';
import { useFileOperations } from '../hooks/useFileOperations';

const GRANTIC: React.FC = () => {
  const [isMainMenuVisible, setIsMainMenuVisible] = useState(false);
  const [isToolboxVisible, setIsToolboxVisible] = useState(false);
  const [isTransformVisible, setIsTransformVisible] = useState(false);
  const [isFileOperationsVisible, setIsFileOperationsVisible] = useState(false);
  
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
  } = useShapes();

  const { saveProject, loadProject, exportProject, isSaving, isLoading } = useFileOperations();

  const handleShapeSelect = (id: string) => {
    selectShape(id);
    setIsTransformVisible(true);
    console.log('Shape selected, opening transform controls');
  };

  const handleShapeDeselect = () => {
    clearSelection();
    setIsTransformVisible(false);
    console.log('Shape deselected, closing transform controls');
  };

  const handleAddShape = (type: any) => {
    addShape(type);
    setIsToolboxVisible(false);
    setIsTransformVisible(true);
    console.log('Shape added, opening transform controls');
  };

  const handleUpdateShape = (id: string, updates: any) => {
    updateShape(id, updates);
  };

  const handleDeleteShape = (id: string) => {
    deleteShape(id);
    setIsTransformVisible(false);
    console.log('Shape deleted, closing transform controls');
  };

  const handleDuplicateShape = () => {
    if (selectedShapeId) {
      duplicateShape(selectedShapeId);
      console.log('Shape duplicated');
    }
  };

  const handleLoadProject = (newShapes: any[]) => {
    loadShapes(newShapes);
    closeAllBottomSheets();
    console.log('Project loaded with', newShapes.length, 'shapes');
  };

  const closeAllBottomSheets = () => {
    setIsMainMenuVisible(false);
    setIsToolboxVisible(false);
    setIsTransformVisible(false);
    setIsFileOperationsVisible(false);
  };

  // Main Menu Actions
  const handleNewProject = () => {
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
              loadShapes([]);
              closeAllBottomSheets();
              Alert.alert('New Project', 'Started a new project!');
            },
          },
        ]
      );
    } else {
      Alert.alert('New Project', 'Already working on a new project!');
      closeAllBottomSheets();
    }
  };

  const handleSaveProject = async () => {
    if (shapes.length === 0) {
      Alert.alert('No Shapes', 'Add some shapes to your project before saving.');
      return;
    }

    const name = `GRANTIC_Project_${new Date().toISOString().split('T')[0]}`;
    console.log('Saving project with name:', name);

    const result = await saveProject(shapes, name);
    
    if (result.success) {
      Alert.alert(
        'Project Saved',
        `Your project "${name}" has been saved successfully!`
      );
    } else {
      Alert.alert('Save Failed', result.error || 'Failed to save project');
    }
  };

  const handleLoadProjectFromMenu = async () => {
    console.log('Loading project from main menu...');
    
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
              handleLoadProject(result.data!.shapes);
              Alert.alert('Project Loaded', `"${result.data!.name}" loaded successfully!`);
            },
          },
        ]
      );
    } else {
      Alert.alert('Load Failed', result.error || 'Failed to load project');
    }
  };

  const handleExportProject = async () => {
    if (shapes.length === 0) {
      Alert.alert('No Shapes', 'Add some shapes to your project before exporting.');
      return;
    }

    const name = `GRANTIC_Export_${new Date().toISOString().split('T')[0]}`;
    console.log('Exporting project with name:', name);

    const result = await exportProject(shapes, name);
    
    if (result.success) {
      Alert.alert(
        'Project Exported',
        `Your project "${name}" has been exported successfully!`
      );
    } else {
      Alert.alert('Export Failed', result.error || 'Failed to export project');
    }
  };

  const handleOpenToolbox = () => {
    closeAllBottomSheets();
    setIsToolboxVisible(true);
  };

  const handleOpenTransformControls = () => {
    if (selectedShapeId) {
      closeAllBottomSheets();
      setIsTransformVisible(true);
    } else {
      Alert.alert('No Shape Selected', 'Please select a shape first to access transform controls.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Viewport */}
      <Viewport3D
        shapes={shapes}
        onShapeSelect={handleShapeSelect}
        onShapeDeselect={handleShapeDeselect}
        selectedShapeId={selectedShapeId}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[
            styles.navButton,
            isMainMenuVisible && styles.navButtonActive
          ]}
          onPress={() => {
            setIsMainMenuVisible(!isMainMenuVisible);
            setIsToolboxVisible(false);
            setIsTransformVisible(false);
            setIsFileOperationsVisible(false);
          }}
        >
          <Icon 
            name="menu-outline" 
            size={24} 
            color={isMainMenuVisible ? colors.background : colors.text} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            isToolboxVisible && styles.navButtonActive
          ]}
          onPress={() => {
            setIsToolboxVisible(!isToolboxVisible);
            setIsMainMenuVisible(false);
            setIsTransformVisible(false);
            setIsFileOperationsVisible(false);
          }}
        >
          <Icon 
            name="add-circle-outline" 
            size={24} 
            color={isToolboxVisible ? colors.background : colors.text} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            isTransformVisible && styles.navButtonActive
          ]}
          onPress={() => {
            if (selectedShapeId) {
              setIsTransformVisible(!isTransformVisible);
              setIsMainMenuVisible(false);
              setIsToolboxVisible(false);
              setIsFileOperationsVisible(false);
            } else {
              console.log('No shape selected for transform');
            }
          }}
          disabled={!selectedShapeId}
        >
          <Icon 
            name="options-outline" 
            size={24} 
            color={isTransformVisible ? colors.background : 
                   selectedShapeId ? colors.text : colors.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            isFileOperationsVisible && styles.navButtonActive
          ]}
          onPress={() => {
            setIsFileOperationsVisible(!isFileOperationsVisible);
            setIsMainMenuVisible(false);
            setIsToolboxVisible(false);
            setIsTransformVisible(false);
          }}
        >
          <Icon 
            name="folder-outline" 
            size={24} 
            color={isFileOperationsVisible ? colors.background : colors.text} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            handleShapeDeselect();
            closeAllBottomSheets();
          }}
        >
          <Icon name="home-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        {selectedShapeId && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleDuplicateShape}
          >
            <Icon name="copy-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Menu Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isMainMenuVisible}
        onClose={() => setIsMainMenuVisible(false)}
      >
        <MainMenu
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onLoadProject={handleLoadProjectFromMenu}
          onExportProject={handleExportProject}
          onOpenToolbox={handleOpenToolbox}
          onOpenTransformControls={handleOpenTransformControls}
          onClose={() => setIsMainMenuVisible(false)}
          shapesCount={shapes.length}
          hasSelectedShape={!!selectedShapeId}
        />
      </SimpleBottomSheet>

      {/* Toolbox Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isToolboxVisible}
        onClose={() => setIsToolboxVisible(false)}
      >
        <Toolbox onAddShape={handleAddShape} />
      </SimpleBottomSheet>

      {/* Transform Controls Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isTransformVisible}
        onClose={() => setIsTransformVisible(false)}
      >
        <TransformControls
          selectedShape={getSelectedShape()}
          onUpdateShape={handleUpdateShape}
          onDeleteShape={handleDeleteShape}
        />
      </SimpleBottomSheet>

      {/* File Operations Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isFileOperationsVisible}
        onClose={() => setIsFileOperationsVisible(false)}
      >
        <FileOperations
          shapes={shapes}
          onLoadProject={handleLoadProject}
          onClose={() => setIsFileOperationsVisible(false)}
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  navButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  navButtonActive: {
    backgroundColor: colors.primary,
  },
});

export default GRANTIC;
