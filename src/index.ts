import * as Discord from "discord.js"
import SECRET from "./SECRET"
import { openDBconnection } from "./db";

let client = new Discord.Client();

const dbConnPromise = openDBconnection();

client.on("message", async message => {

})

client.on("ready", async () => {
    await dbConnPromise;
})

client.on("guildCreate", async guild => {

})

client.on("guildMembersChunk", async chunk => {

})

client.login(SECRET.DISCORD_TOKEN)