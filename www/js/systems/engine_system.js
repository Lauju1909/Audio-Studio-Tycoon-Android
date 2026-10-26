/**
 * Audio Studio Tycoon - Custom Audio Engine System
 */

function renderEngineList() {
  const container = document.getElementById('engine-list-display');
  if (!container) return;
  container.innerHTML = '';

  StudioState.customEngines.forEach(eng => {
    const div = document.createElement('div');
    div.className = 'released-card';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <div>
        <strong>${eng.name}</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">+${eng.audioBonus} Audio-Punkte | +${eng.techBonus} Features</p>
      </div>
      <span class="badge" style="background: #1e293b;">Aktiv</span>
    `;
    container.appendChild(div);
  });
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
  const promptFn = (typeof global !== 'undefined' && global.prompt) ? global.prompt : (typeof window !== 'undefined' ? window.prompt : null);
  const defaultPromptName = `Sonic Audio Engine v${num}`;
  const name = promptFn ? promptFn(StudioState.language === 'en' ? 'Enter Engine Name:' : 'Name der neuen Sound-Engine:', defaultPromptName) : defaultPromptName;
  if (!name || !name.trim()) return;

  const audioBonus = 8 + StudioState.unlockedTech.length * 4;
  const techBonus = 6 + StudioState.unlockedTech.length * 3;

  StudioState.cash -= cost;
  StudioState.customEngines.push({
    id: `custom_eng_${Date.now()}`,
    name: name.trim(),
    audioBonus,
    techBonus,
    features: [...StudioState.unlockedTech]
  });

  renderEngineList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('buy');
    AudioEngine.vibrate(50);
    AudioEngine.speak(StudioState.language === 'en' ? `Engine ${name} constructed successfully!` : `Sound-Engine ${name} erfolgreich gebaut!`);
  }
  if (typeof updateHUD === 'function') updateHUD();
}

if (typeof window !== 'undefined') {
  window.renderEngineList = renderEngineList;
  window.buildNewEngine = buildNewEngine;
}
