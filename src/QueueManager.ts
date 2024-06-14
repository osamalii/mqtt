import { DatabaseService } from './DatabaseService';
import { Message } from '../index';
import { ObjectId } from "mongodb";
const { Mutex } = require('async-mutex');
const mutex = new Mutex();

export class QueueManager {
  private dbService: DatabaseService;
  public static lock: boolean=false;
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

  async dequeueMessage(topic: string): Promise<Message | undefined | any> {
     return await mutex.runExclusive(async () => {
     
       const message = await this.dbService.getOldestMessageByTopic(topic, { sent: false });
      if (message) {
        await this.dbService.updateMessage(message._id, { sent: true });
      }
     
      return message;
     })
     
  }

  async requeueMessage(message: Message) {
    const oldestMessage = await this.dbService.getOldestMessageByTopic(message.topic);
    console.log('Oldest message:', oldestMessage);
    if (oldestMessage) {
      console.log('Requeueing message:', message);
      return await this.dbService.updateMessage(new ObjectId(message._id), {
        timestamp: oldestMessage.timestamp - 1000,
        sent: false
      });
    }
  }
}
