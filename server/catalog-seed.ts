import { readFileSync } from "node:fs";
import { db, closeDb } from "./database.js";
const value = JSON.parse(readFileSync("public/catalog.json", "utf8"));
try {
  await db().execute("INSERT INTO catalog (id,kind,title,content) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE kind=VALUES(kind),title=VALUES(title),content=VALUES(content)", ["learning-v2", "learning-catalog", "Go Topic — koreys tili o‘quv katalogi", JSON.stringify(value)]);
  console.log("Learning catalog v2 upserted in MySQL with the current public content.");
} finally { await closeDb(); }
