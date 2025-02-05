import mongoose from 'mongoose';

const connectDB = async () => {
    if (!process***REMOVED***.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
    }

    try {
        const conn = await mongoose.connect(process***REMOVED***.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn; // Return connection object
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        throw error;
    }
};

export default connectDB;