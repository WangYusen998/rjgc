$ErrorActionPreference = 'Stop'

$backend = Split-Path -Parent $PSScriptRoot
$sqlFile = Join-Path $backend 'sql\init_swiftride.sql'
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
if (-not (Test-Path -LiteralPath $mysql)) {
  throw "mysql.exe was not found in $binDir"
}

if (-not (Test-Path -LiteralPath $sqlFile)) {
  throw "SQL file was not found: $sqlFile"
}

$sourcePath = $sqlFile.Replace('\', '/')
& $mysql --ssl=0 --default-character-set=utf8mb4 -h 127.0.0.1 -P 3306 -u root --execute="source $sourcePath"
if ($LASTEXITCODE -ne 0) {
  throw 'Database import failed.'
}

& $mysql --ssl=0 -h 127.0.0.1 -P 3306 -u root -D swiftride --execute='SHOW TABLES;'
