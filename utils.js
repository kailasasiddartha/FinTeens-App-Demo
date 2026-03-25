/* =========================================================================
   FINTEENS UTILITIES
   ========================================================================= */

const $ = (id) => document.getElementById(id);
const todayStr = () => new Date().toISOString().slice(0, 10);

function animateNumber(id, end, prefix = "") {
  const el = document.getElementById(id);
  if (!el) return;
  const startText = el.dataset.rawValue || el.innerText.replace(/[^0-9.-]+/g, "");
  const start = parseFloat(startText) || 0;
  if (start === end) return;
  
  const duration = 800;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    el.innerText = prefix + value.toLocaleString();
    el.dataset.rawValue = String(value);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function triggerHaptic(type = "light") {
  if (!navigator.vibrate) return;
  if (type === "light") navigator.vibrate(10);
  else if (type === "medium") navigator.vibrate(30);
  else if (type === "heavy") navigator.vibrate([50, 30, 50]);
  else if (type === "success") navigator.vibrate([10, 30, 20]);
  else if (type === "error") navigator.vibrate([50, 100, 50]);
}

function playSound(type) {
  if (!state.soundEnabled) return;
  
  // Triger haptics alongside sound
  if (type === "coin" || type === "correct") triggerHaptic("light");
  if (type === "wrong") triggerHaptic("medium");
  if (type === "levelUp") triggerHaptic("heavy");
  
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === "coin") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "correct") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "levelUp") {
      osc.type = "square";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(400, now + 0.1);
      osc.frequency.setValueAtTime(600, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.warn("Sound failed to play", e);
  }
}

function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#8b5cf6", "#10b981"]
    });
  }
}

function addMoney(amount) {
  state.wallet += amount;
  saveState();
  updateAllUI();
}

function addXP(amount) {
  const oldPoint = state.points;
  let finalAmount = amount * state.xpMultiplier;

  // Apply streak multiplier
  let streakMult = 1;
  if (state.streak >= 3) streakMult = 1.1;
  if (state.streak >= 7) streakMult = 1.25;
  if (state.streak >= 14) streakMult = 1.5;
  if (state.streak >= 30) streakMult = 2;

  finalAmount = Math.floor(finalAmount * streakMult);

  if (state.xpBoostActive && Date.now() < state.xpBoostExpiry) {
    finalAmount *= 2;
  } else {
    state.xpBoostActive = false;
  }

  state.points += finalAmount;
  checkLevelUp(oldPoint);
  saveState();
}

function checkLevelUp(oldPoint) {
  const oldLevel = Math.floor(oldPoint / 1000) + 1;
  const newLevel = Math.floor(state.points / 1000) + 1;
  if (newLevel > oldLevel) {
    state.level = newLevel;
    showAchievement("Level Up!", `You reached Level ${newLevel}!`, "");
    playSound("levelUp");
    triggerConfetti();
  }
}

function getRankName() {
  let r = Ranks[0].n;
  for (let i = 0; i < Ranks.length; i++) {
    if (state.points >= Ranks[i].min) r = Ranks[i].n;
  }
  return r;
}

function calculateNetWorth() {
  let portTotal = 0;
  if (state.portfolio) {
    state.portfolio.forEach(h => {
      portTotal += (h.qty * (marketPrices[h.id] || h.avgPrice));
    });
  }
  let goalTotal = 0;
  if (state.goals) {
    state.goals.forEach(g => {
        goalTotal += (g.saved || 0);
    });
  }
  return Math.floor(state.wallet + portTotal + goalTotal);
}


function showToast(msg) {
  const el = $("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

function showSkeleton(targetId, type, count) {
  const PROTECTED_IDS = ["tab-home", "tab-learn", "tab-play", "tab-finance", "tab-profile", "panel-analytics"];
  if (PROTECTED_IDS.includes(targetId)) return;

  const target = $(targetId);
  if (!target) return;
  target.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = `skeleton skeleton-${type}`;
    target.appendChild(skeleton);
  }
}
