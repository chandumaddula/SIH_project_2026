// Legal Metrology PCR 2011 Mobile Checker Utility
export interface RuleResult {
  ruleId: string;
  passed: boolean;
  message: string;
}

export const checkPcrCompliance = (mrpText: string, netQtyText: string): RuleResult[] => {
  const results: RuleResult[] = [];
  
  const hasInclTaxes = mrpText.toLowerCase().includes('incl') || mrpText.toLowerCase().includes('taxes');
  results.push({
    ruleId: 'Rule 6(1)(e)',
    passed: hasInclTaxes,
    message: hasInclTaxes ? 'MRP includes required tax statement' : 'Violation: MRP missing "incl. of all taxes"'
  });

  const hasStandardUnit = /\b(g|kg|ml|l|n)\b/i.test(netQtyText);
  results.push({
    ruleId: 'Rule 11',
    passed: hasStandardUnit,
    message: hasStandardUnit ? 'Net quantity uses standard legal unit' : 'Violation: Non-standard unit specified'
  });

  return results;
};
