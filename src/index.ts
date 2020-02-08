import * as Discord from "discord.js"
import SECRET from "./SECRET"
import { openDBconnection, startupAddAllGuilds, startupAddAllUsers } from "./db";

let client = new Discord.Client();

const dbConnPromise = openDBconnection();

client.on("message", async message => {

})

client.on("ready", async () => {
    await Promise.all(client.guilds.map(x => x.fetchMembers(undefined, Number.MAX_SAFE_INTEGER)))
    await dbConnPromise;
    await client.user.setActivity("Gender non-conformity", {
        type: "STREAMING"
    })
    await startupAddAllGuilds(client.guilds.map(x => x.id))

})

client.on("guildCreate", async guild => {

})

client.on("guildMembersChunk", async chunk => {
    await startupAddAllUsers(chunk.map(x => x.id))
})

client.login(SECRET.DISCORD_TOKEN)