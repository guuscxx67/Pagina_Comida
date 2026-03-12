@echo off
chcp 65001 >nul
cd /d "%~dp0backend"
echo Iniciando servidor backend...
echo.
.venv\Scripts\python.exe app.py
pause
