# Git 初始化腳本
# 請在 deepthought-bubbles 目錄中執行此腳本

# 1. 確保我們在正確的資料夾
Write-Host "正在初始化 Git 倉庫..." -ForegroundColor Green
git init

# 2. 將主要分支命名為 main
Write-Host "將分支命名為 main..." -ForegroundColor Green
git branch -M main

# 3. 加入遠端地址
Write-Host "加入遠端倉庫..." -ForegroundColor Green
git remote add origin https://github.com/maoomao0229/deepthought-bubbles.git

# 4. 第一次全體上傳
Write-Host "加入所有檔案..." -ForegroundColor Green
git add .

Write-Host "提交變更..." -ForegroundColor Green
git commit -m "Initial commit: DeepThought Bubbles VIBE System"

Write-Host "推送到 GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "完成！" -ForegroundColor Green

