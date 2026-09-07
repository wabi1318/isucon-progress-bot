interface Env {
  DISCORD_WEBHOOK_URL: string;
}

const PROGRESS_POLL = {
  poll: {
    question: {
      text: "今日のISUCON進捗（複数選択可）\nひとことはこの投票メッセージのスレッドに返信してください。",
    },
    answers: [
      { poll_media: { text: "やった", emoji: { name: "✅" } } },
      { poll_media: { text: "やる", emoji: { name: "🎯" } } },
      { poll_media: { text: "わかった", emoji: { name: "💡" } } },
      {
        poll_media: {
          text: "まだわかんなかった",
          emoji: { name: "🤔" },
        },
      },
    ],
    duration: 24,
    allow_multiselect: true,
    layout_type: 1,
  },
} as const;

const postProgressReminder = async (webhookUrl: string): Promise<void> => {
  const webhookRequestUrl = new URL(webhookUrl);
  webhookRequestUrl.searchParams.set("wait", "true");

  const response = await fetch(webhookRequestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(PROGRESS_POLL),
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
