import importlib.util
import os
from pathlib import Path

import uvicorn


def _load_server_app():
    server_path = Path(__file__).resolve().parents[1] / "server.py"
    spec = importlib.util.spec_from_file_location("cybershield_server_module", server_path)
    module = importlib.util.module_from_spec(spec)
    assert spec is not None and spec.loader is not None
    spec.loader.exec_module(module)
    return module.app


app = _load_server_app()


def main():
    uvicorn.run("server.app:app", host="0.0.0.0", port=int(os.getenv("PORT", "7860")))
