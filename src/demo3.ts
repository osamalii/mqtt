import * as mqtt from "async-mqtt";
import { MessageAck, PublishMessage,d } from '../index';

const demo = async (client: mqtt.IMqttClient) => {
  console.log('demo started...');


  const consumer1 = async () => {
    await client.subscribe('response');

    
    client.on('message', async (topic, message: string) => {
      const data: d= JSON.parse(message)
      if (topic === 'response' && data.consumerId == "1") {
        console.log('consumer 1 received message:', JSON.stringify(data.message));
       
          const ack: MessageAck = {messageId: data.message._id.toString(), consumerId: "1"} 
        
          await client.publish('acknowledged', JSON.stringify(ack));
         
      }
    });
    const data = JSON.stringify({consumerId:'1',topic:'unique120-topic1'})
    await client.publish('requestTopic',data);
  };

  const consumer2 = async () => {
    await client.subscribe('response');

    client.on('message', async (topic, message: string) => {
      const data: d= JSON.parse(message)
      if (topic === 'response' && data.consumerId == "2") {
        console.log('consumer 2 received message:', JSON.stringify(data.message));
       
          const ack: MessageAck = {messageId: data.message._id.toString(), consumerId: "2"} 
        
          await client.publish('acknowledged', JSON.stringify(ack));
         
      }
    });
    const data = JSON.stringify({consumerId:'2',topic:'unique120-topic1'})
    await client.publish('requestTopic',data);
  };

  const publisher = async () => {
    let topic = 'unique120-topic1';
    let message: PublishMessage = { content: 'Hello for topic 1', topic: topic };

    await client.publish('PublishMessage', JSON.stringify(message));
    console.log('publisher sent');

    topic = 'unique120-topic1';
     message = { content: 'Hello for topic 1 secoond', topic: topic };

    await client.publish('PublishMessage', JSON.stringify(message));
    console.log('publisher sent');
  };

  await publisher();
  setTimeout(async() => {
    
  await consumer1();

  await consumer2();
  }, 5000);
  

};

export default demo;

