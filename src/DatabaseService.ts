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

  async getOldestMessageByTopic(topic: string): Promise<Message | any> {
    return await DatabaseService.messagesCollection.findOne(
      { topic, acknowledged: false, sent: false },
      { sort: { timestamp: 1 } }
    );
  }

  async getMessageById(id: string | ObjectId): Promise<Message | any> {
    return await DatabaseService.messagesCollection.findOne({ _id: typeof id === 'string' ? new ObjectId(id) : id });
  }
}
