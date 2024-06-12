import * as mqtt from "async-mqtt"
import { DatabaseService } from './DatabaseService';
import { QueueManager } from './QueueManager'
import { MessageAck, Message } from '../index';

export class Publisher {
  
  constructor(
      private dbService: DatabaseService,
      private queueManager: QueueManager,
      private client: mqtt.IMqttClient
    ) {

      this.listenAcknowledgements();
  }

  // Listen for client requests about topics and answer them with the messages available about the topic.
  async manageClientRequest (){
    
    this.client.on('connect', () => {
      this.client.subscribe('request');
    });

    this.client.on('message', async (topic, message) => {
      if (topic === 'requestTopic') {
       this.publish(message.toString());
      }
    });

  }

  async publish(topic: string) {
    // dequeue message
    const messageQueue: Message = await this.queueManager.dequeueMessage(topic);
    // send message
    this.client.publish(topic, JSON.stringify(messageQueue));
      
    const timer = setTimeout(function () {
      // acknowledge message or requeue
      const msedb: Message = (this.DatabaseService.getMessageById(messageQueue.id))[0]
      if( !msedb.acknowledged ){
          this.queueManager.requeueMessage(msedb);
        }
        
      }, 1000);
    
  }

  // 
  listenAcknowledgements() {
    
    this.client.on('message', async (topic, message) => {
      
      if (topic === "acknowledged") {
        const MessageJson: MessageAck = JSON.parse(message.toString());
        await this.dbService.updateMessage(MessageJson.messageId, { acknowledged: true });
      }
      
    });

  }


}
