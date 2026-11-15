/**
 * Audio Studio Tycoon - Weekly Simulation Loop & Historical Timeline System
 * Full Historical Progression: 1930 - 2026 (48 Weeks / Year, Year Events, Platform Retiring, Feature Unlocks)
 */

function startWeeklyLoop() {
  if (StudioState.timerInterval) {
    clearInterval(StudioState.timerInterval);
    StudioState.timerInterval = null;
  }
  const speed = Math.max(0.5, Number(StudioState.gameSpeed) || 1);
  const intervalMs = Math.round(3500 / speed);
  StudioState.timerInterval = setInterval(() => {
    if (!StudioState.isPaused) {
      tickWeek();
    }
  }, intervalMs);
}

function togglePause() {
  StudioState.isPaused = !StudioState.isPaused;
  const isEn = StudioState.language === 'en';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('click');
    AudioEngine.speak(StudioState.isPaused
      ? (isEn ? 'Simulation paused' : 'Simulation pausiert')
      : (isEn ? 'Simulation resumed' : 'Simulation läuft weiter'));
  }
  if (typeof updateHUD === 'function') updateHUD();
  return StudioState.isPaused;
}

function setGameSpeed(speed) {
  StudioState.gameSpeed = Number(speed) || 1;
  StudioState.isPaused = false;
  startWeeklyLoop();
  const isEn = StudioState.language === 'en';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('click');
    AudioEngine.speak(isEn ? `Game speed: ${StudioState.gameSpeed}x` : `Spielgeschwindigkeit: ${StudioState.gameSpeed}x`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  return StudioState.gameSpeed;
}

function manualTickWeek() {
  tickWeek();
  const isEn = StudioState.language === 'en';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('click');
    AudioEngine.speak(isEn
      ? `Advanced to Year ${StudioState.year}, Week ${StudioState.week}. Cash: ${formatMoney(StudioState.cash)}`
      : `Weiter zu Jahr ${StudioState.year}, Woche ${StudioState.week}. Kontostand: ${formatMoney(StudioState.cash)}`);
  }
}

function acceptContract(contractId) {
  const isEn = StudioState.language === 'en';
  if (StudioState.activeContract) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'A contract is already in progress!' : 'Es läuft bereits eine Auftragsarbeit!');
    }
    return false;
  }
  const catalog = (typeof CONTRACTS_CATALOG !== 'undefined') ? CONTRACTS_CATALOG : [];
  const spec = catalog.find(c => c.id === contractId) || catalog[0];
  if (!spec) return false;

  const eraScale = (StudioState.year >= 1990) ? 2.5 : (StudioState.year >= 1970 ? 1.6 : 1.0);
  const scaledReward = Math.round((spec.reward * eraScale) / 100) * 100;
  const scaledPenalty = Math.round((spec.penalty * eraScale) / 100) * 100;

  StudioState.activeContract = {
    id: spec.id,
    name: spec.name,
    name_en: spec.name_en,
    category: spec.category,
    reward: scaledReward,
    penalty: scaledPenalty,
    requiredPoints: spec.requiredPoints,
    currentPoints: 0,
    weeksLeft: spec.weeks
  };

  if (typeof closeContractsModal === 'function') closeContractsModal();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    const cName = isEn ? spec.name_en : spec.name;
    AudioEngine.speak(isEn
      ? `Contract accepted: ${cName} (${formatMoney(scaledReward)}, ${spec.weeks} weeks)`
      : `Auftrag angenommen: ${cName} (${formatMoney(scaledReward)}, ${spec.weeks} Wochen)`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

function tickContractProgress() {
  const ac = StudioState.activeContract;
  if (!ac) return;
  const isEn = StudioState.language === 'en';

  let teamPts = 15;
  if (Array.isArray(StudioState.staff)) {
    StudioState.staff.forEach(emp => {
      if ((emp.onVacationWeeks || 0) <= 0) {
        teamPts += (emp.skill || 1) * 8;
      }
    });
  }
  ac.currentPoints += teamPts;

  if (ac.currentPoints >= ac.requiredPoints) {
    StudioState.cash += ac.reward;
    StudioState.rp += 2;
    const cName = isEn ? (ac.name_en || ac.name) : ac.name;
    const reward = ac.reward;
    StudioState.activeContract = null;
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('cash');
      AudioEngine.speak(isEn
        ? `Contract "${cName}" completed! Earned ${formatMoney(reward)} and +2 RP!`
        : `Auftragsarbeit "${cName}" abgeschlossen! ${formatMoney(reward)} und +2 FP erhalten!`);
    }
  } else {
    ac.weeksLeft--;
    if (ac.weeksLeft <= 0) {
      StudioState.cash -= ac.penalty;
      const cName = isEn ? (ac.name_en || ac.name) : ac.name;
      const pen = ac.penalty;
      StudioState.activeContract = null;
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.playSound('error');
        AudioEngine.speak(isEn
          ? `Contract "${cName}" missed deadline! Penalty: -${formatMoney(pen)}`
          : `Auftragsfrist für "${cName}" abgelaufen! Vertragsstrafe: -${formatMoney(pen)}`);
      }
    }
  }
}

function upgradeStudioOffice() {
  const isEn = StudioState.language === 'en';
  const catalog = (typeof OFFICE_UPGRADES_CATALOG !== 'undefined') ? OFFICE_UPGRADES_CATALOG : [];
  const nextLevel = (StudioState.officeLevel || 0) + 1;
  const nextSpec = catalog[nextLevel];
  if (!nextSpec) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'Maximum studio campus level already reached!' : 'Maximale Studio-Ausbaustufe bereits erreicht!');
    }
    return false;
  }
  if (StudioState.cash < nextSpec.cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(nextSpec.cost) }));
    }
    return false;
  }
  StudioState.cash -= nextSpec.cost;
  StudioState.officeLevel = nextLevel;
  StudioState.prestige = (StudioState.prestige || 0) + 10;
  const oName = isEn ? nextSpec.name_en : nextSpec.name;
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.speak(isEn
      ? `Upgraded studio to ${oName}! Max staff: ${nextSpec.maxStaff}, Quality bonus: +${Math.round(nextSpec.qualityBonus * 100)}%!`
      : `Tonstudio ausgebaut zu ${oName}! Max. Team: ${nextSpec.maxStaff}, Qualitätsbonus: +${Math.round(nextSpec.qualityBonus * 100)}%!`);
  }
  if (typeof renderStaffList === 'function') renderStaffList();
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

function processAnnualTransition() {
  // 1. GOTY Awards
  if (typeof handleAnnualAwards === 'function') {
    handleAnnualAwards();
  }

  const currentYear = StudioState.year;

  // 2. Historical Year Event Processing
  const event = (typeof getYearEvent === 'function') ? getYearEvent(currentYear) : ((typeof YEAR_EVENTS !== 'undefined') ? YEAR_EVENTS[currentYear] : null);
  if (event) {
    const effectType = event.effect;
    const val = event.value;

    switch (effectType) {
      case 'money':
        StudioState.cash += val;
        break;
      case 'money_multi':
        StudioState.cash = Math.round(StudioState.cash * val);
        break;
      case 'fans':
        StudioState.fans += val;
        break;
      case 'hype':
        StudioState.hype = Math.min(250, (StudioState.hype || 50) + val);
        break;
      case 'hype_multi':
        StudioState.hypeMultiplier = (StudioState.hypeMultiplier || 1.0) * val;
        break;
      case 'rp':
        StudioState.rp += val;
        break;
      case 'prestige':
        StudioState.prestige = (StudioState.prestige || 0) + val;
        break;
      case 'tax_increase':
        StudioState.taxRate = Math.max(0, Math.min(0.99, (StudioState.taxRate || 0.1) + val));
        break;
      case 'sales_multi':
      case 'market_boom':
      case 'market_crash':
      case 'digital_sales':
      case 'crowdfunding':
        StudioState.salesMultiplier = (StudioState.salesMultiplier || 1.0) * val;
        break;
      case 'logic_boost':
        StudioState.logicMultiplier = (StudioState.logicMultiplier || 1.0) * val;
        break;
      case 'dev_speed':
        StudioState.devSpeedMultiplier = (StudioState.devSpeedMultiplier || 1.0) * val;
        break;
      case 'interest_increase':
        StudioState.loanInterestRate = (StudioState.loanInterestRate || 0.005) + val;
        break;
      case 'marketing_rev':
        StudioState.marketingEfficiency = (StudioState.marketingEfficiency || 1.0) * val;
        break;
      case 'streamer_impact':
        StudioState.streamerHypeMulti = (StudioState.streamerHypeMulti || 1.0) * val;
        break;
      case 'subscription_boom':
      case 'subscription_standard':
        StudioState.subscriptionMulti = (StudioState.subscriptionMulti || 1.0) * val;
        break;
      case 'quality_standard':
      case 'story_standard':
      case 'graphics_standard':
      case 'complexity_boost':
      case 'story_boost':
      case 'multiplayer_boost':
        StudioState.qualityStandardMulti = (StudioState.qualityStandardMulti || 1.0) * val;
        break;
      case 'trend':
        if (val && typeof val === 'object') {
          StudioState.currentTrend = {
            topic: val.topic || (StudioState.currentTrend ? StudioState.currentTrend.topic : 'Radio-Drama'),
            genre: val.genre || (StudioState.currentTrend ? StudioState.currentTrend.genre : 'Action')
          };
        }
        break;
      case 'trend_topic':
        if (!StudioState.currentTrend) StudioState.currentTrend = {};
        StudioState.currentTrend.topic = val;
        break;
      case 'trend_genre':
        if (!StudioState.currentTrend) StudioState.currentTrend = {};
        StudioState.currentTrend.genre = val;
        break;
      case 'trend_difficulty':
        StudioState.difficultyTrend = val;
        break;
      case 'unlock_tech':
        if (!StudioState.unlockedTech) StudioState.unlockedTech = [];
        if (!StudioState.unlockedTech.includes(val)) {
          StudioState.unlockedTech.push(val);
        }
        break;
      case 'unlock_genre':
        if (!StudioState.unlockedGenres) StudioState.unlockedGenres = [];
        if (!StudioState.unlockedGenres.includes(val)) {
          StudioState.unlockedGenres.push(val);
        }
        break;
      case 'salary_increase':
        StudioState.salaryMultiplier = (StudioState.salaryMultiplier || 1.0) * (1 + (val > 1 ? val - 1 : val));
        break;
      case 'cost_increase':
        StudioState.devCostMultiplier = (StudioState.devCostMultiplier || 1.0) * (1 + (val > 1 ? val - 1 : val));
        break;
      case 'quality_penalty':
        StudioState.qualityStandardMulti = (StudioState.qualityStandardMulti || 1.0) * Math.max(0.2, (1 - Math.abs(val)));
        break;
      case 'medium_upgrade':
        StudioState.salesMultiplier = (StudioState.salesMultiplier || 1.0) * 1.25;
        break;
      case 'market_shift':
      case 'rival_boost':
        StudioState.salesMultiplier = (StudioState.salesMultiplier || 1.0) * (val || 1.0);
        break;
      case 'server_costs':
        StudioState.serverCosts = (StudioState.serverCosts || 0) + Math.round(val * 100);
        break;
      case 'crypto_crash':
        StudioState.hype = Math.max(0, (StudioState.hype || 50) - 35);
        break;
      case 'censorship_risk':
        StudioState.hypeMultiplier = (StudioState.hypeMultiplier || 1.0) * Math.max(0.5, (1 - (val > 1 ? val / 10 : val * 0.2)));
        break;
      case 'unlock_platform':
        if (typeof PLATFORMS !== 'undefined') {
          const match = PLATFORMS.find(p => p.name.toLowerCase().includes(String(val).toLowerCase()));
          if (match && !StudioState.unlockedPlatforms.includes(match.name)) {
            StudioState.unlockedPlatforms.push(match.name);
          }
        }
        break;
      case 'game_end':
        StudioState.isGameOver = true;
        StudioState.gameOverReason = "historical_end";
        if (typeof showGameOverModal === 'function') {
          showGameOverModal();
        }
        break;
    }

    if (!StudioState.eventLog) StudioState.eventLog = [];
    StudioState.eventLog.unshift({
      year: currentYear,
      text: event.text,
      effect: effectType,
      value: val
    });

    const eventText = (typeof t === 'function') ? t(event.text) : event.text;
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('confirm');
      AudioEngine.speak(`${t('year_change', { year: currentYear })} ${eventText}`);
    }

    if (typeof showTimelineEventBanner === 'function') {
      showTimelineEventBanner(currentYear, eventText, event);
    }
  } else {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.speak(t('year_change', { year: currentYear }));
    }
  }

  // 3. Platform Unlocks
  if (typeof getNewlyUnlockedPlatforms === 'function') {
    const newPlats = getNewlyUnlockedPlatforms(currentYear);
    newPlats.forEach(plat => {
      if (!StudioState.unlockedPlatforms) StudioState.unlockedPlatforms = [];
      if (!StudioState.unlockedPlatforms.includes(plat.name)) {
        StudioState.unlockedPlatforms.push(plat.name);
      }
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.speak(t('platform_unlocked', { name: plat.name, type: plat.type }));
      }
    });
  }

  // 4. Platform Retirements
  if (typeof getNewlyRetiredPlatforms === 'function') {
    const retiredPlats = getNewlyRetiredPlatforms(currentYear);
    retiredPlats.forEach(plat => {
      if (StudioState.unlockedPlatforms) {
        StudioState.unlockedPlatforms = StudioState.unlockedPlatforms.filter(name => name !== plat.name);
      }
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.speak(t('platform_retired', { name: plat.name }));
      }
    });
  }

  // 5. Feature Unlocks
  if (typeof getNewlyUnlockedFeatures === 'function') {
    const newFeatures = getNewlyUnlockedFeatures(currentYear);
    newFeatures.forEach(feat => {
      if (!StudioState.unlockedFeatures) StudioState.unlockedFeatures = [];
      if (!StudioState.unlockedFeatures.includes(feat.id)) {
        StudioState.unlockedFeatures.push(feat.id);
      }
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.speak(t('feature_unlocked', { name: feat.name }));
      }
    });
  }

  // 6. Historical Topics Unlocks
  if (typeof getNewlyUnlockedTopics === 'function') {
    const newTopics = getNewlyUnlockedTopics(currentYear);
    newTopics.forEach(topic => {
      if (!StudioState.unlockedTopics) StudioState.unlockedTopics = [];
      if (!StudioState.unlockedTopics.includes(topic.name)) {
        StudioState.unlockedTopics.push(topic.name);
      }
    });
  }

  // 7. Update UI elements affected by features & eras
  if (typeof applyFeatureUnlocksToUI === 'function') {
    applyFeatureUnlocksToUI();
  }
}

function tickWeek() {
  if (StudioState.isGameOver && !StudioState.endlessMode) {
    return;
  }

  StudioState.week++;
  const weeksInYear = StudioState.weeksPerYear || 48;
  if (StudioState.week > weeksInYear) {
    StudioState.week = 1;
    StudioState.year++;
    processAnnualTransition();
  }

  // 1. Passive Royalties from Soundtrack Label (if unlocked)
  const isLabelUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('soundtrack_label', StudioState.year) : (StudioState.year >= 1985);
  if (isLabelUnlocked && StudioState.soundtrackLabel && StudioState.soundtrackLabel.length > 0) {
    let passiveRoyalties = 0;
    const hasAITech = StudioState.unlockedTech && StudioState.unlockedTech.includes('ai_composition');
    const royaltyMultiplier = hasAITech ? 1.35 : 1.0;

    StudioState.soundtrackLabel.forEach(track => {
      const weeklyEarn = Math.round(track.revenuePerWeek * royaltyMultiplier);
      passiveRoyalties += weeklyEarn;
      track.totalRevenue = (track.totalRevenue || 0) + weeklyEarn;
      track.revenuePerWeek = Math.max(10, Math.round(track.revenuePerWeek * 0.985));
    });

    if (passiveRoyalties > 0) {
      StudioState.cash += passiveRoyalties;
    }
  }

  // 2. Staff Payroll & Vacation Recovery
  let totalSalaries = 0;
  if (StudioState.staff) {
    const salaryMulti = StudioState.salaryMultiplier || 1.0;
    StudioState.staff.forEach(emp => {
      totalSalaries += Math.round((emp.salary * salaryMulti) / 4);

      if (emp.onVacationWeeks > 0) {
        emp.onVacationWeeks--;
        emp.fatigue = Math.max(0, emp.fatigue - 25);
        emp.morale = Math.min(100, emp.morale + 15);
      } else if (!StudioState.activeProject) {
        emp.fatigue = Math.max(0, emp.fatigue - 5);
        emp.morale = Math.min(100, emp.morale + 2);
      }
    });
  }

  if (totalSalaries > 0) {
    StudioState.cash -= totalSalaries;
  }

  // Server maintenance expenses
  if (StudioState.serverCosts > 0) {
    StudioState.cash -= StudioState.serverCosts;
  }

  // 3. Weekly Loan Interest
  if (StudioState.loan > 0) {
    const interestRate = StudioState.loanInterestRate || 0.005;
    const interest = Math.round(StudioState.loan * interestRate);
    StudioState.cash -= interest;
  }

  // 4. Marketing Campaign Decay
  if (StudioState.marketingCampaign) {
    StudioState.marketingCampaign.weeksLeft--;
    if (StudioState.marketingCampaign.weeksLeft <= 0) {
      StudioState.marketingCampaign = null;
    }
  }

  // 5. Active Game Development Progress
  if (StudioState.activeProject) {
    if (typeof tickProjectProgress === 'function') tickProjectProgress();
  }

  // 6. Active Contract Work Progress
  if (StudioState.activeContract) {
    tickContractProgress();
  }

  // Auto-save every 4 weeks
  if (StudioState.week % 4 === 0) {
    if (typeof saveGame === 'function') saveGame();
  }

  if (typeof updateHUD === 'function') updateHUD();
}

if (typeof window !== 'undefined') {
  window.startWeeklyLoop = startWeeklyLoop;
  window.togglePause = togglePause;
  window.setGameSpeed = setGameSpeed;
  window.manualTickWeek = manualTickWeek;
  window.acceptContract = acceptContract;
  window.tickContractProgress = tickContractProgress;
  window.upgradeStudioOffice = upgradeStudioOffice;
  window.processAnnualTransition = processAnnualTransition;
  window.tickWeek = tickWeek;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    startWeeklyLoop, togglePause, setGameSpeed, manualTickWeek,
    acceptContract, tickContractProgress, upgradeStudioOffice,
    processAnnualTransition, tickWeek
  };
}
