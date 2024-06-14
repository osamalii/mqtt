import { ObjectId } from "mongodb"

export type Message = {
    _id: ObjectId;
    topic: string;
    timestamp: number;
    content: string;
    acknowledged: boolean;
    sent: boolean;
}
export type d={
    consumerId: string;
    message:Message;};

export type MessageAck = {
    messageId: string | ObjectId;
    consumerId: string;
}


export type PublishMessage = {
    content: string;
    topic: string;
}


export type ManagingTopics = "requestTopic" | "acknowledged" | "PublishMessage" | "request";