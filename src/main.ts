console.log('main.ts stars here...');


import {Consumer} from './Consumer';
import {QueueManager} from './QueueManager';
import {DatabaseService} from './DatabaseService';
import {Message} from '../index';

const dbService = new DatabaseService('mongodb://localhost:27017', 'iot');
const queueManager = new QueueManager(dbService);
//const consumer = new Consumer('mqtt://localhost', 'iot', queueManager);

//consumer.start();





console.log('main.ts ends here...');