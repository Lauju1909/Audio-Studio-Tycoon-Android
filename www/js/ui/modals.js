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

  const themeSelect = document.getElementById('select-theme');
  if (themeSelect) {
    themeSelect.innerHTML = '';
    const unlockedThemes = StudioState.unlockedTopics && StudioState.unlockedTopics.length > 0
      ? StudioState.unlockedTopics
      : ["Fantasy", "SciFi", "Cyberpunk", "Medieval", "Horror", "Retro"];
    unlockedThemes.forEach(themeName => {
      const opt = document.createElement('option');
      opt.value = themeName;
      const histTopic = (typeof HISTORICAL_TOPICS !== 'undefined') ? HISTORICAL_TOPICS.find(t => t.name === themeName) : null;
      const extraInfo = histTopic ? ` (${histTopic.synergy ? `Synergie: ${histTopic.synergy}` : ''}${histTopic.hype_level ? ` • Hype: ★${histTopic.hype_level}` : ''})` : '';
      opt.textContent = `${themeName}${extraInfo}`;
      themeSelect.appendChild(opt);
    });
  }

  const genreSelect = document.getElementById('select-genre');
  if (genreSelect) {
    const unlockedGenres = StudioState.unlockedGenres && StudioState.unlockedGenres.length > 0
      ? StudioState.unlockedGenres
      : ["RPG", "Action", "Simulation", "Strategy", "Puzzle"];
    genreSelect.innerHTML = '';
    unlockedGenres.forEach(genreName => {
      const opt = document.createElement('option');
      opt.value = genreName;
      opt.textContent = genreName;
      genreSelect.appendChild(opt);
    });
  }

  const platformSelect = document.getElementById('select-platform');
  const availablePlats = (typeof getAvailablePlatforms === 'function')
    ? getAvailablePlatforms(StudioState.year, StudioState.unlockedPlatforms)
    : (typeof PLATFORMS !== 'undefined' ? PLATFORMS : []);
  if (platformSelect) {
    platformSelect.innerHTML = '';
    availablePlats.forEach(plat => {
      const opt = document.createElement('option');
      opt.value = plat.name;
      const feeText = plat.license_fee > 0 ? formatMoney(plat.license_fee) : t('free_license');
      opt.textContent = `${plat.name} (${plat.type} • ${t('market_share_short', { multi: plat.market_multi })} • ${feeText})`;
      platformSelect.appendChild(opt);
    });

    const updateDevCostBtn = () => {
      const curPlat = availablePlats.find(p => p.name === platformSelect.value) || availablePlats[0];
      const fee = curPlat ? (curPlat.license_fee || 0) : 0;
      const baseCost = Math.round(5000 * (StudioState.devCostMultiplier || 1.0));
      const submitBtn = document.getElementById('btn-submit-dev');
      if (submitBtn) {
        submitBtn.textContent = `${StudioState.language === 'en' ? 'Start Development' : 'Entwicklung starten'} (-${formatMoney(baseCost + fee)})`;
      }
    };
    platformSelect.onchange = updateDevCostBtn;
    updateDevCostBtn();
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
  const isUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('soundcon', StudioState.year) : (StudioState.year >= 1995);
  if (!isUnlocked) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('feature_locked', { feature: 'SoundCon', year: 1995 }));
    }
    return;
  }

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
  const isUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('soundtrack_label', StudioState.year) : (StudioState.year >= 1985);
  if (!isUnlocked) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('feature_locked', { feature: 'Soundtrack-Label', year: 1985 }));
    }
    return;
  }

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

function dismissEventBanner() {
  const banner = document.getElementById('timeline-event-banner');
  if (banner) banner.style.display = 'none';
}

function showTimelineEventBanner(year, text, eventData) {
  const banner = document.getElementById('timeline-event-banner');
  if (!banner) return;
  const yearEl = document.getElementById('event-banner-year');
  const titleEl = document.getElementById('event-banner-title');
  const descEl = document.getElementById('event-banner-desc');
  if (yearEl) yearEl.textContent = year;
  if (titleEl) titleEl.textContent = t('event_banner_title', { year });
  if (descEl) {
    let impactText = '';
    if (eventData && eventData.effect) {
      impactText = ` (${t('event_impact_label')} ${eventData.effect} -> ${eventData.value})`;
    }
    descEl.textContent = `${text}${impactText}`;
  }
  banner.style.display = 'block';
}

function applyFeatureUnlocksToUI() {
  const year = StudioState.year;

  // SoundCon (1995)
  const soundconUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('soundcon', year) : (year >= 1995);
  const badgeSoundcon = document.getElementById('badge-lock-soundcon');
  const btnSoundcon = document.getElementById('btn-action-soundcon');
  if (badgeSoundcon) badgeSoundcon.style.display = soundconUnlocked ? 'none' : 'inline-block';
  if (btnSoundcon) {
    if (soundconUnlocked) btnSoundcon.classList.remove('card-locked');
    else btnSoundcon.classList.add('card-locked');
  }

  // Soundtrack Label (1985)
  const labelUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('soundtrack_label', year) : (year >= 1985);
  const badgeLabel = document.getElementById('badge-lock-label');
  const btnLabel = document.getElementById('btn-action-label');
  if (badgeLabel) badgeLabel.style.display = labelUnlocked ? 'none' : 'inline-block';
  if (btnLabel) {
    if (labelUnlocked) btnLabel.classList.remove('card-locked');
    else btnLabel.classList.add('card-locked');
  }

  // Content Creator Sponsorship / Streamer (2010)
  const streamerUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('creator_sponsorship', year) : (year >= 2010);
  const badgeStreamer = document.getElementById('badge-lock-streamer');
  const btnStreamer = document.getElementById('btn-marketing-streamer');
  if (badgeStreamer) badgeStreamer.style.display = streamerUnlocked ? 'none' : 'inline-block';
  if (btnStreamer) {
    btnStreamer.disabled = !streamerUnlocked;
    if (streamerUnlocked) {
      if (typeof btnStreamer.removeAttribute === 'function') btnStreamer.removeAttribute('disabled');
      btnStreamer.classList.remove('card-locked');
    } else {
      if (typeof btnStreamer.setAttribute === 'function') btnStreamer.setAttribute('disabled', 'true');
      btnStreamer.classList.add('card-locked');
    }
  }
}

function showGameOverModal() {
  const modal = document.getElementById('modal-game-over');
  if (modal) {
    const statsEl = document.getElementById('game-over-stats');
    if (statsEl) {
      const gamesCount = StudioState.releasedGames ? StudioState.releasedGames.length : 0;
      const totalRev = StudioState.releasedGames
        ? StudioState.releasedGames.reduce((acc, g) => acc + (g.revenue || 0), 0)
        : 0;
      const fansCount = StudioState.fans || 0;
      const gotyCount = StudioState.gotyAwards ? StudioState.gotyAwards.length : 0;
      statsEl.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 10px 0;">
          <p>🎮 <strong>${StudioState.language === 'en' ? 'Released Games' : 'Veröffentlichte Spiele'}:</strong> ${gamesCount}</p>
          <p>💰 <strong>${StudioState.language === 'en' ? 'Total Revenue' : 'Gesamteinnahmen'}:</strong> ${formatMoney(totalRev)}</p>
          <p>👥 <strong>${StudioState.language === 'en' ? 'Global Fans' : 'Treue Fans'}:</strong> ${fansCount.toLocaleString()}</p>
          <p>🏆 <strong>${StudioState.language === 'en' ? 'GOTY Awards' : 'Gewonnene GOTY-Awards'}:</strong> ${gotyCount}</p>
        </div>
      `;
    }
    modal.style.display = 'flex';
  }
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.speak(t('game_end_title') + ' ' + t('game_end_body'));
  }
}

function closeGameOverModal() {
  const modal = document.getElementById('modal-game-over');
  if (modal) modal.style.display = 'none';
}

function continueEndlessMode() {
  StudioState.endlessMode = true;
  closeGameOverModal();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.speak(StudioState.language === 'en' ? 'Endless mode activated. Build your studio forever!' : 'Endlos-Modus aktiviert. Baue dein Studio für immer weiter aus!');
  }
  if (typeof updateHUD === 'function') updateHUD();
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
  window.dismissEventBanner = dismissEventBanner;
  window.showTimelineEventBanner = showTimelineEventBanner;
  window.applyFeatureUnlocksToUI = applyFeatureUnlocksToUI;
  window.showGameOverModal = showGameOverModal;
  window.closeGameOverModal = closeGameOverModal;
  window.continueEndlessMode = continueEndlessMode;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    closeAllModals, openDevModal, closeDevModal, openResearchModal,
    closeResearchModal, openEngineModal, closeEngineModal, openStaffModal,
    closeStaffModal, openMarketingModal, closeMarketingModal, openSoundConModal,
    closeSoundConModal, openLabelModal, closeLabelModal, openBankModal,
    closeBankModal, dismissEventBanner, showTimelineEventBanner, applyFeatureUnlocksToUI,
    showGameOverModal, closeGameOverModal, continueEndlessMode
  };
}
