import { Client } from "ts-postgres"
import SECRET from "./SECRET"

let client: Client | null = null;
export async function openDBconnection() {
    client = new Client({
        host: SECRET.DB_HOST,
        password: SECRET.DB_PASSWORD,
        user: SECRET.DB_USER,
        database: SECRET.DB_NAME
    });
    await client.connect()
}

export async function startupAddAllUsers(users: string[]) {
    let query = "INSERT INTO users (discord_id) VALUES ";
    users.forEach((x, i) => {
        let numFields = 1;
        let n = i * numFields;

        let toAdd: string[] = []
        for (let j = 0; j < numFields; j++) {
            toAdd[toAdd.length] = "$" + (j + n + 1);
        }
        query += "(" + toAdd.join(",") + "),"
    })
    query = query.substring(query.length - 1, 0) + "ON CONFLICT DO NOTHING";
    await (await client?.prepare(query))?.execute(users)
}

export async function startupAddAllGuilds(guilds: string[]) {
    let query = "INSERT INTO users (discord_id) VALUES ";
    guilds.forEach((x, i) => {
        let numFields = 2;
        let n = i * numFields;

        let toAdd: string[] = []
        for (let j = 0; j < numFields; j++) {
            toAdd[toAdd.length] = "$" + (j + n + 1);
        }
        query += "(" + toAdd.join(",") + "),"
    })
    query = query.substring(query.length - 1, 0) + "ON CONFLICT DO NOTHING";
    await (await client?.prepare(query))?.execute(guilds)
}

export async function setPrefixForGuild(guildId: string, prefix: string) {
    (await client?.prepare("UPDATE prefixes SET prefix = $2 WHERE guild_id = $1"))?.execute([guildId, prefix])
}

export async function getGuildPrefix(guildId: string): Promise<string> {
    let result = await (await client?.prepare("SELECT prefix FROM prefixes WHERE guild_id = $1"))?.execute([guildId]);
    return result?.rows[0][0] + ""
}

export async function getUserFromNickname(nickname: string): Promise<string | null> {
    let result = await (await client?.prepare("SELECT discord_id FROM users WHERE nick_name = $1"))?.execute([nickname])
    return result?.rows[0][0] as string | null
}