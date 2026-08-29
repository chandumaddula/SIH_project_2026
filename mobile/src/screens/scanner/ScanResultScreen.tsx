import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { colors } from '../../theme/colors';

export const ScanResultScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Header title="AI OCR Extraction Results" subtitle="Packaged Commodity Rules 2011" />
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Product Identity:</Text>
          <Text style={styles.fieldVal}>Refined Sunflower Cooking Oil</Text>
          
          <Text style={styles.fieldLabel}>Extracted Net Quantity:</Text>
          <Text style={styles.fieldVal}>1 Litre (Net Weight 910g)</Text>

          <Text style={styles.fieldLabel}>Extracted MRP:</Text>
          <Text style={[styles.fieldVal, { color: colors.govRed }]}>₹ 185.00 (Missing "incl. of all taxes")</Text>

          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>⚠️ Non-Compliance Detected</Text>
            <Text style={styles.statusDesc}>Rule 6(1)(e) violation. Compounding fee: ₹ 25,000.</Text>
          </View>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation?.navigate('OfficerHome')}
          >
            <Text style={styles.btnText}>Save Inspection Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  content: { padding: 20 },
  card: { backgroundColor: colors.cardDark, padding: 18, borderRadius: 12 },
  fieldLabel: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  fieldVal: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  statusBox: { backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 8, marginTop: 16 },
  statusTitle: { color: colors.govRed, fontWeight: 'bold', fontSize: 14 },
  statusDesc: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  actionBtn: { backgroundColor: colors.primaryBlue, padding: 14, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
