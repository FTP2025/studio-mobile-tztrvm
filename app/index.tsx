
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../styles/commonStyles';
import Viewport3D from '../components/Viewport3D';
import Toolbox from '../components/Toolbox';
import TransformControls from '../components/TransformControls';
import SimpleBottomSheet from '../components/BottomSheet';
import Icon from '../components/Icon';
import { useShapes } from '../hooks/useShapes';

const GRANTIC: React.FC = () => {
  const [isToolboxVisible, setIsToolboxVisible] = useState(false);
  const [isTransformVisible, setIsTransformVisible] = useState(false);
  
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
  } = useShapes();

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
            isToolboxVisible && styles.navButtonActive
          ]}
          onPress={() => {
            setIsToolboxVisible(!isToolboxVisible);
            if (isTransformVisible) setIsTransformVisible(false);
          }}
        >
          <Icon 
            name="add-circle-outline" 
            size={24} 
            color={isToolboxVisible ? colors.backgroundAlt : colors.text} 
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
              if (isToolboxVisible) setIsToolboxVisible(false);
            } else {
              console.log('No shape selected for transform');
            }
          }}
          disabled={!selectedShapeId}
        >
          <Icon 
            name="options-outline" 
            size={24} 
            color={isTransformVisible ? colors.backgroundAlt : 
                   selectedShapeId ? colors.text : colors.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            handleShapeDeselect();
            setIsToolboxVisible(false);
            setIsTransformVisible(false);
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
