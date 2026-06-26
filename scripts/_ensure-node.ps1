# Ensures Node.js is on PATH for this PowerShell session.
# Node is installed but not yet on system PATH (pending admin fix).

$nodeDir = "C:\Program Files\nodejs"
if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
    Write-Error "Node.js not found at $nodeDir"
}

if ($env:PATH -notlike "*$nodeDir*") {
    $env:PATH += ";$nodeDir"
}
