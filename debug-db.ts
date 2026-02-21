
import { connectToDatabase } from "./lib/db";

async function test() {
    try {
        console.log("Connecting...");
        const mongooseInstance = await connectToDatabase();
        console.log("Connected.");
        
        const db = mongooseInstance.connection.db;
        const users = await db.collection("user").find({}).toArray();
        
        console.log("Users found:", users.length);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}): Role=${u.role}`);
        });
        
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

test();
