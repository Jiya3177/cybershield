import asyncio
import contextlib
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from environment import CyberShieldEnv
from models import ActionRequest, ResetResponse, SettingsRequest, SettingsResponse, StateModel, StepResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("cybershield.server")

app = FastAPI(root_path="/")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

env = CyberShieldEnv()
ai_loop_task = None


async def autonomous_defense_loop():
    while True:
        next_interval = 3
        try:
            result = env.autonomous_cycle()
            next_interval = result.get("next_interval", env.ai_interval_seconds)
        except Exception:
            logger.exception("Autonomous defense loop failed")

        await asyncio.sleep(next_interval)


@app.on_event("startup")
async def startup_event():
    global ai_loop_task

    if ai_loop_task is None or ai_loop_task.done():
        logger.info("Starting CyberShield autonomous defense loop")
        ai_loop_task = asyncio.create_task(autonomous_defense_loop())


@app.on_event("shutdown")
async def shutdown_event():
    global ai_loop_task

    if ai_loop_task is not None:
        ai_loop_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await ai_loop_task
        ai_loop_task = None


@app.get("/")
def root():
    return {
        "status": "CyberShield API running",
        "service": "CyberShield OpenEnv",
        "docs": "/docs",
        "endpoints": [
            "/state",
            "/reset",
            "/step"
        ]
    }


@app.post("/reset", response_model=ResetResponse)
def reset():
    state = env.reset()

    return {
        "status": "environment reset",
        "state": state
    }


@app.post("/step", response_model=StepResponse)
def step(request: ActionRequest):
    if request.action not in env.actions:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {request.action}")

    state, reward, done, info = env.step(request.action)

    return {
        "state": state,
        "reward": reward,
        "raw_reward": info.get("raw_reward"),
        "done": done
    }


@app.post("/settings", response_model=SettingsResponse)
def update_settings(request: SettingsRequest):
    state = env.update_settings(
        agent_name=request.agent_name,
        display_preferences=request.display_preferences,
    )
    return {
        "status": "settings updated",
        "state": state,
    }


@app.get("/state", response_model=StateModel)
def state():
    return env.state()
