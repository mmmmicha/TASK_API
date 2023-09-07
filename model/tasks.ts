import mongoose, { Document } from 'mongoose';
import dotenv from 'dotenv';
import { convertDateToString } from '../biz/util';
dotenv.config();

export interface TasksInterface extends Document {
    id: number;
    title: string;
    user_id: string;
    description: string;
    status: "pending" | "InProgress" | "Completed";
    dueDate: Date;
    isSended: boolean;
}

var TasksSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
        },
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
            type: Date,
        },
        isSended: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Tasks = mongoose.connection.useDb(process.env.MONGO_DB_DATABASE).model<TasksInterface>('Tasks', TasksSchema);

TasksSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.dueDate = convertDateToString(ret.dueDate);
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isSended;
    },
});

export default Tasks;
