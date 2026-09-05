import os
import json
from typing import List, Dict, Optional
from rule_engine.models.rule_model import RuleDefinition

class RuleLoader:
    """
    Rule Loader module responsible for reading and parsing JSON legal rule definitions from rule_engine/rules/.
    """
    def __init__(self, rules_dir: Optional[str] = None):
        if rules_dir is None:
            rules_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rules")
        self.rules_dir = rules_dir
        self.rules: Dict[str, RuleDefinition] = {}
        self.load_all_rules()

    def load_all_rules(self) -> List[RuleDefinition]:
        self.rules.clear()
        if not os.path.exists(self.rules_dir):
            return []

        for root, _, files in os.walk(self.rules_dir):
            for file in files:
                if file.endswith(".json"):
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if isinstance(data, list):
                                for item in data:
                                    rule = RuleDefinition(**item)
                                    if rule.active:
                                        self.rules[rule.rule_id] = rule
                    except Exception as e:
                        print(f"Warning: Failed to load rule file {filepath}: {e}")

        return list(self.rules.values())

    def get_rule(self, rule_id: str) -> Optional[RuleDefinition]:
        return self.rules.get(rule_id)

    def get_all_rules(self) -> List[RuleDefinition]:
        return list(self.rules.values())

global_rule_loader = RuleLoader()
