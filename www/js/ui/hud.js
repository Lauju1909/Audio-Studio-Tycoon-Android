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
  if (rpEl) rpEl.textContent = `${StudioState.rp} FP`;

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
}

function renderReleasedGames() {
  const container = document.getElementById('released-games-list');
  if (!container) return;

  if (StudioState.releasedGames.length === 0) {
    container.innerHTML = `<p class="empty-hint">${t('no_games_yet')}</p>`;
    return;
  }

  container.innerHTML = '';
  StudioState.releasedGames.forEach(g => {
    const card = document.createElement('div');
    card.className = 'released-card';
    card.innerHTML = `
      <div>
        <strong>${g.title}</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">${g.theme} • ${g.genre} (J${g.year}/W${g.week})</p>
      </div>
      <div style="text-align: right;">
        <strong style="color: var(--accent); font-size: 1.15rem;">${g.score}%</strong>
        <p style="font-size: 0.8rem; color: var(--green);">${formatMoney(g.revenue)}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleLanguage() {
  StudioState.language = StudioState.language === 'de' ? 'en' : 'de';
  applyLanguageToUI();
  updateHUD();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.speak(StudioState.language === 'en' ? 'Language switched to English.' : 'Sprache auf Deutsch umgestellt.', true);
  }
}

function applyLanguageToUI() {
  const lang = StudioState.language || 'de';
  const btnLang = document.getElementById('btn-toggle-lang');
  if (btnLang) {
    btnLang.textContent = lang === 'en' ? '🇬🇧 EN' : '🇩🇪 DE';
    btnLang.setAttribute('aria-label', lang === 'en' ? 'Switch language to German' : 'Sprache auf Englisch umschalten');
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}

function toggleTTS() {
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.isTTSActive = !AudioEngine.isTTSActive;
    const btn = document.getElementById('btn-toggle-tts');
    if (btn) btn.textContent = AudioEngine.isTTSActive ? '🔊' : '🔇';
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
