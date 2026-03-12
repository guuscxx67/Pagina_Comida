@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM Obtener la ruta actual
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

REM Verificar si los directorios existen
if not exist "backend" (
    echo Error: No se encontró la carpeta backend
    pause
    exit /b 1
)

if not exist "frontend" (
    echo Error: No se encontró la carpeta frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Iniciando Pagina de Comida
echo ========================================
echo.

REM Iniciar backend en una ventana separada
echo Iniciando Backend en puerto 5000...
start "BACKEND - Flask Server" cmd /k "cd backend && .venv\Scripts\python.exe app.py"

REM Esperar un poco para que el backend se inicie
timeout /t 3 /nobreak

REM Iniciar frontend en una ventana separada
echo Iniciando Frontend en puerto 4200...
start "FRONTEND - Angular Dev Server" cmd /k "cd frontend && npm start"

REM Esperar otro momento y abrir el navegador
timeout /t 5 /nobreak

echo.
echo ========================================
echo   Servicios Iniciados
echo ========================================
echo.
echo Backend:  http://localhost:5000/api
echo Frontend: http://localhost:4200
echo Admin:    http://localhost:4200/admin
echo.
echo Abriendo navegador...

REM Abrir el navegador en la página principal
start "" "http://localhost:4200/home"

echo.
echo Presiona cualquier tecla para continuar...
pause
