import mongoose, { Document } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export interface UsersInterface extends Document {
    _id: string;
    password: string;
    userName: string;
}

var UsersSchema = new mongoose.Schema(
  {
    userName: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
  },
  { timestamps: true }
);

const Users = mongoose.connection.useDb(process.env.MONGO_DB_COLLECTION_PROD).model<UsersInterface>('Users', UsersSchema);

export default Users;
