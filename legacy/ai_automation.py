from __future__ import annotations

import random
from collections import Counter

from vulnerability_manager import SEVERITY_RANK


ACTION_COOLDOWNS = {
    "patch_vulnerability": 10,
    "block_ip": 16,
    "scan_network": 8,
    "monitor_traffic": 8,
}


def analyze_threats(logs: list[dict]) -> tuple[int, str | None]:
    severity_weights = {"low": 1, "medium": 3, "high": 6}
    attack_weights = {
        "ddos": 5,
        "malware": 4,
        "phishing": 3,
        "data_exfiltration": 6,
        "port_scan": 2,
        "ransomware": 7,
        "normal": 0,
    }

    threat_score = 0
    for log in logs[:10]:
        threat_score += severity_weights.get(log.get("severity"), 1)
        threat_score += attack_weights.get(log.get("attack_type"), 1)

    if threat_score > 70:
        return threat_score, "patch_vulnerability"
    if threat_score > 35:
        return threat_score, "monitor_traffic"
    return threat_score, "scan_network"


def choose_action(
    *,
    state: dict,
    vulnerability_findings: list[dict],
    can_do,
    recent_actions: list[dict],
) -> tuple[str | None, str, str | None]:
    logs = state.get("logs", [])[:10]
    health = state.get("system_health", 100)
    threat_score = state.get("threat_score", 0)

    attack_counts = Counter(log.get("attack_type") for log in logs if log.get("attack_type") != "normal")
    severity_counts = Counter(log.get("severity") for log in logs if log.get("attack_type") != "normal")

    unpatched_findings = sorted(
        [finding for finding in vulnerability_findings if not finding.get("patched")],
        key=lambda item: (SEVERITY_RANK[item["severity"]], item.get("risk_score", 0)),
        reverse=True,
    )

    target_vuln = unpatched_findings[0]["id"] if unpatched_findings else None
    last_action = recent_actions[-1]["action"] if recent_actions else None

    if target_vuln and can_do("patch_vulnerability"):
        high_priority = unpatched_findings[0]["severity"] in {"critical", "high"}
        if high_priority or attack_counts.get("malware", 0) or attack_counts.get("ransomware", 0):
            return "patch_vulnerability", f"auto-patch required for {target_vuln}", target_vuln

    if health < 40:
        safe_actions = ["monitor_traffic", "scan_network"]
        for action in safe_actions:
            if can_do(action):
                return action, "system health is below 40 so safe defense actions are prioritized", None

    if attack_counts.get("ddos", 0) >= 2 and can_do("block_ip") and last_action != "block_ip":
        return "block_ip", "repeated ddos activity detected", None

    if severity_counts.get("high", 0) >= 2 and health > 55 and can_do("block_ip") and last_action != "block_ip":
        return "block_ip", "multiple high severity events justify aggressive blocking", None

    if threat_score > 60 and can_do("monitor_traffic"):
        return "monitor_traffic", "elevated threat score requires traffic monitoring", None

    if can_do("scan_network"):
        return "scan_network", "routine automated scan to refresh defense posture", None

    if can_do("monitor_traffic"):
        return "monitor_traffic", "fallback monitoring while other actions cool down", None

    return None, "all autonomous actions are cooling down", target_vuln


def adaptive_interval(system_health: int, threat_score: int, rapid_health_drop: bool) -> int:
    if rapid_health_drop or system_health < 30:
        return random.randint(10, 14)
    if system_health < 50:
        return 10
    if threat_score > 70:
        return 8
    if threat_score > 40:
        return 9
    return 8
