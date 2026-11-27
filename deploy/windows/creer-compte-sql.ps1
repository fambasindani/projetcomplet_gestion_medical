# ============================================================================
#  GS-Hopital - Creation / correction du compte SQL de l'application
#
#  A executer sur le serveur d'application (ou n'importe quel poste qui
#  atteint SQL Server), avec un compte SQL administrateur (sa).
#
#  Usage :
#      powershell -NoProfile -ExecutionPolicy Bypass -File .\creer-compte-sql.ps1
#          (compte SQL administrateur, ex. sa)
#
#      powershell -NoProfile -ExecutionPolicy Bypass -File .\creer-compte-sql.ps1 -WindowsAuth
#          (a executer SUR la machine SQL, avec un compte Windows administrateur)
#
#  Le script :
#    1. verifie que SQL Server accepte l'authentification SQL
#    2. cree le login "hopital" (ou corrige son mot de passe)
#    3. l'active et le rattache a GestionHospitaliereDB
#    4. accorde db_datareader, db_datawriter, db_ddladmin
#    5. teste la connexion avec le compte applicatif
# ============================================================================
[CmdletBinding()]
param(
    [string]$SqlServer   = '192.168.88.115,1433',
    [string]$Database    = 'GestionHospitaliereDB',
    [string]$SaUser      = 'sa',
    [string]$SaPassword  = '',
    [string]$AppUser     = 'hopital',
    [string]$AppPassword = 'hopital+1234',
    [switch]$WindowsAuth
)

$ErrorActionPreference = 'Stop'

function New-Connection([string]$db, [string]$user, [string]$password) {
    $cs = "Server=$SqlServer;Database=$db;User Id=$user;Password=$password;Encrypt=True;TrustServerCertificate=True;Connect Timeout=15"
    return New-Object System.Data.SqlClient.SqlConnection($cs)
}

function New-AdminConnection([string]$db) {
    if ($WindowsAuth) {
        $cs = "Server=$SqlServer;Database=$db;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;Connect Timeout=15"
    } else {
        $cs = "Server=$SqlServer;Database=$db;User Id=$SaUser;Password=$SaPassword;Encrypt=True;TrustServerCertificate=True;Connect Timeout=15"
    }
    return New-Object System.Data.SqlClient.SqlConnection($cs)
}

function Invoke-Sql([System.Data.SqlClient.SqlConnection]$connection, [string]$sql) {
    $cmd = $connection.CreateCommand()
    $cmd.CommandText = $sql
    $cmd.CommandTimeout = 60
    return $cmd.ExecuteNonQuery()
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   GS-Hopital - Compte SQL de l'application" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  Serveur SQL : $SqlServer"
Write-Host "  Base        : $Database"
Write-Host "  Compte app  : $AppUser"
Write-Host ""

# --- Mot de passe administrateur SQL ---------------------------------------
if (-not $WindowsAuth) {
    if (-not $SaPassword) {
        $secure = Read-Host "Mot de passe SQL de '$SaUser'" -AsSecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        try   { $SaPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
        finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    }
    if (-not $SaPassword) { Write-Host "Mot de passe obligatoire." -ForegroundColor Red; exit 1 }
}

# --- Connexion administrateur ----------------------------------------------
$modeLabel = if ($WindowsAuth) { 'authentification Windows' } else { "compte '$SaUser'" }
Write-Host "[1/5] Connexion a SQL Server ($modeLabel) ... " -NoNewline
try {
    $admin = New-AdminConnection 'master'
    $admin.Open()
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "ECHEC" -ForegroundColor Red
    Write-Host ""
    Write-Host "Impossible de se connecter :" -ForegroundColor Yellow
    Write-Host "  $($_.Exception.Message)"
    Write-Host ""
    if ($WindowsAuth) {
        Write-Host "L'authentification Windows n'est acceptee que depuis la machine SQL" -ForegroundColor Yellow
        Write-Host "(192.168.88.115), avec un compte administrateur de cette machine." -ForegroundColor Yellow
    } else {
        Write-Host "Verifier le mot de passe de '$SaUser', ou relancer avec -WindowsAuth" -ForegroundColor Yellow
        Write-Host "directement sur la machine SQL."
    }
    exit 1
}

try {
    # --- Mode d'authentification -------------------------------------------
    Write-Host "[2/5] Mode d'authentification ... " -NoNewline
    $cmd = $admin.CreateCommand()
    $cmd.CommandText = "SELECT CAST(SERVERPROPERTY('IsIntegratedSecurityOnly') AS int)"
    $windowsOnly = [int]$cmd.ExecuteScalar()
    if ($windowsOnly -eq 1) {
        Write-Host "Windows uniquement" -ForegroundColor Red
        Write-Host ""
        Write-Host "SQL Server n'accepte PAS les comptes SQL (mode Windows uniquement)." -ForegroundColor Yellow
        Write-Host "Sur la machine SQL (192.168.88.115) :"
        Write-Host "  1. Ouvrir SQL Server Management Studio"
        Write-Host "  2. Clic droit sur le serveur > Proprietes > Securite"
        Write-Host "  3. Choisir 'Mode d'authentification SQL Server et Windows'"
        Write-Host "  4. OK, puis redemarrer le service 'SQL Server (MSSQLSERVER)'"
        Write-Host "  5. Relancer ce script"
        exit 1
    }
    Write-Host "SQL Server + Windows : OK" -ForegroundColor Green

    # --- Base de donnees ----------------------------------------------------
    Write-Host "[3/5] Base '$Database' ... " -NoNewline
    $cmd.CommandText = "SELECT COUNT(*) FROM sys.databases WHERE name = N'$Database'"
    if ([int]$cmd.ExecuteScalar() -eq 0) {
        Write-Host "INTROUVABLE" -ForegroundColor Red
        Write-Host ""
        Write-Host "La base '$Database' n'existe pas sur $SqlServer." -ForegroundColor Yellow
        Write-Host "Restaurer database\GestionHospitaliereDB.bak (voir LISEZ-MOI.txt, section 2 bis)."
        exit 1
    }
    Write-Host "OK" -ForegroundColor Green

    # --- Login --------------------------------------------------------------
    Write-Host "[4/5] Login '$AppUser' ... " -NoNewline
    $escapedPassword = $AppPassword.Replace("'", "''")

    $cmd.CommandText = "SELECT COUNT(*) FROM sys.sql_logins WHERE name = N'$AppUser'"
    $exists = [int]$cmd.ExecuteScalar() -eq 1

    if (-not $exists) {
        Invoke-Sql $admin "CREATE LOGIN [$AppUser] WITH PASSWORD = N'$escapedPassword', CHECK_POLICY = OFF, DEFAULT_DATABASE = [$Database]" | Out-Null
        Write-Host "cree" -ForegroundColor Green
    } else {
        Invoke-Sql $admin "ALTER LOGIN [$AppUser] WITH PASSWORD = N'$escapedPassword', CHECK_POLICY = OFF" | Out-Null
        Write-Host "mot de passe corrige" -ForegroundColor Green
    }

    # Activer le login et s'assurer qu'il n'est pas expire / verrouille
    Invoke-Sql $admin "ALTER LOGIN [$AppUser] ENABLE" | Out-Null
    Invoke-Sql $admin "ALTER LOGIN [$AppUser] WITH CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF" | Out-Null
    Invoke-Sql $admin "ALTER LOGIN [$AppUser] WITH DEFAULT_DATABASE = [$Database]" | Out-Null

    # --- Utilisateur + droits dans la base ---------------------------------
    Write-Host "[5/5] Droits dans '$Database' ... " -NoNewline
    $appDb = New-AdminConnection $Database
    $appDb.Open()

    $cmd = $appDb.CreateCommand()
    $cmd.CommandText = "SELECT COUNT(*) FROM sys.database_principals WHERE name = N'$AppUser' AND type IN ('S','U')"
    if ([int]$cmd.ExecuteScalar() -eq 0) {
        Invoke-Sql $appDb "CREATE USER [$AppUser] FOR LOGIN [$AppUser]" | Out-Null
    } else {
        Invoke-Sql $appDb "ALTER USER [$AppUser] WITH LOGIN = [$AppUser]" | Out-Null
    }

    foreach ($role in @('db_datareader', 'db_datawriter', 'db_ddladmin')) {
        # ADD MEMBER echoue si deja membre : on ignore l'erreur
        $cmd.CommandText = "ALTER ROLE [$role] ADD MEMBER [$AppUser]"
        try { $cmd.ExecuteNonQuery() | Out-Null } catch { }
    }
    $appDb.Close()
    Write-Host "OK" -ForegroundColor Green

    $admin.Close()

    # --- Test avec le compte applicatif -------------------------------------
    Write-Host ""
    Write-Host "Test de connexion avec '$AppUser' ... " -NoNewline
    $test = New-Connection $Database $AppUser $AppPassword
    $test.Open()
    $cmd = $test.CreateCommand()
    $cmd.CommandText = "SELECT COUNT(*) FROM sys.tables"
    $tables = [int]$cmd.ExecuteScalar()
    $test.Close()
    Write-Host "OK ($tables table(s) visible(s))" -ForegroundColor Green

    Write-Host ""
    Write-Host "==============================================================" -ForegroundColor Green
    Write-Host "   Compte SQL pret" -ForegroundColor Green
    Write-Host "==============================================================" -ForegroundColor Green
    Write-Host "  Serveur : $SqlServer"
    Write-Host "  Base    : $Database"
    Write-Host "  Compte  : $AppUser"
    Write-Host ""
    Write-Host "  Vous pouvez maintenant lancer l'installateur :"
    Write-Host "      cd C:\GS-Hopital-Backend"
    Write-Host "      powershell -NoProfile -ExecutionPolicy Bypass -File .\installer.ps1 -OpenFirewall"
    Write-Host ""
} finally {
    if ($admin -and $admin.State -ne 'Closed') { $admin.Close() }
}
