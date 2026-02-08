@echo off
echo ====================================================
echo WasteExchange Local Development Setup
echo ====================================================

REM Backend
cd Backend
echo.
echo Starting Backend on port 8000...
start cmd /k "venv\Scripts\activate && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3

REM Frontend
cd ..\Frontend
echo Starting Frontend on port 5173...
start cmd /k "npm run dev"

timeout /t 3

echo.
echo ✅ Both servers starting...
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
pause