# The Next｜私人藏書室

以深木色書架、古典精裝書封與紙張閱讀頁面，呈現原創小說的互動網站。介面以繁體中文為主，使用 React、TypeScript、Vite 與 CSS。

- 網站：[The Next](https://chiayi2004.github.io/the-next/)
- 原始碼：[chiayi2004/the-next](https://github.com/chiayi2004/the-next)
- 開發規範：[AGENTS.md](./AGENTS.md)

![The Next 私人藏書室](./docs/preview.png)

## 執行與建立網站

建議使用 Node.js 24 LTS 及 npm，與網站的自動發布環境一致。

```sh
npm install
npm run dev
npm run build
npm run preview
npm test
```

正式檔案輸出至 `dist/`。Vite 使用相對素材路徑，支援 GitHub Pages 專案網址。

## 使用方式

- 桌面將滑鼠移至書架左右邊緣，或點擊方向按鈕探索。手機可左右滑動。
- 點選書脊，查看書封、便利貼標籤、簡介及作品狀態。
- 選擇「翻開閱讀」進入閱讀器。桌面為雙頁，手機為單頁。
- 使用上一頁／下一頁按鈕或鍵盤左右鍵翻頁；最後一頁會停下。
- 「闔上書本」回到封面，「放回書架」或 Escape 返回書架。

## 新增小說

1. 先閱讀 `AGENTS.md`，確認作品名稱、簡介、狀態、1～5 個標籤、主要視覺標籤與完整章節；作者預設使用「木頭人」，除非另行指定。
2. 在 `src/data/books/` 建立該作品檔案，使用 `src/types/book.ts` 的 `Book` 格式。
3. 在 `src/data/books.ts` 匯入新書並加入書籍陣列；`shelfOrder` 決定排序。
4. `id`、`slug` 必須唯一；`primaryTag` 必須存在於 `src/data/tags.ts`，並包含在 `tags` 中。
5. 設定 `demo: false`，使用作者提供的原文，保留全部段落。不得擅自改寫。
6. 執行檢查與建立網站，逐一驗證抽書、閱讀、翻頁、返回書架與其他原有書籍。

未分章的作品設定 `hasChapters: false`，只在第一頁顯示書名；有章節的作品設定 `hasChapters: true`，只在各章首頁顯示章名。續頁不重複標題。寫作日期使用作者提供的 `writtenAt`。

標籤視覺設定集中於 `src/data/tags.ts`，書架與封面會自動沿用。閱讀器依照紙面實際尺寸與字體自動分頁，紙面無法捲動；放不下的內容會接到下一頁。視窗大小或字體改變時會重新排版並保留所在段落，確保原文不遭裁切。

## 目前內容狀態

新增《迷霧群島》（木頭人，2023/12/05，連載中），第一至第四章合併收錄為同一本小說。原文逐章保存在 `src/data/books/mist-islands/chapter-01.txt` 至 `chapter-04.txt`，並以來源記錄的 SHA-256 驗證正文完整性；標籤為怪談、懸疑、奇幻、家庭暴力，主要視覺標籤為怪談。

AI 示範書籍與文本已全部下架。目前已收錄木頭人的《向主懺悔》（2025/03/21）、《夏‧日‧祭》（2023/03/31）、《住在鯨魚肚子裡的男孩》（寫作日期未知）與《所以變成了檸檬糖》（寫作日期未知），皆由作者提供的 PDF 導入完整正文。`src/data/books.ts` 僅收錄作者提供的正式作品，並排除 `demo: true` 的測試資料。分頁測試使用的資料保留於 `tests/fixtures/demo-books.ts`，不會被匯入網站或打包發布。尚未加入會員、資料庫或付費功能。

## GitHub Pages

專案已附 `.github/workflows/deploy.yml`。GitHub Pages 的發布來源使用 GitHub Actions；每次推送 `main` 分支時，會自動安裝相依套件、執行測試、建立網站，並將 `dist/` 發布至 [正式網站](https://chiayi2004.github.io/the-next/)。測試或建立網站失敗時不會發布新的版本。

網站素材採用相對路徑，可在 `/the-next/` 專案網址中正常載入。小說內容保存在 `src/data/books/`，一般新增作品不需修改書架或閱讀器。

外部 Google Fonts 無法載入時會使用本機繁體中文字體；網站與閱讀功能仍可使用。
