---
title: CyberShield OpenEnv
emoji: shield
colorFrom: green
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
---

# CyberShield Autonomous Defense Platform

CyberShield is a FastAPI-based cybersecurity simulator with an autonomous AI defense layer. The platform now detects vulnerable conditions from attack telemetry, stages and validates patches automatically, strengthens defense responses, and reports measurable health recovery after each automation cycle.

## What Was Added

- Vulnerability detection and prioritization for `vuln-1` through `vuln-6`, including the required `vuln-5` and `vuln-6`
- Autonomous patch orchestration with staging validation before deployment
- Defense-system improvements that reduce exploit impact when vulnerabilities are patched or protective actions are active
- Human-readable and machine-readable reports in [`reports/latest_report.md`](./reports/latest_report.md) and [`reports/latest_report.json`](./reports/latest_report.json)
- Automated tests covering detection, auto-patching, reporting, and endpoint compatibility

## Backend Modules

- [`vulnerability_manager.py`](./vulnerability_manager.py)
  - Tracks vulnerability signatures, severity, exploit evidence, and generated patch plans
  - Produces CI/CD-style scan results and patch pipeline results
- [`ai_automation.py`](./ai_automation.py)
  - Centralizes threat analysis, action selection, cooldowns, and adaptive interval logic
- [`environment.py`](./environment.py)
  - Integrates attack telemetry, vulnerability detection, patch automation, defense metrics, and health stabilization
- [`server.py`](./server.py)
  - Keeps the existing `/state`, `/step`, and `/reset` endpoints while running the autonomous loop in the background

## Automation Flow

```text
Recent attack logs / CI scan results
        |
        v
Vulnerability detection module
        |
        v
Prioritized findings (severity + exploit count + health penalty)
        |
        v
AI automation policy
  - patch critical findings first
  - use safe actions when health is weak
  - respect action cooldowns
        |
        v
Patch pipeline
  1. Generate patch script
  2. Apply in staging
  3. Validate with tests
  4. Promote to production
        |
        v
Defense metrics + report export + updated /state
```

## Pseudocode

```python
findings = vulnerability_manager.detect_vulnerabilities(logs, scan_results)
threat_score, recommended_action = analyze_threats(logs)

if critical_or_high_finding_exists(findings):
    action = "patch_vulnerability"
elif system_health < 40:
    action = safe_defense_action()
else:
    action = policy_decision(logs, cooldowns)

if action == "patch_vulnerability":
    patch_result = vulnerability_manager.run_patch_pipeline(target_vuln, environment="staging")
    if patch_result["validation_passed"]:
        deploy_patch()

apply_defense_effects(action)
update_system_health()
write_json_and_markdown_reports()
```

## Health Improvement Measurement

Every automation cycle records:

- `system_health`
- `patched_vulnerabilities`
- `defense_events_triggered`
- `threat_score`
- vulnerability findings and latest patch result

Health improvement is measured through:

- positive health change after a patch pipeline runs
- reduced exploit penalty when a related vulnerability is patched
- reward adjustments that increase when threat score falls and health rises

## Security Design Notes

- Unknown or unsupported actions are rejected at the API layer
- Patch orchestration avoids hardcoded secrets and keeps actions deterministic
- Defensive logic reduces exploit impact via:
  - patch deployment
  - traffic monitoring
  - scanning and IP blocking
  - automated rate-limit style mitigation for repeated DDoS sources

## Running Tests

```bash
python3 -m unittest discover -s tests -v
```

## OpenEnv RL Interface

CyberShield now behaves as an OpenEnv-style reinforcement learning environment while preserving the existing cyber-defense logic.

- `reset()` resets the environment and returns a typed RL state
- `state()` returns the current typed observation
- `step(action)` applies one RL action and returns a normalized reward in `0.0` to `1.0`

### Reward Normalization Snippet

```python
from reward_utils import normalize_reward

raw_reward = 1.18
reward = normalize_reward(raw_reward)
```

### Structured Inference Logging

The baseline [`inference.py`](./inference.py) now emits:

- `[START]`
- `[STEP]`
- `[END]`

for each task run.

### Validator

Run the local validator with:

```bash
python3 validator.py
```

It checks:

- `openenv.yaml`
- API endpoint compatibility
- normalized rewards
- task grading range compliance
