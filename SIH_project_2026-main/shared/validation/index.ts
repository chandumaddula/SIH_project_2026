import { MANDATORY_DECLARATIONS } from '../constants';
import { ExtractedField } from '../types';

export function checkMissingDeclarations(extractedFields: ExtractedField[]): string[] {
  const foundKeys = new Set(extractedFields.map((f) => f.key.toUpperCase()));
  return MANDATORY_DECLARATIONS.filter((declaration) => !foundKeys.has(declaration));
}

export function validateMRPFormat(mrpString: string): boolean {
  // Checks for currency symbol or Rs. / INR format and numeric value
  const mrpRegex = /^(?:₹|Rs\.?|INR)?\s*\d+(?:\.\d{1,2})?\s*(?:\(Inclusive of all taxes\))?/i;
  return mrpRegex.test(mrpString.trim());
}
