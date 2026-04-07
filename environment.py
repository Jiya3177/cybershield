from __future__ import annotations

import logging
import random
import threading
import time
from collections import Counter
from pathlib import Path
from typing import Any

from ai_automation import ACTION_COOLDOWNS, adaptive_interval, analyze_threats as automation_analyze_threats, choose_action
from reward_utils import normalize_reward
from synthetic_logs import generate_log, generate_logs
from vulnerability_manager import VulnerabilityManager


logger = logging.getLogger("cybershield.ai")
SAFE_ACTIONS = {"scan_network", "monitor_traffic"}


def analyze_threats(logs):
    return automation_analyze_threats(logs)


def decide_action(state):
    logs = state.get("logs", [])
    attack_counts = Counter(log.get("attack_type") for log in logs if log.get("attack_type") != "normal")
    system_health = state.get("system_health", 100)

    if system_health < 50:
        return "monitor_traffic", "system health dropped below 50"
    if attack_counts.get("ransomware", 0) or attack_counts.get("malware", 0):
        return "patch_vulnerability", "malware-family activity detected"
    if attack_counts.get("ddos", 0) >= 2:
        return "block_ip", "repeated ddos attacks detected"
    if attack_counts:
        return "scan_network", "suspicious activity requires network scan"
    return None, "no autonomous action required"


class CyberShieldEnv:
    def __init__(self):
        self.lock = threading.Lock()
        self.reports_dir = Path(__file__).resolve().parent / "reports"
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.vulnerability_manager = VulnerabilityManager(self.reports_dir)
        self.actions = ["scan_network", "block_ip", "patch_vulnerability", "monitor_traffic"]
        self.agent_profile = {
            "agent_name": "CyberShield Sentinel",
            "display_preferences": {
                "high_contrast_charts": True,
                "compact_mode": False,
                "map_focus": "india",
            },
        }
        self.cumulative_score = 0.0
        self.latest_reward = 0.0
        self.latest_raw_reward = 0.0
        self.active_task: dict[str, Any] = {
            "task_name": "free_play",
            "description": "Default CyberShield autonomous monitoring scenario",
            "max_steps": 20,
            "seed": None,
        }
        self.pending_task_config: dict[str, Any] | None = None
        self.reset()

    def configure_task(self, task_config: dict[str, Any] | None):
        with self.lock:
            self.pending_task_config = dict(task_config) if task_config else None
            return self.pending_task_config

    def reset(self):
        with self.lock:
            task_config = self.pending_task_config or self.active_task
            seed = task_config.get("seed")
            if seed is not None:
                random.seed(seed)

            initial_logs = task_config.get("initial_logs")
            self.logs = list(initial_logs) if initial_logs else generate_logs(6)
            self.current_step = 0
            self.system_health = 100
            self.blocked_ips = set()
            self.threat_score = 0
            self.recommended_action = None
            self.last_decision_reason = "environment reset"
            self.last_action_time = {}
            self.recent_actions = []
            self.threat_timeline = []
            self.health_history = []
            self.ai_interval_seconds = 3
            self.emergency_mode = False
            self.health_warning = False
            self.defense_events_triggered = 0
            self.patched_vulnerabilities = 0
            self.latest_patch_result = None
            self.latest_report_paths = {}
            self.latest_reward = 0.0
            self.latest_raw_reward = 0.0
            self.active_task = {
                "task_name": task_config.get("task_name", "free_play"),
                "description": task_config.get("description", "Default CyberShield autonomous monitoring scenario"),
                "max_steps": task_config.get("max_steps", 20),
                "seed": seed,
                "target_health": task_config.get("target_health"),
            }
            self.vulnerability_manager.reset()
            self._refresh_observability(scan_results=[])
            return self._snapshot()

    def state(self):
        with self.lock:
            return self._snapshot()

    def _snapshot(self):
        return {
            "step": self.current_step,
            "logs": list(self.logs),
            "system_health": self.system_health,
            "blocked_ips": sorted(self.blocked_ips),
            "threat_score": self.threat_score,
            "recommended_action": self.recommended_action,
            "last_decision_reason": self.last_decision_reason,
            "recent_actions": list(self.recent_actions[-5:]),
            "threat_timeline": list(self.threat_timeline[-12:]),
            "ai_interval_seconds": self.ai_interval_seconds,
            "emergency_mode": self.emergency_mode,
            "health_warning": self.health_warning,
            "vulnerabilities": self.vulnerability_manager.findings_as_list(),
            "patched_vulnerabilities": self.patched_vulnerabilities,
            "defense_events_triggered": self.defense_events_triggered,
            "latest_patch_result": self.latest_patch_result,
            "automation_reports": self.latest_report_paths,
            "agent_profile": self.agent_profile,
            "cumulative_score": round(self.cumulative_score, 4),
            "latest_reward": self.latest_reward,
            "latest_raw_reward": self.latest_raw_reward,
            "active_task": self.active_task,
        }

    def update_settings(self, agent_name=None, display_preferences=None):
        with self.lock:
            if agent_name:
                self.agent_profile["agent_name"] = str(agent_name).strip()[:48] or self.agent_profile["agent_name"]

            if isinstance(display_preferences, dict):
                self.agent_profile["display_preferences"].update(display_preferences)

            return self._snapshot()

    def task_result(self):
        return {
            "task_name": self.active_task["task_name"],
            "cumulative_score": round(self.cumulative_score, 4),
            "final_health": self.system_health,
            "blocked_ips": len(self.blocked_ips),
            "patched_vulnerabilities": self.patched_vulnerabilities,
            "steps_taken": self.current_step,
        }

    def _refresh_observability(self, scan_results=None):
        findings = self.vulnerability_manager.detect_vulnerabilities(self.logs, scan_results=scan_results)
        self.threat_score, self.recommended_action = analyze_threats(self.logs)
        self.health_warning = self.system_health < 50
        self.emergency_mode = self.system_health < 30
        now = time.time()
        self.threat_timeline.append(
            {
                "timestamp": now,
                "threat_score": self.threat_score,
                "system_health": self.system_health,
                "patched_vulnerabilities": self.vulnerability_manager.patched_count(),
            }
        )
        self.threat_timeline = self.threat_timeline[-12:]
        self.health_history.append({"timestamp": now, "system_health": self.system_health})
        self.health_history = self.health_history[-6:]
        self.patched_vulnerabilities = self.vulnerability_manager.patched_count()
        return findings

    def analyze_threats(self, logs):
        score, recommended = analyze_threats(logs)
        return score, recommended

    def decide_action(self, state):
        return decide_action(state)

    def _can_do(self, action):
        cooldown = ACTION_COOLDOWNS.get(action, 0)
        return time.time() - self.last_action_time.get(action, 0) > cooldown

    def _last_n_health_loss(self, cycles):
        if len(self.health_history) < 2:
            return 0
        relevant = self.health_history[-cycles:]
        if len(relevant) < 2:
            return 0
        return max(0, relevant[0]["system_health"] - relevant[-1]["system_health"])

    def _rapid_health_drop(self):
        return self._last_n_health_loss(3) > 15

    def _record_action(self, action, target=None, reason=""):
        now = time.time()
        self.last_action_time[action] = now
        self.recent_actions.append(
            {
                "action": action,
                "timestamp": now,
                "target": target,
                "reason": reason,
            }
        )
        self.recent_actions = self.recent_actions[-12:]

    def _generate_ci_scan_results(self):
        scan_results = []
        for finding in self.vulnerability_manager.prioritized_findings()[:2]:
            scan_results.append(
                {
                    "id": finding.vuln_id,
                    "severity": finding.severity,
                    "evidence": f"ci-monitor observed signature: {finding.signature}",
                }
            )
        return scan_results

    def _ensure_attack_activity(self):
        if not self.logs:
            self.logs.extend(generate_logs(random.randint(2, 4)))
        else:
            self.logs.append(generate_log())
        self.logs = sorted(self.logs, key=lambda item: item["timestamp"], reverse=True)[:25]

    def _highest_priority_vuln(self):
        findings = self.vulnerability_manager.prioritized_findings()
        return findings[0] if findings else None

    def _run_patch_pipeline(self, target_vuln_id):
        result = self.vulnerability_manager.run_patch_pipeline(target_vuln_id, environment="staging")
        if result:
            self.latest_patch_result = result
            self.defense_events_triggered += 1
            self.system_health = min(100, self.system_health + 12)
        return result

    def _rate_limited_sources(self):
        counts = Counter(log["source_ip"] for log in self.logs if log.get("attack_type") == "ddos")
        return {ip for ip, count in counts.items() if count >= 2}

    def _apply_action_effect(self, action, reason="", target_vuln_id=None):
        reward = 0.0
        if action == "scan_network":
            reward = 0.2
            self.defense_events_triggered += 1
        elif action == "block_ip":
            counts = Counter(log["source_ip"] for log in self.logs if log.get("attack_type") != "normal")
            if counts:
                ip = counts.most_common(1)[0][0]
                self.blocked_ips.add(ip)
                reward = 0.5
                self.defense_events_triggered += 1
        elif action == "patch_vulnerability":
            target = target_vuln_id or (self._highest_priority_vuln().vuln_id if self._highest_priority_vuln() else None)
            pipeline_result = self._run_patch_pipeline(target)
            reward = 1.0 if pipeline_result else 0.1
        elif action == "monitor_traffic":
            reward = 0.35
            self.defense_events_triggered += 1
        else:
            reward = -0.1

        self._record_action(action, target=target_vuln_id, reason=reason)
        return reward

    def _stabilize_system_health(self, action):
        # Keep the defense platform in an operational band instead of letting health collapse.
        if action == "patch_vulnerability":
            self.system_health = min(100, self.system_health + 10)
        elif action in SAFE_ACTIONS:
            self.system_health = min(100, self.system_health + 6)
        elif action == "block_ip":
            self.system_health = min(100, self.system_health + 4)

        if self.system_health < 60:
            self.system_health = min(100, self.system_health + 8)

        if self.system_health < 45:
            self.system_health = 60

    def _calculate_attack_impact(self, action):
        if not self.logs:
            return 0

        attack_log = random.choice(self.logs)
        attack_type = attack_log.get("attack_type")
        if attack_type == "normal":
            return 0

        base_impact = random.randint(1, 4)
        exploit_penalty = self.vulnerability_manager.exploit_penalty(attack_type)
        impact = base_impact + exploit_penalty

        if attack_log.get("source_ip") in self.blocked_ips:
            impact = max(0, impact - 6)
        if action == "monitor_traffic":
            impact = max(0, impact - 4)
        elif action == "scan_network":
            impact = max(0, impact - 2)
        elif action == "block_ip":
            impact = max(0, impact - 3)
        elif action == "patch_vulnerability":
            impact = max(0, impact - 5)

        if self.health_warning and action in SAFE_ACTIONS:
            impact = max(0, impact - 2)

        ddos_rate_limited = self._rate_limited_sources()
        if attack_log.get("source_ip") in ddos_rate_limited:
            impact = max(0, impact - 2)

        return min(impact, 8)

    def _report_payload(self):
        return {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            "system_health": self.system_health,
            "threat_score": self.threat_score,
            "patched_vulnerabilities": self.patched_vulnerabilities,
            "defense_events_triggered": self.defense_events_triggered,
            "cumulative_score": round(self.cumulative_score, 4),
            "latest_reward": self.latest_reward,
            "findings": self.vulnerability_manager.findings_as_list(),
            "latest_patch_result": self.latest_patch_result,
        }

    def autonomous_cycle(self):
        with self.lock:
            self._ensure_attack_activity()
            findings = self._refresh_observability(scan_results=self._generate_ci_scan_results())

            action, reason, target_vuln_id = choose_action(
                state=self._snapshot(),
                vulnerability_findings=findings or self.vulnerability_manager.findings_as_list(),
                can_do=self._can_do,
                recent_actions=self.recent_actions,
            )

            self.last_decision_reason = reason
            if action is None:
                self._stabilize_system_health("monitor_traffic")
                self._refresh_observability(scan_results=self._generate_ci_scan_results())
                self.ai_interval_seconds = adaptive_interval(
                    self.system_health,
                    self.threat_score,
                    self._rapid_health_drop(),
                )
                self.latest_report_paths = self.vulnerability_manager.write_reports(self._report_payload())
                logger.info(
                    "AI decision: none | Threat score: %s | System health: %s | Reason: %s",
                    self.threat_score,
                    self.system_health,
                    reason,
                )
                return {
                    "state": self._snapshot(),
                    "executed_action": None,
                    "reason": reason,
                    "next_interval": self.ai_interval_seconds,
                }

            previous_health = self.system_health
            previous_threat = self.threat_score
            raw_reward = self._apply_action_effect(action, reason=reason, target_vuln_id=target_vuln_id)
            impact = self._calculate_attack_impact(action)
            self.system_health = max(0, min(100, self.system_health - impact))
            self._stabilize_system_health(action)
            self.current_step += 1
            self._refresh_observability(scan_results=self._generate_ci_scan_results())
            improvement_bonus = max(previous_threat - self.threat_score, 0) * 0.04
            health_bonus = max(self.system_health - previous_health, 0) * 0.06
            health_cost = max(previous_health - self.system_health, 0) * 0.05
            raw_reward = round(raw_reward + improvement_bonus + health_bonus - health_cost, 3)
            reward = normalize_reward(raw_reward)
            self.latest_raw_reward = raw_reward
            self.latest_reward = reward
            self.cumulative_score += reward
            self.ai_interval_seconds = adaptive_interval(
                self.system_health,
                self.threat_score,
                self._rapid_health_drop(),
            )
            self.latest_report_paths = self.vulnerability_manager.write_reports(self._report_payload())
            logger.info(
                "AI decision: %s | Threat score: %s -> %s | System health: %s -> %s | Patched vulnerabilities: %s | Reason: %s",
                action,
                previous_threat,
                self.threat_score,
                previous_health,
                self.system_health,
                self.patched_vulnerabilities,
                reason,
            )
            return {
                "state": self._snapshot(),
                "executed_action": action,
                "reason": reason,
                    "reward": reward,
                    "raw_reward": raw_reward,
                    "done": self.system_health <= 0 or self.current_step >= self.active_task.get("max_steps", 20),
                    "next_interval": self.ai_interval_seconds,
                }

    def step(self, action):
        with self.lock:
            if action not in self.actions:
                return self._snapshot(), -0.1, False, {"error": "invalid action"}

            previous_health = self.system_health
            previous_threat = self.threat_score
            raw_reward = self._apply_action_effect(action, reason="manual action")
            impact = self._calculate_attack_impact(action)
            self.system_health = max(0, min(100, self.system_health - impact))
            self._stabilize_system_health(action)
            self.current_step += 1
            self._refresh_observability(scan_results=self._generate_ci_scan_results())
            raw_reward = round(
                raw_reward
                + max(previous_threat - self.threat_score, 0) * 0.03
                + max(self.system_health - previous_health, 0) * 0.05
                - max(previous_health - self.system_health, 0) * 0.05,
                3,
            )
            reward = normalize_reward(raw_reward)
            self.latest_raw_reward = raw_reward
            self.latest_reward = reward
            self.cumulative_score += reward
            self.ai_interval_seconds = adaptive_interval(
                self.system_health,
                self.threat_score,
                self._rapid_health_drop(),
            )
            self.latest_report_paths = self.vulnerability_manager.write_reports(self._report_payload())
            done = self.system_health <= 0 or self.current_step >= self.active_task.get("max_steps", 20)
            return self._snapshot(), reward, done, {"raw_reward": raw_reward}


if __name__ == "__main__":
    env = CyberShieldEnv()
    print("Initial State:", env.reset())
    for _ in range(5):
        result = env.autonomous_cycle()
        print(result)
