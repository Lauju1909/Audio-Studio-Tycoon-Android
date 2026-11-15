/**
 * Audio Studio Tycoon - Banking & Finance System
 */

function updateBankModalUI() {
  const max = getMaxLoan();
  const currentLoan = StudioState.loan || 0;
  const interestRate = StudioState.loanInterestRate || 0.005;
  const weeklyInterest = currentLoan > 0 ? Math.round(currentLoan * interestRate) : 0;

  const isEn = StudioState.language === 'en';
  const salaryMulti = StudioState.salaryMultiplier || 1.0;
  const monthlyPayroll = Array.isArray(StudioState.staff)
    ? StudioState.staff.reduce((sum, emp) => sum + Math.round((emp.salary || 0) * salaryMulti), 0)
    : 0;
  const weeklyPayroll = Math.round(monthlyPayroll / 4);

  const isLabelUnlocked = (typeof isFeatureUnlocked === 'function')
    ? isFeatureUnlocked('soundtrack_label', StudioState.year)
    : (StudioState.year >= 1985);
  let weeklyLabelRev = 0;
  if (isLabelUnlocked && Array.isArray(StudioState.soundtrackLabel) && StudioState.soundtrackLabel.length > 0) {
    let labelPct = 0;
    if (typeof RESEARCH_CATALOG !== 'undefined' && Array.isArray(StudioState.unlockedTech)) {
      StudioState.unlockedTech.forEach(techId => {
        const spec = RESEARCH_CATALOG.find(item => item.id === techId);
        if (spec && spec.effect && spec.effect.labelRoyaltyPct) {
          labelPct += spec.effect.labelRoyaltyPct;
        }
      });
    } else if (Array.isArray(StudioState.unlockedTech) && StudioState.unlockedTech.includes('ai_composition')) {
      labelPct = 35;
    }
    const royaltyMultiplier = 1 + (labelPct / 100);
    StudioState.soundtrackLabel.forEach(track => {
      weeklyLabelRev += Math.round((track.revenuePerWeek || 0) * royaltyMultiplier);
    });
  }

  let weeklyEngineRev = 0;
  if (Array.isArray(StudioState.customEngines)) {
    StudioState.customEngines.forEach(eng => {
      if (eng && eng.licensedOut) {
        weeklyEngineRev += 350 * (eng.techBonus || 5);
      }
    });
  }

  const serverCosts = StudioState.serverCosts || 0;
  const netWeeklyFlow = weeklyLabelRev + weeklyEngineRev - weeklyPayroll - weeklyInterest - serverCosts;
  const netClass = netWeeklyFlow >= 0 ? 'text-green' : 'text-red';
  const netSign = netWeeklyFlow > 0 ? '+' : '';

  const debtInfo = document.getElementById('bank-debt-info');
  if (debtInfo) {
    debtInfo.innerHTML = `
      <div style="background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--card-border);">
        <p><strong>${t('debt_label')}</strong> <span class="text-red" style="font-size: 1.1rem; font-weight: bold;">${formatMoney(currentLoan)}</span></p>
        <p style="font-size: 0.85rem; color: #94a3b8;">${t("max_credit_limit", { amount: formatMoney(max) })}</p>
        <p style="font-size: 0.85rem; color: var(--accent);">${t("weekly_interest", { rate: Number((interestRate * 100).toFixed(2)), cost: formatMoney(weeklyInterest) })}</p>
      </div>
      <div id="bank-weekly-flow" style="background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--card-border);" aria-live="polite">
        <p style="margin-bottom: 6px;"><strong>${isEn ? 'Weekly Financial Flow' : 'Wöchentlicher Finanzfluss'}</strong></p>
        <p style="font-size: 0.85rem; color: #94a3b8;">${isEn ? 'Weekly Payroll' : 'Wöchentliche Gehälter'}: <span class="text-red">-${formatMoney(weeklyPayroll)}</span></p>
        <p style="font-size: 0.85rem; color: #94a3b8;">${isEn ? 'Soundtrack Label Revenue' : 'Soundtrack-Label Einnahmen'}: <span class="text-green">+${formatMoney(weeklyLabelRev)}</span></p>
        <p style="font-size: 0.85rem; color: #94a3b8;">${isEn ? 'Engine Licensing Revenue' : 'Engine-Lizenz Einnahmen'}: <span class="text-green">+${formatMoney(weeklyEngineRev)}</span></p>
        <p style="font-size: 0.85rem; color: #94a3b8;">${isEn ? 'Weekly Loan Interest' : 'Wöchentliche Kreditzinsen'}: <span class="text-red">-${formatMoney(weeklyInterest)}</span></p>
        ${serverCosts > 0 ? `<p style="font-size: 0.85rem; color: #94a3b8;">${isEn ? 'Server Maintenance' : 'Server-Betriebskosten'}: <span class="text-red">-${formatMoney(serverCosts)}</span></p>` : ''}
        <p style="font-size: 0.9rem; margin-top: 6px; border-top: 1px solid var(--card-border); padding-top: 6px;">
          <strong>${isEn ? 'Net Weekly Cashflow' : 'Netto-Cashflow / Woche'}:</strong>
          <span class="${netClass}" style="font-weight: bold;">${netSign}${formatMoney(netWeeklyFlow)}</span>
        </p>
      </div>
    `;
  }
}

function takeLoan(val) {
  const max = getMaxLoan();
  if (StudioState.loan + val > max) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('loan_limit_reached', { max: formatMoney(max) }));
    }
    return;
  }

  StudioState.cash += val;
  StudioState.loan += val;
  updateBankModalUI();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('cash');
    AudioEngine.speak(t('loan_taken', { amount: formatMoney(val) }));
  }
  if (typeof updateHUD === 'function') updateHUD();
}

function repayLoan(val) {
  if (StudioState.loan <= 0) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('no_debt_to_repay'));
    }
    return;
  }

  const repayAmount = Math.min(StudioState.loan, val);
  if (StudioState.cash < repayAmount) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(StudioState.language === 'en' ? 'Insufficient funds to repay loan!' : 'Nicht genügend Guthaben zur Kredittilgung.');
    }
    return;
  }

  StudioState.cash -= repayAmount;
  StudioState.loan -= repayAmount;
  updateBankModalUI();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.speak(t('loan_repaid', { amount: formatMoney(repayAmount) }));
  }
  if (typeof updateHUD === 'function') updateHUD();
}

function repayAllLoans() {
  if (StudioState.loan <= 0) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('no_debt_to_repay'));
    }
    return;
  }
  repayLoan(StudioState.loan);
}

if (typeof window !== 'undefined') {
  window.updateBankModalUI = updateBankModalUI;
  window.takeLoan = takeLoan;
  window.repayLoan = repayLoan;
  window.repayAllLoans = repayAllLoans;
}
