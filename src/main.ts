console.log('main.ts stars here...');


import { Consumer } from './Consumer';
import { QueueManager } from './QueueManager';
import { DatabaseService } from './DatabaseService';
import { Publisher } from './Publisher';
import * as mqtt from "async-mqtt"



const MqttClient = mqtt.connect('mqtt://test.mosquitto.org');


const dbService = new DatabaseService('mongodb+srv://effi:azerty123456789@efficom.c0qetey.mongodb.net/?retryWrites=true&w=majority&appName=EFFICOM', 'iot');
const queueManager = new QueueManager(dbService);
const publisher = new Publisher(dbService, queueManager, MqttClient);
const consumer = new Consumer(queueManager, MqttClient);


consumer.managePublishRequests();

publisher.manageClientRequest();



console.log('main.ts ends here...');