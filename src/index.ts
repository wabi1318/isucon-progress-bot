interface Env {
  DISCORD_BOT_TOKEN: string;
  DISCORD_CHANNEL_ID: string;
}

const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
const POLL_DURATION_HOURS = 24;
const THREAD_AUTO_ARCHIVE_DURATION_MINUTES = 1440;

const PROGRESS_POLL = {
  question: {
    text: "今日、ISUCONの作業をやった？\n詳しい内容はこのスレッドに返信してください。",
  },
  answers: [
    { poll_media: { text: "やった", emoji: { name: "✅" } } },
    { poll_media: { text: "やらなかった", emoji: { name: "🌙" } } },
  ],
  duration: POLL_DURATION_HOURS,
  allow_multiselect: false,
  layout_type: 1,
} as const;

const PROGRESS_MEMO_TEMPLATE = [
  "このテンプレートをコピーして、進捗を書いてください。",
  "",
  "やった：",
  "やる（明日以降）：",
  "わかった：",
  "まだわかんなかった：",
  "ひとこと：",
].join("\n");

const formatThreadName = (scheduledTime: number): string => {
  const scheduledDate = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(scheduledTime);

  return `${scheduledDate} ISUCON進捗共有`;
};

const postDiscordRequest = async (
  botToken: string,
  requestPath: string,
  requestBody: object,
): Promise<Response> => {
  const response = await fetch(`${DISCORD_API_BASE_URL}${requestPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(
      `Discord API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response;
};

const hasDiscordId = (value: unknown): value is { id: string } =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string";

const postProgressPoll = async (
  botToken: string,
  channelId: string,
): Promise<string> => {
  const response = await postDiscordRequest(
    botToken,
    `/channels/${encodeURIComponent(channelId)}/messages`,
    {
      poll: PROGRESS_POLL,
      allowed_mentions: { parse: [] },
    },
  );
  const responseBody: unknown = await response.json();

  if (!hasDiscordId(responseBody)) {
    throw new Error("Discord API response did not include a message id");
  }

  return responseBody.id;
};

const createProgressThread = async (
  botToken: string,
  channelId: string,
  messageId: string,
  scheduledTime: number,
): Promise<string> => {
  const response = await postDiscordRequest(
    botToken,
    `/channels/${encodeURIComponent(channelId)}/messages/${encodeURIComponent(messageId)}/threads`,
    {
      name: formatThreadName(scheduledTime),
      auto_archive_duration: THREAD_AUTO_ARCHIVE_DURATION_MINUTES,
    },
  );
  const responseBody: unknown = await response.json();

  if (!hasDiscordId(responseBody)) {
    throw new Error("Discord API response did not include a thread id");
  }

  return responseBody.id;
};

const postProgressMemoTemplate = async (
  botToken: string,
  threadId: string,
): Promise<void> => {
  await postDiscordRequest(
    botToken,
    `/channels/${encodeURIComponent(threadId)}/messages`,
    {
      content: PROGRESS_MEMO_TEMPLATE,
      allowed_mentions: { parse: [] },
    },
  );
};

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
  ): Promise<void> {
    const messageId = await postProgressPoll(
      env.DISCORD_BOT_TOKEN,
      env.DISCORD_CHANNEL_ID,
    );
    const threadId = await createProgressThread(
      env.DISCORD_BOT_TOKEN,
      env.DISCORD_CHANNEL_ID,
      messageId,
      controller.scheduledTime,
    );
    await postProgressMemoTemplate(env.DISCORD_BOT_TOKEN, threadId);
  },
} satisfies ExportedHandler<Env>;
