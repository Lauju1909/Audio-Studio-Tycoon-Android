/**
 * Audio Studio Tycoon - Banking & Finance System
 */

function updateBankModalUI() {
  const max = getMaxLoan();
  const currentLoan = StudioState.loan || 0;
  const weeklyInterest = Math.round(currentLoan * 0.005);

  const debtInfo = document.getElementById('bank-debt-info');
  if (debtInfo) {
    debtInfo.innerHTML = `
      <div style="background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--card-border);">
        <p><strong>${t('debt_label')}</strong> <span class="text-red" style="font-size: 1.1rem; font-weight: bold;">${formatMoney(currentLoan)}</span></p>
        <p style="font-size: 0.85rem; color: #94a3b8;">Maximaler Kreditrahmen: ${formatMoney(max)}</p>
        <p style="font-size: 0.85rem; color: var(--accent);">Wöchentliche Kreditzinsen (0.5%): ${formatMoney(weeklyInterest)}</p>
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
