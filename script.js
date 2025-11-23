// ====== STATE ======
const defaultState = {
  name: "Guest",
  age: null,
  points: 0,
  level: 1,
  quizzesCorrect: 0,
  wallet: 0,
  portfolio: [], // {id, name, qty, avgPrice}
  streak: 0,
  lastLogin: null, // "YYYY-MM-DD"
  badges: [],
  challenges: {
    quizToday: false,
    depositToday: false,
    tradeToday: false,
    mentorToday: false,
    upiToday: false
  },
  quizAnswers: {}, // questionIndex: true/false
};

let state = loadState();

const quizQuestions = [
  {
    q: "You get ₹500 pocket money. What's the smartest first move?",
    options: [
      "Spend it fast before it 'gets over'",
      "Save a part (like 20–30%) before spending",
      "Lend all to a friend for fun",
      "Buy loot boxes in a game immediately"
    ],
    correct: 1
  },
  {
    q: "What is the safest way to use UPI?",
    options: [
      "Share OTP if caller says 'I am from bank'",
      "Type your UPI PIN on any website that asks",
      "Only enter UPI PIN inside your own UPI app",
      "Let strangers scan your QR to test"
    ],
    correct: 2
  },
  {
    q: "What is 'emergency fund'?",
    options: [
      "Money kept aside only for shopping",
      "Money you borrow from friends last minute",
      "Money saved for unexpected events like doctor, repairs",
      "Loan you take from any app"
    ],
    correct: 2
  },
  {
    q: "Which one is usually LOWER risk?",
    options: [
      "Random crypto you saw on Instagram",
      "Stocks you never researched",
      "Ponzi schemes promising 'double in 10 days'",
      "Diversified mutual fund from a legit platform"
    ],
    correct: 3
  },
  {
    q: "If RBI increases interest rates on savings, who benefits?",
    options: [
      "People who keep money in savings or FDs",
      "Only people taking loans",
      "Nobody, it is random",
      "Only people who trade crypto"
    ],
    correct: 0
  }
];

let currentQuestionIndex = 0;
let quizScore = calculateQuizScore();

const marketAssets = [
  { id: "FNT", name: "FinTech Nova Token", base: 120 },
  { id: "EDU", name: "EduVerse Learn Coin", base: 80 },
  { id: "GRW", name: "Growth Guild Stock", base: 150 },
];
let marketPrices = {};

const challengeMeta = {
  quizToday: { label: "Finish quiz with at least 3 correct", reward: 40 },
  depositToday: { label: "Deposit into wallet once", reward: 15 },
  tradeToday: { label: "Complete any buy or sell trade", reward: 25 },
  mentorToday: { label: "Ask mentor at least one question", reward: 10 },
  upiToday: { label: "Simulate one UPI payment", reward: 15 }
};

// ====== DOM HELPERS ======
const $ = id => document.getElementById(id);

function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => t.style.display = "none", 2400);
}

function saveState() {
  localStorage.setItem("finteensGamingState", JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem("finteensGamingState");
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (e) {
    console.error(e);
    return { ...defaultState };
  }
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupOnboarding();
  setupWallet();
  setupUPI();
  setupQuiz();
  setupMentor();
  setupTrading();
  setupChallengesUI();
  setupReset();
  checkStreakOnLoad();
  goToInitialScreen();
  updateAllUI();
});

function goToInitialScreen() {
  if (state.name && state.name !== "Guest") {
    $("screen-onboard").classList.add("hidden");
    $("screen-main").classList.remove("hidden");
  } else {
    $("screen-onboard").classList.remove("hidden");
    $("screen-main").classList.add("hidden");
  }
}

function rankFromLevel(level) {
  if (level >= 10) return "Legend";
  if (level >= 7) return "Pro";
  if (level >= 4) return "Skilled";
  if (level >= 2) return "Apprentice";
  return "Rookie";
}

function updateLevelFromPoints() {
  state.level = 1 + Math.floor(state.points / 100);
}

function addXP(amount, reason = "") {
  state.points += amount;
  updateLevelFromPoints();
  saveState();
  updateAllUI();
  if (reason) showToast(`+${amount} XP — ${reason}`);
}

function calculateQuizScore() {
  let s = 0;
  Object.values(state.quizAnswers).forEach(v => { if (v === true) s++; });
  return s;
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function checkStreakOnLoad() {
  const today = todayStr();
  if (!state.lastLogin) {
    state.lastLogin = today;
    state.streak = 1;
  } else {
    if (state.lastLogin !== today) {
      const last = new Date(state.lastLogin);
      const now = new Date(today);
      const diff = (now - last) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        state.streak += 1;
      } else if (diff > 1) {
        state.streak = 1;
      }
      state.lastLogin = today;
    }
  }
  saveState();
}

// ====== NAVIGATION ======
function setupNav() {
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll("#panel-container > .card").forEach(p => p.classList.add("hidden"));
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.remove("hidden");
      }
    });
  });
}

// ====== ONBOARDING ======
function setupOnboarding() {
  $("btnStart").addEventListener("click", () => {
    const name = $("inpName").value.trim();
    const ageVal = parseInt($("inpAge").value, 10);
    if (!name) {
      showToast("Enter a gamer tag to start.");
      return;
    }
    if (isNaN(ageVal) || ageVal < 10 || ageVal > 19) {
      showToast("Age must be between 10–19.");
      return;
    }
    state.name = name;
    state.age = ageVal;
    state.lastLogin = todayStr();
    state.streak = state.streak || 1;
    saveState();
    $("screen-onboard").classList.add("hidden");
    $("screen-main").classList.remove("hidden");
    updateAllUI();
    showToast(`Welcome, ${name}! Adventure unlocked.`);
  });

  $("btnSkipOnboard").addEventListener("click", () => {
    state.name = "Guest";
    state.age = null;
    state.lastLogin = todayStr();
    state.streak = state.streak || 1;
    saveState();
    $("screen-onboard").classList.add("hidden");
    $("screen-main").classList.remove("hidden");
    updateAllUI();
    showToast("Playing as Guest. You can reset later.");
  });
}

// ====== WALLET ======
function setupWallet() {
  $("btnDeposit").addEventListener("click", () => {
    const amt = parseInt($("inpDeposit").value, 10);
    if (isNaN(amt) || amt <= 0) {
      showToast("Enter a valid deposit amount.");
      return;
    }
    state.wallet += amt;
    state.challenges.depositToday = true;
    addXP(10, "wallet deposit");
    saveState();
    updateAllUI();
    $("inpDeposit").value = "";
  });

  $("btnWithdraw").addEventListener("click", () => {
    const amt = parseInt($("inpWithdraw").value, 10);
    if (isNaN(amt) || amt <= 0) {
      showToast("Enter a valid withdraw amount.");
      return;
    }
    if (amt > state.wallet) {
      showToast("You can't withdraw more than wallet balance.");
      return;
    }
    state.wallet -= amt;
    saveState();
    updateAllUI();
    $("inpWithdraw").value = "";
  });
}

function setupUPI() {
  $("btnUPI").addEventListener("click", () => {
    const to = $("upiTo").value.trim() || "Friend";
    const amt = parseInt($("upiAmount").value, 10);
    if (isNaN(amt) || amt <= 0) {
      showToast("Enter a valid UPI amount.");
      return;
    }
    $("upiMsg").textContent = `Demo: UPI payment of ₹${amt} to ${to} simulated. Remember: never share PIN/OTP.`;
    state.challenges.upiToday = true;
    addXP(10, "UPI safety practice");
    saveState();
    updateAllUI();
    $("upiAmount").value = "";
  });
}

// ====== QUIZ ======
function setupQuiz() {
  $("quizTotal").textContent = quizQuestions.length;
  $("btnPrevQ").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuizQuestion();
    }
  });
  $("btnNextQ").addEventListener("click", () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      currentQuestionIndex++;
      renderQuizQuestion();
    }
  });
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = quizQuestions[currentQuestionIndex];
  $("quizIndex").textContent = currentQuestionIndex + 1;
  $("quizScore").textContent = quizScore;
  $("quizQuestion").textContent = q.q;
  $("quizNote").textContent = state.quizAnswers[currentQuestionIndex] === true
    ? "You already got this correct. You won't gain extra XP for re-answering."
    : "Answer once. Correct answers give XP only on first success.";

  const container = $("quizOptions");
  container.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => handleQuizAnswer(i));
    container.appendChild(btn);
  });
}

function handleQuizAnswer(choiceIndex) {
  const q = quizQuestions[currentQuestionIndex];
  const correctIndex = q.correct;
  const alreadyCorrect = state.quizAnswers[currentQuestionIndex] === true;
  const buttons = $("quizOptions").querySelectorAll("button");

  buttons.forEach((b, i) => {
    b.classList.remove("correct", "wrong");
    if (i === correctIndex) b.classList.add("correct");
    else if (i === choiceIndex && choiceIndex !== correctIndex) b.classList.add("wrong");
  });

  if (choiceIndex === correctIndex) {
    if (!alreadyCorrect) {
      state.quizAnswers[currentQuestionIndex] = true;
      quizScore = calculateQuizScore();
      state.quizzesCorrect = quizScore;
      state.challenges.quizToday = quizScore >= 3;
      addXP(15, "quiz answer");
      saveState();
      updateAllUI();
    } else {
      showToast("Already counted XP for this one. Nice memory though!");
    }
  } else {
    if (!alreadyCorrect) {
      state.quizAnswers[currentQuestionIndex] = false;
      saveState();
    }
    showToast("Not quite. Look for the safest, most smart-money option.");
  }
  $("quizScore").textContent = quizScore;
}

// ====== MENTOR ======
function setupMentor() {
  $("btnAskMentor").addEventListener("click", sendMentorQuestion);
  $("mentorInput").addEventListener("keydown", e => {
    if (e.key === "Enter") sendMentorQuestion();
  });
  $("btnClearMentor").addEventListener("click", () => {
    $("mentorLog").innerHTML = "";
  });
}

function sendMentorQuestion() {
  const input = $("mentorInput");
  const text = input.value.trim();
  if (!text) return;
  addMentorMessage(text, "user");
  input.value = "";
  setTimeout(() => {
    const reply = generateMentorReply(text);
    addMentorMessage(reply, "bot");
  }, 300);
  state.challenges.mentorToday = true;
  addXP(5, "asking mentor");
}

function addMentorMessage(text, type) {
  const log = $("mentorLog");
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function generateMentorReply(q) {
  const lower = q.toLowerCase();
  if (lower.includes("upi")) {
    return "UPI rule of thumb: never share PIN/OTP, never approve requests you didn't start, and always double-check receiver name before paying. Use UPI only inside trusted apps.";
  }
  if (lower.includes("save") || lower.includes("savings")) {
    return "A simple teen saving rule: 50% needs, 30% wants, 20% savings. Automate saving first, then spending. Even small amounts like ₹100/month build the habit.";
  }
  if (lower.includes("invest") || lower.includes("stock") || lower.includes("mutual")) {
    return "Start by understanding risk: diversified mutual funds are generally lower risk than single random stocks or crypto. Never invest money you might need soon.";
  }
  if (lower.includes("emergency")) {
    return "Emergency fund = 3–6 months of basic expenses. For a teen, it can be simply a few months of your usual spending kept safely in a bank/savings, not in risky assets.";
  }
  if (lower.includes("loan") || lower.includes("debt")) {
    return "Avoid high-interest debt like credit card roll-overs or shady apps. If you ever use loans later, compare interest rates and always read terms carefully.";
  }
  return "Great question! For any money decision, think: 1) Is it safe? 2) Is it necessary now? 3) What happens long-term? If you want details, mention keywords like 'UPI', 'saving', 'investing', or 'emergency fund'.";
}

// ====== TRADING ======
function setupTrading() {
  refreshMarketPrices();
  renderMarket();
  renderPortfolio();
  const select = $("tradeAsset");
  select.innerHTML = "";
  marketAssets.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = `${a.id} - ${a.name}`;
    select.appendChild(opt);
  });

  $("btnRefreshMarket").addEventListener("click", () => {
    refreshMarketPrices();
    renderMarket();
    renderPortfolio();
    showToast("Market prices rolled. Remember: volatility is normal.");
  });

  $("btnBuy").addEventListener("click", () => handleTrade("buy"));
  $("btnSell").addEventListener("click", () => handleTrade("sell"));
}

function refreshMarketPrices() {
  marketAssets.forEach(a => {
    const drift = (Math.random() * 0.3) - 0.15; // -15% to +15%
    const price = Math.max(10, Math.round(a.base * (1 + drift)));
    marketPrices[a.id] = price;
  });
}

function renderMarket() {
  const container = $("marketList");
  container.innerHTML = "";
  marketAssets.forEach(a => {
    const row = document.createElement("div");
    row.className = "stock-row";
    const price = marketPrices[a.id] || a.base;
    row.innerHTML = `
      <div>
        <strong>${a.id}</strong> <span style="color:var(--muted);font-size:10px;">${a.name}</span>
      </div>
      <div>₹${price}</div>
    `;
    container.appendChild(row);
  });
}

function handleTrade(type) {
  const assetId = $("tradeAsset").value;
  const qty = parseInt($("tradeQty").value, 10);
  if (isNaN(qty) || qty <= 0) {
    showToast("Enter quantity to trade.");
    return;
  }
  const price = marketPrices[assetId] || 0;
  if (!price) return;

  if (type === "buy") {
    const cost = price * qty;
    if (cost > state.wallet) {
      showToast("Not enough wallet balance to buy.");
      return;
    }
    state.wallet -= cost;
    let holding = state.portfolio.find(p => p.id === assetId);
    if (!holding) {
      holding = { id: assetId, name: marketAssets.find(a => a.id === assetId).name, qty: 0, avgPrice: 0 };
      state.portfolio.push(holding);
    }
    const totalCost = holding.avgPrice * holding.qty + cost;
    holding.qty += qty;
    holding.avgPrice = Math.round(totalCost / holding.qty);
    state.challenges.tradeToday = true;
    addXP(12, "executing a buy trade");
    showToast(`Bought ${qty} ${assetId} @ ₹${price}.`);
  } else {
    const holding = state.portfolio.find(p => p.id === assetId);
    if (!holding || holding.qty < qty) {
      showToast("You don't have enough quantity to sell.");
      return;
    }
    holding.qty -= qty;
    const revenue = price * qty;
    state.wallet += revenue;
    if (holding.qty === 0) {
      state.portfolio = state.portfolio.filter(p => p.id !== assetId);
    }
    state.challenges.tradeToday = true;
    addXP(12, "executing a sell trade");
    showToast(`Sold ${qty} ${assetId} @ ₹${price}.`);
  }

  saveState();
  updateAllUI();
  $("tradeQty").value = "";
}

function renderPortfolio() {
  const list = $("portfolioList");
  list.innerHTML = "";
  if (!state.portfolio.length) {
    list.innerHTML = `<div class="tag-mini">No holdings yet. Use wallet to buy assets and see how value moves.</div>`;
    $("portfolioChip").textContent = "₹0";
    $("portfolioValue").textContent = "₹0";
    $("walletLocked").textContent = "₹0";
    return;
  }
  let total = 0;
  state.portfolio.forEach(p => {
    const curPrice = marketPrices[p.id] || p.avgPrice;
    const val = curPrice * p.qty;
    total += val;
    const row = document.createElement("div");
    row.className = "portfolio-item";
    row.innerHTML = `
      <div>${p.id} • <span style="color:var(--muted);">${p.qty} @ ₹${p.avgPrice}</span></div>
      <div>₹${val}</div>
    `;
    list.appendChild(row);
  });
  $("portfolioChip").textContent = `₹${total}`;
  $("portfolioValue").textContent = `₹${total}`;
  $("walletLocked").textContent = `₹${total}`;
}

// ====== CHALLENGES + BADGES ======
function setupChallengesUI() {
  renderChallenges();
  renderBadges();
}

function renderChallenges() {
  const list = $("challengeList");
  list.innerHTML = "";
  Object.keys(challengeMeta).forEach(key => {
    const meta = challengeMeta[key];
    const completed = !!state.challenges[key];
    const div = document.createElement("div");
    div.className = "challenge" + (completed ? " completed" : "");
    div.innerHTML = `
      <div>
        ${meta.label}
        <br><small>${completed ? "Done!" : "Reward: +"+meta.reward+" XP"}</small>
      </div>
      <div class="tag-mini">${completed ? "✔" : "…"}</div>
    `;
    list.appendChild(div);
  });
}

function computeBadges() {
  const badges = [];

  if (state.points >= 50) badges.push({ key: "xp50", label: "XP 50+", emoji: "💠" });
  if (state.points >= 200) badges.push({ key: "xp200", label: "XP 200+", emoji: "💎" });
  if (state.quizzesCorrect >= 3) badges.push({ key: "quiz3", label: "Quiz Streaker", emoji: "🎯" });
  if (state.wallet >= 1000) badges.push({ key: "wallet1k", label: "Saver 1K+", emoji: "💳" });
  if (state.portfolio.length > 0) badges.push({ key: "investor", label: "First Investment", emoji: "📈" });
  if (state.streak >= 3) badges.push({ key: "streak3", label: "3-Day Streak", emoji: "🔥" });

  return badges;
}

function renderBadges() {
  const cur = computeBadges();
  const list = $("badgeList");
  list.innerHTML = "";
  if (!cur.length) {
    list.innerHTML = `<span class="tag-mini">No badges yet. Play quiz, deposit, trade and keep streak to unlock.</span>`;
    return;
  }
  cur.forEach(b => {
    const el = document.createElement("div");
    el.className = "badge";
    el.innerHTML = `<span>${b.emoji}</span>${b.label}`;
    list.appendChild(el);
  });
}

// ====== RESET ======
function setupReset() {
  $("btnReset").addEventListener("click", () => {
    if (!confirm("Reset all progress on this device?")) return;
    state = { ...defaultState };
    saveState();
    location.reload();
  });
}

// ====== UI UPDATE MAIN ======
function updateAllUI() {
  $("topPlayer").textContent = state.name || "Guest";
  $("streakCount").textContent = state.streak || 0;
  $("playerNameLabel").textContent = state.name || "Player";
  $("pointsLabel").textContent = `${state.points} XP`;
  $("levelLabel").textContent = state.level;
  $("rankLabel").textContent = rankFromLevel(state.level);

  const xpMod = state.points % 100;
  $("xpFill").style.width = `${Math.min(100, xpMod)}%`;

  $("walletChip").textContent = `₹${state.wallet}`;
  $("walletBig").innerHTML = `₹${state.wallet}<span> virtual balance</span>`;
  $("quizChip").textContent = state.quizzesCorrect || 0;

  $("quizScore").textContent = quizScore;
  $("streakLabel").textContent = `${state.streak || 0} days`;
  $("lastLoginLabel").textContent = state.lastLogin || "–";

  renderChallenges();
  renderBadges();
  renderPortfolio();
  saveState();
}
