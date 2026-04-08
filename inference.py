from __future__ import annotations

import importlib
import json
import os
import sys
from pathlib import Path

from openai import OpenAI


ROOT = Path(__file__).resolve().parent
LEGACY_DIR = ROOT / "legacy"
if str(LEGACY_DIR) not in sys.path:
    sys.path.insert(0, str(LEGACY_DIR))

from environment import CyberShieldEnv
from reward_utils import normalize_average_reward, normalize_reward


ACTIONS = [
    "scan_network",
    "block_ip",
    "patch_vulnerability",
    "monitor_traffic",
]

TASKS = [
    ("easy", "tasks.easy_task", "easy_task"),
    ("medium", "tasks.medium_task", "medium_task"),
    ("hard", "tasks.hard_task", "hard_task"),
]

SYSTEM_PROMPT = """You are choosing the next defensive action for a cybersecurity RL environment.
Return exactly one action from this list:
- scan_network
- block_ip
- patch_vulnerability
- monitor_traffic

Choose the safest high-signal action based on current health, threat score, and recent attacks.
Respond with only the action string."""


def make_client():
    api_base_url = os.environ.get("API_BASE_URL")
    api_key = os.environ.get("API_KEY")
    if not api_base_url or not api_key:
        raise RuntimeError("API_BASE_URL and API_KEY must be set for hackathon evaluation.")
    return OpenAI(base_url=api_base_url, api_key=api_key)


def model_name():
    return os.environ.get("MODEL_NAME", "gpt-4o-mini")


def choose_action(client: OpenAI, observation: dict) -> str:
    prompt = {
        "system_health": observation.get("system_health"),
        "threat_score": observation.get("threat_score"),
        "patched_vulnerabilities": observation.get("patched_vulnerabilities"),
        "blocked_ips": len(observation.get("blocked_ips", [])),
        "recent_attacks": [
            {
                "attack_type": log.get("attack_type"),
                "severity": log.get("severity"),
            }
            for log in observation.get("logs", [])[-6:]
        ],
        "allowed_actions": ACTIONS,
    }

    response = client.chat.completions.create(
        model=model_name(),
        temperature=0,
        max_tokens=8,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(prompt)},
        ],
    )
    content = (response.choices[0].message.content or "").strip()
    action = content.split()[0].strip().strip('"').strip("'").strip(",")
    if action not in ACTIONS:
        # Keep evaluation robust if the model returns extra words.
        lowered = content.lower()
        for candidate in ACTIONS:
            if candidate in lowered:
                return candidate
        return "monitor_traffic"
    return action


def load_task(module_name, fn_name):
    module = importlib.import_module(module_name)
    task_factory = getattr(module, fn_name)
    return task_factory()


def load_grader(module_name):
    module = importlib.import_module(module_name)
    return getattr(module, "grade")


def log_start(task):
    print(f"[START] task={task['task_name']} max_steps={task['max_steps']} seed={task['seed']}")


def log_step(index, action, reward, state):
    print(
        "[STEP] "
        f"step={index} "
        f"action={action} "
        f"reward={reward:.4f} "
        f"health={state['system_health']} "
        f"threat_score={state['threat_score']} "
        f"patched={state['patched_vulnerabilities']}"
    )


def log_end(task_name, score, result):
    print(
        "[END] "
        f"task={task_name} "
        f"score={score:.4f} "
        f"final_health={result['final_health']} "
        f"blocked_ips={result['blocked_ips']} "
        f"patched_vulnerabilities={result['patched_vulnerabilities']}"
    )


def run_task(env, task, grader, client):
    env.configure_task(task)
    observation = env.reset()
    total_reward = 0.0
    steps_taken = 0

    log_start(task)

    for step_index in range(1, task["max_steps"] + 1):
        action = choose_action(client, observation)
        observation, reward, done, info = env.step(action)
        normalized_reward = normalize_reward(info.get("raw_reward", reward))
        total_reward += normalized_reward
        steps_taken = step_index
        log_step(step_index, action, normalized_reward, observation)

        if done:
            break

    result = env.task_result()
    result["cumulative_score"] = normalize_average_reward(total_reward, steps_taken)
    score = grader(result)
    log_end(task["task_name"], score, result)
    return {
        "task": task["task_name"],
        "score": score,
        "result": result,
    }


def main():
    client = make_client()
    env = CyberShieldEnv()
    scores = []

    for _, module_name, fn_name in TASKS:
        task = load_task(module_name, fn_name)
        grader = load_grader(module_name)
        run_data = run_task(env, task, grader, client)
        scores.append(run_data["score"])

    summary = {
        "tasks": [task_name for task_name, _, _ in TASKS],
        "average_score": round(sum(scores) / len(scores), 4),
    }
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
