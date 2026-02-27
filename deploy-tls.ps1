param(
  [Parameter(Mandatory = $true)]
  [string]$Domain,
  [Parameter(Mandatory = $true)]
  [string]$AcmeEmail,
  [string]$EnvFile = "./backend/.env"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $EnvFile)) {
  throw "Env file not found: $EnvFile"
}

$resolvedEnv = (Resolve-Path -LiteralPath $EnvFile).Path
$env:BACKEND_ENV_FILE = $resolvedEnv
$env:DOMAIN = $Domain
$env:ACME_EMAIL = $AcmeEmail

Write-Host "Deploying myprofilelink with TLS..."
Write-Host "Domain: $Domain"
Write-Host "ACME email: $AcmeEmail"
Write-Host "Env file: $resolvedEnv"

$containers = @("myprofilelink-proxy", "myprofilelink")
foreach ($name in $containers) {
  $existing = docker ps -aq --filter "name=^$name$"
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to inspect container state for $name"
  }

  if ($existing) {
    Write-Host "Removing existing container: $name"
    docker rm -f $name | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to remove existing container: $name"
    }
  }
}

docker compose -f docker-compose.tls.yml up -d --build --remove-orphans
if ($LASTEXITCODE -ne 0) {
  throw "docker compose TLS deployment failed."
}

$maxAttempts = 20
for ($i = 1; $i -le $maxAttempts; $i++) {
  $health = docker inspect --format "{{.State.Health.Status}}" myprofilelink 2>$null
  if ($LASTEXITCODE -eq 0 -and $health -eq "healthy") {
    Write-Host "App container health: healthy"
    break
  }

  if ($i -eq $maxAttempts) {
    throw "App container did not become healthy in time."
  }

  Start-Sleep -Seconds 3
}

$proxyStatus = docker inspect --format "{{.State.Status}}" myprofilelink-proxy 2>$null
if ($LASTEXITCODE -ne 0 -or $proxyStatus -ne "running") {
  throw "Proxy container is not running."
}

Write-Host "Proxy container status: running"
Write-Host "Deployment complete."
Write-Host "Ensure DNS A records for $Domain and www.$Domain point to this host."
