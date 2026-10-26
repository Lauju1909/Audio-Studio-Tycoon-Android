/**
 * Audio Studio Tycoon - Modals Controller
 */

function closeAllModals() {
  const openModals = document.querySelectorAll('.modal-overlay');
  if (openModals) {
    openModals.forEach(m => m.style.display = 'none');
  }
}

// Development Modal
function openDevModal() {
  if (StudioState.activeProject) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(StudioState.language === 'en' ? 'A game is already in development! Finish it first.' : 'Es wird bereits ein Spiel entwickelt! Schließe das aktuelle Projekt erst ab.');
    }
    return;
  }

  const engineSelect = document.getElementById('select-engine');
  if (engineSelect) {
    engineSelect.innerHTML = '';
    StudioState.customEngines.forEach(eng => {
      const opt = document.createElement('option');
      opt.value = eng.id;
      opt.textContent = `${eng.name} (+${eng.audioBonus} Audio, +${eng.techBonus} Tech)`;
      engineSelect.appendChild(opt);
    });
  }

  const staffContainer = document.getElementById('dev-staff-selection');
  if (staffContainer) {
    staffContainer.innerHTML = '';
    if (StudioState.staff.length === 0) {
      staffContainer.innerHTML = `<p class="empty-hint">${StudioState.language === 'en' ? 'No staff hired. Solo development.' : 'Keine Mitarbeiter angestellt. Alleinentwicklung.'}</p>`;
    } else {
      StudioState.staff.forEach(emp => {
        const isVacation = emp.onVacationWeeks > 0;
        const roleName = emp.role === 'sound' ? (StudioState.language === 'en' ? 'Sound Designer' : 'Audio-Designer') :
                         emp.role === 'coder' ? (StudioState.language === 'en' ? 'Programmer' : 'Programmierer') : (StudioState.language === 'en' ? 'Writer' : 'Autor');
        const div = document.createElement('label');
        div.className = 'staff-checkbox-item';
        div.innerHTML = `
          <input type="checkbox" name="dev-staff" value="${emp.id}" ${isVacation ? 'disabled' : 'checked'}>
          <span><strong>${emp.name}</strong> (${roleName}) - ${isVacation ? (StudioState.language === 'en' ? 'On Vacation' : 'Im Urlaub') : `Erschöpfung: ${emp.fatigue}%`}</span>
        `;
        staffContainer.appendChild(div);
      });
    }
  }

  const modal = document.getElementById('modal-dev');
  if (modal) modal.style.display = 'flex';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.vibrate(25);
    AudioEngine.speak(StudioState.language === 'en' ? 'Design new game. Choose title, theme, genre, engine and staff.' : 'Neues Spiel konzipieren. Wähle Titel, Thema, Genre, Engine und Team.');
  }
}

function closeDevModal() {
  const modal = document.getElementById('modal-dev');
  if (modal) modal.style.display = 'none';
}

// Research Modal
function openResearchModal() {
  const modal = document.getElementById('modal-research');
  if (modal) modal.style.display = 'flex';
  if (typeof renderResearchList === 'function') renderResearchList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(StudioState.language === 'en' ? 'Research laboratory opened.' : 'Forschungslabor geöffnet.');
  }
}

function closeResearchModal() {
  const modal = document.getElementById('modal-research');
  if (modal) modal.style.display = 'none';
}

// Engine Workshop Modal
function openEngineModal() {
  const modal = document.getElementById('modal-engine');
  if (modal) modal.style.display = 'flex';
  if (typeof renderEngineList === 'function') renderEngineList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(StudioState.language === 'en' ? 'Custom Engine Workshop opened.' : 'Engine-Werkstatt geöffnet.');
  }
}

function closeEngineModal() {
  const modal = document.getElementById('modal-engine');
  if (modal) modal.style.display = 'none';
}

// Staff Modal
function openStaffModal() {
  const modal = document.getElementById('modal-staff');
  if (modal) modal.style.display = 'flex';
  if (typeof renderStaffList === 'function') renderStaffList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(StudioState.language === 'en' ? 'Staff management opened.' : 'Personalmanagement geöffnet.');
  }
}

function closeStaffModal() {
  const modal = document.getElementById('modal-staff');
  if (modal) modal.style.display = 'none';
}

// Marketing Modal
function openMarketingModal() {
  const modal = document.getElementById('modal-marketing');
  if (modal) modal.style.display = 'flex';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(StudioState.language === 'en' ? 'Marketing headquarters opened.' : 'Marketing-Zentrale geöffnet.');
  }
}

function closeMarketingModal() {
  const modal = document.getElementById('modal-marketing');
  if (modal) modal.style.display = 'none';
}

// SoundCon Modal
function openSoundConModal() {
  const modal = document.getElementById('modal-soundcon');
  if (modal) modal.style.display = 'flex';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(StudioState.language === 'en' ? 'SoundCon Expo booth booking.' : 'SoundCon Spielemesse. Wähle deinen Stand.');
  }
}

function closeSoundConModal() {
  const modal = document.getElementById('modal-soundcon');
  if (modal) modal.style.display = 'none';
}

// Soundtrack Label Modal
function openLabelModal() {
  const modal = document.getElementById('modal-label');
  if (modal) modal.style.display = 'flex';
  const list = document.getElementById('label-releases-list');
  if (list) {
    list.innerHTML = '';
    if (StudioState.soundtrackLabel.length === 0) {
      list.innerHTML = `<p class="empty-hint">${StudioState.language === 'en' ? 'Release games first to license original soundtracks.' : 'Veröffentliche zuerst Spiele, um Soundtracks zu lizenzieren.'}</p>`;
    } else {
      StudioState.soundtrackLabel.forEach(t => {
        const div = document.createElement('div');
        div.className = 'released-card';
        div.innerHTML = `
          <div>
            <span>🎵 <strong>${t.title}</strong></span>
            <p style="font-size: 0.8rem; color: #94a3b8;">Gesamteinnahmen: ${formatMoney(t.totalRevenue || 0)}</p>
          </div>
          <strong class="text-green">+${formatMoney(t.revenuePerWeek)}/Woche</strong>
        `;
        list.appendChild(div);
      });
    }
  }

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(StudioState.language === 'en' ? 'Soundtrack label catalog opened.' : 'Soundtrack-Label Übersicht geöffnet.');
  }
}

function closeLabelModal() {
  const modal = document.getElementById('modal-label');
  if (modal) modal.style.display = 'none';
}

// Bank Modal
function openBankModal() {
  const modal = document.getElementById('modal-bank');
  if (modal) modal.style.display = 'flex';
  if (typeof updateBankModalUI === 'function') updateBankModalUI();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(StudioState.language === 'en' ? 'Bank and loan accounts.' : 'Bank und Kreditkonto geöffnet.');
  }
}

function closeBankModal() {
  const modal = document.getElementById('modal-bank');
  if (modal) modal.style.display = 'none';
}

if (typeof window !== 'undefined') {
  window.closeAllModals = closeAllModals;
  window.openDevModal = openDevModal;
  window.closeDevModal = closeDevModal;
  window.openResearchModal = openResearchModal;
  window.closeResearchModal = closeResearchModal;
  window.openEngineModal = openEngineModal;
  window.closeEngineModal = closeEngineModal;
  window.openStaffModal = openStaffModal;
  window.closeStaffModal = closeStaffModal;
  window.openMarketingModal = openMarketingModal;
  window.closeMarketingModal = closeMarketingModal;
  window.openSoundConModal = openSoundConModal;
  window.closeSoundConModal = closeSoundConModal;
  window.openLabelModal = openLabelModal;
  window.closeLabelModal = closeLabelModal;
  window.openBankModal = openBankModal;
  window.closeBankModal = closeBankModal;
}
