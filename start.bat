@echo off
chcp 65001 > nul
title Kotik Store Telegram Bot
cd /d "%~dp0"

echo =======================================================
echo          🐱 Kotik Store Telegram Bot
echo =======================================================
echo.
echo Запуск бота Kotik Store...
echo WebApp URL: https://a6dui.github.io/kotikstore/
echo.

python bot.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ Ошибка при выполнении. Нажмите любую клавишу для выхода.
    pause
)
