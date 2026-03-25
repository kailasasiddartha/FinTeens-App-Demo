/* =========================================================================
   FINTEENS TRADING & MARKET
   ========================================================================= */

let marketPrices = {};
let priceHistory = {};
let volumeHistory = {};
let currentAsset = null;
let marketInterval = null;
let currentChartType = "line";

function initMarket() {
  if (marketInterval) clearInterval(marketInterval);
  marketAssets.forEach(a => {
    if (!marketPrices[a.id]) {
      marketPrices[a.id] = a.basePrice;
      priceHistory[a.id] = [{ o: a.basePrice, h: a.basePrice + 1, l: Math.max(1, a.basePrice - 1), c: a.basePrice }];
    }
  });

  // Simulate market every 5 seconds if looking at it
  marketInterval = setInterval(() => {
    // Check Market Freeze Power-up
    if (state.activeBoosts?.marketFreezeExpiry > Date.now()) {
      return; // Skip price update
    }
    
    let changed = false;
    marketAssets.forEach(a => {
      let open = marketPrices[a.id];
      
      // Momentum Logic
      if (!state.marketMomentum) state.marketMomentum = {};
      if (!state.marketMomentum[a.id]) state.marketMomentum[a.id] = 0;
      
      const volatility = a.vol || 0.02;
      const drift = (Math.random() - 0.5) * (volatility * 2);
      const momentumEffect = state.marketMomentum[a.id] * 0.15;
      
      let changePercent = drift + momentumEffect;

      // News Impact Logic
      const activeNews = state.marketNews?.find(n => n.impact && n.impact.symbol === a.id);
      if (activeNews) {
        changePercent += (activeNews.impact.value * 0.1); // Direct impact
        // Small chance to consume news after impact
        if (Math.random() > 0.7) activeNews.impact.value *= 0.5;
      }

      // Update Momentum for next cycle
      state.marketMomentum[a.id] = (state.marketMomentum[a.id] * 0.7) + (changePercent * 0.3);

      let change = changePercent * open;
      let close = Math.max(1, open + change);
      marketPrices[a.id] = close;

      let high = Math.max(open, close) + (Math.random() * (volatility / 2) * open);
      let low = Math.max(1, Math.min(open, close) - (Math.random() * (volatility / 2) * open));

      priceHistory[a.id].push({ o: open, h: high, l: low, c: close });
      if (priceHistory[a.id].length > 40) priceHistory[a.id].shift(); 

      changed = true;
    });

    const tabF = document.getElementById("tab-finance");
    if (changed && tabF && tabF.classList.contains("active")) {
      renderMarket();
      renderPortfolio();
      if (currentAsset) renderAssetChart();
    }
  }, 5000);
}

function stopMarket() {
  if (marketInterval) clearInterval(marketInterval);
}

function renderMarket() {
  const list = $("marketList");
  if (!list) return;
  list.innerHTML = "";

  marketAssets.forEach(a => {
    const price = marketPrices[a.id];
    const histArr = priceHistory[a.id];
    const prevObj = histArr[Math.max(0, histArr.length - 2)] || histArr[0];
    const prev = prevObj.c;
    const diff = price - prev;
    const pct = (diff / prev) * 100;

    const div = document.createElement("div");
    div.className = `market-item ${currentAsset && currentAsset.id === a.id ? "selected" : ""}`;
    div.innerHTML = `
      <div class="mi-asset">
        ${a.name}
        <span class="mi-type">${a.id} • ${a.type}</span>
      </div>
      <div class="mi-price">₹${price.toFixed(2)}</div>
      <div class="mi-change ${diff >= 0 ? "up" : "down"}">
        ${diff >= 0 ? "+" : ""}${pct.toFixed(2)}%
      </div>
    `;
    div.onclick = () => selectAsset(a);
    list.appendChild(div);
  });

  if (!currentAsset && marketAssets.length > 0) selectAsset(marketAssets[0]);

  const portSummaryVal = $("marketSummaryVal");
  if (portSummaryVal) {
    let portVal = 0, invested = 0;
    state.portfolio?.forEach(h => { 
      const p = marketPrices[h.id] || h.avgPrice;
      portVal += h.qty * p;
      invested += h.qty * h.avgPrice;
    });
    const pl2 = portVal - invested;
    const isProfit = pl2 >= 0;
    portSummaryVal.innerHTML = `₹${Math.floor(portVal)} <span style="color: ${isProfit ? 'var(--success)' : 'var(--danger)'}; margin-left: 8px; font-size: 13px;">${isProfit ? '▲' : '▼'} ₹${Math.abs(Math.floor(pl2))}</span>`;
  }
}

function selectAsset(asset) {
  currentAsset = asset;
  renderMarket();
  renderAssetChart();
  const sel = $("tradeAsset");
  if (sel) {
    // Always clear and repopulate to stay in sync
    sel.innerHTML = "";
    marketAssets.forEach(a => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = `${a.name} (${a.id})`;
      sel.appendChild(opt);
    });
    sel.value = asset.id;
  }
}

function renderAssetChart(range = 40) {
  if (!currentAsset) return;
  const price = marketPrices[currentAsset.id];
  const histObj = (priceHistory[currentAsset.id] || []).slice(-range);
  if (histObj.length === 0) return;
  
  const prev = histObj[0].c; 
  const diff = price - prev;
  const pct = (diff / prev) * 100;

  if ($("chartAssetName")) $("chartAssetName").textContent = `${currentAsset.name} (${currentAsset.id})`;
  if ($("chartAssetPrice")) $("chartAssetPrice").textContent = `₹${price.toFixed(2)}`;

  const diffEl = $("chartPriceChange");
  if (diffEl) {
    diffEl.textContent = `${diff >= 0 ? "+" : ""}${diff.toFixed(2)} (${pct.toFixed(2)}%)`;
    diffEl.className = `chart-price-change ${diff >= 0 ? "up" : "down"}`;
  }

  const latest = histObj[histObj.length - 1];
  if ($("chartOpen")) $("chartOpen").textContent = `₹${latest.o.toFixed(2)}`;
  if ($("chartHigh")) $("chartHigh").textContent = `₹${latest.h.toFixed(2)}`;
  if ($("chartLow")) $("chartLow").textContent = `₹${latest.l.toFixed(2)}`;

  const canvas = $("marketChart");
  if (!canvas) return;
  
  const currentVol = (currentAsset.vol * price * 100).toFixed(0);
  if ($("chartVolume")) $("chartVolume").textContent = currentVol;

  if (window.marketChartInstance) window.marketChartInstance.destroy();
  
  const isUp = diff >= 0;
  const color = isUp ? "#10b981" : "#ef4444";
  const bgColor = isUp ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";

  const labels = histObj.map((_, i) => `${i}m`).reverse();
  const lineData = histObj.map(h => h.c);
  const maData = lineData.map((_, idx, arr) => {
    const period = Math.min(idx + 1, 5);
    const slice = arr.slice(Math.max(0, idx - period + 1), idx + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

  let datasets = [];
  if (currentChartType === 'line') {
    datasets.push({
      label: 'Price',
      data: lineData,
      borderColor: color,
      backgroundColor: bgColor,
      borderWidth: 3,
      pointRadius: 0,
      fill: true,
      tension: 0.2
    });
  } else {
    datasets.push({
      type: 'line',
      label: 'Trend',
      data: maData,
      borderColor: 'rgba(255, 255, 255, 0.25)',
      borderWidth: 4,
      pointRadius: 0,
      tension: 0.4,
      fill: false
    });

    datasets.push({
      type: 'bar',
      data: histObj.map(h => [h.o, h.c]),
      backgroundColor: histObj.map(h => h.c >= h.o ? "#10b981" : "#ef4444"),
      borderWidth: 0,
      borderRadius: 2,
      barPercentage: 0.6
    });
  }

  window.marketChartInstance = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    plugins: [
      {
        id: 'wickPlugin',
        beforeDatasetsDraw(chart) {
          if (currentChartType !== 'bar') return;
          const ctx = chart.ctx;
          const meta = chart.getDatasetMeta(1);
          const yScale = chart.scales.y;
          meta.data.forEach((bar, index) => {
            const candle = histObj[index];
            if (!candle) return;
            ctx.strokeStyle = candle.c >= candle.o ? "#10b981" : "#ef4444";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bar.x, yScale.getPixelForValue(candle.h));
            ctx.lineTo(bar.x, yScale.getPixelForValue(candle.l));
            ctx.stroke();
          });
        }
      }
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { 
        intersect: false, 
        mode: 'index',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          usePointStyle: true,
          callbacks: {
            label: (context) => {
              if (currentChartType === 'bar') {
                const c = histObj[context.dataIndex];
                return [
                  ` Open:  ₹${c.o.toFixed(1)}`,
                  ` High:  ₹${c.h.toFixed(1)}`,
                  ` Low:   ₹${c.l.toFixed(1)}`,
                  ` Close: ₹${c.c.toFixed(1)}`
                ];
              }
              return ` Price: ₹${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      hover: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: { 
          display: true, 
          grid: { display: false, drawBorder: false },
          ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10 } }
        },
        y: { 
          display: true, 
          position: 'right',
          grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
          ticks: { 
            color: 'rgba(255, 255, 255, 0.4)', 
            font: { size: 10 },
            callback: (v) => `₹${v.toFixed(0)}` 
          } 
        }
      }
    }
  });
}

function processTrade(type) {
  const selAssetId = $("tradeAsset")?.value;
  if (selAssetId) currentAsset = marketAssets.find(a => a.id === selAssetId);
  if (!currentAsset) return;

  const qty = parseFloat($("tradeQty")?.value || 0);
  if (isNaN(qty) || qty <= 0) {
    showToast("Invalid quantity");
    return;
  }

  const price = marketPrices[currentAsset.id];
  const total = qty * price;

  if (type === "buy") {
    if (state.wallet < total) {
      showToast("Insufficient funds!");
      return;
    }
    state.wallet -= total;
    let holding = state.portfolio.find(p => p.id === currentAsset.id);
    if (holding) {
      holding.avgPrice = ((holding.qty * holding.avgPrice) + total) / (holding.qty + qty);
      holding.qty += qty;
    } else {
      state.portfolio.push({ id: currentAsset.id, qty: qty, avgPrice: price });
    }
    logTrade(currentAsset.id, "Buy", qty, price, total);
    showAchievement("Trade Executed", `Bought ${qty} ${currentAsset.id}`, "💰");
    playSound("coin");
  } else {
    let holding = state.portfolio.find(p => p.id === currentAsset.id);
    if (!holding || holding.qty < qty) {
      showToast("Not enough shares to sell!");
      return;
    }
    state.wallet += total;
    holding.qty -= qty;
    if (holding.qty <= 0) state.portfolio = state.portfolio.filter(p => p.id !== currentAsset.id);
    logTrade(currentAsset.id, "Sell", qty, price, total);
    showAchievement("Trade Executed", `Sold ${qty} ${currentAsset.id}`, "💰");
    playSound("coin");
  }

  if ($("tradeQty")) $("tradeQty").value = "";
  saveState();
  renderPortfolio();
}

function logTrade(asset, type, qty, price, total) {
  state.tradeHistory.unshift({
    asset, type, qty, price, total,
    date: `${new Date().toLocaleTimeString()} ${todayStr()}`
  });
  if (state.tradeHistory.length > 20) state.tradeHistory.pop();
}

function renderPortfolio() {
  const pList = $("portfolioList");
  const thList = $("tradeHistoryList");
  if (!pList || !thList) return;

  let totalVal = 0;
  pList.innerHTML = "";
  state.portfolio.forEach(h => {
    const curPrice = marketPrices[h.id] || h.avgPrice;
    const curTotal = h.qty * curPrice;
    const investTotal = h.qty * h.avgPrice;
    const pl = curTotal - investTotal;
    const plPct = (pl / investTotal) * 100;
    totalVal += curTotal;

    pList.innerHTML += `
      <div class="portfolio-item">
        <div class="pi-asset"><strong>${h.id}</strong><span>${h.qty} shares</span></div>
        <div class="pi-value"><strong>₹${curTotal.toFixed(2)}</strong><span>Avg: ₹${h.avgPrice.toFixed(2)}</span></div>
        <div class="pi-pl ${pl >= 0 ? "up" : "down"}">${pl >= 0 ? "+" : ""}₹${pl.toFixed(2)}<br><small>${plPct.toFixed(2)}%</small></div>
      </div>
    `;
  });

  if (state.portfolio.length === 0) {
    pList.innerHTML = `
      <div class="empty-state">
        <img src="assets/empty_portfolio.png" alt="Empty Portfolio">
        <h3>No Assets Yet</h3>
        <p>Your portfolio is empty. Explore the market and start your investment journey!</p>
      </div>`;
  }
  if ($("portfolioValue")) $("portfolioValue").textContent = `₹${totalVal.toFixed(2)}`;
  if ($("walletBalance2")) $("walletBalance2").textContent = `₹${state.wallet.toFixed(2)}`;

  thList.innerHTML = "";
  state.tradeHistory.forEach(t => {
    thList.innerHTML += `
      <div class="trade-hist-item ${t.type.toLowerCase()}">
        <div class="th-left"><span class="th-asset">${t.type} ${t.asset}</span><span class="th-date">${t.date}</span></div>
        <div class="th-right"><span class="th-total">₹${t.total.toFixed(2)}</span><br><span class="th-qty">${t.qty} @ ₹${t.price.toFixed(2)}</span></div>
      </div>
    `;
  });
}
