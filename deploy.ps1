param(
  [string]$EnvFile = "./backend/.env",
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
  throw "Env file not found: $EnvFile"
}

$resolvedEnv = (Resolve-Path -LiteralPath $EnvFile).Path
$env:BACKEND_ENV_FILE = $resolvedEnv
$env:APP_PORT = "$Port"

Write-Host "Deploying myprofilelink..."
Write-Host "Env file: $resolvedEnv"
Write-Host "Host port: $Port"

$existingContainerId = docker ps -aq --filter "name=^myprofilelink$"
if ($LASTEXITCODE -ne 0) {
  throw "Failed to check existing container state."
}

if ($existingContainerId) {
  Write-Host "Removing existing container: myprofilelink"
  docker rm -f myprofilelink | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to remove existing myprofilelink container."
  }
}

docker compose up -d --build --remove-orphans
if ($LASTEXITCODE -ne 0) {
  throw "docker compose up failed."
}

$maxAttempts = 20
for ($i = 1; $i -le $maxAttempts; $i++) {
  $health = docker inspect --format "{{.State.Health.Status}}" myprofilelink 2>$null
  if ($LASTEXITCODE -eq 0 -and $health -eq "healthy") {
    Write-Host "Container health: healthy"
    break
  }

  if ($i -eq $maxAttempts) {
    throw "Container did not become healthy in time."
  }

  Start-Sleep -Seconds 3
}

try {
  $resp = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$Port/health" -TimeoutSec 8
  Write-Host "Health endpoint: HTTP $($resp.StatusCode)"
  Write-Host $resp.Content
} catch {
  Write-Warning "Could not call /health on localhost:$Port"
}
