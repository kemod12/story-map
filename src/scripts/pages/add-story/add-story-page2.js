import StoryService from '../../data/api';
import mapService from '../../utils/map-service';
import IndexedDBService from '../../utils/indexeddb-service';

export default class AddStoryPage {
  constructor() {
    this.selectedLocation = null;
    this.map = null;
    this.locationMarker = null;
    this.indexedDB = new IndexedDBService();
  }

  async render() {
    return `
      <section class="container add-story-page">
        <h1>Add New Story</h1>
        <div id="offline-notice" class="offline-notice" style="display: none;">
          ⚠️ You are offline. Your story will be saved locally and synced when you're back online.
        </div>
        <form id="add-story-form" class="add-story-form">
          <div class="form-group">
            <label for="description">Story Description</label>
            <textarea id="description" name="description" required placeholder="Tell your story..." aria-required="true"></textarea>
          </div>

          <div class="form-group">
            <label for="photo">Photo</label>
            <div class="photo-input-container">
              <input type="file" id="photo" name="photo" accept="image/*" required aria-required="true">
              <button type="button" id="camera-button" class="camera-button">Take Photo</button>
            </div>
            <div id="photo-preview" class="photo-preview"></div>
          </div>

          <div class="form-group">
            <label>Location</label>
            <div id="location-map" class="location-map"></div>
            <p class="location-help">Click on the map to select a location for your story</p>
          </div>

          <div class="form-actions">
            <button type="button" id="cancel-button" class="cancel-button">Cancel</button>
            <button type="submit" class="submit-button">Share Story</button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }

    try {
      await this.indexedDB.init();
    } catch (err) {
      console.error('[AddStoryPage] IndexedDB init error', err);
    }

    this.updateOfflineNotice();
    window.addEventListener('online', () => this.updateOfflineNotice());
    window.addEventListener('offline', () => this.updateOfflineNotice());

    this.initMap();
    this.initForm();
    this.initCamera();
  }

  updateOfflineNotice() {
    const notice = document.getElementById('offline-notice');
    if (!notice) return;
    notice.style.display = navigator.onLine ? 'none' : 'block';
  }

  initMap() {
    this.map = mapService.initializeMap('location-map', { zoom: 5 });
    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.selectedLocation = { lat, lng };
      if (this.locationMarker) mapService.removeMarker(this.locationMarker);
      this.locationMarker = mapService.addMarker(lat, lng, { draggable: true });
      this.locationMarker.on('dragend', (ev) => {
        const pos = ev.target.getLatLng();
        this.selectedLocation = { lat: pos.lat, lng: pos.lng };
      });
    });
  }

  initForm() {
    const form = document.getElementById('add-story-form');
    const photoInput = document.getElementById('photo');
    const preview = document.getElementById('photo-preview');
    const cancelBtn = document.getElementById('cancel-button');

    if (cancelBtn) cancelBtn.addEventListener('click', () => { window.location.hash = '#/'; });

    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file || !preview) return;
        const r = new FileReader();
        r.onload = (ev) => { preview.innerHTML = `<img src="${ev.target.result}" class="preview-image" alt="Preview">`; };
        r.readAsDataURL(file);
      });
    }

    if (form) {
      form.addEventListener('submit', async (evt) => {
        evt.preventDefault();
        const formData = new FormData(form);
        const description = formData.get('description');
        const photoFile = formData.get('photo');

        if (!this.selectedLocation) { alert('Please select a location on the map'); return; }
        const token = localStorage.getItem('token');
        if (!token) { window.location.hash = '#/login'; return; }

        if (navigator.onLine) {
          try {
            await StoryService.addStory(token, { description, photo: photoFile, lat: this.selectedLocation.lat, lon: this.selectedLocation.lng });
            alert('Story shared successfully!');
            window.location.hash = '#/';
          } catch (err) {
            console.error('Add story failed, saving offline', err);
            await this.saveStoryOffline(description, photoFile);
          }
        } else {
          await this.saveStoryOffline(description, photoFile);
        }
      });
    }
  }

  async saveStoryOffline(description, photoFile) {
    if (!photoFile) {
      alert('Please attach a photo');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoData = e.target.result;
      const pending = { description, photoData, lat: this.selectedLocation.lat, lon: this.selectedLocation.lng, timestamp: Date.now() };
      await this.indexedDB.addPendingStory(pending);
      alert('Saved locally. It will sync when you are back online.');
      window.location.hash = '#/';
    };
    reader.readAsDataURL(photoFile);
  }

  initCamera() {
    const cameraBtn = document.getElementById('camera-button');
    const preview = document.getElementById('photo-preview');
    const photoInput = document.getElementById('photo');
    if (!cameraBtn) return;
    cameraBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (preview) preview.innerHTML = `<video autoplay class="camera-preview"></video><button type="button" class="capture-button">Take Photo</button>`;
        const video = document.querySelector('.camera-preview');
        if (!video) return;
        video.srcObject = stream;
        const capture = document.querySelector('.capture-button');
        if (!capture) return;
        capture.addEventListener('click', () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
            const dt = new DataTransfer(); dt.items.add(file); if (photoInput) photoInput.files = dt.files;
            if (preview) preview.innerHTML = `<img src="${canvas.toDataURL()}" class="preview-image" alt="Preview">`;
            stream.getTracks().forEach(t => t.stop());
          }, 'image/jpeg');
        });
      } catch (err) {
        console.error('Camera error', err);
        alert('Cannot access camera.');
      }
    });
  }
}
