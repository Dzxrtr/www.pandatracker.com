@echo off
REM PandaSave Startup Script for Windows

echo.
echo 🐼 Welcome to PandaSave - Smart Money Tracker!
echo ==================================================
echo.

REM Check Python
echo ✓ Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo   Found Python %PYTHON_VERSION%
echo.

REM Create virtual environment
if not exist "venv" (
    echo ✓ Creating virtual environment...
    python -m venv venv
    echo   Virtual environment created
)
echo.

REM Activate virtual environment
echo ✓ Activating virtual environment...
call venv\Scripts\activate.bat
echo   Virtual environment activated
echo.

REM Install dependencies
echo ✓ Installing dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo ✗ Failed to install dependencies
    pause
    exit /b 1
)
echo   Dependencies installed
echo.

REM Create database
echo ✓ Initializing database...
python -c "from app import app, db; exec('with app.app_context(): db.create_all(); print(\"  Database initialized\")')"
if errorlevel 1 (
    echo ✗ Failed to initialize database
    pause
    exit /b 1
)
echo.

REM Create logs directory
if not exist "logs" mkdir logs

REM Summary
echo ==================================================
echo ✅ Setup Complete!
echo ==================================================
echo.
echo 🚀 Next Steps:
echo.
echo 1. Start the backend server ^(this terminal^):
echo    python app.py
echo.
echo 2. In a new Command Prompt, start frontend server:
echo    python -m http.server 8000
echo.
echo 3. Open your browser:
echo    http://localhost:8000
echo.
echo 4. Create an account and start tracking money!
echo.
echo 📚 Documentation:
echo    - Quick Start: type QUICK_START.md
echo    - Full Docs: type README.md
echo    - API Docs: type API_DOCUMENTATION.md
echo.
echo ==================================================
echo 🐼 Happy Saving!
echo ==================================================
echo.
pause
