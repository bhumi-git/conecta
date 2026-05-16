@echo off
echo Cleaning up duplicate nested folders...
rmdir /s /q "c:\Users\HP\OneDrive\Desktop\Conecta\src\pages\src"
if errorlevel 1 (
  echo Failed to remove nested folders
  exit /b 1
) else (
  echo ✓ Successfully removed duplicate nested folders
  echo.
  echo Final structure - src/pages/ should contain:
  dir "c:\Users\HP\OneDrive\Desktop\Conecta\src\pages" /b
)
