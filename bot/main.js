import "dotenv/config";
import { Client, ActivityType, IntentsBitField } from "discord.js";

const db = new InfluxDB({
    url: process.env.INFLUX_URL,
    token: process.env.INFLUX_TOKEN,
});
const writeApi = db.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET);

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

client.once("ready", (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on("presenceUpdate", (old, pres) => {
    console.log(pres);
});

client.login(process.env.DISCORD_TOKEN);