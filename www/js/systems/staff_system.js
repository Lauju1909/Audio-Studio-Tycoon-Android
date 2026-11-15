/**
 * Audio Studio Tycoon - Staff & Human Resources System
 */

function renderStaffList() {
  const container = document.getElementById('current-staff-list');
  if (!container) return;
  container.innerHTML = '';

  const isEn = StudioState.language === 'en';
  const catalog = (typeof OFFICE_UPGRADES_CATALOG !== 'undefined') ? OFFICE_UPGRADES_CATALOG : [];
  const curLevel = StudioState.officeLevel || 0;
  const curOffice = catalog[curLevel] || { name: 'Hinterhof-Tonkabine (Garage)', name_en: 'Backyard Sound Booth (Garage)', maxStaff: 4, qualityBonus: 0 };
  const nextOffice = catalog[curLevel + 1];

  const officeBox = document.createElement('div');
  officeBox.className = 'staff-item';
  officeBox.style.marginBottom = '10px';
  officeBox.style.borderLeft = '3px solid var(--accent)';
  officeBox.innerHTML = `
    <div>
      <strong>🏢 ${isEn ? curOffice.name_en : curOffice.name}</strong>
      <p style="font-size: 0.8rem; color: #94a3b8;">
        ${isEn ? 'Capacity' : 'Kapazität'}: ${StudioState.staff.length}/${curOffice.maxStaff} • ${isEn ? 'Quality Bonus' : 'Qualitätsbonus'}: +${Math.round((curOffice.qualityBonus || 0) * 100)}%
      </p>
    </div>
    ${nextOffice ? `
      <button class="btn btn-primary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="upgradeStudioOffice(); renderStaffList();">
        ⬆️ ${isEn ? 'Upgrade' : 'Ausbauen'} (${formatMoney(nextOffice.cost)})
      </button>
    ` : `<span class="badge">${isEn ? 'Max Level' : 'Max. Stufe'}</span>`}
  `;
  container.appendChild(officeBox);

  if (StudioState.staff.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.className = 'empty-hint';
    emptyP.textContent = isEn ? 'No staff hired yet.' : 'Bisher keine Mitarbeiter angestellt.';
    container.appendChild(emptyP);
    return;
  }

  StudioState.staff.forEach(emp => {
    const isVacation = emp.onVacationWeeks > 0;
    const roleName = emp.role === 'sound' ? (isEn ? 'Sound Designer' : 'Audio-Designer') :
                     emp.role === 'coder' ? (isEn ? 'Programmer' : 'Programmierer') : (isEn ? 'Writer' : 'Autor');

    const card = document.createElement('div');
    card.className = 'staff-item';
    card.innerHTML = `
      <div>
        <strong>${emp.name} (${roleName})</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">
          ${t("salary_label", { salary: formatMoney(emp.salary) })} • ${t("skill_label", { skill: emp.skill })} • ${t("fatigue_label", { fatigue: emp.fatigue })}
        </p>
        <span class="badge" style="background: ${isVacation ? 'var(--accent)' : 'var(--card-border)'};">
          ${isVacation ? t("on_vacation_status", { weeks: emp.onVacationWeeks }) : t("available_status")}
        </span>
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" ${(emp.skill >= 10 || isVacation) ? 'disabled' : ''} onclick="trainStaffMember(${emp.id})">
          🎓 ${isEn ? 'Train (2,500)' : 'Schulen (2.500 €)'}
        </button>
        <button type="button" class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" ${isVacation ? 'disabled' : ''} onclick="sendStaffVacation(${emp.id})">
          🏖️ ${isEn ? 'Vacation' : 'Urlaub'}
        </button>
        <button type="button" class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem; color: var(--red);" onclick="fireStaff(${emp.id})">
          ❌ ${isEn ? 'Fire' : 'Feuern'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function trainStaffMember(empId) {
  const emp = StudioState.staff.find(e => e.id === empId);
  if (!emp) return false;
  const isEn = StudioState.language === 'en';
  if ((emp.onVacationWeeks || 0) > 0) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn
        ? `${emp.name} is currently on vacation and cannot attend training!`
        : `${emp.name} ist derzeit im Urlaub und kann nicht an einer Schulung teilnehmen!`);
    }
    return false;
  }
  const cost = 2500;
  if (emp.skill >= 10) return false;
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return false;
  }
  StudioState.cash -= cost;
  emp.skill = Math.min(10, (emp.skill || 1) + 1);
  renderStaffList();
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.speak(isEn ? `${emp.name} trained to Skill Level ${emp.skill}!` : `${emp.name} auf Skill-Stufe ${emp.skill} geschult!`);
  }
  return true;
}

function sendStaffVacation(empId) {
  const emp = StudioState.staff.find(e => e.id === empId);
  if (!emp) return;

  emp.onVacationWeeks = 4;
  renderStaffList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.speak(t('vacation_sent', { name: emp.name }));
  }
}

function fireStaff(empId) {
  const emp = StudioState.staff.find(e => e.id === empId);
  if (!emp) return;

  if (confirm(StudioState.language === 'en' ? `Are you sure you want to fire ${emp.name}?` : `${emp.name} wirklich entlassen?`)) {
    StudioState.staff = StudioState.staff.filter(e => e.id !== empId);
    renderStaffList();
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(StudioState.language === 'en' ? `${emp.name} has been let go.` : `${emp.name} wurde entlassen.`);
    }
    if (typeof updateHUD === 'function') updateHUD();
  }
}

function hireNewCandidate(role) {
  const isEn = StudioState.language === 'en';
  const catalog = (typeof OFFICE_UPGRADES_CATALOG !== 'undefined') ? OFFICE_UPGRADES_CATALOG : [];
  const curOffice = catalog[StudioState.officeLevel || 0] || { maxStaff: 4 };
  if (StudioState.staff.length >= curOffice.maxStaff) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn
        ? `Studio capacity reached (${curOffice.maxStaff}/${curOffice.maxStaff})! Upgrade your studio first.`
        : `Studio-Kapazität erreicht (${curOffice.maxStaff}/${curOffice.maxStaff})! Baue zuerst dein Tonstudio aus.`);
    }
    return false;
  }

  const names = ["Felix Bach", "Elena Rhythmus", "Klaus Bass", "Julia Synthesizer", "David Code", "Sarah Script", "Linus Pixel", "Anna Story"];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const salary = role === 'sound' ? 1600 : (role === 'coder' ? 1500 : 1300);
  const skill = Math.floor(Math.random() * 2) + 2;

  const newEmp = {
    id: Date.now(),
    name: randomName,
    role: role,
    salary: salary,
    skill: skill,
    fatigue: 0,
    morale: 100,
    onVacationWeeks: 0
  };

  StudioState.staff.push(newEmp);
  renderStaffList();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    const roleLabel = isEn
      ? (role === 'sound' ? 'Sound Designer' : (role === 'coder' ? 'Programmer' : 'Writer'))
      : (role === 'sound' ? 'Audio-Designer' : (role === 'coder' ? 'Programmierer' : 'Autor'));
    AudioEngine.speak(t('hired_success', {
      name: randomName,
      role: roleLabel,
      salary: formatMoney(salary)
    }));
  }
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

if (typeof window !== 'undefined') {
  window.renderStaffList = renderStaffList;
  window.trainStaffMember = trainStaffMember;
  window.sendStaffVacation = sendStaffVacation;
  window.fireStaff = fireStaff;
  window.hireNewCandidate = hireNewCandidate;
}
