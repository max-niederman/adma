import "dotenv/config";
import { Client, ActivityType, IntentsBitField } from "discord.js";
import { Sender } from "@questdb/nodejs-client";

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildPresences
    ],
    presence: {
        status: "online",
        activities: [
            {
                type: ActivityType.Watching,
                name: "you",
            }
        ],
    },
});

const sender = new Sender();

client.once("ready", (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    console.log(`Invite link: https://discord.com/api/oauth2/authorize?client_id=${c.user.id}&permissions=0&scope=bot`);
});

const TRACKED_ACTIVITIES = {
    "playing": ActivityType.Playing,
    "streaming": ActivityType.Streaming,
    "listening": ActivityType.Listening,
    "watching": ActivityType.Watching,
    "custom": ActivityType.Custom,
    "competing": ActivityType.Competing,
};

client.on("presenceUpdate", async (_old, pres) => {
    const fields = [];

    fields.push({ name: "tag", type: "symbol", value: pres.user.tag });
    fields.push({ name: "status", type: "symbol", value: pres.status });

    for (const [name, type] of Object.entries(TRACKED_ACTIVITIES)) {
        const activity = pres.activities.find((a) => a.type === type);
        fields.push({ name: `activity_${name}_present`, type: "boolean", value: activity !== undefined });
        fields.push({ name: `activity_${name}_name`, type: "symbol", value: activity?.name ?? null });
        fields.push({ name: `activity_${name}_state`, type: "string", value: activity?.state ?? null });
        fields.push({ name: `activity_${name}_details`, type: "string", value: activity?.details ?? null });
    }

    sender.table("presence");
    fields.sort((a, b) => {
        const priority = {
            "symbol": 0,
            "string": 1,
            "boolean": 1,
        };
        return priority[a.type] - priority[b.type];
    })

    for (const { name, type, value } of fields) {
        if (value) {
            switch (type) {
                case "symbol":
                    sender.symbol(name, value);
                    break;
                case "string":
                    sender.stringColumn(name, value);
                    break;
                case "boolean":
                    sender.booleanColumn(name, value);
                    break;
            }
        }
    }

    sender.atNow();
    await sender.flush();
});

await sender.connect({
    host: process.env.QUESTDB_HOST,
    port: process.env.QUESTDB_PORT,
});

client.login(process.env.DISCORD_TOKEN);