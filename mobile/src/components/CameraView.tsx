import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface CameraViewProps {
  onCapture: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  return (
    <View style={styles.cameraContainer}>
      <View style={styles.viewfinder}>
        <Text style={styles.hint}>Align Commodity Package Label within Frame</Text>
      </View>
      <TouchableOpacity style={styles.captureBtn} onPress={onCapture}>
        <View style={styles.innerBtn} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30
  },
  viewfinder: {
    width: '85%',
    height: '70%',
    borderWidth: 2,
    borderColor: colors.accentGold,
    borderRadius: 16,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hint: {
    color: colors.textLight,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 6,
    fontSize: 12
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  innerBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryBlue
  }
});
