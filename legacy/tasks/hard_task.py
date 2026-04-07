from task_utils import build_task, grade_task

def hard_task():
    return build_task(
        task_name="hard",
        description="High intensity cyber attack scenario",
        max_steps=20,
        seed=33,
        log_count=10,
        target_health=65,
        success_reward=20,
    )


def grade(result):
    return grade_task(
        cumulative_score=result["cumulative_score"],
        final_health=result["final_health"],
        blocked_ips=result["blocked_ips"],
        patched_vulnerabilities=result["patched_vulnerabilities"],
        success_reward=20,
    )
