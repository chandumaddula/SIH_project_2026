import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Header } from '../../components/Header';
import { colors } from '../../theme/colors';

export const ReportListScreen = ({ navigation }: any) => {
  const reports = [
    { id: 'REP-LM-2026-001', trader: 'Metro Supermarket Ltd', date: '29 Aug 2026', penalty: '₹ 25,000' },
    { id: 'REP-LM-2026-002', trader: 'Reliance Fresh Store 4', date: '28 Aug 2026', penalty: '₹ 50,000' }
  ];

  return (
    <View style={styles.container}>
      <Header title="Form-1 Inspection Reports" subtitle="Digital Seizure & Compounding Notices" />
      <View style={styles.content}>
        {reports.map((r) => (
          <TouchableOpacity 
            key={r.id} 
            style={styles.card}
            onPress={() => navigation?.navigate('ReportDetail', { id: r.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{r.trader}</Text>
              <Text style={styles.sub}>{r.id} • {r.date}</Text>
            </View>
            <Text style={styles.penalty}>{r.penalty}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  content: { padding: 20 },
  card: { backgroundColor: colors.cardDark, padding: 14, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontWeight: 'bold' },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  penalty: { color: colors.accentGold, fontWeight: 'bold' }
});
