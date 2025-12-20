---
description: 深思氣泡專案的 AI 開發準則，每次執行動作前必須閱讀
---

# 深思氣泡 AI 開發規範

每次執行任何程式碼修改前，必須先閱讀 `.ai-rules.md` 確認以下規範：

## 核心檢查清單

1. **語言規範**
   - 所有回覆使用繁體中文
   - 程式碼關鍵邏輯加上繁體中文註解

2. **視覺規範**
   - 嚴禁使用紅色，錯誤提示用 Yellow (#FFC678)
   - 間距必須是 4px 或 8px 的倍數
   - Mobile 全螢幕，Desktop 限制 max-w-[430px] 置中

3. **內容限制**
   - 禁止 AI 假文，用 "Lorem Ipsum" 或描述性佔位
   - 禁止 AI 圖片，用 div 色塊或 Lucide 圖標

4. **安全規範**
   - 嚴禁 hardcode API Key，使用 .env
   - 生產環境清除所有 console.log

5. **程式碼潔淨**
   - 嚴禁在程式碼中使用 Emoji（對話可以）

6. **文檔紀錄**
   - 修改後更新 ITERATION_LOG.md
   - 格式：`-[YYYY/MM/DD HH:mm v0.X] 檔案: [名] | 內容: [描述] | 原因: [原因]`

7. **Git 上傳 SOP**
   // turbo-all
   - 執行 `$env:LC_ALL='C.UTF-8'; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8`
   - 執行 `git add .`
   - 根據修改生成英文 Commit Message
   - 執行 `git commit -m "[Message]"`
   - 執行 `git push`
   - 成功後回報並摘要內容
