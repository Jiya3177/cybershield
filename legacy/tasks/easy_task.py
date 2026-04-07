from synthetic_logs import generate_logs

def easy_task():

    return {
        "task_name": "easy",
        "description": "Low level cyber attack simulation",
        "logs": generate_logs(3),
        "max_steps": 10
    }


def grade(reward):

    if reward > 3:
        return 1.0
    elif reward > 1:
        return 0.5
    else:
        return 0.0
