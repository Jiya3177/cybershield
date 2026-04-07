import importlib
import json

import yaml
from fastapi.testclient import TestClient

from environment import CyberShieldEnv
from server import app


TASKS = [
    ("tasks.easy_task", "easy_task"),
    ("tasks.medium_task", "medium_task"),
    ("tasks.hard_task", "hard_task"),
]


def validate_openenv_yaml():
    with open("openenv.yaml", "r", encoding="utf-8") as handle:
        config = yaml.safe_load(handle)

    assert config["entrypoint"] == "environment:CyberShieldEnv"
    assert len(config["tasks"]) >= 3
    assert config["reward"]["range"]["min"] == 0.0
    assert config["reward"]["range"]["max"] == 1.0
    return config


def validate_api():
    client = TestClient(app)

    reset_response = client.post("/reset")
    assert reset_response.status_code == 200

    state_response = client.get("/state")
    assert state_response.status_code == 200
    state = state_response.json()
    assert "system_health" in state
    assert "active_task" in state

    step_response = client.post("/step", json={"action": "scan_network"})
    assert step_response.status_code == 200
    data = step_response.json()
    assert 0.0 <= data["reward"] <= 1.0
    return data


def validate_tasks():
    env = CyberShieldEnv()
    scores = []

    for module_name, fn_name in TASKS:
        module = importlib.import_module(module_name)
        task = getattr(module, fn_name)()
        grader = getattr(module, "grade")
        env.configure_task(task)
        env.reset()

        for _ in range(task["max_steps"]):
            _, _, done, _ = env.step("monitor_traffic")
            if done:
                break

        result = env.task_result()
        score = grader(result)
        assert 0.0 <= score <= 1.0
        scores.append({"task": task["task_name"], "score": score})

    return scores


def main():
    config = validate_openenv_yaml()
    step_data = validate_api()
    task_scores = validate_tasks()

    print(
        json.dumps(
            {
                "status": "ok",
                "entrypoint": config["entrypoint"],
                "sample_reward": step_data["reward"],
                "task_scores": task_scores,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
