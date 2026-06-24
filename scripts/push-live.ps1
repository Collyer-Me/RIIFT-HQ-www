# Push theme changes to GitHub (master). GitHub Actions deploys to live Shopify.
# Usage: .\scripts\push-live.ps1 "Your commit message"
# Preview locally first: shopify theme dev

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Message
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

git add -A
$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "Nothing to commit."
    exit 0
}

git commit -m $Message
git push origin master
Write-Host ""
Write-Host "Pushed to origin/master. Live deploy: https://github.com/Collyer-Me/RIIFT-HQ-www/actions"
Write-Host "Store preview: https://riift-hq.myshopify.com"
