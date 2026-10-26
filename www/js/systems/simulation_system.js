/**
 * Audio Studio Tycoon - Weekly Simulation Loop & Historical Timeline System
 * Full Historical Progression: 1930 - 2026 (48 Weeks / Year, Year Events, Platform Retiring, Feature Unlocks)
 */

function startWeeklyLoop() {
  if (StudioState.timerInterval) {
    clearInterval(StudioState.timerInterval);
    StudioState.timerInterval = null;
  }
  StudioState.timerInterval = setInterval(() => {
    if (!StudioState.isPaused) {
      tickWeek();
    }
  }, 3500);
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
    StudioState.staff.forEach(emp => {
      totalSalaries += Math.round(emp.salary / 4);

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

  // Auto-save every 4 weeks
  if (StudioState.week % 4 === 0) {
    if (typeof saveGame === 'function') saveGame();
  }

  if (typeof updateHUD === 'function') updateHUD();
}

if (typeof window !== 'undefined') {
  window.startWeeklyLoop = startWeeklyLoop;
  window.processAnnualTransition = processAnnualTransition;
  window.tickWeek = tickWeek;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { startWeeklyLoop, processAnnualTransition, tickWeek };
}
