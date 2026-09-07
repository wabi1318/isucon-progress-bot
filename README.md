# ISUCON進捗共有BOT

毎日21:00（日本時間）にDiscordの通常のテキストチャンネルへ24時間有効な進捗投票を投稿し、その投票から日付付きの公開スレッドを作るCloudflare Workerです。

```text
スレッド名: 2026/09/08 ISUCON進捗共有

投票: 今日、ISUCONの作業をやった？

- ✅ やった
- 🌙 やらなかった

詳しい内容はこのスレッドに返信してください。

スレッド内の進捗メモ用テンプレート:

やった：
やる（明日以降）：
わかった：
まだわかんなかった：
ひとこと：
```

## 準備

Discord Developer PortalでApplicationとBotを作成し、投稿先サーバーへ追加します。Botには投稿先チャンネルで次の権限を付与します。

- チャンネルを見る
- メッセージを送信
- 公開スレッドを作成
- スレッドでメッセージを送信

Discordの開発者モードを有効にし、投稿先の通常のテキストチャンネルを右クリックして`チャンネルIDをコピー`を選びます。

依存パッケージをインストールし、Cloudflareへログインします。依存パッケージは7日以上前に公開された版を`pnpm-lock.yaml`で固定しています。

```bash
pnpm install --frozen-lockfile
pnpm exec wrangler login
```

Bot TokenとChannel IDをCloudflareのSecretへ登録します。入力した値はソースコードや設定ファイルには保存されません。

```bash
pnpm exec wrangler secret put DISCORD_BOT_TOKEN
pnpm exec wrangler secret put DISCORD_CHANNEL_ID
```

それぞれ表示された入力欄へBot TokenとChannel IDを貼り付けます。

## 動作確認

プロジェクト直下の`.dev.vars`へ、ローカル確認用のBot TokenとChannel IDを設定します。このファイルはGit管理対象外です。

```text
DISCORD_BOT_TOKEN=Bot Token
DISCORD_CHANNEL_ID=Channel ID
```

Workerを起動します。

```bash
pnpm dev
```

別のターミナルから予定処理を実行します。

```bash
curl "http://localhost:8787/cdn-cgi/local/scheduled"
```

Discordへ投票が投稿され、`YYYY/MM/DD ISUCON進捗共有`という公開スレッド内に進捗メモ用テンプレートが投稿されれば成功です。この操作は実際のDiscordチャンネルへ投稿します。

## デプロイ

```bash
pnpm deploy
```

`wrangler.jsonc`のCron TriggerはUTCで指定しています。`0 12 * * *`は日本時間の毎日21:00です。

デプロイ後の実行結果は次のコマンドで確認できます。

```bash
pnpm tail
```
