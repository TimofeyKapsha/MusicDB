from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

import os
from routes import app as routes_app  # Импорт маршрутов из routes.py

app = FastAPI()

# Подключение статических файлов
app.mount("/frontend", StaticFiles(directory="/frontend"), name="frontend")

# Подключение маршрутов для API
app.mount("/api", routes_app)  # Все API будут доступны по маршруту /api


@app.get("/", response_class=HTMLResponse)
async def read_root() -> HTMLResponse:
    """Маршрут для главной HTML-страницы."""
    index_path: str = os.path.join("/frontend", "index.html")
    try:
        with open(index_path, "r", encoding="utf-8") as html_file:
            content: str = html_file.read()
        return HTMLResponse(content)
    except FileNotFoundError:
        return HTMLResponse(
            content="Главная HTML-страница не найдена.",
            status_code=404
        )
