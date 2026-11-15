/**
 * Audio Studio Tycoon - Research System
 */

function renderResearchList() {
  const container = document.getElementById('research-items-list');
  if (!container) return;
  container.innerHTML = '';

  const isEn = StudioState.language === 'en';
  const rpUnit = isEn ? 'RP' : 'FP';
  const catalog = (typeof RESEARCH_CATALOG !== 'undefined' && Array.isArray(RESEARCH_CATALOG))
    ? [...RESEARCH_CATALOG].sort((a, b) => (a.year || 1930) - (b.year || 1930))
    : [];

  catalog.forEach(tech => {
    const techYear = tech.year || 1930;
    const isUnlocked = Array.isArray(StudioState.unlockedTech) && StudioState.unlockedTech.includes(tech.id);
    const isYearAvailable = StudioState.year >= techYear;
    const techName = isEn ? (tech.name_en || (tech.effect && tech.effect.name_en) || tech.name) : tech.name;
    const techDesc = isEn ? (tech.desc_en || (tech.effect && tech.effect.desc_en) || tech.desc) : tech.desc;
    const era = (typeof getCurrentEra === 'function') ? getCurrentEra(techYear) : null;
    const eraLabel = era ? (isEn ? era.name_en : era.name_de) : '';

    const statusLabel = isUnlocked
      ? t('researched_badge')
      : (isYearAvailable
        ? (isEn ? 'Available Now' : 'Jetzt verfügbar')
        : (isEn ? `Locked until ${techYear}` : `Gesperrt bis ${techYear}`));
    const statusColor = isUnlocked ? 'var(--green)' : (isYearAvailable ? 'var(--accent)' : '#475569');
    const statusTextColor = isYearAvailable && !isUnlocked ? '#0f172a' : '#fff';

    const div = document.createElement('div');
    div.className = 'released-card';
    div.style.marginBottom = '10px';
    div.setAttribute('aria-label', `${techName} (${techYear}${eraLabel ? `, ${eraLabel}` : ''}) - ${statusLabel}`);

    div.innerHTML = `
      <div style="flex: 1; padding-right: 12px;">
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 4px;">
          <strong>${techName}</strong>
          <span class="badge" style="font-size: 0.72rem; background: #1e293b; color: #cbd5e1;">${techYear}${eraLabel ? ` • ${eraLabel}` : ''}</span>
          <span class="badge" style="font-size: 0.72rem; background: ${statusColor}; color: ${statusTextColor};">${statusLabel}</span>
        </div>
        <p style="font-size: 0.85rem; color: #94a3b8;">${techDesc}</p>
        <span style="font-size: 0.75rem; color: var(--accent);">${t("available_from_year", { year: techYear })}</span>
      </div>
      <div>
        ${isUnlocked ?
          `<span class="badge" style="background: var(--green); color: #fff;" aria-label="${techName}: ${t("researched_badge")}">${t("researched_badge")}</span>` :
          `<button type="button" class="btn btn-primary" style="padding: 8px 14px; font-size: 0.85rem;" ${!isYearAvailable ? 'disabled' : ''} aria-label="${techName}, ${tech.cost} ${rpUnit}, ${statusLabel}" onclick="doResearch('${tech.id}', ${tech.cost})">
            ${tech.cost} ${rpUnit}
          </button>`
        }
      </div>
    `;
    container.appendChild(div);
  });
}

function doResearch(techId, cost) {
  const tech = (typeof RESEARCH_CATALOG !== 'undefined') ? RESEARCH_CATALOG.find(t => t.id === techId) : null;
  if (!tech) return false;
  const isEn = StudioState.language === 'en';
  const techName = isEn ? (tech.name_en || (tech.effect && tech.effect.name_en) || tech.name) : tech.name;
  const reqCost = (typeof cost === 'number' && !Number.isNaN(cost)) ? cost : tech.cost;

  if (!Array.isArray(StudioState.unlockedTech)) StudioState.unlockedTech = [];
  if (StudioState.unlockedTech.includes(techId)) {
    return false;
  }

  if (StudioState.year < (tech.year || 1930)) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('tech_not_available_yet', { year: tech.year }));
    }
    return false;
  }

  if (StudioState.rp < reqCost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_rp', { rp: reqCost }));
    }
    return false;
  }

  StudioState.rp -= reqCost;
  StudioState.unlockedTech.push(techId);

  renderResearchList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.vibrate([40, 30, 40]);
    AudioEngine.speak(isEn ?
      `Research complete! ${techName} unlocked.` :
      `Forschung abgeschlossen! ${techName} erfolgreich freigeschaltet.`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

if (typeof window !== 'undefined') {
  window.renderResearchList = renderResearchList;
  window.doResearch = doResearch;
}
