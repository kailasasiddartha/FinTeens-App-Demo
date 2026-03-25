/* =========================================================================
   FINTEENS STATE MANAGEMENT
   ========================================================================= */

const defaultState = {
  name: "",
  avatar: "rocket",
  age: 15,
  points: 0,
  level: 1,
  wallet: 1000,
  streak: 0,
  marketMomentum: {}, // {assetSymbol: value}
  lastLogin: null,
  quizzesCorrect: 0,
  soundEnabled: true,
  theme: 'dark',
  portfolio: [], // {id, qty, avgPrice}
  goals: [], // {id, name, target, saved, completed}
  expenses: [], // {id, amount, category, note, date, timestamp}
  challenges: {
    quizToday: false,
    tradeToday: false,
    budgetToday: false,
    goalToday: false,
    mentorToday: false,
    expenseToday: false
  },
  weeklyProgress: {
    weekStart: null,
    quizzes: 0,
    trades: 0,
    lessons: 0
  },
  dailyRewardClaimed: null, // date string
  xpMultiplier: 1,
  xpBoostActive: false,
  xpBoostExpiry: 0,
  streakDays: [],
  scenariosPlayed: [],
  scenariosCompleted: 0,
  analyticsHistory: [],
  marketNews: [],
  achievements: [],   // Unlocked badge IDs
  tradeHistory: [],   // {asset, type, qty, price, total, date}
  lessonProgress: {}, // {lessonId: true}
  quizStreak: 0,
  inventory: {
    hintTokens: 2,
    marketFreeze: 1,
    xpShield: 0
  },
  activeBoosts: {
    marketFreezeExpiry: 0,
    xpShieldExpiry: 0
  }
};

let state = { ...defaultState };

let isStorageAvailable = true;

function loadState() {
  try {
    const saved = localStorage.getItem("finteens_data");
    if (saved) {
      state = { ...defaultState, ...JSON.parse(saved) };
      
      // Ensure specific objects exist
      if (!state.inventory) state.inventory = { ...defaultState.inventory };
      if (!state.activeBoosts) state.activeBoosts = { ...defaultState.activeBoosts };
      if (!state.marketMomentum) state.marketMomentum = {};
      if (!state.unlockedSkills) state.unlockedSkills = [];

      // Check reset conditions
      if (state.lastLogin !== todayStr()) {
        checkStreak();
        resetDailies();
        state.lastLogin = todayStr();
        // Re-derive level from points to prevent desync
        state.level = Math.floor(state.points / 1000) + 1;
        saveState(); 
      }
    }
  } catch (err) {
    console.error("FinTeens: Load failed", err);
    isStorageAvailable = false;
  }
}

function saveState() {
  // Record analytics snapshot once per day
  const today = todayStr();
  if (!state.analyticsHistory) state.analyticsHistory = [];
  const lastEntry = state.analyticsHistory[state.analyticsHistory.length - 1];
  if (!lastEntry || lastEntry.date !== today) {
    const nw = calculateNetWorth();
    if (!isNaN(nw)) {
      state.analyticsHistory.push({ date: today, xp: state.points, netWorth: nw });
      if (state.analyticsHistory.length > 30) state.analyticsHistory.shift();
    }
  }

  if (isStorageAvailable) {
    try {
      localStorage.setItem("finteens_data", JSON.stringify(state));
    } catch (err) {
      console.warn("FinTeens: Save failed (Storage full?)", err);
      // We still keep state in memory
    }
  }
  if (typeof updateAllUI === "function") updateAllUI();
}

function checkStreak() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  
  if (state.lastLogin !== yStr && state.lastLogin !== todayStr()) {
    // Check for XP Shield
    if (state.activeBoosts?.xpShieldExpiry > Date.now()) {
      if (typeof showToast === "function") showToast("🛡️ XP Shield protected your streak!");
      return; 
    }
    state.streak = 0;
  } else if (state.lastLogin === yStr) {
    state.streak += 1;
  }
}

function resetDailies() {
  state.challenges = {
    quizToday: false,
    tradeToday: false,
    budgetToday: false,
    goalToday: false,
    mentorToday: false,
    expenseToday: false
  };
}

function showAchievement(title, desc, icon) {
  if (!state.achievements) state.achievements = [];
  if (!state.achievements.includes(title)) {
    state.achievements.push(title);
    saveState();
    if (typeof renderBadges === "function") renderBadges();
  }
  showToast((icon || "🏆") + " " + title + ": " + desc);
}
