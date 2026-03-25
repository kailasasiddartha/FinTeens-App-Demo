/* =========================================================================
   FINTEENS QUIZZES
   ========================================================================= */

let currentQuizIndex = 0;
let currentQuizList = [];
let currentQuizScore = 0;

let speedQuizActive = false;
let speedQuizTimer = null;
let speedQuizTimeLeft = 60;
let speedQuizScore = 0;
let speedQuizProgress = 0;
let speedQuizMaxQ = 10;
let speedQuizStreak = 0;
let speedQuizMaxStreak = 0;
let currentSpeedQ = null;

// --- Daily Quiz ---

function loadQuizQuestion() {
  if (currentQuizList.length === 0) {
    const cat = $("quizCategory")?.value || "all";
    const diff = $("quizDifficulty")?.value || "all";
    let pool = [...quizData];
    if (cat !== "all") pool = pool.filter(q => q.category === cat);
    if (diff !== "all") pool = pool.filter(q => q.difficulty === diff);
    if (pool.length === 0) pool = [...quizData]; // fallback
    currentQuizList = pool.sort(() => 0.5 - Math.random()).slice(0, 5);
    currentQuizIndex = 0;
    currentQuizScore = 0;
  }
  
  const qContainer = $("quizQuestion");
  const optContainer = $("quizOptions");
  const expContainer = $("quizExplanation");
  
  if (!qContainer || !optContainer) return;

  if (currentQuizIndex >= currentQuizList.length) {
    qContainer.innerHTML = `
      <div style="text-align:center; padding:20px; background:var(--surface); border-radius:8px;">
        <div style="font-size:3em; margin-bottom:10px;">🎯</div>
        <h3 style="margin-bottom:10px;">Quiz Complete!</h3>
        <p style="font-size:1.1em;">You scored <strong>${currentQuizScore} / ${currentQuizList.length}</strong></p>
      </div>`;
    optContainer.innerHTML = `<button class="btn" style="width:100%; margin-top:15px;" onclick="currentQuizList=[]; loadQuizQuestion();">Play Again ↻</button>`;
    if (expContainer) expContainer.classList.add("hidden");
    if ($("btnNextQ")) $("btnNextQ").classList.add("hidden");
    if ($("btnPrevQ")) $("btnPrevQ").classList.add("hidden");
    return;
  }
  
  if ($("btnNextQ")) $("btnNextQ").classList.remove("hidden");
  if ($("btnPrevQ")) {
    $("btnPrevQ").classList.remove("hidden");
    $("btnPrevQ").disabled = currentQuizIndex === 0;
    $("btnPrevQ").style.opacity = currentQuizIndex === 0 ? "0.5" : "1";
  }
  
  const q = currentQuizList[currentQuizIndex];
  
  if ($("quizIndex")) $("quizIndex").textContent = currentQuizIndex + 1;
  if ($("quizTotal")) $("quizTotal").textContent = currentQuizList.length;
  if ($("quizScore")) $("quizScore").textContent = currentQuizScore;
  if ($("quizCategoryLabel")) $("quizCategoryLabel").textContent = q.category.toUpperCase();
  
  qContainer.innerHTML = `<h3 style="margin-bottom:15px; line-height:1.4;">${q.question}</h3>`;
  optContainer.innerHTML = "";
  if (expContainer) expContainer.classList.add("hidden");
  
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-ghost";
    btn.style.width = "100%";
    btn.style.marginBottom = "8px";
    btn.style.textAlign = "left";
    btn.style.whiteSpace = "normal";
    btn.style.height = "auto";
    btn.style.padding = "12px 16px";
    btn.textContent = opt;
    btn.onclick = () => handleQuizAnswer(idx, q.answer, q.explanation, idx);
    optContainer.appendChild(btn);
  });
}

function handleQuizAnswer(selectedIdx, correctIdx, explanation, btnIndex) {
  const optContainer = $("quizOptions");
  const btns = optContainer.querySelectorAll("button");
  btns.forEach(b => b.disabled = true);
  
  const isCorrect = selectedIdx === correctIdx;
  if (isCorrect) {
    btns[btnIndex].style.background = "var(--success)";
    btns[btnIndex].style.color = "#fff";
    currentQuizScore++;
    addXP(15);
    state.quizzesCorrect = (state.quizzesCorrect || 0) + 1;
    state.quizStreak = (state.quizStreak || 0) + 1;
    playSound("correct");
  } else {
    btns[btnIndex].style.background = "var(--danger)";
    btns[btnIndex].style.color = "#fff";
    if (btns[correctIdx]) {
      btns[correctIdx].style.background = "var(--success)";
      btns[correctIdx].style.color = "#fff";
    }
    state.quizStreak = 0;
    playSound("wrong");
  }
  if ($("btnNextQ")) $("btnNextQ").disabled = false;
  
  saveState();
  if ($("quizScore")) $("quizScore").textContent = currentQuizScore;
  if ($("quizStreakNum")) $("quizStreakNum").textContent = state.quizStreak;
  if (state.quizStreak > 0) {
    if ($("quizStreakDisplay")) $("quizStreakDisplay").classList.remove("hidden");
  } else {
    if ($("quizStreakDisplay")) $("quizStreakDisplay").classList.add("hidden");
  }
  
  const expContainer = $("quizExplanation");
  if (expContainer) {
    expContainer.innerHTML = `
      <div style="padding:12px; border-radius:8px; background:${isCorrect ? 'var(--success-dim)' : 'var(--danger-dim)'}; border-left:4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}; margin-top:10px;">
        <strong style="display:block; margin-bottom:4px;">${isCorrect ? "✅ Correct!" : "❌ Incorrect!"}</strong>
        <span style="font-size:0.95em;">${explanation || ""}</span>
      </div>`;
    expContainer.classList.remove("hidden");
  }
}

function nextQuizQuestion() { currentQuizIndex++; loadQuizQuestion(); }
function prevQuizQuestion() { if (currentQuizIndex > 0) { currentQuizIndex--; loadQuizQuestion(); } }
function useHint() {
  if (!state.inventory || state.inventory.hintTokens <= 0) {
    showToast("No Hint Tokens left! Buy more in Profile.");
    return;
  }
  const q = currentQuizList[currentQuizIndex];
  if (!q) return;
  
  state.inventory.hintTokens--;
  saveState();
  updateHintButton();
  
  const optContainer = $("quizOptions");
  const btns = optContainer.querySelectorAll("button");
  
  // Highlighting the correct answer subtly
  btns[q.answer].style.border = "2px solid var(--success)";
  btns[q.answer].classList.add("pulse");
  
  // Also disable two wrong options (50/50 style)
  let removed = 0;
  btns.forEach((btn, idx) => {
    if (idx !== q.answer && removed < 2) {
      btn.style.opacity = "0.3";
      btn.disabled = true;
      removed++;
    }
  });
  
  showToast("Hint used! 💡");
  triggerHaptic("light");
}

function updateHintButton() {
  if ($("hintCount")) $("hintCount").textContent = state.inventory?.hintTokens || 0;
}

window.useHint = useHint;

// --- Speed Quiz ---

function setupSpeedQuiz() {
  document.querySelectorAll(".speed-diff-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".speed-diff-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });
  if ($("btnStartSpeedQuiz")) $("btnStartSpeedQuiz").onclick = startSpeedQuiz;
  if ($("btnSpeedQuizAgain")) $("btnSpeedQuizAgain").onclick = () => {
    $("speedQuizResult").classList.add("hidden");
    $("speedQuizStart").classList.remove("hidden");
  };
}

function startSpeedQuiz() {
  const diffBtn = document.querySelector(".speed-diff-btn.active");
  const diff = diffBtn ? diffBtn.getAttribute("data-diff") : "easy";
  if (diff === "easy") { speedQuizTimeLeft = 90; speedQuizMaxQ = 10; }
  else if (diff === "medium") { speedQuizTimeLeft = 60; speedQuizMaxQ = 10; }
  else if (diff === "hard") { speedQuizTimeLeft = 45; speedQuizMaxQ = 15; }

  speedQuizActive = true;
  speedQuizScore = 0;
  speedQuizProgress = 0;
  speedQuizStreak = 0;
  speedQuizMaxStreak = 0;
  
  $("speedQuizStart").classList.add("hidden");
  $("speedQuizGame").classList.remove("hidden");
  $("speedQuizResult").classList.add("hidden");
  
  updateSpeedHUD();
  nextSpeedQuestion();
  
  clearInterval(speedQuizTimer);
  speedQuizTimer = setInterval(() => {
    speedQuizTimeLeft--;
    updateSpeedHUD();
    if (speedQuizTimeLeft <= 0) endGameSpeedQuiz("Time's Up! ⏱️");
  }, 1000);
}

function updateSpeedHUD() {
  if ($("speedQuizTime")) $("speedQuizTime").textContent = speedQuizTimeLeft;
  if ($("speedQuizScore")) $("speedQuizScore").textContent = speedQuizScore;
  if ($("speedQuizProgress")) $("speedQuizProgress").textContent = `${speedQuizProgress}/${speedQuizMaxQ}`;
  if ($("speedStreakCount")) $("speedStreakCount").textContent = speedQuizStreak;
}

function nextSpeedQuestion() {
  if (speedQuizProgress >= speedQuizMaxQ) {
    endGameSpeedQuiz("Quiz Complete! 🎉");
    return;
  }
  speedQuizProgress++;
  currentSpeedQ = quizData[Math.floor(Math.random() * quizData.length)];
  updateSpeedHUD();
  if ($("speedQuizQ")) $("speedQuizQ").innerHTML = `<h3>${currentSpeedQ.question}</h3>`;
  const optsContainer = $("speedQuizOptions");
  if (optsContainer) {
    optsContainer.innerHTML = "";
    currentSpeedQ.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-ghost speed-opt-btn";
      btn.textContent = opt;
      btn.onclick = () => handleSpeedAnswer(idx, currentSpeedQ.answer);
      optsContainer.appendChild(btn);
    });
  }
}

function handleSpeedAnswer(selectedIdx, correctIdx) {
  if (!speedQuizActive) return;
  const optsContainer = $("speedQuizOptions");
  const btns = optsContainer.querySelectorAll("button");
  btns.forEach(b => b.disabled = true);
  
  if (selectedIdx === correctIdx) {
    btns[selectedIdx].style.background = "var(--success)";
    btns[selectedIdx].style.color = "#fff";
    speedQuizScore++;
    speedQuizStreak++;
    if (speedQuizStreak > speedQuizMaxStreak) speedQuizMaxStreak = speedQuizStreak;
    playSound("correct");
  } else {
    btns[selectedIdx].style.background = "var(--danger)";
    btns[selectedIdx].style.color = "#fff";
    if (btns[correctIdx]) {
      btns[correctIdx].style.background = "var(--success)";
      btns[correctIdx].style.color = "#fff";
    }
    speedQuizStreak = 0;
    playSound("wrong");
  }
  updateSpeedHUD();
  setTimeout(nextSpeedQuestion, 800);
}

function endGameSpeedQuiz(msg) {
  speedQuizActive = false;
  clearInterval(speedQuizTimer);
  $("speedQuizGame").classList.add("hidden");
  $("speedQuizResult").classList.remove("hidden");
  if ($("speedQuizMessage")) $("speedQuizMessage").textContent = msg;
  if ($("speedQuizFinalScore")) $("speedQuizFinalScore").textContent = speedQuizScore;
  if ($("speedMaxStreak")) $("speedMaxStreak").textContent = speedQuizMaxStreak;
  
  const diffBtn = document.querySelector(".speed-diff-btn.active");
  const diff = diffBtn ? diffBtn.getAttribute("data-diff") : "easy";
  let multiplier = 5;
  if (diff === "medium") multiplier = 10;
  if (diff === "hard") multiplier = 15;
  
  const xpEarned = speedQuizScore * multiplier + (speedQuizMaxStreak * 2);
  if ($("speedQuizXP")) $("speedQuizXP").textContent = xpEarned;
  if (xpEarned > 0) {
    addXP(xpEarned);
    showAchievement("Speed Quiz Complete", `+${xpEarned} XP earned!`, "⚡");
    triggerConfetti();
  }
}
