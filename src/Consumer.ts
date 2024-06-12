import * as mqtt from "async-mqtt"
import { QueueManager } from './QueueManager';
import { PublishMessage, ManagingTopics } from '../index';

export class Consumer {

  constructor(private queueManager: QueueManager, private client: mqtt.IMqttClient) { 
    this.managePublishRequests();
  }

  managePublishRequests() {
    this.client.on('message', async (topic: ManagingTopics, message) => {
      try {

        if (topic === "PublishMessage") {
          let messageJson: PublishMessage = JSON.parse(message.toString());
          await this.queueManager.enqueueMessage(messageJson.topic, messageJson.content);
        }

      } catch (error) {

        console.error(`Error in: managePublishRequests ${error}`);

      }
    });
  }
}