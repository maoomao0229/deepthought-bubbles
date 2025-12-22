# 複製字體檔案到 app/fonts 目錄
$sourceDir = Join-Path $PSScriptRoot "src\app\fonts"
$destDir = Join-Path $PSScriptRoot "app\fonts"

# 建立目標資料夾
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

# 複製所有 .otf 檔案
Copy-Item "$sourceDir\*.otf" -Destination $destDir -Force

# 顯示複製結果
Write-Host "字體檔案已複製到: $destDir"
Get-ChildItem $destDir | Select-Object Name




