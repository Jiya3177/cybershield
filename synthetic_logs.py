import random
import time

# Possible attack types
ATTACK_TYPES = [
    "normal",
    "ddos",
    "phishing",
    "malware",
    "data_exfiltration",
    "port_scan",
    "ransomware"
]

# Severity levels
SEVERITY_LEVELS = [
    "low",
    "medium",
    "high"
]

def generate_ip():
    """Generate a random IP address"""
    return ".".join(str(random.randint(1, 255)) for _ in range(4))


def generate_log(attack_types=None):
    """Generate one synthetic security log"""

    available_attack_types = attack_types or ATTACK_TYPES
    attack = random.choice(available_attack_types)

    if attack == "normal":
        severity = "low"
    elif attack in {"data_exfiltration", "ransomware"}:
        severity = random.choice(["medium", "high"])
    else:
        severity = random.choice(SEVERITY_LEVELS)

    log = {
        "timestamp": time.time(),
        "source_ip": generate_ip(),
        "attack_type": attack,
        "severity": severity
    }

    return log


def generate_logs(n=10, attack_types=None):
    """Generate multiple logs"""

    logs = []

    for _ in range(n):
        logs.append(generate_log(attack_types=attack_types))

    return logs


if __name__ == "__main__":
    
    logs = generate_logs(10)

    for log in logs:
        print(log)
