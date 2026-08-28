import unittest
from rule_engine.rules.packaged_commodity_rules import LegalMetrologyRuleEngine

class TestRuleEngine(unittest.TestCase):
    def test_missing_declaration(self):
        engine = LegalMetrologyRuleEngine()
        res = engine.evaluate({"MRP": "Rs. 100"})
        self.assertEqual(res["status"], "POTENTIAL_ISSUE")
        self.assertGreater(len(res["violations"]), 0)

if __name__ == '__main__':
    unittest.main()
