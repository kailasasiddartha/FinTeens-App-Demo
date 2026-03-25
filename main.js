/* =========================================================================
   FINTEENS MAIN (ENTRY POINT, ORCHESTRATION)
   ========================================================================= */

function goToInitialScreen() {
  if (!state.name) {
    $("screen-onboard").classList.remove("hidden");
    $("screen-main").classList.add("hidden");
    setupOnboarding();
  } else {
    $("screen-onboard").classList.add("hidden");
    $("screen-main").classList.remove("hidden");
    if (state.dailyRewardClaimed !== todayStr()) {
      showToast("🎁 Daily Reward Available! Go to Home.");
    }
    applyTheme();
    setupSound();
    const homeTab = document.querySelector(".bottom-tab[data-tab=\"home\"]");
    if (homeTab) homeTab.click();
  }
}

function setupOnboarding() {
  if ($("btnWelcomeNext")) {
    $("btnWelcomeNext").onclick = () => {
      $("onboard-step-1").classList.add("hidden");
      // Update Step 3 Persona Chip
      const chipIcon = $("chosenPersonaIcon");
      const chipName = $("chosenPersonaName");
      if (chipIcon && chipName) {
         const emojiMap = { "rocket": "🚀", "bull": "🐂", "bear": "🐻", "piggy": "🐷" };
         chipIcon.textContent = emojiMap[selectedAvatar] || "🚀";
         chipName.textContent = selectedPersonaName;
      }
      if (typeof playSound === "function") playSound("select");
    };
  }

  if ($("btnPersonaBack")) {
    $("btnPersonaBack").onclick = () => {
      $("onboard-step-2").classList.add("hidden");
      $("onboard-step-2").classList.remove("active");
      $("onboard-step-1").classList.remove("hidden");
      $("onboard-step-1").classList.add("active");
      if (typeof playSound === "function") playSound("select");
    };
  }

  // Persona Selection
  const pGrid = $("personaGrid");
  if (pGrid) {
    pGrid.querySelectorAll(".persona-card").forEach(card => {
      card.onclick = () => {
        pGrid.querySelectorAll(".persona-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        selectedAvatar = card.getAttribute("data-avatar");
        selectedPersonaName = card.getAttribute("data-title");
        if (typeof triggerHaptic === "function") triggerHaptic("light");
      };
    });
  }

  // Final Form Submit
  if ($("btnStart")) {
    $("btnStart").onclick = () => {
      const val = $("inpName")?.value.trim();
      const birthYear = parseInt($("inpBirthYear")?.value);
      const currentYear = new Date().getFullYear();
      
      if (!val) { showToast("Enter a Gamer Tag!"); return; }
      if (!birthYear || birthYear > currentYear) { showToast("Enter a valid birth year!"); return; }
      
      if (currentYear - birthYear < 13) {
        showToast("⚠️ FinTeens Arena requires you to be 13+.");
        return;
      }

      state.name = val;
      state.avatar = selectedAvatar;
      state.lastLogin = todayStr();
      saveState();
      
      $("screen-onboard").classList.add("hidden");
      $("screen-main").classList.remove("hidden");
      updateAllUI();
      document.querySelector(".bottom-tab[data-tab=\"home\"]")?.click();
      if (typeof playSound === "function") playSound("correct");
    };
  }

  // Skip
  if ($("btnSkipOnboard")) {
    $("btnSkipOnboard").onclick = () => {
      state.name = "Guest"; state.avatar = "rocket"; state.lastLogin = todayStr();
      saveState(); 
      $("screen-onboard").classList.add("hidden"); 
      $("screen-main").classList.remove("hidden");
      updateAllUI();
      document.querySelector(".bottom-tab[data-tab=\"home\"]")?.click();
    };
  }
}



window.handleScenarioSelection = (q, idx) => {
  const s = scenarioList.find(x => x.text === q);
  if (!s) return;
  const opt = s.options[idx];
  if (opt.correct) {
    addXP(opt.xp);
    showToast(`Correct! +${opt.xp} XP 🌟`);
  } else {
    showToast("Think again! Check the Mentor for tips. 💡");
  }
};

function setupNav() {
  document.querySelectorAll(".bottom-tab").forEach(tab => {
    tab.onclick = () => {
      if (typeof triggerHaptic === "function") triggerHaptic("light");
      document.querySelectorAll(".bottom-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-tab");
      $(`tab-${target}`).classList.add("active");
      if (target !== "finance") {
        if (typeof stopMarket === "function") stopMarket();
      } else {
        if (typeof initMarket === "function") initMarket();
      }
      if (target === "home") {
        renderHomeDashboard();
      }
      if (target === "learn") { 
        renderLearningPaths();
        renderGlossary();
      }
      if (target === "play") {
        renderChallenges();
      }
      if (target === "finance") { 
        showSkeleton("marketList", "list", 4);
        setTimeout(() => { renderMarket(); renderPortfolio(); }, 300); 
      }
      if (target === "profile") {
        showSkeleton("panel-analytics", "chart", 1);
        setTimeout(renderProfile, 300);
      }
      $(`tab-${target}`).querySelector(".sub-tab")?.click();
    };
  });

  document.querySelectorAll(".sub-tab").forEach(tab => {
    tab.onclick = () => {
      const parent = tab.closest(".tab-panel");
      parent.querySelectorAll(".sub-tab").forEach(t => t.classList.remove("active"));
      parent.querySelectorAll(".sub-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const target = $(tab.getAttribute("data-panel") || tab.getAttribute("data-target"));
      if (target) {
        target.classList.add("active");
        if (target.id === "panel-quiz") loadQuizQuestion();
        if (target.id === "panel-budget") renderBudget();
        if (target.id === "panel-goals") renderGoals();
        if (target.id === "panel-expenses") renderExpenses();
        if (target.id === "panel-trading") { renderMarket(); renderPortfolio(); }
        if (target.id === "panel-skills") renderSkillTree();
        if (target.id === "panel-arena") renderLeaderboard();
        if (target.id === "panel-powerups") renderActiveBoosts();
      }
    };
  });
}

function renderHomeDashboard() {
  const greetEl = $("homeGreeting");
  if (greetEl) {
    const hour = new Date().getHours();
    const period = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    greetEl.innerHTML = `<span style="font-size:15px;color:var(--text-muted);">${period},</span> <span style="font-size:18px;font-weight:700;font-family:var(--font-display);color:var(--text-main);">${state.name || 'Player'} 👋</span>`;
  }

  const rwdCard = $("dailyRewardBanner"), rwdBtn = $("btnClaimDaily");
  if (rwdCard && rwdBtn) {
    if (state.dailyRewardClaimed === todayStr()) rwdCard.classList.add("hidden");
    else {
      rwdCard.classList.remove("hidden");
      rwdBtn.onclick = () => {
        addXP(50); addMoney(100); state.dailyRewardClaimed = todayStr();
        saveState(); rwdCard.classList.add("hidden"); showToast("🎁 Claimed Daily Reward!");
      };
    }
  }

  document.querySelectorAll(".quick-action-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelector(`.bottom-tab[data-tab="${btn.getAttribute("data-goto")}"]`)?.click();
      setTimeout(() => document.querySelector(`.sub-tab[data-panel="${btn.getAttribute("data-sub")}"]`)?.click(), 100);
    };
  });

  if ($("homeNetWorth")) $("homeNetWorth").textContent = `₹${calculateNetWorth()}`;
  if ($("homeQuizzes")) $("homeQuizzes").textContent = state.quizzesCorrect || 0;
  if ($("homeBadges")) $("homeBadges").textContent = state.achievements?.length || 0;
  if ($("dailyTipText")) $("dailyTipText").textContent = funFacts[new Date().getDate() % funFacts.length];
  
  // Calculate portfolio value
  let portVal = 0;
  state.portfolio?.forEach(h => { portVal += h.qty * (marketPrices[h.id] || h.avgPrice); });
  if ($("homePortfolio")) $("homePortfolio").textContent = `₹${Math.floor(portVal)}`;

  const missionEl = $("homeMissions");
  if (missionEl) {
    const missionDefs = [
      { label: "Complete a Quiz", key: "quizToday", icon: "🎯" },
      { label: "Make a Trade",    key: "tradeToday", icon: "📈" },
      { label: "Ask the Mentor",  key: "mentorToday", icon: "🤖" }
    ];
    missionEl.innerHTML = missionDefs.map(m => {
      const done = state.challenges?.[m.key];
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-left:3px solid ${done ? 'var(--success)' : 'var(--panel-border)'};padding-left:12px;margin-bottom:6px;transition:border-color 0.3s;background:var(--surface);border-radius:var(--radius-md)">
        <span style="font-size:18px">${m.icon}</span>
        <span style="flex:1;font-weight:500;font-size:14px;">${m.label}</span>
        <span style="margin-right:8px">${done ? '✅' : '⬜'}</span>
      </div>`;
    }).join('');
  }

  const goalsEl = $("homeGoalsList");
  if (goalsEl) {
    const active = (state.goals || []).filter(g => !g.completed).slice(0, 3);
    if (active.length === 0) {
      goalsEl.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:14px;">
        No active goals yet. <button class="btn btn-sm btn-ghost" onclick="document.querySelector('.bottom-tab[data-tab=finance]').click();setTimeout(()=>document.querySelector('[data-panel=panel-goals]')?.click(),100)" style="margin-left:8px">Set one →</button>
      </div>`;
    } else {
      goalsEl.innerHTML = active.map(g => {
        const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
        return `<div style="margin-bottom:12px;background:var(--surface);padding:12px;border-radius:var(--radius-md);border:1px solid var(--panel-border)">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;">
            <span style="font-weight:700;">${g.name}</span>
            <span style="color:var(--text-muted);">₹${g.saved} / ₹${g.target}</span>
          </div>
          <div style="height:6px;background:var(--panel-border);border-radius:3px;">
            <div style="height:6px;width:${pct}%;background:var(--c-primary);border-radius:3px;transition:width 0.4s;"></div>
          </div>
        </div>`;
      }).join('');
    }
  }
}

function renderProfile() { 
  if ($("analyticsXp")) $("analyticsXp").textContent = state.points;
  if ($("analyticsNetWorth")) $("analyticsNetWorth").textContent = `₹${calculateNetWorth()}`;
  if ($("analyticsQuizzes")) $("analyticsQuizzes").textContent = state.quizzesCorrect || 0;
  if ($("analyticsTrades")) $("analyticsTrades").textContent = state.tradeHistory?.length || 0;
  renderAnalyticsChart();
  renderLeaderboard();
}

let currentChartDataset = 'xp';
window.setChartDataset = (ds) => {
  currentChartDataset = ds;
  document.querySelectorAll(".dataset-toggles .btn").forEach(b => {
    b.classList.toggle("active", b.textContent.toLowerCase().includes(ds.toLowerCase()));
  });
  renderAnalyticsChart();
};

function renderAnalyticsChart() {
  const ctx = $("analyticsChart")?.getContext("2d");
  if (!ctx || !window.Chart) return;
  
  if (window.analyticsChartInstance) window.analyticsChartInstance.destroy();
  
  const days = parseInt($("analyticsTimeRange")?.value || 7);
  const history = state.analyticsHistory?.slice(-days) || [];
  const labels = history.map(h => h.date.slice(5)); // MM-DD
  const data = history.map(h => h[currentChartDataset] || 0);

  window.analyticsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [{
        label: currentChartDataset === 'xp' ? 'XP Growth' : 'Net Worth',
        data: data.length > 0 ? data : [0],
        borderColor: currentChartDataset === 'xp' ? '#6366f1' : '#10b981',
        tension: 0.4,
        fill: true,
        backgroundColor: currentChartDataset === 'xp' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { 
        y: { display: true, ticks: { color: 'rgba(255,255,255,0.5)' } }, 
        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } } 
      }
    }
  });
}

function renderNews() {
  const container = $("newsList");
  if (!container) return;
  container.innerHTML = "";
  
  newsItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "news-card p-12 mb-8 bg-surface border-left-primary";
    div.innerHTML = `
      <strong>${item.title}</strong>
      <p class="text-muted small">${item.desc}</p>
    `;
    container.appendChild(div);
  });
}

function updateAllUI() {
  if ($("levelLabel")) $("levelLabel").textContent = state.level;
  if ($("rankLabel")) $("rankLabel").textContent = getRankName();
  if ($("topPlayer")) $("topPlayer").textContent = state.name || "Guest";
  if ($("settingsName")) $("settingsName").textContent = state.name || "Guest";
  if ($("hudAvatar")) $("hudAvatar").src = `assets/avatars/${state.avatar || 'rocket'}.png`;
  
  // Use animated counters for major stats
  animateNumber("pointsLabel", state.points, "");
  animateNumber("streakCount", state.streak, "");
  animateNumber("walletChip", Math.floor(state.wallet), "₹");
  
  if ($("walletBig")) $("walletBig").textContent = `₹${Math.floor(state.wallet).toLocaleString()}`;
  if ($("walletLocked")) {
    let locked = 0;
    state.portfolio?.forEach(h => { locked += h.qty * (marketPrices[h.id] || h.avgPrice); });
    $("walletLocked").textContent = `₹${Math.floor(locked).toLocaleString()}`;
  }

  const xpPercent = ((state.points % 1000) / 1000) * 100;
  if ($("xpFill")) $("xpFill").style.width = `${xpPercent}%`;
  
  renderStreakCalendar();
  if (typeof updateHintButton === "function") updateHintButton();
  
  // Debounced badge rendering
  if (!window._badgeRenderPending) {
    window._badgeRenderPending = true;
    setTimeout(() => { renderBadges(); window._badgeRenderPending = false; }, 500);
  }
  
  renderActiveBoosts();

  if ($("tab-home")?.classList.contains("active")) {
    renderHomeDashboard();
  }
  if ($("panel-challenges")?.classList.contains("active") || $("tab-play")?.classList.contains("active")) {
    if ($("panel-challenges")?.classList.contains("active")) renderChallenges();
  }
}

function renderBadges() {
  const list = $("badgeList"), filter = $("badgeFilter")?.value || "all";
  if (!list) return;
  let html = "";
  const unlocked = state.achievements || [];
  badges.forEach(b => {
    const isUnlocked = b.condition(state) || unlocked.includes(b.name);
    if (isUnlocked && !unlocked.includes(b.name)) unlocked.push(b.name); // Sync
    if ((filter === "unlocked" && !isUnlocked) || (filter === "locked" && isUnlocked)) return;
    html += `<div class="row gap-12 p-12 mb-8 bg-surface border-left" style="opacity:${isUnlocked ? 1 : 0.5}; border-color:${isUnlocked ? 'var(--success)' : 'var(--border)'}">
      <div style="font-size:2em;">${b.icon}</div>
      <div><strong>${b.name}</strong><br><small class="text-muted">${b.desc}</small></div>
    </div>`;
  });
  list.innerHTML = html;
}

function renderStreakCalendar() {
  const cal = $("streakCalendar"); if (!cal) return;
  let html = '<div class="grid-7 text-center">';
  ["S","M","T","W","T","F","S"].forEach(d => html += `<strong>${d}</strong>`);
  for (let i = 0; i < 7; i++) {
    const active = i < state.streak % 7 || (state.streak > 0 && state.streak % 7 === 0);
    html += `<div class="p-8 border-radius-4" style="background:${active ? 'var(--primary)' : 'var(--surface)'}">${active ? '🔥' : 'X'}</div>`;
  }
  cal.innerHTML = html + `</div><div class="text-center mt-12 text-muted">Streak: <strong>${state.streak} Days</strong></div>`;
}

function renderChallenges() {
  const list = $("challengeList");
  if (!list) return;
  
  if ($("streakLabel")) $("streakLabel").textContent = `${state.streak} days`;
  if ($("lastLoginLabel")) $("lastLoginLabel").textContent = state.lastLogin || "–";

  const ch = state.challenges;
  const items = [
    { label: "Complete a Quiz", key: "quizToday", icon: "🎯", xp: 15 },
    { label: "Make a Trade", key: "tradeToday", icon: "📈", xp: 20 },
    { label: "Set a Budget", key: "budgetToday", icon: "💰", xp: 10 },
    { label: "Add an Expense", key: "expenseToday", icon: "📝", xp: 10 },
    { label: "Ask the Mentor", key: "mentorToday", icon: "🤖", xp: 10 },
    { label: "Add to a Goal", key: "goalToday", icon: "🎯", xp: 15 }
  ];
  list.innerHTML = items.map(item => {
    const done = ch[item.key];
    return `
      <div class="challenge ${done ? 'completed' : ''}" style="padding:12px; background:var(--surface); border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid ${done ? 'var(--success)' : 'transparent'}">
        <div>
          <span style="font-weight:500;">${item.icon} ${item.label}</span>
          <small style="display:block; color:var(--text-secondary); margin-top:2px;">+${item.xp} XP</small>
        </div>
        <span style="font-size:1.2em;">${done ? '✅' : '⬜'}</span>
      </div>`;
  }).join('');

  const weeklyEl = $("weeklyChallenge");
  if (weeklyEl) {
    const qDone = state.weeklyProgress?.quizzes || 0;
    const qTarget = 5;
    const pct = Math.min(100, Math.round((qDone / qTarget) * 100));
    weeklyEl.innerHTML = `
      <div style="padding:16px; background:rgba(99,102,241,0.05); border:1px solid var(--panel-border); border-radius:12px;">
        <div class="row-between mb-8">
          <strong>Complete 5 Quizzes</strong>
          <span>${qDone}/${qTarget}</span>
        </div>
        <div style="height:8px; background:var(--panel-border); border-radius:4px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:var(--c-primary); transition:width 0.5s;"></div>
        </div>
        <p class="small text-muted mt-8">Reward: 100 XP + Rare Badge</p>
      </div>`;
  }
}

function setupScenarios() {
  if ($("btnNewScenarioGame")) $("btnNewScenarioGame").onclick = startScenario;
}

function startScenario() {
  const s = scenarioList[Math.floor(Math.random() * scenarioList.length)];
  const content = $("scenarioContent");
  content.innerHTML = `<h3 class="mb-12">${s.text}</h3><div id="scenOptions" class="column gap-8"></div>`;
  
  const statsEl = document.querySelector("#panel-scenarios .section-sub strong");
  const updateStats = () => { if (statsEl) statsEl.textContent = `${state.scenariosCompleted || 0} / 10`; };

  s.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "btn btn-ghost"; btn.textContent = opt.txt;
    btn.onclick = () => {
      document.querySelectorAll("#scenOptions button").forEach(b => b.disabled = true);
      btn.style.background = opt.correct ? "var(--success)" : "var(--danger)";
      if (opt.correct) { 
        addXP(opt.xp); state.scenariosCompleted++; saveState(); 
        playSound("correct"); triggerConfetti(); updateStats();
      } else playSound("wrong");
    };
    $("scenOptions").appendChild(btn);
  });
}

function setupSettings() {
  if ($("settingsName")) $("settingsName").textContent = state.name || "Guest";
  if ($("settingsVersion")) $("settingsVersion").textContent = "v2";

  const doTheme = () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(); saveState(); updateToggleIcons();
  };
  if ($("btnThemeToggle"))  $("btnThemeToggle").onclick  = doTheme;
  if ($("btnThemeToggle2")) $("btnThemeToggle2").onclick = doTheme;

  const doSound = () => {
    state.soundEnabled = !state.soundEnabled;
    saveState(); updateToggleIcons(); 
    showToast(state.soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF");
  };
  if ($("btnToggleSound"))  $("btnToggleSound").onclick  = doSound;
  if ($("btnToggleSound2")) $("btnToggleSound2").onclick = doSound;
}

function updateToggleIcons() {
  if ($("btnThemeToggle")) $("btnThemeToggle").innerHTML = state.theme === "dark" ? "🌙" : "☀️";
  if ($("btnThemeToggle2")) $("btnThemeToggle2").innerHTML = state.theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";
  if ($("btnToggleSound")) $("btnToggleSound").innerHTML = state.soundEnabled ? "🔊" : "🔇";
  if ($("btnToggleSound2")) $("btnToggleSound2").innerHTML = state.soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
  if ($("settingsName")) $("settingsName").textContent = state.name || "Guest";
}

function applyTheme() {
  document.body.classList.toggle("light-theme", state.theme === "light");
}
function renderSkillTree() {
  const container = $("skillTree");
  if (!container) return;
  container.innerHTML = "";
  
  if (!state.unlockedSkills) state.unlockedSkills = [];

  skillTree.forEach(skill => {
    const isUnlocked = state.unlockedSkills.includes(skill.id);
    const node = document.createElement("div");
    node.className = `skill-node ${isUnlocked ? 'unlocked' : 'locked'}`;
    node.innerHTML = `
      <div class="skill-icon">${skill.icon}</div>
      <div class="skill-info">
        <div class="skill-title">${skill.title}</div>
        <div class="skill-desc">${skill.desc}</div>
      </div>
      <button class="btn btn-sm" ${isUnlocked ? 'disabled' : ''} onclick="unlockSkill('${skill.id}', ${skill.cost})">
        ${isUnlocked ? 'Unlocked' : `Unlock (${skill.cost} XP)`}
      </button>
    `;
    container.appendChild(node);
  });
}

window.unlockSkill = (id, cost) => {
  if (state.points >= cost) {
    state.points -= cost;
    if (!state.unlockedSkills) state.unlockedSkills = [];
    state.unlockedSkills.push(id);
    saveState();
    showToast("Skill Unlocked! 🌳");
    renderSkillTree();
    updateAllUI();
    playSound("correct");
  } else showToast("Not enough XP!");
};

function renderLeaderboard(range = "daily") {
  const containerId = document.getElementById("panel-arena")?.classList.contains("active") 
    ? "arenaLeaderboardList" 
    : "profileLeaderboardList";
  const container = $(containerId) || $("leaderboardList");
  if (!container) return;
  container.innerHTML = "";
  
  const data = leaderboardData[range] || [];
  // Inject user into leaderboard for realism
  const userRank = data.findIndex(d => d.score < state.points);
  const displayData = [...data];
  if (userRank !== -1) {
    displayData.splice(userRank, 0, { name: state.name || "You", score: state.points, avatar: state.avatar, isMe: true });
  } else {
    displayData.push({ name: state.name || "You", score: state.points, avatar: state.avatar, isMe: true });
  }

  displayData.slice(0, 10).forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = `leaderboard-item ${item.isMe ? 'me' : ''}`;
    div.innerHTML = `
      <div class="leader-rank">#${idx + 1}</div>
      <div class="leader-avatar">
        <img src="assets/avatars/${item.avatar || 'rocket'}.png" alt="Avatar" style="width:24px;">
      </div>
      <div class="leader-name">${item.name}</div>
      <div class="leader-score">${item.score} XP</div>
    `;
    container.appendChild(div);
  });
}

function setupPowerups() {
  const buy = (id, cost, action) => {
    const btn = $(id);
    if (btn) {
      btn.onclick = () => {
        if (state.points >= cost) {
          state.points -= cost;
          action();
          saveState();
          showToast("Purchased! 🚀");
          updateAllUI();
          renderActiveBoosts();
        } else showToast("Not enough XP!");
      };
    }
  };

  buy("btnBuyBoost", 50, () => {
    state.xpBoostActive = true;
    state.xpBoostExpiry = Date.now() + 600000; // 10 min
  });
  buy("btnBuyHint", 30, () => {
    if (!state.inventory) state.inventory = {};
    state.inventory.hintTokens = (state.inventory.hintTokens || 0) + 1;
  });
  buy("btnBuyFreeze", 100, () => {
    state.activeBoosts.marketFreezeExpiry = Date.now() + 60000; // 1 min
  });
  buy("btnBuyShield", 150, () => {
    state.activeBoosts.xpShieldExpiry = Date.now() + 86400000; // 24h
  });
}

function renderActiveBoosts() {
  const list = $("activeBoostsList");
  if (!list) return;
  list.innerHTML = "";
  const now = Date.now();

  const addTag = (label, expiry) => {
    const timeLeft = Math.ceil((expiry - now) / 1000);
    if (timeLeft > 0) {
      const min = Math.floor(timeLeft / 60), sec = timeLeft % 60;
      list.innerHTML += `<div class="boost-tag"><span>${label}</span><strong>${min}:${sec < 10 ? '0' : ''}${sec}</strong></div>`;
    }
  };

  if (state.xpBoostActive) addTag("🚀 2x XP Boost", state.xpBoostExpiry);
  if (state.activeBoosts?.marketFreezeExpiry > now) addTag("❄️ Market Freeze", state.activeBoosts.marketFreezeExpiry);
  if (state.activeBoosts?.xpShieldExpiry > now) addTag("🛡️ XP Shield", state.activeBoosts.xpShieldExpiry);
}

function setupSound() { /* Logic handled in setupSettings */ }

function simulateShare() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: 'FinTeens Arena', text: `Check out my progress! I'm Level ${state.level}!`, url: url });
  } else {
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard! Share with friends 🔗");
  }
}

function prestigeReset() {
  if (state.level < 10) { showToast("Reach Level 10 to Prestige!"); return; }
  const confirmText = prompt("Type 'PRESTIGE' to confirm. You will reset to Level 1 but keep all badges and Net Worth history.");
  if (confirmText === "PRESTIGE") {
    state.level = 1;
    state.points = 0;
    if (!state.unlockedSkills) state.unlockedSkills = [];
    state.unlockedSkills.push("prestige1");
    showAchievement("Prestige I", "You've ascended! 🎖️", "🎖️");
    saveState();
    location.reload();
  } else if (confirmText !== null) {
    showToast("Cancelled. Type exactly 'PRESTIGE' to confirm.");
  }
}

// --- DOM READY ---
window.addEventListener("DOMContentLoaded", () => {
  loadState(); initMarket(); setupNav(); setupSettings(); setupOnboarding(); goToInitialScreen();
  setTimeout(() => {
    setupCalculators(); setupScenarios(); setupMentor(); setupSpeedQuiz(); setupPowerups();
    if ($("btnUseHint")) $("btnUseHint").onclick = window.useHint;
    if ($("btnToggleChartType")) $("btnToggleChartType").onclick = () => {
        currentChartType = currentChartType === "line" ? "bar" : "line";
        $("btnToggleChartType").innerHTML = currentChartType === "line" ? "📊 Candles" : "📉 Line";
        if (currentAsset) renderAssetChart();
    };
    if ($("btnBuy")) $("btnBuy").onclick = () => processTrade("buy");
    if ($("btnSell")) $("btnSell").onclick = () => processTrade("sell");
    if ($("btnReset")) $("btnReset").onclick = () => { 
      const confirmText = prompt("Type 'RESET' to delete all progress. This cannot be undone.");
      if (confirmText === "RESET") { 
        localStorage.removeItem("finteens_data"); 
        location.reload(); 
      } else if (confirmText !== null) {
        showToast("Reset cancelled. Incorrect confirmation text.");
      }
    };
    
    document.querySelectorAll('.learn-tab').forEach(tab => {
        tab.onclick = (e) => {
            document.querySelectorAll('.learn-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const target = e.target.getAttribute('data-tab');
            if (target === 'lessons') renderLearningPaths();
            else if (target === 'glossary') renderGlossary();
            else if (target === 'facts') showFunFacts();
        };
    });
    
    if ($("btnAddGoal")) $("btnAddGoal").onclick = createGoal;
    if ($("btnAddExpense")) $("btnAddExpense").onclick = addExpense;
    if ($("btnSubmitBudget")) $("btnSubmitBudget").onclick = submitBudget;
    if ($("btnRefreshNews")) $("btnRefreshNews").onclick = () => { renderNews(); };
    if ($("btnNextQ")) $("btnNextQ").onclick = nextQuizQuestion;
    if ($("btnPrevQ")) $("btnPrevQ").onclick = prevQuizQuestion;
    
    if ($("badgeFilter")) $("badgeFilter").onchange = renderBadges;
    if ($("analyticsTimeRange")) $("analyticsTimeRange").onchange = () => renderAnalyticsChart();

    if ($("btnDeposit")) $("btnDeposit").onclick = () => {
      const amt = parseFloat($("inpDeposit")?.value);
      if (amt > 0) { addMoney(amt); $("inpDeposit").value = ""; showToast(`Deposited ₹${amt} 💰`); }
      else showToast("Enter a valid amount");
    };
    if ($("btnWithdraw")) $("btnWithdraw").onclick = () => {
      const amt = parseFloat($("inpWithdraw")?.value);
      if (amt > 0 && state.wallet >= amt) { addMoney(-amt); $("inpWithdraw").value = ""; showToast(`Withdrew ₹${amt}`); }
      else showToast(state.wallet < amt ? "Insufficient funds!" : "Enter a valid amount");
    };
    if ($("btnUPI")) $("btnUPI").onclick = () => {
      const amt = parseFloat($("upiAmount")?.value);
      const to = $("upiTo")?.value.trim();
      if (!to) { showToast("Enter recipient name"); return; }
      if (!amt || amt <= 0) { showToast("Enter a valid amount"); return; }
      if (state.wallet < amt) { showToast("Insufficient funds!"); return; }
      addMoney(-amt); $("upiAmount").value = ""; $("upiTo").value = "";
      showToast(`Sent ₹${amt} to ${to} via UPI ⚡`);
    };
    
    updateAllUI();
    renderActiveBoosts();
    renderHomeDashboard();
    
    // Final Prescriptive Handlers
    document.querySelectorAll(".l-tab").forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll(".l-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        renderLeaderboard(tab.getAttribute("data-range"));
      };
    });

    if ($("btnResetBudget")) $("btnResetBudget").onclick = () => {
      budgetCategories.forEach(cat => { if($(`budget-${cat.id}`)) $(`budget-${cat.id}`).value = ""; });
      updateBudgetRemaining();
    };
    if ($("btnNewScenario")) $("btnNewScenario").onclick = () => showToast("New scenarios coming soon! 🎲");

    document.querySelectorAll(".time-btn").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const range = parseInt(btn.getAttribute("data-range"));
        if (window.currentAsset) renderAssetChart(range);
      };
    });

    let quizTimerInterval = null;
    if ($("btnTimedQuiz")) $("btnTimedQuiz").onclick = () => {
      const timerEl = $("quizTimer");
      if (!timerEl) return;
      timerEl.classList.toggle("hidden");
      if (!timerEl.classList.contains("hidden")) {
        let t = 30;
        if ($("timerDisplay")) $("timerDisplay").textContent = t;
        clearInterval(quizTimerInterval);
        quizTimerInterval = setInterval(() => {
          t--;
          if ($("timerDisplay")) $("timerDisplay").textContent = t;
          if (t <= 0) { clearInterval(quizTimerInterval); nextQuizQuestion(); }
        }, 1000);
      } else {
        clearInterval(quizTimerInterval);
      }
    };

    setInterval(renderActiveBoosts, 1000); 
  }, 100);
});
