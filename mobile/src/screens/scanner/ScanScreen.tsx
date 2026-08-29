import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView } from '../../components/CameraView';

export const ScanScreen = ({ navigation }: any) => {
  const handleCapture = () => {
    navigation?.navigate('ScanResult');
  };

  return (
    <View style={styles.container}>
      <CameraView onCapture={handleCapture} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }
});
