# LyricsExtractor (main 統合版)

対応サイトの歌詞だけを抽出してコピペしやすく表示するブラウザ拡張。旧 chrome/firefox ブランチの内容は WXT ベースで main にまとめました。

## 対応サイト
- Google 検索の歌詞カード
- Uta-net
- J-Lyric
- KKBOX

## 使い方（開発/検証）
1. Node.js 18+ を用意し、依存をインストールします。
   ```bash
   npm install
   ```
2. 開発サーバー
   - Chrome/Chromium: `npm run dev`
   - Firefox: `npm run dev:firefox`
3. 本番ビルド
   - Chrome/Chromium: `npm run build:chromium` → `.output/chromium-mv3`
   - Firefox: `npm run build:firefox` → `.output/firefox-mv3`
4. 各ブラウザの拡張読み込みで上記 dist ディレクトリを指定してください。

## 動作のシンプルな仕様
- コンテンツスクリプトが対応ページを検知すると、右下に「歌詞を抽出」ボタンを出します。
- ポップアップの「抽出 / Extract」を押すとアクティブタブで抽出が走り、新しいタブに歌詞を整形表示します。

## 主なファイル
- `entrypoints/extractor.content.ts`: 抽出ロジックとページ内ボタン
- `entrypoints/popup.html`, `popup-script.ts`: ポップアップ UI とメッセージ送信
- `wxt.config.ts`: Chrome/Firefox 向けの manifest を出し分け

## ライセンス
MIT