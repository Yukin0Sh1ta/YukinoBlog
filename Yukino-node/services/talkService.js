import fs from "fs/promises";
import path from "path";
import pool from "../db/index.js";

// const DATA_FILE = path.resolve(process.cwd(), "models", "talk.json");

// async function readDataFile() {
//   try {
//     const raw = await fs.readFile(DATA_FILE, "utf-8");
//     return JSON.parse(raw || "[]");
//   } catch {
//     return [];
//   }
// }

async function writeDataFile(arr) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (e) {
    console.error("writeDataFile error:", e);
  }
}

export async function getTalks() {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, text, time FROM talks ORDER BY time DESC",
    );
    return rows;
  } catch (e) {
    // fallback to file storage
    // return (await readDataFile()).sort((a, b) => (b.time || 0) - (a.time || 0));

    console.error("getTalks DB error:", e);
  }
}

export async function addTalk(msg) {
  try {
    await pool.query(
      "INSERT INTO talks (id, username, text, time) VALUES (?, ?, ?, ?)",
      [msg.id, msg.username, msg.text, msg.time],
    );
    return msg;
  } catch (e) {
    // fallback to file
    // const arr = await readDataFile();
    // arr.unshift(msg);
    // await writeDataFile(arr);
    // return msg;
    console.error("addTalk DB error:", e);
  }
}

// optional helper to migrate existing file data into DB (not called automatically)
// export async function migrateFileToDb() {
//   const arr = await readDataFile();
//   if (!arr.length) return { migrated: 0 };
//   let migrated = 0;
//   try {
//     for (const m of arr.reverse()) {
//       try {
//         await pool.query(
//           "INSERT INTO talks (id, username, text, time) VALUES (?, ?, ?, ?)",
//           [m.id, m.username, m.text, m.time],
//         );
//         migrated++;
//       } catch (err) {
//         // ignore individual insert errors (duplicates etc.)
//       }
//     }
//   } catch (e) {
//     console.error("migrateFileToDb error", e);
//   }
//   return { migrated };
// }
