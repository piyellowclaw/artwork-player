# Mac 作品輪播

安裝 Node.js 22 或更新版本，下載專案後，在 Terminal 進入專案資料夾：

~~~sh
npm ci
npm run list-displays
npm start -- --windowed
~~~

確認視窗預覽正常後，離開預覽，再用 list-displays 顯示的螢幕 index 啟動（從 0 開始）：

~~~sh
npm start -- --display 0
~~~

0 是清單中的第一個螢幕，1 是第二個；清單也會列出 OS ID 和名稱。`--display-index 1` 是 index 選法的別名；相容舊系統 ID 可用 `--display-id OS_ID`。指定不存在的 index／ID 會報錯，不會偷偷換螢幕。不指定時優先使用外接螢幕，沒有外接時使用主螢幕。正式播放為不透明、直角、無陰影的無邊框視窗，涵蓋螢幕 bounds，不改動 macOS 的延伸螢幕設定。

- Escape：離開
- →／空白鍵：跳過目前這次生成
- Enter：手動確認目前生成完成（正常播放不需要）

## 修改作品與輪播參數

八件作品各在 artworks/ 下獨立資料夾，直接編輯各自的 sketch.js 和 helper。原本的 fxhash／亂數產生器保留；每次重開 iframe 自動依原程式生成新結果。

修改 artworks/manifest.json 裡的 config，例如：

~~~json
{"shuffle":true,"repetitions":3,"holdMs":10000,"fadeMs":600,"watchdogMs":600000}
~~~

- shuffle：預設 true，每輪洗牌；false 依作品清單順序
- repetitions：同件作品連續生成次數
- holdMs：作品真正完成生成後，停留多久才切換
- fadeMs：每個淡出／淡入階段的時間（預設各 600ms，合計 1.2 秒，另加黑畫面等待載入／開始的時間）
- watchdogMs：生成過久時的提醒，並不假裝完成或自動跳過

切換採「淡出到黑 → 移除舊作品 → 黑畫面下載入並啟動新作品 → 確認第一個 canvas 繪製畫格後淡入」，不會兩件作品同時生成。預載 iframe 的原始腳本保持暫停。**不會等整件生成完才淡入**，觀眾仍會看到即時生成過程；真正生成完成後才開始計算預設 10 秒停留。

載入與啟動各受 readyTimeoutMs 限制（預設各 30 秒）。腳本錯誤、啟動失敗或逾時維持黑畫面並顯示錯誤，按 →／空白鍵可跳過恢復；錯誤不會當作完成。非 canvas 的自訂作品需在真正開始繪製時發送 artwork-player-started window event，不能用 load 假裝開始。

每輪會將全部作品隨機排列一次，同輪不重複抽到同件；每件仍依 repetitions 連續生成 3 次再換下一件。全部播過才重新洗牌，並避免跨輪連續同件（多件作品時）。shuffle=false 可恢復清單順序。手動或錯誤後跳過會消耗當次排定生成，不會重開整輪。不同作品可在各自 entry 覆寫 holdMs 和 watchdogMs。不要把載入完成當作繪製完成；完成判定依各作品經檢查的 adapter。

Recursive and Blocks 已跳過背景紋理繪製；改為依目前螢幕比例生成滿版構圖，移除固定紙張留白與橫直版型黑邊，不裁切原畫面。保留底色和主要圖形演算法。其原始函式仍保留便於之後修改。跳過這段也會省略原本亂數消耗，因此同 seed 與原網站紋理版不保證相同構圖。

詳見 README.md、ARTWORKS.md 與 audit/ 下的驗證記錄。首次安裝需要下載 npm/Electron 套件；安裝完成後播放作品不需要網路。修改後建議先用 --windowed 驗證，再放上展演螢幕。

正式展演模式會把所選螢幕的播放器視窗提高到 macOS menu bar 上方，因此也會蓋住該螢幕其他一般視窗；Esc 可退出。--windowed 預覽不置頂。這不會修改系統 menu bar 設定，也不使用 kiosk 鎖定模式。
