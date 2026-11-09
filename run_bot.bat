@echo off
chcp 65001 > nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
title Kotik Store Bot Runner
cd /d "%~dp0"

echo =======================================================
echo          🐱 Kotik Store Telegram Bot Runner
echo =======================================================
echo.

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
    echo Нажмите любую клавишу для закрытия...
    pause > nul
)
