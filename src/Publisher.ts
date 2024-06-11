import * as mqtt from 'mqtt';

export class Publisher {
  private client: mqtt.MqttClient;

  constructor(brokerUrl: string) {
    this.client = mqtt.connect(brokerUrl);
  }

  publish(topic: string, message: string) {
    this.client.publish(topic, message);
  }
  
  listen(){
    this.client.
  }


}
