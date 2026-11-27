# ============================================================================
#  GS-Hopital - Construction du paquet de deploiement Windows
#
#  Produit : dist\GS-Hopital-Backend\  +  dist\GS-Hopital-Backend-<date>.zip
#  Le paquet contient l'API et l'interface web dans un seul app.jar.
#
#  Usage :
#      .\deploy\build-windows.ps1
#      .\deploy\build-windows.ps1 -SkipFrontend      (reutilise le dernier build)
#      .\deploy\build-windows.ps1 -SkipBackend       (assemble seulement)
#
#  Prerequis de build : Node.js (npm) + JDK 21 (Maven Wrapper fourni).
# ============================================================================
[CmdletBinding()]
param(
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [switch]$NoZip,
    [string]$ApiBaseUrl = '/api'
)

$ErrorActionPreference = 'Stop'

$root        = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $root 'frontend-vite'
$backendDir  = Join-Path $root 'bakend'
$staticDir   = Join-Path $backendDir 'src\main\resources\static'
$staticMed   = Join-Path $staticDir 'med'
$packageDir  = Join-Path $PSScriptRoot 'windows'
$outRoot     = Join-Path $root 'dist'
$outDir      = Join-Path $outRoot 'GS-Hopital-Backend'
$jarSource   = Join-Path $backendDir 'target\gestion-hospitaliere-0.0.1-SNAPSHOT.jar'

function Write-Step([string]$text) {
    Write-Host ""
    Write-Host ">>> $text" -ForegroundColor Cyan
}
function Fail([string]$message) {
    Write-Host ""
    Write-Host "ECHEC : $message" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   GS-Hopital - Construction du paquet Windows" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  Projet     : $root"
Write-Host "  Interface  : $frontendDir"
Write-Host "  Backend    : $backendDir"
Write-Host "  Sortie     : $outDir"

# ---------------------------------------------------------------------------
# 1. Interface React (Vite)
# ---------------------------------------------------------------------------
if (-not $SkipFrontend) {
    Write-Step "Construction de l'interface React"

    if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
        Write-Host "  node_modules absent : npm install ..."
        Push-Location $frontendDir
        try {
            if (Test-Path (Join-Path $frontendDir 'package-lock.json')) {
                & npm ci
            } else {
                & npm install
            }
            if ($LASTEXITCODE -ne 0) { Fail "npm install a echoue." }
        } finally { Pop-Location }
    }

    # L'interface sera servie par le backend : appels API relatifs.
    $env:VITE_API_URL = $ApiBaseUrl
    Push-Location $frontendDir
    try {
        Write-Host "  npm run build (VITE_API_URL=$ApiBaseUrl) ..."
        & npm run build
        if ($LASTEXITCODE -ne 0) { Fail "npm run build a echoue." }
    } finally {
        Pop-Location
        Remove-Item Env:\VITE_API_URL -ErrorAction SilentlyContinue
    }

    $frontendDist = Join-Path $frontendDir 'dist'
    if (-not (Test-Path (Join-Path $frontendDist 'index.html'))) {
        Fail "frontend-vite\dist\index.html introuvable apres le build."
    }

    Write-Step "Copie de l'interface dans le backend (src/main/resources/static/med)"
    if (Test-Path $staticMed) {
        Remove-Item $staticMed -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $staticMed | Out-Null
    Copy-Item (Join-Path $frontendDist '*') $staticMed -Recurse -Force
    Write-Host "  $(($(Get-ChildItem $staticMed -Recurse -File | Measure-Object).Count)) fichier(s) copie(s)."
}

if (-not (Test-Path (Join-Path $staticMed 'index.html'))) {
    Fail "Aucune interface dans $staticMed. Lancer sans -SkipFrontend."
}

# ---------------------------------------------------------------------------
# 2. Backend (jar executable)
# ---------------------------------------------------------------------------
if (-not $SkipBackend) {
    Write-Step "Compilation du backend (Maven)"

    # Si un backend de developpement tourne, le jar cible est verrouille.
    $locked = $false
    if (Test-Path $jarSource) {
        try {
            $stream = [System.IO.File]::Open($jarSource, 'Open', 'ReadWrite', 'None')
            $stream.Close()
        } catch { $locked = $true }
    }
    if ($locked) {
        $owner = Get-NetTCPConnection -LocalPort 7035 -State Listen -ErrorAction SilentlyContinue |
                 Select-Object -First 1
        if ($owner) {
            Write-Host "  Le port 7035 est occupe (backend en cours d'execution) : arret du processus $($owner.OwningProcess) ..." -ForegroundColor Yellow
            Stop-Process -Id $owner.OwningProcess -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
        } else {
            Fail "Le jar $jarSource est verrouille (arreter le backend puis relancer)."
        }
    }

    Push-Location $backendDir
    try {
        & .\mvnw.cmd -q -DskipTests package
        $code = $LASTEXITCODE
    } finally { Pop-Location }
    if ($code -ne 0) { Fail "mvn package a echoue (voir la sortie ci-dessus)." }
}

if (-not (Test-Path $jarSource)) {
    Fail "Jar introuvable : $jarSource"
}

# ---------------------------------------------------------------------------
# 3. Assemblage du paquet
# ---------------------------------------------------------------------------
Write-Step "Assemblage du paquet d'installation"

if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Copy-Item $jarSource (Join-Path $outDir 'app.jar') -Force
Copy-Item (Join-Path $packageDir '*') $outDir -Recurse -Force
Remove-Item (Join-Path $outDir 'README.md') -ErrorAction SilentlyContinue

# Sauvegarde de la base (si presente dans le projet) : utile pour une
# installation sur un serveur neuf.
$bakFile = Join-Path $root 'GestionHospitaliereDB.bak'
if (Test-Path $bakFile) {
    New-Item -ItemType Directory -Force -Path (Join-Path $outDir 'database') | Out-Null
    Copy-Item $bakFile (Join-Path $outDir 'database\GestionHospitaliereDB.bak') -Force
    Write-Host "  database\         : GestionHospitaliereDB.bak"
}

$jarMb = [math]::Round((Get-Item (Join-Path $outDir 'app.jar')).Length / 1MB, 1)
Write-Host "  app.jar           : $jarMb Mo"
Write-Host "  config\           : application-prod.properties"
Write-Host "  tools\nssm\nssm.exe : present"
Write-Host "  Installer / Desinstaller : presents"

# ---------------------------------------------------------------------------
# 4. Archive ZIP
# ---------------------------------------------------------------------------
if (-not $NoZip) {
    Write-Step "Creation de l'archive ZIP"
    $stamp = Get-Date -Format 'yyyyMMdd-HHmm'
    $zip = Join-Path $outRoot "GS-Hopital-Backend-$stamp.zip"
    if (Test-Path $zip) { Remove-Item $zip -Force }
    Compress-Archive -Path (Join-Path $outDir '*') -DestinationPath $zip -CompressionLevel Optimal
    $zipMb = [math]::Round((Get-Item $zip).Length / 1MB, 1)
    Write-Host "  $zip ($zipMb Mo)" -ForegroundColor Green
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "   Paquet pret" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "  Dossier : $outDir"
Write-Host ""
Write-Host "  Sur le serveur Windows :"
Write-Host "    1. copier le dossier GS-Hopital-Backend"
Write-Host "    2. verifier config\application-prod.properties"
Write-Host "    3. double-cliquer sur Installer-GS-Hopital.cmd"
Write-Host ""
