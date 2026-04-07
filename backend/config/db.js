import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/typing_app'

export const connectDb = async () => {
  await mongoose.connect(MONGO_URI)
}
