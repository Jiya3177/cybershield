from synthetic_logs import generate_logs

def medium_task():

    return {
        "task_name": "medium",
        "description": "Moderate cyber attack scenario",
        "logs": generate_logs(6),
        "max_steps": 15
    }


def grade(reward):

    if reward > 5:
        return 1.0
    elif reward > 2:
        return 0.5
    else:
        return 0.0
