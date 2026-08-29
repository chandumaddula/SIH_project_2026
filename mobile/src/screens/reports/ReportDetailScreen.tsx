import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from '../../components/Header';
import { colors } from '../../theme/colors';

export const ReportDetailScreen = ({ route }: any) => {
  const id = route?.params?.id || 'REP-LM-2026-001';

  return (
    <View style={styles.container}>
      <Header title="Official Form-1 Notice" subtitle={id} />
      <View style={styles.content}>
        <View style={styles.docCard}>
          <Text style={styles.govHeader}>GOVERNMENT OF INDIA • LEGAL METROLOGY</Text>
          <Text style={styles.docTitle}>FORM-1 SEIZURE MEMORANDUM</Text>
          <Text style={styles.docBody}>
            Seized commodities under Section 15 of Legal Metrology Act, 2009 for non-compliance with Packaged Commodities Rules 2011.
          </Text>
          <Text style={styles.signature}>Digitally Signed by Officer Rajesh Kumar</Text>
        </View>

        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Export PDF Inspection Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  content: { padding: 20 },
  docCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 20 },
  govHeader: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  docTitle: { color: '#000', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginVertical: 8 },
  docBody: { color: '#334155', fontSize: 12, lineHeight: 18 },
  signature: { color: '#16a34a', fontWeight: 'bold', fontSize: 11, marginTop: 16, textAlign: 'right' },
  btn: { backgroundColor: colors.primaryBlue, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
