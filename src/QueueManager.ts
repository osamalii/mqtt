import { DatabaseService } from './DatabaseService';
import { Message } from '../index';
import { ObjectId } from 'mongodb';

export class QueueManager {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  async enqueueMessage(topic: string, messageContent: string) {
    await this.dbService.insertMessage({ timestamp:Date.now(), topic:topic, content: messageContent, acknowledged:false } as Message);
  }

  async dequeueMessage(topic: string): Promise<Message | undefined> {
    return await this.dbService.getOldestMessageByTopic(topic)  
  }


  async requeueMessage(message: Message) {
    const oldestMessage = await this.dbService.getOldestMessageByTopic(message.topic);
    await this.dbService.updateMessage(message.id, {timestamp: oldestMessage.timestamp - 1000 })
  }
}