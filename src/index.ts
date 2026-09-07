interface Env {
  DISCORD_WEBHOOK_URL: string;
}

const PROGRESS_REMINDER = [
  "今日の進捗にリアクションしてください。",
  "",
  "✅ やった",
  "🎯 やる",
  "💡 わかった",
  "🤔 まだわかんなかった",
  "",
  "ひとことはスレッドに返信してください。",
].join("\n");

const postProgressReminder = async (webhookUrl: string): Promise<void> => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: PROGRESS_REMINDER,
      allowed_mentions: { parse: [] },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Discord webhook request failed: ${response.status} ${response.statusText}`,
    );
  }
};

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
  ): Promise<void> {
    await postProgressReminder(env.DISCORD_WEBHOOK_URL);
  },
} satisfies ExportedHandler<Env>;
