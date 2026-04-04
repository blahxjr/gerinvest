@echo off
REM Setup Base Components Script
REM This script creates the base UI components structure

cd /d "%~dp0"
echo Creating base UI components...
node scripts\setup-base-components.js
pause
