 import mongoose, { Mongoose } from 'mongoose';
import dns from 'dns';

const configuredDnsServers = process.env.MONGODB_DNS_SERVERS;

// Use the OS DNS resolver by default. Hardcoding public DNS can fail on
// networks that block direct DNS traffic and causes querySrv ECONNREFUSED.
if (configuredDnsServers) {
  try {
    dns.setServers(configuredDnsServers.split(',').map((server) => server.trim()).filter(Boolean));
  } catch {
    console.warn('Unable to apply MONGODB_DNS_SERVERS; using system DNS resolver.');
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please provide MONGODB_URI in the environment variables');
}
const mongoUri = MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially during API calls.
 */
declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Function to connect to the MongoDB database using Mongoose.
 * @returns {Promise<Mongoose>} The Mongoose client instance.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Clear stale promise/connection if disconnected.
  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(mongoUri, opts)
      .then((mongooseInstance: Mongoose) => {
        console.log('MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((error: Error) => {
        console.error('MongoDB connection error:', error.message);
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

// Handle connection events.
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown.
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}
