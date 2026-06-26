# Local theme preview (Shopify CLI). Applies Node PATH workaround automatically.
# Usage: .\scripts\theme-dev.ps1

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "_ensure-node.ps1")
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "Starting theme dev - preview at http://127.0.0.1:9292"
Write-Host "Styleguide: http://127.0.0.1:9292/pages/styleguide"
Write-Host ""

shopify theme dev @args
