import { colors } from './colors';

export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    padding: 16
  },
  card: {
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.textLight,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted
  }
};
