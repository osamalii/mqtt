import { ObjectId } from "mongodb"

export type Message = {
    id: string;
    topic: string;
    timestamp: number;
    content: string;
    acknowledged: boolean ;
}