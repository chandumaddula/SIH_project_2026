import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from '../../components/Header';
import { colors } from '../../theme/colors';

export const InspectionDetailScreen = ({ route, navigation }: any) => {
  const item = route?.params?.item || { id: 'SESS-9012', item: 'Refined Edible Oil 1L', status: 'VIOLATION' };

  return (
    <View style={styles.container}>
      <Header title="Inspection Evidence Detail" subtitle={`Session ID: ${item.id}`} />
      <View style={styles.content}>
        <View style={styles.box}>
          <Text style={styles.label}>Commodity Name:</Text>
          <Text style={styles.val}>{item.item}</Text>
          
          <Text style={[styles.label, { marginTop: 10 }]}>Detected Non-Compliance:</Text>
          <Text style={[styles.val, { color: colors.govRed }]}>Rule 6(1)(e) - MRP Font Height &lt; 3.0mm & Missing "incl. of all taxes"</Text>
        </View>

        <TouchableOpacity 
          style={styles.btn}
          onPress={() => navigation?.navigate('ReportDetail', { id: item.id })}
        >
          <Text style={styles.btnText}>Generate Digital Seizure Memo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  content: { padding: 20 },
  box: { backgroundColor: colors.cardDark, padding: 16, borderRadius: 10, marginBottom: 20 },
  label: { color: colors.textMuted, fontSize: 12 },
  val: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  btn: { backgroundColor: colors.accentGold, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
