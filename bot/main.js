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

client.on("presenceUpdate", async (_old, pres) => {
    sender
        .table("presence")
        .symbol("tag", pres.user.tag)
        .symbol("status", pres.status);

    if (pres.activities.length > 0) {
        // TODO: handle multiple activities
        const activity = pres.activities[0];
        sender
            .symbol("activity_type", ActivityType[activity.type])
            .symbol("activity_name", activity.name)
            .stringColumn("activity_state", activity.state ?? "")
            .stringColumn("activity_details", activity.details ?? "")
            .booleanColumn("activity_present", true);
    } else {
        sender
            .booleanColumn("activity_present", false);
    }

    sender.atNow();
    await sender.flush();
});

await sender.connect({
    host: process.env.QUESTDB_HOST,
    port: process.env.QUESTDB_PORT,
});

client.login(process.env.DISCORD_TOKEN);