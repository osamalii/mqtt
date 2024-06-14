/*
  This file contains the DatabaseService class, which is responsible for connecting to the MongoDB database and performing CRUD operations on the messages collection.
  It uses the MongoDB Node.js driver to interact with the database.
  The connectAndInitialize method establishes a connection to the database and initializes the messages collection.
  The insertMessage method inserts a new message into the collection.
  The updateMessage method updates an existing message in the collection.
  The getOldestMessageByTopic method retrieves the oldest unacknowledged message for a given topic.
  The getMessageById method retrieves a message by its ObjectId.
  
*/


import { MongoClient, Db, Collection, ObjectId, ServerApiVersion } from 'mongodb';
import { Message } from '../index';

export class DatabaseService {
  private static client: MongoClient;
  private static db: Db;
  private static messagesCollection: Collection;

  constructor() {}

  public static async connectAndInitialize(uri: string, dbName: string): Promise<DatabaseService> {
    try {

      DatabaseService.client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });

      await DatabaseService.client.connect();
      DatabaseService.db = DatabaseService.client.db(dbName);
      DatabaseService.messagesCollection = DatabaseService.db.collection('messages');
      
      await DatabaseService.messagesCollection.deleteMany({});

    } catch (error) {
      console.error(`Error in connectAndInitialize: ${error}`);
      throw error;
    }

    return new DatabaseService();
  }

  async insertMessage(message: Partial<Message>): Promise<ObjectId | any> {
    const result = await DatabaseService.messagesCollection.insertOne(message);
    return result.insertedId;
  }

  async updateMessage(id: ObjectId, message: Partial<Message>) {

    await DatabaseService.messagesCollection.updateOne(
      { _id: id },
      { $set: message }
    );
  }

  async getOldestMessageByTopic(topic: string, options: Partial<Message> = {}): Promise<Message | any> {
    return await DatabaseService.messagesCollection.findOne(
      { topic, acknowledged: false, ...options },
      { sort: { timestamp: 1 } }
    );
  }

  async getMessageById(id: string | ObjectId): Promise<Message | any> {
    return await DatabaseService.messagesCollection.findOne({ _id: typeof id === 'string' ? new ObjectId(id) : id });
  }
}
