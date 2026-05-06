@echo off
echo Cleaning build cache...
cd /d "%~dp0"

if exist .next (
    echo Removing .next folder...
    rmdir /s /q .next
)

if exist node_modules\.cache (
    echo Removing node_modules cache...
    rmdir /s /q node_modules\.cache
)

if exist .next\cache (
    echo Removing Next.js cache...
    rmdir /s /q .next\cache
)

echo.
echo Cache cleaned successfully!
echo You can now run: npm run build
echo.
pause
