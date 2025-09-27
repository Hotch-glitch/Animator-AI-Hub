# Animator AI Hub with Hoshi

**EN (English)** · 日本語は下へ

## What is this?
A simple, fast **blind two-choice ranking** tool for multiple categories (Human/Dog/Horse/Chimpanzee/Tiger/Parrot/Eagle/Bat/Dragon/Griffin).  
Open `index.html`, and you will:
- Start from the first category.
- See **two videos playing side by side** (muted, looped).
- **Click** a side or press **J (left) / K (right)** to pick.
- Instant switch to the next pair → **knockout tournament** (with BYE if odd).
- After deciding a **champion** for that category, it moves to the next.
- Final screen shows **champions for all categories**.

## How do I insert my 10 videos per category?
1. Open `videos.json` in a text editor.
2. Replace `"url": "REPLACE_WITH_YOUR_VIDEO_URL"` with your actual video URL (e.g., Cloudflare Stream signed URL, Mux playback URL, Vercel-hosted `/videos/*.mp4`).  
   - Keep other fields (`id`, `title`, `model`) as labels for your internal tracking.
   - You can disable a clip by setting `"enabled": false`.
3. Save the file and reload `index.html` in your browser.

### Recommended export settings (for fairness & smoothness)
- Same duration (e.g., **5 s**), same FPS (e.g., **24 fps**), same resolution (e.g., **1920×1080**).
- Loopable clips (start and end frame align), muted.
- Optionally normalize via `ffmpeg` for consistent playback.

## How to run
- **Local**: Just double-click `index.html` (some browsers may restrict autoplay; tap to start).
- **Hosted (later)**: Deploy to Vercel/Netlify and store your videos on Cloudflare Stream/Mux or in your site's `/videos/` folder.

## Where do votes go?
This prototype **prints votes to the browser console**.  
In production, replace the `console.log("vote", ...)` line in `app.js` with a `fetch("/api/vote", ...)` POST call to your backend (e.g., Supabase) to store logs.

---

## 日本語（Japanese）

### これは何？
複数カテゴリ（人間／犬／馬／チンパンジー／虎／インコ／ワシ／コウモリ／ドラゴン／グリフォン）のための、**二択ブラインド評価ツール**です。  
`index.html` を開くと：
- 最初のカテゴリから開始
- **左右に動画が同時再生**（ミュート・ループ）
- **クリック** か **J（左）／K（右）** で選択
- 即座に次のペアへ → **ノックアウト・トーナメント**（奇数は **BYE=不戦勝**）
- そのカテゴリの**優勝動画**が決まったら次のカテゴリへ
- 最後に各カテゴリの**優勝一覧**を表示

### 各カテゴリに動画10本を挿入する方法
1. `videos.json` をテキストエディタで開く。
2. 各アイテムの `"url": "REPLACE_WITH_YOUR_VIDEO_URL"` を、実際の動画URL（例：Cloudflare Stream のサイン付きURL、Muxの再生URL、Vercelサイトの `/videos/*.mp4`）に置き換える。  
   - `id` / `title` / `model` はメモ用。  
   - 一時的に出したくない動画は `"enabled": false` に。
3. 保存して `index.html` を再読込。

### 推奨する書き出し条件（公平性・滑らかさのため）
- **同じ秒数（例：5秒）／同じFPS（例：24fps）／同じ解像度（例：1920×1080）**
- ループ可能（開始と終了がつながる）、無音
- 必要に応じて `ffmpeg` で統一

### 実行方法
- **ローカル**：`index.html` をダブルクリック（自動再生がブロックされたら、一度タップ）
- **公開（後で）**：Vercel/Netlify 等にデプロイし、動画は Cloudflare Stream/Mux またはサイトの `/videos/` に配置可能

### 投票ログはどこへ？
この試作では **ブラウザのコンソール** に出力しています。  
本番では `app.js` の `console.log("vote", ...)` を、`fetch("/api/vote", ...)` に置き換えてサーバ（例：Supabase）に保存してください。
