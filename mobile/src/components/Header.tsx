import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primaryNavy,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle
  },
  title: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold'
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4
  }
});
