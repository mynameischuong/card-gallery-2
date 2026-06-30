import type { AppState, Card, Decklist, GameMode } from './types';
import { cardsData, decklistsData, modesData } from './data';
import { getRarityColors } from './utils';
import { ModeController } from './ModeController';

export class CardGallery {
  private state: AppState & { currentDuelist: string, page: 'gallery' | 'decklist' | 'modes', selectedCard?: Card, selectedDecklistId?: number, displayCards: Card[], editingModeId?: number, isDeveloper: boolean, noDeckSelected: boolean };
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
      cardsPerPage: 12,
      goldAmount: 1200,
      gemAmount: 350,
      currentDuelist: 'All',
      page: 'gallery',
      selectedCard: undefined,
      editingModeId: undefined,
      isDeveloper: this.loadDeveloperMode(),
      noDeckSelected: true,
    };
    
    const getCardsPerPage = () => window.innerWidth < 640 ? 6 : 12;

    window.addEventListener('resize', () => {
      const desired = getCardsPerPage();
      if (this.state.cardsPerPage !== desired) {
        this.state.cardsPerPage = desired;
        this.state.currentPage = 0;
        this.render();
        this.attachEventListeners();
      }
    });

    // Set correct value on init
    this.state.cardsPerPage = getCardsPerPage();
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
    let totalDecks = 0;
    if (this.state.currentDuelist && this.state.currentDuelist !== 'All') {
      totalDecks = this.state.cards.filter(card => card.duelist === this.state.currentDuelist).length;
    } else {
      totalDecks = this.state.cards.length;
    }
    return `
      <div class="mb-3" style="position:relative;border-radius:16px;overflow:visible;border:3px solid #6b4a20;box-shadow:0 6px 24px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,210,100,0.15);background:linear-gradient(160deg,#1e1208 0%,#2e1c0a 30%,#3a2410 50%,#2e1c0a 70%,#1e1208 100%);">
        <!-- clip inner content but not the icon -->
        <div style="position:absolute;inset:0;border-radius:14px;overflow:hidden;pointer-events:none;">
          <!-- Subtle inner wood grain lines -->
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(92deg,transparent 0px,transparent 18px,rgba(255,180,60,0.03) 18px,rgba(255,180,60,0.03) 19px);pointer-events:none;"></div>
          <!-- Top gold edge highlight -->
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,rgba(220,170,60,0.6),rgba(255,210,100,0.9),rgba(220,170,60,0.6),transparent);pointer-events:none;"></div>
          <!-- Bottom gold edge -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,rgba(180,130,40,0.5),rgba(220,170,60,0.7),rgba(180,130,40,0.5),transparent);pointer-events:none;"></div>
        </div>
        <!-- Corner ornaments -->
        <div style="position:absolute;top:6px;left:8px;width:20px;height:20px;border-top:2px solid rgba(200,160,60,0.7);border-left:2px solid rgba(200,160,60,0.7);border-radius:3px 0 0 0;pointer-events:none;z-index:2;"></div>
        <div style="position:absolute;top:6px;right:8px;width:20px;height:20px;border-top:2px solid rgba(200,160,60,0.7);border-right:2px solid rgba(200,160,60,0.7);border-radius:0 3px 0 0;pointer-events:none;z-index:2;"></div>
        <div style="position:absolute;bottom:6px;left:8px;width:20px;height:20px;border-bottom:2px solid rgba(200,160,60,0.7);border-left:2px solid rgba(200,160,60,0.7);border-radius:0 0 0 3px;pointer-events:none;z-index:2;"></div>
        <div style="position:absolute;bottom:6px;right:8px;width:20px;height:20px;border-bottom:2px solid rgba(200,160,60,0.7);border-right:2px solid rgba(200,160,60,0.7);border-radius:0 0 3px 0;pointer-events:none;z-index:2;"></div>

        <!-- Desktop layout (≥640px): single row with icon in centre -->
        <div class="header-desktop" style="position:relative;display:${window.innerWidth >= 640 ? 'flex' : 'none'};align-items:center;padding:10px 20px;gap:16px;min-height:80px;">

          <!-- LEFT: Title -->
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
            <div style="font-family:'Cinzel',Georgia,serif;font-size:clamp(1.3rem,2.5vw,2rem);font-weight:900;color:#f0d898;letter-spacing:0.12em;line-height:1;text-shadow:0 2px 8px rgba(0,0,0,0.8),0 0 20px rgba(200,150,40,0.3);">CARD GALLERY</div>
            <div style="font-family:'Noto Serif',Georgia,serif;font-size:0.6rem;color:rgba(200,165,80,0.8);letter-spacing:0.22em;text-transform:uppercase;margin-top:5px;">Quest Board for Legendary Decks</div>
            <div style="margin-top:5px;height:1px;width:70%;background:linear-gradient(to right,rgba(180,130,40,0.6),transparent);"></div>
          </div>

          <!-- CENTER: icon.png shield emblem -->
          <div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:visible;margin:-16px 0;">
            <img src="./style/icon.png" alt="Emblem"
              style="width:120px;height:120px;object-fit:contain;mix-blend-mode:lighten;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.8));position:relative;z-index:10;"/>
          </div>

          <!-- RIGHT: DECKS counter + TACTICIAN button -->
          <div style="flex:1;display:flex;align-items:center;justify-content:flex-end;gap:10px;">
            <div style="background:linear-gradient(145deg,#1a0e04,#2e1c08);border:2px solid #8a6828;border-radius:10px;padding:6px 14px 8px;text-align:center;min-width:80px;box-shadow:0 4px 14px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,200,80,0.1);">
              <div style="font-family:'Cinzel',Georgia,serif;font-size:0.5rem;font-weight:700;color:#a88840;text-transform:uppercase;letter-spacing:0.28em;margin-bottom:2px;">Decks</div>
              <div style="font-family:'Cinzel',Georgia,serif;font-size:2rem;font-weight:900;color:#f0d898;line-height:1;text-shadow:0 2px 8px rgba(0,0,0,0.7);">${totalDecks}</div>
            </div>
            <button id="openModePageBtn"
              style="background:linear-gradient(145deg,#1a0e04,#2e1c08);border:2px solid #8a6828;border-radius:10px;padding:8px 14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;box-shadow:0 4px 14px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,200,80,0.1);transition:all 0.2s;outline:none;min-width:80px;"
              onmouseover="this.style.background='linear-gradient(145deg,#2e1c08,#4a2c10)';this.style.borderColor='#c9932a';"
              onmouseout="this.style.background='linear-gradient(145deg,#1a0e04,#2e1c08)';this.style.borderColor='#8a6828';">
              <div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
                <div style="position:absolute;width:24px;height:2.5px;background:linear-gradient(to right,#8a6828,#d4a84a,#8a6828);border-radius:2px;transform:rotate(45deg);"></div>
                <div style="position:absolute;width:24px;height:2.5px;background:linear-gradient(to right,#8a6828,#d4a84a,#8a6828);border-radius:2px;transform:rotate(-45deg);"></div>
                <div style="width:11px;height:11px;border-radius:50%;background:linear-gradient(135deg,#c9932a,#8B6914);border:2px solid #5a3d15;position:relative;z-index:1;"></div>
              </div>
              <div style="font-family:'Cinzel',Georgia,serif;font-size:0.48rem;font-weight:700;color:#a88840;text-transform:uppercase;letter-spacing:0.13em;white-space:nowrap;">Tactician's View</div>
            </button>
          </div>
        </div>

        <!-- Mobile layout (<640px): compact two-row header -->
        <div class="header-mobile" style="position:relative;display:${window.innerWidth < 640 ? 'flex' : 'none'};flex-direction:column;padding:8px 12px 6px;gap:6px;">
          <!-- Row 1: title left, decks+tactician right -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;flex-direction:column;justify-content:center;min-width:0;">
              <div style="font-family:'Cinzel',Georgia,serif;font-size:1.05rem;font-weight:900;color:#f0d898;letter-spacing:0.08em;line-height:1;text-shadow:0 2px 6px rgba(0,0,0,0.8);">CARD GALLERY</div>
              <div style="font-family:'Noto Serif',Georgia,serif;font-size:0.48rem;color:rgba(200,165,80,0.8);letter-spacing:0.16em;text-transform:uppercase;margin-top:3px;">Quest Board</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
              <!-- Decks badge -->
              <div style="background:linear-gradient(145deg,#1a0e04,#2e1c08);border:2px solid #8a6828;border-radius:8px;padding:3px 10px 4px;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,0.55);">
                <div style="font-family:'Cinzel',Georgia,serif;font-size:0.42rem;font-weight:700;color:#a88840;text-transform:uppercase;letter-spacing:0.2em;">Decks</div>
                <div style="font-family:'Cinzel',Georgia,serif;font-size:1.3rem;font-weight:900;color:#f0d898;line-height:1;text-shadow:0 1px 6px rgba(0,0,0,0.7);">${totalDecks}</div>
              </div>
              <!-- Tactician icon-only button -->
              <button id="openModePageBtn"
                style="background:linear-gradient(145deg,#1a0e04,#2e1c08);border:2px solid #8a6828;border-radius:8px;padding:6px 8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;box-shadow:0 3px 10px rgba(0,0,0,0.55);outline:none;touch-action:manipulation;"
                title="Tactician's View">
                <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
                  <div style="position:absolute;width:20px;height:2px;background:linear-gradient(to right,#8a6828,#d4a84a,#8a6828);border-radius:2px;transform:rotate(45deg);"></div>
                  <div style="position:absolute;width:20px;height:2px;background:linear-gradient(to right,#8a6828,#d4a84a,#8a6828);border-radius:2px;transform:rotate(-45deg);"></div>
                  <div style="width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,#c9932a,#8B6914);border:1.5px solid #5a3d15;position:relative;z-index:1;"></div>
                </div>
                <div style="font-family:'Cinzel',Georgia,serif;font-size:0.38rem;font-weight:700;color:#a88840;text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;">Modes</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private createCardsGrid(): string {
    const cards = this.getCurrentPageCards();
    const duelists = Array.from(new Set(this.state.cards.map(card => card.duelist)));

    // Show empty/welcome state when no guild has been selected yet
    if (this.state.noDeckSelected) {
      return `
        <div class="quest-board rounded-2xl border-4 border-wood-dark shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]"
          style="display:flex;flex-direction:column;flex:1;min-height:0;padding:10px 10px 8px;background:linear-gradient(145deg,#12100a,#1c170d);">
          ${this.createEmptyState()}
          ${this.createBottomControls(true)}
        </div>
      `;
    }
    
    return `
      <div class="quest-board rounded-2xl border-4 border-wood-dark shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]"
        style="display:flex;flex-direction:column;flex:1;min-height:0;padding:10px 10px 8px;">
        <!-- Filter row above cards -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-shrink:0;">
          <span style="font-family:'Cinzel',Georgia,serif;font-size:0.6rem;font-weight:700;color:#c9aa71;text-transform:uppercase;letter-spacing:0.18em;">⚔ Guild</span>
          <select id="duelistFilter" style="background:linear-gradient(135deg,#2a1a06,#3d2810);color:#f0d898;border:2px solid #7d5b35;border-radius:8px;padding:3px 8px;font-family:'Cinzel',Georgia,serif;font-size:0.68rem;cursor:pointer;outline:none;max-width:200px;">
            ${duelists.map(d => `<option value="${d}" style="background:#2a1a06;color:#f0d898;" ${d === this.state.currentDuelist ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        <!-- Cards grid: 2 cols mobile / 6 cols desktop -->
        <div class="cards-grid" style="display:grid;grid-template-columns:repeat(${window.innerWidth < 640 ? 2 : 6},minmax(0,1fr));gap:8px;${window.innerWidth >= 640 ? 'flex:1;min-height:0;align-content:stretch;' : 'align-content:start;'}">
          ${cards.map(card => this.createCard(card)).join('')}
        </div>
        <!-- Bottom nav bar: always visible, never clipped -->
        ${this.createBottomControls()}
      </div>
    `;
  }

  private createCard(card: Card): string {
    const { glowClass } = getRarityColors(card.rarity);
    const lockOverlay = card.locked ? `
      <div class="absolute inset-0 bg-black/70 flex items-center justify-center z-10" style="border-radius:10px 10px 0 0;">
        <span style="font-size:2rem;">🔒</span>
      </div>
    ` : '';

    const tagLabel = card.rarity || '';
    const tagBg = (() => {
      const t = tagLabel.toLowerCase();
      if (t === 'meta') return 'linear-gradient(135deg,#1a5fa8,#2478cc)';
      if (t === 'semi-competitive') return 'linear-gradient(135deg,#a06010,#c87a18)';
      if (t === 'competitive') return 'linear-gradient(135deg,#8a1a1a,#b82828)';
      if (t === 'casual') return 'linear-gradient(135deg,#555,#777)';
      return 'linear-gradient(135deg,#2a7a3a,#389448)'; // rogue
    })();

    const isMobile = window.innerWidth < 640;
    return `
      <div 
        class="card cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:z-10 ${glowClass}"
        data-card-id="${card.id}"
        style="display:flex;flex-direction:column;${isMobile ? '' : 'height:220px;'}border-radius:12px;border:3px solid #7a5a2a;background:#1a1008;box-shadow:0 4px 16px rgba(0,0,0,0.55);overflow:hidden;"
      >
        <!-- Image area -->
        <div style="position:relative;${isMobile ? 'height:140px;' : 'flex:1;min-height:160px;'}overflow:hidden;background:linear-gradient(160deg,#2c1d0e,#1a1008);">

          <!-- Level badge – top-left gold circle -->
          <div style="position:absolute;top:5px;left:5px;z-index:20;width:26px;height:26px;background:linear-gradient(135deg,#c9932a,#8B6914);border:2px solid #3d2510;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',Georgia,serif;font-size:0.72rem;font-weight:900;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.6);">
            ${card.level}
          </div>

          <!-- Tag badge – top-right (rarity), colour-coded -->
          ${tagLabel ? `
          <div style="position:absolute;top:5px;right:5px;z-index:20;background:${tagBg};border:1.5px solid rgba(0,0,0,0.35);border-radius:5px;padding:3px 6px;box-shadow:0 2px 6px rgba(0,0,0,0.5);">
            <span style="font-family:'Cinzel',Georgia,serif;font-size:0.52rem;color:#fff;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;white-space:nowrap;line-height:1;">${tagLabel.replace(/-/g, ' ')}</span>
          </div>
          ` : ''}

          <!-- Card image -->
          <img 
            src="${card.image.startsWith('/') ? '.' + card.image : card.image}"
            alt="${card.name}"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;z-index:0;"
            loading="lazy"
          />

          ${lockOverlay}
        </div>

        <!-- Name strip: parchment below image -->
        <div style="flex-shrink:0;background:linear-gradient(180deg,#f0e0a0 0%,#c8942a 100%);border-top:2px solid #7a5a2a;padding:6px 8px 7px;display:flex;align-items:center;justify-content:center;min-height:38px;box-shadow:inset 0 2px 6px rgba(0,0,0,0.15);">
          <div title="${card.name}" style="font-family:'Cinzel','Noto Serif',Georgia,serif;font-size:0.72rem;font-weight:700;color:#1e0a00;text-align:center;line-height:1.25;letter-spacing:0.04em;width:100%;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;text-shadow:0 1px 1px rgba(255,220,120,0.4);">
            ${card.name}
          </div>
        </div>
      </div>
    `;
  }

  private createEmptyState(): string {
    const duelists = Array.from(new Set(this.state.cards.map(card => card.duelist)));
    return `
      <div style="display:flex;flex:1;min-height:0;gap:16px;padding:6px 4px;flex-wrap:wrap;">

        <!-- LEFT SIDEBAR: scroll icon + player deck panel with guild selector -->
        <div class="empty-sidebar" style="width:${window.innerWidth < 640 ? '100%' : '190px'};flex-shrink:0;display:flex;flex-direction:column;gap:8px;${window.innerWidth < 640 ? 'flex:1 1 100%;' : 'flex:0 0 190px;'}">

          <!-- Decorative icon -->
          <div style="display:flex;justify-content:flex-start;padding:0 8px;">
            <div style="width:58px;height:58px;background:linear-gradient(135deg,#8B6914,#c9932a,#8B6914);border:2px solid #5a3d15;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.55),inset 0 2px 6px rgba(255,200,80,0.2);">
              <span style="font-size:1.6rem;line-height:1;">📜</span>
            </div>
          </div>

          <!-- Player Deck parchment scroll panel -->
          <div style="flex:1;background:linear-gradient(170deg,#f2dfa8 0%,#e0c47a 50%,#d4b86a 100%);border:3px solid #8a6030;border-radius:12px;overflow:hidden;box-shadow:0 6px 22px rgba(0,0,0,0.45),inset 0 0 24px rgba(0,0,0,0.1);position:relative;">
            <!-- Top scroll curl -->
            <div style="position:absolute;top:-4px;left:10px;right:10px;height:10px;background:radial-gradient(ellipse at center,rgba(255,240,180,0.8),transparent);border-radius:50%;pointer-events:none;"></div>

            <!-- Header bar -->
            <div style="background:linear-gradient(135deg,#3a2010,#5a3820,#3a2010);border-bottom:2px solid #7a5020;padding:7px 12px;text-align:center;">
              <span style="font-family:'Cinzel',Georgia,serif;font-size:0.68rem;font-weight:700;color:#f0d898;letter-spacing:0.20em;text-transform:uppercase;text-shadow:0 1px 4px rgba(0,0,0,0.6);">Player Deck</span>
            </div>

            <!-- Content -->
            <div style="padding:12px 14px 16px;">
              <div style="font-family:'Noto Serif',Georgia,serif;font-size:0.72rem;color:#5a3010;font-style:italic;margin-bottom:12px;">No Deck Selected</div>

              <!-- Guild Roster selector -->
              <div>
                <div style="font-family:'Cinzel',Georgia,serif;font-size:0.52rem;font-weight:700;color:#7a4820;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:5px;">⚔ Guild Roster</div>
                <select id="duelistFilter"
                  style="width:100%;background:linear-gradient(145deg,#f8eac8,#e8cf80);border:2px solid #9a7030;border-radius:7px;padding:5px 8px;font-family:'Noto Serif',Georgia,serif;font-size:0.7rem;color:#3b1f00;outline:none;cursor:pointer;box-shadow:inset 0 2px 4px rgba(0,0,0,0.12);">
                  <option value="" disabled selected style="color:#8a6030;font-style:italic;">— Please select —</option>
                  ${duelists.map(d => `<option value="${d}" style="color:#3b1f00;">${d}</option>`).join('')}
                </select>
              </div>

              <!-- Scroll ruled lines decoration -->
              <div style="margin-top:14px;display:flex;flex-direction:column;gap:9px;">
                ${Array.from({length: 5}).map(() => `
                  <div style="height:1.5px;background:linear-gradient(to right,transparent,rgba(90,48,16,0.25),transparent);border-radius:1px;"></div>
                `).join('')}
              </div>
            </div>

            <!-- Bottom scroll curl -->
            <div style="position:absolute;bottom:-4px;left:10px;right:10px;height:10px;background:radial-gradient(ellipse at center,rgba(180,130,40,0.4),transparent);border-radius:50%;pointer-events:none;"></div>
          </div>

          <!-- Decorative bottom flourish -->
          <div style="text-align:left;padding-left:10px;opacity:0.35;">
            <div style="font-size:2.2rem;color:#8a6a30;line-height:1;transform:scaleX(-1);display:inline-block;">❧</div>
          </div>
        </div>

        <!-- CENTER: Glowing face-down card back (hidden on mobile) -->
        <div class="empty-center" style="flex:1;display:${window.innerWidth < 640 ? 'none' : 'flex'};align-items:center;justify-content:center;">
          <div style="position:relative;width:150px;height:210px;">
            <!-- Outer ambient glow -->
            <div style="position:absolute;inset:-20px;border-radius:24px;background:radial-gradient(ellipse at center,rgba(180,140,30,0.28) 0%,transparent 65%);animation:pulse-legendary 2.5s ease-in-out infinite;pointer-events:none;"></div>
            <!-- Card body -->
            <div style="position:relative;width:100%;height:100%;background:linear-gradient(150deg,#1c1508,#2e2210,#1c1508);border:3px solid #9a7828;border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 36px rgba(180,140,30,0.28),0 10px 30px rgba(0,0,0,0.65),inset 0 0 24px rgba(0,0,0,0.5);">
              <!-- Inner decorative border -->
              <div style="position:absolute;inset:7px;border:2px solid rgba(180,140,40,0.35);border-radius:9px;pointer-events:none;"></div>
              <!-- Millennium Puzzle symbol: triangle with eye -->
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <!-- Outer triangle (CSS clip-path) -->
                <div style="position:relative;width:72px;height:72px;display:flex;align-items:center;justify-content:center;">
                  <!-- Triangle background -->
                  <svg width="72" height="72" viewBox="0 0 72 72" style="position:absolute;top:0;left:0;filter:drop-shadow(0 0 10px rgba(180,140,30,0.5));">
                    <!-- Outer gold triangle (point DOWN) -->
                    <polygon points="4,8 68,8 36,68" fill="url(#goldGrad)" stroke="rgba(220,180,60,0.8)" stroke-width="2"/>
                    <!-- Inner dark cutout -->
                    <polygon points="12,14 60,14 36,56" fill="#1a1206"/>
                    <!-- Top-left puzzle piece -->
                    <polygon points="16,14 34,14 24,32" fill="url(#goldGrad2)"/>
                    <!-- Top-right puzzle piece -->
                    <polygon points="38,14 56,14 48,32" fill="url(#goldGrad2)"/>
                    <!-- Bottom piece -->
                    <polygon points="26,44 46,44 36,62" fill="url(#goldGrad2)"/>
                    <!-- Center ring for eye -->
                    <circle cx="36" cy="28" r="10" fill="#1a1206" stroke="rgba(200,160,40,0.6)" stroke-width="1.5"/>
                    <!-- Eye iris -->
                    <ellipse cx="36" cy="28" rx="5" ry="4" fill="rgba(200,160,40,0.7)"/>
                    <!-- Eye pupil -->
                    <circle cx="36" cy="28" r="2" fill="#1a1206"/>
                    <!-- Eye highlight -->
                    <circle cx="38" cy="26" r="1" fill="rgba(255,230,120,0.6)"/>
                    <defs>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#c9932a"/>
                        <stop offset="50%" style="stop-color:#e8b840"/>
                        <stop offset="100%" style="stop-color:#8B6914"/>
                      </linearGradient>
                      <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#d4a030"/>
                        <stop offset="100%" style="stop-color:#9a7020"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: WANTED poster -->
        <div class="empty-wanted" style="width:${window.innerWidth < 640 ? '100%' : '270px'};flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:4px 0;${window.innerWidth < 640 ? 'flex:1 1 100%;' : 'flex:0 0 270px;'}max-width:100%;">
          <div style="position:relative;background:linear-gradient(165deg,#f8edc0 0%,#edd998 40%,#f2e0a0 70%,#e4cc80 100%);border:3px solid #9a7030;border-radius:6px;padding:26px 24px 30px;box-shadow:0 10px 32px rgba(0,0,0,0.6),inset 0 0 40px rgba(0,0,0,0.07);width:100%;max-width:250px;">

            <!-- Corner bolt screws (4 corners) -->
            ${['top:7px;left:7px','top:7px;right:7px','bottom:7px;left:7px','bottom:7px;right:7px'].map(() => `
              <div style="position:absolute;${['top:7px;left:7px','top:7px;right:7px','bottom:7px;left:7px','bottom:7px;right:7px'][0]};width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#c8950a,#6a3c0c);border:1.5px solid #3d2008;box-shadow:0 2px 4px rgba(0,0,0,0.55);"></div>
            `).join('')}
            <div style="position:absolute;top:7px;left:7px;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#c8950a,#6a3c0c);border:1.5px solid #3d2008;box-shadow:0 2px 4px rgba(0,0,0,0.55);"></div>
            <div style="position:absolute;top:7px;right:7px;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#c8950a,#6a3c0c);border:1.5px solid #3d2008;box-shadow:0 2px 4px rgba(0,0,0,0.55);"></div>
            <div style="position:absolute;bottom:7px;left:7px;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#c8950a,#6a3c0c);border:1.5px solid #3d2008;box-shadow:0 2px 4px rgba(0,0,0,0.55);"></div>
            <div style="position:absolute;bottom:7px;right:7px;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#c8950a,#6a3c0c);border:1.5px solid #3d2008;box-shadow:0 2px 4px rgba(0,0,0,0.55);"></div>

            <!-- WANTED heading -->
            <div style="font-family:'Cinzel',Georgia,serif;font-size:2rem;font-weight:900;color:#1e0a00;text-align:center;letter-spacing:0.06em;line-height:1;margin-bottom:12px;text-shadow:1px 1px 0 rgba(255,255,255,0.25);">WANTED</div>

            <!-- Top rule -->
            <div style="height:2px;background:linear-gradient(to right,transparent,#7a5018,transparent);margin-bottom:14px;opacity:0.55;"></div>

            <!-- Body italic text -->
            <div style="font-family:'Noto Serif',Georgia,serif;font-size:0.88rem;color:#3a1800;text-align:center;line-height:1.7;font-style:italic;">
              Summon your strategy!<br/>
              Select a Guild Roster<br/>
              from the scrolls to<br/>
              unseal your arsenal.
            </div>

            <!-- Wax seal -->
            <div style="display:flex;justify-content:center;margin-top:20px;">
              <div style="position:relative;width:68px;height:68px;">
                <!-- Ribbon tails -->
                <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);display:flex;gap:6px;">
                  <div style="width:10px;height:16px;background:#8a2010;border-radius:0 0 3px 3px;transform:rotate(-10deg);"></div>
                  <div style="width:10px;height:16px;background:#8a2010;border-radius:0 0 3px 3px;transform:rotate(10deg);"></div>
                </div>
                <!-- Seal disc -->
                <div style="width:68px;height:68px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#d87840,#8a3018,#5a1a08);border:3px solid #3a1006;box-shadow:0 4px 14px rgba(0,0,0,0.55),inset 0 3px 8px rgba(255,120,40,0.2),inset 0 -3px 6px rgba(0,0,0,0.4);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;">
                  <div style="font-size:1rem;opacity:0.75;line-height:1;">🏺</div>
                  <div style="font-family:'Cinzel',Georgia,serif;font-size:0.4rem;font-weight:900;color:rgba(255,220,180,0.92);text-transform:uppercase;letter-spacing:0.14em;">CLOSED</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  private createBottomControls(hidePaging = false): string {
    const totalPages = this.getTotalPages();
    const currentPageDisplay = totalPages === 0 ? 1 : this.state.currentPage + 1;
    const totalPagesDisplay = totalPages === 0 ? 1 : totalPages;
    const hasPrev = !hidePaging && this.state.currentPage > 0;
    const hasNext = !hidePaging && this.state.currentPage < totalPages - 1;

    const dots = Array.from({ length: Math.max(1, totalPages) }, (_, i) => {
      const active = i === this.state.currentPage || totalPages === 0;
      return `<div style="width:${active ? '20px' : '9px'};height:9px;border-radius:5px;background:${active ? '#d4af70' : 'rgba(212,175,112,0.3)'};border:1.5px solid rgba(180,130,50,0.5);transition:all 0.25s;flex-shrink:0;"></div>`;
    }).join('');

    const arrowBtn = (id: string, symbol: string, enabled: boolean) =>
      `<button id="${id}"
        style="flex-shrink:0;width:40px;height:40px;border-radius:50%;border:2px solid ${enabled ? '#9a6f30' : '#3a2818'};background:linear-gradient(135deg,${enabled ? '#5a3010,#7a4820' : '#1e1208,#2a1a0a'});display:flex;align-items:center;justify-content:center;cursor:${enabled ? 'pointer' : 'default'};opacity:${enabled ? '1' : '0.3'};color:#d4af70;font-size:0.85rem;box-shadow:${enabled ? '0 3px 10px rgba(0,0,0,0.5),inset 0 1px 3px rgba(255,200,80,0.15)' : 'none'};transition:all 0.2s;outline:none;touch-action:manipulation;"
        ${!enabled ? 'disabled' : ''}
        title="${id === 'prevBtn' ? 'Previous' : 'Next'}"
      >${symbol}</button>`;

    const pagingSection = hidePaging ? `<div style="flex:1;"></div>` : `
      <!-- Far-left small arrow -->
      <button style="flex-shrink:0;width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(120,80,30,0.5);background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:rgba(212,175,112,0.6);font-size:0.65rem;cursor:default;opacity:0.5;outline:none;" disabled>&#9664;</button>
      ${arrowBtn('prevBtn', '&#9664;', hasPrev)}
      <!-- Centre: Page X of Y + dots -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="display:flex;align-items:center;gap:6px;">${dots}</div>
        <div style="font-family:'Cinzel',Georgia,serif;font-size:0.6rem;font-weight:600;color:rgba(212,175,112,0.8);letter-spacing:0.12em;">
          Page <span style="color:#f0d898;font-weight:900;">${currentPageDisplay}</span> of <span style="color:#f0d898;font-weight:900;">${totalPagesDisplay}</span>
        </div>
      </div>
      ${arrowBtn('nextBtn', '&#9654;', hasNext)}
      <!-- Far-right small arrow -->
      <button style="flex-shrink:0;width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(120,80,30,0.5);background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:rgba(212,175,112,0.6);font-size:0.65rem;cursor:default;opacity:0.5;outline:none;" disabled>&#9654;</button>
    `;

    return `
      <div class="bottom-controls" style="flex-shrink:0;display:flex;flex-wrap:wrap;align-items:center;padding:6px 2px 2px;gap:6px;background:linear-gradient(to top,rgba(0,0,0,0.2),transparent);border-top:1px solid rgba(120,80,30,0.3);margin-top:6px;">
        ${pagingSection}
        <!-- Coins + quest board + sparkle -->
        <div style="display:flex;align-items:center;gap:5px;${hidePaging ? '' : 'margin-left:4px;'}flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:2px;background:rgba(0,0,0,0.45);border:1.5px solid rgba(160,110,40,0.5);border-radius:12px;padding:4px 10px;">
            <span style="font-size:0.95rem;">🪙</span>
            <span style="font-size:0.65rem;color:#d4af70;font-weight:700;">${this.state.goldAmount ?? 0}</span>
          </div>
          <button id="goToQuestBoard"
            title="Quest Board"
            style="background:linear-gradient(135deg,#3d2510,#5a3820);border:2px solid #c9932a;border-radius:8px;padding:6px 11px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.45),inset 0 1px 3px rgba(255,200,80,0.15);transition:all 0.2s;outline:none;touch-action:manipulation;"
            onmouseover="this.style.background='linear-gradient(135deg,#5a3820,#7a4e28)';this.style.borderColor='#f0d898';"
            onmouseout="this.style.background='linear-gradient(135deg,#3d2510,#5a3820)';this.style.borderColor='#c9932a';">
            <span style="font-size:0.9rem;">🏠</span>
          </button>
          <div style="background:rgba(0,0,0,0.4);border:1.5px solid rgba(160,110,40,0.4);border-radius:8px;padding:5px 9px;cursor:pointer;">
            <span style="font-size:0.9rem;">✨</span>
          </div>
        </div>
      </div>
    `;
  }

  render(): void {
    if (this.state.page === 'gallery') {
      this.appElement.innerHTML = `
        <div class="gallery-container w-full max-w-6xl mx-auto p-4" style="display:flex;flex-direction:column;height:calc(100vh - 2rem);overflow:hidden;">
          ${this.createHeader()}
          <div style="flex:1;min-height:0;display:flex;flex-direction:column;">
            ${this.createCardsGrid()}
          </div>
        </div>
      `;
    } else if (this.state.page === 'modes') {
      this.appElement.innerHTML = `
        <div class="gallery-container w-full max-w-6xl mx-auto p-4" style="display:flex;flex-direction:column;height:calc(100vh - 2rem);overflow:hidden;">
          ${this.createHeader()}
          <div class="quest-board rounded-2xl border-4 border-wood-dark" style="flex:1;min-height:0;overflow-y:auto;padding:16px;margin-top:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <div>
                <div style="font-family:'Cinzel',Georgia,serif;font-size:1.4rem;font-weight:900;color:#f0d898;letter-spacing:0.1em;">Game Modes</div>
                <div style="font-family:'Noto Serif',Georgia,serif;font-size:0.75rem;color:rgba(240,216,152,0.75);margin-top:4px;">Manage your mode rules and tournament settings.</div>
              </div>
              <button id="backToGallery"
                style="background:linear-gradient(135deg,#5a3010,#7a4820);border:2px solid #c9932a;border-radius:10px;padding:8px 16px;cursor:pointer;color:#f0d898;font-family:'Cinzel',Georgia,serif;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;box-shadow:0 4px 12px rgba(0,0,0,0.45);outline:none;"
                onmouseover="this.style.background='linear-gradient(135deg,#7a4820,#9a5e28)';"
                onmouseout="this.style.background='linear-gradient(135deg,#5a3010,#7a4820)';">
                ⚔ Quest Board
              </button>
            </div>
            ${this.modeController.renderModePanel(this.state.modes, this.state.currentModeId, this.state.editingModeId, this.state.isDeveloper)}
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
        if (!value) return; // ignore the "Please select" placeholder
        this.state.currentDuelist = value;
        this.state.currentPage = 0;
        this.state.noDeckSelected = false;
        const filtered = this.state.cards.filter(card => card.duelist === value);
        this.state.displayCards = this.shuffleCards(filtered);
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

    

    const decklistSelect = this.appElement.querySelector('#decklistSelect') as HTMLSelectElement | null;
    if (decklistSelect) {
      decklistSelect.addEventListener('change', (e) => {
        const selectedId = parseInt((e.target as HTMLSelectElement).value, 10);
        if (!Number.isNaN(selectedId)) {
          this.state.selectedDecklistId = selectedId;
          this.render();
          this.attachEventListeners();
        }
      });
    }

    // Pagination buttons
    const prevBtn = this.appElement.querySelector('#prevBtn');
    const nextBtn = this.appElement.querySelector('#nextBtn');

    prevBtn?.addEventListener('click', () => this.previousPage());
    nextBtn?.addEventListener('click', () => this.nextPage());

    // Quest Board button - return to empty/welcome state
    const questBoardBtn = this.appElement.querySelector('#goToQuestBoard');
    questBoardBtn?.addEventListener('click', () => {
      this.state.noDeckSelected = true;
      this.state.currentDuelist = '';
      this.state.displayCards = this.state.cards;
      this.state.currentPage = 0;
      this.render();
      this.attachEventListeners();
    });
  }

  // changeFilter removed, no filtering

  private handleCardClick(cardId: number): void {
    const card = this.state.cards.find(c => c.id === cardId);
    if (card) {
      const matches = this.getDecklistsForCard(card);
      this.state.selectedCard = card;
      this.state.selectedDecklistId = matches[0]?.id;
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

  private getDecklistsForCard(card: Card): Decklist[] {
    return decklistsData.filter((d: Decklist) => d.cardName === card.name && d.duelist === card.duelist);
  }

  private getSelectedDecklist(card: Card): Decklist | undefined {
    const matches = this.getDecklistsForCard(card);
    if (matches.length === 0) {
      return undefined;
    }

    if (this.state.selectedDecklistId) {
      const selected = matches.find(d => d.id === this.state.selectedDecklistId);
      if (selected) {
        return selected;
      }
    }

    return matches[0];
  }

  private createDecklistPage(card: Card): string {
    const decklists = this.getDecklistsForCard(card);
    const decklist = this.getSelectedDecklist(card);
    return `
      <div class="gallery-container w-full max-w-6xl mx-auto" style="display:flex;flex-direction:column;height:calc(100vh - 2rem);overflow:hidden;padding:1rem;">

        <!-- Header bar matching gallery style -->
        <div style="flex-shrink:0;background:linear-gradient(135deg,#2a1a0a,#3d2510,#2a1a0a);border:4px solid #6b4a28;border-radius:16px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;flex-wrap:wrap;gap:10px;box-shadow:0 6px 20px rgba(0,0,0,0.5);">
          <!-- Back button -->
          <button id="backToGallery"
            style="flex-shrink:0;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#5a3010,#7a4820);border:2px solid #c9932a;border-radius:10px;padding:8px 14px;cursor:pointer;color:#f0d898;font-family:'Cinzel',Georgia,serif;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;box-shadow:0 4px 12px rgba(0,0,0,0.45),inset 0 1px 3px rgba(255,200,80,0.15);transition:all 0.2s;touch-action:manipulation;"
            onmouseover="this.style.background='linear-gradient(135deg,#7a4820,#9a5e28)';this.style.borderColor='#f0d898';"
            onmouseout="this.style.background='linear-gradient(135deg,#5a3010,#7a4820)';this.style.borderColor='#c9932a';">
            <span style="font-size:1rem;">⚔</span>
            <span>Quest Board</span>
          </button>

          <!-- Title -->
          <div style="flex:1;text-align:center;min-width:120px;">
            <div style="font-family:'Cinzel',Georgia,serif;font-size:clamp(0.85rem,3vw,1.5rem);font-weight:900;color:#f0d898;letter-spacing:0.10em;text-shadow:0 2px 8px rgba(0,0,0,0.8);">${card.name}</div>
            <div style="font-family:'Noto Serif',Georgia,serif;font-size:0.6rem;color:rgba(240,216,152,0.75);letter-spacing:0.18em;text-transform:uppercase;margin-top:3px;">Duelist: ${card.duelist}</div>
          </div>

          <!-- Deck selector (if multiple) -->
          ${decklists.length > 1 ? `
            <div style="flex-shrink:0;display:flex;align-items:center;gap:8px;">
              <span style="font-family:'Cinzel',Georgia,serif;font-size:0.58rem;font-weight:700;color:#c9aa71;text-transform:uppercase;letter-spacing:0.15em;white-space:nowrap;">Deck</span>
              <select id="decklistSelect"
                style="background:linear-gradient(135deg,#2a1a06,#3d2810);color:#f0d898;border:2px solid #7a5a28;border-radius:8px;padding:5px 10px;font-family:'Cinzel',Georgia,serif;font-size:0.65rem;cursor:pointer;outline:none;box-shadow:0 2px 6px rgba(0,0,0,0.4);">
                ${decklists.map(deck => `<option value="${deck.id}" style="background:#2a1a06;color:#f0d898;" ${deck.id === decklist?.id ? 'selected' : ''}>${deck.title}</option>`).join('')}
              </select>
            </div>
          ` : ''}
        </div>

        <!-- Decklist content area -->
        <div style="flex:1;min-height:0;background:linear-gradient(145deg,#1a1208,#251a0c);border:4px solid #6b4a28;border-radius:16px;display:flex;align-items:center;justify-content:center;padding:16px;box-shadow:inset 0 0 30px rgba(0,0,0,0.4);">
          ${!decklist ? `
            <div style="font-family:'Cinzel',Georgia,serif;font-size:1.2rem;color:#c9aa71;text-align:center;opacity:0.7;">
              <div style="font-size:2rem;margin-bottom:8px;">📜</div>
              No decklist found for this card.
            </div>
          ` : `
            <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;gap:10px;">
              <div style="font-family:'Cinzel',Georgia,serif;font-size:1rem;font-weight:700;color:#f0d898;letter-spacing:0.1em;text-shadow:0 2px 6px rgba(0,0,0,0.6);">${decklist.title}</div>
              <div style="flex:1;min-height:0;width:100%;max-width:900px;background:linear-gradient(145deg,#f2dfa8,#e0c47a,#d4b86a);border:3px solid #8a6030;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
                <img src="${decklist.image.startsWith('/') ? '.' + decklist.image : decklist.image}"
                  alt="${decklist.title}"
                  style="width:100%;height:100%;object-fit:contain;display:block;" />
              </div>
            </div>
          `}
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
