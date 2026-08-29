import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from '../../components/Header';
import { colors } from '../../theme/colors';

export const CitizenHomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Header title="Citizen Metrology Hub" subtitle="Scan & Verify Packaged Goods" />
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.cardBtn}
          onPress={() => navigation?.navigate('Scan')}
        >
          <Text style={styles.cardTitle}>🔍 Scan Package Label</Text>
          <Text style={styles.cardDesc}>Verify Net Qty, MRP, & Manufacturer declarations</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.cardBtn, { borderColor: colors.accentGold }]}
          onPress={() => navigation?.navigate('Complaint')}
        >
          <Text style={styles.cardTitle}>⚠️ File Consumer Complaint</Text>
          <Text style={styles.cardDesc}>Report Dual MRP or Short Net Weight with photo evidence</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  content: { padding: 20 },
  cardBtn: {
    backgroundColor: colors.cardDark,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.govGreen,
    marginBottom: 16
  },
  cardTitle: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: colors.textMuted }
});
