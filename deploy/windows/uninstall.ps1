# ============================================================================
#  GS-Hopital - Desinstallateur (service Windows / NSSM)
#
#  Mode interactif :  .\Desinstaller-GS-Hopital.cmd   (double-clic)
#  Mode silencieux :  .\uninstall.ps1 -Silent [-RemoveData]
#
#  Par defaut les donnees (uploads\, config\) sont CONSERVEES.
#  Utiliser -RemoveData pour tout supprimer.
# ============================================================================
[CmdletBinding()]
param(
    [string]$InstallPath = 'C:\apps\gs-hopital\backend',
    [string]$ServiceName = 'GS-Hopital-Backend',
    [int]   $Port        = 7035,
    [switch]$RemoveData,
    [switch]$Silent
)

$ErrorActionPreference = 'Stop'

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

function Ask-YesNo([string]$label, [bool]$default = $false) {
    $hint = if ($default) { 'O/n' } else { 'o/N' }
    while ($true) {
        $answer = Read-Host "$label ($hint)"
        if ([string]::IsNullOrWhiteSpace($answer)) { return $default }
        if ($answer -match '^(o|oui|y|yes)$') { return $true }
        if ($answer -match '^(n|non|no)$')  { return $false }
    }
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   GS-Hopital - Desinstallation" -ForegroundColor Cyan
Write-Host "   Gestion hospitaliere" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if (-not $service) {
    Write-Host "Le service $ServiceName n'est pas installe." -ForegroundColor Yellow
} else {
    if (-not $Silent) {
        if (-not (Ask-YesNo "Arreter et supprimer le service $ServiceName ?" $true)) {
            Write-Host "Desinstallation annulee."
            exit 0
        }
    }

    Write-Host "Arret du service ... " -NoNewline
    try { Stop-Service -Name $ServiceName -Force -ErrorAction Stop } catch { }
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        $state = (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue).Status
        if (-not $state -or $state -eq 'Stopped') { break }
    }
    Write-Host "OK" -ForegroundColor Green

    # Retrouver nssm.exe (dossier stable a cote de l'installation)
    $nssm = $null
    $candidates = @(
        (Join-Path (Split-Path $InstallPath -Parent) 'tools\nssm\nssm.exe'),
        (Join-Path $PSScriptRoot 'tools\nssm\nssm.exe'),
        'C:\apps\gs-hopital\tools\nssm\nssm.exe'
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { $nssm = $c; break }
    }

    Write-Host "Suppression du service ... " -NoNewline
    $removed = $false
    if ($nssm) {
        $r = Run-Native -FilePath $nssm -Arguments @('remove', $ServiceName, 'confirm')
        $removed = ($r.ExitCode -eq 0)
    }
    if (-not $removed) {
        $r = Run-Native -FilePath 'sc.exe' -Arguments @('delete', $ServiceName)
        $removed = ($r.ExitCode -eq 0)
    }
    if ($removed) {
        Write-Host "OK" -ForegroundColor Green
    } else {
        Write-Host "echec (le service disparaitra au prochain redemarrage)" -ForegroundColor Yellow
    }
}

# Regle de pare-feu
$ruleName = "GS-Hopital (TCP $Port)"
if (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue) {
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    Write-Host "Regle de pare-feu supprimee." -ForegroundColor Green
}

# Les fichiers
if (-not $Silent -and -not $RemoveData) {
    $RemoveData = [bool](Ask-YesNo "Supprimer aussi les fichiers et donnees de $InstallPath ?" $false)
}

if ($RemoveData) {
    if (Test-Path $InstallPath) {
        Write-Host "Suppression de $InstallPath ... " -NoNewline
        Remove-Item $InstallPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "OK" -ForegroundColor Green
    }
    $parent = Split-Path $InstallPath -Parent
    if ((Split-Path $parent -Leaf) -eq 'gs-hopital') {
        $tools = Join-Path $parent 'tools'
        if (Test-Path $tools) { Remove-Item $tools -Recurse -Force -ErrorAction SilentlyContinue }
        # Supprimer C:\apps\gs-hopital s'il est vide
        if ((Get-ChildItem $parent -Force -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
            Remove-Item $parent -Force -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host ""
    Write-Host "Fichiers conserves : $InstallPath" -ForegroundColor Yellow
    Write-Host "  (uploads\ et config\ peuvent etre sauvegardes avant suppression)"
}

Write-Host ""
Write-Host "Desinstallation terminee." -ForegroundColor Green
Write-Host ""
exit 0
