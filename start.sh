#!/bin/bash

# Script para iniciar el proyecto Comida Casera

echo "========================================="
echo "Iniciando Comida Casera - Full Stack"
echo "========================================="
echo ""

# Crear directorio de logs si no existe
mkdir -p logs

# Terminal 1: Backend Flask
echo "🚀 Iniciando Backend Flask (Puerto 5000)..."
cd backend
python app.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend iniciado con PID: $BACKEND_PID"
cd ..

sleep 2

# Terminal 2: Frontend Angular
echo "🚀 Iniciando Frontend Angular (Puerto 4200)..."
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend iniciado con PID: $FRONTEND_PID"
cd ..

echo ""
echo "========================================="
echo "✅ Servidores iniciados:"
echo "  - Backend: http://localhost:5000"
echo "  - Frontend: http://localhost:4200"
echo "========================================="
echo ""
echo "Para detener los servidores, ejecuta:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Esperar a que se presione Ctrl+C
trap "echo 'Deteniendo servidores...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
