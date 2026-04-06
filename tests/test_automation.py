import json
import random
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from environment import CyberShieldEnv
from server import app


class CyberShieldAutomationTests(unittest.TestCase):
    def setUp(self):
        random.seed(7)
        self.env = CyberShieldEnv()
        self.env.reset()

    def test_detects_vuln_five_and_six_from_recent_logs(self):
        self.env.logs = [
            {"timestamp": 1, "source_ip": "10.1.1.5", "attack_type": "malware", "severity": "high"},
            {"timestamp": 2, "source_ip": "10.1.1.6", "attack_type": "ransomware", "severity": "high"},
            {"timestamp": 3, "source_ip": "10.1.1.7", "attack_type": "data_exfiltration", "severity": "medium"},
        ]

        self.env._refresh_observability(scan_results=[])

        findings = {item["id"]: item for item in self.env.vulnerability_manager.findings_as_list()}
        self.assertTrue(findings["vuln-5"]["detected"])
        self.assertTrue(findings["vuln-6"]["detected"])
        self.assertFalse(findings["vuln-5"]["patched"])

    def test_autonomous_cycle_patches_critical_vulnerabilities_and_recovers_health(self):
        self.env.logs = [
            {"timestamp": 1, "source_ip": "10.1.1.5", "attack_type": "ransomware", "severity": "high"},
            {"timestamp": 2, "source_ip": "10.1.1.6", "attack_type": "malware", "severity": "high"},
            {"timestamp": 3, "source_ip": "10.1.1.7", "attack_type": "ransomware", "severity": "high"},
        ]
        self.env.system_health = 62
        self.env._refresh_observability(scan_results=[])

        previous_health = self.env.system_health
        result = self.env.autonomous_cycle()

        self.assertEqual(result["executed_action"], "patch_vulnerability")
        self.assertGreaterEqual(self.env.patched_vulnerabilities, 1)
        self.assertIn(self.env.latest_patch_result["vulnerability_id"], {"vuln-5", "vuln-6"})
        self.assertGreaterEqual(self.env.system_health, previous_health)

    def test_reports_are_written_in_machine_and_human_readable_formats(self):
        self.env.logs = [
            {"timestamp": 1, "source_ip": "10.2.0.1", "attack_type": "malware", "severity": "high"},
            {"timestamp": 2, "source_ip": "10.2.0.2", "attack_type": "ddos", "severity": "medium"},
        ]
        self.env._refresh_observability(scan_results=[])
        self.env.autonomous_cycle()

        report_paths = self.env.latest_report_paths
        json_path = Path(report_paths["json"])
        text_path = Path(report_paths["text"])

        self.assertTrue(json_path.exists())
        self.assertTrue(text_path.exists())

        payload = json.loads(json_path.read_text(encoding="utf-8"))
        self.assertIn("system_health", payload)
        self.assertIn("patched_vulnerabilities", payload)
        self.assertIn("defense_events_triggered", payload)

    def test_fastapi_endpoints_remain_compatible(self):
        client = TestClient(app)

        response = client.get("/state")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("logs", data)
        self.assertIn("system_health", data)
        self.assertIn("blocked_ips", data)

        step_response = client.post("/step", json={"action": "scan_network"})
        self.assertEqual(step_response.status_code, 200)
        self.assertIn("state", step_response.json())


if __name__ == "__main__":
    unittest.main()
