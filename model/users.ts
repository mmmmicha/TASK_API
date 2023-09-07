import mongoose, { Document } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export interface UsersInterface extends Document {
    id: string;
    password: string;
    userName: string;
}

var UsersSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
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

const Users = mongoose.connection.useDb(process.env.MONGO_DB_DATABASE).model<UsersInterface>('Users', UsersSchema);

export default Users;
