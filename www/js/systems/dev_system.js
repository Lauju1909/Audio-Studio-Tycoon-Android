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

function startDevelopment() {
  const cost = 5000;
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return;
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

  const assignedStaffIds = [];
  const checkedBoxes = document.querySelectorAll('input[name="dev-staff"]:checked');
  if (checkedBoxes && checkedBoxes.length > 0) {
    checkedBoxes.forEach(cb => assignedStaffIds.push(parseInt(cb.value, 10)));
  } else if (StudioState.staff.length > 0) {
    assignedStaffIds.push(StudioState.staff[0].id);
  }

  StudioState.cash -= cost;
  if (typeof closeDevModal === 'function') closeDevModal();

  StudioState.activeProject = {
    title, theme, genre, engineId, gameplay, sound,
    assignedStaffIds,
    progress: 0,
    features: 0,
    audioPts: 0,
    bugs: 0
  };

  const devCard = document.getElementById('active-project-card');
  if (devCard) devCard.style.display = 'flex';
  const devTitle = document.getElementById('dev-game-title');
  if (devTitle) devTitle.textContent = title;
  const finishBtn = document.getElementById('btn-finish-dev');
  if (finishBtn) finishBtn.style.display = 'none';

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('buy');
    AudioEngine.vibrate(40);
    AudioEngine.speak(t('dev_started', { title, theme, genre }));
  }
  if (typeof updateHUD === 'function') updateHUD();
}

function tickProjectProgress() {
  const p = StudioState.activeProject;
  if (!p) return;

  const engine = StudioState.customEngines.find(e => e.id === p.engineId) || StudioState.customEngines[0];
  const engineAudioBonus = engine ? engine.audioBonus : 5;
  const engineTechBonus = engine ? engine.techBonus : 5;

  const hasChiptune = StudioState.unlockedTech.includes('chiptune');
  const hasPolyphonic = StudioState.unlockedTech.includes('polyphonic');
  const hasDSP = StudioState.unlockedTech.includes('dsp_effects');
  const has3D = StudioState.unlockedTech.includes('binaural_3d');
  const hasAI = StudioState.unlockedTech.includes('ai_composition');

  let progressStep = 10;
  if (hasAI) progressStep += 4;

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

  const featGained = Math.floor(Math.random() * 3) + 1 + Math.round(coderSkill * 1.5) + Math.round(writerSkill * 2) + Math.round(engineTechBonus / 3);
  p.features += featGained;

  let soundGained = Math.floor(Math.random() * 4) + 2 + Math.round(soundSkill * 3) + Math.round(engineAudioBonus / 2);
  if (hasPolyphonic) soundGained += 2;
  if (hasDSP) soundGained = Math.round(soundGained * 1.2);
  if (has3D) soundGained = Math.round(soundGained * 1.3);
  if (hasChiptune && (p.theme === 'Retro' || p.theme === 'Cyberpunk')) soundGained = Math.round(soundGained * 1.25);
  p.audioPts += soundGained;

  let bugChance = 0.35;
  if (hasDSP) bugChance *= 0.8;
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

function finishDevelopment() {
  const p = StudioState.activeProject;
  if (!p) return;

  const synergyTable = (typeof THEME_GENRE_SYNERGIES !== 'undefined' ? THEME_GENRE_SYNERGIES[p.theme] : null) || {};
  const synergyMult = synergyTable[p.genre] || 1.0;

  let baseScore = 65;
  if (p.sound >= 60) baseScore += 8;
  if (p.audioPts > 50) baseScore += 10;
  if (p.audioPts > 120) baseScore += 8;

  if (p.features > 40) baseScore += 6;
  if (p.bugs === 0) baseScore += 8;
  else if (p.bugs > 6) baseScore -= Math.min(25, p.bugs * 3);

  let finalScore = Math.round(baseScore * synergyMult);

  if (StudioState.unlockedTech.includes('surround_51') && (p.genre === 'Action' || p.theme === 'Horror')) {
    finalScore += 8;
  }
  if (StudioState.unlockedTech.includes('raytracing_audio')) {
    finalScore += 12;
  }

  finalScore = Math.min(99, Math.max(45, finalScore + Math.floor(Math.random() * 7) - 3));

  let marketingMult = 1.0;
  if (StudioState.marketingCampaign) {
    marketingMult += (StudioState.marketingCampaign.hypeBoost / 100);
  }

  const baseSales = finalScore * 400 * marketingMult;
  const fanBonus = Math.round(StudioState.fans * (finalScore / 100) * 1.5);
  const earnedCash = Math.round((baseSales + fanBonus) * 2.2);

  let earnedFans = Math.round(finalScore * 18 * marketingMult);
  if (StudioState.unlockedTech.includes('binaural_3d')) {
    earnedFans = Math.round(earnedFans * 1.5);
  }

  const earnedRP = Math.max(3, Math.round(finalScore / 9));

  StudioState.cash += earnedCash;
  StudioState.fans += earnedFans;
  StudioState.rp += earnedRP;

  const finishedGame = {
    id: Date.now(),
    title: p.title,
    theme: p.theme,
    genre: p.genre,
    score: finalScore,
    sales: Math.round(baseSales + fanBonus),
    revenue: earnedCash,
    week: StudioState.week,
    year: StudioState.year
  };

  StudioState.releasedGames.unshift(finishedGame);

  const royaltyWeekly = Math.max(50, Math.round(earnedCash / 16));
  StudioState.soundtrackLabel.unshift({
    id: Date.now() + 1,
    title: `${p.title} (OST)`,
    gameTitle: p.title,
    format: "Digital / Vinyl",
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

if (typeof window !== 'undefined') {
  window.generateRandomTitle = generateRandomTitle;
  window.startDevelopment = startDevelopment;
  window.tickProjectProgress = tickProjectProgress;
  window.finishDevelopment = finishDevelopment;
}
