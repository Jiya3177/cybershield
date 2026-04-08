import os

import uvicorn

from server import app


def main():
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", "7860")))
