import * as mqtt from "async-mqtt";
import { MessageAck, PublishMessage } from '../index';

const demo2 = async (client: mqtt.IMqttClient) => {
  console.log('demo2 started...');


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

  const publisher = async () => {
    let topic = 'unique120-topic2';
    let message: PublishMessage = { content: 'Hello for topic 2', topic: topic };

    await client.publish('PublishMessage', JSON.stringify(message));
    console.log('publisher sent');

    topic = 'unique120-topic1';
    message = { content: 'Hello for topic 1', topic: topic };

    await client.publish('PublishMessage', JSON.stringify(message));
    console.log('publisher sent');
  };

  await publisher();

  await consumer1();

  

};

export default demo2;

