import { EmbedBuilder } from "discord.js";
import { REST, Routes } from "discord.js";
import { getUserCount, getUpdateCount } from "./stats.js";

export const commands = [
    {
        name: "ping",
        description: "Ping the bot.",
    },
    {
        name: "stats",
        description: "Get some statistics about the bot.",
    },
];

/**
 * @param client {import("discord.js").Client}
 */
export async function registerCommands(client) {
    const rest = new REST({ version: "10" }).setToken(client.token);

    try {
        await rest.put(
            Routes.applicationCommands("1010426779325956096"),
            { body: commands },
        );
        console.log("Registered application commands.");
    } catch (error) {
        console.error("Failed to register application commands.", error);
    }

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        switch (interaction.commandName) {
            case "ping":
                await interaction.reply("Pong!");
                break;
            case "stats":
                const [userCount, updateCount] = await Promise.all([getUserCount(), getUpdateCount()]);

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Statistics")
                            .addFields(
                                { name: "Server Count", value: client.guilds.cache.size.toString() },
                                { name: "User Count", value: userCount.toString() },
                                { name: "Update Count", value: updateCount.toString() },
                            )
                            .setTimestamp()
                            .setFooter({ text: "A bot by Aquild#0001" })
                    ]
                });
                break;
        }
    });
}