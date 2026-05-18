$ErrorActionPreference = 'Stop'

$backend = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $backend '.mariadb-data'
$mysqlCandidates = @(
  $env:MYSQL_BIN_DIR,
  'C:\Program Files\MariaDB 12.2\bin',
  'C:\Program Files\MySQL\MySQL Server 8.4\bin',
  'C:\Program Files\MySQL\MySQL Server 8.0\bin'
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

$binDir = $mysqlCandidates | Select-Object -First 1
if (-not $binDir) {
  throw 'MySQL/MariaDB tools were not found. Install MariaDB or MySQL Server, or set MYSQL_BIN_DIR to the bin directory.'
}

$mysql = Join-Path $binDir 'mysql.exe'
$mysqladmin = Join-Path $binDir 'mysqladmin.exe'
$mysqld = Join-Path $binDir 'mysqld.exe'
$installDb = Join-Path $binDir 'mariadb-install-db.exe'

if (-not (Test-Path -LiteralPath $mysqld)) {
  throw "mysqld.exe was not found in $binDir"
}

if (-not (Test-Path -LiteralPath $dataDir)) {
  if (-not (Test-Path -LiteralPath $installDb)) {
    throw 'Database data directory is missing and mariadb-install-db.exe is not available to create it.'
  }
  New-Item -ItemType Directory -Path $dataDir | Out-Null
  & $installDb --datadir=$dataDir --port=3306 --password=''
  if ($LASTEXITCODE -ne 0) {
    throw 'Database initialization failed.'
  }
}

if (Test-Path -LiteralPath $mysqladmin) {
  & $mysqladmin --ssl=0 -h 127.0.0.1 -P 3306 -u root ping *> $null
  if ($LASTEXITCODE -eq 0) {
    Write-Output 'Database is already running on 127.0.0.1:3306.'
    exit 0
  }
}

$defaultsFile = Join-Path $dataDir 'my.ini'
if (-not (Test-Path -LiteralPath $defaultsFile)) {
  @"
[mysqld]
datadir=$($dataDir.Replace('\', '/'))
port=3306
[client]
port=3306
"@ | Set-Content -LiteralPath $defaultsFile -Encoding ASCII
}

$outLog = Join-Path $backend 'mariadb-runtime.log'
$errLog = Join-Path $backend 'mariadb-runtime.err.log'
Start-Process -FilePath $mysqld -ArgumentList @("--defaults-file=$defaultsFile", '--console') -WorkingDirectory $backend -RedirectStandardOutput $outLog -RedirectStandardError $errLog -WindowStyle Hidden
Start-Sleep -Seconds 3

if (Test-Path -LiteralPath $mysqladmin) {
  & $mysqladmin --ssl=0 -h 127.0.0.1 -P 3306 -u root ping
}
