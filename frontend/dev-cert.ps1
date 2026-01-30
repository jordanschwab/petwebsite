<#
Generates a local dev certificate using mkcert (recommended) or shows OpenSSL commands.

Usage:
  - Install mkcert: https://github.com/FiloSottile/mkcert
  - Run (PowerShell, admin may be required for install step):
      .\dev-cert.ps1

This script will create a `.cert` folder with `localhost.pem` and `localhost-key.pem`.
#>

param()

$certDir = Join-Path $PSScriptRoot '.cert'
if (-not (Test-Path $certDir)) { New-Item -ItemType Directory -Path $certDir | Out-Null }

function Use-Mkcert {
    if (Get-Command mkcert -ErrorAction SilentlyContinue) {
        Write-Output "Using mkcert to generate certs..."
        mkcert -install
        mkcert -cert-file (Join-Path $certDir 'localhost.pem') -key-file (Join-Path $certDir 'localhost-key.pem') localhost 127.0.0.1 ::1
        Write-Output "Created certs in $certDir"
        return $true
    }
    return $false
}

if (-not (Use-Mkcert)) {
    Write-Output "mkcert not found. If you want to use mkcert, install it: https://github.com/FiloSottile/mkcert"
    Write-Output "Fallback: you can generate a dev cert with OpenSSL (not trusted by browsers by default)."
    Write-Output "OpenSSL example (PowerShell):"
    Write-Output "  openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes -keyout $certDir\localhost-key.pem -out $certDir\localhost.pem -subj '/CN=localhost'"
}

Write-Output "Done. If you used mkcert, your OS/browser will trust the generated certs. Restart the Vite dev server to apply them."
