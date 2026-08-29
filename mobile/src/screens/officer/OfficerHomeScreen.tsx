import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Header } from '../../components/Header';
import { colors } from '../../theme/colors';

export const OfficerHomeScreen = ({ navigation }: any) => {
  const recentInspections = [
    { id: 'SESS-9012', item: 'Refined Edible Oil 1L', status: 'VIOLATION', time: '10:45 AM' },
    { id: 'SESS-8941', item: 'Packaged Milk 500ml', status: 'PASS', time: '09:20 AM' }
  ];

  return (
    <View style={styles.container}>
      <Header title="Officer Field Console" subtitle="Legal Metrology Enforcement Officer" />
      
      <View style={styles.body}>
        <TouchableOpacity 
          style={styles.scanBtn}
          onPress={() => navigation?.navigate('Scan')}
        >
          <Text style={styles.scanBtnText}>📸 Start New Field AI Label Inspection</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Today's Inspections & Audit Logs</Text>

        {recentInspections.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => navigation?.navigate('InspectionDetail', { item })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.item}</Text>
              <Text style={styles.cardSub}>{item.id} • {item.time}</Text>
            </View>
            <Text style={[styles.badge, { color: item.status === 'VIOLATION' ? colors.govRed : colors.govGreen }]}>
              {item.status}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[styles.scanBtn, { backgroundColor: colors.cardDark, borderColor: colors.borderSubtle, marginTop: 12 }]}
          onPress={() => navigation?.navigate('ReportList')}
        >
          <Text style={styles.scanBtnText}>📑 View Form-1 Seizure Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgDark },
  body: { padding: 20 },
  scanBtn: {
    backgroundColor: colors.primaryBlue,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#38bdf8'
  },
  scanBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sectionHeader: { color: colors.textLight, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  card: {
    backgroundColor: colors.cardDark,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cardSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  badge: { fontWeight: 'bold', fontSize: 12 }
});
