FROM python:3.9-slim

# Установка зависимостей
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода
COPY ./app /app
COPY ./frontend /frontend

# Открытие порта
EXPOSE 10000

# Запуск приложения
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]