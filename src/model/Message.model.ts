import mongoose, { Schema } from "mongoose";
import { Message } from "./User.model";



export const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    }
})

const MessageModel = mongoose.models.User as mongoose.Model<Message> || mongoose.model<Message>("User", MessageSchema);

export default MessageModel;