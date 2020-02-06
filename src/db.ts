import { Client } from "ts-postgres"
import SECRET from "./SECRET"
import { getType } from "./utilities";

interface User {
    discordId: string
    nickname: string | null
}

interface Points {
    giver: string
    receiver: string
    amount: number
}

let client: Client;
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
    await (await client.prepare(query)).execute(users)
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
    await (await client.prepare(query)).execute(guilds)
}

export async function setPrefixForGuild(guildId: string, prefix: string) {
    (await client.prepare("UPDATE prefixes SET prefix = $2 WHERE guild_id = $1")).execute([guildId, prefix])
}

export async function getGuildPrefix(guildId: string): Promise<string> {
    let result = await (await client.prepare("SELECT prefix FROM prefixes WHERE guild_id = $1")).execute([guildId]);
    return result.rows[0][0] + ""
}

export async function getUserFromNickname(nickname: string): Promise<string | null> {
    let result = await (await client.prepare("SELECT discord_id FROM users WHERE nick_name = $1")).execute([nickname])
    return result.rows[0][0] as string | null
}

export async function setUsersNickname(userOrDiscordId: User | string, nickname?: string | null) {
    let user: User;
    if (getType(userOrDiscordId) === "object") {
        user = userOrDiscordId as User
    }
    else {
        user = {
            discordId: userOrDiscordId as string,
            nickname: nickname as string | null
        }
    }
    await (await client.prepare("UPDATE users SET nick_name = $2 WHERE discord_id = $1")).execute([user.discordId, user.nickname])
}

export async function getUser(discordId: string): Promise<User | null> {
    let result = (await (await client.prepare("SELECT nick_name FROM users WHERE discord_id = $1")).execute([discordId]))
    if (result.rows.length > 0 && result.rows[0].length > 0) {
        return {
            discordId: discordId,
            nickname: result.rows[0][0] as string | null
        }
    }
    return null
}

export async function getUsersNicknameOr(discordId: string, alternative: string | null): Promise<string | null> {
    let user = await getUser(discordId)
    if (user === null) {
        return alternative
    }
    return user.nickname
}

export async function giveUserPoints(giver: string, receiver: string, amount: number) {
    let id = giver + "_" + receiver;
    let result = await (await client.prepare("INSERT INTO points (id, receiver_id, giver_id, amount) VALUES ($4, $3, $2, $1) ON CONFLICT (id) DO UPDATE SET amount = (points.amount + $1) WHERE points.id = $4 RETURNING points.amount")).execute([amount, receiver, giver, id])
    if (result.rows.length > 0 && result.rows[0].length > 0) {
        if (result.rows[0][0] === 0) {
            await (await client.prepare("DELETE FROM points WHERE id = $1")).execute([id])
        }
    }
}

export async function getUsersPointsReceived(discordId: string) {
    let result = await (await client.prepare("SELECT points.giver_id, users.nick_name, points.amount FROM points INNER JOIN users ON users.discord_id = points.giver_id WHERE points.receiver_id = $1 ORDER BY points.amount DESC")).execute([discordId])
    let points: Points[] = []
    let nicknames: (string | null)[] = []
    result.rows.forEach(x => {
        let giverId = x[0] as string
        let nickname = x[1] as string | null
        let amount = x[2] as number
        points[points.length] = {
            giver: giverId,
            receiver: discordId,
            amount: amount
        }
        nicknames[nicknames.length] = nickname
    })
    return {
        nicknames,
        points
    }
}

export async function getUsersPointsReceivedFromOtherUser(receiverId: string, giverId: string): Promise<number | null> {
    let result = await (await client.prepare("SELECT points.amount FROM points WHERE points.id = $1")).execute([receiverId + "_" + giverId])
    if (result.rows.length > 0 && result.rows[0].length > 0) {
        return result.rows[0][0] as number
    }
    return null
}

export async function getUsersPointsGiven(discordId: string) {
    let result = await (await client.prepare("SELECT points.receiver_id, users.nick_name, points.amount FROM points INNER JOIN users ON users.discord_id = points.receiver_id WHERE points.giver_id = $1 ORDER BY points.amount DESC")).execute([discordId])
    let points: Points[] = []
    let nicknames: (string | null)[] = []
    result.rows.forEach(x => {
        let receiverId = x[0] as string
        let nickname = x[1] as string | null
        let amount = x[2] as number
        nicknames[nicknames.length] = nickname
        points[points.length] = {
            receiver: receiverId,
            giver: discordId,
            amount: amount
        }
    })
    return {
        nicknames,
        points
    }
}