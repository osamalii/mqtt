class ClientManager {
    private clients: Map<string, Set<string>>;
  
    constructor() {
      this.clients = new Map();
    }
  
    addClient(clientId: string, topic: string) {
      
    }
  
    removeClient(clientId: string, topic: string) {
      
    }
  
    getClientsForTopic(topic: string) {
      
    }

    subscribeToTopic(clientId: string, topic: string) {
    }
    
  }