    /* 
    
    Publisher class is responsible for listening to the client requests and publishing the messages back.
    It listens to the requestTopic topic and sends the messages to the response topic.
    It also listens to the acknowledged topic to update the message status in the database (To manage the queue).
    It uses the DatabaseService and QueueManager classes to manage topics queues and the database.
    It has a static method listenAcknowledgements to listen to the acknowledgements from the consumers.
    It uses the Mutex class from the async-mutex library to manage the concurrency of the dequeueMessage method.

    */


import * as mqtt from "async-mqtt"
import { QueueManager } from './QueueManager'
import { MessageAck, Message } from '../index';
import { ObjectId } from "mongodb";
import { DatabaseService } from "./DatabaseService";



export class Publisher {

  private static queueManager: QueueManager;
  private static client: mqtt.IMqttClient;
  private static dbService: DatabaseService;

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
