from task_utils import build_task, grade_task

def medium_task():
    return build_task(
        task_name="medium",
        description="Moderate cyber attack scenario",
        max_steps=15,
        seed=22,
        log_count=6,
        target_health=70,
        success_reward=15,
    )


def grade(result):
    return grade_task(
        cumulative_score=result["cumulative_score"],
        final_health=result["final_health"],
        blocked_ips=result["blocked_ips"],
        patched_vulnerabilities=result["patched_vulnerabilities"],
        success_reward=15,
    )
