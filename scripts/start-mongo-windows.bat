@echo off
@title MongoDB Service

setlocal enabledelayedexpansion

SET "DEBUG=0"

:: Goes to parent dir
cd ..

:: Mongod config location
set "CONFIG_DIR=%cd%\config"
set "CONFIG_FILE=%CONFIG_DIR%\mongod.cfg"

:: Set paths
SET "DB_PATH=%cd%\data\db"
SET "LOG_PATH=%cd%\data\mongod.log"
SET "DB_LINE=8"
SET "LOG_LINE=15"

:: Debug information
IF "%DEBUG%"=="1" (
    echo Config File: %CONFIG_FILE%
    echo DB Path: %DB_PATH%
    echo Log Path: %LOG_PATH%
    echo DB Line: %DB_LINE%
    echo Log Line: %LOG_LINE%

    goto end
)

:: Set mongodb directory
SET "MONGOD=C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"

IF NOT EXIST "%MONGOD%" (
    echo mongod.exe not found
    goto end
)

IF NOT EXIST "%cd%\data" (
    mkdir data\db
)

IF NOT EXIST "%CONFIG_DIR%" (
    mkdir config
)

IF NOT EXIST "%CONFIG_FILE%" (
    (
        echo # mongod.conf
        echo.
        echo # for documentation of all options, see:
        echo #   http://docs.mongodb.org/manual/reference/configuration-options/
        echo.
        echo # Where and how to store data.
        echo storage:
        echo   dbPath: %DB_PATH%
        echo   directoryPerDB: true
        echo.
        echo # where to write logging data.
        echo systemLog:
        echo   destination: file
        echo   logAppend: true
        echo   path: %LOG_PATH%
        echo.
        echo # network interfaces
        echo net:
        echo   port: 27017
        echo   bindIp: 127.0.0.1
        echo.
        echo #processManagement:
        echo.
        echo #security:
        echo.
        echo #operationProfiling:
        echo.
        echo #replication:
        echo.
        echo #sharding:
        echo.
        echo ## Enterprise-Only Options:
        echo.
        echo #auditLog:
    ) > "%CONFIG_FILE%"
) ELSE (
    REM Powershell
    REM powershell -NoProfile -Command ` "$lines = Get-Content -Path %CONFIG_FILE%;" ` "$lines[%DB_LINE% - 1] = '  dbPath: %DB_PATH%';" ` "$lines[%LOG_LINE% - 1] = '  path: %LOG_PATH%';" ` "$lines | Set-Content -Path %CONFIG_FILE%"
)

:: Start mongod service
"%MONGOD%" --config "%CONFIG_FILE%"

:: End of script
:end

endlocal

pause