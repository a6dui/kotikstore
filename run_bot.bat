@echo off
cd /d "%~dp0"
title Kotik Store Bot Runner
echo =======================================================
echo          Kotik Store Telegram Bot
echo =======================================================
echo.
echo Starting Kotik Store Bot...
echo WebApp URL: https://a6dui.github.io/kotikstore/
echo.

"C:\Users\Леха\AppData\Local\Programs\Python\Python311\python.exe" bot.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Bot stopped with error code: %ERRORLEVEL%
    pause
)
