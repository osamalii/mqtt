import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Message } from '../index';

export class DatabaseService {
  private client: MongoClient;
  private db: Db;
  private messagesCollection: Collection;
  private clientsCollection: Collection;

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri);
    this.db = this.client.db(dbName);
    this.messagesCollection = this.db.collection('messages');
    this.clientsCollection = this.db.collection('clients');
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
    return await this.messagesCollection.find({ topic, acknowledged: false }).toArray();
  }

  async deleteMessage(id: string) {
    await this.messagesCollection.deleteOne({ _id: new ObjectId(id) });
  }

  async getOldestMessageByTopic(topic: string): Promise<any> { // Change any to Message
    return await this.messagesCollection.findOne({ topic, acknowledged: false }, { sort: { timestamp: 1 } });
  }

  async createClient(clientId: string, topic: string): Promise<ObjectId> {
    const result = await this.clientsCollection.insertOne({ clientId, topics: [topic] });
    return result.insertedId;
  }

  async removeClient(clientId: string): Promise<boolean> {
    const result = await this.clientsCollection.deleteOne({ clientId });
    return result.deletedCount === 1;
  }

  async getClientsForTopic(topic: string): Promise<string[]> {
    const clients = await this.clientsCollection.find({ topics: topic }).toArray();
    return clients.map(client => client.clientId);
  }

  async subscribeToTopic(clientId: string, topic: string) {
    await this.clientsCollection.updateOne(
      { clientId },
      { $addToSet: { topics: topic } }
    );
  }
}
