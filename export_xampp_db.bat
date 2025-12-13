@echo off
REM ============================================
REM Export XAMPP MySQL Database to SQL file
REM ============================================

echo Exporting database from XAMPP MySQL...
echo.

REM Set XAMPP MySQL path (adjust if your XAMPP is installed elsewhere)
set MYSQL_BIN=C:\xampp\mysql\bin

REM Database credentials
set DB_NAME=real_estate_db
set DB_USER=root
set DB_PASS=

REM Output file
set OUTPUT_FILE=db\xampp_export.sql

echo Database: %DB_NAME%
echo Output: %OUTPUT_FILE%
echo.

REM Run mysqldump (trying XAMPP path first, then system PATH)
if exist "%MYSQL_BIN%\mysqldump.exe" (
    echo Using XAMPP mysqldump from: %MYSQL_BIN%
    "%MYSQL_BIN%\mysqldump.exe" -u%DB_USER% -p%DB_PASS% %DB_NAME% > %OUTPUT_FILE% 2>&1
) else (
    echo XAMPP path not found, trying system PATH...
    mysqldump -u%DB_USER% -p%DB_PASS% %DB_NAME% > %OUTPUT_FILE% 2>&1
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Export successful!
    echo File saved to: %OUTPUT_FILE%
    echo.
    echo File size:
    dir %OUTPUT_FILE% | findstr xampp_export.sql
) else (
    echo.
    echo ✗ Export failed!
    echo Make sure XAMPP MySQL is running and the path is correct.
    echo.
)

pause
