# Create / ensure the Component catalog page (handle: styleguide, template: styleguide).
# Requires store auth with content scopes — see scripts/store-auth-scopes.txt

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "_ensure-node.ps1")
Set-Location (Join-Path $PSScriptRoot "..")

function Invoke-ShopifyStore {
    param([string[]]$CliArgs)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $allArgs = $CliArgs + @("--json")
    $out = & shopify @allArgs 2>$null | Out-String
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    if ($code -ne 0) { return $null }
    return $out.Trim()
}

$store = "riift-hq.myshopify.com"
$scopesFile = Join-Path $PSScriptRoot "store-auth-scopes.txt"
$scopes = (Get-Content $scopesFile -Raw).Trim()

Write-Host "Checking for existing page handle 'styleguide'..."
$checkJson = Invoke-ShopifyStore -CliArgs @(
    "store", "execute",
    "--store", $store,
    "--query-file", (Join-Path $PSScriptRoot "graphql\page-styleguide-check.graphql")
)
if (-not $checkJson) {
    Write-Host "Store execute failed. Re-authenticate if needed:"
    Write-Host "  shopify store auth --store $store --scopes $scopes"
    exit 1
}

$existing = ($checkJson | ConvertFrom-Json).pages.nodes
if ($existing.Count -gt 0) {
    Write-Host "Page already exists: /pages/$($existing[0].handle) (template: $($existing[0].templateSuffix))"
    exit 0
}

Write-Host "Creating styleguide page..."
$resultJson = Invoke-ShopifyStore -CliArgs @(
    "store", "execute",
    "--store", $store,
    "--query-file", (Join-Path $PSScriptRoot "graphql\page-styleguide-create.graphql"),
    "--variable-file", (Join-Path $PSScriptRoot "graphql\page-styleguide-create.variables.json"),
    "--allow-mutations"
)

if (-not $resultJson) {
    Write-Host "Page create failed."
    exit 1
}

$payload = $resultJson | ConvertFrom-Json
$errors = $payload.pageCreate.userErrors
if ($errors -and $errors.Count -gt 0) {
    Write-Host "Shopify returned errors:"
    $errors | ForEach-Object { Write-Host "  - $($_.message)" }
    exit 1
}

$page = $payload.pageCreate.page
Write-Host "Created: /pages/$($page.handle) (template: $($page.templateSuffix))"
Write-Host "Preview: http://127.0.0.1:9292/pages/styleguide"
