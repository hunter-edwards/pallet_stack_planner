@echo off
echo ============================================================
echo   Corrugated Pallet Planning System
echo ============================================================
echo.
echo   Starting server...
echo.

python serve.py
if errorlevel 1 (
    echo.
    echo Python not found! Trying python3...
    python3 serve.py
)

pause
