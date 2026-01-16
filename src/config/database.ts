import mongoose, { Document, Model, Schema } from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAMES, type DbName } from '../constants/index.js';

dotenv.config();

/**
 * Get database name from environment variable or use default
 * Default database is 'products' to support all product types
 */
const DB_NAME: DbName = (process.env.DB_NAME as DbName) || DB_NAMES.DEFAULT;

/**
 * MongoDB base URI (without database name)
 * Used when constructing connection string from separate variables
 */
const MONGODB_BASE_URI: string | undefined = process.env.MONGODB_BASE_URI; 

const MONGODB_URI = process.env.MONGODB_URI || 
  (MONGODB_BASE_URI 
    ? `${MONGODB_BASE_URI}/${DB_NAME}?retryWrites=true&w=majority`
    : `mongodb://localhost:27017/${DB_NAME}`);

/**
 * Connect to MongoDB database
 */
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);

    // Handle connection events
    mongoose.connection.on('error', (err: Error) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error connecting to MongoDB:', errorMessage);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error disconnecting from MongoDB:', errorMessage);
  }
};

/**
 * Get a database collection model using the default database
 * @template T - Document type extending Document
 * @param collectionName - Name of the collection
 * @param schema - Mongoose schema for the collection
 * @returns Mongoose model instance
 */
export const getDb = <T extends Document>(
  collectionName: string, 
  schema: Schema<T>
): Model<T> => {
  return mongoose.connection.useDb(DB_NAMES.DEFAULT).model<T, Model<T>>(collectionName, schema);
};

export default connectDB;
