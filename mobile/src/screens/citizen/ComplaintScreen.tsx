import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from '../../components/Header';
import { colors } from '../../theme/colors';

export const ComplaintScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Header title="Report Metrology Violation" subtitle="Direct Submission to Field Officer" />
      <View style={styles.form}>
        <Text style={styles.label}>Product / Retailer Store Name</Text>
        <TextInput style={styles.input} placeholder="Store Name / Brand Name" placeholderTextColor="#64748b" />
        <Text style={styles.label}>Violation Type</Text>
        <TextInput style={styles.input} placeholder="e.g. Dual MRP Stamping" placeholderTextColor="#64748b" />
        <TouchableOpacity style={styles.button} onPress={() => navigation?.goBack()}>
          <Text style={styles.btnText}>Submit Grievance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  form: { padding: 20 },
  label: { color: colors.textLight, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: colors.cardDark, borderRadius: 8, padding: 12, color: '#fff', marginBottom: 16 },
  button: { backgroundColor: colors.govGreen, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
