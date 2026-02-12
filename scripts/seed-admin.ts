
import * as fs from 'fs';
import * as path from 'path';
import { any, betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// 1. Load environment variables
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8');
            envFile.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const valuePart = parts.slice(1).join('=').trim();
                    // Simple comment stripping: remove anything after #
                    const valueWithoutComment = valuePart.split('#')[0].trim();
                    const finalValue = valueWithoutComment.replace(/^["']|["']$/g, '');
                    if (key && finalValue) {
                        process.env[key] = finalValue;
                    }
                }
            });
            console.log('✅ Loaded .env.local');
        } else {
            console.warn('⚠️ .env.local not found, checking process.env');
        }
    } catch (error) {
        console.error("❌ Error loading .env.local", error);
    }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

// 2. Main async function
async function seedAdmin() {
    try {
        const mongoose = (await import('mongoose')).default;

        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI!);
        console.log("✅ MongoDB connected");

        const client = mongoose.connection.getClient();
        const db = client.db();

        // 3. Initialize Auth manually 
        // We replicate the config from lib/auth.ts but without plugins that might depend on Next.js context if possible,
        // or just include them if they are safe. 
        // nextCookies() requires request context so we OMIT it for the script.
        const auth = betterAuth({
            database: mongodbAdapter(db as any, { client: client as any }),
            emailAndPassword: {
                enabled: true
            },
            user: {
                additionalFields: {
                    role: {
                        type: "string",
                        defaultValue: "employee",
                    },
                },
            },
            appName: "Modern HRM",
        });

        // Define User Model for role update
        const UserSchema = new mongoose.Schema({
            name: String,
            email: String,
            role: String,
            emailVerified: Boolean,
        }, { collection: 'user', strict: false });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const email = 'admin@gmail.com';
        const password = 'admin123';
        const name = 'Admin User';

        console.log(`Checking for existing user: ${email}`);
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log(`User ${email} already exists.`);
            if (existingUser.role !== 'admin') {
                console.log('Updating role to admin...');
                existingUser.role = 'admin';
                await existingUser.save();
                console.log('✅ Role updated to admin.');
            } else {
                console.log('✅ User is already an admin.');
            }
            console.log('⚠️ Password was NOT updated if user already existed.');
        } else {
            console.log(`Creating new user: ${email}`);

            try {
                // mock request if needed, but api.signUpEmail usually works
                const res = await auth.api.signUpEmail({
                    body: {
                        email,
                        password,
                        name
                    }
                });

                if (res) {
                    console.log('✅ User created successfully via Auth API.');
                    // Now fetch and update role
                    const newUser = await User.findOne({ email });
                    if (newUser) {
                        newUser.role = 'admin';
                        newUser.emailVerified = true; // Auto-verify admin
                        await newUser.save();
                        console.log('✅ Role set to admin and email verified.');
                    }
                }
            } catch (err: any) {
                console.error("❌ Failed to create user via Auth API:", err.message);
                console.error(err);
            }
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    } finally {
        const mongoose = (await import('mongoose')).default;
        await mongoose.disconnect();
        console.log('👋 Done');
        process.exit(0);
    }
}

seedAdmin();
