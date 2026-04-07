from synthetic_logs import generate_logs

def hard_task():

    return {
        "task_name": "hard",
        "description": "High intensity cyber attack scenario",
        "logs": generate_logs(10),
        "max_steps": 20
    }


def grade(reward):

    if reward > 8:
        return 1.0
    elif reward > 4:
        return 0.5
    else:
        return 0.0
