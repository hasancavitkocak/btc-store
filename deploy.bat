@echo off
echo ========================================
echo BTC Store Deployment Script
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Installing dependencies...
call npm install --production=false
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Building Next.js application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Checking .env.production file...
if not exist .env.production (
    echo WARNING: .env.production file not found!
    echo Please create .env.production file with your production settings.
    pause
)

echo.
echo [4/4] Deployment completed successfully!
echo.
echo Next steps:
echo 1. Configure nginx with the provided nginx.conf
echo 2. Start the application with: npm start
echo    OR use PM2: pm2 start ecosystem.config.js
echo 3. Restart nginx service
echo.
pause
