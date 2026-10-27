/**
 * Audio Studio Tycoon - Staff & Human Resources System
 */

function renderStaffList() {
  const container = document.getElementById('current-staff-list');
  if (!container) return;
  container.innerHTML = '';

  if (StudioState.staff.length === 0) {
    container.innerHTML = `<p class="empty-hint">${StudioState.language === 'en' ? 'No staff hired yet.' : 'Bisher keine Mitarbeiter angestellt.'}</p>`;
    return;
  }

  StudioState.staff.forEach(emp => {
    const isVacation = emp.onVacationWeeks > 0;
    const roleName = emp.role === 'sound' ? (StudioState.language === 'en' ? 'Sound Designer' : 'Audio-Designer') :
                     emp.role === 'coder' ? (StudioState.language === 'en' ? 'Programmer' : 'Programmierer') : (StudioState.language === 'en' ? 'Writer' : 'Autor');

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
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" ${isVacation ? 'disabled' : ''} onclick="sendStaffVacation(${emp.id})">
          🏖️ Urlaub
        </button>
        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem; color: var(--red);" onclick="fireStaff(${emp.id})">
          ❌ Feuern
        </button>
      </div>
    `;
    container.appendChild(card);
  });
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
    AudioEngine.speak(t('hired_success', {
      name: randomName,
      role: role === 'sound' ? 'Audio-Designer' : (role === 'coder' ? 'Programmierer' : 'Autor'),
      salary: formatMoney(salary)
    }));
  }
  if (typeof updateHUD === 'function') updateHUD();
}

if (typeof window !== 'undefined') {
  window.renderStaffList = renderStaffList;
  window.sendStaffVacation = sendStaffVacation;
  window.fireStaff = fireStaff;
  window.hireNewCandidate = hireNewCandidate;
}
