/**
 * Audio Studio Tycoon - Game Development Lifecycle & Mechanics
 */

function generateRandomTitle() {
  const titlesDE = ["Echo des Schicksals", "Symphonie des Grauens", "Pixel Beat", "Klang der Ewigkeit", "Neon Groove", "Rhythmus Rebell", "Flüsternde Schatten", "Der Schallmeister"];
  const titlesEN = ["Echo of Destiny", "Symphony of Dread", "Pixel Beat", "Sound of Eternity", "Neon Groove", "Rhythm Rebel", "Whispering Shadows", "Sonic Master"];
  const list = StudioState.language === 'en' ? titlesEN : titlesDE;
  const picked = list[Math.floor(Math.random() * list.length)];
  const input = document.getElementById('input-game-name');
  if (input) {
    input.value = picked;
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('click');
      AudioEngine.speak(picked);
    }
  }
  return picked;
}

const RESEARCH_EFFECT_FALLBACKS = {
  acoustic_isolation: { flatAudio: 10 },
  magnetic_tape: { audioPct: 15, bugReduction: 0.10 },
  vinyl_mastering: { labelRoyaltyPct: 15, flatAudio: 10 },
  stereo_panning: { audioPct: 15 },
  moog_modular: { scorePct: 10 },
  pcm_digital: { flatAudio: 15, bugReduction: 0.15 },
  chiptune: { audioPct: 20, themes: ['Retro', 'Cyberpunk'] },
  polyphonic: { flatAudio: 15 },
  dsp_effects: { audioPct: 20, bugReduction: 0.20 },
  surround_51: { scorePct: 15, genres: ['Action', 'Horror'] },
  binaural_3d: { audioPct: 30, fanMultiplier: 1.5 },
  ai_composition: { speedBoost: 0.25, labelRoyaltyPct: 35 },
  raytracing_audio: { flatScore: 25 },
  neural_acoustics: { flatScore: 30, audioPct: 35 }
};

function getGlobalValue(name, fallback) {
  if (typeof window !== 'undefined' && window[name] !== undefined) return window[name];
  if (typeof global !== 'undefined' && global[name] !== undefined) return global[name];
  return fallback;
}

function getUnlockedResearchEntries() {
  const unlockedIds = Array.isArray(StudioState && StudioState.unlockedTech) ? StudioState.unlockedTech : [];
  const catalog = (typeof RESEARCH_CATALOG !== 'undefined' && Array.isArray(RESEARCH_CATALOG))
    ? RESEARCH_CATALOG
    : getGlobalValue('RESEARCH_CATALOG', []);
  return unlockedIds.map(id => {
    const entry = catalog.find(item => item.id === id);
    if (entry && entry.effect) return { id, effect: entry.effect };
    if (RESEARCH_EFFECT_FALLBACKS[id]) return { id, effect: RESEARCH_EFFECT_FALLBACKS[id] };
    return null;
  }).filter(Boolean);
}

function doesTechEffectMatchProject(effect, project) {
  if (!effect) return false;
  if (Array.isArray(effect.themes) && !effect.themes.includes(project.theme)) {
    return false;
  }
  if (Array.isArray(effect.genres)) {
    return effect.genres.includes(project.genre) || effect.genres.includes(project.theme);
  }
  return true;
}

function resolvePublisher(publisherId) {
  const pubCatalog = (typeof PUBLISHERS_CATALOG !== 'undefined' && Array.isArray(PUBLISHERS_CATALOG))
    ? PUBLISHERS_CATALOG
    : getGlobalValue('PUBLISHERS_CATALOG', []);
  const fallbackSelf = { id: 'self_pub', name: 'Eigenverlag (Indie)', name_en: 'Self-Published (Indie)', advance: 0, royaltyCut: 0, reachMulti: 1.0, minScore: 0 };
  const selfPub = pubCatalog.find(pub => pub.id === 'self_pub') || fallbackSelf;
  if (!publisherId) return selfPub;
  return pubCatalog.find(pub => pub.id === publisherId) || selfPub;
}

function startDevelopment() {
  const platformSelect = document.getElementById('select-platform');
  const availablePlats = (typeof getAvailablePlatforms === 'function') ? getAvailablePlatforms(StudioState.year) : (typeof PLATFORMS !== 'undefined' ? PLATFORMS : []);
  const selectedPlatName = (platformSelect && platformSelect.value) ? platformSelect.value : (availablePlats[0] ? availablePlats[0].name : "Hand-Abakus");
  const platform = (typeof PLATFORMS !== 'undefined' ? PLATFORMS.find(p => p.name === selectedPlatName) : null) || availablePlats[0] || { name: selectedPlatName, license_fee: 0, market_multi: 1.0 };

  const audienceSelect = document.getElementById('select-audience');
  const rawAudience = (audienceSelect && audienceSelect.value) ? String(audienceSelect.value).trim() : '';
  const audCatalog = (typeof AUDIENCE_CATALOG !== 'undefined' && Array.isArray(AUDIENCE_CATALOG))
    ? AUDIENCE_CATALOG
    : getGlobalValue('AUDIENCE_CATALOG', []);
  const audience = (rawAudience && (audCatalog.length === 0 || audCatalog.some(a => a.id === rawAudience)))
    ? rawAudience
    : 'everyone';

  const publisherSelect = document.getElementById('select-publisher');
  const rawPubId = (publisherSelect && publisherSelect.value) ? String(publisherSelect.value).trim() : '';
  const publisher = resolvePublisher(rawPubId || 'self_pub');
  const pubAdvance = Number(publisher.advance) || 0;

  const licenseFee = platform.license_fee || 0;
  const baseCost = Math.round(5000 * (StudioState.devCostMultiplier || 1.0));
  const totalCost = baseCost + licenseFee;
  const netCost = Math.max(0, totalCost - pubAdvance);

  if (StudioState.cash < netCost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(netCost) }));
    }
    return false;
  }

  const nameInput = document.getElementById('input-game-name');
  const title = (nameInput && nameInput.value ? nameInput.value.trim() : '') || (StudioState.language === 'en' ? 'Audio Adventure' : 'Audio Abenteuer');
  const themeSelect = document.getElementById('select-theme');
  const theme = themeSelect ? themeSelect.value : "Fantasy";
  const genreSelect = document.getElementById('select-genre');
  const genre = genreSelect ? genreSelect.value : "RPG";
  const engineSelect = document.getElementById('select-engine');
  const engineId = engineSelect ? engineSelect.value : (StudioState.customEngines[0] ? StudioState.customEngines[0].id : 'engine_basic_1');
  const sliderGameplay = document.getElementById('slider-gameplay');
  const gameplay = sliderGameplay ? parseInt(sliderGameplay.value, 10) : 50;
  const sliderSound = document.getElementById('slider-sound');
  const sound = sliderSound ? parseInt(sliderSound.value, 10) : 50;
  const sequelSelect = document.getElementById('select-sequel');
  const sequelOfId = (sequelSelect && sequelSelect.value) ? sequelSelect.value : '';

  let sequelNumber = 1;
  let initialQualityBoost = 0;
  let sequelBaseTitle = '';
  if (sequelOfId && Array.isArray(StudioState.releasedGames)) {
    const orig = StudioState.releasedGames.find(g => String(g.id) === String(sequelOfId));
    if (orig) {
      sequelNumber = (orig.sequelNumber || 1) + 1;
      sequelBaseTitle = (orig.title || '').replace(/\s+\d+$/, '').trim();
      const currEng = (StudioState.customEngines || []).find(e => e.id === engineId);
      const origEng = (StudioState.customEngines || []).find(e => e.id === orig.engineId);
      const currPower = (currEng ? (currEng.audioBonus || 0) + (currEng.techBonus || 0) : 10);
      const origPower = (origEng ? (origEng.audioBonus || 0) + (origEng.techBonus || 0) : 10);
      if ((orig.engineId && orig.engineId !== engineId) || currPower > origPower) {
        initialQualityBoost += 6;
      } else {
        // Franchise fatigue when reusing the exact same engine
        initialQualityBoost -= 4;
      }
    }
  }

  const assignedStaffIds = [];
  const checkedBoxes = document.querySelectorAll('input[name="dev-staff"]:checked');
  if (checkedBoxes && checkedBoxes.length > 0) {
    checkedBoxes.forEach(cb => assignedStaffIds.push(parseInt(cb.value, 10)));
  } else if (StudioState.staff.length > 0) {
    assignedStaffIds.push(StudioState.staff[0].id);
  }

  StudioState.cash = StudioState.cash - totalCost + pubAdvance;
  if (typeof closeDevModal === 'function') closeDevModal();

  const rawInputVal = (nameInput && nameInput.value ? nameInput.value.trim() : '');
  const isDefaultPlaceholder = rawInputVal === '' || rawInputVal === 'Echo des Schicksals' || rawInputVal === 'Echo of Destiny';
  const finalTitle = (sequelNumber > 1 && isDefaultPlaceholder)
    ? `${sequelBaseTitle || `${theme} ${genre}`} ${sequelNumber}`
    : title;

  StudioState.activeProject = {
    title: finalTitle, theme, genre, engineId, gameplay, sound,
    audience,
    publisherId: publisher.id,
    platform: platform.name,
    platformMarketMulti: platform.market_multi,
    assignedStaffIds,
    progress: 0,
    features: 0,
    audioPts: 0,
    bugs: 0,
    polishPasses: 0,
    decisionMade: false,
    qualityBoost: initialQualityBoost,
    sequelNumber
  };

  const devCard = document.getElementById('active-project-card');
  if (devCard) devCard.style.display = 'flex';
  const devTitle = document.getElementById('dev-game-title');
  if (devTitle) devTitle.textContent = finalTitle;
  const finishBtn = document.getElementById('btn-finish-dev');
  if (finishBtn) finishBtn.style.display = 'none';
  const polishBtn = document.getElementById('btn-polish-dev');
  if (polishBtn) polishBtn.style.display = 'inline-block';
  const boostBtn = document.getElementById('btn-boost-dev');
  if (boostBtn) boostBtn.style.display = 'inline-block';

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('buy');
    AudioEngine.vibrate(40);
    AudioEngine.speak(t('dev_started', { title: finalTitle, theme, genre, platform: platform.name }));
  }
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

function tickProjectProgress() {
  const p = StudioState.activeProject;
  if (!p) return;

  const engine = StudioState.customEngines.find(e => e.id === p.engineId) || StudioState.customEngines[0];
  const engineAudioBonus = engine ? engine.audioBonus : 5;
  const engineTechBonus = engine ? engine.techBonus : 5;

  const activeTechs = getUnlockedResearchEntries();
  let totalSpeedBoost = 0;
  let totalFlatAudio = 0;
  let totalAudioPct = 0;
  let bugChanceMultiplier = 1.0;

  activeTechs.forEach(({ effect }) => {
    if (!doesTechEffectMatchProject(effect, p)) return;
    if (effect.speedBoost) totalSpeedBoost += effect.speedBoost;
    if (effect.flatAudio) totalFlatAudio += Math.max(2, Math.round(effect.flatAudio / 4));
    if (effect.audioPct) totalAudioPct += effect.audioPct;
    if (effect.bugReduction) bugChanceMultiplier *= Math.max(0.1, 1 - effect.bugReduction);
  });

  let progressStep = 10;
  if (totalSpeedBoost > 0) {
    progressStep += Math.round(16 * totalSpeedBoost);
  }

  let coderSkill = 0;
  let soundSkill = 0;
  let writerSkill = 0;

  StudioState.staff.forEach(emp => {
    if (p.assignedStaffIds.includes(emp.id) && emp.onVacationWeeks <= 0) {
      if (emp.role === 'coder') coderSkill += emp.skill;
      if (emp.role === 'sound') soundSkill += emp.skill;
      if (emp.role === 'writer') writerSkill += emp.skill;

      emp.fatigue = Math.min(100, emp.fatigue + Math.floor(Math.random() * 3) + 2);
    }
  });

  progressStep += coderSkill * 3;
  p.progress = Math.min(100, p.progress + progressStep);

  const gpFocus = 0.65 + ((p.gameplay !== undefined ? p.gameplay : 60) / 100) * 0.7;
  const sndFocus = 0.65 + ((p.sound !== undefined ? p.sound : 60) / 100) * 0.7;

  const rawFeat = Math.floor(Math.random() * 3) + 1 + Math.round(coderSkill * 1.5) + Math.round(writerSkill * 2) + Math.round(engineTechBonus / 3);
  const featGained = Math.max(1, Math.round(rawFeat * gpFocus));
  p.features += featGained;

  let soundGained = Math.floor(Math.random() * 4) + 2 + Math.round(soundSkill * 3) + Math.round(engineAudioBonus / 2);
  soundGained = Math.max(1, Math.round(soundGained * sndFocus));
  soundGained += totalFlatAudio;
  if (totalAudioPct > 0) {
    soundGained = Math.round(soundGained * (1 + totalAudioPct / 100));
  }
  p.audioPts += soundGained;

  let bugChance = 0.35 * bugChanceMultiplier;
  const avgFatigue = p.assignedStaffIds.length > 0 ?
    p.assignedStaffIds.map(id => StudioState.staff.find(e => e.id === id)?.fatigue || 0).reduce((a, b) => a + b, 0) / p.assignedStaffIds.length : 0;

  if (avgFatigue > 60) bugChance += 0.25;

  if (Math.random() < bugChance) {
    let newBugs = Math.floor(Math.random() * 2) + 1;
    if (coderSkill >= 3 && Math.random() < 0.5) {
      newBugs = 0;
    }
    p.bugs += newBugs;
  }

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('typing', 0.15);
  }

  const pctEl = document.getElementById('dev-progress-percent');
  if (pctEl) pctEl.textContent = `${p.progress}%`;
  const barEl = document.getElementById('dev-progress-bar');
  if (barEl) barEl.style.width = `${p.progress}%`;
  const featEl = document.getElementById('dev-pts-feat');
  if (featEl) featEl.textContent = p.features;
  const soundEl = document.getElementById('dev-pts-sound');
  if (soundEl) soundEl.textContent = p.audioPts;
  const bugsEl = document.getElementById('dev-pts-bugs');
  if (bugsEl) bugsEl.textContent = p.bugs;

  if (p.progress >= 100) {
    const finishBtn = document.getElementById('btn-finish-dev');
    if (finishBtn) finishBtn.style.display = 'block';
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('blip');
      AudioEngine.vibrate(35);
    }
  }
}

function polishActiveProject() {
  const p = StudioState.activeProject;
  if (!p) return false;
  const cost = 1200;
  const isEn = StudioState.language === 'en';
  if ((p.polishPasses || 0) >= 3 && (p.bugs || 0) <= 0) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'Maximum QA polish reached and 0 bugs remaining!' : 'Maximaler QA-Feinschliff erreicht und 0 Bugs übrig!');
    }
    return false;
  }
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return false;
  }
  StudioState.cash -= cost;
  const fixed = Math.min(p.bugs || 0, 4);
  p.bugs = Math.max(0, (p.bugs || 0) - 4);
  let gainedBoost = 0;
  if ((p.polishPasses || 0) < 3) {
    p.polishPasses = (p.polishPasses || 0) + 1;
    p.qualityBoost = (p.qualityBoost || 0) + 3;
    gainedBoost = 3;
  }

  const bugsEl = document.getElementById('dev-pts-bugs');
  if (bugsEl) bugsEl.textContent = p.bugs;
  if (typeof updateHUD === 'function') updateHUD();

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.speak(isEn
      ? `QA & Mastering Polish: fixed ${fixed} bugs (${p.bugs} left)${gainedBoost > 0 ? `, quality boost +${gainedBoost}` : ''}!`
      : `QA-Feinschliff & Mastering: ${fixed} Bugs behoben (noch ${p.bugs})${gainedBoost > 0 ? `, Qualitätsbonus +${gainedBoost}` : ''}!`);
  }
  return true;
}

function boostActiveProjectAudio() {
  const p = StudioState.activeProject;
  if (!p) return false;
  const isEn = StudioState.language === 'en';
  if (p.decisionMade) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'Live Audio Session already recorded for this project!' : 'Live-Akustik-Session für dieses Projekt bereits durchgeführt!');
    }
    return false;
  }
  const cost = 2000;
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return false;
  }
  StudioState.cash -= cost;
  p.decisionMade = true;
  p.audioPts = (p.audioPts || 0) + 25;
  p.features = (p.features || 0) + 10;
  p.qualityBoost = (p.qualityBoost || 0) + 5;

  const featEl = document.getElementById('dev-pts-feat');
  if (featEl) featEl.textContent = p.features;
  const soundEl = document.getElementById('dev-pts-sound');
  if (soundEl) soundEl.textContent = p.audioPts;
  const boostBtn = document.getElementById('btn-boost-dev');
  if (boostBtn) boostBtn.style.display = 'none';
  if (typeof updateHUD === 'function') updateHUD();

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.speak(isEn
      ? `Recorded Live Foley & Synth Session for ${p.title}: +25 Audio, +10 Features, +5 Quality!`
      : `Live-Foley- & Synth-Session für ${p.title}: +25 Audio, +10 Features, +5 Qualität!`);
  }
  return true;
}

function finishDevelopment() {
  const p = StudioState.activeProject;
  if (!p) return;

  let synergyMult = (typeof getSynergyMultiplier === 'function')
    ? getSynergyMultiplier(p.theme, p.genre)
    : (((typeof THEME_GENRE_SYNERGIES !== 'undefined' ? THEME_GENRE_SYNERGIES[p.theme] : null) || {})[p.genre] || 1.0);

  const histTopic = (typeof HISTORICAL_TOPICS !== 'undefined') ? HISTORICAL_TOPICS.find(t => t.name === p.theme) : null;
  if (histTopic) {
    if (histTopic.synergy && p.genre && histTopic.synergy.toLowerCase() === p.genre.toLowerCase()) {
      synergyMult = Math.max(synergyMult, 1.25);
    }
  }

  let baseScore = 65;
  if (histTopic && histTopic.hype_level) {
    baseScore += Math.max(0, (histTopic.hype_level - 2) * 2);
  }
  if (p.sound >= 60) baseScore += 8;
  if (p.audioPts > 50) baseScore += 10;
  if (p.audioPts > 120) baseScore += 8;

  if (p.features > 40) baseScore += 6;
  if (p.bugs === 0) baseScore += 8;
  else if (p.bugs > 6) baseScore -= Math.min(25, p.bugs * 3);

  // Dual-Slider Genre Match bonus
  const ideal = (typeof getIdealSlidersForGenre === 'function') ? getIdealSlidersForGenre(p.genre) : { gameplay: 70, sound: 75 };
  const gpVal = (p.gameplay !== undefined) ? p.gameplay : ideal.gameplay;
  const sndVal = (p.sound !== undefined) ? p.sound : ideal.sound;
  const sliderDiff = Math.abs(gpVal - ideal.gameplay) + Math.abs(sndVal - ideal.sound);
  if (sliderDiff <= 25) baseScore += 6;
  else if (sliderDiff > 75) baseScore -= 5;

  // Trend Match bonus
  let trendSalesBonus = 1.0;
  if (StudioState.currentTrend) {
    if (p.theme === StudioState.currentTrend.topic) {
      baseScore += 5;
      trendSalesBonus *= 1.20;
    }
    if (p.genre === StudioState.currentTrend.genre) {
      baseScore += 4;
      trendSalesBonus *= 1.15;
    }
  }

  // Quality Boost from QA Polish, Live Session, Sequel & Office Level
  baseScore += (p.qualityBoost || 0);
  if (StudioState.officeLevel && typeof OFFICE_UPGRADES_CATALOG !== 'undefined') {
    const off = OFFICE_UPGRADES_CATALOG[StudioState.officeLevel];
    if (off && off.qualityBonus) baseScore += Math.round(off.qualityBonus * 40);
  }

  let totalScorePct = 0;
  let totalFlatScore = 0;
  let totalFanMulti = 1.0;

  getUnlockedResearchEntries().forEach(({ effect }) => {
    if (!doesTechEffectMatchProject(effect, p)) return;
    if (effect.scorePct) totalScorePct += effect.scorePct;
    if (effect.flatScore) totalFlatScore += Math.floor(effect.flatScore / 2);
    if (effect.fanMultiplier) totalFanMulti *= effect.fanMultiplier;
  });

  const qualityMulti = StudioState.qualityStandardMulti || 1.0;
  let finalScore = Math.round(baseScore * synergyMult * qualityMulti);

  if (totalScorePct > 0) {
    finalScore = Math.round(finalScore * (1 + totalScorePct / 100));
  }
  finalScore += totalFlatScore;

  // Target Audience compatibility evaluation
  const audienceId = p.audience || 'everyone';
  const audCompatFn = (typeof getAudienceCompatibility === 'function')
    ? getAudienceCompatibility
    : getGlobalValue('getAudienceCompatibility', null);
  const audienceFit = (typeof audCompatFn === 'function') ? audCompatFn(p.theme, p.genre, audienceId) : 2;
  let audienceSalesMulti = 1.0;
  if (audienceFit === 3) {
    finalScore += 4;
    audienceSalesMulti = 1.15;
  } else if (audienceFit === 1) {
    finalScore -= 5;
    audienceSalesMulti = 0.75;
  }

  finalScore = Math.min(99, Math.max(45, finalScore + Math.floor(Math.random() * 7) - 3));

  let marketingMult = 1.0;
  if (StudioState.marketingCampaign) {
    marketingMult += (StudioState.marketingCampaign.hypeBoost / 100);
  }
  const sequelSalesMulti = (p.sequelNumber && p.sequelNumber > 1) ? 1.20 : 1.0;

  const platName = p.platform || ((typeof getAvailablePlatforms === 'function') ? getAvailablePlatforms(StudioState.year, StudioState.unlockedPlatforms)[0]?.name : "Hand-Abakus");
  const platform = (typeof PLATFORMS !== 'undefined' ? PLATFORMS.find(pl => pl.name === platName) : null) || { market_multi: (p.platformMarketMulti || 1.0) };
  const platformMulti = platform.market_multi || 1.0;
  const salesMultiplier = StudioState.salesMultiplier || 1.0;

  const publisher = resolvePublisher(p.publisherId || 'self_pub');
  const pubReachMulti = Number(publisher.reachMulti) || 1.0;
  const pubRoyaltyCut = Math.max(0, Math.min(100, Number(publisher.royaltyCut) || 0));
  const pubMinScore = Number(publisher.minScore) || 0;

  const baseSales = Math.round(finalScore * 400 * marketingMult * platformMulti * salesMultiplier * trendSalesBonus * sequelSalesMulti * audienceSalesMulti * pubReachMulti);
  const fanBonus = Math.round(StudioState.fans * (finalScore / 100) * 1.5);
  const totalSales = Math.max(0, Math.round(baseSales + fanBonus));
  const grossCash = Math.round(totalSales * 2.2);
  const royaltyCutCash = Math.round(grossCash * (pubRoyaltyCut / 100));
  const earnedCash = Math.max(0, grossCash - royaltyCutCash);

  let earnedFans = Math.round(finalScore * 18 * marketingMult * totalFanMulti);

  const earnedRP = Math.max(3, Math.round(finalScore / 9));

  StudioState.cash += earnedCash;
  StudioState.fans += earnedFans;
  StudioState.rp += earnedRP;

  let publisherGoalMet = null;
  if (pubMinScore > 0) {
    if (finalScore >= pubMinScore) {
      publisherGoalMet = true;
      StudioState.fans += 300;
      earnedFans += 300;
    } else {
      publisherGoalMet = false;
      StudioState.fans = Math.max(0, StudioState.fans - 100);
    }
  }

  const stars = (typeof getCompatibilityStars === 'function') ? getCompatibilityStars(p.theme, p.genre) : 2;
  const finishedGame = {
    id: Date.now(),
    title: p.title,
    theme: p.theme,
    genre: p.genre,
    engineId: p.engineId || 'engine_basic_1',
    platform: platName,
    platformMulti: platformMulti,
    gameplay: gpVal,
    sound: sndVal,
    audioPts: p.audioPts || 0,
    audience: audienceId,
    audienceCompatibility: audienceFit,
    publisherId: publisher.id,
    publisherGoalMet: publisherGoalMet,
    bugs: p.bugs || 0,
    synergyStars: stars,
    sequelNumber: p.sequelNumber || 1,
    postMortemDone: false,
    postMortemReport: '',
    patched: false,
    dlcCount: 0,
    score: finalScore,
    sales: totalSales,
    revenue: earnedCash,
    week: StudioState.week,
    year: StudioState.year
  };

  StudioState.releasedGames.unshift(finishedGame);

  const curYear = StudioState.year;
  const ostFormat = curYear < 1963 ? "Schellack / Vinyl" :
                    curYear < 1982 ? "Kassette / Vinyl" :
                    curYear < 2000 ? "CD / Kassette" : "Digital / Streaming";

  const royaltyWeekly = Math.max(50, Math.round(earnedCash / 16));
  StudioState.soundtrackLabel.unshift({
    id: Date.now() + 1,
    title: `${p.title} (OST)`,
    gameTitle: p.title,
    format: ostFormat,
    revenuePerWeek: royaltyWeekly,
    totalRevenue: 0
  });

  StudioState.activeProject = null;
  const devCard = document.getElementById('active-project-card');
  if (devCard) devCard.style.display = 'none';

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('drumroll');
    setTimeout(() => {
      AudioEngine.playSound('success');
      AudioEngine.vibrate([60, 40, 60]);
      AudioEngine.speak(t('dev_finished', {
        title: finishedGame.title,
        score: finalScore,
        rev: formatMoney(earnedCash),
        fans: earnedFans
      }), true);
    }, 1000);
  }

  if (typeof updateHUD === 'function') updateHUD();
  if (typeof renderReleasedGames === 'function') renderReleasedGames();
}

function analyzePostMortem(gameId) {
  const isEn = StudioState.language === 'en';
  const game = gameId
    ? StudioState.releasedGames.find(g => String(g.id) === String(gameId))
    : StudioState.releasedGames[0];
  if (!game) return false;
  if (game.postMortemDone) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'Post-Mortem report already completed for this game!' : 'Post-Mortem Spielbericht wurde für diesen Titel bereits erstellt!');
    }
    return false;
  }
  game.postMortemDone = true;
  const stars = (typeof getCompatibilityStars === 'function') ? getCompatibilityStars(game.theme, game.genre) : 2;
  const ideal = (typeof getIdealSlidersForGenre === 'function') ? getIdealSlidersForGenre(game.genre) : { gameplay: 70, sound: 75 };
  StudioState.rp += 10;
  StudioState.fans += 200;

  let audienceFeedback = '';
  const audCompatFn = (typeof getAudienceCompatibility === 'function')
    ? getAudienceCompatibility
    : getGlobalValue('getAudienceCompatibility', null);
  if (typeof audCompatFn === 'function') {
    const audienceId = game.audience || 'everyone';
    const audCatalog = (typeof AUDIENCE_CATALOG !== 'undefined' && Array.isArray(AUDIENCE_CATALOG))
      ? AUDIENCE_CATALOG
      : getGlobalValue('AUDIENCE_CATALOG', []);
    const audSpec = audCatalog.find(a => a.id === audienceId);
    const audLabel = audSpec ? (isEn ? audSpec.name_en : audSpec.name) : audienceId;
    const audFit = audCompatFn(game.theme, game.genre, audienceId);
    const fitLabel = isEn
      ? (audFit === 3 ? 'Perfect fit' : (audFit === 1 ? 'Mismatch' : 'Neutral'))
      : (audFit === 3 ? 'Perfekt' : (audFit === 1 ? 'Unpassend' : 'Neutral'));
    audienceFeedback = isEn
      ? ` Audience (${audLabel}): ${fitLabel} (${audFit}/3).`
      : ` Zielgruppe (${audLabel}): ${fitLabel} (${audFit}/3).`;
  }

  game.postMortemReport = isEn
    ? `Post-Mortem "${game.title}": Synergy ${stars}/3 stars (${game.theme} + ${game.genre}).${audienceFeedback} Ideal for ${game.genre}: Gameplay ${ideal.gameplay}%, Sound ${ideal.sound}%. Reward: +10 RP, +200 Fans!`
    : `Spielbericht "${game.title}": Synergie ${stars}/3 Sterne (${game.theme} + ${game.genre}).${audienceFeedback} Ideal für ${game.genre}: Gameplay ${ideal.gameplay}%, Sound ${ideal.sound}%. Belohnung: +10 FP, +200 Fans!`;

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.speak(game.postMortemReport, true);
  }
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof renderReleasedGames === 'function') renderReleasedGames();
  return true;
}

function releaseGamePatch(gameId) {
  const isEn = StudioState.language === 'en';
  const game = gameId
    ? StudioState.releasedGames.find(g => String(g.id) === String(gameId))
    : StudioState.releasedGames[0];
  if (!game) return false;
  if (game.patched || (game.bugs || 0) <= 0) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'No bugs to patch!' : 'Keine offenen Bugs für einen Patch vorhanden!');
    }
    return false;
  }
  const cost = 1500;
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return false;
  }
  StudioState.cash -= cost;
  game.bugs = 0;
  game.patched = true;
  const bonusRev = 2500;
  game.revenue += bonusRev;
  game.sales += 600;
  StudioState.cash += bonusRev;
  StudioState.fans += 150;

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.speak(isEn
      ? `Patch released for ${game.title}! Fixed all bugs, +150 Fans, +${formatMoney(bonusRev)} sales!`
      : `Patch für ${game.title} veröffentlicht! Alle Bugs behoben, +150 Fans, +${formatMoney(bonusRev)} Umsatz!`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof renderReleasedGames === 'function') renderReleasedGames();
  return true;
}

function releaseGameDLC(gameId) {
  const isEn = StudioState.language === 'en';
  const game = gameId
    ? StudioState.releasedGames.find(g => String(g.id) === String(gameId))
    : StudioState.releasedGames[0];
  if (!game) return false;
  if ((game.dlcCount || 0) >= 2) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'Maximum of 2 Addons/DLCs already released for this title!' : 'Maximal 2 Addons/DLCs für diesen Titel bereits veröffentlicht!');
    }
    return false;
  }
  const cost = 4000;
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return false;
  }
  StudioState.cash -= cost;
  game.dlcCount = (game.dlcCount || 0) + 1;
  const bonusRev = Math.max(6000, Math.round(game.revenue * 0.30));
  const bonusSales = Math.max(1200, Math.round(game.sales * 0.25));
  game.revenue += bonusRev;
  game.sales += bonusSales;
  StudioState.cash += bonusRev;
  StudioState.fans += 250;
  StudioState.rp += 5;

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('cash');
    AudioEngine.speak(isEn
      ? `Released Addon/DLC #${game.dlcCount} for ${game.title}: +${formatMoney(bonusRev)} revenue, +250 Fans, +5 RP!`
      : `Addon/DLC #${game.dlcCount} für ${game.title} veröffentlicht: +${formatMoney(bonusRev)} Umsatz, +250 Fans, +5 FP!`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof renderReleasedGames === 'function') renderReleasedGames();
  return true;
}

[
  typeof window !== 'undefined' ? window : null,
  typeof global !== 'undefined' ? global : null
].forEach(target => {
  if (!target) return;
  target.generateRandomTitle = generateRandomTitle;
  target.startDevelopment = startDevelopment;
  target.tickProjectProgress = tickProjectProgress;
  target.polishActiveProject = polishActiveProject;
  target.boostActiveProjectAudio = boostActiveProjectAudio;
  target.finishDevelopment = finishDevelopment;
  target.analyzePostMortem = analyzePostMortem;
  target.releaseGamePatch = releaseGamePatch;
  target.releaseGameDLC = releaseGameDLC;
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateRandomTitle, startDevelopment, tickProjectProgress,
    polishActiveProject, boostActiveProjectAudio, finishDevelopment,
    analyzePostMortem, releaseGamePatch, releaseGameDLC
  };
}
