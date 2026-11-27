# ============================================================================
#  GS-Hopital - Installateur de l'application (service Windows / NSSM)
#  Application de gestion hospitaliere (Spring Boot + interface React)
#
#  Le service sert a la fois l'API (/api/**) et l'interface web : une seule
#  adresse, par exemple http://192.168.88.115:7035
#
#  Mode interactif :  .\Installer-GS-Hopital.cmd        (double-clic)
#  Mode silencieux :  .\installer.ps1 -Silent -SqlPassword ...
#
#  Ce script :
#    1. verifie Java 21, NSSM, le port
#    2. ecrit config\application-prod.properties
#    3. installe et demarre le service Windows
#    4. teste l'API et l'interface web
# ============================================================================
[CmdletBinding()]
param(
    [string]$InstallPath = 'C:\apps\gs-hopital\backend',
    [string]$ServiceName = 'GS-Hopital-Backend',
    [int]   $Port        = 7035,
    [string]$SqlServer   = '',
    [string]$Database    = 'GestionHospitaliereDB',
    [string]$SqlUser     = '',
    [string]$SqlPassword = '',
    [string]$JavaExe     = '',
    [switch]$OpenFirewall,
    [switch]$Silent
)

$ErrorActionPreference = 'Stop'
$ScriptVersion = '1.0'

# Le mot de passe SQL peut aussi venir de la variable d'environnement
# GSHOPITAL_SQL_PASSWORD : il n'apparait alors ni dans la ligne de commande
# ni dans la trace d'installation (utile pour une installation automatisee).
if (-not $SqlPassword -and $env:GSHOPITAL_SQL_PASSWORD) { $SqlPassword = $env:GSHOPITAL_SQL_PASSWORD }

# ---------------------------------------------------------------------------
# 0. Elevation (UAC)
# ---------------------------------------------------------------------------
$identity  = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    $relaunch = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"")
    foreach ($entry in $PSBoundParameters.GetEnumerator()) {
        if ($entry.Value -is [System.Management.Automation.SwitchParameter]) {
            if ($entry.Value.IsPresent) { $relaunch += "-$($entry.Key)" }
        } else {
            $relaunch += "-$($entry.Key)"
            $relaunch += "`"$($entry.Value)`""
        }
    }
    Write-Host "Droits administrateur requis : acceptez l'invite UAC..." -ForegroundColor Yellow
    if ($Silent) {
        $proc = Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $relaunch -Wait -PassThru
        exit $proc.ExitCode
    }
    Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $relaunch | Out-Null
    exit 0
}

$transcript = Join-Path $env:TEMP 'GS-Hopital-install.log'
try { Start-Transcript -Path $transcript -Append | Out-Null } catch { }

# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------
function Fail([string]$message) {
    Write-Host ""
    Write-Host "ECHEC : $message" -ForegroundColor Red
    try { Stop-Transcript | Out-Null } catch { }
    exit 1
}

function Run-Native {
    param([string]$FilePath, [string[]]$Arguments = @())
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $code = 0
    try {
        $output = & $FilePath @Arguments 2>&1
        $code = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previous
    }
    [pscustomobject]@{
        ExitCode = $code
        Output   = (($output | ForEach-Object { "$_" }) -join "`n").Trim()
    }
}

function Write-Step([int]$number, [int]$total, [string]$text) {
    Write-Host ("[{0}/{1}] {2} ... " -f $number, $total, $text) -NoNewline
}
function Write-Ok([string]$detail = 'OK') {
    Write-Host $detail -ForegroundColor Green
}
function Write-Warn([string]$text) {
    Write-Host $text -ForegroundColor Yellow
}

function Ask-Value([string]$label, [string]$default) {
    $suffix = if ($default) { " [$default]" } else { '' }
    while ($true) {
        $answer = Read-Host "$label$suffix"
        if ([string]::IsNullOrWhiteSpace($answer)) {
            if ($default) { return $default }
            Write-Host "  valeur obligatoire" -ForegroundColor Yellow
            continue
        }
        return $answer.Trim()
    }
}

function Ask-Password([string]$label) {
    while ($true) {
        $secure = Read-Host $label -AsSecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        try   { $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
        finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
        if (-not [string]::IsNullOrEmpty($plain)) { return $plain }
        Write-Host "  mot de passe obligatoire" -ForegroundColor Yellow
    }
}

function Ask-YesNo([string]$label, [bool]$default = $true) {
    $hint = if ($default) { 'O/n' } else { 'o/N' }
    while ($true) {
        $answer = Read-Host "$label ($hint)"
        if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
        if ($answer -match '^(o|oui|y|yes)$') { return $true }
        if ($answer -match '^(n|non|no)$')  { return $false }
    }
}

function New-JdbcUrl([string]$server, [string]$database) {
    $target = $server.Trim()
    if ($target -match ',') { $target = $target -replace ',', ':' }
    return "jdbc:sqlserver://$target;databaseName=$database;encrypt=true;trustServerCertificate=true"
}

function Test-TcpPort([string]$server, [int]$defaultPort = 1433) {
    $hostName = ($server -split '[\\,:]')[0].Trim()
    $targetPort = $defaultPort
    if ($server -match '[:,]\s*(\d{2,5})') { $targetPort = [int]$Matches[1] }
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $client.Connect($hostName, $targetPort)
        $client.Close()
        return $true
    } catch {
        return $false
    }
}

function Invoke-Nssm {
    param([string[]]$Arguments, [string]$Action)
    $result = Run-Native -FilePath $NssmExe -Arguments $Arguments
    if ($result.ExitCode -ne 0) {
        Fail "$Action (code $($result.ExitCode)).`n$($result.Output)"
    }
}

# Lecture / ecriture d'une propriete dans un fichier .properties.
function Get-PropertyValue([string]$text, [string]$name) {
    foreach ($line in ($text -split "`r?`n")) {
        if ($line -match ('^\s*' + [regex]::Escape($name) + '\s*=\s*(.*)$')) {
            return $Matches[1].Trim()
        }
    }
    return ''
}

function Set-PropertyValue([string]$text, [string]$name, [string]$value) {
    $lines = @($text -split "`r?`n")
    $found = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match ('^\s*' + [regex]::Escape($name) + '\s*=')) {
            $lines[$i] = $name + '=' + $value
            $found = $true
        }
    }
    if (-not $found) { $lines += ($name + '=' + $value) }
    return ($lines -join "`r`n")
}

# ---------------------------------------------------------------------------
# 1. Banniere et prerequis
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   GS-Hopital - Installation de l'application" -ForegroundColor Cyan
Write-Host "   Gestion hospitaliere - installateur v$ScriptVersion" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

# --- Fichiers du paquet ---
$packageDir = $PSScriptRoot
$sourceJar  = Join-Path $packageDir 'app.jar'
$NssmExe    = Join-Path $packageDir 'tools\nssm\nssm.exe'

if (-not (Test-Path $sourceJar)) { Fail "app.jar absent du paquet ($sourceJar)." }
if (-not (Test-Path $NssmExe)) {
    $fallback = 'C:\apps\gs-hopital\tools\nssm\nssm.exe'
    if (Test-Path $fallback) { $NssmExe = $fallback } else { Fail "nssm.exe absent du paquet ($NssmExe)." }
}

# --- Java 21 ---
function Find-Java {
    param([string]$preferred)
    if ($preferred -and (Test-Path $preferred)) { return $preferred }
    $found = @()
    foreach ($base in @('C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Java')) {
        if (Test-Path $base) {
            $found += Get-ChildItem $base -Directory -ErrorAction SilentlyContinue |
                      Where-Object { Test-Path (Join-Path $_.FullName 'bin\java.exe') } |
                      Sort-Object Name -Descending |
                      ForEach-Object { Join-Path $_.FullName 'bin\java.exe' }
        }
    }
    $cmd = Get-Command java -ErrorAction SilentlyContinue
    if ($cmd) { $found += $cmd.Source }
    return ($found | Where-Object { $_ } | Select-Object -First 1)
}

$JavaExe = Find-Java -preferred $JavaExe
if (-not $JavaExe) {
    if ($Silent) { Fail "Java introuvable. Installer un JDK 21 ou passer -JavaExe." }
    Write-Warn "Java introuvable automatiquement."
    do {
        $JavaExe = Ask-Value "Chemin complet de java.exe" "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot\bin\java.exe"
    } while (-not (Test-Path $JavaExe))
}

$javaInfo = Run-Native -FilePath $JavaExe -Arguments @('-version')
$javaLine = ($javaInfo.Output -split "`n" | Select-Object -First 1)
# Deux formats d'affichage coexistent selon la mise a jour du JDK :
#   ancien : openjdk version "21.0.8" 2025-07-15 LTS
#   recent : openjdk 21.0.13.1 2026-11-17 LTS
$javaMajor = 0
if ($javaLine -match 'version\s+"?(\d+)') { $javaMajor = [int]$Matches[1] }
elseif ($javaLine -match '\b(\d+)(\.\d)') { $javaMajor = [int]$Matches[1] }
Write-Host "Java  : $javaLine"

if ($javaMajor -eq 0) {
    Write-Warn "Version de Java non reconnue."
    if (-not $Silent) {
        if (-not (Ask-YesNo "Continuer malgre tout ?" $false)) { Fail "Installation annulee par l'utilisateur." }
    }
} elseif ($javaMajor -lt 21) {
    Write-Warn "Java $javaMajor est trop ancien : Java 21 minimum est requis."
    if ($Silent) { Fail "Installer Java 21 (ou superieur) sur le serveur." }
    if (-not (Ask-YesNo "Continuer malgre tout ?" $false)) { Fail "Installation annulee par l'utilisateur." }
} elseif ($javaMajor -gt 21) {
    Write-Host "Java $javaMajor : compatible (l'application est compilee pour Java 21)." -ForegroundColor Green
}

# --- Configuration remplie par l'utilisateur ? ---
# Si le paquet contient config\application-prod.properties complet, il fait
# foi : l'installateur n'ouvre alors aucune question sur la base de donnees.
$packageConfig  = Join-Path $packageDir 'config\application-prod.properties'
$configFromFile = $false
$fileContent    = ''
if (Test-Path $packageConfig) {
    $fileContent = ([System.IO.File]::ReadAllText($packageConfig)).TrimStart([char]0xFEFF)
    $missing = @()
    foreach ($name in @('spring.datasource.url', 'spring.datasource.username', 'spring.datasource.password')) {
        $value = Get-PropertyValue $fileContent $name
        if (-not $value -or $value -like '*CHANGER_MOI*') { $missing += $name }
    }
    if ($missing.Count -eq 0) {
        $configFromFile = $true
        $fileUrl = Get-PropertyValue $fileContent 'spring.datasource.url'
        $filePort = Get-PropertyValue $fileContent 'server.port'
        $fileAddr = Get-PropertyValue $fileContent 'server.address'
        if ($filePort -match '^\d+$' -and -not $PSBoundParameters.ContainsKey('Port')) { $Port = [int]$filePort }
        if ($fileUrl -match '//([^;\\]+)') { $SqlServer = ($Matches[1] -replace ':\d+$', '') }
        $SqlUser = Get-PropertyValue $fileContent 'spring.datasource.username'

        Write-Host "Configuration : config\application-prod.properties (rempli par vos soins)" -ForegroundColor Green
        Write-Host "  Base    : $fileUrl"
        Write-Host "  Compte  : $SqlUser"
        Write-Host "  Ecoute  : $fileAddr : $Port"
    } else {
        Write-Warn "config\application-prod.properties est encore incomplet :"
        foreach ($name in $missing) { Write-Host "    - $name" -ForegroundColor Yellow }
        Write-Warn "Completez ces lignes, ou repondez aux questions ci-dessous (le fichier sera ignore)."
    }
}

# --- Port ---
$serviceExiste = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
$portOccupe = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($portOccupe -and -not $serviceExiste) {
    Fail "Le port $Port est deja utilise par un autre programme. Choisir un autre port avec -Port."
}

# ---------------------------------------------------------------------------
# 2. Questions (mode interactif)
# ---------------------------------------------------------------------------
if (-not $Silent -and $configFromFile) {
    # Configuration deja remplie : aucune question sur la base, une confirmation.
    Write-Host ""
    Write-Host "--- Recapitulatif ---" -ForegroundColor Cyan
    Write-Host "  Base       : $(Get-PropertyValue $fileContent 'spring.datasource.url')"
    Write-Host "  Utilisateur: $(Get-PropertyValue $fileContent 'spring.datasource.username')"
    Write-Host "  Adresse    : $(Get-PropertyValue $fileContent 'server.address')"
    Write-Host "  Port       : $Port"
    Write-Host "  Dossier    : $InstallPath"
    Write-Host "  Service    : $ServiceName"
    Write-Host ""
    if (-not (Ask-YesNo "Lancer l'installation avec cette configuration ?" $true)) {
        Write-Host "Installation annulee."
        try { Stop-Transcript | Out-Null } catch { }
        exit 0
    }
}

if (-not $Silent -and -not $configFromFile) {
    Write-Host ""
    Write-Host "--- Base de donnees SQL Server ---" -ForegroundColor Cyan
    $defaultServer = if ($env:COMPUTERNAME) { $env:COMPUTERNAME } else { 'localhost' }
    if (-not $SqlServer)  { $SqlServer  = Ask-Value "Serveur SQL (hote, hote\INSTANCE ou hote,port)" $defaultServer }
    if (-not $Database)   { $Database   = Ask-Value "Base de donnees" 'GestionHospitaliereDB' }
    if (-not $SqlUser)    { $SqlUser    = Ask-Value "Utilisateur SQL" 'hopital' }
    if (-not $SqlPassword){ $SqlPassword = Ask-Password "Mot de passe SQL" }

    Write-Host ""
    Write-Host "--- Service ---" -ForegroundColor Cyan
    if (-not $PSBoundParameters.ContainsKey('Port')) {
        $portText = Ask-Value "Port du service" "$Port"
        $Port = [int]$portText
    }
    if (-not $PSBoundParameters.ContainsKey('InstallPath')) {
        $InstallPath = Ask-Value "Dossier d'installation" $InstallPath
    }
    if (-not $OpenFirewall) {
        $OpenFirewall = [bool](Ask-YesNo "Ouvrir le port $Port au pare-feu Windows ?" $true)
    }

    Write-Host ""
    Write-Host "--- Recapitulatif ---" -ForegroundColor Cyan
    Write-Host "  Base       : $(New-JdbcUrl $SqlServer $Database)"
    Write-Host "  Utilisateur: $SqlUser"
    Write-Host "  Adresse    : 0.0.0.0 (accessible en reseau)"
    Write-Host "  Port       : $Port"
    Write-Host "  Dossier    : $InstallPath"
    Write-Host "  Service    : $ServiceName"
    Write-Host ""
    if (-not (Ask-YesNo "Lancer l'installation ?" $true)) {
        Write-Host "Installation annulee."
        try { Stop-Transcript | Out-Null } catch { }
        exit 0
    }
}

# --- Validation en mode silencieux ---
if (-not $configFromFile) {
    if (-not $SqlServer)   { Fail "-SqlServer est obligatoire en mode -Silent (ou remplir config\application-prod.properties)." }
    if (-not $SqlUser)     { Fail "-SqlUser est obligatoire en mode -Silent (ou remplir config\application-prod.properties)." }
    if (-not $SqlPassword) { Fail "-SqlPassword est obligatoire en mode -Silent (ou remplir config\application-prod.properties)." }
}

# ---------------------------------------------------------------------------
# 3. Installation
# ---------------------------------------------------------------------------
Write-Host ""
$totalSteps = 7

# [1] Dossiers
Write-Step 1 $totalSteps "Creation des dossiers"
try {
    foreach ($dir in @($InstallPath, (Join-Path $InstallPath 'config'), (Join-Path $InstallPath 'logs'), (Join-Path $InstallPath 'uploads'))) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
} catch { Fail "Creation des dossiers impossible : $($_.Exception.Message)" }
Write-Ok

# [2] Copie du jar
Write-Step 2 $totalSteps "Copie de l'application"
$targetJar = Join-Path $InstallPath 'app.jar'
# Si l'installateur est execute depuis le dossier d'installation lui-meme
# (archive decompressee directement dans C:\apps\gs-hopital\backend), ne pas copier.
if ((Resolve-Path $sourceJar).Path -ne $targetJar) {
    Copy-Item $sourceJar $targetJar -Force
}
Write-Ok

# [3] Configuration
Write-Step 3 $totalSteps "Ecriture de la configuration"
$configPath = Join-Path $InstallPath 'config\application-prod.properties'

# Conserver la cle JWT existante lors d'une reinstallation (evite de deconnecter les utilisateurs)
$jwtSecret = ''
if (Test-Path $configPath) {
    $old = Get-Content $configPath -ErrorAction SilentlyContinue |
           Where-Object { $_ -match '^jwt\.secret=' } | Select-Object -First 1
    if ($old) { $jwtSecret = ($old -replace '^jwt\.secret=', '').Trim() }
}
if (-not $jwtSecret -or $jwtSecret -like 'CHANGER*' -or $jwtSecret.Length -lt 32) {
    $jwtSecret = -join ((1..64) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
}

$template = @'
# ============================================================================
# GS-Hopital - configuration de production
# Genere automatiquement par l'installateur le {{DATE}}
# Installation : {{INSTALLPATH}}
#
# Application servie sur le meme port que l'API :
#   http://<serveur>:{{PORT}}/
# ============================================================================

server.port={{PORT}}
server.address=0.0.0.0

# --- Base de donnees SQL Server ---------------------------------------------
spring.datasource.url={{DBURL}}
spring.datasource.username={{DBUSER}}
spring.datasource.password={{DBPASS}}
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# --- JPA / Hibernate ---------------------------------------------------------
# Ne pas modifier : les tables utilisent les noms exacts des entites.
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.open-in-view=true

# --- Securite / JWT ----------------------------------------------------------
jwt.secret={{JWT}}
jwt.expiration=3600000
jwt.refresh-expiration=86400000

# --- Fichiers (photos, documents) -------------------------------------------
app.upload.dir=uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# --- Journaux ----------------------------------------------------------------
logging.file.name={{LOGFILE}}
logging.level.root=INFO
logging.level.org.springframework.security=INFO
logging.logback.rollingpolicy.max-file-size=10MB
logging.logback.rollingpolicy.max-history=30
logging.logback.rollingpolicy.total-size-cap=500MB
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} %-5level [%thread] %logger{36} - %msg%n
'@

$content = $template.Replace('{{DATE}}', (Get-Date -Format 'yyyy-MM-dd HH:mm'))
$content = $content.Replace('{{INSTALLPATH}}', $InstallPath)
$content = $content.Replace('{{PORT}}', "$Port")
$content = $content.Replace('{{DBURL}}', (New-JdbcUrl $SqlServer $Database))
$content = $content.Replace('{{DBUSER}}', $SqlUser)
$content = $content.Replace('{{DBPASS}}', $SqlPassword)
$content = $content.Replace('{{JWT}}', $jwtSecret)
$content = $content.Replace('{{LOGFILE}}', ((Join-Path $InstallPath 'logs\backend.log') -replace '\\', '/'))

if ($configFromFile) {
    # Le fichier rempli par l'utilisateur fait foi : on ne remplace que ce qui
    # depend de la machine (chemin des journaux, cle JWT, port effectif).
    $content = Set-PropertyValue $fileContent 'logging.file.name' ((Join-Path $InstallPath 'logs\backend.log') -replace '\\', '/')
    $content = Set-PropertyValue $content 'server.port' "$Port"
    $content = Set-PropertyValue $content 'jwt.secret' $jwtSecret
}

[System.IO.File]::WriteAllText($configPath, $content, (New-Object System.Text.UTF8Encoding($false)))

# Verification de ce qui a ete ecrit : une cle JWT vide ferait echouer toutes
# les connexions, un mot de passe vide ferait echouer le service au demarrage.
$written = [System.IO.File]::ReadAllText($configPath)
if ((Get-PropertyValue $written 'jwt.secret').Length -lt 32) {
    Fail "La cle jwt.secret n'a pas ete ecrite correctement dans $configPath"
}
if (-not (Get-PropertyValue $written 'spring.datasource.password')) {
    Fail "Le mot de passe SQL n'a pas ete ecrit correctement dans $configPath"
}
if (-not (Get-PropertyValue $written 'spring.datasource.url')) {
    Fail "L'URL de la base n'a pas ete ecrite correctement dans $configPath"
}

# Le fichier contient le mot de passe SQL : acces reserve aux administrateurs
# et au compte de service (SYSTEM). Les droits sont poses sur le dossier AVEC
# les indicateurs d'heritage (OI)(CI), puis le fichier reprend cet heritage
# via /reset. Sans ce /reset, la seule suppression de l'heritage laisse un
# DACL vide sur le fichier : le service recoit "acces refuse" au demarrage.
$configDir = Join-Path $InstallPath 'config'
$aclDir = Run-Native -FilePath 'icacls.exe' -Arguments @(
    $configDir, '/inheritance:r', '/grant:r',
    '*S-1-5-32-544:(OI)(CI)F', '*S-1-5-18:(OI)(CI)F'
)
$null = Run-Native -FilePath 'icacls.exe' -Arguments @($configPath, '/reset')

function Test-SystemCanRead([string]$path) {
    try { $acl = Get-Acl $path } catch { return $false }
    foreach ($ace in $acl.Access) {
        if ($ace.AccessControlType -ne 'Allow') { continue }
        try { $sid = $ace.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value }
        catch { continue }
        if ($sid -eq 'S-1-5-18') { return $true }
    }
    return $false
}

if ($aclDir.ExitCode -ne 0 -or -not (Test-SystemCanRead $configPath)) {
    # Filet de securite : mieux vaut une configuration lisible par tous les
    # comptes locaux qu'un service incapable de demarrer.
    $null = Run-Native -FilePath 'icacls.exe' -Arguments @($configDir, '/inheritance:e')
    $null = Run-Native -FilePath 'icacls.exe' -Arguments @($configPath, '/reset')
    if (-not (Test-SystemCanRead $configPath)) {
        Write-Warn "ACL non verifiable : verifier les droits sur $configPath"
    }
}
Write-Ok

# [4] Test de la base
Write-Step 4 $totalSteps "Test de connexion a SQL Server"
if (Test-TcpPort $SqlServer) {
    Write-Ok
} else {
    Write-Host "port 1433 injoignable" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Serveur teste : $SqlServer" -ForegroundColor Yellow
    Write-Host "  La base doit etre joignable depuis CETTE machine sur le port 1433." -ForegroundColor Yellow
    Write-Host "  Verifier spring.datasource.url dans config\application-prod.properties." -ForegroundColor Yellow
    Write-Host ""
    if ($Silent) { Fail "SQL Server injoignable sur $SqlServer." }
    if (-not (Ask-YesNo "Continuer malgre tout (le service ne demarrera probablement pas) ?" $false)) {
        try { Stop-Transcript | Out-Null } catch { }
        exit 1
    }
}

# [5] Service
Write-Step 5 $totalSteps "Installation du service Windows"
$appParameters = "-Xms256m -Xmx1024m -Dfile.encoding=UTF-8 -Duser.timezone=Africa/Kinshasa " +
                 "-jar `"$(Join-Path $InstallPath 'app.jar')`" --spring.profiles.active=prod"

# NSSM enregistre son propre chemin comme executable du service Windows.
# S'il est lance depuis le paquet d'installation, le service depend ensuite de
# ce dossier : le deplacer ou le supprimer casse le demarrage. On le copie donc
# d'abord dans un dossier stable, a cote du dossier d'installation.
$parentDir  = Split-Path $InstallPath -Parent
$nssmHome   = Join-Path $parentDir 'tools\nssm'
$nssmStable = Join-Path $nssmHome 'nssm.exe'
New-Item -ItemType Directory -Force -Path $nssmHome | Out-Null

if ($serviceExiste) {
    # Recreation complete : garantit que le service pointe sur le NSSM stable
    # et remet a zero le compteur d'arrets de NSSM.
    Write-Host "service existant : arret et recreation... " -NoNewline
    $null = Run-Native -FilePath $NssmExe -Arguments @('stop', $ServiceName)
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Seconds 1
        if (-not (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) -or
            (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue).Status -eq 'Stopped') { break }
    }
    $removed = Run-Native -FilePath $NssmExe -Arguments @('remove', $ServiceName, 'confirm')
    if ($removed.ExitCode -ne 0) {
        $scRemoved = Run-Native -FilePath 'sc.exe' -Arguments @('delete', $ServiceName)
        if ($scRemoved.ExitCode -ne 0) {
            Fail "Suppression du service existant impossible.`n$($removed.Output)`n$($scRemoved.Output)"
        }
    }
    Start-Sleep -Seconds 2
}

# Copie du NSSM stable (l'ancien service peut encore tenir le fichier quelques
# secondes : on reessaie, puis on libere le processus residuel).
if ((Resolve-Path $NssmExe).Path -ne $nssmStable) {
    for ($i = 1; $i -le 10; $i++) {
        try {
            Copy-Item $NssmExe $nssmStable -Force -ErrorAction Stop
            break
        } catch {
            if ($i -eq 10) { Fail "Copie de nssm.exe impossible : $($_.Exception.Message)" }
            Get-Process nssm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    }
}
$NssmExe = $nssmStable

Invoke-Nssm -Arguments @('install', $ServiceName, $JavaExe) -Action 'Creation du service'

Invoke-Nssm -Arguments @('set', $ServiceName, 'AppParameters', $appParameters)                              -Action 'Parametres'
Invoke-Nssm -Arguments @('set', $ServiceName, 'AppDirectory', $InstallPath)                                -Action 'Repertoire'
Invoke-Nssm -Arguments @('set', $ServiceName, 'DisplayName', 'GS-Hopital - Gestion hospitaliere')          -Action 'Nom affiche'
Invoke-Nssm -Arguments @('set', $ServiceName, 'Description', 'Application de gestion hospitaliere (Spring Boot + React)') -Action 'Description'
Invoke-Nssm -Arguments @('set', $ServiceName, 'Start', 'SERVICE_AUTO_START')                               -Action 'Demarrage auto'
Invoke-Nssm -Arguments @('set', $ServiceName, 'AppStdout', (Join-Path $InstallPath 'logs\stdout.log'))     -Action 'Sortie standard'
Invoke-Nssm -Arguments @('set', $ServiceName, 'AppStderr', (Join-Path $InstallPath 'logs\stderr.log'))     -Action 'Sortie erreur'
Invoke-Nssm -Arguments @('set', $ServiceName, 'AppRotateFiles', '1')                                       -Action 'Rotation'
Invoke-Nssm -Arguments @('set', $ServiceName, 'AppRotateOnline', '1')                                      -Action 'Rotation a chaud'
Invoke-Nssm -Arguments @('set', $ServiceName, 'AppRotateBytes', '10485760')                                -Action 'Taille rotation'
Invoke-Nssm -Arguments @('set', $ServiceName, 'AppExit', 'Default', 'Restart')                             -Action 'Redemarrage sur crash'
Invoke-Nssm -Arguments @('set', $ServiceName, 'AppRestartDelay', '5000')                                   -Action 'Delai redemarrage'
Write-Ok

# [6] Demarrage
Write-Step 6 $totalSteps "Demarrage du service"
$startResult = Run-Native -FilePath $NssmExe -Arguments @('start', $ServiceName)
if ($startResult.ExitCode -ne 0) {
    # NSSM renvoie 1 lorsque le SCM repond SERVICE_PAUSED juste apres la
    # creation du service. On retente proprement avant de conclure a l'echec :
    # c'est la boucle d'attente du port qui decide.
    Start-Sleep -Seconds 3
    try { Start-Service -Name $ServiceName -ErrorAction Stop } catch { }
}

$listening = $false
$restarted = $false
for ($i = 1; $i -le 60; $i++) {
    Start-Sleep -Seconds 2
    if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) { $listening = $true; break }
    $state = (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue).Status
    if ($state -eq 'Paused' -and -not $restarted) {
        # NSSM met le service en pause apres plusieurs arrets immediats
        $restarted = $true
        $null = Run-Native -FilePath $NssmExe -Arguments @('stop', $ServiceName)
        Start-Sleep -Seconds 2
        $null = Run-Native -FilePath $NssmExe -Arguments @('start', $ServiceName)
        continue
    }
    if ($state -ne 'Running' -and $state -ne 'StartPending' -and $state -ne 'Paused') { break }
}
if (-not $listening) {
    Write-Host "ECHEC" -ForegroundColor Red
    foreach ($log in @('stderr.log', 'stdout.log')) {
        $p = Join-Path $InstallPath "logs\$log"
        if (Test-Path $p) {
            Write-Host "--- $log (30 dernieres lignes) ---" -ForegroundColor Yellow
            Get-Content $p -Tail 30
        }
    }
    Fail "Le service n'a pas demarre. Verifier la configuration et la base de donnees."
}
Write-Ok "$([int]($i * 2)) s"

# [7] Test fonctionnel
Write-Step 7 $totalSteps "Test de l'API et de l'interface"
$httpCode = 'aucune reponse'
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api/auth/login" -Method POST `
        -ContentType 'application/json' -Body '{"email":"x","password":"y"}' `
        -UseBasicParsing -TimeoutSec 20
    $httpCode = [int]$response.StatusCode
} catch {
    if ($_.Exception.Response) { $httpCode = [int]$_.Exception.Response.StatusCode }
}
if ($httpCode -in @(400, 401)) {
    Write-Ok "API HTTP $httpCode - operationnelle"
} else {
    Write-Warn "API HTTP $httpCode (verifier logs\backend.log)"
}

$pageCode = 'aucune reponse'
try {
    $page = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/med/" -UseBasicParsing -TimeoutSec 20
    $pageCode = [int]$page.StatusCode
} catch {
    if ($_.Exception.Response) { $pageCode = [int]$_.Exception.Response.StatusCode }
}
if ($pageCode -eq 200) {
    Write-Host "Interface web HTTP 200 - operationnelle" -ForegroundColor Green
} else {
    Write-Warn "Interface web HTTP $pageCode (verifier que le jar contient bien l'interface)"
}

# --- Pare-feu ---
if ($OpenFirewall) {
    $ruleName = "GS-Hopital (TCP $Port)"
    if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP `
            -LocalPort $Port -Action Allow -Profile Domain,Private | Out-Null
        Write-Host "Pare-feu   : regle ajoutee pour le port $Port" -ForegroundColor Yellow
    }
}

# ---------------------------------------------------------------------------
# 4. Resume
# ---------------------------------------------------------------------------
$ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
       Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
       Select-Object -First 1).IPAddress
if (-not $ip) { $ip = $env:COMPUTERNAME }

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "   Installation terminee" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "  Service   : $ServiceName (demarrage automatique)"
Write-Host "  Dossier   : $InstallPath"
Write-Host "  Adresse   : http://${ip}:$Port/med"
Write-Host "  Logs      : $InstallPath\logs\backend.log"
Write-Host "  Config    : $configPath"
Write-Host ""
Write-Host "  Commandes utiles :"
Write-Host "    nssm status $ServiceName"
Write-Host "    nssm restart $ServiceName"
Write-Host "    Get-Content `"$InstallPath\logs\backend.log`" -Wait -Tail 50"
Write-Host ""
try { Stop-Transcript | Out-Null } catch { }
exit 0
