/**
 * Audio Studio Tycoon - Research System
 */

function renderResearchList() {
  const container = document.getElementById('research-items-list');
  if (!container) return;
  container.innerHTML = '';

  RESEARCH_CATALOG.forEach(tech => {
    const isUnlocked = StudioState.unlockedTech.includes(tech.id);
    const isYearAvailable = StudioState.year >= tech.year;

    const div = document.createElement('div');
    div.className = 'released-card';
    div.style.marginBottom = '10px';

    div.innerHTML = `
      <div style="flex: 1; padding-right: 12px;">
        <strong>${tech.name}</strong>
        <p style="font-size: 0.85rem; color: #94a3b8;">${tech.desc}</p>
        <span style="font-size: 0.75rem; color: var(--accent);">Verfügbar ab ${tech.year}</span>
      </div>
      <div>
        ${isUnlocked ?
          `<span class="badge" style="background: var(--green); color: #fff;">Erforscht</span>` :
          `<button class="btn btn-primary" style="padding: 8px 14px; font-size: 0.85rem;" ${!isYearAvailable ? 'disabled' : ''} onclick="doResearch('${tech.id}', ${tech.cost})">
            ${tech.cost} FP
          </button>`
        }
      </div>
    `;
    container.appendChild(div);
  });
}

function doResearch(techId, cost) {
  if (StudioState.rp < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_rp', { rp: cost }));
    }
    return;
  }

  const tech = RESEARCH_CATALOG.find(t => t.id === techId);
  if (!tech) return;

  StudioState.rp -= cost;
  if (!StudioState.unlockedTech.includes(techId)) {
    StudioState.unlockedTech.push(techId);
  }

  renderResearchList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.vibrate([40, 30, 40]);
    AudioEngine.speak(StudioState.language === 'en' ?
      `Research complete! ${tech.name} unlocked.` :
      `Forschung abgeschlossen! ${tech.name} erfolgreich freigeschaltet.`);
  }
  if (typeof updateHUD === 'function') updateHUD();
}

if (typeof window !== 'undefined') {
  window.renderResearchList = renderResearchList;
  window.doResearch = doResearch;
}
