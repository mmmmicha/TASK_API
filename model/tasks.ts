import mongoose, { Document } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export interface TasksInterface extends Document {
    _id: number;
    title: string;
    user_id: string;
    description: string;
    status: "pending" | "InProgress" | "Completed";
    dueDate: string;
}

var TasksSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        user_id: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "InProgress", "Completed"],
            default: "pending",
        },
        dueDate: {
            type: String,
        },
    },
    { timestamps: true }
);

const Tasks = mongoose.connection.useDb(process.env.MONGO_DB_COLLECTION_PROD).model<TasksInterface>('Tasks', TasksSchema);

export default Tasks;
