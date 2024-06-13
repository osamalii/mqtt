import * as mqtt from "async-mqtt";
import { QueueManager } from './QueueManager';
import { PublishMessage, ManagingTopics } from '../index';

export class Consumer {
  private static queueManager: QueueManager;
  private static client: mqtt.IMqttClient;

  constructor() {}

  public static async managePublishRequests(queueManager: QueueManager, client: mqtt.IMqttClient): Promise<Consumer> {
    console.log('managePublishRequests Consumer started...');

    Consumer.queueManager = queueManager;
    Consumer.client = client;

    console.log('Server consumer.ts connected');

    await client.subscribe('PublishMessage');

    await client.on('message', async (topic: ManagingTopics, message: string) => {
        try {
          console.log('Consumer.ts received message for topic:', topic);
          if (topic === 'PublishMessage') {
            console.log('Consumer.ts received message:', message.toString());
            const messageJson: PublishMessage = JSON.parse(message.toString());
            await Consumer.queueManager.enqueueMessage(messageJson.topic, messageJson.content);
          }
        } catch (error) {
          console.error(`Error in managePublishRequests: ${error}`);
        }
      });

      console.log('managePublishRequests Consumer done...');

    return new Consumer();
  }
}


// setTimeout(async() => {

      //   await Consumer.client.on('message', async (topic: ManagingTopics, message) => {
      //     console.log('Consumer.ts received message for topic: ', topic);
          
      //   });
        
      // }, 2000);