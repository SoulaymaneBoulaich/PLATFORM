@echo off
REM ============================================
REM Import XAMPP database dump into Docker MySQL
REM ============================================

echo Importing XAMPP database into Docker MySQL...
echo.

REM Database credentials (must match docker-compose.yml)
set DB_USER=realestateuser
set DB_PASS=StrongPassword123!
set DB_NAME=real_estate_db
set CONTAINER_NAME=realestate-db

REM Input file
set INPUT_FILE=db\xampp_export.sql

REM Check if file exists
if not exist %INPUT_FILE% (
    echo ✗ Error: %INPUT_FILE% not found!
    echo Please run export_xampp_db.bat first.
    pause
    exit /b 1
)

echo File: %INPUT_FILE%
echo Container: %CONTAINER_NAME%
echo Database: %DB_NAME%
echo.

REM Drop and recreate the database to start fresh
echo Recreating database...
docker exec -i %CONTAINER_NAME% mysql -u%DB_USER% -p%DB_PASS% -e "DROP DATABASE IF EXISTS %DB_NAME%; CREATE DATABASE %DB_NAME%;"

if %ERRORLEVEL% NEQ 0 (
    echo ✗ Failed to recreate database!
    pause
    exit /b 1
)

echo.
echo Importing data...
docker exec -i %CONTAINER_NAME% mysql -u%DB_USER% -p%DB_PASS% %DB_NAME% < %INPUT_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Import successful!
    echo.
    echo Verifying imported data...
    docker exec -i %CONTAINER_NAME% mysql -u%DB_USER% -p%DB_PASS% %DB_NAME% -e "SHOW TABLES;"
) else (
    echo.
    echo ✗ Import failed!
    echo Check the error messages above.
)

echo.
pause
