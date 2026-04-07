import random
from environment import CyberShieldEnv

# Possible actions
ACTIONS = [
    "scan_network",
    "block_ip",
    "patch_vulnerability",
    "monitor_traffic"
]


def run_episode(env, max_steps=20):

    observation = env.reset()

    total_reward = 0

    for step in range(max_steps):

        # simple baseline strategy
        action = random.choice(ACTIONS)

        observation, reward, done, _ = env.step(action)

        total_reward += reward

        print(f"Step {step+1}")
        print("Action:", action)
        print("Reward:", reward)
        print("System Health:", observation["system_health"])
        print("------")

        if done:
            break

    return total_reward


def main():

    env = CyberShieldEnv()

    print("Starting CyberShield simulation...")

    score = run_episode(env)

    print("\nFinal Score:", score)


if __name__ == "__main__":
    main()
import requests
import random
import time

BASE_URL = "http://127.0.0.1:8000"

ACTIONS = [
    "scan_network",
    "block_ip",
    "patch_vulnerability",
    "monitor_traffic"
]

def run_agent(steps=10):

    print("Starting AI Cyber Defense Agent...\n")

    # Reset environment
    r = requests.post(f"{BASE_URL}/reset")
    state = r.json()["state"]

    for step in range(steps):

        action = random.choice(ACTIONS)

        print(f"\nStep {step+1}")
        print(f"Chosen action: {action}")

        response = requests.post(
            f"{BASE_URL}/step",
            json={"action": action}
        )

        data = response.json()

        print("Reward:", data["reward"])
        print("System Health:", data["state"]["system_health"])
        print("Blocked IPs:", data["state"]["blocked_ips"])

        time.sleep(1)

    print("\nAgent finished simulation.")


if __name__ == "__main__":
    run_agent()
