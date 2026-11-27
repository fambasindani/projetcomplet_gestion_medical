@echo off
rem ===========================================================================
rem  GS-Hopital - lanceur d'installation (double-clic)
rem  Demande l'elevation (UAC) puis execute installer.ps1 dans une console.
rem ===========================================================================
chcp 65001 >nul
title GS-Hopital - Installation
cd /d "%~dp0"

net session >nul 2>&1
if errorlevel 1 (
    echo Droits administrateur requis : acceptez l'invite UAC...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1" %*
set "RC=%ERRORLEVEL%"

echo.
if not "%RC%"=="0" (
    echo Installation interrompue ^(code %RC%^).
    echo Trace complete : %TEMP%\GS-Hopital-install.log
) else (
    echo Installation terminee.
)
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul
