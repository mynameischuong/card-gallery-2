import './style.css';
import { CardGallery } from './CardGallery';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  
  if (!appElement) {
    console.error('App element not found');
    return;
  }

  const gallery = new CardGallery(appElement);
  gallery.init();

  console.log('🎮 Card Gallery initialized successfully!');
});
