
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../styles/commonStyles';
import { useShapes } from '../hooks/useShapes';
import { useCharacters } from '../hooks/useCharacters';
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
    clearSelection: clearShapeSelection,
    getSelectedShape,
    duplicateShape,
    loadShapes,
    clearAllShapes,
    getProjectData,
  } = useShapes();

  const {
    characters,
    selectedCharacterId,
    spawnCharacter,
    selectCharacter,
    updateCharacter,
    deleteCharacter,
    clearSelection: clearCharacterSelection,
    getSelectedCharacter,
    duplicateCharacter,
    loadCharacters,
    clearAllCharacters,
  } = useCharacters();

  const { saveProject, loadProject, exportProject } = useFileOperations();

  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);
  const [showTransformControls, setShowTransformControls] = useState(false);
  const [showFileOperations, setShowFileOperations] = useState(false);

  const selectedShape = getSelectedShape();
  const selectedCharacter = getSelectedCharacter();
  const selectedEntityType = selectedShape ? 'shape' : selectedCharacter ? 'character' : null;

  const handleShapeSelect = (id: string) => {
    selectShape(id);
    clearCharacterSelection();
    console.log('Selected shape:', id);
  };

  const handleCharacterSelect = (id: string) => {
    selectCharacter(id);
    clearShapeSelection();
    console.log('Selected character:', id);
  };

  const handleDeselect = () => {
    clearShapeSelection();
    clearCharacterSelection();
    console.log('Deselected all entities');
  };

  const handleAddShape = (type: any) => {
    addShape(type);
    closeAllBottomSheets();
  };

  const handleSpawnCharacter = (type: any) => {
    spawnCharacter(type);
    closeAllBottomSheets();
  };

  const handleUpdateShape = (id: string, updates: any) => {
    updateShape(id, updates);
  };

  const handleUpdateCharacter = (id: string, updates: any) => {
    updateCharacter(id, updates);
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

  const handleDeleteCharacter = (id: string) => {
    Alert.alert(
      'Delete Character',
      'Are you sure you want to delete this character?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteCharacter(id);
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

  const handleDuplicateCharacter = () => {
    if (selectedCharacterId) {
      duplicateCharacter(selectedCharacterId);
    }
  };

  const handleLoadProject = (projectData: any) => {
    if (projectData.shapes) {
      loadShapes(projectData.shapes);
    }
    if (projectData.characters) {
      loadCharacters(projectData.characters);
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
      'This will clear all shapes and characters. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            clearAllShapes();
            clearAllCharacters();
            closeAllBottomSheets();
          },
        },
      ]
    );
  };

  const handleSaveProject = async () => {
    try {
      const projectData = {
        ...getProjectData(),
        characters: characters.map(char => ({ ...char, selected: false })),
        characterCount: characters.length,
      };
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
      const projectData = {
        ...getProjectData(),
        characters: characters.map(char => ({ ...char, selected: false })),
        characterCount: characters.length,
      };
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

  const totalEntities = shapes.length + characters.length;
  const hasSelectedEntity = !!(selectedShape || selectedCharacter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Viewport2D
          shapes={shapes}
          characters={characters}
          onShapeSelect={handleShapeSelect}
          onCharacterSelect={handleCharacterSelect}
          onDeselect={handleDeselect}
          selectedEntityId={selectedShapeId || selectedCharacterId}
          selectedEntityType={selectedEntityType}
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

          {hasSelectedEntity && (
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
          hasSelectedShape={hasSelectedEntity}
        />
      </SimpleBottomSheet>

      <SimpleBottomSheet
        isVisible={showToolbox}
        onClose={() => setShowToolbox(false)}
      >
        <Toolbox
          onAddShape={handleAddShape}
          onSpawnCharacter={handleSpawnCharacter}
        />
      </SimpleBottomSheet>

      <SimpleBottomSheet
        isVisible={showTransformControls}
        onClose={() => setShowTransformControls(false)}
      >
        <TransformControls
          selectedShape={selectedShape}
          selectedCharacter={selectedCharacter}
          onUpdateShape={handleUpdateShape}
          onUpdateCharacter={handleUpdateCharacter}
          onDeleteShape={handleDeleteShape}
          onDeleteCharacter={handleDeleteCharacter}
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
