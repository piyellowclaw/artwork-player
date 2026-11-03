# Mac 作品輪播

安裝 Node.js 22 或更新版本，下載專案後，在 Terminal 進入專案資料夾：

~~~sh
npm ci
npm run list-displays
npm start -- --windowed
~~~

確認視窗預覽正常後，離開預覽，再用 list-displays 顯示的螢幕 ID 啟動：

~~~sh
npm start -- --display 2
~~~

上面的 2 只是範例；請以你的螢幕 ID 為準。不指定時優先使用外接螢幕，沒有外接時使用主螢幕。正式播放為無邊框、涵蓋螢幕 bounds，不改動 macOS 的延伸螢幕設定。

- Escape：離開
- →／空白鍵：跳過目前這次生成
- Enter：手動確認目前生成完成（正常播放不需要）

## 修改作品與輪播參數

八件作品各在 artworks/ 下獨立資料夾，直接編輯各自的 sketch.js 和 helper。原本的 fxhash／亂數產生器保留；每次重開 iframe 自動依原程式生成新結果。

修改 artworks/manifest.json 裡的 config，例如：

~~~json
{"repetitions":3,"holdMs":10000,"fadeMs":600,"watchdogMs":600000}
~~~

- repetitions：同件作品連續生成次數
- holdMs：作品真正完成生成後，停留多久才切換
- fadeMs：雙 iframe 交叉淡化的時間
- watchdogMs：生成過久時的提醒，並不假裝完成或自動跳過

作品清單的順序就是輪播順序；跑完後回到第一件。不同作品可在各自 entry 覆寫 holdMs 和 watchdogMs。不要把載入完成當作繪製完成；完成判定依各作品經檢查的 adapter。

Recursive and Blocks 已跳過背景紋理繪製，保留底色和主要圖形。其原始函式仍保留便於之後修改。跳過這段也會省略原本亂數消耗，因此同 seed 與原網站紋理版不保證相同構圖。

詳見 README.md、ARTWORKS.md 與 audit/ 下的驗證記錄。首次安裝需要下載 npm/Electron 套件；安裝完成後播放作品不需要網路。修改後建議先用 --windowed 驗證，再放上展演螢幕。
