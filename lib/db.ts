import mongoose, { Mongoose } from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please provide MONGODB_URI in the environment variables');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially during API calls.
 */
// Extend the global type to include a mongoose property
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
  // If we already have a connection and it's ready, return it
  if (cached.conn) {
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    // Connection exists but not ready, clear it
    cached.conn = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('🔌 Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongooseInstance: Mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((error: Error) => {
        console.error('❌ MongoDB connection error:', error.message);
        cached.promise = null; // Clear the promise on error
        throw error;
      });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}
