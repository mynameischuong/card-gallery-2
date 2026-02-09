// Entry point for the card gallery app
import './style.css';
import { CardGallery } from './CardGallery';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    const gallery = new CardGallery(appElement);
    gallery.init();
  }
});
