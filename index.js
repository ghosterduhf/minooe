const mineflayer = require("mineflayer");
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const app = express();
const port = 3000;
const keepAlive = require("./keep_alive.js");
keepAlive();

// ======================
// 🔥 REBEL CONFIGURATION
// ======================
const SERVER_IP = "mt3oba2025.aternos.me:41307";
const BOT_USERNAME = "MT3OBA_SERVER";
const MC_VERSION = "1.21.4";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const ALERT_CHANNEL_ID = "1345769818606800988";

// Anti-detection settings
const ANTI_AFK_INTERVAL = 45000;
const RECONNECT_DELAY = 10000;

// =================
// 💀 WAR MACHINE
// =================
let isConnected = false;
let mcBot = null;
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ======================
// 🚨 ALERT PROTOCOLS
// ======================
function sendDiscordAlert(message) {
  const channel = discordClient.channels.cache.get(ALERT_CHANNEL_ID);
  if (channel) {
    channel
      .send(`\`[${new Date().toLocaleTimeString()}]\` ${message}`)
      .catch((err) => console.log("Discord ratelimit:", err));
  }
}

// ====================
// 🤖 BOT CORE
// ====================
function createBot() {
  mcBot = mineflayer.createBot({
    host: SERVER_IP.split(":")[0],
    port: parseInt(SERVER_IP.split(":")[1]),
    username: BOT_USERNAME,
    version: MC_VERSION,
    auth: "offline",
  });

  mcBot.on("login", () => {
    isConnected = true;
    console.log(
      `☠️ Infiltration successful at ${new Date().toLocaleTimeString()}`,
    );
    sendDiscordAlert(
      "🟢 **CONNECTION ESTABLISHED** Bot has infiltrated the server",
    );
  });

  mcBot.on("spawn", () => {
    console.log("🔒 Server lockdown initiated");
    sendDiscordAlert("🔐 **SERVER LOCKED** Anti-AFK protocols engaged");

    mcBot.on("playerJoined", (player) => {
      if (player.username !== BOT_USERNAME) {
        // Ignore bot's own join
        sendDiscordAlert(`🚪 PLAYER JOINED: ${player.username}`);
      }
    });

    mcBot.on("playerLeft", (player) => {
      sendDiscordAlert(`🚪 PLAYER LEFT: ${player.username}`);
    });

    const afkActions = () => {
      mcBot.setControlState("jump", true);
      mcBot.look(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI - Math.PI / 2,
      );
      setTimeout(() => {
        mcBot.setControlState("jump", false);
        mcBot.look(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI - Math.PI / 2,
        );
      }, 500);
    };
    setInterval(afkActions, ANTI_AFK_INTERVAL);
  });

  mcBot.on("kicked", (reason) => {
    console.log(`🚫 KICKED: ${reason}`);
    sendDiscordAlert(
      `🚨 **KICKED**: \`${reason}\`\nReconnecting in 10 seconds...`,
    );
    isConnected = false;
    setTimeout(createBot, RECONNECT_DELAY);
  });

  mcBot.on("error", (err) => {
    console.log(`💥 ERROR: ${err.message}`);
    sendDiscordAlert(
      `💀 **CRITICAL ERROR**: \`${err.message}\`\nInitiating reboot...`,
    );
    isConnected = false;
    setTimeout(createBot, RECONNECT_DELAY);
  });

  mcBot.on("end", () => {
    if (isConnected) {
      console.log("⚠️ Connection severed");
      sendDiscordAlert("⚠️ **CONNECTION LOST** Launching countermeasures...");
      isConnected = false;
      setTimeout(createBot, RECONNECT_DELAY);
    }
  });
}

// ======================
// 🤖 DISCORD COMMANDS
// ======================
discordClient.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case "status":
      message.reply(
        isConnected ? "🟢 **SERVER HOSTAGE ACTIVE**" : "🔴 **SERVER OFFLINE**",
      );
      break;

    case "players":
      if (!mcBot || !isConnected) {
        message.reply("❌ Bot not connected to server");
        return;
      }
      const players = Object.keys(mcBot.players).join(", ") || "No prisoners";
      message.reply(`👥 **CURRENT PLAYERS**: \n${players}`);
      break;

    case "restart":
      message.reply("☢️ **NUCLEAR RESTART INITIATED**");
      if (mcBot) mcBot.end();
      setTimeout(createBot, 5000);
      break;

    case "sleep":
      if (mcBot && isConnected) {
        message.reply("😴 **BOT SLEEPING** - Back in 10 seconds");
        isConnected = false;
        mcBot.end();
        setTimeout(() => {
          createBot();
          sendDiscordAlert("☀️ **BOT RECONNECTED** Resuming control");
        }, 10000);
      } else {
        message.reply("❌ Bot already offline or rebooting");
      }
      break;
  }
});

discordClient.on("ready", () => {
  console.log(`💬 Discord bot deployed as ${discordClient.user.tag}`);
  sendDiscordAlert("🚀 **SYSTEM ONLINE** MT3OBA hostage protocol activated");
});

discordClient.login(DISCORD_TOKEN);

// Web server is already handled by keep_alive.js
// No need to create a duplicate server

// ================
// 🚀 LAUNCH
// ================
console.log("🔥 Igniting persistent bot warfare");
createBot();

// ====================
// ☢️ ERROR HANDLING
// ====================
process.on("unhandledRejection", (error) => {
  sendDiscordAlert(`💣 **CATASTROPHIC FAILURE**: \`${error.message}\``);
  console.error("Unhandled rejection:", error);
});
