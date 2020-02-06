import * as Discord from "discord.js"
import SECRET from "./SECRET"

let client = new Discord.Client();

client.on("message", message => {

})

client.on("ready", () => {

})

client.on("guildCreate", guild => {

})

client.on("guildMembersChunk", chunk => {

})

client.login(SECRET.DISCORD_TOKEN)