from task_utils import build_task, grade_task

def easy_task():
    return build_task(
        task_name="easy",
        description="Low level cyber attack simulation",
        max_steps=10,
        seed=11,
        log_count=3,
        target_health=75,
        success_reward=10,
    )


def grade(result):
    return grade_task(
        cumulative_score=result["cumulative_score"],
        final_health=result["final_health"],
        blocked_ips=result["blocked_ips"],
        patched_vulnerabilities=result["patched_vulnerabilities"],
        success_reward=10,
    )
