from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class LogEntry(BaseModel):
    timestamp: float
    source_ip: str
    attack_type: str
    severity: str


class ActionRequest(BaseModel):
    action: str = Field(..., description="One of scan_network, block_ip, patch_vulnerability, monitor_traffic")


class SettingsRequest(BaseModel):
    agent_name: str | None = None
    display_preferences: dict[str, Any] | None = None


class StateModel(BaseModel):
    step: int
    logs: list[dict[str, Any]]
    system_health: int
    blocked_ips: list[str]
    threat_score: int
    recommended_action: str | None
    last_decision_reason: str
    recent_actions: list[dict[str, Any]]
    threat_timeline: list[dict[str, Any]]
    ai_interval_seconds: int
    emergency_mode: bool
    health_warning: bool
    vulnerabilities: list[dict[str, Any]]
    patched_vulnerabilities: int
    defense_events_triggered: int
    latest_patch_result: dict[str, Any] | None
    automation_reports: dict[str, Any]
    agent_profile: dict[str, Any]
    cumulative_score: float
    latest_reward: float
    latest_raw_reward: float
    active_task: dict[str, Any]


class StepResponse(BaseModel):
    state: StateModel
    reward: float = Field(..., ge=0.0, le=1.0)
    raw_reward: float | None = None
    done: bool


class ResetResponse(BaseModel):
    status: str
    state: StateModel


class SettingsResponse(BaseModel):
    status: str
    state: StateModel
