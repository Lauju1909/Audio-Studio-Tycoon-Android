/**
 * Audio Studio Tycoon - UI Head-Up Display (HUD) & Accessibility Controls
 */

function updateHUD() {
  const nameEl = document.getElementById('studio-name-display');
  const dateEl = document.getElementById('hud-date');
  const cashEl = document.getElementById('val-cash');
  const fansEl = document.getElementById('val-fans');
  const rpEl = document.getElementById('val-rp');
  const debtBadge = document.getElementById('hud-debt-badge');

  if (nameEl) nameEl.textContent = `🎙️ ${StudioState.studioName}`;
  if (dateEl) dateEl.textContent = t('date_format', { year: StudioState.year, week: StudioState.week });
  if (fansEl) fansEl.textContent = StudioState.fans.toLocaleString(StudioState.language === 'en' ? 'en-US' : 'de-DE');
  if (rpEl) rpEl.textContent = `${StudioState.rp} ${StudioState.language === "en" ? "RP" : "FP"}`;

  if (cashEl) {
    cashEl.textContent = formatMoney(StudioState.cash);
    cashEl.className = StudioState.cash < 0 ? 'hud-val text-red' : 'hud-val text-green';
  }

  if (debtBadge) {
    if (StudioState.loan > 0) {
      debtBadge.style.display = 'inline-block';
      debtBadge.textContent = `${t('debt_label')} ${formatMoney(StudioState.loan)}`;
    } else {
      debtBadge.style.display = 'none';
    }
  }

  // Timeline & Era Progress UI
  const era = (typeof getCurrentEra === 'function') ? getCurrentEra(StudioState.year) : { name_de: 'Pionier-Ära', name_en: 'Pioneer Era', start: 1930, end: 1949 };
  const eraName = StudioState.language === 'en' ? era.name_en : era.name_de;
  const eraEl = document.getElementById('hud-era');
  if (eraEl) eraEl.textContent = eraName;

  const eraTextEl = document.getElementById('timeline-current-era-text');
  if (eraTextEl) eraTextEl.textContent = `${eraName} (${era.start}–${era.end})`;

  const progressLabel = document.getElementById('timeline-progress-label');
  if (progressLabel) progressLabel.textContent = `${StudioState.year} / 2026`;

  const progressFill = document.getElementById('timeline-progress-fill');
  if (progressFill) {
    const pct = Math.min(100, Math.max(0, Math.round(((StudioState.year - 1930) / (2026 - 1930)) * 100)));
    progressFill.style.width = `${pct}%`;
  }

  const isEn = StudioState.language === 'en';
  const trendEl = document.getElementById('hud-trend-badge');
  if (trendEl && StudioState.currentTrend) {
    const trendText = `Trend: ${StudioState.currentTrend.topic} + ${StudioState.currentTrend.genre}`;
    trendEl.textContent = trendText;
    trendEl.setAttribute('aria-label', isEn
      ? `Current trend: ${StudioState.currentTrend.topic} and ${StudioState.currentTrend.genre}`
      : `Aktueller Trend: ${StudioState.currentTrend.topic} und ${StudioState.currentTrend.genre}`);
  }

  const pauseBtn = document.getElementById('btn-time-pause');
  if (pauseBtn) {
    pauseBtn.textContent = StudioState.isPaused
      ? (isEn ? '▶️ Resume' : '▶️ Weiter')
      : (isEn ? '⏸️ Pause' : '⏸️ Pause');
    pauseBtn.setAttribute('aria-label', StudioState.isPaused
      ? (isEn ? 'Resume simulation' : 'Simulation fortsetzen')
      : (isEn ? 'Pause simulation' : 'Simulation pausieren'));
  }
  const speed1Btn = document.getElementById('btn-time-1x');
  if (speed1Btn) {
    speed1Btn.setAttribute('aria-label', isEn ? 'Speed 1x' : 'Geschwindigkeit 1x');
  }
  const speed2Btn = document.getElementById('btn-time-2x');
  if (speed2Btn) {
    speed2Btn.setAttribute('aria-label', isEn ? 'Speed 2x' : 'Geschwindigkeit 2x');
  }
  const nextWeekBtn = document.getElementById('btn-time-next');
  if (nextWeekBtn) {
    nextWeekBtn.textContent = isEn ? '⏭️ +1 Week' : '⏭️ +1 Woche';
    nextWeekBtn.setAttribute('aria-label', isEn ? 'Advance 1 Week' : '1 Woche weiter');
  }

  const devCard = document.getElementById('active-project-card');
  if (devCard) {
    const p = StudioState.activeProject;
    if (p) {
      devCard.style.display = 'flex';
      const devTitle = document.getElementById('dev-game-title');
      if (devTitle) devTitle.textContent = p.title || (isEn ? 'Active Game' : 'Aktuelles Spiel');
      const pctEl = document.getElementById('dev-progress-percent');
      if (pctEl) pctEl.textContent = `${p.progress || 0}%`;
      const barEl = document.getElementById('dev-progress-bar');
      if (barEl) barEl.style.width = `${p.progress || 0}%`;
      const featEl = document.getElementById('dev-pts-feat');
      if (featEl) featEl.textContent = p.features || 0;
      const soundEl = document.getElementById('dev-pts-sound');
      if (soundEl) soundEl.textContent = p.audioPts || 0;
      const bugsEl = document.getElementById('dev-pts-bugs');
      if (bugsEl) bugsEl.textContent = p.bugs || 0;
      const polishBtn = document.getElementById('btn-polish-dev');
      if (polishBtn) {
        polishBtn.textContent = isEn
          ? '🔧 QA Polish & Mastering (-$1,200)'
          : '🔧 QA-Feinschliff & Mastering (-1.200 €)';
        polishBtn.setAttribute('aria-label', isEn
          ? 'QA Polish and Mastering, costs 1,200 dollars'
          : 'QA-Feinschliff und Mastering, kostet 1.200 Euro');
        polishBtn.style.display = ((p.polishPasses || 0) >= 3 && (p.bugs || 0) <= 0) ? 'none' : 'inline-block';
      }
      const boostBtn = document.getElementById('btn-boost-dev');
      if (boostBtn) {
        boostBtn.textContent = isEn
          ? '🎙️ Live Acoustic Session (-$2,000)'
          : '🎙️ Live-Akustik-Session (-2.000 €)';
        boostBtn.setAttribute('aria-label', isEn
          ? 'Live Acoustic Session, costs 2,000 dollars'
          : 'Live-Akustik-Session, kostet 2.000 Euro');
        boostBtn.style.display = p.decisionMade ? 'none' : 'inline-block';
      }
      const finishBtn = document.getElementById('btn-finish-dev');
      if (finishBtn) {
        finishBtn.style.display = (p.progress >= 100) ? 'block' : 'none';
      }
    } else {
      devCard.style.display = 'none';
    }
  }

  const contractCard = document.getElementById('active-contract-card');
  if (contractCard) {
    if (StudioState.activeContract) {
      const ac = StudioState.activeContract;
      const pct = Math.min(100, Math.round((ac.currentPoints / Math.max(1, ac.requiredPoints)) * 100));
      contractCard.style.display = 'block';
      contractCard.innerHTML = `
        <strong>📋 ${isEn ? (ac.name_en || ac.name) : ac.name}</strong>: ${pct}% (${ac.weeksLeft} ${isEn ? 'wk left' : 'Wo. übrig'} • +${formatMoney(ac.reward)})
      `;
    } else {
      contractCard.style.display = 'none';
    }
  }

  if (typeof applyFeatureUnlocksToUI === 'function') {
    applyFeatureUnlocksToUI();
  }
}

function renderReleasedGames() {
  const container = document.getElementById('released-games-list');
  if (!container) return;

  if (StudioState.releasedGames.length === 0) {
    container.innerHTML = `<p class="empty-hint">${t('no_games_yet')}</p>`;
    return;
  }

  const isEn = StudioState.language === 'en';
  container.innerHTML = '';
  StudioState.releasedGames.forEach(g => {
    const card = document.createElement('div');
    card.className = 'released-card';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'stretch';
    card.style.gap = '8px';

    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.justifyContent = 'space-between';
    topRow.style.alignItems = 'center';
    const yearPrefix = isEn ? 'Y' : 'J';
    const audLabel = g.audience ? ` • ${t(`audience_${g.audience}`)}` : '';
    topRow.innerHTML = `
      <div>
        <strong>${g.title}</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">${g.platform ? `[${g.platform}] • ` : ''}${g.theme} • ${g.genre}${audLabel} (${yearPrefix}${g.year}/W${g.week})</p>
      </div>
      <div style="text-align: right;">
        <strong style="color: var(--accent); font-size: 1.15rem;">${g.score}%</strong>
        <p style="font-size: 0.8rem; color: var(--green);">${formatMoney(g.revenue)}</p>
      </div>
    `;
    card.appendChild(topRow);

    if (g.postMortemReport) {
      const reportP = document.createElement('p');
      reportP.style.fontSize = '0.78rem';
      reportP.style.color = '#cbd5e1';
      reportP.textContent = g.postMortemReport;
      card.appendChild(reportP);
    }

    const actionsRow = document.createElement('div');
    actionsRow.style.display = 'flex';
    actionsRow.style.gap = '6px';
    actionsRow.style.flexWrap = 'wrap';
    actionsRow.innerHTML = `
      ${!g.postMortemDone ? `
        <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.76rem;" aria-label="${isEn ? `Post-Mortem for ${g.title}, plus 10 RP` : `Spielbericht für ${g.title}, plus 10 FP`}" onclick="analyzePostMortem('${g.id}')">
          <span aria-hidden="true">📊</span> ${isEn ? 'Post-Mortem (+10 RP)' : 'Spielbericht (+10 FP)'}
        </button>
      ` : ''}
      ${(g.bugs > 0 && !g.patched) ? `
        <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.76rem;" aria-label="${isEn ? `Release patch for ${g.title}, ${g.bugs} bugs, costs 1,500 dollars` : `Patch für ${g.title} veröffentlichen, ${g.bugs} Bugs, kostet 1.500 Euro`}" onclick="releaseGamePatch('${g.id}')">
          <span aria-hidden="true">🔧</span> ${isEn ? `Patch (${g.bugs} Bugs • $1,500)` : `Patch (${g.bugs} Bugs • 1.500 €)`}
        </button>
      ` : ''}
      ${(g.dlcCount || 0) < 2 ? `
        <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.76rem;" aria-label="${isEn ? `Release Addon/DLC for ${g.title}, costs 4,000 dollars` : `Addon/DLC für ${g.title} veröffentlichen, kostet 4.000 Euro`}" onclick="releaseGameDLC('${g.id}')">
          <span aria-hidden="true">💿</span> ${isEn ? `Addon/DLC (${g.dlcCount || 0}/2 • $4,000)` : `Addon/DLC (${g.dlcCount || 0}/2 • 4.000 €)`}
        </button>
      ` : ''}
    `;
    card.appendChild(actionsRow);
    container.appendChild(card);
  });
}

function toggleLanguage() {
  StudioState.language = StudioState.language === 'de' ? 'en' : 'de';
  applyLanguageToUI();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.speak(StudioState.language === 'en' ? 'Language switched to English.' : 'Sprache auf Deutsch umgestellt.', true);
  }
}

function applyLanguageToUI() {
  const lang = (typeof StudioState !== 'undefined' && StudioState.language) ? StudioState.language : 'de';
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ast_language', lang);
    }
  } catch (e) {}

  const btnLang = document.getElementById('btn-toggle-lang');
  if (btnLang) {
    btnLang.textContent = lang === 'en' ? '🇬🇧 EN' : '🇩🇪 DE';
    btnLang.setAttribute('aria-label', lang === 'en' ? 'Switch language to German' : 'Sprache auf Englisch umschalten');
  }

  const btnTTS = document.getElementById('btn-toggle-tts');
  if (btnTTS) {
    btnTTS.setAttribute('aria-label', t('tts_toggle_aria'));
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.setAttribute('placeholder', t(key));
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (key) el.setAttribute('aria-label', t(key));
  });

  if (typeof StudioState !== 'undefined' && StudioState) {
    const era = (typeof getCurrentEra === 'function')
      ? getCurrentEra(StudioState.year)
      : { name_de: 'Pionier-Ära', name_en: 'Pioneer Era', start: 1930, end: 1949 };
    const eraName = lang === 'en' ? era.name_en : era.name_de;
    const eraEl = document.getElementById('hud-era');
    if (eraEl) eraEl.textContent = eraName;
    const eraTextEl = document.getElementById('timeline-current-era-text');
    if (eraTextEl) eraTextEl.textContent = `${eraName} (${era.start}–${era.end})`;

    if (typeof updateHUD === 'function') updateHUD();
    if (typeof renderReleasedGames === 'function') renderReleasedGames();
    if (typeof populateDevModalOptions === 'function') populateDevModalOptions();
    if (typeof updateDevSynergyPreview === 'function') updateDevSynergyPreview();
  }
}

function toggleTTS() {
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.isTTSActive = !AudioEngine.isTTSActive;
    const btn = document.getElementById('btn-toggle-tts');
    if (btn) {
      btn.textContent = AudioEngine.isTTSActive ? '🔊' : '🔇';
      btn.setAttribute('aria-pressed', String(AudioEngine.isTTSActive));
    }
    AudioEngine.speak(AudioEngine.isTTSActive ? (StudioState.language === 'en' ? 'Speech active' : 'Sprachausgabe aktiv') : (StudioState.language === 'en' ? 'Speech muted' : 'Sprachausgabe stumm'), true);
  }
}

if (typeof window !== 'undefined') {
  window.updateHUD = updateHUD;
  window.renderReleasedGames = renderReleasedGames;
  window.toggleLanguage = toggleLanguage;
  window.applyLanguageToUI = applyLanguageToUI;
  window.toggleTTS = toggleTTS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { updateHUD, renderReleasedGames, toggleLanguage, applyLanguageToUI, toggleTTS };
}
