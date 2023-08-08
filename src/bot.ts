import { Bot, webhookCallback } from "grammy";
import Fastify from "fastify";

const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

const fastify = Fastify({ logger: true });

fastify.get("/", async (_, reply) => {
  reply.type("text/plain").code(200);
  reply.send(`server is active`);
});

// Handle the /yo command to greet the user
bot.command("yo", (ctx) => ctx.reply(`Yo ${ctx.from?.username}`));

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
]);

// Handle all other messages and the /start command
const introductionMessage = `Hello! I'm a Telegram bot.
I'm powered by Cyclic, the next-generation serverless computing platform.

<b>Commands</b>
/yo - Be greeted by me
/effect [text] - Show a keyboard to apply text effects to [text]`;

const replyWithIntro = (ctx: any) =>
  ctx.reply(introductionMessage, {
    parse_mode: "HTML",
  });

bot.command("start", replyWithIntro);
bot.on("message", replyWithIntro);

// Start the server
if (process.env.NODE_ENV === "production") {
  fastify.post("/secretPath", webhookCallback(bot, "fastify"));
  const PORT = Number(process.env.PORT ?? 3000);
  fastify.listen({ port: PORT });
  bot.api.setWebhook(process.env.CYCLIC_URL as string).then((res) => {
    console.log(`status`, res);
  });
  // Use Webhooks for the production server
} else {
  // Use Long Polling for development
  bot.start();
}
