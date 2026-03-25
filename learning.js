/* =========================================================================
   FINTEENS LEARNING (LESSONS, GLOSSARY, MENTOR)
   ========================================================================= */

function renderLearningPaths() {
  const container = $("learningPaths");
  if (!container) return;
  container.innerHTML = "";
  learningPaths.forEach(path => {
    let html = `<div class="learning-path-card" style="border-left: 4px solid ${path.color}; padding: 10px; margin-bottom: 10px; background: var(--surface); border-radius: 8px;">
      <h3 style="margin-bottom: 4px;">${path.title}</h3>
      <p style="font-size: 0.9em; color: var(--text-secondary); margin-bottom: 8px;">${path.description}</p>
      <div class="lessons-list" style="display: flex; flex-direction: column; gap: 5px;">`;
    path.lessons.forEach(lessonId => {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        const isDone = state.lessonProgress && state.lessonProgress[lessonId];
        html += `<div class="button" style="text-align: left; padding: 10px; background: ${isDone ? 'var(--success-dim)' : 'var(--bg)'}; border-radius: 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="openLesson(${lessonId})">
          <span>${lesson.title}</span>
          ${isDone ? '✅' : '▶️'}
        </div>`;
      }
    });
    html += `</div></div>`;
    container.innerHTML += html;
  });
}

window.openLesson = function(lessonId) {
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) return;
  const container = $("learnContent");
  if (!container) return;
  
  let html = `<h3 style="margin-bottom:12px;">${lesson.title}</h3><div style="display:flex; flex-direction:column; gap:12px;">`;
  lesson.sections.forEach(sec => {
    html += `<div style="padding:12px; background:var(--surface); border-radius:8px;">
      <h4 style="margin-bottom:8px; color:var(--primary);">${sec.heading}</h4>
      <p style="font-size:0.95em; line-height:1.5;">${sec.content}</p>
    </div>`;
  });
  
  const isDone = state.lessonProgress && state.lessonProgress[lessonId];
  html += `<div style="display:flex; gap:10px; margin-top:10px;">
    <button class="btn" style="flex:1" onclick="renderLearningPaths(); document.querySelector('.learn-tab[data-tab=\\'lessons\\']').click();">⬅ Back</button>
    ${!isDone ? `<button class="btn" style="flex:2" onclick="completeLesson(${lessonId})">Mark Completed (+50 XP)</button>` : `<button class="btn" style="flex:2; background:var(--success)" disabled>Completed ✅</button>`}
  </div></div>`;
  
  document.querySelectorAll(".learn-tab").forEach(t => t.classList.remove("active"));
  container.innerHTML = html;
};

window.completeLesson = function(lessonId) {
  if (!state.lessonProgress) state.lessonProgress = {};
  if (!state.lessonProgress[lessonId]) {
    state.lessonProgress[lessonId] = true;
    addXP(50);
    saveState();
    showAchievement("Lesson Complete", `+50 XP earned!`, "📚");
    openLesson(lessonId); 
  } else {
    showToast("Lesson already completed.");
  }
};

function renderGlossary() {
  const container = $("learnContent");
  if (!container) return;
  let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
  glossary.forEach(item => {
    html += `<div style="padding:12px; background:var(--surface); border-radius:8px;">
      <strong style="color:var(--primary); font-size:1.1em; display:block; margin-bottom:4px;">${item.term}</strong>
      <p style="font-size:0.95em; line-height:1.4;">${item.definition}</p>
    </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

window.showFunFacts = function() {
  const container = $("learnContent");
  if (!container) return;
  let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
  dailyTips.forEach(tip => {
    html += `<div style="padding:12px; background:var(--surface); border-radius:8px; border-left: 4px solid var(--secondary);">
      <p style="font-size:0.95em; line-height:1.4;">${tip}</p>
    </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
};

function setupMentor() {
  const btn = $("btnAskMentor");
  if (btn) {
    btn.onclick = async () => {
      const input = $("mentorInput");
      const val = input?.value.trim();
      if (!val) return;

      const log = $("mentorLog");
      if (log) {
        log.innerHTML += `<div class="mb-8"><strong>You:</strong> ${val}</div>`;
        log.innerHTML += `<div class="mb-12 text-muted" id="mentor-typing"><strong>Mentor:</strong> <em>Thinking...</em></div>`;
        log.scrollTop = log.scrollHeight;
      }
      input.value = "";

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: "You are a friendly financial literacy mentor for Indian teenagers aged 13-19. Keep answers short (2-3 sentences), use simple language, mention rupees/Indian context where relevant, and always be encouraging.",
            messages: [{ role: "user", content: val }]
          })
        });
        const data = await res.json();
        const reply = data.content?.[0]?.text || "I'm not sure about that, but keep exploring!";
        const typingEl = document.getElementById("mentor-typing");
        if (typingEl) typingEl.innerHTML = `<strong>Mentor:</strong> ${reply}`;
        if (log) log.scrollTop = log.scrollHeight;
        
        // Mark challenge done
        state.challenges.mentorToday = true;
        addXP(10);
        saveState();
      } catch (e) {
        const typingEl = document.getElementById("mentor-typing");
        if (typingEl) typingEl.innerHTML = `<strong>Mentor:</strong> Having trouble connecting — check your internet!`;
      }
    };
  }
  if ($("btnClearMentor")) $("btnClearMentor").onclick = () => { if ($("mentorLog")) $("mentorLog").innerHTML = ""; };
  document.querySelectorAll(".suggestion-chip").forEach(c => {
    c.onclick = () => {
      if ($("mentorInput")) {
        $("mentorInput").value = c.getAttribute("data-q");
        if ($("btnAskMentor")) $("btnAskMentor").click();
      }
    };
  });
}

function renderNews() {
  const list = $("newsList");
  if (!list) return;
  
  // Create state if missing
  if (!state.marketNews) state.marketNews = [];
  
  // Pick 5 random news items and assign random asset impact
  const pool = [...newsItems].sort(() => 0.5 - Math.random());
  state.marketNews = pool.slice(0, 5).map(news => {
    const affectedAsset = marketAssets[Math.floor(Math.random() * marketAssets.length)];
    const direction = Math.random() > 0.5 ? 1 : -1;
    const severity = Math.random() * 0.8 + 0.2;
    return {
      ...news,
      impact: { symbol: affectedAsset.id, value: direction * severity }
    };
  });

  list.innerHTML = "";
  state.marketNews.forEach(news => {
    const card = document.createElement("div");
    card.className = "news-card p-12 mb-8 bg-surface border-left";
    const impactColor = news.impact.value > 0 ? "var(--success)" : "var(--danger)";
    card.style.borderColor = impactColor;
    
    card.innerHTML = `
      <div class="row-between mb-4">
        <strong style="color:var(--text-main)">${news.title}</strong>
        <span class="tag" style="background:${impactColor}22; color:${impactColor}; border:1px solid ${impactColor}44">
          ${news.impact.symbol} ${news.impact.value > 0 ? '▲' : '▼'}
        </span>
      </div>
      <div class="text-muted" style="font-size:0.9em;">${news.desc}</div>
    `;
    list.appendChild(card);
  });
}
