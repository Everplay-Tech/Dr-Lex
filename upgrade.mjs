import Database from "better-sqlite3";

const db = new Database("data/drlex.db");
db.prepare("UPDATE users SET plan = ? WHERE email = ?").run("starter", "test@example.com");
console.log("Upgraded to starter plan!");
db.close();
