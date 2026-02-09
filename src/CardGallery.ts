import type { AppState, Card } from './types';
import { cardsData, decklistsData } from './data';
import { getRarityColors } from './utils';

export class CardGallery {
  private state: AppState & { currentDuelist: string, page: 'gallery' | 'decklist', selectedCard?: Card };
  private appElement: HTMLElement;

  constructor(appElement: HTMLElement) {
    this.appElement = appElement;
    this.state = {
      cards: cardsData,
      currentPage: 0,
      cardsPerPage: window.innerWidth < 768 ? 8 : 16,
      goldAmount: 1200,
      gemAmount: 350,
      currentDuelist: 'All',
      page: 'gallery',
      selectedCard: undefined
    };
    window.addEventListener('resize', () => {
      const newCardsPerPage = window.innerWidth < 768 ? 8 : 16;
      if (this.state.cardsPerPage !== newCardsPerPage) {
        this.state.cardsPerPage = newCardsPerPage;
        this.state.currentPage = 0;
        this.render();
        this.attachEventListeners();
      }
    });
  }

  init(): void {
    this.render();
    this.attachEventListeners();
  }

  // Filter by duelist if selected
  private getFilteredCards(): Card[] {
    if (this.state.currentDuelist && this.state.currentDuelist !== 'All') {
      return this.state.cards.filter(card => card.duelist === this.state.currentDuelist);
    }
    return this.state.cards;
  }

  private getCurrentPageCards(): Card[] {
    const filtered = this.getFilteredCards();
    const start = this.state.currentPage * this.state.cardsPerPage;
    const end = start + this.state.cardsPerPage;
    return filtered.slice(start, end);
  }

  private getTotalPages(): number {
    return Math.ceil(this.state.cards.length / this.state.cardsPerPage);
  }

  private createHeader(): string {
    const duelists = Array.from(new Set(this.state.cards.map(card => card.duelist)));
    duelists.unshift('All');
    // Calculate total decks for the selected duelist
    let totalDecks = 0;
    if (this.state.currentDuelist && this.state.currentDuelist !== 'All') {
      totalDecks = this.state.cards.filter(card => card.duelist === this.state.currentDuelist).length;
    } else {
      totalDecks = this.state.cards.length;
    }
    return `
      <div class="rounded-t-3xl p-6 flex flex-col md:flex-row justify-between items-center border-4 border-yellow-700 mb-6 shadow-2xl bg-gradient-to-br from-yellow-900/40 via-yellow-800/30 to-yellow-900/40 backdrop-blur-sm relative overflow-hidden">
        <!-- Decorative top border -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60"></div>
        
        <!-- Ornate corner decorations -->
        <div class="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-yellow-400/50 rounded-tl-lg"></div>
        <div class="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-yellow-400/50 rounded-tr-lg"></div>
        
        <!-- Background pattern overlay -->
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] opacity-10"></div>
        
        <div class="gallery-title flex flex-col items-center md:items-start gap-2 relative z-10">
          <div class="flex items-center gap-3">
            <!-- Decorative gem icon -->
            <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg border-2 border-yellow-700 shadow-lg flex items-center justify-center rotate-45">
              <div class="text-2xl -rotate-45">⚜️</div>
            </div>
            <span class="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-fantasy tracking-wider">Card Gallery</span>
          </div>
          <span class="text-lg text-yellow-100 font-semibold tracking-wide font-fantasy drop-shadow-md">✨ Discover all decks by duelist ✨</span>
        </div>
        
        <div class="flex flex-col md:flex-row gap-2 md:gap-6 items-center bg-gradient-to-br from-yellow-900/60 to-yellow-800/60 px-5 py-3 rounded-xl border-3 border-yellow-600 shadow-2xl backdrop-blur-sm relative z-10">
          <!-- Inner glow -->
          <div class="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(255,215,0,0.2)]"></div>
          
          <div class="flex items-center gap-3 relative">
            <label for="duelistFilter" class="font-bold text-yellow-100 text-lg font-fantasy drop-shadow-md">🎴 Duelist:</label>
            <select id="duelistFilter" class="border-3 border-yellow-600 rounded-lg px-4 py-2 bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-900 font-bold font-fantasy focus:ring-2 focus:ring-yellow-400 transition shadow-lg cursor-pointer">
              ${duelists.map(d => `<option value="${d}" ${d === this.state.currentDuelist ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          
          <div class="flex items-center gap-2 bg-gradient-to-br from-yellow-100 to-yellow-200 px-4 py-2 rounded-lg border-2 border-yellow-500 shadow-lg relative">
            <span class="text-yellow-800 font-bold text-lg font-fantasy">📚 Total:</span>
            <span class="text-yellow-900 font-extrabold text-2xl font-fantasy drop-shadow-sm">${totalDecks}</span>
          </div>
        </div>
        
        <!-- Decorative bottom border -->
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60"></div>
      </div>
    `;
  }

  // Sidebar removed, return empty string
  private createSidebar(): string {
    return '';
  }

  // Sidebar button creation removed since type is not used

  private createCardsGrid(): string {
    const cards = this.getCurrentPageCards();
    
    return `
      <div class="cards-area flex-1 bg-gradient-to-br from-wood-medium to-[#5a483a] rounded-2xl p-5 border-4 border-wood-dark shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
        ${this.createBottomControls()}
        <div class="cards-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          ${cards.map(card => this.createCard(card)).join('')}
        </div>
      </div>
    `;
  }

  private createCard(card: Card): string {
    const { glowClass } = getRarityColors(card.rarity);
    const lockOverlay = card.locked ? `
      <div class="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl z-10">
        <span class="text-5xl">🔒</span>
      </div>
    ` : '';

    // Ornate corner decorations
    const cornerDecorations = `
      <div class="card-corners">
        <div class="card-corner top-left"></div>
        <div class="card-corner top-right"></div>
        <div class="card-corner bottom-left"></div>
        <div class="card-corner bottom-right"></div>
      </div>
    `;

    return `
      <div 
          class="card card-ornate-frame relative aspect-[3/4] bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl overflow-hidden border-4 border-yellow-600 shadow-xl transition-transform transition-shadow duration-200 cursor-pointer hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:z-10"
        data-card-id="${card.id}"
      >
        ${cornerDecorations}
        
        <!-- Inner decorative border -->
        <div class="absolute inset-2 border-2 border-yellow-500/30 rounded-xl pointer-events-none"></div>
        
        <!-- Glow effect overlay -->
        <div class="absolute inset-0 rounded-xl ${glowClass} pointer-events-none"></div>
        
        <!-- Card level badge with ornate styling -->
        <div class="card-level absolute top-3 left-3 bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-full w-10 h-10 flex items-center justify-center font-extrabold text-yellow-100 text-lg border-3 border-yellow-400 z-20 font-fantasy shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,215,0,0.3)]">
          ${card.level}
        </div>
        
        <!-- Rarity indicator -->
        <div class="absolute top-3 right-3 z-20">
          <div class="bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-full px-3 py-1 border-2 border-yellow-400 shadow-lg">
            <span class="text-xs font-bold text-yellow-100 uppercase tracking-wider">${card.rarity}</span>
          </div>
        </div>
        
        <!-- Image container with inner frame -->
        <div class="absolute inset-0 top-12 bottom-16 mx-3 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg border-4 border-yellow-700/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden">
          <!-- Decorative inner corners -->
          <div class="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-yellow-600/50"></div>
          <div class="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-yellow-600/50"></div>
          <div class="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-yellow-600/50"></div>
          <div class="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-yellow-600/50"></div>
          
          <img 
            src="${card.image}"
            alt="${card.name}"
            class="max-w-full max-h-full object-contain p-1"
            loading="lazy"
          />
        </div>
        
        <!-- Card name plate with ornate styling -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-900 via-yellow-800 to-transparent p-3 rounded-b-xl">
          <div class="bg-gradient-to-r from-yellow-900/80 via-yellow-800/90 to-yellow-900/80 rounded-lg border-2 border-yellow-600 shadow-lg px-2 py-2">
            <!-- Decorative line above name -->
            <div class="h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-1 opacity-60"></div>
            
            <div class="card-name text-sm font-extrabold text-yellow-100 text-center font-fantasy tracking-wide drop-shadow-lg truncate text-glow-gold">
              ${card.name}
            </div>
            
            <!-- Decorative line below name -->
            <div class="h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-1 opacity-60"></div>
          </div>
        </div>
        
        ${lockOverlay}
      </div>
    `;
  }

  private createBottomControls(): string {
    const totalPages = this.getTotalPages();
    const hasPrev = this.state.currentPage > 0;
    const hasNext = this.state.currentPage < totalPages - 1;

    return `
      <div class="bottom-controls fixed right-6 bottom-6 z-30 flex flex-col items-end gap-3">
        <div class="flex flex-col gap-3">
          <button 
            id="prevBtn" 
            class="control-button w-12 h-12 bg-white border-4 border-wood-light rounded-full flex items-center justify-center transition-all duration-300 shadow-lg font-bold text-2xl text-wood-dark ${!hasPrev ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl cursor-pointer'}"
            ${!hasPrev ? 'disabled' : ''}
            title="Previous"
          >
            ←
          </button>
          <button 
            id="nextBtn" 
            class="control-button w-12 h-12 bg-white border-4 border-wood-light rounded-full flex items-center justify-center transition-all duration-300 shadow-lg font-bold text-2xl text-wood-dark ${!hasNext ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl cursor-pointer'}"
            ${!hasNext ? 'disabled' : ''}
            title="Next"
          >
            →
          </button>
        </div>
      </div>
    `;
  }

  render(): void {
    if (this.state.page === 'gallery') {
      this.appElement.innerHTML = `
        <div class="gallery-container w-full max-w-6xl wood-texture rounded-[30px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-8 border-wood-dark mx-auto">
          ${this.createHeader()}
          <div class="main-content flex flex-col md:flex-row gap-6">
            ${this.createSidebar()}
            ${this.createCardsGrid()}
          </div>
        </div>
      `;
    } else if (this.state.page === 'decklist' && this.state.selectedCard) {
      this.appElement.innerHTML = this.createDecklistPage(this.state.selectedCard);
    }
  }

  private attachEventListeners(): void {
    // Duelist filter
    const duelistFilter = this.appElement.querySelector('#duelistFilter') as HTMLSelectElement;
    if (duelistFilter) {
      duelistFilter.addEventListener('change', (e) => {
        const value = (e.target as HTMLSelectElement).value;
        this.state.currentDuelist = value;
        this.state.currentPage = 0;
        this.render();
        this.attachEventListeners();
      });
    }

    // Card click events (only in gallery page)
    if (this.state.page === 'gallery') {
      const cards = this.appElement.querySelectorAll('.card');
      cards.forEach(card => {
        card.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const cardId = parseInt(target.dataset.cardId || '0');
          this.handleCardClick(cardId);
        });
      });
    }
    // Back to gallery button (only in decklist page)
    if (this.state.page === 'decklist') {
      const backBtn = this.appElement.querySelector('#backToGallery');
      backBtn?.addEventListener('click', () => this.handleBackToGallery());
    }

    // Pagination buttons
    const prevBtn = this.appElement.querySelector('#prevBtn');
    const nextBtn = this.appElement.querySelector('#nextBtn');

    prevBtn?.addEventListener('click', () => this.previousPage());
    nextBtn?.addEventListener('click', () => this.nextPage());
  }

  // changeFilter removed, no filtering

  private handleCardClick(cardId: number): void {
    const card = this.state.cards.find(c => c.id === cardId);
    if (card) {
      this.state.selectedCard = card;
      this.state.page = 'decklist';
      this.render();
      this.attachEventListeners();
    }
  }

  private handleBackToGallery(): void {
    this.state.page = 'gallery';
    this.state.selectedCard = undefined;
    this.render();
    this.attachEventListeners();
  }

  private createDecklistPage(card: Card): string {
    const decklists = decklistsData.filter((d: any) => d.cardName === card.name && d.duelist === card.duelist);
    return `
      <div class="gallery-container w-full max-w-6xl parchment-gradient rounded-[36px] p-10 shadow-[0_20px_80px_rgba(0,0,0,0.7)] border-8 border-yellow-900 mx-auto flex flex-col items-center relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] opacity-10 pointer-events-none"></div>
        <button id="backToGallery" class="mb-8 px-8 py-3 bg-yellow-800 hover:bg-yellow-900 text-yellow-100 font-extrabold rounded-xl shadow-2xl border-2 border-yellow-400 transition text-xl z-10">← Back to Gallery</button>
        <div class="flex flex-col items-center gap-6 w-full z-10">
          <div class="text-4xl md:text-5xl font-fantasy font-extrabold text-yellow-900 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] tracking-wider text-center mb-2">${card.name}</div>
          <div class="text-2xl font-fantasy font-bold text-yellow-700 mb-4">Duelist: <span class="text-yellow-900">${card.duelist}</span></div>
          <div class="flex flex-wrap gap-10 justify-center w-full">
            ${decklists.length === 0 ? `<div class='text-yellow-900 text-2xl font-fantasy'>No decklists found for this deck.</div>` :
              decklists.map((deck: any) => `
                <div class="decklist-card bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-100 rounded-2xl border-2 border-yellow-600 shadow-lg p-2 flex flex-col items-center w-full max-w-2xl mx-auto aspect-[4/3] relative">
                  <div class="font-extrabold text-yellow-900 text-2xl mb-2 font-fantasy text-center drop-shadow">${deck.title}</div>
                  <div class="flex-1 flex items-center justify-center w-full h-full">
                    <div class="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-300 rounded-xl border-2 border-yellow-400 shadow-md overflow-hidden aspect-[4/3]">
                      <img src="${deck.image}" alt="${deck.title}" class="relative z-10 rounded-xl shadow-lg border border-yellow-500 bg-white object-contain w-full h-full max-w-full max-h-full" style="image-rendering:auto;" />
                    </div>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  private previousPage(): void {
    if (this.state.currentPage > 0) {
      this.state.currentPage--;
      this.render();
      this.attachEventListeners();
    }
  }

  private nextPage(): void {
    const totalPages = this.getTotalPages();
    if (this.state.currentPage < totalPages - 1) {
      this.state.currentPage++;
      this.render();
      this.attachEventListeners();
    }
  }
}
