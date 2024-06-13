import * as mqtt from "async-mqtt";
import { PublishMessage } from '../index';

const demo = async (client: mqtt.IMqttClient) => {
    console.log('demo started...');
    const consumer1 = async () => {
    await client.subscribe('topic1');

    client.on('message', (topic, message) => {
      if (topic === 'topic1') {
        console.log('consumer 1 received message:', message.toString());
      }
    });

    await client.publish('requestTopic', 'topic1');
  };

  const publisher = async () => {
    const topic = 'topic1';
    const message: PublishMessage = { content: 'Hello for topic 1', topic: topic };

    await client.publish('PublishMessage', JSON.stringify(message));
    console.log('publisher sent');
  };

  await publisher();

  await consumer1();
};

export default demo;

