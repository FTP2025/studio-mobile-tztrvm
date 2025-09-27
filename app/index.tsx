
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../styles/commonStyles';
import { useShapes } from '../hooks/useShapes';
import Viewport3D from '../components/Viewport3D';
import Toolbox from '../components/Toolbox';
import TransformControls from '../components/TransformControls';
import SimpleBottomSheet from '../components/BottomSheet';
import Icon from '../components/Icon';

export default function RobloxStudioMobile() {
  const {
    shapes,
    selectedShapeId,
    addShape,
    selectShape,
    updateShape,
    deleteShape,
    clearSelection,
    getSelectedShape,
  } = useShapes();

  const [isPropertiesVisible, setIsPropertiesVisible] = useState(false);

  const handleShapeSelect = (id: string) => {
    selectShape(id);
    setIsPropertiesVisible(true);
  };

  const handleShapeDeselect = () => {
    clearSelection();
    setIsPropertiesVisible(false);
  };

  const selectedShape = getSelectedShape();

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Viewport */}
      <View style={styles.viewport}>
        <Viewport3D
          shapes={shapes}
          onShapeSelect={handleShapeSelect}
          onShapeDeselect={handleShapeDeselect}
        />
        
        {/* Properties Button */}
        {selectedShape && (
          <TouchableOpacity
            style={styles.propertiesButton}
            onPress={() => setIsPropertiesVisible(true)}
          >
            <Icon name="settings-outline" size={20} color={colors.backgroundAlt} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Toolbox */}
      <Toolbox onAddShape={addShape} />

      {/* Properties Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isPropertiesVisible}
        onClose={() => setIsPropertiesVisible(false)}
      >
        <TransformControls
          selectedShape={selectedShape}
          onUpdateShape={updateShape}
          onDeleteShape={(id) => {
            deleteShape(id);
            setIsPropertiesVisible(false);
          }}
        />
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  viewport: {
    flex: 1,
    position: 'relative',
  },
  propertiesButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...commonStyles.shadow,
  },
});
