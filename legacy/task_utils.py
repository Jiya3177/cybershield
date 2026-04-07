from __future__ import annotations

from reward_utils import normalize_average_reward
from synthetic_logs import generate_logs


def build_task(*, task_name, description, max_steps, seed, log_count, target_health, success_reward):
    return {
        "task_name": task_name,
        "description": description,
        "max_steps": max_steps,
        "seed": seed,
        "initial_logs": generate_logs(log_count),
        "target_health": target_health,
        "success_reward": success_reward,
    }


def grade_task(*, cumulative_score, final_health, blocked_ips, patched_vulnerabilities, success_reward):
    reward_component = normalize_average_reward(cumulative_score, max(success_reward, 1))
    health_component = max(0.0, min(1.0, final_health / 100))
    defense_component = max(0.0, min(1.0, (blocked_ips + patched_vulnerabilities) / 4))
    final_score = 0.5 * reward_component + 0.35 * health_component + 0.15 * defense_component
    return round(max(0.0, min(1.0, final_score)), 4)
