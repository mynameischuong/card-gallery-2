import type { GameMode } from './types';

export class ModeController {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  getCurrentMode(modes: GameMode[], currentModeId: number): GameMode | undefined {
    return modes.find(mode => mode.id === currentModeId);
  }

  renderModePanel(modes: GameMode[], currentModeId: number, editingModeId: number | undefined, isDeveloper: boolean): string {
    const currentMode = this.getCurrentMode(modes, currentModeId);
    const editingMode = editingModeId ? this.getCurrentMode(modes, editingModeId) : undefined;
    const rulesHtml = currentMode?.rules ? currentMode.rules.replace(/\n/g, '<br/>') : 'No active rules yet.';
    const formTitle = editingMode ? 'Edit Mode' : 'Add New Mode';
    const submitText = editingMode ? 'Update Mode' : 'Create Mode';
    const hasMode = Boolean(currentMode);

    const actionButtons = isDeveloper ? `
            <div class="flex flex-wrap gap-3 mb-4">
              <button type="button" id="editModeBtn" class="inline-flex items-center justify-center gap-2 text-yellow-950 bg-yellow-200 hover:bg-yellow-300 px-3 py-2 rounded-2xl border-2 border-yellow-500 shadow-lg transition duration-200 ${!hasMode ? 'opacity-50 cursor-not-allowed' : ''}" ${!hasMode ? 'disabled' : ''}>✏️ Edit Mode</button>
              <button type="button" id="deleteModeBtn" class="inline-flex items-center justify-center gap-2 text-yellow-950 bg-red-200 hover:bg-red-300 px-3 py-2 rounded-2xl border-2 border-red-500 shadow-lg transition duration-200 ${!hasMode ? 'opacity-50 cursor-not-allowed' : ''}" ${!hasMode ? 'disabled' : ''}>🗑️ Delete Mode</button>
            </div>
          ` : `
            <div class="text-sm text-yellow-200 mb-4">Developer access required to manage modes.</div>
          `;

    const modeForm = isDeveloper ? `
          <form id="addModeForm" class="w-full lg:w-[360px] bg-gradient-to-br from-yellow-100/20 to-yellow-100/10 border-2 border-yellow-600 rounded-3xl p-5 shadow-lg backdrop-blur-sm">
            <div class="text-xl font-bold text-yellow-100 mb-4 font-fantasy">${formTitle}</div>
            <input type="hidden" id="editingModeId" value="${editingMode?.id ?? ''}" />
            <label class="block text-yellow-200 text-sm font-semibold mb-2" for="modeName">Mode Name</label>
            <input id="modeName" value="${editingMode?.name ?? ''}" class="w-full rounded-2xl border-2 border-yellow-500 bg-yellow-50 px-4 py-2 text-yellow-900 font-bold outline-none focus:border-yellow-400" placeholder="e.g. Tribal Tournament" />
            <label class="block text-yellow-200 text-sm font-semibold mt-4 mb-2" for="modeRules">Rules</label>
            <textarea id="modeRules" rows="4" class="w-full rounded-2xl border-2 border-yellow-500 bg-yellow-50 px-4 py-2 text-yellow-900 font-bold outline-none focus:border-yellow-400" placeholder="Add mode rules here...">${editingMode?.rules ?? ''}</textarea>
            <button type="submit" class="mt-4 w-full rounded-2xl bg-yellow-600 text-yellow-950 font-bold py-3 shadow-lg hover:bg-yellow-500 transition">${submitText}</button>
            ${editingMode ? '<button type="button" id="cancelModeEditBtn" class="mt-3 w-full rounded-2xl bg-yellow-200 text-yellow-950 font-bold py-3 shadow-lg hover:bg-yellow-300 transition">Cancel Edit</button>' : ''}
          </form>
        ` : `
          <div class="w-full lg:w-[360px] bg-gradient-to-br from-yellow-100/20 to-yellow-100/10 border-2 border-yellow-600 rounded-3xl p-5 shadow-lg backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div class="text-xl font-bold text-yellow-100 mb-2 font-fantasy">Mode Viewer</div>
            <div class="text-yellow-200 text-sm text-center">Viewing only. Developer access is required to create, edit, or delete modes.</div>
            <button type="button" id="developerLoginBtn" class="mt-4 inline-flex items-center justify-center gap-2 text-yellow-950 bg-yellow-200 hover:bg-yellow-300 px-4 py-3 rounded-2xl border-2 border-yellow-500 shadow-lg transition">🔐 Developer Login</button>
          </div>
        `;

    return `
      <div class="mode-panel mb-6 rounded-3xl border-4 border-yellow-700 p-6 bg-gradient-to-br from-yellow-900/30 via-yellow-800/25 to-yellow-900/30 shadow-2xl text-yellow-100">
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="flex-1 bg-yellow-900/10 rounded-3xl border-2 border-yellow-600 p-5 shadow-inner">
            <div class="text-xl font-bold text-yellow-100 mb-2 font-fantasy">Current Game Mode</div>
            <div class="text-3xl font-extrabold text-yellow-200 mb-4 font-fantasy">${currentMode?.name ?? 'No mode selected'}</div>
            <label class="block text-yellow-200 text-sm font-semibold mb-2" for="modeSelect">Choose Mode</label>
            <select id="modeSelect" class="mb-4 w-full rounded-2xl border-2 border-yellow-500 bg-white px-4 py-2 text-yellow-900 font-bold outline-none focus:border-yellow-400">
              ${modes.map(mode => `<option value="${mode.id}" ${mode.id === currentModeId ? 'selected' : ''}>${mode.name}</option>`).join('')}
            </select>
            <button type="button" id="copyModeLinkBtn" class="mb-4 inline-flex items-center justify-center gap-2 text-yellow-950 bg-emerald-200 hover:bg-emerald-300 px-3 py-2 rounded-2xl border-2 border-emerald-500 shadow-lg transition duration-200 ${!hasMode ? 'opacity-50 cursor-not-allowed' : ''}" ${!hasMode ? 'disabled' : ''}>🔗 Copy Share Link</button>
            ${actionButtons}
            <div class="text-sm text-yellow-200"><span class="font-bold">Rules:</span><br/>${rulesHtml}</div>
          </div>

          ${modeForm}
        </div>
      </div>
    `;
  }

  attachModeListeners(
    modes: GameMode[],
    currentModeId: number,
    isDeveloper: boolean,
    onDeveloperLogin: () => void,
    onModeChange: (modeId: number) => void,
    onModeCreate: (mode: GameMode) => void,
    onModeUpdate: (mode: GameMode) => void,
    onModeDelete: (modeId: number) => void,
    onModeEditStart: (modeId: number) => void,
    onModeCancelEdit: () => void,
    onModeShare: (mode: GameMode) => void,
  ): void {
    const modeSelect = this.root.querySelector('#modeSelect') as HTMLSelectElement | null;
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        const selectedId = parseInt((e.target as HTMLSelectElement).value, 10);
        if (!Number.isNaN(selectedId)) {
          onModeChange(selectedId);
        }
      });
    }

    const developerLoginBtn = this.root.querySelector('#developerLoginBtn') as HTMLButtonElement | null;
    if (developerLoginBtn) {
      developerLoginBtn.addEventListener('click', () => {
        onDeveloperLogin();
      });
    }

    const editModeBtn = this.root.querySelector('#editModeBtn') as HTMLButtonElement | null;
    if (editModeBtn && isDeveloper) {
      editModeBtn.addEventListener('click', () => {
        if (!modeSelect) {
          return;
        }
        const selectedId = parseInt(modeSelect.value, 10);
        if (!Number.isNaN(selectedId)) {
          onModeEditStart(selectedId);
        }
      });
    }

    const deleteModeBtn = this.root.querySelector('#deleteModeBtn') as HTMLButtonElement | null;
    if (deleteModeBtn && isDeveloper) {
      deleteModeBtn.addEventListener('click', () => {
        if (!modeSelect) {
          return;
        }
        const selectedId = parseInt(modeSelect.value, 10);
        if (!Number.isNaN(selectedId)) {
          onModeDelete(selectedId);
        }
      });
    }

    const cancelEditBtn = this.root.querySelector('#cancelModeEditBtn') as HTMLButtonElement | null;
    if (cancelEditBtn && isDeveloper) {
      cancelEditBtn.addEventListener('click', () => {
        onModeCancelEdit();
      });
    }

    const addModeForm = this.root.querySelector('#addModeForm') as HTMLFormElement | null;
    if (addModeForm) {
      addModeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = this.root.querySelector('#modeName') as HTMLInputElement | null;
        const rulesInput = this.root.querySelector('#modeRules') as HTMLTextAreaElement | null;
        const editingModeIdInput = this.root.querySelector('#editingModeId') as HTMLInputElement | null;

        if (!nameInput || !rulesInput) {
          return;
        }

        const name = nameInput.value.trim();
        const rules = rulesInput.value.trim();

        if (!name || !rules) {
          return;
        }

        const editingModeId = editingModeIdInput && editingModeIdInput.value ? parseInt(editingModeIdInput.value, 10) : NaN;
        if (!Number.isNaN(editingModeId)) {
          onModeUpdate({ id: editingModeId, name, description: '', rules });
          return;
        }

        const nextModeId = Math.max(0, ...modes.map(m => m.id)) + 1;
        onModeCreate({ id: nextModeId, name, description: '', rules });
      });
    }

    const copyModeLinkBtn = this.root.querySelector('#copyModeLinkBtn') as HTMLButtonElement | null;
    if (copyModeLinkBtn) {
      copyModeLinkBtn.addEventListener('click', () => {
        const currentMode = this.getCurrentMode(modes, currentModeId);
        if (currentMode) {
          onModeShare(currentMode);
        }
      });
    }
  }
}
