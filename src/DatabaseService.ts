import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Message } from '../index';

export class DatabaseService {
  private client: MongoClient;
  private db: Db;
  private messagesCollection: Collection;

  constructor(uri: string, dbName: string) {
    (async () => {
      try {
        this.client = new MongoClient(uri);
        await this.connect();
        this.db = this.client.db(dbName);
        this.messagesCollection = this.db.collection('messages');
      } catch (error) {
        console.error(`Error in: DatabaseService ${error}`);
      }
    })()

  }

  async connect() {
    await this.client.connect();
  }

  async insertMessage(message: Message) {
    await this.messagesCollection.insertOne(message);
  }

  async updateMessage(id: string, message: Partial<Message>) {
    await this.messagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: message }
    );
  }


  async getMessages(topic: string) {
    return await this.messagesCollection.find({ topic, acknowledged: false, sent: false }).toArray();
  }
  async getMessageById(id: string) {
    return await this.messagesCollection.find({ _id: new ObjectId(id) }).toArray();
  }

  async deleteMessage(id: string) {
    await this.messagesCollection.deleteOne({ _id: new ObjectId(id) });
  }

  async getOldestMessageByTopic(topic: string): Promise<any> { // Change any to Message
    return await this.messagesCollection.findOne({ topic, acknowledged: false, sent: false }, { sort: { timestamp: 1 } });
  }

}
