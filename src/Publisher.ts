import * as mqtt from "async-mqtt"
import { DatabaseService } from './DatabaseService';
import { QueueManager } from './QueueManager'
import { MessageAck, Message } from '../index';
import { ObjectId } from "mongodb";



export class Publisher {

  private static dbService: DatabaseService;
  private static queueManager: QueueManager;
  private static client: mqtt.IMqttClient;

  constructor() {}

  // Listen for client requests about topics and answer them with the messages available about the topic.
  public static async manageClientRequest(dbService: DatabaseService, queueManager: QueueManager, client: mqtt.IMqttClient): Promise<Publisher>{
    console.log('Publisher started...');

    Publisher.dbService = dbService;
    Publisher.queueManager = queueManager;
    Publisher.client = client;

    await Publisher.listenAcknowledgements();
    
    await Publisher.client.subscribe('requestTopic');
    await Publisher.client.subscribe('acknowledged');

    await Publisher.client.on('message', async (topic, message) => {
      if (topic === 'requestTopic') {
        console.log('publish ',message.toString())
        
        await Publisher.publish(message.toString());
      }
    });

    console.log('Publisher done...');
    
    return new Publisher();
  }

  static async publish(message: string) {
    // dequeue message
    
    const topic =(JSON.parse(message)).topic
    const id =(JSON.parse(message)).consumerId

    const messageQueue: Message | null = await Publisher.queueManager.dequeueMessage(topic);
    if (!messageQueue) {
      console.log("no message available for the topic", topic);
      return;
    }

    console.log("messageQueue", messageQueue);
    const data ={consumerId:id,message:messageQueue};
    // send message
    Publisher.client.publish("response", JSON.stringify(data));
      
    setTimeout(async () => {
      // acknowledge message or requeue
      const msedb: Message =  (await Publisher.dbService.getMessageById(messageQueue._id))
      console.log("msedb", msedb);
      if( !msedb.acknowledged ){
        await Publisher.queueManager.requeueMessage(msedb);
      }
        
      }, 2000);
    
  }

  // 
  static async listenAcknowledgements() {
    
    await Publisher.client.on('message', async (topic, message) => {
      
      if (topic === "acknowledged") {
        const MessageJson: MessageAck = JSON.parse(message.toString());
        console.log("ack revieved for the message", MessageJson.messageId, 'from consumer', MessageJson.consumerId);
        await Publisher.dbService.updateMessage(new ObjectId(MessageJson.messageId), { acknowledged: true });

      }
      
    });

  }


}
