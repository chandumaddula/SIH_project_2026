import os
import json
from typing import List, Dict, Optional
from rule_engine.models.rule_model import RuleDefinition

class RuleRegistry:
    """
    Central Knowledge Base Registry for Legal Metrology Rules.
    Loads and indexes structured rule JSON definitions from rule subdirectories.
    """
    def __init__(self, rules_base_dir: Optional[str] = None):
        if rules_base_dir is None:
            rules_base_dir = os.path.dirname(os.path.abspath(__file__))
        self.rules_base_dir = rules_base_dir
        self.rules: Dict[str, RuleDefinition] = {}
        self.load_rules()

    def load_rules(self) -> None:
        """Scan subdirectories and load all active rule JSON files."""
        self.rules.clear()
        for root, _, files in os.walk(self.rules_base_dir):
            for file in files:
                if file.endswith(".json"):
                    full_path = os.path.join(root, file)
                    try:
                        with open(full_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if isinstance(data, list):
                                for item in data:
                                    rule = RuleDefinition(**item)
                                    if rule.active:
                                        self.rules[rule.rule_id] = rule
                    except Exception as e:
                        print(f"Warning: Failed to load rule file {full_path}: {e}")

    def get_rule(self, rule_id: str) -> Optional[RuleDefinition]:
        return self.rules.get(rule_id)

    def get_all_rules(self) -> List[RuleDefinition]:
        return list(self.rules.values())

    def get_rules_by_category(self, category: str) -> List[RuleDefinition]:
        return [r for r in self.rules.values() if r.category == category]

    def get_rules_by_field(self, field: str) -> List[RuleDefinition]:
        return [r for r in self.rules.values() if r.field == field]

# Global singleton instance
global_rule_registry = RuleRegistry()
