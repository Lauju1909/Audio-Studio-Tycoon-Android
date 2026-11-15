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
function populateDevModalOptions() {
  const isEn = StudioState.language === 'en';
  const curTrend = StudioState.currentTrend || { topic: 'Radio-Drama', genre: 'Action' };

  const themeSelect = document.getElementById('select-theme');
  if (themeSelect) {
    const prevTheme = themeSelect.value;
    themeSelect.innerHTML = '';
    const unlockedThemes = StudioState.unlockedTopics && StudioState.unlockedTopics.length > 0
      ? StudioState.unlockedTopics
      : ['Fantasy', 'SciFi', 'Cyberpunk', 'Medieval', 'Horror', 'Retro'];
    unlockedThemes.forEach(themeName => {
      const opt = document.createElement('option');
      opt.value = themeName;
      const histTopic = (typeof HISTORICAL_TOPICS !== 'undefined') ? HISTORICAL_TOPICS.find(t => t.name === themeName) : null;
      const isTrend = curTrend.topic === themeName;
      const trendBadge = isTrend ? (isEn ? ' [TREND!]' : ' [IM TREND!]') : '';
      const synLabel = isEn ? 'Synergy' : 'Synergie';
      const extraInfo = histTopic
        ? ` (${histTopic.synergy ? `${synLabel}: ${histTopic.synergy}` : ''}${histTopic.hype_level ? ` • Hype: ${histTopic.hype_level}/5` : ''})`
        : '';
      opt.textContent = `${themeName}${trendBadge}${extraInfo}`;
      themeSelect.appendChild(opt);
    });
    if (prevTheme && unlockedThemes.includes(prevTheme)) {
      themeSelect.value = prevTheme;
    } else if (unlockedThemes.length > 0) {
      themeSelect.value = unlockedThemes[0];
    }
    themeSelect.onchange = updateDevSynergyPreview;
  }

  const genreSelect = document.getElementById('select-genre');
  if (genreSelect) {
    const prevGenre = genreSelect.value;
    const unlockedGenres = StudioState.unlockedGenres && StudioState.unlockedGenres.length > 0
      ? StudioState.unlockedGenres
      : ['RPG', 'Action', 'Simulation', 'Strategy', 'Puzzle'];
    const genreKeyMap = {
      Strategy: 'genre_strategy',
      Simulation: 'genre_simulation',
      Casual: 'genre_casual',
      Puzzle: 'genre_puzzle',
      Action: 'genre_action'
    };
    genreSelect.innerHTML = '';
    unlockedGenres.forEach(genreName => {
      const opt = document.createElement('option');
      opt.value = genreName;
      const isTrend = curTrend.genre === genreName;
      const trendBadge = isTrend ? (isEn ? ' [TREND!]' : ' [IM TREND!]') : '';
      const localized = genreKeyMap[genreName] ? t(genreKeyMap[genreName]) : genreName;
      const label = (localized && localized !== genreName) ? `${localized} (${genreName})` : genreName;
      opt.textContent = `${label}${trendBadge}`;
      genreSelect.appendChild(opt);
    });
    if (prevGenre && unlockedGenres.includes(prevGenre)) {
      genreSelect.value = prevGenre;
    } else if (unlockedGenres.length > 0) {
      genreSelect.value = unlockedGenres[0];
    }
    genreSelect.onchange = () => {
      applyIdealGenreSliders(false);
      updateDevSynergyPreview();
    };
  }

  const audienceSelect = document.getElementById('select-audience');
  if (audienceSelect) {
    const prevAudience = audienceSelect.value;
    const audiences = (typeof AUDIENCE_CATALOG !== 'undefined' && Array.isArray(AUDIENCE_CATALOG))
      ? AUDIENCE_CATALOG
      : [
          { id: 'everyone', name: 'Jeder', name_en: 'Everyone' },
          { id: 'youth', name: 'Jugendliche', name_en: 'Youth & Teens' },
          { id: 'hardcore', name: 'Hardcore-Gamer', name_en: 'Hardcore Gamers' }
        ];
    audienceSelect.innerHTML = '';
    audiences.forEach(aud => {
      const opt = document.createElement('option');
      opt.value = aud.id;
      opt.textContent = isEn
        ? (aud.name_en || t(`audience_${aud.id}`))
        : (aud.name || t(`audience_${aud.id}`));
      audienceSelect.appendChild(opt);
    });
    if (prevAudience && audiences.some(a => a.id === prevAudience)) {
      audienceSelect.value = prevAudience;
    } else {
      audienceSelect.value = 'everyone';
    }
    audienceSelect.onchange = updateDevSynergyPreview;
  }

  const publisherSelect = document.getElementById('select-publisher');
  if (publisherSelect) {
    const prevPublisher = publisherSelect.value;
    const publishers = (typeof PUBLISHERS_CATALOG !== 'undefined' && Array.isArray(PUBLISHERS_CATALOG))
      ? PUBLISHERS_CATALOG
      : [
          { id: 'self_pub', name: 'Eigenverlag (Indie)', name_en: 'Self-Published (Indie)', advance: 0, royaltyCut: 0, reachMulti: 1.0, minScore: 0 }
        ];
    publisherSelect.innerHTML = '';
    publishers.forEach(pub => {
      const opt = document.createElement('option');
      opt.value = pub.id;
      const pubName = isEn ? (pub.name_en || pub.name) : pub.name;
      const advStr = t('publisher_advance_short', { amount: formatMoney(pub.advance || 0) });
      const cutStr = t('publisher_royalty_short', { pct: pub.royaltyCut || 0 });
      const reachStr = t('publisher_reach_short', { multi: pub.reachMulti || 1.0 });
      if ((pub.minScore || 0) > 0) {
        const minStr = t('publisher_min_score_short', { score: pub.minScore });
        opt.textContent = `${pubName} (${advStr} • ${cutStr} • ${reachStr} • ${minStr})`;
      } else {
        opt.textContent = `${pubName} (${advStr} • ${cutStr} • ${reachStr})`;
      }
      publisherSelect.appendChild(opt);
    });
    if (prevPublisher && publishers.some(p => p.id === prevPublisher)) {
      publisherSelect.value = prevPublisher;
    } else {
      publisherSelect.value = 'self_pub';
    }
    publisherSelect.onchange = updateDevSynergyPreview;
  }

  const sequelSelect = document.getElementById('select-sequel');
  if (sequelSelect) {
    const prevSequel = sequelSelect.value;
    sequelSelect.innerHTML = '';
    const origOpt = document.createElement('option');
    origOpt.value = '';
    origOpt.textContent = t('sequel_original_opt');
    sequelSelect.appendChild(origOpt);
    const validIds = new Set(['']);
    if (Array.isArray(StudioState.releasedGames)) {
      StudioState.releasedGames.slice(0, 8).forEach(g => {
        const opt = document.createElement('option');
        opt.value = String(g.id);
        validIds.add(String(g.id));
        opt.textContent = isEn
          ? `Sequel to "${g.title}" (${g.theme}/${g.genre} • ${g.score}%)`
          : `Fortsetzung zu "${g.title}" (${g.theme}/${g.genre} • ${g.score}%)`;
        sequelSelect.appendChild(opt);
      });
    }
    sequelSelect.value = (prevSequel && validIds.has(prevSequel)) ? prevSequel : '';
    sequelSelect.onchange = () => {
      const g = (StudioState.releasedGames || []).find(x => String(x.id) === String(sequelSelect.value));
      if (g) {
        if (themeSelect) themeSelect.value = g.theme;
        if (genreSelect) genreSelect.value = g.genre;
        if (audienceSelect && g.audience) audienceSelect.value = g.audience;
        const nameInput = document.getElementById('input-game-name');
        if (nameInput) {
          const baseTitle = (g.title || '').replace(/\s+\d+$/, '').trim();
          const nextNum = (g.sequelNumber || 1) + 1;
          nameInput.value = `${baseTitle} ${nextNum}`;
        }
        applyIdealGenreSliders(false);
        updateDevSynergyPreview();
      }
    };
  }

  const platformSelect = document.getElementById('select-platform');
  const availablePlats = (typeof getAvailablePlatforms === 'function')
    ? getAvailablePlatforms(StudioState.year, StudioState.unlockedPlatforms)
    : (typeof PLATFORMS !== 'undefined' ? PLATFORMS : []);
  if (platformSelect) {
    const prevPlat = platformSelect.value;
    platformSelect.innerHTML = '';
    availablePlats.forEach(plat => {
      const opt = document.createElement('option');
      opt.value = plat.name;
      const feeText = plat.license_fee > 0 ? formatMoney(plat.license_fee) : t('free_license');
      opt.textContent = `${plat.name} (${plat.type} • ${t('market_share_short', { multi: plat.market_multi })} • ${feeText})`;
      platformSelect.appendChild(opt);
    });
    if (prevPlat && availablePlats.some(p => p.name === prevPlat)) {
      platformSelect.value = prevPlat;
    } else if (availablePlats.length > 0) {
      platformSelect.value = availablePlats[0].name;
    }
    platformSelect.onchange = updateDevSynergyPreview;
  }

  const engineSelect = document.getElementById('select-engine');
  if (engineSelect) {
    const prevEngine = engineSelect.value;
    engineSelect.innerHTML = '';
    const engines = Array.isArray(StudioState.customEngines) ? StudioState.customEngines : [];
    engines.forEach(eng => {
      const opt = document.createElement('option');
      opt.value = eng.id;
      opt.textContent = `${eng.name} (+${eng.audioBonus} Audio, +${eng.techBonus} Tech)`;
      engineSelect.appendChild(opt);
    });
    if (prevEngine && engines.some(e => e.id === prevEngine)) {
      engineSelect.value = prevEngine;
    } else if (engines.length > 0) {
      engineSelect.value = engines[0].id;
    }
  }
}

function openDevModal() {
  if (StudioState.activeProject) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(StudioState.language === 'en' ? 'A game is already in development! Finish it first.' : 'Es wird bereits ein Spiel entwickelt! Schließe das aktuelle Projekt erst ab.');
    }
    return;
  }

  populateDevModalOptions();
  applyIdealGenreSliders(false);
  updateDevSynergyPreview();

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
        const statusStr = isVacation ? (StudioState.language === 'en' ? 'On Vacation' : 'Im Urlaub') : t('fatigue_label', { fatigue: emp.fatigue });
        const div = document.createElement('label');
        div.className = 'staff-checkbox-item';
        div.innerHTML = `
          <input type="checkbox" name="dev-staff" value="${emp.id}" aria-label="${emp.name} (${roleName}), ${statusStr}" ${isVacation ? 'disabled' : 'checked'}>
          <span><strong>${emp.name}</strong> (${roleName}) - ${statusStr}</span>
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
    AudioEngine.speak(StudioState.language === 'en' ? 'Design new game. Choose title, theme, genre, audience, publisher, engine and staff.' : 'Neues Spiel konzipieren. Wähle Titel, Thema, Genre, Zielgruppe, Publisher, Engine und Team.');
  }
}

function closeDevModal() {
  const modal = document.getElementById('modal-dev');
  if (modal) modal.style.display = 'none';
}

function applyIdealGenreSliders(announce = true) {
  const genreSelect = document.getElementById('select-genre');
  const genre = genreSelect ? genreSelect.value : 'Action';
  const ideal = (typeof getIdealSlidersForGenre === 'function') ? getIdealSlidersForGenre(genre) : { gameplay: 75, sound: 75 };
  const gpSlider = document.getElementById('slider-gameplay');
  const sndSlider = document.getElementById('slider-sound');
  const gpValEl = document.getElementById('val-gameplay');
  const sndValEl = document.getElementById('val-sound');
  if (gpSlider) gpSlider.value = ideal.gameplay;
  if (sndSlider) sndSlider.value = ideal.sound;
  if (gpValEl) gpValEl.textContent = `${ideal.gameplay}%`;
  if (sndValEl) sndValEl.textContent = `${ideal.sound}%`;
  if (announce && typeof AudioEngine !== 'undefined') {
    const isEn = StudioState.language === 'en';
    AudioEngine.playSound('click');
    AudioEngine.speak(isEn
      ? `Ideal sliders set for ${genre}: Gameplay ${ideal.gameplay}%, Sound ${ideal.sound}%`
      : `Ideale Slider für ${genre} gesetzt: Gameplay ${ideal.gameplay}%, Sound ${ideal.sound}%`);
  }
}

function updateDevSynergyPreview() {
  const isEn = StudioState.language === 'en';
  const themeSelect = document.getElementById('select-theme');
  const genreSelect = document.getElementById('select-genre');
  const audienceSelect = document.getElementById('select-audience');
  const publisherSelect = document.getElementById('select-publisher');
  const platformSelect = document.getElementById('select-platform');

  const theme = (themeSelect && themeSelect.value) ? themeSelect.value : 'Fantasy';
  const genre = (genreSelect && genreSelect.value) ? genreSelect.value : 'Action';
  const audience = (audienceSelect && audienceSelect.value) ? audienceSelect.value : 'everyone';
  const publisherId = (publisherSelect && publisherSelect.value) ? publisherSelect.value : 'self_pub';

  const previewEl = document.getElementById('dev-synergy-preview');
  if (previewEl) {
    const tgStars = (typeof getCompatibilityStars === 'function') ? getCompatibilityStars(theme, genre) : 2;
    const audStars = (typeof getAudienceCompatibility === 'function') ? getAudienceCompatibility(theme, genre, audience) : 2;
    const combinedStars = Math.max(0, Math.min(3, Math.floor((tgStars + audStars) / 2)));
    const ideal = (typeof getIdealSlidersForGenre === 'function') ? getIdealSlidersForGenre(genre) : { gameplay: 75, sound: 75 };
    const starStr = combinedStars > 0 ? '⭐'.repeat(combinedStars) : '⚠️';

    const ratingText = isEn
      ? (tgStars === 3 ? 'Perfect Synergy!' : (tgStars === 2 ? 'Good Combination' : (tgStars === 1 ? 'Unusual Combination' : 'Poor Match')))
      : (tgStars === 3 ? 'Perfekte Synergie!' : (tgStars === 2 ? 'Gute Kombination' : (tgStars === 1 ? 'Ungewöhnliche Kombi' : 'Unpassende Kombi')));

    const audLabel = t(`audience_${audience}`);
    const audFitText = audStars === 3
      ? t('audience_fit_perfect')
      : (audStars === 1 ? t('audience_fit_mismatch') : t('audience_fit_neutral'));

    previewEl.textContent = isEn
      ? `${starStr} Combined (${combinedStars}/3): ${theme} + ${genre} (${tgStars}/3, ${ratingText}) • Audience ${audLabel} (${audStars}/3, ${audFitText}) | Ideal Focus: Gameplay ${ideal.gameplay}% / Sound ${ideal.sound}%`
      : `${starStr} Gesamt (${combinedStars}/3): ${theme} + ${genre} (${tgStars}/3, ${ratingText}) • Zielgruppe ${audLabel} (${audStars}/3, ${audFitText}) | Empfehlung: Gameplay ${ideal.gameplay}% / Sound ${ideal.sound}%`;

    previewEl.setAttribute('aria-label', isEn
      ? `${t('synergy_stars_aria', { stars: combinedStars })}: ${theme} and ${genre}, ${ratingText}. Target audience ${audLabel}, ${audFitText}. Ideal focus Gameplay ${ideal.gameplay} percent, Sound ${ideal.sound} percent.`
      : `${t('synergy_stars_aria', { stars: combinedStars })}: ${theme} und ${genre}, ${ratingText}. Zielgruppe ${audLabel}, ${audFitText}. Empfehlung Gameplay ${ideal.gameplay} Prozent, Sound ${ideal.sound} Prozent.`);
  }

  const availablePlats = (typeof getAvailablePlatforms === 'function')
    ? getAvailablePlatforms(StudioState.year, StudioState.unlockedPlatforms)
    : (typeof PLATFORMS !== 'undefined' ? PLATFORMS : []);
  const selectedPlatName = (platformSelect && platformSelect.value)
    ? platformSelect.value
    : (availablePlats[0] ? availablePlats[0].name : '');
  const curPlat = availablePlats.find(p => p.name === selectedPlatName)
    || (typeof PLATFORMS !== 'undefined' ? PLATFORMS.find(p => p.name === selectedPlatName) : null)
    || availablePlats[0];
  const fee = curPlat ? (curPlat.license_fee || 0) : 0;
  const baseCost = Math.round(5000 * (StudioState.devCostMultiplier || 1.0));
  const totalCost = baseCost + fee;

  const publishers = (typeof PUBLISHERS_CATALOG !== 'undefined' && Array.isArray(PUBLISHERS_CATALOG)) ? PUBLISHERS_CATALOG : [];
  const pub = publishers.find(p => p.id === publisherId) || { id: 'self_pub', advance: 0 };
  const advance = pub.advance || 0;
  const netCost = Math.max(0, totalCost - advance);

  const submitBtn = document.getElementById('btn-submit-dev');
  if (submitBtn) {
    const startLabel = t('start_dev_btn');
    if (advance > 0) {
      submitBtn.textContent = `${startLabel} (-${formatMoney(netCost)} • +${formatMoney(advance)} ${isEn ? 'Advance' : 'Vorschuss'})`;
      submitBtn.setAttribute('aria-label', isEn
        ? `${startLabel}, net start cost ${formatMoney(netCost)} after ${formatMoney(advance)} publisher advance`
        : `${startLabel}, Netto-Startkosten ${formatMoney(netCost)} nach ${formatMoney(advance)} Publisher-Vorschuss`);
    } else {
      submitBtn.textContent = `${startLabel} (-${formatMoney(netCost)})`;
      submitBtn.setAttribute('aria-label', `${startLabel} (-${formatMoney(netCost)})`);
    }
  }
}

// Contracts Modal
function openContractsModal() {
  const modal = document.getElementById('modal-contracts');
  if (modal) modal.style.display = 'flex';
  renderContractsList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(StudioState.language === 'en' ? 'Contract work & audio commissions opened.' : 'Auftragsarbeiten für sichere Studio-Einnahmen geöffnet.');
  }
}

function closeContractsModal() {
  const modal = document.getElementById('modal-contracts');
  if (modal) modal.style.display = 'none';
}

function renderContractsList() {
  const container = document.getElementById('contracts-list');
  if (!container) return;
  container.innerHTML = '';
  const isEn = StudioState.language === 'en';
  const eraScale = (StudioState.year >= 1990) ? 2.5 : (StudioState.year >= 1970 ? 1.6 : 1.0);

  if (StudioState.activeContract) {
    const ac = StudioState.activeContract;
    const pct = Math.min(100, Math.round((ac.currentPoints / Math.max(1, ac.requiredPoints)) * 100));
    const activeDiv = document.createElement('div');
    activeDiv.className = 'staff-item';
    activeDiv.style.borderLeft = '3px solid var(--green)';
    activeDiv.style.marginBottom = '10px';
    activeDiv.innerHTML = `
      <div>
        <strong><span aria-hidden="true">📋</span> ${isEn ? 'Active Contract' : 'Laufender Auftrag'}: ${isEn ? (ac.name_en || ac.name) : ac.name}</strong>
        <p style="font-size: 0.82rem; color: #94a3b8;">
          ${pct}% • ${ac.weeksLeft} ${isEn ? 'weeks left' : 'Wochen übrig'} • ${isEn ? 'Reward' : 'Vergütung'}: ${formatMoney(ac.reward)}
        </p>
      </div>
    `;
    container.appendChild(activeDiv);
  }

  const allContracts = (typeof CONTRACTS_CATALOG !== 'undefined') ? CONTRACTS_CATALOG : [];
  const catalog = (typeof getAvailableContracts === 'function')
    ? getAvailableContracts(StudioState.year)
    : allContracts.filter(c => (c.unlockYear || 1930) <= StudioState.year);
  catalog.forEach(c => {
    const cName = isEn ? c.name_en : c.name;
    const reward = Math.round((c.reward * eraScale) / 100) * 100;
    const penalty = Math.round((c.penalty * eraScale) / 100) * 100;
    const item = document.createElement('div');
    item.className = 'staff-item';
    item.innerHTML = `
      <div>
        <strong><span aria-hidden="true">🎙️</span> ${cName}</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">
          ${isEn ? 'Reward' : 'Vergütung'}: <strong class="text-green">+${formatMoney(reward)}</strong> • ${c.weeks} ${isEn ? 'Weeks' : 'Wochen'} (${isEn ? 'Penalty' : 'Strafe'}: ${formatMoney(penalty)})
        </p>
      </div>
      <button type="button" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.82rem;" aria-label="${isEn ? `Accept ${cName}, reward ${formatMoney(reward)}` : `Auftrag ${cName} annehmen, Vergütung ${formatMoney(reward)}`}" ${StudioState.activeContract ? 'disabled' : ''} onclick="acceptContract('${c.id}')">
        ${isEn ? 'Accept' : 'Annehmen'}
      </button>
    `;
    container.appendChild(item);
  });
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
  const isEn = StudioState.language === 'en';
  const list = document.getElementById('label-releases-list');
  if (list) {
    list.innerHTML = '';
    if (StudioState.soundtrackLabel.length === 0) {
      list.innerHTML = `<p class="empty-hint">${isEn ? 'Release games first to license original soundtracks.' : 'Veröffentliche zuerst Spiele, um Soundtracks zu lizenzieren.'}</p>`;
    } else {
      StudioState.soundtrackLabel.forEach(track => {
        const div = document.createElement('div');
        div.className = 'released-card';
        div.innerHTML = `
          <div>
            <span><span aria-hidden="true">🎵</span> <strong>${track.title}</strong></span>
            <p style="font-size: 0.8rem; color: #94a3b8;">${isEn ? 'Total Revenue' : 'Gesamteinnahmen'}: ${formatMoney(track.totalRevenue || 0)}</p>
          </div>
          <strong class="text-green">+${formatMoney(track.revenuePerWeek)}/${isEn ? 'wk' : 'Woche'}</strong>
        `;
        list.appendChild(div);
      });
    }
  }

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('select');
    AudioEngine.speak(isEn ? 'Soundtrack label catalog opened.' : 'Soundtrack-Label Übersicht geöffnet.');
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
  if (badgeSoundcon) {
    badgeSoundcon.style.display = soundconUnlocked ? 'none' : 'inline-block';
    badgeSoundcon.textContent = t('locked_until', { year: 1995 });
  }
  if (btnSoundcon) {
    if (soundconUnlocked) btnSoundcon.classList.remove('card-locked');
    else btnSoundcon.classList.add('card-locked');
  }

  // Soundtrack Label (1985)
  const labelUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('soundtrack_label', year) : (year >= 1985);
  const badgeLabel = document.getElementById('badge-lock-label');
  const btnLabel = document.getElementById('btn-action-label');
  if (badgeLabel) {
    badgeLabel.style.display = labelUnlocked ? 'none' : 'inline-block';
    badgeLabel.textContent = t('locked_until', { year: 1985 });
  }
  if (btnLabel) {
    if (labelUnlocked) btnLabel.classList.remove('card-locked');
    else btnLabel.classList.add('card-locked');
  }

  // Content Creator Sponsorship / Streamer (2010)
  const streamerUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('creator_sponsorship', year) : (year >= 2010);
  const badgeStreamer = document.getElementById('badge-lock-streamer');
  const btnStreamer = document.getElementById('btn-marketing-streamer');
  if (badgeStreamer) {
    badgeStreamer.style.display = streamerUnlocked ? 'none' : 'inline-block';
    badgeStreamer.textContent = t('locked_until', { year: 2010 });
  }
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
      const isEn = StudioState.language === 'en';
      const gamesCount = StudioState.releasedGames ? StudioState.releasedGames.length : 0;
      const totalRev = StudioState.releasedGames
        ? StudioState.releasedGames.reduce((acc, g) => acc + (g.revenue || 0), 0)
        : 0;
      const fansCount = StudioState.fans || 0;
      const gotyCount = StudioState.gotyAwards ? StudioState.gotyAwards.length : 0;
      const audioAwardCount = StudioState.audioDesignAwards ? StudioState.audioDesignAwards.length : 0;
      statsEl.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 10px 0;">
          <p><span aria-hidden="true">🎮</span> <strong>${isEn ? 'Released Games' : 'Veröffentlichte Spiele'}:</strong> ${gamesCount}</p>
          <p><span aria-hidden="true">💰</span> <strong>${isEn ? 'Total Revenue' : 'Gesamteinnahmen'}:</strong> ${formatMoney(totalRev)}</p>
          <p><span aria-hidden="true">👥</span> <strong>${isEn ? 'Global Fans' : 'Treue Fans'}:</strong> ${fansCount.toLocaleString(isEn ? 'en-US' : 'de-DE')}</p>
          <p><span aria-hidden="true">🏆</span> <strong>${t('goty_awards_label')}:</strong> ${gotyCount}</p>
          <p><span aria-hidden="true">🎙️</span> <strong>${t('best_audio_awards_label')}:</strong> ${audioAwardCount}</p>
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
  window.populateDevModalOptions = populateDevModalOptions;
  window.openDevModal = openDevModal;
  window.closeDevModal = closeDevModal;
  window.applyIdealGenreSliders = applyIdealGenreSliders;
  window.updateDevSynergyPreview = updateDevSynergyPreview;
  window.openContractsModal = openContractsModal;
  window.closeContractsModal = closeContractsModal;
  window.renderContractsList = renderContractsList;
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
    closeAllModals, populateDevModalOptions, openDevModal, closeDevModal,
    applyIdealGenreSliders, updateDevSynergyPreview, openResearchModal,
    closeResearchModal, openEngineModal, closeEngineModal, openStaffModal,
    closeStaffModal, openMarketingModal, closeMarketingModal, openSoundConModal,
    closeSoundConModal, openLabelModal, closeLabelModal, openBankModal,
    closeBankModal, dismissEventBanner, showTimelineEventBanner, applyFeatureUnlocksToUI,
    showGameOverModal, closeGameOverModal, continueEndlessMode, renderContractsList,
    openContractsModal, closeContractsModal
  };
}
