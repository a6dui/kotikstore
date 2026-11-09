@echo off
chcp 65001 > nul
title Kotik Store Bot Runner
echo =======================================================
echo          🐱 Kotik Store Telegram Bot Runner
echo =======================================================
echo.

cd /d "%~dp0"

if exist "D:\ZykoStore\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=D:\ZykoStore\.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo Запуск Telegram бота через %PYTHON_EXE%...
echo WebApp URL: https://a6dui.github.io/kotikstore/
echo.
"%PYTHON_EXE%" bot.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ Бот завершил работу с ошибкой (Код: %ERRORLEVEL%).
    pause
)
