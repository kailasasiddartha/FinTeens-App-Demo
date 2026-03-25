/* =========================================================================
   FINTEENS FINANCE (BUDGET, GOALS, EXPENSES, CALCS)
   ========================================================================= */

// --- Budgeting ---

function renderBudget() {
  if ($("budgetIncome")) $("budgetIncome").textContent = `₹${Math.floor(state.wallet)}`;
  const container = $("budgetCategories");
  if (!container) return;
  
  if (container.innerHTML === "") {
    let html = "";
    budgetCategories.forEach(cat => {
      html += `
        <div class="row-between mb-8" style="background:var(--surface); padding:12px; border-radius:8px;">
          <span style="font-weight:500;">${cat.icon} ${cat.name}</span>
          <div style="display:flex; align-items:center;">
             <span style="margin-right:8px; color:var(--text-secondary);">₹</span>
             <input type="number" id="budget-${cat.id}" placeholder="0" oninput="updateBudgetRemaining()" style="width:90px; padding:8px; border-radius:4px; border:1px solid var(--border); background:var(--bg); color:var(--text);" min="0" />
          </div>
        </div>`;
    });
    container.innerHTML = html;
  }
  updateBudgetRemaining();
}

function updateBudgetRemaining() {
  let total = 0;
  budgetCategories.forEach(cat => {
    const el = document.getElementById(`budget-${cat.id}`);
    total += parseFloat(el?.value) || 0;
  });
  const rem = state.wallet - total;
  if ($("budgetRemaining")) {
    $("budgetRemaining").textContent = `₹${Math.floor(rem)}`;
    $("budgetRemaining").style.color = rem < 0 ? "var(--danger)" : "var(--text)";
  }
  // Disable submit if over budget
  if ($("btnSubmitBudget")) $("btnSubmitBudget").disabled = rem < 0;
}

function submitBudget() {
  let total = 0;
  budgetCategories.forEach(cat => {
    const el = document.getElementById(`budget-${cat.id}`);
    total += parseFloat(el?.value) || 0;
  });
  if (total > state.wallet) { showToast("Budget exceeds available wallet balance!"); return; }
  if (total === 0) { showToast("Please allocate some funds!"); return; }
  showAchievement("Budget Master", "Successfully planned your budget!", "📊");
  addXP(100);
  budgetCategories.forEach(cat => { if($(`budget-${cat.id}`)) $(`budget-${cat.id}`).value = ""; });
  updateBudgetRemaining();
}

// --- Goals ---

function renderGoals() {
  const list = $("goalsList"), empty = $("goalsEmpty");
  if (!list || !empty) return;
  if (!state.goals || state.goals.length === 0) { 
    list.innerHTML = ""; 
    empty.innerHTML = `
      <div class="empty-state">
        <img src="assets/empty_goals.png" alt="Empty Goals">
        <h3>No Goals Set</h3>
        <p>What are you saving for? Create your first goal to stay motivated!</p>
      </div>`;
    empty.classList.remove("hidden"); 
    return; 
  }
  empty.classList.add("hidden");
  list.innerHTML = "";
  state.goals.forEach((g, idx) => {
    const pct = Math.min(100, (g.saved / g.target) * 100);
    list.innerHTML += `
      <div style="background:var(--surface); padding:16px; border-radius:8px; margin-bottom:12px;">
        <div class="row-between mb-8">
          <strong>${g.name} ${g.completed ? '✅' : ''}</strong>
          <span style="font-weight:600;">₹${g.saved} / ₹${g.target}</span>
        </div>
        <div class="xp-bar mb-12" style="background:var(--border); height:12px; border-radius:6px;">
          <div class="xp-fill" style="width: ${pct}%; background:${g.completed ? 'var(--success)' : 'var(--primary)'}; border-radius:6px;"></div>
        </div>
        ${!g.completed ? `<div class="row gap-8">
          <input type="number" id="goal-add-${idx}" placeholder="₹" class="flex-1" style="padding:8px; border-radius:4px; border:1px solid var(--border); background:var(--bg); color:var(--text);" min="1" />
          <button class="btn" onclick="addMoneyToGoal(${idx})">Save 💰</button>
        </div>` : '<div style="color:var(--success); font-weight:bold; text-align:center;">Goal Achieved! 🎉</div>'}
      </div>`;
  });
}

function addMoneyToGoal(idx) {
  const goal = state.goals[idx];
  if (!goal) return;
  const amt = parseFloat($(`goal-add-${idx}`)?.value || 0);
  
  if (amt <= 0) { showToast("Enter a valid amount!"); return; }
  if (state.wallet < amt) { showToast("Insufficient funds!"); return; }
  
  state.wallet -= amt;
  goal.saved += amt;
  
  if (goal.saved >= goal.target && !goal.completed) {
    goal.completed = true;
    showAchievement("Goal REACHED!", `You saved for ${goal.name}! 🎉`, "🎯");
    addXP(200); triggerConfetti();
    showToast(`🎯 Goal reached: ${goal.name}!`);
  } else {
    showToast(`₹${amt} added to ${goal.name}! 💰`);
  }
  
  if ($(`goal-add-${idx}`)) $(`goal-add-${idx}`).value = "";
  saveState();
  renderGoals();
}

function createGoal() {
  const name = $("goalName")?.value, target = parseFloat($("goalTarget")?.value);
  if (name && target > 0) {
    state.goals.push({ id: Date.now(), name, target, saved: 0, completed: false });
    $("goalName").value = ""; $("goalTarget").value = "";
    saveState(); renderGoals(); showToast("Goal created! 🎯");
  } else showToast("Invalid name or target");
}

// --- Expenses ---

function renderExpenses() {
  const list = $("expenseList"), empty = $("expenseEmpty"), filter = $("expenseCatFilter")?.value || "all";
  if (!list || !empty) return;
  if (!state.expenses || state.expenses.length === 0) { 
    list.innerHTML = ""; 
    empty.innerHTML = `
      <div class="empty-state">
        <img src="assets/empty_expenses.png" alt="Empty Expenses">
        <h3>All Clear!</h3>
        <p>You haven't logged any expenses yet. Keep tracking to stay on budget!</p>
      </div>`;
    empty.classList.remove("hidden"); 
    $("expenseTotal").textContent="₹0"; 
    return; 
  }
  empty.classList.add("hidden"); list.innerHTML = ""; let total = 0;
  [...state.expenses].reverse().forEach(e => {
    if (filter === "all" || filter === e.category) {
      total += e.amount;
      const emoji = {food:"🍔", transport:"🚌", entertainment:"🎮", shopping:"🛍️", education:"📚", other:"📦"}[e.category] || "💸";
      list.innerHTML += `<div class="row-between mb-8" style="padding:12px; background:var(--surface); border-radius:8px;">
        <div class="row gap-12">
          <div style="font-size:1.5em; background:var(--bg); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${emoji}</div>
          <div><strong style="text-transform:capitalize;">${e.category}</strong><div class="text-muted" style="font-size:0.85em;">${e.note || ""} • ${e.date}</div></div>
        </div>
        <div style="color:var(--danger); font-weight:bold;">-₹${e.amount}</div>
      </div>`;
    }
  });
  $("expenseTotal").textContent = `₹${total}`;
  renderExpenseChart();
}

function addExpense() {
  const amtInput = $("expenseAmount");
  const amt = parseFloat(amtInput?.value);
  const cat = $("expenseCategory")?.value;
  const note = $("expenseNote")?.value;

  if (isNaN(amt) || amt <= 0) {
    showToast("Please enter a valid amount.");
    return;
  }
  if (state.wallet < amt) {
    showToast("Insufficient wallet balance!");
    return;
  }

  state.wallet -= amt;
  state.expenses.push({ id: Date.now(), amount: amt, category: cat, note, date: todayStr(), timestamp: Date.now() });
  
  if (amtInput) amtInput.value = "";
  if ($("expenseNote")) $("expenseNote").value = "";
  
  saveState(); 
  renderExpenses(); 
  showToast("Logged! 📝");
}

// --- Calculators ---

function setupCalculators() {
  document.querySelectorAll(".calc-tab").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".calc-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".calc-panel").forEach(p => p.classList.add("hidden"));
      const panel = $("calc-" + tab.getAttribute("data-calc"));
      if (panel) panel.classList.remove("hidden");
    };
  });
  if ($("btnCalcCompound")) $("btnCalcCompound").onclick = calculateCompound;
  if ($("btnCalcSIP")) $("btnCalcSIP").onclick = calculateSIP;
  if ($("btnCalcEMI")) $("btnCalcEMI").onclick = calculateEMI;
}

function calculateCompound() {
  const p = parseFloat($("calcPrincipal").value) || 0, r = parseFloat($("calcRate").value) || 0, t = parseFloat($("calcYears").value) || 0, n = parseFloat($("calcFrequency").value) || 1;
  const a = p * Math.pow(1 + (r / 100) / n, n * t), e = a - p;
  $("calcResult").innerHTML = `<div style="font-size:1.2rem; font-weight:bold; color:var(--success)">Value: ₹${a.toFixed(2)}</div><div class="text-muted">Earned: ₹${e.toFixed(2)}</div>`;
}

function calculateSIP() {
  const p = parseFloat($("sipMonthly").value) || 0, r = parseFloat($("sipRate").value) || 0, t = parseFloat($("sipYears").value) || 0, n = t * 12;
  let a = 0; if (r === 0) a = p * n; else { const i = r / 100 / 12; a = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i); }
  $("sipResult").innerHTML = `<div style="font-size:1.2rem; font-weight:bold; color:var(--success)">Value: ₹${a.toFixed(2)}</div><div class="text-muted">Gained: ₹${(a - (p*n)).toFixed(2)}</div>`;
}

function calculateEMI() {
  const p = parseFloat($("emiLoan").value) || 0, r = parseFloat($("emiRate").value) || 0, n = parseFloat($("emiMonths").value) || 0, i = r / 100 / 12;
  let emi = 0; if (i > 0 && n > 0) emi = p * i * (Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1); else if (n > 0) emi = p / n;
  $("emiResult").innerHTML = `<div style="font-size:1.2rem; font-weight:bold; color:var(--danger)">EMI: ₹${emi.toFixed(2)}</div><div class="text-muted">Interest: ₹${(emi*n - p).toFixed(2)}</div>`;
}
function renderExpenseChart() {
  const ctx = $("expenseChart")?.getContext("2d");
  if (!ctx) return;
  
  if (window.expenseChartInstance) window.expenseChartInstance.destroy();
  
  const categories = {};
  state.expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });
  
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  
  window.expenseChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}
