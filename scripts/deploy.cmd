@echo off
REM CPE Connect Deployment Script for Windows
REM This script handles the complete deployment process

echo Starting CPE Connect Deployment Process...

REM Configuration
set DOCKER_IMAGE_NAME=cpe-connect-app
set DOCKER_REGISTRY=ghcr.io/your-org
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=development

REM Generate version timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list ^| find "="') do set datetime=%%I
set VERSION=%datetime:~0,8%-%datetime:~8,4%

echo.
echo Deployment Configuration:
echo   Environment: %ENVIRONMENT%
echo   Version: %VERSION%
echo   Registry: %DOCKER_REGISTRY%
echo.

REM Pre-deployment checks
echo Running pre-deployment checks...

REM Type check
echo Running type check...
call npm run type-check
if %ERRORLEVEL% neq 0 (
    echo Type check failed
    exit /b 1
)

REM Build application
echo Building application...
set BUILD_STANDALONE=true
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Build failed
    exit /b 1
)

REM Build Docker image
echo Building Docker image...
docker build --build-arg NODE_ENV=%ENVIRONMENT% --build-arg VERSION=%VERSION% -t %DOCKER_IMAGE_NAME%:%VERSION% -t %DOCKER_IMAGE_NAME%:latest .
if %ERRORLEVEL% neq 0 (
    echo Docker build failed
    exit /b 1
)

REM Deploy based on environment
if "%ENVIRONMENT%"=="development" goto :deploy_dev
if "%ENVIRONMENT%"=="dev" goto :deploy_dev
if "%ENVIRONMENT%"=="staging" goto :deploy_staging
if "%ENVIRONMENT%"=="production" goto :deploy_prod
if "%ENVIRONMENT%"=="prod" goto :deploy_prod
goto :unknown_env

:deploy_dev
echo Deploying to development environment...
docker-compose -f docker-compose.yml up -d --build
goto :post_deploy

:deploy_staging
echo Deploying to staging environment...
docker-compose -f docker-compose.staging.yml up -d
goto :post_deploy

:deploy_prod
echo Deploying to production environment...
docker-compose -f docker-compose.prod.yml up -d
goto :health_check

:health_check
echo Running health check...
timeout /t 30 /nobreak >nul

for /L %%i in (1,1,10) do (
    curl -f http://localhost:3000/api/health >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo Application is healthy
        goto :post_deploy
    ) else (
        echo Waiting for application to be ready... (%%i/10)
        timeout /t 10 /nobreak >nul
    )
)

echo Health check failed
exit /b 1

:post_deploy
echo Running post-deployment tasks...
echo Deployment completed successfully!
echo.
echo Deployment Summary:
echo   Image: %DOCKER_IMAGE_NAME%:%VERSION%
echo   Environment: %ENVIRONMENT%
echo   Status: Running
echo.
echo Running containers:
docker-compose ps
goto :end

:unknown_env
echo Unknown environment: %ENVIRONMENT%
echo Available environments: development, staging, production
exit /b 1

:end
echo CPE Connect deployment process completed!