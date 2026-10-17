$sourcePath = "C:\Users\rishi\.gemini\antigravity-ide\scratch\floatchat-ai"
$destinationPath = "C:\Users\rishi\.gemini\antigravity-ide\scratch\floatchat-ai.zip"

if (Test-Path $destinationPath) {
    Remove-Item $destinationPath -Force
}

Write-Output "Zipping FloatChat AI project resources..."

# Create clean list of files excluding node_modules, build outputs and git config
$files = Get-ChildItem -Path $sourcePath -Recurse | Where-Object {
    $_.FullName -notmatch "node_modules" -and 
    $_.FullName -notmatch "dist" -and 
    $_.FullName -notmatch "\.git" -and
    $_.FullName -notmatch "\.zip" -and
    $_.FullName -notmatch "uploads"
}

# Compress the selected files
Compress-Archive -Path ($files.FullName) -DestinationPath $destinationPath -Force

Write-Output "--------------------------------------------------------"
Write-Output "SUCCESS: FloatChat AI Project packed at:"
Write-Output "$destinationPath"
Write-Output "--------------------------------------------------------"
