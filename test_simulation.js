const assert = require('assert');
const fs = require('fs');

// Mock browser globals
global.window = global;
const mockElements = {};
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => Object.values(mockElements),
  createElement: (tag) => ({
    style: {},
    textContent: '',
    value: '',
    innerHTML: '',
    appendChild: () => {},
    setAttribute: () => {}
  }),
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        id,
        style: {},
        textContent: '',
        value: '',
        innerHTML: '',
        appendChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null
      };
    }
    return mockElements[id];
  }
};
global.localStorage = {
  data: {},
  setItem(k, v) { this.data[k] = String(v); },
  getItem(k) { return this.data[k] || null; },
  removeItem(k) { delete this.data[k]; }
};

// Load code in order
eval(fs.readFileSync('www/audio_engine.js', 'utf8'));
eval(fs.readFileSync('www/sound.js', 'utf8'));
eval(fs.readFileSync('www/tycoon_engine.js', 'utf8'));
eval(fs.readFileSync('www/app.js', 'utf8'));

console.log("=== TEST 1: Initial state & HUD ===");
assert.ok(global.Sound, "Sound compatibility shim should be available");
assert.strictEqual(StudioState.cash, 50000);
assert.strictEqual(StudioState.year, 1980);
assert.strictEqual(StudioState.loan, 0);
updateHUD();

console.log("=== TEST 2: Weekly tick, payroll & loan interest ===");
StudioState.staff.push({
  id: 10,
  name: "Test Staff",
  role: "sound",
  salary: 2000,
  skill: 2,
  fatigue: 50,
  morale: 80,
  onVacationWeeks: 0
});
const cashBefore = StudioState.cash;
tickWeek(); // Should deduct 1 week of salary: 2000/4 = 500 (plus 1500/4 for existing staff = 375 => 875 total)
assert(StudioState.cash < cashBefore, "Cash should decrease from payroll");
assert.strictEqual(StudioState.week, 2);

console.log("=== TEST 3: Vacation fatigue recovery ===");
StudioState.staff[1].onVacationWeeks = 2;
tickWeek();
assert.strictEqual(StudioState.staff[1].onVacationWeeks, 1);
assert(StudioState.staff[1].fatigue < 50, "Fatigue should drop during vacation");

console.log("=== TEST 4: Loan limits, interest & repayment ===");
const maxLoan = getMaxLoan();
assert(maxLoan > 50000, "Max loan should be greater than base 50k");
// Try taking loan exceeding limit
takeLoan(maxLoan + 100000);
assert.strictEqual(StudioState.loan, 0, "Loan over limit should be rejected");

// Take valid loan
takeLoan(25000);
assert.strictEqual(StudioState.loan, 25000);
const cashWithLoan = StudioState.cash;
tickWeek();
// Interest of 25000 * 0.005 = 125 deducted
assert(StudioState.cash < cashWithLoan, "Interest should be deducted");

// Repay partial loan
repayLoan(10000);
assert.strictEqual(StudioState.loan, 15000);

// Repay all
repayAllLoans();
assert.strictEqual(StudioState.loan, 0);

console.log("=== TEST 5: Research technology mechanics ===");
StudioState.rp = 100;
doResearch('dsp_effects', 40);
assert(StudioState.unlockedTech.includes('dsp_effects'), "DSP effects should be unlocked in state");
assert.strictEqual(StudioState.rp, 60, "RP should be deducted");

console.log("=== TEST 6: Custom Engine Workshop ===");
StudioState.cash = 100000;
const prevEnginesCount = StudioState.customEngines.length;
global.prompt = () => "Mega Synth Engine";
buildNewEngine();
assert.strictEqual(StudioState.customEngines.length, prevEnginesCount + 1);
assert.strictEqual(StudioState.customEngines[prevEnginesCount].name, "Mega Synth Engine");

console.log("=== TEST 7: Game Development Lifecycle & Synergies ===");
StudioState.activeProject = {
  title: "Fantasy Epic",
  theme: "Fantasy",
  genre: "RPG",
  engineId: StudioState.customEngines[0].id,
  gameplay: 50,
  sound: 80,
  assignedStaffIds: [StudioState.staff[0].id],
  progress: 90,
  features: 30,
  audioPts: 50,
  bugs: 1
};
tickProjectProgress();
assert(StudioState.activeProject.progress >= 100, "Progress should reach 100%");
finishDevelopment();
assert.strictEqual(StudioState.activeProject, null, "Active project should be cleared on finish");
assert.strictEqual(StudioState.releasedGames.length, 1);
assert.strictEqual(StudioState.releasedGames[0].title, "Fantasy Epic");
assert(StudioState.releasedGames[0].score >= 70, "Fantasy + RPG synergy should give a high score");
assert(StudioState.soundtrackLabel.length > 0, "Soundtrack should be added to label");

console.log("=== TEST 8: Save and Load serialization roundtrip ===");
StudioState.isPaused = false;
StudioState.timerInterval = 99999; // Mock interval
saveGame();

// Clear and restore
const rawSaved = localStorage.getItem('ast_savegame_v5');
assert(rawSaved, "Savegame should exist in localStorage");
const parsed = JSON.parse(rawSaved);
assert.strictEqual(parsed.timerInterval, undefined, "timerInterval should NOT be saved in localStorage");

StudioState.cash = 0;
StudioState.year = 1;
loadGame();
assert(StudioState.cash > 0, "Cash should be restored from save");
assert.strictEqual(StudioState.year, 1980, "Year should be restored");
assert.strictEqual(StudioState.timerInterval, null, "timerInterval should be cleanly null on load");

console.log("=== TEST 9: Language toggle & translations ===");
assert.strictEqual(StudioState.language, "de");
assert.strictEqual(t("app_title"), "Audio Studio Tycoon");
toggleLanguage();
assert.strictEqual(StudioState.language, "en");
assert.strictEqual(t("app_title"), "Audio Studio Tycoon");
assert.strictEqual(t("new_game"), "Develop New Game");

console.log("=== TEST 10: Marketing Campaigns & Decay ===");
StudioState.cash = 50000;
const fansBeforeCampaign = StudioState.fans;
startMarketingCampaign('streamer');
assert.strictEqual(StudioState.cash, 30000, "Streamer marketing costs 20,000 EUR");
assert.strictEqual(StudioState.fans, fansBeforeCampaign + 2500, "Streamer marketing gains 2500 fans");
assert.strictEqual(StudioState.marketingCampaign.weeksLeft, 16);
// Weekly tick should decay marketing campaign
tickWeek();
assert.strictEqual(StudioState.marketingCampaign.weeksLeft, 15);

console.log("=== TEST 11: SoundCon Expo Attendance ===");
StudioState.cash = 100000;
const fansBeforeCon = StudioState.fans;
attendSoundCon('keynote');
assert.strictEqual(StudioState.cash, 75000, "Keynote booth costs 25,000 EUR");
assert.strictEqual(StudioState.fans, fansBeforeCon + 5000, "Keynote booth gains 5,000 fans");

console.log("=== TEST 12: Annual GOTY Awards ===");
StudioState.releasedGames.push({
  title: "Masterpiece Odyssey",
  year: StudioState.year,
  score: 100,
  revenue: 250000
});
// Roll over to new year (week 52 -> week 1 of next year)
StudioState.week = 52;
const cashBeforeAward = StudioState.cash;
tickWeek();
assert.strictEqual(StudioState.week, 1);
assert.strictEqual(StudioState.gotyAwards.length, 1, "Top scored title should win GOTY award");
assert.strictEqual(StudioState.gotyAwards[0].title, "Masterpiece Odyssey");
assert(StudioState.cash > cashBeforeAward + 45000, "GOTY award provides 50k bonus (plus royalties minus payroll)");

console.log("=== TEST 13: Staff Hiring and Termination ===");
global.confirm = () => true;
const staffCountBefore = StudioState.staff.length;
hireNewCandidate('coder');
assert.strictEqual(StudioState.staff.length, staffCountBefore + 1, "Staff count should increment on hire");
const hiredEmp = StudioState.staff[StudioState.staff.length - 1];
assert.strictEqual(hiredEmp.role, 'coder');
assert.strictEqual(hiredEmp.salary, 1500);
fireStaff(hiredEmp.id);
assert.strictEqual(StudioState.staff.length, staffCountBefore, "Staff count should decrement on fire");

console.log("=== TEST 14: EventBus PubSub & Modals ===");
let eventFired = false;
EventBus.on('test:ping', (payload) => {
  if (payload === 'pong') eventFired = true;
});
EventBus.emit('test:ping', 'pong');
assert.strictEqual(eventFired, true, "EventBus should properly deliver events to listeners");

openBankModal();
const modalBank = document.getElementById('modal-bank');
assert.strictEqual(modalBank.style.display, 'flex');
closeBankModal();
assert.strictEqual(modalBank.style.display, 'none');

console.log("\nALL 14 SIMULATION INTEGRATION TESTS PASSED 100%!");

