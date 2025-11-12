import IndexedDBService from '../../utils/indexeddb-service';
import StoryService from '../../data/api';

export default class OfflineDataPage {
  #indexedDB = new IndexedDBService();

  async render() {
    return `
      <section class="container offline-data-page">
        <h1>Offline Data Manager</h1>
        
        <div class="data-sections">
          <!-- Cached Stories Section -->
          <div class="data-section">
            <h2>📚 Cached Stories</h2>
            <p class="section-description">Stories saved for offline viewing</p>
            <div id="cached-stories-container" class="data-container">
              <p class="loading">Loading cached stories...</p>
            </div>
          </div>

          <!-- Pending Stories Section -->
          <div class="data-section">
            <h2>⏳ Pending Stories</h2>
            <p class="section-description">Stories waiting to be synced to server</p>
            <div id="pending-stories-container" class="data-container">
              <p class="loading">Loading pending stories...</p>
            </div>
            <button id="sync-pending-btn" class="action-button" style="margin-top: 1rem;">
              🔄 Sync Pending Stories
            </button>
          </div>

          <!-- Search & Filter Section -->
          <div class="data-section">
            <h2>🔍 Search Stories</h2>
            <div class="search-container">
              <input 
                type="text" 
                id="search-input" 
                placeholder="Search stories by name or description..."
                class="search-input"
                aria-label="Search cached stories">
              <button id="search-btn" class="search-button">Search</button>
              <button id="clear-search-btn" class="search-button secondary">Clear</button>
            </div>
            <div id="search-results-container" class="data-container" style="margin-top: 1rem; display: none;">
              <p class="loading">Search results will appear here...</p>
            </div>
          </div>

          <!-- Database Stats Section -->
          <div class="data-section stats-section">
            <h2>📊 Database Statistics</h2>
            <div id="db-stats" class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Total Stories</span>
                <span class="stat-value" id="total-stories">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Pending Stories</span>
                <span class="stat-value" id="pending-count">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Storage Status</span>
                <span class="stat-value" id="storage-status">Active</span>
              </div>
            </div>
          </div>

          <!-- Actions Section -->
          <div class="data-section actions-section">
            <h2>⚙️ Database Actions</h2>
            <div class="action-buttons">
              <button id="export-data-btn" class="action-button">📥 Export Data</button>
              <button id="clear-cache-btn" class="action-button danger">🗑️ Clear Cache</button>
              <button id="back-home-btn" class="action-button secondary">← Back to Home</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    try {
      await this.#indexedDB.init();
    } catch (err) {
      console.error('[OfflineDataPage] Error initializing IndexedDB:', err);
    }

    // Load data
    await this.loadCachedStories();
    await this.loadPendingStories();
    await this.updateStats();

    // Setup event listeners
    document.getElementById('sync-pending-btn').addEventListener('click', () => this.syncPendingStories());
    document.getElementById('search-btn').addEventListener('click', () => this.performSearch());
    document.getElementById('clear-search-btn').addEventListener('click', () => this.clearSearch());
    document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());
    document.getElementById('clear-cache-btn').addEventListener('click', () => this.clearCache());
    document.getElementById('back-home-btn').addEventListener('click', () => {
      window.location.hash = '#/';
    });

    // Allow search on Enter key
    document.getElementById('search-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });
  }

  async loadCachedStories() {
    try {
      const stories = await this.#indexedDB.getAllStories();
      const container = document.getElementById('cached-stories-container');

      if (!stories || stories.length === 0) {
        container.innerHTML = '<p class="empty-state">No cached stories found.</p>';
        return;
      }

      const html = stories.map(story => `
        <div class="story-card">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-thumbnail" onerror="this.src='/favicon.png'">
          <div class="story-info">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <small>Created: ${new Date(story.createdAt).toLocaleDateString()}</small>
            <div class="story-actions">
              <button class="delete-btn" onclick="this.closest('.offline-data-page') ? null : location.hash='#/'">Delete</button>
            </div>
          </div>
        </div>
      `).join('');

      container.innerHTML = html;
    } catch (err) {
      console.error('[OfflineDataPage] Error loading cached stories:', err);
      document.getElementById('cached-stories-container').innerHTML = '<p class="error">Error loading cached stories</p>';
    }
  }

  async loadPendingStories() {
    try {
      const stories = await this.#indexedDB.getPendingStories();
      const container = document.getElementById('pending-stories-container');

      if (!stories || stories.length === 0) {
        container.innerHTML = '<p class="empty-state">No pending stories to sync.</p>';
        return;
      }

      const html = stories.map(story => `
        <div class="pending-card">
          <div class="pending-header">
            <h3>${story.description?.substring(0, 50) || 'Untitled'}...</h3>
            <span class="status-badge">Pending</span>
          </div>
          <p>Created: ${new Date(story.timestamp || Date.now()).toLocaleString()}</p>
          <div class="pending-preview">
            ${story.photoData ? '<img src="' + story.photoData + '" alt="preview" class="photo-preview">' : '<p>No photo</p>'}
          </div>
        </div>
      `).join('');

      container.innerHTML = html;
    } catch (err) {
      console.error('[OfflineDataPage] Error loading pending stories:', err);
      document.getElementById('pending-stories-container').innerHTML = '<p class="error">Error loading pending stories</p>';
    }
  }

  async performSearch() {
    const query = document.getElementById('search-input').value;
    if (!query.trim()) {
      this.clearSearch();
      return;
    }

    try {
      const results = await this.#indexedDB.searchStories({ query });
      const container = document.getElementById('search-results-container');
      container.style.display = 'block';

      if (!results || results.length === 0) {
        container.innerHTML = `<p class="empty-state">No stories found matching "${query}"</p>`;
        return;
      }

      const html = results.map(story => `
        <div class="story-card">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-thumbnail" onerror="this.src='/favicon.png'">
          <div class="story-info">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <small>Created: ${new Date(story.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      `).join('');

      container.innerHTML = html;
    } catch (err) {
      console.error('[OfflineDataPage] Error searching stories:', err);
    }
  }

  clearSearch() {
    document.getElementById('search-input').value = '';
    document.getElementById('search-results-container').style.display = 'none';
    document.getElementById('search-results-container').innerHTML = '';
  }

  async updateStats() {
    try {
      const allStories = await this.#indexedDB.getAllStories();
      const pendingStories = await this.#indexedDB.getPendingStories();

      document.getElementById('total-stories').textContent = allStories.length;
      document.getElementById('pending-count').textContent = pendingStories.length;
      document.getElementById('storage-status').textContent = 'Active ✓';
    } catch (err) {
      console.error('[OfflineDataPage] Error updating stats:', err);
    }
  }

  async syncPendingStories() {
    const syncBtn = document.getElementById('sync-pending-btn');
    const wasDisabled = syncBtn.disabled;
    syncBtn.disabled = true;
    syncBtn.textContent = '⏳ Syncing...';

    try {
      if (!navigator.onLine) {
        alert('You are offline. Please reconnect to sync pending stories.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to sync stories.');
        window.location.hash = '#/login';
        return;
      }

      const pendingStories = await this.#indexedDB.getPendingStories();
      if (!pendingStories || pendingStories.length === 0) {
        alert('No pending stories to sync.');
        return;
      }

      let syncedCount = 0;
      const errors = [];

      for (const story of pendingStories) {
        try {
          // Send to API
          await StoryService.addStory(
            story.description,
            story.photoData,
            story.lat,
            story.lon,
            token
          );

          // Remove from pending
          await this.#indexedDB.deletePendingStory(story.id);
          syncedCount++;
        } catch (err) {
          errors.push(`Story failed: ${err.message}`);
        }
      }

      if (syncedCount > 0) {
        alert(`Successfully synced ${syncedCount} story(ies)!`);
        await this.loadPendingStories();
        await this.loadCachedStories();
        await this.updateStats();
      }

      if (errors.length > 0) {
        console.error('[OfflineDataPage] Sync errors:', errors);
      }
    } catch (err) {
      console.error('[OfflineDataPage] Error syncing pending stories:', err);
      alert('Error syncing stories: ' + err.message);
    } finally {
      syncBtn.disabled = wasDisabled;
      syncBtn.textContent = '🔄 Sync Pending Stories';
    }
  }

  async exportData() {
    try {
      const allStories = await this.#indexedDB.getAllStories();
      const pendingStories = await this.#indexedDB.getPendingStories();

      const exportData = {
        exportedAt: new Date().toISOString(),
        cachedStories: allStories,
        pendingStories: pendingStories,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `story-map-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      alert('Data exported successfully!');
    } catch (err) {
      console.error('[OfflineDataPage] Error exporting data:', err);
      alert('Error exporting data: ' + err.message);
    }
  }

  async clearCache() {
    if (!confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
      return;
    }

    try {
      await this.#indexedDB.clearStories();
      alert('Cache cleared successfully!');
      await this.loadCachedStories();
      await this.updateStats();
    } catch (err) {
      console.error('[OfflineDataPage] Error clearing cache:', err);
      alert('Error clearing cache: ' + err.message);
    }
  }
}
