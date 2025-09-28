
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { colors } from '../styles/commonStyles';

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
}

const SNAP_POINTS = [0, 0.4, 0.8];

const SimpleBottomSheet: React.FC<SimpleBottomSheetProps> = ({
  children,
  isVisible = false,
  onClose,
}) => {
  const [snapIndex, setSnapIndex] = useState(1);
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Show the bottom sheet
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: Dimensions.get('window').height * (1 - SNAP_POINTS[snapIndex]),
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide the bottom sheet
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: Dimensions.get('window').height,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, translateY, backdropOpacity, snapIndex]);

  const handleBackdropPress = () => {
    console.log('Backdrop pressed, closing bottom sheet');
    onClose?.();
  };

  const snapToPoint = (point: number) => {
    const screenHeight = Dimensions.get('window').height;
    const targetY = screenHeight * (1 - SNAP_POINTS[point]);
    
    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    setSnapIndex(point);
    console.log('Snapped to point:', point);
  };

  const getClosestSnapPoint = (currentY: number, velocityY: number): number => {
    const screenHeight = Dimensions.get('window').height;
    const currentProgress = 1 - currentY / screenHeight;
    
    // If velocity is high, consider direction
    if (Math.abs(velocityY) > 1000) {
      if (velocityY > 0) {
        // Swiping down - go to lower snap point or close
        if (currentProgress < SNAP_POINTS[1]) {
          return 0; // Close
        }
        return Math.max(0, snapIndex - 1);
      } else {
        // Swiping up - go to higher snap point
        return Math.min(SNAP_POINTS.length - 1, snapIndex + 1);
      }
    }
    
    // Find closest snap point
    let closestIndex = 0;
    let minDistance = Math.abs(currentProgress - SNAP_POINTS[0]);
    
    for (let i = 1; i < SNAP_POINTS.length; i++) {
      const distance = Math.abs(currentProgress - SNAP_POINTS[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  };

  const onGestureEvent = (event: any) => {
    const { translationY } = event.nativeEvent;
    gestureTranslateY.setValue(translationY);
    
    const screenHeight = Dimensions.get('window').height;
    const baseY = screenHeight * (1 - SNAP_POINTS[snapIndex]);
    const newY = Math.max(0, baseY + translationY);
    
    translateY.setValue(newY);
  };

  const onHandlerStateChange = (event: any) => {
    const { state, translationY, velocityY } = event.nativeEvent;
    
    if (state === State.END) {
      const screenHeight = Dimensions.get('window').height;
      const baseY = screenHeight * (1 - SNAP_POINTS[snapIndex]);
      const currentY = baseY + translationY;
      
      const targetSnapIndex = getClosestSnapPoint(currentY, velocityY);
      
      if (targetSnapIndex === 0) {
        // Close the bottom sheet
        onClose?.();
      } else {
        snapToPoint(targetSnapIndex);
      }
      
      gestureTranslateY.setValue(0);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.content}>
              {children}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: Dimensions.get('window').height * 0.4,
    maxHeight: Dimensions.get('window').height * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
});

export default SimpleBottomSheet;
