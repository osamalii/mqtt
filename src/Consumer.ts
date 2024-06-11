import * as mqtt from 'mqtt';
import {QueueManager} from './QueueManager';

export class Consumer {
  private client: mqtt.MqttClient;
  private topic: string;
  private queueManager: QueueManager;

  constructor(brokerUrl: string, topic: string, queueManager: QueueManager) {
    this.client = mqtt.connect(brokerUrl);
    this.topic = topic;
    this.queueManager = queueManager;

    this.client.on('connect', () => {
      this.client.subscribe(this.topic);
    });

    this.client.on('message', async (topic, message) => {
      if (topic === this.topic) {
        const msg = message.toString();
        // await this.queueManager.enqueueMessage(topic, { content: msg, acknowledged: false });
        // this.processMessage({ content: msg });
      }
    });
  }

}






//   private async processMessage(message: any) {
//     try {
//       // Simulate message processing
//       console.log(`Processing message: ${message.content}`);
//       // Simulate acknowledgment
//       setTimeout(async () => {
//         message.acknowledged = true;
//         console.log(`Acknowledged message: ${message.content}`);
//         await this.queueManager.dequeueMessage(this.topic);
//       }, 1000);
//     } catch (error) {
//       console.error(`Failed to process message: ${message.content}`);
//       await this.queueManager.requeueMessage(this.topic, message);
//     }
//   }