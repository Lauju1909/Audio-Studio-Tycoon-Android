/**
 * Audio Studio Tycoon - Weekly Simulation Loop & Time System
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

function tickWeek() {
  StudioState.week++;
  if (StudioState.week > 52) {
    StudioState.week = 1;
    StudioState.year++;
    if (typeof handleAnnualAwards === 'function') handleAnnualAwards();
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.speak(t('year_change', { year: StudioState.year }));
    }
  }

  // 1. Passive Royalties from Soundtrack Label
  let passiveRoyalties = 0;
  const hasAITech = StudioState.unlockedTech.includes('ai_composition');
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

  // 2. Staff Payroll & Vacation Recovery
  let totalSalaries = 0;
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

  if (totalSalaries > 0) {
    StudioState.cash -= totalSalaries;
  }

  // 3. Weekly Loan Interest (0.5% per week)
  if (StudioState.loan > 0) {
    const interest = Math.round(StudioState.loan * 0.005);
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
  window.tickWeek = tickWeek;
}
