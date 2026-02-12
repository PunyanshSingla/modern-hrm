
import { connectToDatabase } from "./lib/db";

async function test() {
    try {
        console.log("Connecting...");
        const mongooseInstance = await connectToDatabase();
        console.log("Connected.");
        
        if (mongooseInstance.connection) {
            console.log("Has .connection property");
            if (typeof mongooseInstance.connection.getClient === 'function') {
                console.log("Has .connection.getClient() method");
                const client = mongooseInstance.connection.getClient();
                console.log("Client retrieved:", client.constructor.name);
            } else {
                console.log("No .connection.getClient() method");
            }
            
            if (mongooseInstance.connection.db) {
                 console.log("Has .connection.db property");
                 // Check if it has collection method
                 if (typeof mongooseInstance.connection.db.collection === 'function') {
                     console.log("Has .connection.db.collection() method");
                 }
            }
        } else {
            console.log("No .connection property");
        }
        
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

test();
