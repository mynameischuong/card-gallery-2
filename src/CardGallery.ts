import type { AppState, Card, Decklist, GameMode } from './types';
import { cardsData, decklistsData, modesData } from './data';
import { getRarityColors } from './utils';
import { ModeController } from './ModeController';

export class CardGallery {
  private state: AppState & { currentDuelist: string, page: 'gallery' | 'decklist' | 'modes', selectedCard?: Card, displayCards: Card[], editingModeId?: number, isDeveloper: boolean };
  private appElement: HTMLElement;
  private modeController: ModeController;

  private loadSavedModes(): { modes: GameMode[]; currentModeId: number } | null {
    try {
      const savedModes = localStorage.getItem('cardGalleryModes');
      const savedModeId = localStorage.getItem('cardGalleryCurrentModeId');
      if (!savedModes) {
        return null;
      }

      const parsedModes = JSON.parse(savedModes) as GameMode[];
      const currentModeId = savedModeId ? parseInt(savedModeId, 10) : (parsedModes[0]?.id ?? 0);
      return {
        modes: Array.isArray(parsedModes) ? parsedModes : modesData,
        currentModeId: Number.isNaN(currentModeId) ? parsedModes[0]?.id ?? 0 : currentModeId,
      };
    } catch {
      return null;
    }
  }

  private saveModes(): void {
    try {
      localStorage.setItem('cardGalleryModes', JSON.stringify(this.state.modes));
      localStorage.setItem('cardGalleryCurrentModeId', String(this.state.currentModeId));
    } catch {
      // ignore storage failures silently
    }
  }

  private getSharedModeFromUrl(): GameMode | undefined {
    const params = new URLSearchParams(window.location.search);
    const sharedModeParam = params.get('sharedMode');
    if (!sharedModeParam) {
      return undefined;
    }

    try {
      return JSON.parse(sharedModeParam) as GameMode;
    } catch {
      return undefined;
    }
  }

  private findMatchingMode(sharedMode: GameMode, modes: GameMode[]): GameMode | undefined {
    return modes.find(mode => mode.name === sharedMode.name && mode.rules === sharedMode.rules);
  }

  private getSharedModeWithUniqueId(sharedMode: GameMode, modes: GameMode[]): GameMode {
    const nextId = Math.max(0, ...modes.map(mode => mode.id)) + 1;
    const id = modes.some(mode => mode.id === sharedMode.id) ? nextId : sharedMode.id;
    return { ...sharedMode, id };
  }

  private loadDeveloperMode(): boolean {
    return localStorage.getItem('cardGalleryIsDeveloper') === 'true';
  }

  private enableDeveloperMode(): void {
    const code = window.prompt('Developer access code:');
    if (!code) {
      return;
    }

    const DEV_CODE = 'dev1234';
    if (code.trim() === DEV_CODE) {
      this.state.isDeveloper = true;
      localStorage.setItem('cardGalleryIsDeveloper', 'true');
      this.render();
      this.attachEventListeners();
      return;
    }

    window.alert('Invalid developer code.');
  }

  private startEditingMode(modeId: number): void {
    this.state.editingModeId = modeId;
    this.render();
    this.attachEventListeners();
  }

  private cancelEditingMode(): void {
    this.state.editingModeId = undefined;
    this.render();
    this.attachEventListeners();
  }

  private updateMode(updatedMode: GameMode): void {
    this.state.modes = this.state.modes.map(mode => mode.id === updatedMode.id ? updatedMode : mode);
    this.state.currentModeId = updatedMode.id;
    this.state.editingModeId = undefined;
    this.saveModes();
    this.render();
    this.attachEventListeners();
  }

  private deleteMode(modeId: number): void {
    if (!window.confirm('Are you sure you want to delete this mode?')) {
      return;
    }

    this.state.modes = this.state.modes.filter(mode => mode.id !== modeId);
    if (this.state.currentModeId === modeId) {
      this.state.currentModeId = this.state.modes[0]?.id ?? 0;
    }
    this.state.editingModeId = undefined;
    this.saveModes();
    this.render();
    this.attachEventListeners();
  }

  constructor(appElement: HTMLElement) {
    this.appElement = appElement;
    this.modeController = new ModeController(appElement);

    const saved = this.loadSavedModes();
    const initialModes = saved?.modes ?? modesData;
    const initialModeId = saved?.currentModeId ?? initialModes[0]?.id ?? 0;

    this.state = {
      cards: cardsData,
      modes: initialModes,
      currentModeId: initialModeId,
      displayCards: cardsData,
      currentPage: 0,
      cardsPerPage: window.innerWidth < 768 ? 8 : 16,
      goldAmount: 1200,
      gemAmount: 350,
      currentDuelist: 'All',
      page: 'gallery',
      selectedCard: undefined,
      editingModeId: undefined,
      isDeveloper: this.loadDeveloperMode()
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

  private async loadModesFromJson(): Promise<GameMode[] | null> {
    try {
      const response = await fetch('modes.json');
      if (!response.ok) {
        return null;
      }
      const modes = await response.json();
      return Array.isArray(modes) ? modes as GameMode[] : null;
    } catch {
      return null;
    }
  }

  async init(): Promise<void> {
    const jsonModes = await this.loadModesFromJson();
    const saved = this.loadSavedModes();
    const effectiveModes = saved?.modes ?? jsonModes ?? modesData;
    let effectiveModeId = saved?.currentModeId ?? effectiveModes[0]?.id ?? 0;

    const sharedMode = this.getSharedModeFromUrl();
    if (sharedMode) {
      const existingMode = this.findMatchingMode(sharedMode, effectiveModes);
      if (existingMode) {
        effectiveModeId = existingMode.id;
      } else {
        const sharedModeWithId = this.getSharedModeWithUniqueId(sharedMode, effectiveModes);
        effectiveModes.push(sharedModeWithId);
        effectiveModeId = sharedModeWithId.id;
      }
      this.state.modes = effectiveModes;
      this.state.currentModeId = effectiveModeId;
      this.saveModes();
    } else {
      this.state.modes = effectiveModes;
      this.state.currentModeId = effectiveModeId;
    }

    this.render();
    this.attachEventListeners();
  }

  // Filter by duelist if selected
  private getFilteredCards(): Card[] {
    return this.state.displayCards;
  }

  private shuffleCards(cards: Card[]): Card[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getCurrentPageCards(): Card[] {
    const filtered = this.getFilteredCards();
    const start = this.state.currentPage * this.state.cardsPerPage;
    const end = start + this.state.cardsPerPage;
    return filtered.slice(start, end);
  }

  private getTotalPages(): number {
    return Math.ceil(this.state.displayCards.length / this.state.cardsPerPage);
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
        
        <div class="flex flex-col gap-3 bg-gradient-to-br from-yellow-900/60 to-yellow-800/60 px-5 py-3 rounded-xl border-3 border-yellow-600 shadow-2xl backdrop-blur-sm relative z-10 overflow-hidden">
          <!-- Inner glow -->
          <div class="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(255,215,0,0.2)] pointer-events-none"></div>
          
          <div class="flex items-center gap-3 relative">
            <label for="duelistFilter" class="inline-flex items-center gap-2 font-bold text-yellow-100 text-lg font-fantasy drop-shadow-md leading-none">🎴 <span>Duelist:</span></label>
            <select id="duelistFilter" class="border-3 border-yellow-600 rounded-lg px-2 py-2 bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-900 font-bold font-fantasy focus:ring-2 focus:ring-yellow-400 transition shadow-lg cursor-pointer w-40">
              ${duelists.map(d => `<option value="${d}" ${d === this.state.currentDuelist ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div class="flex items-center gap-2 bg-gradient-to-br from-yellow-100 to-yellow-200 px-2 py-2 rounded-lg border-2 border-yellow-500 shadow-lg relative w-40">
              <span class="inline-flex items-center gap-2 text-yellow-800 font-bold text-lg font-fantasy leading-none">📚 <span>Total:</span></span>
              <span class="text-yellow-900 font-extrabold text-2xl font-fantasy drop-shadow-sm leading-none">${totalDecks}</span>
            </div>
            <button id="openModePageBtn" class="inline-flex items-center justify-center gap-2 text-yellow-900 font-bold bg-yellow-200 hover:bg-yellow-300 px-2 py-2 rounded-2xl border-2 border-yellow-500 shadow-lg transition duration-200 whitespace-nowrap flex-shrink-0 min-w-[140px]">🎮 <span>Mode Page</span></button>
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
          class="card card-ornate-frame relative aspect-[3/4] min-w-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl overflow-hidden border-4 border-yellow-600 shadow-xl transition-transform transition-shadow duration-200 cursor-pointer hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:z-10"
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
            src="${card.image.startsWith('/') ? '.' + card.image : card.image}"
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
            
            <div title="${card.name}" class="card-name flex items-center justify-center text-xs md:text-sm font-extrabold text-yellow-100 text-center font-fantasy tracking-wide drop-shadow-lg whitespace-normal break-words overflow-hidden w-full max-w-full text-glow-gold leading-tight min-h-[2.75rem]">
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
    } else if (this.state.page === 'modes') {
      this.appElement.innerHTML = `
        <div class="gallery-container w-full max-w-6xl wood-texture rounded-[30px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-8 border-wood-dark mx-auto">
          <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div class="text-4xl font-extrabold text-yellow-200 font-fantasy">Game Modes</div>
              <div class="text-yellow-100 text-sm mt-2">Manage your mode rules and tournament settings on a separate page.</div>
            </div>
            <button id="backToGallery" class="text-yellow-950 bg-yellow-300 hover:bg-yellow-400 font-bold rounded-2xl px-5 py-3 shadow-lg transition">← Back to Gallery</button>
          </div>
          ${this.modeController.renderModePanel(this.state.modes, this.state.currentModeId, this.state.editingModeId, this.state.isDeveloper)}
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
        if (value && value !== 'All') {
          const filtered = this.state.cards.filter(card => card.duelist === value);
          this.state.displayCards = this.shuffleCards(filtered);
        } else {
          this.state.displayCards = this.state.cards;
        }
        this.render();
        this.attachEventListeners();
      });
    }

    if (this.state.page === 'modes') {
      this.modeController.attachModeListeners(
        this.state.modes,
        this.state.isDeveloper,
        () => this.enableDeveloperMode(),
        (newModeId) => {
          this.state.currentModeId = newModeId;
          this.state.editingModeId = undefined;
          this.saveModes();
          this.render();
          this.attachEventListeners();
        },
        (createdMode) => {
          this.state.modes = [...this.state.modes, createdMode];
          this.state.currentModeId = createdMode.id;
          this.state.editingModeId = undefined;
          this.saveModes();
          this.render();
          this.attachEventListeners();
        },
        (updatedMode) => {
          this.updateMode(updatedMode);
        },
        (modeId) => {
          this.deleteMode(modeId);
        },
        (modeId) => {
          this.startEditingMode(modeId);
        },
        () => {
          this.cancelEditingMode();
        },
      );
    }

    const openModePageBtn = this.appElement.querySelector('#openModePageBtn');
    openModePageBtn?.addEventListener('click', () => {
      this.state.page = 'modes';
      this.render();
      this.attachEventListeners();
    });

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

    // Back to gallery button in decklist or modes page
    const backBtn = this.appElement.querySelector('#backToGallery');
    backBtn?.addEventListener('click', () => this.handleBackToGallery());

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

  private getRandomDecklist(card: Card): Decklist | undefined {
    const matches = decklistsData.filter((d: Decklist) => d.cardName === card.name && d.duelist === card.duelist);
    if (matches.length === 0) {
      return undefined;
    }
    if (matches.length === 1) {
      return matches[0];
    }
    const randomIndex = Math.floor(Math.random() * matches.length);
    return matches[randomIndex];
  }

  private createDecklistPage(card: Card): string {
    const decklist = this.getRandomDecklist(card);
    return `
      <div class="gallery-container w-full max-w-6xl parchment-gradient rounded-[36px] p-10 shadow-[0_20px_80px_rgba(0,0,0,0.7)] border-8 border-yellow-900 mx-auto flex flex-col items-center relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] opacity-10 pointer-events-none"></div>
        <button id="backToGallery" class="mb-8 px-8 py-3 bg-yellow-800 hover:bg-yellow-900 text-yellow-100 font-extrabold rounded-xl shadow-2xl border-2 border-yellow-400 transition text-xl z-10">← Back to Gallery</button>
        <div class="flex flex-col items-center gap-6 w-full z-10">
          <div title="${card.name}" class="text-4xl md:text-5xl font-fantasy font-extrabold text-yellow-900 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] tracking-wider text-center mb-2 break-words whitespace-normal leading-tight w-full max-w-full min-h-[5rem]">${card.name}</div>
          <div class="text-2xl font-fantasy font-bold text-yellow-700 mb-4">Duelist: <span class="text-yellow-900">${card.duelist}</span></div>
          <div class="flex flex-wrap gap-10 justify-center w-full">
            ${!decklist ? `<div class='text-yellow-900 text-2xl font-fantasy'>No decklist found for this deck.</div>` : `
                <div class="decklist-card bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-100 rounded-2xl border-2 border-yellow-600 shadow-lg p-2 flex flex-col items-center w-full max-w-2xl mx-auto aspect-[4/3] relative">
                  <div class="font-extrabold text-yellow-900 text-2xl mb-2 font-fantasy text-center drop-shadow">${decklist.title}</div>
                  <div class="flex-1 flex items-center justify-center w-full h-full">
                    <div class="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-300 rounded-xl border-2 border-yellow-400 shadow-md overflow-hidden aspect-[4/3]">
                      <img src="${decklist.image.startsWith('/') ? '.' + decklist.image : decklist.image}" alt="${decklist.title}" class="relative z-10 rounded-xl shadow-lg border border-yellow-500 bg-white object-contain w-full h-full max-w-full max-h-full" style="image-rendering:auto;" />
                    </div>
                  </div>
                </div>
              `}
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
