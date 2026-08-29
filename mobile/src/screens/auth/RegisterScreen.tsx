import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const RegisterScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Officer / Citizen Registration</Text>
      <View style={styles.formCard}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Inspector Name / Citizen Name" placeholderTextColor="#64748b" />
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput style={styles.input} placeholder="+91 98765 43210" placeholderTextColor="#64748b" keyboardType="phone-pad" />
        <TouchableOpacity style={styles.button} onPress={() => navigation?.navigate('Login')}>
          <Text style={styles.btnText}>Register Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark, padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, color: colors.textLight, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  formCard: { backgroundColor: colors.cardDark, padding: 20, borderRadius: 12 },
  label: { color: colors.textLight, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#0f172a', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 16 },
  button: { backgroundColor: colors.primaryBlue, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
