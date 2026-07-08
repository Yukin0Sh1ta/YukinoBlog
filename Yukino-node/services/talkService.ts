import pool from "../db/index.js";

export interface TalkMessage {
  id: number;
  username: string;
  text: string;
  time: number;
}

export async function getTalks(): Promise<TalkMessage[]> {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, text, time FROM talks ORDER BY time DESC",
    );
    return rows as TalkMessage[];
  } catch (e) {
    console.error("getTalks DB error:", e);
    return [];
  }
}

export async function addTalk(msg: TalkMessage): Promise<TalkMessage | undefined> {
  try {
    await pool.query(
      "INSERT INTO talks (id, username, text, time) VALUES (?, ?, ?, ?)",
      [msg.id, msg.username, msg.text, msg.time],
    );
    return msg;
  } catch (e) {
    console.error("addTalk DB error:", e);
    return undefined;
  }
}
