console.log('_______main.ts starts here..._______');

import { Consumer } from './Consumer';
import { QueueManager } from './QueueManager';
import { DatabaseService } from './DatabaseService';
import { Publisher } from './Publisher';
import * as mqtt from "async-mqtt"

import demo from "./demo";

(async () => {
    try {
        const MqttClient = mqtt.connect('mqtt://test.mosquitto.org');

        // Ensure MQTT connection
        await new Promise<void>((resolve, reject) => {
            MqttClient.on('connect', () => {
                console.log('Connected to MQTT broker');
                resolve();
            });
            MqttClient.on('error', (err) => {
                console.error('MQTT connection error:', err);
                reject(err);
            });
        });

        const dbService = await DatabaseService.connectAndInitialize(
            'mongodb+srv://effi:azerty123456789@efficom.c0qetey.mongodb.net/?retryWrites=true&w=majority&appName=EFFICOM',
            'mqtt'
        );

        const queueManager = new QueueManager(dbService);

        const publisher = await Publisher.manageClientRequest(dbService, queueManager, MqttClient);
        const consumer = await Consumer.managePublishRequests(queueManager, MqttClient);

        await demo(MqttClient);

        console.log('_______main.ts ends here_______');
    } catch (error) {
        console.error('Error in main.ts:', error);
    }
})();
