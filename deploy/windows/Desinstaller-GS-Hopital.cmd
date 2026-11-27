@echo off
rem ===========================================================================
rem  GS-Hopital - lanceur de desinstallation (double-clic)
rem  Demande l'elevation (UAC) puis execute uninstall.ps1 dans une console.
rem ===========================================================================
chcp 65001 >nul
title GS-Hopital - Desinstallation
cd /d "%~dp0"

net session >nul 2>&1
if errorlevel 1 (
    echo Droits administrateur requis : acceptez l'invite UAC...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1" %*
set "RC=%ERRORLEVEL%"

echo.
if not "%RC%"=="0" (
    echo Desinstallation interrompue ^(code %RC%^).
) else (
    echo Desinstallation terminee.
)
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul
