// ===================== STATE =====================
const defaultState = {
  name: "Guest",
  age: null,
  points: 0,
  level: 1,
  quizzesCorrect: 0,
  wallet: 0,
  portfolio: [],
  streak: 0,
  lastLogin: null,
  badges: [],
  challenges: {
    quizToday: false,
    depositToday: false,
    tradeToday: false,
    mentorToday: false,
    upiToday: false
  },
  quizAnswers: {}
};

let state = loadState();

// ===================== QUESTIONS =====================
const quizQuestions = [
  {
    q: "You get ₹500 pocket money. What's the smartest first move?",
    options: [
      "Spend it fast",
      "Save part before spending",
      "Lend all to a friend",
      "Buy loot boxes"
    ],
    correct: 1
  },
  {
    q: "What is the safest way to use UPI?",
    options: [
      "Share OTP",
      "Enter PIN anywhere",
      "Only enter PIN in UPI app",
      "Let strangers scan"
    ],
    correct: 2
  }
];

let currentQuestionIndex = 0;
let quizScore = calculateQuizScore();

// ===================== MARKET =====================
const marketAssets = [
  { id: "FNT", name: "FinTech Nova Token", base: 120 },
  { id: "EDU", name: "EduCoin", base: 80 },
  { id: "GRW", name: "Growth Stock", base: 150 }
];

let marketPrices = {};

let marketChart = null;
let priceData = { FNT: [], EDU: [], GRW: [] };

// ===================== HELPERS =====================
const $ = id => document.getElementById(id);

function showToast(txt) {
  const t = $("toast");
  t.textContent = txt;
  t.style.display = "block";
  setTimeout(() => t.style.display = "none", 2500);
}

function saveState() {
  localStorage.setItem("finteensGamingState", JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem("finteensGamingState");
    if (!raw) return { ...defaultState };
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultState };
  }
}

// ===================== INIT =====================
document.addEventListener("DOMContentLoaded", () => {
  setupOnboarding();
  setupWallet();
  setupQuiz();
  setupMentor();
  setupTrading();
  updateAllUI();
});

// ===================== ONBOARDING =====================
function setupOnboarding() {
  $("btnStart").addEventListener("click", () => {
    const name = $("inpName").value.trim();
    const age = Number($("inpAge").value);
    if (!name) return showToast("Enter a name.");
    if (age < 10 || age > 19) return showToast("Age must be 10-19.");

    state.name = name;
    state.age = age;
    saveState();

    $("screen-onboard").classList.add("hidden");
    $("screen-main").classList.remove("hidden");
    updateAllUI();
  });
}

// ===================== QUIZ =====================
function setupQuiz() {
  renderQuizQuestion();

  $("btnNextQ").addEventListener("click", () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      currentQuestionIndex++;
      renderQuizQuestion();
    }
  });

  $("btnPrevQ").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuizQuestion();
    }
  });
}

function renderQuizQuestion() {
  const q = quizQuestions[currentQuestionIndex];
  $("quizQuestion").textContent = q.q;

  const box = $("quizOptions");
  box.innerHTML = "";

  q.options.forEach((txt, i) => {
    const btn = document.createElement("button");
    btn.textContent = txt;
    btn.onclick = () => handleQuizAnswer(i);
    box.appendChild(btn);
  });
}

function handleQuizAnswer(i) {
  const q = quizQuestions[currentQuestionIndex];

  if (i === q.correct) {
    if (state.quizAnswers[currentQuestionIndex] !== true) {
      state.quizAnswers[currentQuestionIndex] = true;
      quizScore = calculateQuizScore();
      addXP(15, "Correct answer");
      saveState();
    }
    showToast("Correct!");
  } else {
    showToast("Try again.");
  }
}

function calculateQuizScore() {
  return Object.values(state.quizAnswers).filter(v => v === true).length;
}

// ===================== MENTOR =====================
function setupMentor() {
  $("btnAskMentor").addEventListener("click", () => {
    const q = $("mentorInput").value.trim();
    if (!q) return;
    $("mentorLog").innerHTML += `<div class="msg user">${q}</div>`;

    setTimeout(() => {
      $("mentorLog").innerHTML += `<div class="msg bot">Smart question! Keep learning 💡</div>`;
    }, 500);

    $("mentorInput").value = "";
  });
}

// ===================== WALLET =====================
function setupWallet() {
  $("btnDeposit").addEventListener("click", () => {
    const amt = Number($("inpDeposit").value);
    if (!amt || amt <= 0) return showToast("Enter amount");
    state.wallet += amt;
    $("inpDeposit").value = "";
    addXP(10, "Deposit");
    saveState();
    updateAllUI();
  });
}

// ===================== TRADING =====================
function setupTrading() {
  refreshMarketPrices();
  renderMarket();

  $("btnRefreshMarket").addEventListener("click", () => {
    refreshMarketPrices();
    renderMarket();
    updateMarketChart($("tradeAsset").value);
    showToast("Market Updated");
  });

  $("btnBuy").addEventListener("click", () => handleTrade("buy"));
  $("btnSell").addEventListener("click", () => handleTrade("sell"));
}

function refreshMarketPrices() {
  marketAssets.forEach(a => {
    const change = (Math.random() * 0.3) - 0.15;
    marketPrices[a.id] = Math.max(10, Math.round(a.base * (1 + change)));
  });
}

function renderMarket() {
  $("tradeAsset").innerHTML = "";
  $("marketList").innerHTML = "";

  marketAssets.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    $("tradeAsset").appendChild(opt);

    $("marketList").innerHTML += `<div>${a.id}: ₹${marketPrices[a.id]}</div>`;
  });
}

function handleTrade(type) {
  const asset = $("tradeAsset").value;
  const qty = Number($("tradeQty").value);
  if (!qty || qty <= 0) return showToast("Enter quantity");

  const price = marketPrices[asset];

  if (type === "buy") {
    if (state.wallet < qty * price) return showToast("Not enough balance");
    state.wallet -= qty * price;
    addXP(12, "Trade executed");
  }

  updateMarketChart(asset);
  updateAllUI();
}

// ===================== UPDATE UI =====================
function addXP(amount, reason = "") {
  state.points += amount;
  saveState();
  updateAllUI();
  if (reason) showToast(`+${amount} XP — ${reason}`);
}

function updateAllUI() {
  $("playerNameLabel").textContent = state.name;
  $("walletBig").textContent = `₹${state.wallet}`;
  $("quizScore").textContent = calculateQuizScore();
  saveState();
}

// ===================== CHART FUNCTION =====================
function updateMarketChart(assetId) {
  const canvas = document.getElementById("marketChart").getContext("2d");
  const latestPrice = marketPrices[assetId];

  priceData[assetId].push(latestPrice);
  if (priceData[assetId].length > 40) priceData[assetId].shift();

  if (marketChart) marketChart.destroy();

  const gradient = canvas.createLinearGradient(0, 0, 500, 0);
  gradient.addColorStop(0, "#00eaff");
  gradient.addColorStop(1, "#7b5bff");

  marketChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: priceData[assetId].map((_, i) => i + 1),
      datasets: [{
        label: assetId + " Price",
        data: priceData[assetId],
        borderColor: gradient,
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 0,
        fill: true,
        backgroundColor: "rgba(0, 225, 255, 0.08)"
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { ticks: { color: "#cbd5e1" } }
      }
    }
  });
}
