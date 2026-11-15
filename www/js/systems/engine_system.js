/**
 * Audio Studio Tycoon - Custom Audio Engine System
 */

function getDefaultEngineName(year, num) {
  const y = Number(year) || 1930;
  let base = 'Relais-Audio Engine';
  if (y >= 2013) base = 'Spatial AI Engine';
  else if (y >= 1990) base = '3D-Multimedia Engine';
  else if (y >= 1977) base = 'Chiptune-Synth Engine';
  else if (y >= 1950) base = 'Magnetband-Engine';
  return `${base} v${num}`;
}

function renderEngineList() {
  const container = document.getElementById('engine-list-display');
  if (!container) return;
  container.innerHTML = '';

  const isEn = StudioState.language === 'en';
  const engines = Array.isArray(StudioState.customEngines) ? StudioState.customEngines : [];

  engines.forEach(eng => {
    const createdYear = eng.createdYear || 1930;
    const isLicensed = !!eng.licensedOut;
    const weeklyRoyalty = 350 * (eng.techBonus || 5);
    const totalRoyalties = eng.totalRoyalties || 0;
    const yearText = (typeof t === 'function')
      ? t('engine_year_label', { year: createdYear })
      : (isEn ? `Built: ${createdYear}` : `Baujahr: ${createdYear}`);
    const licenseBtnText = isLicensed
      ? ((typeof t === 'function')
        ? t('engine_licensed_badge', { royalty: formatMoney(weeklyRoyalty) })
        : (isEn ? `Licensed (+${formatMoney(weeklyRoyalty)}/wk)` : `Lizenziert (+${formatMoney(weeklyRoyalty)}/Wo.)`))
      : ((typeof t === 'function')
        ? t('engine_license_btn')
        : (isEn ? 'License Out' : 'Lizenzieren'));
    const actionHint = isLicensed
      ? (isEn ? 'Stop Licensing' : 'Lizenz beenden')
      : (isEn ? 'License Out' : 'Lizenzieren');

    const div = document.createElement('div');
    div.className = 'released-card';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <div style="flex: 1; padding-right: 10px;">
        <strong>${eng.name}</strong>
        <span style="font-size: 0.78rem; color: #cbd5e1; margin-left: 6px;">(${yearText})</span>
        <p style="font-size: 0.8rem; color: #94a3b8;">
          +${eng.audioBonus} ${isEn ? 'Audio Pts' : 'Audio-Punkte'} | +${eng.techBonus} Features${totalRoyalties > 0 ? ` • ${isEn ? 'Royalties' : 'Tantiemen'}: ${formatMoney(totalRoyalties)}` : ''}
        </p>
      </div>
      <div style="display: flex; gap: 6px; align-items: center;">
        <button type="button"
          class="btn ${isLicensed ? 'btn-primary' : 'btn-secondary'}"
          style="padding: 6px 10px; font-size: 0.78rem;"
          aria-pressed="${isLicensed}"
          aria-label="${eng.name} (${yearText}): ${actionHint} (+${formatMoney(weeklyRoyalty)})"
          onclick="toggleEngineLicense('${eng.id}')">
          ${licenseBtnText}
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

function toggleEngineLicense(engineId) {
  const engines = Array.isArray(StudioState.customEngines) ? StudioState.customEngines : [];
  const eng = engines.find(e => String(e.id) === String(engineId));
  if (!eng) return false;

  eng.licensedOut = !eng.licensedOut;
  const weeklyRoyalty = 350 * (eng.techBonus || 5);

  renderEngineList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    const isEn = StudioState.language === 'en';
    const msg = eng.licensedOut
      ? ((typeof t === 'function' && t('engine_licensed_announced', { name: eng.name, royalty: formatMoney(weeklyRoyalty) }) !== 'engine_licensed_announced')
        ? t('engine_licensed_announced', { name: eng.name, royalty: formatMoney(weeklyRoyalty) })
        : (isEn ? `${eng.name} is now licensed to third-party studios (+${formatMoney(weeklyRoyalty)}/week).` : `${eng.name} wird jetzt an Fremdstudios lizenziert (+${formatMoney(weeklyRoyalty)}/Woche).`))
      : ((typeof t === 'function' && t('engine_unlicensed_announced', { name: eng.name }) !== 'engine_unlicensed_announced')
        ? t('engine_unlicensed_announced', { name: eng.name })
        : (isEn ? `Third-party licensing ended for ${eng.name}.` : `Drittlizenzierung für ${eng.name} beendet.`));
    AudioEngine.speak(msg);
  }
  return eng.licensedOut;
}

function buildNewEngine() {
  const cost = 15000;
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return;
  }

  const num = StudioState.customEngines.length + 1;
  const createdYear = StudioState.year || 1930;
  const promptFn = (typeof global !== 'undefined' && global.prompt) ? global.prompt : (typeof window !== 'undefined' ? window.prompt : null);
  const defaultPromptName = getDefaultEngineName(createdYear, num);
  const name = promptFn ? promptFn(StudioState.language === 'en' ? 'Enter Engine Name:' : 'Name der neuen Sound-Engine:', defaultPromptName) : defaultPromptName;
  if (!name || !name.trim()) return;

  const unlocked = Array.isArray(StudioState.unlockedTech) ? StudioState.unlockedTech : [];
  const audioBonus = 8 + unlocked.length * 4;
  const techBonus = 6 + unlocked.length * 3;
  let engId = `custom_eng_${Date.now()}`;
  if (StudioState.customEngines.some(e => e.id === engId)) {
    engId = `${engId}_${num}`;
  }

  StudioState.cash -= cost;
  StudioState.customEngines.push({
    id: engId,
    name: name.trim(),
    audioBonus,
    techBonus,
    features: [...unlocked],
    createdYear,
    licensedOut: false,
    totalRoyalties: 0
  });

  renderEngineList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('buy');
    AudioEngine.vibrate(50);
    AudioEngine.speak(StudioState.language === 'en' ? `Engine ${name.trim()} constructed successfully!` : `Sound-Engine ${name.trim()} erfolgreich gebaut!`);
  }
  if (typeof updateHUD === 'function') updateHUD();
}

if (typeof window !== 'undefined') {
  window.renderEngineList = renderEngineList;
  window.buildNewEngine = buildNewEngine;
  window.toggleEngineLicense = toggleEngineLicense;
}
