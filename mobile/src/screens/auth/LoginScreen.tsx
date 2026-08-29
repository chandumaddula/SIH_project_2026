import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.logoTitle}>⚖️ e-Metrology Mobile</Text>
      <Text style={styles.subTitle}>Legal Metrology Officer & Citizen Field App</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Officer ID / Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="officer.rajesh@gov.in"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Security Passcode</Text>
        <TextInput 
          style={styles.input} 
          placeholder="••••••••"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation?.navigate('OfficerHome')}
        >
          <Text style={styles.btnText}>Officer Console Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.govGreen, marginTop: 10 }]}
          onPress={() => navigation?.navigate('CitizenHome')}
        >
          <Text style={styles.btnText}>Citizen / Public Access Mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    padding: 24,
    justifyContent: 'center'
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    textAlign: 'center'
  },
  subTitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32
  },
  formCard: {
    backgroundColor: colors.cardDark,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  label: {
    color: colors.textLight,
    fontSize: 13,
    marginBottom: 6
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  button: {
    backgroundColor: colors.primaryBlue,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  }
});
