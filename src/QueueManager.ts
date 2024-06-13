import { DatabaseService } from './DatabaseService';
import { Message } from '../index';
import { ObjectId } from "mongodb";

export class QueueManager {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  async enqueueMessage(topic: string, messageContent: string) {
    const message = {
      timestamp: Date.now(),
      topic: topic,
      content: messageContent,
      acknowledged: false,
      sent: false
    } as Message;

    const result = await this.dbService.insertMessage(message);
    console.log('Message inserted:', result);
  }

  async dequeueMessage(topic: string): Promise<Message | undefined> {
    const message = await this.dbService.getOldestMessageByTopic(topic);
    if (message) {
      await this.dbService.updateMessage(message._id, { sent: true });
    }
    return message;
  }

  async requeueMessage(message: Message) {
    const oldestMessage = await this.dbService.getOldestMessageByTopic(message.topic);
    if (oldestMessage) {
      await this.dbService.updateMessage(new ObjectId(message._id), {
        timestamp: oldestMessage.timestamp - 1000,
        sent: false
      });
    }
  }
}
