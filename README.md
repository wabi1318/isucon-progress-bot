# ISUCON進捗共有BOT

毎日21:00（日本時間）にDiscordの指定チャンネルへ次の内容を投稿するCloudflare Workerです。

```text
今日の進捗にリアクションしてください。

✅ やった
🎯 やる
💡 わかった
🤔 まだわかんなかった

ひとことはスレッドに返信してください。
```

## 準備

Discordで投稿先チャンネルを開き、`チャンネルの編集`→`連携サービス`→`ウェブフック`からWebhookを作成してURLをコピーします。

依存パッケージをインストールし、Cloudflareへログインします。依存パッケージは7日以上前に公開された版を`pnpm-lock.yaml`で固定しています。

```bash
pnpm install --frozen-lockfile
pnpm exec wrangler login
```

Webhook URLをCloudflareのSecretへ登録します。入力した値はソースコードや設定ファイルには保存されません。

```bash
pnpm exec wrangler secret put DISCORD_WEBHOOK_URL
```

表示された入力欄へWebhook URLを貼り付けます。

## 動作確認

ローカルでWorkerを起動します。

```bash
pnpm dev
```

別のターミナルから予定処理を実行します。

```bash
curl "http://localhost:8787/cdn-cgi/local/scheduled"
```

Discordへ指定のメッセージが1件投稿されれば成功です。

## デプロイ

```bash
pnpm deploy
```

`wrangler.jsonc`のCron TriggerはUTCで指定しています。`0 12 * * *`は日本時間の毎日21:00です。

デプロイ後の実行結果は次のコマンドで確認できます。

```bash
pnpm tail
```
