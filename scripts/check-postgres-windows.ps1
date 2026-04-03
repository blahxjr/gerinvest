# Script para detectar ou ajudar a instalar PostgreSQL no Windows

$ErrorActionPreference = "SilentlyContinue"

Write-Host "`n🔍 VERIFICANDO POSTGRESQL NO WINDOWS`n" -ForegroundColor Cyan

# 1. Verificar se psql está acessível
Write-Host "1️⃣  Procurando por psql no PATH..."
$psql = Get-Command psql -ErrorAction SilentlyContinue

if ($psql) {
  Write-Host "✅ PostgreSQL encontrado: $($psql.Source)" -ForegroundColor Green
  & psql --version
  Write-Host "`n✅ PostgreSQL está instalado e acessível!`n" -ForegroundColor Green
  exit 0
}

Write-Host "❌ psql não encontrado no PATH`n" -ForegroundColor Red

# 2. Procurar pasta padrão de instalação
Write-Host "2️⃣  Procurando em Program Files..."
$pgPaths = @(
  "C:\Program Files\PostgreSQL\16\bin",
  "C:\Program Files\PostgreSQL\15\bin",
  "C:\Program Files\PostgreSQL\14\bin",
  "C:\Program Files\PostgreSQL\13\bin",
  "C:\Program Files (x86)\PostgreSQL\16\bin"
)

$foundPath = $null
foreach ($path in $pgPaths) {
  if (Test-Path "$path\psql.exe") {
    $foundPath = $path
    Write-Host "✅ PostgreSQL encontrado em: $path" -ForegroundColor Green
    break
  }
}

if ($foundPath) {
  Write-Host "`n📝 Para adicionar ao PATH, execute como ADMINISTRADOR:`n" -ForegroundColor Yellow
  Write-Host "[Environment]::SetEnvironmentVariable(" -NoNewline
  Write-Host "`'Path`'," -ForegroundColor Cyan -NoNewline
  Write-Host " `"`$" -NoNewline
  Write-Host "env:Path" -ForegroundColor Cyan -NoNewline
  Write-Host ";$foundPath`", [System.EnvironmentVariableTarget]::Machine )" -ForegroundColor Green
  
  Write-Host "`nDepois feche e reabra o PowerShell.`n" -ForegroundColor Yellow
  exit 1
}

# 3. Se não achou, informar para instalar
Write-Host "`n❌ PostgreSQL não foi encontrado no computador`n" -ForegroundColor Red
Write-Host "📥 Para instalar PostgreSQL:`n" -ForegroundColor Yellow
Write-Host "1. Acesse: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
Write-Host "2. Baixe: 'Download the installer'" -ForegroundColor Cyan
Write-Host "3. Execute o arquivo .exe" -ForegroundColor Cyan
Write-Host "4. Siga os passos (aceite defaults)" -ForegroundColor Cyan
Write-Host "5. Reinicie o Windows" -ForegroundColor Cyan
Write-Host "6. Execute este script novamente`n" -ForegroundColor Cyan

Write-Host "📖 Leia: docs/INSTALAR_POSTGRESQL.md`n" -ForegroundColor Yellow
