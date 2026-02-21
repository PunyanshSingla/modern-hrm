import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "./db";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import SendResetPasswordEmail from "@/emails/reset-password";

const mongooseInstance = await connectToDatabase();
const client = mongooseInstance.connection.getClient();
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db as any, { client: client as any }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async (user) => {
            const url = process.env.NEXT_PUBLIC_APP_URL + "/reset-password?token=" + user.token?.toString()
            SendResetPasswordEmail(user.user.email, url)
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "employee", // Default role
            },
        },
    },
    appName: "Modern HRM",
    plugins: [
        admin({
            adminRoles: ["admin"]
        }),
        nextCookies(),
    ]
});

import fs from 'fs';
import path from 'path';

const debugLogPath = path.join(process.cwd(), "auth-debug.log");
const logMsg = `[${new Date().toISOString()}] BetterAuth Initialized. Admin API: ${!!auth.api?.admin}\n` + 
               (auth.api?.admin ? `Admin methods: ${JSON.stringify(Object.keys(auth.api.admin))}\n` : "Admin is UNDEFINED\n");
fs.appendFileSync(debugLogPath, logMsg);

console.log("BetterAuth Initialized. Admin API available:", !!auth.api?.admin);

