// IndexedDB Service for data persistence and offline support

export default class IndexedDBService {
  constructor(dbName = 'StoryAppDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  // Initialize database with object stores
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[IndexedDB] Error opening database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('stories')) {
          const storyStore = db.createObjectStore('stories', { keyPath: 'id' });
          storyStore.createIndex('email', 'email', { unique: false });
          storyStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('[IndexedDB] Created stories object store');
        }

        if (!db.objectStoreNames.contains('pendingStories')) {
          db.createObjectStore('pendingStories', { keyPath: 'id', autoIncrement: true });
          console.log('[IndexedDB] Created pendingStories object store');
        }

        if (!db.objectStoreNames.contains('pushSubscription')) {
          db.createObjectStore('pushSubscription', { keyPath: 'key' });
          console.log('[IndexedDB] Created pushSubscription object store');
        }

        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'url' });
          console.log('[IndexedDB] Created cache object store');
        }
      };
    });
  }

  // Add or update a story
  async addStory(story) {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readwrite');
      const store = transaction.objectStore('stories');
      const request = store.put(story);

      request.onsuccess = () => {
        console.log('[IndexedDB] Story saved:', story.id);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error saving story');
        reject(request.error);
      };
    });
  }

  // Get all stories
  async getAllStories() {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readonly');
      const store = transaction.objectStore('stories');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error fetching stories');
        reject(request.error);
      };
    });
  }

  // Get story by ID
  async getStory(id) {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readonly');
      const store = transaction.objectStore('stories');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error fetching story');
        reject(request.error);
      };
    });
  }

  // Delete a story
  async deleteStory(id) {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readwrite');
      const store = transaction.objectStore('stories');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[IndexedDB] Story deleted:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error deleting story');
        reject(request.error);
      };
    });
  }

  // Clear all stories
  async clearStories() {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stories'], 'readwrite');
      const store = transaction.objectStore('stories');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[IndexedDB] All stories cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error clearing stories');
        reject(request.error);
      };
    });
  }

  // Search stories with filters
  async searchStories(filters = {}) {
    const allStories = await this.getAllStories();

    return allStories.filter((story) => {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesName = story.name?.toLowerCase().includes(query);
        const matchesDescription = story.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) return false;
      }

      if (filters.email && story.email !== filters.email) {
        return false;
      }

      return true;
    });
  }

  // Add pending story (offline)
  async addPendingStory(story) {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingStories'], 'readwrite');
      const store = transaction.objectStore('pendingStories');
      const request = store.add(story);

      request.onsuccess = () => {
        console.log('[IndexedDB] Pending story saved:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error saving pending story');
        reject(request.error);
      };
    });
  }

  // Get all pending stories
  async getPendingStories() {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingStories'], 'readonly');
      const store = transaction.objectStore('pendingStories');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error fetching pending stories');
        reject(request.error);
      };
    });
  }

  // Delete pending story
  async deletePendingStory(id) {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingStories'], 'readwrite');
      const store = transaction.objectStore('pendingStories');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[IndexedDB] Pending story deleted:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error deleting pending story');
        reject(request.error);
      };
    });
  }

  // Save push subscription
  async savePushSubscription(subscription) {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pushSubscription'], 'readwrite');
      const store = transaction.objectStore('pushSubscription');
      const request = store.put({
        key: 'subscription',
        data: subscription,
        timestamp: new Date().getTime(),
      });

      request.onsuccess = () => {
        console.log('[IndexedDB] Push subscription saved');
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error saving push subscription');
        reject(request.error);
      };
    });
  }

  // Get push subscription
  async getPushSubscription() {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pushSubscription'], 'readonly');
      const store = transaction.objectStore('pushSubscription');
      const request = store.get('subscription');

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error fetching push subscription');
        reject(request.error);
      };
    });
  }

  // Delete push subscription
  async deletePushSubscription() {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pushSubscription'], 'readwrite');
      const store = transaction.objectStore('pushSubscription');
      const request = store.delete('subscription');

      request.onsuccess = () => {
        console.log('[IndexedDB] Push subscription deleted');
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] Error deleting push subscription');
        reject(request.error);
      };
    });
  }

  // Cache API response
  async cacheData(url, data) {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({
        url,
        data,
        timestamp: new Date().getTime(),
      });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get cached data
  async getCachedData(url) {
    if (!this.db) throw new Error('[IndexedDB] Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(url);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Close database
  close() {
    if (this.db) {
      this.db.close();
      console.log('[IndexedDB] Database closed');
    }
  }
}
