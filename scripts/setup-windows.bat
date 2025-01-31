@echo off
@title Quiz Setup

setlocal

:: Go to project root directory
cd ..

:: Install required packages
echo ===== DOWNLOADING NODE PACKAGES... =====
call npm ci
if %ERRORLEVEL% NEQ 0 (
    echo npm ci failed with exit code %ERRORLEVEL%. Exiting script.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo ===== PACKAGES DOWNLOADED =====

:: Start mongod service
cd scripts
start "" start-mongo-windows.bat

timeout /t 3 /nobreak >nul

:: Check if mongod.exe is running
:check_mongod
tasklist | findstr /i "mongod.exe" >nul
:: Check the exit code of findstr
if %ERRORLEVEL% EQU 0 (
    echo mongod.exe is running.
    :: Create and populate DB
    echo.
    echo ===== CREATING DATABASE... =====
    call node createDB.js mongodb://localhost:27017/kviz_baza
    echo.
    echo ===== DATABASE CREATED =====
    echo.
    echo ===== STOPPING MONGO =====
    powershell -Command "Get-Process | Where-Object { $_.MainWindowTitle -eq 'MongoDB Service' } | Stop-Process"
) else (
    echo mongod.exe is not running.
    timeout /t 2 /nobreak >nul
    goto check_mongod
)

endlocal