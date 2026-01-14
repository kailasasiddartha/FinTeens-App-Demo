// ====== STATE ======
const defaultState = {
  name: "Guest", age: null, points: 0, level: 1, quizzesCorrect: 0, wallet: 0,
  portfolio: [], streak: 0, lastLogin: null, badges: [], dailyClaimed: null,
  challenges: { quizToday: false, depositToday: false, tradeToday: false, mentorToday: false, upiToday: false, budgetToday: false, goalToday: false, expenseToday: false, lessonToday: false },
  quizAnswers: {}, goals: [], weeklyProgress: { trades: 0, quizzes: 0, logins: 0 }, theme: "dark",
  // New features
  expenses: [], lessonsRead: 0, scenariosCompleted: 0, soundEnabled: true,
  xpMultiplier: 1, totalXpEarned: 0, analyticsHistory: [],
  newsRead: [], marketNews: []
};

function loadState() {
  try {
    const raw = localStorage.getItem("finteensGamingState");
    if (!raw) return { ...defaultState };
    return { ...defaultState, ...JSON.parse(raw) };
  } catch (e) { return { ...defaultState }; }
}

let state = loadState();
const $ = id => document.getElementById(id);

// ====== EXPANDED QUIZ QUESTIONS ======
const quizQuestions = [
  // BASICS
  { q: "You get ₹500 pocket money. What's the smartest first move?", options: ["Spend it fast before it 'gets over'", "Save a part (like 20–30%) before spending", "Lend all to a friend for fun", "Buy loot boxes in a game immediately"], correct: 1, category: "basics", difficulty: "beginner" },
  { q: "What is 'emergency fund'?", options: ["Money kept aside only for shopping", "Money you borrow from friends last minute", "Money saved for unexpected events like doctor, repairs", "Loan you take from any app"], correct: 2, category: "basics", difficulty: "beginner" },
  { q: "What is the 50-30-20 budget rule?", options: ["50% tax, 30% spend, 20% save", "50% needs, 30% wants, 20% savings", "50% invest, 30% save, 20% spend", "Random numbers"], correct: 1, category: "basics", difficulty: "beginner" },
  { q: "What's the difference between needs and wants?", options: ["They are the same", "Needs are essentials, wants are extras", "Wants are more important", "Needs are cheaper"], correct: 1, category: "basics", difficulty: "beginner" },
  { q: "Why is tracking expenses important?", options: ["It's not important", "To show off to friends", "To understand where money goes and save more", "Banks require it"], correct: 2, category: "basics", difficulty: "beginner" },
  { q: "What is financial literacy?", options: ["Reading about banks", "Understanding how to manage money effectively", "Being rich", "Having a credit card"], correct: 1, category: "basics", difficulty: "beginner" },
  { q: "What's the best way to avoid impulse buying?", options: ["Buy immediately when you see something", "Wait 24-48 hours before purchasing", "Use credit cards for everything", "Never go shopping"], correct: 1, category: "basics", difficulty: "intermediate" },

  // UPI & DIGITAL SAFETY
  { q: "What is the safest way to use UPI?", options: ["Share OTP if caller says 'I am from bank'", "Type your UPI PIN on any website that asks", "Only enter UPI PIN inside your own UPI app", "Let strangers scan your QR to test"], correct: 2, category: "upi", difficulty: "beginner" },
  { q: "What should you NEVER share during a UPI transaction?", options: ["Your name", "Your UPI ID", "Your OTP and PIN", "The amount you're sending"], correct: 2, category: "upi", difficulty: "beginner" },
  { q: "What is two-factor authentication (2FA)?", options: ["Logging in twice", "Using two passwords", "An extra security step beyond password", "Having two bank accounts"], correct: 2, category: "upi", difficulty: "intermediate" },
  { q: "Someone sends you a UPI request to 'receive' money. What should you do?", options: ["Approve it quickly", "Enter your PIN immediately", "Decline – you don't need to approve to receive money", "Call the person and share OTP"], correct: 2, category: "upi", difficulty: "beginner" },
  { q: "What is phishing?", options: ["A hobby", "Fake messages/sites to steal your info", "A type of investment", "Bank verification"], correct: 1, category: "upi", difficulty: "intermediate" },
  { q: "Is it safe to use public WiFi for banking?", options: ["Yes, always", "No, it can be risky", "Only on weekends", "Only with VPN"], correct: 3, category: "upi", difficulty: "intermediate" },

  // INVESTING
  { q: "Which one is usually LOWER risk?", options: ["Random crypto you saw on Instagram", "Stocks you never researched", "Ponzi schemes promising 'double in 10 days'", "Diversified mutual fund from a legit platform"], correct: 3, category: "investing", difficulty: "intermediate" },
  { q: "What is a mutual fund?", options: ["A loan from friends", "Money pooled from many investors", "A type of cryptocurrency", "Government subsidy"], correct: 1, category: "investing", difficulty: "beginner" },
  { q: "What is SIP in investing?", options: ["Single Investment Plan", "Systematic Investment Plan", "Stock Interest Payment", "Savings Interest Pool"], correct: 1, category: "investing", difficulty: "intermediate" },
  { q: "If someone promises 100% returns in 1 month, it's likely:", options: ["A great opportunity", "A scam or fraud", "Government scheme", "Safe investment"], correct: 1, category: "investing", difficulty: "beginner" },
  { q: "What is the purpose of SEBI?", options: ["To print money", "To regulate stock markets", "To collect taxes", "To give loans"], correct: 1, category: "investing", difficulty: "advanced" },
  { q: "What is diversification in investing?", options: ["Putting all money in one stock", "Spreading investments across different assets", "Only investing in gold", "Day trading"], correct: 1, category: "investing", difficulty: "intermediate" },
  { q: "What is an IPO?", options: ["Initial Public Offering - company's first stock sale", "Internal Payment Order", "Investment Portfolio Option", "Indian Post Office"], correct: 0, category: "investing", difficulty: "intermediate" },
  { q: "What is a dividend?", options: ["A type of loan", "Share of company profits paid to stockholders", "Bank fee", "Investment loss"], correct: 1, category: "investing", difficulty: "intermediate" },
  { q: "What does 'buy low, sell high' mean?", options: ["Buy cheap products", "Purchase assets when prices are low, sell when high", "Always buy the cheapest stocks", "Sell immediately after buying"], correct: 1, category: "investing", difficulty: "beginner" },
  { q: "What is a bear market?", options: ["Market with animal stocks", "Market where prices are falling", "Market only in winter", "Outdoor market"], correct: 1, category: "investing", difficulty: "advanced" },

  // BANKING
  { q: "If RBI increases interest rates on savings, who benefits?", options: ["People who keep money in savings or FDs", "Only people taking loans", "Nobody, it is random", "Only people who trade crypto"], correct: 0, category: "banking", difficulty: "intermediate" },
  { q: "What is compound interest?", options: ["Interest on principal only", "Interest on interest + principal", "A type of tax", "Fee charged by banks"], correct: 1, category: "banking", difficulty: "intermediate" },
  { q: "What does KYC stand for?", options: ["Keep Your Cash", "Know Your Customer", "Key Year Calculation", "Kindly Yield Currency"], correct: 1, category: "banking", difficulty: "beginner" },
  { q: "What is inflation?", options: ["Decrease in prices", "Increase in prices over time", "A type of investment", "Bank interest rate"], correct: 1, category: "banking", difficulty: "intermediate" },
  { q: "What is a debit card?", options: ["Borrowed money card", "Card linked to your bank balance", "Credit building tool", "Gift card"], correct: 1, category: "banking", difficulty: "beginner" },
  { q: "What is a fixed deposit (FD)?", options: ["Money you can withdraw anytime", "Money locked for a fixed period with guaranteed returns", "Stock investment", "Cryptocurrency"], correct: 1, category: "banking", difficulty: "beginner" },
  { q: "What happens if you miss a credit card payment?", options: ["Nothing", "You pay interest and late fees", "You get bonus points", "Your limit increases"], correct: 1, category: "banking", difficulty: "intermediate" },
  { q: "What is CIBIL score?", options: ["A game score", "Credit score showing loan worthiness", "Bank account number", "ATM PIN"], correct: 1, category: "banking", difficulty: "intermediate" },
  { q: "What is the DICGC insurance limit in India?", options: ["₹1 lakh", "₹5 lakh", "₹10 lakh", "Unlimited"], correct: 1, category: "banking", difficulty: "advanced" },
  { q: "What is an overdraft?", options: ["Extra money given free", "Withdrawing more than your balance (with fees)", "Bank bonus", "Interest payment"], correct: 1, category: "banking", difficulty: "intermediate" },

  // TAXES
  { q: "What is GST?", options: ["General Savings Tax", "Goods and Services Tax", "Government Stock Trade", "Global System Tax"], correct: 1, category: "taxes", difficulty: "beginner" },
  { q: "What is a PAN card used for?", options: ["Cooking", "Tax identification", "Voting", "Driving"], correct: 1, category: "taxes", difficulty: "beginner" },
  { q: "At what income level does income tax start in India (approx)?", options: ["₹1 lakh", "₹2.5 lakh", "₹5 lakh", "₹10 lakh"], correct: 1, category: "taxes", difficulty: "intermediate" },
  { q: "What is TDS?", options: ["Tax Deducted at Source", "Total Deposit Savings", "Trade Deposit System", "Tax Document Service"], correct: 0, category: "taxes", difficulty: "intermediate" },
  { q: "What is ITR?", options: ["Income Tax Return", "Interest Tax Rate", "Investment Tax Report", "Indian Tax Revenue"], correct: 0, category: "taxes", difficulty: "beginner" },

  // CRYPTOCURRENCY (New Category)
  { q: "What is Bitcoin?", options: ["A physical coin", "A decentralized digital currency", "A bank product", "Government money"], correct: 1, category: "crypto", difficulty: "beginner" },
  { q: "What is a blockchain?", options: ["A type of chain", "A distributed ledger technology", "A bank vault", "A crypto exchange"], correct: 1, category: "crypto", difficulty: "intermediate" },
  { q: "What is a crypto wallet?", options: ["Physical wallet for coins", "Software/hardware to store crypto keys", "Bank account", "Mining machine"], correct: 1, category: "crypto", difficulty: "beginner" },
  { q: "Why is cryptocurrency considered volatile?", options: ["It's very stable", "Prices can change dramatically quickly", "Government controls it", "It never changes value"], correct: 1, category: "crypto", difficulty: "intermediate" },
  { q: "What is 'HODL' in crypto?", options: ["A trading strategy", "Hold On for Dear Life - long-term holding", "A type of coin", "Selling quickly"], correct: 1, category: "crypto", difficulty: "intermediate" },
  { q: "Is cryptocurrency legal in India?", options: ["Completely banned", "Legal but taxed (30% on gains)", "No regulation exists", "Only Bitcoin is legal"], correct: 1, category: "crypto", difficulty: "advanced" },

  // INSURANCE (New Category)
  { q: "What is term life insurance?", options: ["Insurance that never expires", "Coverage for a specific period at low cost", "Health insurance", "Car insurance"], correct: 1, category: "insurance", difficulty: "beginner" },
  { q: "Why is health insurance important?", options: ["It's not important", "To cover medical expenses during illness", "To get tax benefits only", "Banks require it"], correct: 1, category: "insurance", difficulty: "beginner" },
  { q: "What is a premium in insurance?", options: ["Bonus money received", "Amount you pay for insurance coverage", "Hospital fee", "Insurance claim"], correct: 1, category: "insurance", difficulty: "beginner" },
  { q: "What is a claim in insurance?", options: ["Monthly payment", "Request for payment when loss occurs", "Insurance policy", "Premium amount"], correct: 1, category: "insurance", difficulty: "beginner" },
  { q: "What does 'sum assured' mean?", options: ["Premium amount", "Maximum amount insurer will pay", "Hospital charges", "Your income"], correct: 1, category: "insurance", difficulty: "intermediate" },

  // CREDIT CARDS (New Category)  
  { q: "What is a credit limit?", options: ["Minimum spending required", "Maximum amount you can borrow on card", "Interest rate", "Annual fee"], correct: 1, category: "creditcards", difficulty: "beginner" },
  { q: "What is the ideal credit card usage?", options: ["Use 100% of limit", "Use less than 30% of limit", "Never use it", "Max out every month"], correct: 1, category: "creditcards", difficulty: "intermediate" },
  { q: "What is APR on credit cards?", options: ["Annual Percentage Rate - yearly interest", "Average Payment Rate", "Automatic Payment Reminder", "Account Protection Rate"], correct: 0, category: "creditcards", difficulty: "intermediate" },
  { q: "What happens if you only pay minimum due?", options: ["Nothing, it's fine", "You pay high interest on remaining balance", "Your credit improves", "You get rewards"], correct: 1, category: "creditcards", difficulty: "intermediate" },
  { q: "Are credit card rewards 'free money'?", options: ["Yes, completely free", "No, you often pay through fees or overspending", "Only if you have gold card", "Always free"], correct: 1, category: "creditcards", difficulty: "advanced" },

  // ENTREPRENEURSHIP (New Category)
  { q: "What is revenue?", options: ["Profit after expenses", "Total money earned from sales", "Money invested", "Bank loan"], correct: 1, category: "entrepreneurship", difficulty: "beginner" },
  { q: "What is the difference between revenue and profit?", options: ["Same thing", "Profit = Revenue - Expenses", "Revenue is less than profit", "Profit comes before revenue"], correct: 1, category: "entrepreneurship", difficulty: "beginner" },
  { q: "What is a startup?", options: ["Old company", "New business designed to grow fast", "Government organization", "Bank branch"], correct: 1, category: "entrepreneurship", difficulty: "beginner" },
  { q: "What does 'break-even' mean?", options: ["Making huge profits", "Point where revenue equals costs", "Going bankrupt", "Starting a business"], correct: 1, category: "entrepreneurship", difficulty: "intermediate" },
  { q: "What is an investor?", options: ["Someone who gives donations", "Person who provides capital expecting returns", "Bank employee", "Tax collector"], correct: 1, category: "entrepreneurship", difficulty: "beginner" }
];

let currentQuestionIndex = 0, quizScore = 0, filteredQuestions = [...quizQuestions], timerInterval = null, isTimedMode = false;

// ====== MARKET & ASSETS ======
const marketAssets = [
  // Stocks
  { id: "FNT", name: "FinTech Nova Token", base: 120, type: "stock" },
  { id: "EDU", name: "EduVerse Learn Coin", base: 80, type: "stock" },
  { id: "GRW", name: "Growth Guild Stock", base: 150, type: "stock" },
  { id: "SAF", name: "SafeHaven Bond", base: 200, type: "stock" },
  { id: "GRN", name: "GreenTech Energy", base: 95, type: "stock" },
  { id: "HLT", name: "HealthPlus Corp", base: 175, type: "stock" },
  // Crypto
  { id: "BTC", name: "Bitcoin (Virtual)", base: 500, type: "crypto", volatility: 0.25 },
  { id: "ETH", name: "Ethereum (Virtual)", base: 250, type: "crypto", volatility: 0.22 },
  { id: "DOGE", name: "Dogecoin (Virtual)", base: 15, type: "crypto", volatility: 0.35 },
  // Commodities
  { id: "GOLD", name: "Gold (Virtual)", base: 600, type: "commodity", volatility: 0.08 },
  { id: "SLVR", name: "Silver (Virtual)", base: 75, type: "commodity", volatility: 0.12 },
  { id: "OIL", name: "Crude Oil (Virtual)", base: 85, type: "commodity", volatility: 0.18 }
];
let marketPrices = {}, marketChart = null, priceHistory = {}, chartRange = 20;
// Initialize price history with OHLC data structure
marketAssets.forEach(a => {
  priceHistory[a.id] = { prices: [], volumes: [], ohlc: [] };
});

// ====== BUDGET SCENARIOS ======
const budgetCategories = [
  { id: "needs", name: "Needs (Food, Transport)", icon: "🍕", recommended: 50 },
  { id: "wants", name: "Wants (Entertainment)", icon: "🎮", recommended: 30 },
  { id: "savings", name: "Savings", icon: "💰", recommended: 20 },
  { id: "education", name: "Education", icon: "📚", recommended: 0 },
  { id: "gifts", name: "Gifts & Charity", icon: "🎁", recommended: 0 }
];
let budgetIncome = 5000, budgetAllocations = {}, budgetChart = null;

// ====== LESSONS DATA ======
const lessons = [
  { id: 1, title: "What is Money?", content: "Money is a tool we use to exchange value. It started as barter (trading goods), then coins, paper notes, and now digital payments like UPI!", category: "basics", read: false },
  { id: 2, title: "The Power of Saving", content: "Saving means keeping some money aside before spending. Even ₹100/month can grow big over time. The 50-30-20 rule: 50% needs, 30% wants, 20% savings.", category: "basics", read: false },
  { id: 3, title: "UPI Safety 101", content: "Never share your UPI PIN or OTP. Banks never call asking for these. Always verify the receiver before sending money. Use only official apps.", category: "upi", read: false },
  { id: 4, title: "What are Stocks?", content: "When you buy a stock, you own a tiny piece of a company. If the company does well, your stock value goes up. If it doesn't, it goes down.", category: "investing", read: false },
  { id: 5, title: "Understanding Interest", content: "Interest is the cost of borrowing money OR the reward for saving. Simple interest = Principal × Rate × Time. Compound interest earns interest on interest!", category: "banking", read: false },
  { id: 6, title: "What is a Budget?", content: "A budget is a plan for your money. List your income, then allocate to needs, wants, and savings. Track spending to stay on target.", category: "basics", read: false },
  { id: 7, title: "Cryptocurrency Basics", content: "Cryptocurrency is digital money that isn't controlled by any government or bank. Bitcoin was the first, created in 2009. Crypto is highly volatile - prices can change dramatically!", category: "crypto", read: false },
  { id: 8, title: "Insurance 101", content: "Insurance protects you financially from unexpected events. You pay a small premium regularly, and the insurer covers large expenses when something bad happens.", category: "insurance", read: false },
  { id: 9, title: "Credit Cards Explained", content: "A credit card lets you borrow money for purchases. You must pay it back, usually within a month, or pay high interest (often 36%+ per year). Use wisely!", category: "creditcards", read: false },
  { id: 10, title: "Starting a Business", content: "A business solves problems for customers. Start by identifying a need, create a solution, and sell it for more than it costs to make. Revenue - Expenses = Profit!", category: "entrepreneurship", read: false },
  { id: 11, title: "Emergency Funds", content: "An emergency fund is 3-6 months of expenses saved for unexpected events like job loss or medical emergencies. Keep it in a savings account for easy access.", category: "basics", read: false },
  { id: 12, title: "Tax Basics for Teens", content: "Tax is money paid to the government for public services. In India, income tax starts at ₹2.5 lakh yearly. GST is added to things you buy.", category: "taxes", read: false }
];

const glossary = [
  { term: "APR", definition: "Annual Percentage Rate - the yearly cost of borrowing money" },
  { term: "Asset", definition: "Something valuable you own, like cash, stocks, or property" },
  { term: "Blockchain", definition: "A digital ledger that records crypto transactions securely" },
  { term: "Budget", definition: "A plan for how to spend and save your money" },
  { term: "Bull Market", definition: "When stock prices are rising and investors are optimistic" },
  { term: "Bear Market", definition: "When stock prices are falling and investors are pessimistic" },
  { term: "CIBIL Score", definition: "India's credit score (300-900) showing creditworthiness" },
  { term: "Compound Interest", definition: "Interest earned on both principal and accumulated interest" },
  { term: "Credit Limit", definition: "Maximum amount you can borrow on a credit card" },
  { term: "Credit Score", definition: "A number showing how trustworthy you are with borrowed money" },
  { term: "Cryptocurrency", definition: "Digital currency using cryptography for security" },
  { term: "Dividend", definition: "A share of company profits paid to stockholders" },
  { term: "EMI", definition: "Equated Monthly Installment - fixed monthly loan payment" },
  { term: "Equity", definition: "Ownership stake in a company through shares" },
  { term: "FD", definition: "Fixed Deposit - money locked in bank for fixed time with guaranteed returns" },
  { term: "HODL", definition: "Crypto slang for holding investments long-term" },
  { term: "Inflation", definition: "When prices rise and money buys less over time" },
  { term: "Interest", definition: "Cost of borrowing OR reward for saving money" },
  { term: "IPO", definition: "Initial Public Offering - when a company first sells stock publicly" },
  { term: "KYC", definition: "Know Your Customer - identity verification process" },
  { term: "Liability", definition: "Something you owe, like loans or credit card debt" },
  { term: "Mutual Fund", definition: "Money pooled from many people and invested by experts" },
  { term: "Net Worth", definition: "Assets minus liabilities - your total financial value" },
  { term: "Portfolio", definition: "Collection of all your investments" },
  { term: "Premium", definition: "Amount paid for insurance coverage" },
  { term: "Principal", definition: "Original amount of money invested or borrowed" },
  { term: "SIP", definition: "Systematic Investment Plan - investing fixed amount regularly" },
  { term: "UPI", definition: "Unified Payments Interface - instant mobile payment system" }
];

const funFacts = [
  "💡 The first paper money was used in China over 1000 years ago!",
  "💡 Warren Buffett bought his first stock at age 11!",
  "💡 The word 'salary' comes from 'salt' - Roman soldiers were paid in salt!",
  "💡 India has over 300 million UPI users - more than the US population!",
  "💡 Compound interest is called the 'eighth wonder of the world'!",
  "💡 The RBI was established in 1935 and is headquartered in Mumbai!",
  "💡 If you save ₹100/day, you'll have ₹36,500 in a year!",
  "💡 The first ATM was installed in London in 1967!",
  "💡 Bitcoin's creator 'Satoshi Nakamoto' has never been identified!",
  "💡 The NSE is the world's largest derivatives exchange!",
  "💡 90% of millionaires built wealth through real estate!",
  "💡 The average credit card debt in India is over ₹50,000!",
  "💡 Einstein reportedly called compound interest the 8th wonder!",
  "💡 India's first stock exchange (BSE) started in 1875!",
  "💡 PayPal was co-founded by Elon Musk!",
  "💡 Only 3% of Indians invest in the stock market directly!"
];

// ====== BADGES ======
const allBadges = [
  // XP Badges
  { key: "xp50", label: "XP Starter", emoji: "💠", rarity: "bronze", check: () => state.points >= 50 },
  { key: "xp200", label: "XP Master", emoji: "💎", rarity: "silver", check: () => state.points >= 200 },
  { key: "xp500", label: "XP Legend", emoji: "👑", rarity: "gold", check: () => state.points >= 500 },
  { key: "xp1000", label: "XP Champion", emoji: "🌟", rarity: "platinum", check: () => state.points >= 1000 },
  // Quiz Badges
  { key: "quiz3", label: "Quiz Streaker", emoji: "🎯", rarity: "bronze", check: () => state.quizzesCorrect >= 3 },
  { key: "quiz10", label: "Quiz Master", emoji: "🧠", rarity: "silver", check: () => state.quizzesCorrect >= 10 },
  { key: "quiz25", label: "Quiz Wizard", emoji: "🔮", rarity: "gold", check: () => state.quizzesCorrect >= 25 },
  { key: "quiz50", label: "Quiz Legend", emoji: "🎓", rarity: "platinum", check: () => state.quizzesCorrect >= 50 },
  // Wallet Badges
  { key: "wallet1k", label: "Saver 1K", emoji: "💳", rarity: "bronze", check: () => state.wallet >= 1000 },
  { key: "wallet5k", label: "Saver 5K", emoji: "💰", rarity: "silver", check: () => state.wallet >= 5000 },
  { key: "wallet10k", label: "Saver 10K", emoji: "🏦", rarity: "gold", check: () => state.wallet >= 10000 },
  { key: "wallet50k", label: "Money Master", emoji: "💵", rarity: "platinum", check: () => state.wallet >= 50000 },
  // Trading Badges
  { key: "investor", label: "First Trade", emoji: "📈", rarity: "bronze", check: () => state.portfolio.length > 0 },
  { key: "trader10", label: "Pro Trader", emoji: "📊", rarity: "gold", check: () => state.weeklyProgress.trades >= 10 },
  { key: "diversified", label: "Diversified", emoji: "🎲", rarity: "silver", check: () => state.portfolio.length >= 3 },
  { key: "cryptoTrader", label: "Crypto Explorer", emoji: "₿", rarity: "silver", check: () => state.portfolio.some(p => ["BTC", "ETH", "DOGE"].includes(p.id)) },
  { key: "commodities", label: "Commodity King", emoji: "⚡", rarity: "gold", check: () => state.portfolio.some(p => ["GOLD", "SLVR", "OIL"].includes(p.id)) },
  // Streak Badges
  { key: "streak3", label: "3-Day Streak", emoji: "🔥", rarity: "bronze", check: () => state.streak >= 3 },
  { key: "streak7", label: "Week Warrior", emoji: "⚡", rarity: "silver", check: () => state.streak >= 7 },
  { key: "streak14", label: "Fortnight Fighter", emoji: "💪", rarity: "gold", check: () => state.streak >= 14 },
  { key: "streak30", label: "Month Master", emoji: "🏆", rarity: "platinum", check: () => state.streak >= 30 },
  // Activity Badges
  { key: "budgetPro", label: "Budget Pro", emoji: "💼", rarity: "silver", check: () => state.challenges.budgetToday },
  { key: "goalSetter", label: "Goal Setter", emoji: "🎯", rarity: "bronze", check: () => state.goals.length >= 1 },
  { key: "goalCrusher", label: "Goal Crusher", emoji: "🏅", rarity: "gold", check: () => state.goals.filter(g => g.completed).length >= 1 },
  { key: "multiGoal", label: "Multi-Goaler", emoji: "🎖️", rarity: "silver", check: () => state.goals.length >= 3 },
  { key: "expenseTracker", label: "Expense Tracker", emoji: "📝", rarity: "bronze", check: () => (state.expenses || []).length >= 5 },
  { key: "lessonLearner", label: "Lesson Learner", emoji: "📚", rarity: "bronze", check: () => state.lessonsRead >= 3 },
  { key: "scholar", label: "Finance Scholar", emoji: "🎓", rarity: "gold", check: () => state.lessonsRead >= 10 },
  // Special Badges
  { key: "nightOwl", label: "Night Owl", emoji: "🦉", rarity: "silver", check: () => new Date().getHours() >= 22 || new Date().getHours() < 5 },
  { key: "earlyBird", label: "Early Bird", emoji: "🐦", rarity: "silver", check: () => new Date().getHours() >= 5 && new Date().getHours() < 8 }
];

const challengeMeta = {
  quizToday: { label: "Answer 3 quiz questions correctly", reward: 40, icon: "🎯" },
  depositToday: { label: "Deposit into wallet once", reward: 15, icon: "💳" },
  tradeToday: { label: "Complete any buy or sell trade", reward: 25, icon: "📈" },
  mentorToday: { label: "Ask mentor at least one question", reward: 10, icon: "🤖" },
  upiToday: { label: "Simulate one UPI payment", reward: 15, icon: "📱" },
  budgetToday: { label: "Complete a budget challenge", reward: 30, icon: "💰" },
  goalToday: { label: "Add money to a savings goal", reward: 20, icon: "🎯" },
  expenseToday: { label: "Log an expense", reward: 15, icon: "📝" },
  lessonToday: { label: "Read a lesson", reward: 10, icon: "📚" }
};

// ====== HELPERS ======
function showToast(msg) {
  const t = $("toast"); if (!t) return;
  t.textContent = msg; t.style.display = "block";
  setTimeout(() => t.style.display = "none", 2400);
}

function saveState() { localStorage.setItem("finteensGamingState", JSON.stringify(state)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }

function showConfetti() {
  const container = $("confetti"); if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.animationDelay = Math.random() * 0.5 + "s";
    confetti.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
    container.appendChild(confetti);
  }
  setTimeout(() => container.innerHTML = "", 3000);
}

function checkStreakOnLoad() {
  const today = todayStr();
  if (!state.lastLogin) { state.lastLogin = today; state.streak = 1; }
  else if (state.lastLogin !== today) {
    const diff = (new Date(today) - new Date(state.lastLogin)) / (1000 * 60 * 60 * 24);
    state.streak = diff === 1 ? state.streak + 1 : 1;
    state.lastLogin = today;
    Object.keys(state.challenges).forEach(k => state.challenges[k] = false);
    state.weeklyProgress.logins++;
  }
  saveState();
}

function addXP(amount, reason = "") {
  const multipliedAmount = Math.round(amount * (state.xpMultiplier || 1));
  state.points += multipliedAmount;
  state.totalXpEarned = (state.totalXpEarned || 0) + multipliedAmount;
  state.level = 1 + Math.floor(state.points / 100);
  saveState(); updateAllUI();
  if (reason) showToast(`+${multipliedAmount} XP — ${reason}`);
  playSound("coin");
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  setupNav(); setupOnboarding(); setupWallet(); setupUPI();
  setupQuiz(); setupMentor(); setupTrading(); setupChallengesUI();
  setupReset(); setupBudget(); setupGoals(); setupLearn();
  setupLeaderboard(); setupTheme(); setupDailyReward();
  // New feature setups
  setupExpenseTracker(); setupScenarios(); setupAnalytics(); setupNews(); setupSound();
  checkStreakOnLoad(); goToInitialScreen(); updateAllUI();
});

// ====== THEME ======
function applyTheme() {
  document.body.classList.toggle("light-theme", state.theme === "light");
  const btn = $("btnThemeToggle");
  if (btn) btn.textContent = state.theme === "light" ? "☀️" : "🌙";
}

function setupTheme() {
  $("btnThemeToggle")?.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme(); saveState();
  });
}

// ====== DAILY REWARD ======
function setupDailyReward() {
  checkDailyReward();
  $("btnClaimDaily")?.addEventListener("click", claimDailyReward);
}

function checkDailyReward() {
  const banner = $("dailyRewardBanner");
  if (!banner) return;
  const today = todayStr();
  if (state.dailyClaimed !== today) {
    banner.classList.remove("hidden");
    const amount = 10 + (state.streak * 5);
    $("dailyRewardAmount").textContent = amount;
  } else { banner.classList.add("hidden"); }
}

function claimDailyReward() {
  const today = todayStr();
  if (state.dailyClaimed === today) return;
  const amount = 10 + (state.streak * 5);
  state.dailyClaimed = today;
  addXP(amount, "daily login bonus!");
  showConfetti();
  $("dailyRewardBanner")?.classList.add("hidden");
}

// ====== NAV + SCREEN ======
function goToInitialScreen() {
  if (state.name && state.name !== "Guest") {
    $("screen-onboard")?.classList.add("hidden");
    $("screen-main")?.classList.remove("hidden");
  } else {
    $("screen-onboard")?.classList.remove("hidden");
    $("screen-main")?.classList.add("hidden");
  }
}

function setupNav() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll("#panel-container > .card").forEach(p => p.classList.add("hidden"));
      document.getElementById(btn.getAttribute("data-target"))?.classList.remove("hidden");
    });
  });
}

// ====== ONBOARDING ======
function setupOnboarding() {
  $("btnStart")?.addEventListener("click", () => {
    const name = $("inpName").value.trim();
    const ageVal = parseInt($("inpAge").value, 10);
    if (!name) { showToast("Enter a gamer tag to start."); return; }
    if (isNaN(ageVal) || ageVal < 10 || ageVal > 19) { showToast("Age must be between 10–19."); return; }
    state.name = name; state.age = ageVal; state.lastLogin = todayStr(); state.streak = state.streak || 1;
    saveState(); saveToLeaderboard();
    $("screen-onboard").classList.add("hidden"); $("screen-main").classList.remove("hidden");
    updateAllUI(); showToast(`Welcome, ${name}! Adventure unlocked.`);
  });
  $("btnSkipOnboard")?.addEventListener("click", () => {
    state.name = "Guest"; state.age = null; state.lastLogin = todayStr(); state.streak = state.streak || 1;
    saveState(); $("screen-onboard").classList.add("hidden"); $("screen-main").classList.remove("hidden");
    updateAllUI(); showToast("Playing as Guest. You can reset later.");
  });
}

// ====== QUIZ ======
function setupQuiz() {
  if (!$("quizTotal")) return;
  filterQuestions();
  $("quizCategory")?.addEventListener("change", filterQuestions);
  $("quizDifficulty")?.addEventListener("change", filterQuestions);
  $("btnPrevQ")?.addEventListener("click", () => { if (currentQuestionIndex > 0) { currentQuestionIndex--; renderQuizQuestion(); } });
  $("btnNextQ")?.addEventListener("click", () => { if (currentQuestionIndex < filteredQuestions.length - 1) { currentQuestionIndex++; renderQuizQuestion(); } });
  $("btnTimedQuiz")?.addEventListener("click", toggleTimedMode);
}

function filterQuestions() {
  const cat = $("quizCategory")?.value || "all";
  const diff = $("quizDifficulty")?.value || "all";
  filteredQuestions = quizQuestions.filter(q => (cat === "all" || q.category === cat) && (diff === "all" || q.difficulty === diff));
  if (filteredQuestions.length === 0) filteredQuestions = [...quizQuestions];
  currentQuestionIndex = 0; quizScore = calculateQuizScore(); renderQuizQuestion();
}

function calculateQuizScore() {
  return Object.values(state.quizAnswers).filter(v => v === true).length;
}

function renderQuizQuestion() {
  if (filteredQuestions.length === 0) return;
  const q = filteredQuestions[currentQuestionIndex];
  $("quizIndex").textContent = currentQuestionIndex + 1;
  $("quizTotal").textContent = filteredQuestions.length;
  $("quizScore").textContent = quizScore;
  $("quizQuestion").textContent = q.q;
  const catLabel = $("quizCategoryLabel");
  if (catLabel) catLabel.textContent = q.category + " • " + q.difficulty;
  const qIdx = quizQuestions.indexOf(q);
  $("quizNote").textContent = state.quizAnswers[qIdx] === true
    ? "You already got this correct." : "Answer once for XP.";
  const container = $("quizOptions"); container.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => handleQuizAnswer(i, qIdx, q.correct));
    container.appendChild(btn);
  });
}

function handleQuizAnswer(choiceIndex, qIdx, correctIndex) {
  const buttons = $("quizOptions").querySelectorAll("button");
  buttons.forEach((b, i) => {
    b.classList.remove("correct", "wrong");
    if (i === correctIndex) b.classList.add("correct");
    else if (i === choiceIndex && choiceIndex !== correctIndex) b.classList.add("wrong");
  });
  if (choiceIndex === correctIndex) {
    if (state.quizAnswers[qIdx] !== true) {
      state.quizAnswers[qIdx] = true;
      quizScore = calculateQuizScore();
      state.quizzesCorrect = quizScore;
      state.challenges.quizToday = quizScore >= 3;
      state.weeklyProgress.quizzes++;
      addXP(isTimedMode ? 25 : 15, "quiz answer");
    } else { showToast("Already counted XP for this one!"); }
  } else {
    if (state.quizAnswers[qIdx] !== true) state.quizAnswers[qIdx] = false;
    showToast("Not quite. Try again!");
  }
  $("quizScore").textContent = quizScore;
  if (isTimedMode) stopTimer();
}

function toggleTimedMode() {
  isTimedMode = !isTimedMode;
  $("btnTimedQuiz").textContent = isTimedMode ? "🛑 Stop Timer" : "⏱️ Timed Mode";
  $("quizTimer")?.classList.toggle("hidden", !isTimedMode);
  if (isTimedMode) startTimer(); else stopTimer();
}

function startTimer() {
  let seconds = 30;
  $("timerDisplay").textContent = seconds;
  timerInterval = setInterval(() => {
    seconds--;
    $("timerDisplay").textContent = seconds;
    if (seconds <= 0) { stopTimer(); showToast("Time's up!"); }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

// ====== WALLET & UPI ======
function setupWallet() {
  $("btnDeposit")?.addEventListener("click", () => {
    const amt = parseInt($("inpDeposit").value, 10);
    if (isNaN(amt) || amt <= 0) { showToast("Enter a valid deposit amount."); return; }
    state.wallet += amt; state.challenges.depositToday = true;
    addXP(10, "wallet deposit"); $("inpDeposit").value = "";
  });
  $("btnWithdraw")?.addEventListener("click", () => {
    const amt = parseInt($("inpWithdraw").value, 10);
    if (isNaN(amt) || amt <= 0) { showToast("Enter a valid withdraw amount."); return; }
    if (amt > state.wallet) { showToast("You can't withdraw more than wallet balance."); return; }
    state.wallet -= amt; saveState(); updateAllUI(); $("inpWithdraw").value = "";
  });
}

function setupUPI() {
  $("btnUPI")?.addEventListener("click", () => {
    const to = $("upiTo").value.trim() || "Friend";
    const amt = parseInt($("upiAmount").value, 10);
    if (isNaN(amt) || amt <= 0) { showToast("Enter a valid UPI amount."); return; }
    $("upiMsg").textContent = `Demo: UPI payment of ₹${amt} to ${to} simulated. Never share PIN/OTP.`;
    state.challenges.upiToday = true; addXP(10, "UPI safety practice"); $("upiAmount").value = "";
  });
}

// ====== TRADING ======
function setupTrading() {
  const select = $("tradeAsset"); if (!select) return;

  // Initialize market with historical data
  initializeMarketHistory();
  refreshMarketPrices();
  renderMarket();

  // Populate asset selector
  select.innerHTML = "";
  marketAssets.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    const typeIcon = a.type === 'crypto' ? '₿' : a.type === 'commodity' ? '🏭' : '📊';
    opt.textContent = `${typeIcon} ${a.id} - ${a.name}`;
    select.appendChild(opt);
  });

  if (select.value) updateMarketChart(select.value);

  // Event listeners
  $("btnRefreshMarket")?.addEventListener("click", () => {
    refreshMarketPrices();
    renderMarket();
    renderPortfolio();
    if (select.value) updateMarketChart(select.value);
    playSound('coin');
    showToast("Market prices updated! 📊");
  });

  $("btnBuy")?.addEventListener("click", () => handleTrade("buy"));
  $("btnSell")?.addEventListener("click", () => handleTrade("sell"));
  select.addEventListener("change", () => { if (select.value) updateMarketChart(select.value); });

  // Time range buttons
  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chartRange = parseInt(btn.dataset.range);
      if (select.value) updateMarketChart(select.value);
    });
  });

  // Update wallet display in trading panel
  updateTradingWallet();
}

function updateTradingWallet() {
  const walletEl = $("walletBalance2");
  if (walletEl) walletEl.textContent = `₹${state.wallet.toLocaleString()}`;
}

function initializeMarketHistory() {
  // Generate initial price history for each asset
  marketAssets.forEach(asset => {
    const history = priceHistory[asset.id];
    if (history.prices.length === 0) {
      let price = asset.base;
      const volatility = asset.volatility || 0.15;

      // Generate 40 historical data points
      for (let i = 0; i < 40; i++) {
        // Realistic price movement with trends
        const trend = Math.sin(i / 8) * 0.03; // subtle trends
        const noise = (Math.random() - 0.5) * volatility;
        price = Math.max(asset.base * 0.5, Math.round(price * (1 + trend + noise)));

        // Generate OHLC data
        const open = price;
        const close = Math.max(10, Math.round(price * (1 + (Math.random() - 0.5) * volatility * 0.5)));
        const high = Math.max(open, close) + Math.round(Math.random() * price * 0.03);
        const low = Math.min(open, close) - Math.round(Math.random() * price * 0.03);
        const volume = Math.round(100 + Math.random() * 900);

        history.prices.push(close);
        history.volumes.push(volume);
        history.ohlc.push({ open, high, low, close });

        price = close;
      }
      marketPrices[asset.id] = price;
    }
  });
}

function refreshMarketPrices() {
  marketAssets.forEach(asset => {
    const history = priceHistory[asset.id];
    const volatility = asset.volatility || 0.15;
    const lastPrice = history.prices[history.prices.length - 1] || asset.base;

    // More realistic price movement
    const momentum = history.prices.length > 1
      ? (history.prices[history.prices.length - 1] - history.prices[history.prices.length - 2]) / history.prices[history.prices.length - 2]
      : 0;

    const trend = momentum * 0.3; // momentum effect
    const noise = (Math.random() - 0.5) * volatility;
    const meanReversion = (asset.base - lastPrice) / asset.base * 0.05; // pull toward base price

    const newPrice = Math.max(Math.round(asset.base * 0.3),
      Math.round(lastPrice * (1 + trend + noise + meanReversion)));

    // Generate OHLC for new candle
    const open = lastPrice;
    const close = newPrice;
    const high = Math.max(open, close) + Math.round(Math.random() * newPrice * 0.02);
    const low = Math.min(open, close) - Math.round(Math.random() * newPrice * 0.02);
    const volume = Math.round(200 + Math.random() * 1500);

    // Add to history
    history.prices.push(newPrice);
    history.volumes.push(volume);
    history.ohlc.push({ open, high, low, close });

    // Keep history limited
    if (history.prices.length > 100) {
      history.prices.shift();
      history.volumes.shift();
      history.ohlc.shift();
    }

    marketPrices[asset.id] = newPrice;
  });
}

function renderMarket() {
  const container = $("marketList"); if (!container) return;
  container.innerHTML = "";

  marketAssets.forEach(asset => {
    const history = priceHistory[asset.id];
    const currentPrice = marketPrices[asset.id] || asset.base;
    const prevPrice = history.prices.length > 1 ? history.prices[history.prices.length - 2] : asset.base;
    const change = ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2);
    const isUp = currentPrice >= prevPrice;

    const row = document.createElement("div");
    row.className = "stock-row-enhanced";

    const typeIcon = asset.type === 'crypto' ? '₿' : asset.type === 'commodity' ? '🏭' : '📊';
    const typeBadge = asset.type === 'crypto' ? 'crypto' : asset.type === 'commodity' ? 'commodity' : 'stock';

    row.innerHTML = `
      <div class="stock-info">
        <span class="stock-icon">${typeIcon}</span>
        <div class="stock-details">
          <strong class="stock-symbol">${asset.id}</strong>
          <span class="stock-name">${asset.name}</span>
        </div>
        <span class="asset-type-badge ${typeBadge}">${asset.type}</span>
      </div>
      <div class="stock-price-info">
        <span class="stock-price">₹${currentPrice.toLocaleString()}</span>
        <span class="stock-change ${isUp ? 'up' : 'down'}">
          ${isUp ? '▲' : '▼'} ${isUp ? '+' : ''}${change}%
        </span>
      </div>
    `;

    row.addEventListener('click', () => {
      $("tradeAsset").value = asset.id;
      updateMarketChart(asset.id);
    });

    container.appendChild(row);
  });
}

function handleTrade(type) {
  const assetId = $("tradeAsset").value;
  const qty = parseInt($("tradeQty").value, 10);
  if (isNaN(qty) || qty <= 0) { showToast("Enter quantity to trade."); return; }
  const price = marketPrices[assetId] || 0; if (!price) return;

  if (type === "buy") {
    const cost = price * qty;
    if (cost > state.wallet) {
      playSound('error');
      showToast("Not enough wallet balance.");
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
    state.weeklyProgress.trades++;
    playSound('success');
    addXP(12, "executing a buy trade");
    showToast(`📈 Bought ${qty} ${assetId} @ ₹${price.toLocaleString()}`);
  } else {
    const holding = state.portfolio.find(p => p.id === assetId);
    if (!holding || holding.qty < qty) {
      playSound('error');
      showToast("Not enough quantity to sell.");
      return;
    }
    holding.qty -= qty;
    state.wallet += price * qty;
    if (holding.qty === 0) state.portfolio = state.portfolio.filter(p => p.id !== assetId);
    state.challenges.tradeToday = true;
    state.weeklyProgress.trades++;
    playSound('coin');
    addXP(12, "executing a sell trade");
    showToast(`📉 Sold ${qty} ${assetId} @ ₹${price.toLocaleString()}`);
  }

  saveState();
  updateAllUI();
  updateTradingWallet();
  $("tradeQty").value = "";
  if (assetId) updateMarketChart(assetId);
}

function renderPortfolio() {
  const list = $("portfolioList"); if (!list) return;
  list.innerHTML = "";

  if (!state.portfolio.length) {
    list.innerHTML = `<div class="empty-portfolio">No holdings yet. Start trading! 📈</div>`;
    $("portfolioChip").textContent = "₹0";
    $("portfolioValue").textContent = "₹0";
    $("walletLocked").textContent = "₹0";
    return;
  }

  let total = 0;
  state.portfolio.forEach(p => {
    const currentPrice = marketPrices[p.id] || p.avgPrice;
    const val = currentPrice * p.qty;
    total += val;
    const pnl = (currentPrice - p.avgPrice) * p.qty;
    const pnlPercent = ((currentPrice - p.avgPrice) / p.avgPrice * 100).toFixed(1);
    const isProfit = pnl >= 0;

    const row = document.createElement("div");
    row.className = "portfolio-item-enhanced";
    row.innerHTML = `
      <div class="holding-info">
        <strong>${p.id}</strong>
        <span class="holding-qty">${p.qty} units @ ₹${p.avgPrice}</span>
      </div>
      <div class="holding-value">
        <span class="current-value">₹${val.toLocaleString()}</span>
        <span class="pnl ${isProfit ? 'profit' : 'loss'}">
          ${isProfit ? '+' : ''}₹${pnl.toLocaleString()} (${isProfit ? '+' : ''}${pnlPercent}%)
        </span>
      </div>
    `;
    list.appendChild(row);
  });

  $("portfolioChip").textContent = `₹${total.toLocaleString()}`;
  $("portfolioValue").textContent = `₹${total.toLocaleString()}`;
  $("walletLocked").textContent = `₹${total.toLocaleString()}`;
}

function updateMarketChart(assetId) {
  const canvasEl = $("marketChart");
  if (!canvasEl || !assetId) return;

  const ctx = canvasEl.getContext("2d");
  const asset = marketAssets.find(a => a.id === assetId);
  const history = priceHistory[assetId];

  if (!history || !history.prices.length) return;

  // Get data for selected range
  const prices = history.prices.slice(-chartRange);
  const volumes = history.volumes.slice(-chartRange);
  const ohlc = history.ohlc.slice(-chartRange);

  if (prices.length === 0) return;

  // Update chart info panel
  const currentPrice = prices[prices.length - 1];
  const openPrice = prices[0];
  const priceChange = ((currentPrice - openPrice) / openPrice * 100).toFixed(2);
  const isUp = currentPrice >= openPrice;
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const totalVolume = volumes.reduce((a, b) => a + b, 0);

  // Update UI elements
  $("chartAssetName").textContent = `${asset.id} - ${asset.name}`;
  $("chartAssetPrice").textContent = `₹${currentPrice.toLocaleString()}`;

  const changeEl = $("chartPriceChange");
  changeEl.textContent = `${isUp ? '▲' : '▼'} ${isUp ? '+' : ''}${priceChange}%`;
  changeEl.className = `chart-price-change ${isUp ? 'up' : 'down'}`;

  $("chartOpen").textContent = `₹${openPrice.toLocaleString()}`;
  $("chartHigh").textContent = `₹${high.toLocaleString()}`;
  $("chartLow").textContent = `₹${low.toLocaleString()}`;
  $("chartVolume").textContent = totalVolume.toLocaleString();

  // Destroy existing chart
  if (marketChart) marketChart.destroy();

  // Create gradients
  const priceGradient = ctx.createLinearGradient(0, 0, 0, canvasEl.height);
  if (isUp) {
    priceGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    priceGradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
  } else {
    priceGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
    priceGradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
  }

  const lineColor = isUp ? '#10b981' : '#ef4444';

  // Create chart with multiple datasets
  marketChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: prices.map((_, i) => `T${i + 1}`),
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: lineColor,
          borderWidth: 2.5,
          fill: true,
          backgroundColor: priceGradient,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Volume',
          data: volumes,
          type: 'bar',
          backgroundColor: 'rgba(99, 102, 241, 0.3)',
          borderColor: 'rgba(99, 102, 241, 0.6)',
          borderWidth: 1,
          yAxisID: 'y1',
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(99, 102, 241, 0.5)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function (context) {
              if (context.datasetIndex === 0) {
                return `Price: ₹${context.raw.toLocaleString()}`;
              } else {
                return `Volume: ${context.raw.toLocaleString()}`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#64748b',
            font: { size: 10 },
            maxRotation: 0
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
            callback: (val) => '₹' + val.toLocaleString()
          }
        },
        y1: {
          type: 'linear',
          display: false,
          position: 'right',
          max: Math.max(...volumes) * 4, // Scale volume to take 25% of chart height
          grid: { display: false }
        }
      }
    }
  });
}

// ====== BUDGET BUILDER ======
function setupBudget() {
  generateBudgetScenario();
  $("btnSubmitBudget")?.addEventListener("click", submitBudget);
  $("btnResetBudget")?.addEventListener("click", resetBudget);
  $("btnNewScenario")?.addEventListener("click", generateBudgetScenario);
}

function generateBudgetScenario() {
  const incomes = [3000, 5000, 7500, 10000];
  budgetIncome = incomes[Math.floor(Math.random() * incomes.length)];
  budgetAllocations = {};
  budgetCategories.forEach(c => budgetAllocations[c.id] = 0);
  renderBudgetUI();
  $("budgetFeedback")?.classList.add("hidden");
}

function renderBudgetUI() {
  $("budgetIncome").textContent = `₹${budgetIncome}`;
  updateBudgetRemaining();
  const container = $("budgetCategories"); if (!container) return;
  container.innerHTML = "";
  budgetCategories.forEach(cat => {
    const div = document.createElement("div"); div.className = "budget-category";
    div.innerHTML = `
      <div class="budget-cat-header"><span>${cat.icon} ${cat.name}</span><span class="budget-cat-value">₹<span id="val-${cat.id}">0</span></span></div>
      <input type="range" min="0" max="${budgetIncome}" value="0" id="slider-${cat.id}" class="budget-slider" />
      <div class="budget-cat-hint">Recommended: ${cat.recommended}%</div>`;
    container.appendChild(div);
    document.getElementById(`slider-${cat.id}`)?.addEventListener("input", (e) => {
      budgetAllocations[cat.id] = parseInt(e.target.value, 10);
      document.getElementById(`val-${cat.id}`).textContent = budgetAllocations[cat.id];
      updateBudgetRemaining();
    });
  });
  renderBudgetChart();
}

function updateBudgetRemaining() {
  const total = Object.values(budgetAllocations).reduce((a, b) => a + b, 0);
  const remaining = budgetIncome - total;
  const el = $("budgetRemaining");
  if (el) { el.textContent = `₹${remaining}`; el.style.color = remaining < 0 ? "var(--danger)" : "var(--success)"; }
}

function renderBudgetChart() {
  const canvasEl = $("budgetChart"); if (!canvasEl) return;
  if (budgetChart) budgetChart.destroy();
  budgetChart = new Chart(canvasEl.getContext("2d"), {
    type: "doughnut",
    data: { labels: budgetCategories.map(c => c.name), datasets: [{ data: budgetCategories.map(c => budgetAllocations[c.id] || 0), backgroundColor: ["#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899"] }] },
    options: { plugins: { legend: { display: true, position: "bottom", labels: { color: "#e5e7eb", font: { size: 10 } } } } }
  });
}

function submitBudget() {
  const total = Object.values(budgetAllocations).reduce((a, b) => a + b, 0);
  const feedback = $("budgetFeedback"); if (!feedback) return;
  feedback.classList.remove("hidden");
  if (total > budgetIncome) {
    feedback.innerHTML = `<div class="feedback-bad">❌ Overspent by ₹${total - budgetIncome}! Try again.</div>`;
    return;
  }
  const savingsPercent = (budgetAllocations.savings / budgetIncome) * 100;
  let score = 0, messages = [];
  if (savingsPercent >= 20) { score += 40; messages.push("✅ Great savings rate!"); }
  else if (savingsPercent >= 10) { score += 20; messages.push("⚠️ Savings could be higher."); }
  else { messages.push("❌ Try to save at least 20%."); }
  if (budgetAllocations.needs <= budgetIncome * 0.5) { score += 30; messages.push("✅ Needs under control!"); }
  if (budgetAllocations.wants <= budgetIncome * 0.3) { score += 30; messages.push("✅ Wants balanced!"); }
  feedback.innerHTML = `<div class="feedback-${score >= 70 ? 'good' : 'ok'}"><strong>Score: ${score}/100</strong><br>${messages.join("<br>")}</div>`;
  if (score >= 70) { state.challenges.budgetToday = true; addXP(30, "budget challenge"); showConfetti(); }
  renderBudgetChart();
}

function resetBudget() { budgetCategories.forEach(c => budgetAllocations[c.id] = 0); renderBudgetUI(); $("budgetFeedback")?.classList.add("hidden"); }

// ====== SAVINGS GOALS ======
function setupGoals() {
  $("btnAddGoal")?.addEventListener("click", addGoal);
  renderGoals();
}

function addGoal() {
  const name = $("goalName")?.value.trim();
  const target = parseInt($("goalTarget")?.value, 10);
  if (!name || isNaN(target) || target < 100) { showToast("Enter goal name and target (min ₹100)."); return; }
  state.goals.push({ id: Date.now(), name, target, saved: 0, completed: false, createdAt: todayStr() });
  saveState(); renderGoals(); $("goalName").value = ""; $("goalTarget").value = "";
  showToast("Goal created!"); addXP(10, "creating a savings goal");
}

function renderGoals() {
  const list = $("goalsList"); const empty = $("goalsEmpty");
  if (!list) return;
  list.innerHTML = "";
  if (state.goals.length === 0) { empty?.classList.remove("hidden"); return; }
  empty?.classList.add("hidden");
  state.goals.forEach(goal => {
    const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
    const div = document.createElement("div"); div.className = "goal-item" + (goal.completed ? " completed" : "");
    div.innerHTML = `
      <div class="goal-header"><strong>${goal.name}</strong><span>₹${goal.saved} / ₹${goal.target}</span></div>
      <div class="xp-bar"><div class="xp-fill" style="width:${progress}%"></div></div>
      <div class="goal-actions">
        ${goal.completed ? '<span class="chip good">Completed! 🎉</span>' : `<input type="number" min="1" placeholder="Add ₹" id="add-${goal.id}" style="width:80px;"/><button class="btn btn-sm" onclick="addToGoal(${goal.id})">Add</button>`}
        <button class="btn btn-sm btn-ghost" onclick="deleteGoal(${goal.id})">Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

window.addToGoal = function (id) {
  const goal = state.goals.find(g => g.id === id); if (!goal || goal.completed) return;
  const input = document.getElementById(`add-${id}`);
  const amt = parseInt(input?.value, 10);
  if (isNaN(amt) || amt <= 0) { showToast("Enter amount to add."); return; }
  if (amt > state.wallet) { showToast("Not enough in wallet."); return; }
  state.wallet -= amt; goal.saved += amt;
  if (goal.saved >= goal.target) { goal.completed = true; goal.saved = goal.target; showConfetti(); addXP(50, "completing a savings goal!"); showToast("🎉 Goal completed!"); }
  else { state.challenges.goalToday = true; addXP(5, "saving towards goal"); }
  saveState(); updateAllUI(); renderGoals();
};

window.deleteGoal = function (id) {
  if (!confirm("Delete this goal?")) return;
  state.goals = state.goals.filter(g => g.id !== id);
  saveState(); renderGoals();
};

// ====== LEARNING HUB ======
function setupLearn() {
  document.querySelectorAll(".learn-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".learn-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderLearnContent(tab.getAttribute("data-tab"));
    });
  });
  renderLearnContent("lessons");
}

function renderLearnContent(tab) {
  const container = $("learnContent"); if (!container) return;
  if (tab === "lessons") {
    container.innerHTML = lessons.map(l => `
      <div class="lesson-card ${l.read ? 'read' : ''}" onclick="readLesson(${l.id})">
        <div class="lesson-title">${l.title}</div>
        <div class="lesson-cat chip">${l.category}</div>
        ${l.read ? '<span class="chip good">Read ✓</span>' : ''}
      </div>`).join("");
  } else if (tab === "glossary") {
    container.innerHTML = `<div class="glossary-list">${glossary.map(g => `<div class="glossary-item"><strong>${g.term}</strong><p>${g.definition}</p></div>`).join("")}</div>`;
  } else {
    container.innerHTML = `<div class="facts-list">${funFacts.map(f => `<div class="fact-item">${f}</div>`).join("")}</div>`;
  }
}

window.readLesson = function (id) {
  const lesson = lessons.find(l => l.id === id); if (!lesson) return;
  lesson.read = true;
  const container = $("learnContent");
  container.innerHTML = `<div class="lesson-view"><h3>${lesson.title}</h3><p>${lesson.content}</p><button class="btn btn-sm" onclick="renderLearnContent('lessons')">← Back to Lessons</button></div>`;
  addXP(5, "reading a lesson");
};

// ====== MENTOR ======
function setupMentor() {
  $("btnAskMentor")?.addEventListener("click", sendMentorQuestion);
  $("mentorInput")?.addEventListener("keydown", e => { if (e.key === "Enter") sendMentorQuestion(); });
  $("btnClearMentor")?.addEventListener("click", () => { $("mentorLog").innerHTML = ""; });
  document.querySelectorAll(".suggestion-chip").forEach(chip => {
    chip.addEventListener("click", () => { $("mentorInput").value = chip.getAttribute("data-q"); sendMentorQuestion(); });
  });
}

function sendMentorQuestion() {
  const input = $("mentorInput"); const text = input.value.trim(); if (!text) return;
  addMentorMessage(text, "user"); input.value = "";
  setTimeout(() => addMentorMessage(generateMentorReply(text), "bot"), 300);
  state.challenges.mentorToday = true; addXP(5, "asking mentor");
}

function addMentorMessage(text, type) {
  const log = $("mentorLog"); const div = document.createElement("div");
  div.className = "msg " + type; div.textContent = text;
  log.appendChild(div); log.scrollTop = log.scrollHeight;
}

function generateMentorReply(q) {
  const lower = q.toLowerCase();
  if (lower.includes("upi")) return "UPI tip: never share PIN/OTP, never approve requests you didn't start, always verify receiver name. Use only trusted apps!";
  if (lower.includes("save") || lower.includes("saving")) return "50-30-20 rule: 50% needs, 30% wants, 20% savings. Automate saving first, then spend what's left!";
  if (lower.includes("invest") || lower.includes("stock") || lower.includes("mutual")) return "Start with understanding risk. Diversified mutual funds are lower risk than random stocks. Never invest money you need soon!";
  if (lower.includes("emergency")) return "Emergency fund = 3–6 months of expenses. For teens, keep a few months of spending in safe savings.";
  if (lower.includes("compound")) return "Compound interest = interest on interest! ₹1000 at 10% becomes ₹1100 year 1, ₹1210 year 2, and keeps growing!";
  if (lower.includes("budget")) return "Track every rupee! List income, then allocate to needs (50%), wants (30%), savings (20%). Review weekly!";
  if (lower.includes("credit")) return "Credit cards let you borrow money. Pay full bill monthly to avoid 36%+ interest. Build credit score carefully!";
  if (lower.includes("tax")) return "Tax is money paid to government for public services. In India, income tax starts when you earn over ₹2.5 lakh/year.";
  if (lower.includes("loan")) return "Avoid high-interest debt! Compare rates, read terms, never borrow more than you can repay comfortably.";
  if (lower.includes("safe")) return "For safety: never share OTP/PIN, use strong passwords, enable 2FA, verify before clicking links!";
  return "Great question! For money decisions, think: 1) Is it safe? 2) Is it necessary? 3) What's the long-term impact? Ask about UPI, saving, investing, or budgeting for specific tips!";
}

// ====== CHALLENGES & BADGES ======
function setupChallengesUI() {
  renderChallenges(); renderBadges(); renderWeeklyChallenge();
  $("badgeFilter")?.addEventListener("change", renderBadges);
}

function renderChallenges() {
  const list = $("challengeList"); if (!list) return;
  list.innerHTML = "";
  Object.keys(challengeMeta).forEach(key => {
    const meta = challengeMeta[key]; const completed = !!state.challenges[key];
    const div = document.createElement("div"); div.className = "challenge" + (completed ? " completed" : "");
    div.innerHTML = `<div>${meta.label}<br><small>${completed ? "Done!" : `Reward: +${meta.reward} XP`}</small></div><div class="tag-mini">${completed ? "✔" : "…"}</div>`;
    list.appendChild(div);
  });
}

function renderWeeklyChallenge() {
  const container = $("weeklyChallenge"); if (!container) return;
  const weeklyGoal = 20;
  const progress = Math.min(weeklyGoal, state.weeklyProgress.trades + state.weeklyProgress.quizzes);
  container.innerHTML = `
    <div class="challenge"><div>Complete 20 activities this week<br><small>Progress: ${progress}/${weeklyGoal}</small></div><div class="tag-mini">${progress >= weeklyGoal ? "✔" : `${Math.round(progress / weeklyGoal * 100)}%`}</div></div>
    <div class="xp-bar" style="margin-top:6px;"><div class="xp-fill" style="width:${Math.min(100, progress / weeklyGoal * 100)}%"></div></div>`;
}

function renderBadges() {
  const filter = $("badgeFilter")?.value || "all";
  const list = $("badgeList"); if (!list) return;
  list.innerHTML = "";
  allBadges.forEach(b => {
    const unlocked = b.check();
    if (filter === "unlocked" && !unlocked) return;
    if (filter === "locked" && unlocked) return;
    const el = document.createElement("div");
    el.className = `badge ${b.rarity} ${unlocked ? "" : "locked"}`;
    el.innerHTML = `<span>${b.emoji}</span>${b.label}`;
    list.appendChild(el);
  });
}

// ====== LEADERBOARD ======
function setupLeaderboard() { renderLeaderboard(); }

function saveToLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("finteensLeaderboard") || "[]");
  const existing = leaderboard.findIndex(p => p.name === state.name);
  const entry = { name: state.name, points: state.points, level: state.level, streak: state.streak };
  if (existing >= 0) leaderboard[existing] = entry; else leaderboard.push(entry);
  leaderboard.sort((a, b) => b.points - a.points);
  localStorage.setItem("finteensLeaderboard", JSON.stringify(leaderboard));
}

function renderLeaderboard() {
  const list = $("leaderboardList"); if (!list) return;
  let leaderboard = JSON.parse(localStorage.getItem("finteensLeaderboard") || "[]");
  if (leaderboard.length === 0) { list.innerHTML = '<div class="tag-mini">No players yet. Complete the onboarding to join!</div>'; return; }
  list.innerHTML = leaderboard.slice(0, 10).map((p, i) => `
    <div class="leaderboard-item ${p.name === state.name ? 'you' : ''}">
      <span class="rank">#${i + 1}</span>
      <span class="name">${p.name}</span>
      <span class="points">${p.points} XP</span>
      <span class="level">Lv ${p.level}</span>
    </div>`).join("");
  const yourRank = leaderboard.findIndex(p => p.name === state.name) + 1;
  $("yourRank").textContent = yourRank > 0 ? `#${yourRank}` : "-";
  $("totalPlayers").textContent = leaderboard.length;
}

// ====== RESET ======
function setupReset() {
  $("btnReset")?.addEventListener("click", () => {
    if (!confirm("Reset all progress on this device?")) return;
    state = { ...defaultState }; saveState(); location.reload();
  });
}

// ====== EXPENSE TRACKER ======
const expenseCategories = [
  { id: "food", name: "Food & Drinks", icon: "🍔", color: "#f97316" },
  { id: "transport", name: "Transport", icon: "🚌", color: "#06b6d4" },
  { id: "entertainment", name: "Entertainment", icon: "🎮", color: "#8b5cf6" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#ec4899" },
  { id: "education", name: "Education", icon: "📚", color: "#22c55e" },
  { id: "other", name: "Other", icon: "📦", color: "#6b7280" }
];

function setupExpenseTracker() {
  $("btnAddExpense")?.addEventListener("click", addExpense);
  $("expenseCatFilter")?.addEventListener("change", renderExpenses);
  renderExpenses();
  renderExpenseChart();
}

function addExpense() {
  const amount = parseInt($("expenseAmount")?.value, 10);
  const category = $("expenseCategory")?.value || "other";
  const note = $("expenseNote")?.value.trim() || "";

  if (isNaN(amount) || amount <= 0) { showToast("Enter a valid amount!"); return; }

  const expense = {
    id: Date.now(),
    amount,
    category,
    note,
    date: todayStr(),
    timestamp: Date.now()
  };

  if (!state.expenses) state.expenses = [];
  state.expenses.push(expense);
  state.challenges.expenseToday = true;
  addXP(5, "logging expense");

  $("expenseAmount").value = "";
  $("expenseNote").value = "";

  renderExpenses();
  renderExpenseChart();
  playSound("coin");
}

function renderExpenses() {
  const list = $("expenseList");
  const empty = $("expenseEmpty");
  if (!list) return;

  const filter = $("expenseCatFilter")?.value || "all";
  let expenses = state.expenses || [];
  if (filter !== "all") expenses = expenses.filter(e => e.category === filter);

  // Sort by date descending
  expenses = [...expenses].sort((a, b) => b.timestamp - a.timestamp);

  if (expenses.length === 0) {
    list.innerHTML = "";
    empty?.classList.remove("hidden");
    return;
  }

  empty?.classList.add("hidden");
  list.innerHTML = expenses.slice(0, 20).map(e => {
    const cat = expenseCategories.find(c => c.id === e.category) || expenseCategories[5];
    return `
      <div class="expense-item">
        <div class="expense-icon" style="background:${cat.color}">${cat.icon}</div>
        <div class="expense-details">
          <div class="expense-cat">${cat.name}</div>
          <div class="expense-note">${e.note || "No note"}</div>
          <div class="expense-date">${e.date}</div>
        </div>
        <div class="expense-amount">-₹${e.amount}</div>
      </div>`;
  }).join("");

  // Update total
  const total = (state.expenses || []).reduce((sum, e) => sum + e.amount, 0);
  $("expenseTotal") && ($("expenseTotal").textContent = `₹${total}`);
}

let expenseChart = null;
function renderExpenseChart() {
  const canvas = $("expenseChart");
  if (!canvas) return;

  const categoryTotals = {};
  expenseCategories.forEach(c => categoryTotals[c.id] = 0);
  (state.expenses || []).forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  if (expenseChart) expenseChart.destroy();
  expenseChart = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: expenseCategories.map(c => c.name),
      datasets: [{
        data: expenseCategories.map(c => categoryTotals[c.id]),
        backgroundColor: expenseCategories.map(c => c.color)
      }]
    },
    options: { plugins: { legend: { display: true, position: "bottom", labels: { color: "#e5e7eb", font: { size: 10 } } } } }
  });
}

window.deleteExpense = function (id) {
  state.expenses = (state.expenses || []).filter(e => e.id !== id);
  saveState();
  renderExpenses();
  renderExpenseChart();
};

// ====== INVESTMENT SCENARIOS ======
const investmentScenarios = [
  {
    id: 1,
    title: "Market Crash!",
    description: "The stock market has dropped 30% overnight. Your portfolio is losing value fast. What do you do?",
    options: [
      { text: "Panic sell everything immediately", impact: { wallet: 0.5, xp: -20 }, feedback: "❌ Panic selling locks in losses. Markets usually recover!" },
      { text: "Hold and wait for recovery", impact: { wallet: 1, xp: 30 }, feedback: "✅ Smart! Historical data shows markets recover over time." },
      { text: "Buy more at discounted prices", impact: { wallet: 1, xp: 50 }, feedback: "🌟 Excellent! 'Buy low' is a key investing principle." }
    ]
  },
  {
    id: 2,
    title: "Get Rich Quick Scheme",
    description: "A friend tells you about a 'guaranteed' investment that doubles money in 30 days. They need ₹10,000 now.",
    options: [
      { text: "Invest all your savings", impact: { wallet: 0, xp: -50 }, feedback: "❌ This was a scam! Never trust 'guaranteed' high returns." },
      { text: "Invest a small amount to test", impact: { wallet: 0.9, xp: 10 }, feedback: "⚠️ Even small amounts to scams add up. Research first!" },
      { text: "Decline and report as suspicious", impact: { wallet: 1, xp: 40 }, feedback: "✅ Great judgment! If it sounds too good to be true, it is." }
    ]
  },
  {
    id: 3,
    title: "Unexpected Expense",
    description: "Your phone broke and you need ₹15,000 for a new one. You don't have an emergency fund.",
    options: [
      { text: "Use a credit card and pay minimum", impact: { wallet: 0.8, xp: -10 }, feedback: "⚠️ Credit card interest is very high (36%+). Avoid!" },
      { text: "Take a personal loan", impact: { wallet: 0.9, xp: 5 }, feedback: "⚠️ Loans have interest. Consider cheaper phones first." },
      { text: "Buy a cheaper phone, start emergency fund", impact: { wallet: 0.95, xp: 40 }, feedback: "✅ Smart! Living within means and saving is key." }
    ]
  },
  {
    id: 4,
    title: "First Salary Decision",
    description: "You just got your first salary of ₹30,000! How do you allocate it?",
    options: [
      { text: "Spend it all celebrating!", impact: { wallet: 0.7, xp: -20 }, feedback: "❌ Living paycheck to paycheck is risky. Save first!" },
      { text: "Save 50%, spend 50%", impact: { wallet: 1, xp: 30 }, feedback: "✅ Good balance! Building savings while enjoying life." },
      { text: "50-30-20: Needs, Wants, Savings", impact: { wallet: 1, xp: 50 }, feedback: "🌟 Perfect! The classic budgeting rule works great." }
    ]
  },
  {
    id: 5,
    title: "Crypto Hype",
    description: "Everyone is talking about a new cryptocurrency that went up 1000% last month. Should you invest?",
    options: [
      { text: "All in! FOMO is real!", impact: { wallet: 0.3, xp: -30 }, feedback: "❌ The coin crashed 80% next week. Never chase hype!" },
      { text: "Invest 5% of portfolio", impact: { wallet: 0.95, xp: 20 }, feedback: "⚠️ Small positions limit risk. Smart approach." },
      { text: "Research first, maybe wait", impact: { wallet: 1, xp: 40 }, feedback: "✅ Patience and research beat FOMO every time!" }
    ]
  }
];

let currentScenario = null;

function setupScenarios() {
  $("btnNewScenarioGame")?.addEventListener("click", startNewScenario);
  renderScenarioStats();
}

function startNewScenario() {
  const unplayed = investmentScenarios.filter(s => !state.scenariosPlayed?.includes(s.id));
  const pool = unplayed.length > 0 ? unplayed : investmentScenarios;
  currentScenario = pool[Math.floor(Math.random() * pool.length)];
  renderScenario();
}

function renderScenario() {
  const container = $("scenarioContent");
  if (!container || !currentScenario) return;

  container.innerHTML = `
    <div class="scenario-card">
      <div class="scenario-title">📊 ${currentScenario.title}</div>
      <p class="scenario-desc">${currentScenario.description}</p>
      <div class="scenario-options">
        ${currentScenario.options.map((opt, i) => `
          <button class="scenario-option" onclick="chooseScenarioOption(${i})">${opt.text}</button>
        `).join("")}
      </div>
    </div>`;
  $("scenarioFeedback")?.classList.add("hidden");
}

window.chooseScenarioOption = function (optionIndex) {
  if (!currentScenario) return;
  const option = currentScenario.options[optionIndex];

  // Apply impact
  const portfolioValue = state.portfolio.reduce((sum, p) => sum + (marketPrices[p.id] || p.avgPrice) * p.qty, 0);
  const totalValue = state.wallet + portfolioValue;

  // Mark scenario as played
  if (!state.scenariosPlayed) state.scenariosPlayed = [];
  if (!state.scenariosPlayed.includes(currentScenario.id)) {
    state.scenariosPlayed.push(currentScenario.id);
    state.scenariosCompleted = (state.scenariosCompleted || 0) + 1;
  }

  // Apply XP impact
  if (option.impact.xp > 0) {
    addXP(option.impact.xp, "scenario decision");
    showConfetti();
  } else if (option.impact.xp < 0) {
    showToast(`${option.impact.xp} XP - Learn from this!`);
  }

  // Show feedback
  const feedback = $("scenarioFeedback");
  if (feedback) {
    feedback.classList.remove("hidden");
    feedback.innerHTML = `<div class="scenario-result">${option.feedback}</div>`;
  }

  // Disable options
  document.querySelectorAll(".scenario-option").forEach((btn, i) => {
    btn.disabled = true;
    if (i === optionIndex) btn.classList.add("selected");
  });

  saveState();
  renderScenarioStats();
  playSound(option.impact.xp > 0 ? "success" : "error");
};

function renderScenarioStats() {
  const el = $("scenarioStats");
  if (el) {
    el.innerHTML = `Scenarios completed: <strong>${state.scenariosCompleted || 0}</strong> / ${investmentScenarios.length}`;
  }
}

// ====== ANALYTICS DASHBOARD ======
let analyticsChart = null;

function setupAnalytics() {
  $("analyticsTimeRange")?.addEventListener("change", renderAnalytics);
  renderAnalytics();
}

function renderAnalytics() {
  const canvas = $("analyticsChart");
  if (!canvas) return;

  // Record today's data if not already
  recordDailyAnalytics();

  const history = state.analyticsHistory || [];
  const range = $("analyticsTimeRange")?.value || "7";
  const days = parseInt(range, 10);
  const recentData = history.slice(-days);

  if (analyticsChart) analyticsChart.destroy();

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, "rgba(99, 102, 241, 0.5)");
  gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

  analyticsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: recentData.map(d => d.date.slice(5)),
      datasets: [
        {
          label: "XP",
          data: recentData.map(d => d.totalXp),
          borderColor: "#6366f1",
          backgroundColor: gradient,
          fill: true,
          tension: 0.4
        },
        {
          label: "Net Worth",
          data: recentData.map(d => d.netWorth),
          borderColor: "#22c55e",
          backgroundColor: "transparent",
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true, position: "top", labels: { color: "#e5e7eb" } } },
      scales: {
        x: { ticks: { color: "#9ca3af" } },
        y: { ticks: { color: "#9ca3af" } }
      }
    }
  });

  // Stats
  const latestData = recentData[recentData.length - 1] || { totalXp: 0, netWorth: 0 };
  $("analyticsXp") && ($("analyticsXp").textContent = latestData.totalXp);
  $("analyticsNetWorth") && ($("analyticsNetWorth").textContent = `₹${latestData.netWorth}`);
  $("analyticsQuizzes") && ($("analyticsQuizzes").textContent = state.quizzesCorrect || 0);
  $("analyticsTrades") && ($("analyticsTrades").textContent = state.weeklyProgress.trades || 0);
}

function recordDailyAnalytics() {
  const today = todayStr();
  if (!state.analyticsHistory) state.analyticsHistory = [];

  const existing = state.analyticsHistory.find(h => h.date === today);
  const portfolioValue = state.portfolio.reduce((sum, p) => sum + (marketPrices[p.id] || p.avgPrice) * p.qty, 0);
  const netWorth = state.wallet + portfolioValue;

  const todayData = {
    date: today,
    totalXp: state.points,
    netWorth,
    wallet: state.wallet,
    portfolioValue,
    quizzesCorrect: state.quizzesCorrect,
    streak: state.streak
  };

  if (existing) {
    Object.assign(existing, todayData);
  } else {
    state.analyticsHistory.push(todayData);
  }

  // Keep only last 90 days
  if (state.analyticsHistory.length > 90) {
    state.analyticsHistory = state.analyticsHistory.slice(-90);
  }
}

// ====== MARKET NEWS ======
const newsTemplates = [
  { type: "positive", asset: "BTC", text: "🚀 Major company announces Bitcoin investment!", impact: 0.15 },
  { type: "negative", asset: "BTC", text: "⚠️ Regulatory concerns shake crypto markets", impact: -0.12 },
  { type: "positive", asset: "GOLD", text: "📈 Gold prices surge amid economic uncertainty", impact: 0.08 },
  { type: "negative", asset: "OIL", text: "📉 Oil demand drops as electric vehicles gain popularity", impact: -0.10 },
  { type: "positive", asset: "ETH", text: "💎 Ethereum network upgrade successful!", impact: 0.12 },
  { type: "positive", asset: "GRN", text: "🌱 Green energy stocks boom on new policies", impact: 0.10 },
  { type: "negative", asset: "FNT", text: "📰 FinTech faces regulatory scrutiny", impact: -0.08 },
  { type: "positive", asset: "HLT", text: "🏥 Healthcare breakthrough boosts medical stocks", impact: 0.12 },
  { type: "neutral", asset: "all", text: "📊 Market analysts predict mixed performance", impact: 0 },
  { type: "positive", asset: "DOGE", text: "🐕 Celebrity tweet sends Dogecoin soaring!", impact: 0.25 },
  { type: "negative", asset: "DOGE", text: "📉 Meme coin bubble concerns emerge", impact: -0.20 }
];

function setupNews() {
  $("btnRefreshNews")?.addEventListener("click", generateNews);
  generateNews();
  renderNews();
}

function generateNews() {
  // Generate 3-5 random news items
  const newsCount = 3 + Math.floor(Math.random() * 3);
  state.marketNews = [];

  for (let i = 0; i < newsCount; i++) {
    const template = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
    state.marketNews.push({
      ...template,
      id: Date.now() + i,
      timestamp: Date.now() - (i * 3600000) // Stagger times
    });
  }

  // Apply news effects to prices
  state.marketNews.forEach(news => {
    if (news.asset === "all") {
      marketAssets.forEach(a => {
        marketPrices[a.id] = Math.max(10, Math.round(marketPrices[a.id] * (1 + news.impact * 0.5)));
      });
    } else {
      if (marketPrices[news.asset]) {
        marketPrices[news.asset] = Math.max(10, Math.round(marketPrices[news.asset] * (1 + news.impact)));
      }
    }
  });

  saveState();
  renderNews();
  renderMarket();
  showToast("📰 Market news updated!");
}

function renderNews() {
  const container = $("newsList");
  if (!container) return;

  const news = state.marketNews || [];
  if (news.length === 0) {
    container.innerHTML = '<div class="tag-mini">No news yet. Click refresh!</div>';
    return;
  }

  container.innerHTML = news.map(n => `
    <div class="news-item ${n.type}">
      <div class="news-text">${n.text}</div>
      <div class="news-meta">
        <span class="news-asset">${n.asset}</span>
        <span class="news-impact ${n.impact >= 0 ? 'positive' : 'negative'}">${n.impact >= 0 ? '+' : ''}${Math.round(n.impact * 100)}%</span>
      </div>
    </div>
  `).join("");
}

// ====== SOUND EFFECTS ======
const sounds = {
  coin: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1hZmNqYlxueXpidoKFiYODh4aEgn95dmVeV1lgZGRqaWNncnR0gIWGiYeGhH94cWhhW1dbX2JoamlkZ3F4fIKGiImJh4R+",
  success: "data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUtvAAB8c2xhXltfZHB/jZSPf2lbXG5/h4R6bGFYVFdfaHiDiYmDemxeU09VXmp4hI6PiH9vXlNQV2NvfIiQj4V5",
  error: "data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUtvAAB8fH18fHx8fGxbS0VLS11vcHBqXE5DPT5GVGdxb2VVRz05PEZZanJuYU5"
};

function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    const audio = new Audio(sounds[type] || sounds.coin);
    audio.volume = 0.3;
    audio.play().catch(() => { });
  } catch (e) { }
}

function setupSound() {
  $("btnToggleSound")?.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    $("btnToggleSound").textContent = state.soundEnabled ? "🔊" : "🔇";
    saveState();
    showToast(state.soundEnabled ? "Sound ON" : "Sound OFF");
  });
}

// ====== RANK SYSTEM (Expanded) ======
function rankFromLevel(level) {
  if (level >= 20) return "🌟 Grandmaster";
  if (level >= 15) return "💎 Diamond";
  if (level >= 12) return "🥇 Platinum";
  if (level >= 10) return "👑 Legend";
  if (level >= 7) return "🏆 Pro";
  if (level >= 5) return "⭐ Expert";
  if (level >= 4) return "💪 Skilled";
  if (level >= 2) return "📚 Apprentice";
  return "🌱 Rookie";
}

// ====== MAIN UI UPDATE ======
function updateAllUI() {
  $("topPlayer") && ($("topPlayer").textContent = state.name || "Guest");
  $("streakCount") && ($("streakCount").textContent = state.streak || 0);
  $("playerNameLabel") && ($("playerNameLabel").textContent = state.name || "Player");
  $("pointsLabel") && ($("pointsLabel").textContent = `${state.points} XP`);
  $("levelLabel") && ($("levelLabel").textContent = state.level);
  $("rankLabel") && ($("rankLabel").textContent = rankFromLevel(state.level));
  $("xpFill") && ($("xpFill").style.width = `${Math.min(100, state.points % 100)}%`);
  $("walletChip") && ($("walletChip").textContent = `₹${state.wallet}`);
  $("walletBig") && ($("walletBig").innerHTML = `₹${state.wallet}<span>virtual balance</span>`);
  $("quizChip") && ($("quizChip").textContent = state.quizzesCorrect || 0);
  $("streakLabel") && ($("streakLabel").textContent = `${state.streak || 0} days`);
  $("lastLoginLabel") && ($("lastLoginLabel").textContent = state.lastLogin || "–");

  // Update sound button
  const soundBtn = $("btnToggleSound");
  if (soundBtn) soundBtn.textContent = state.soundEnabled ? "🔊" : "🔇";

  // Update power-up indicator
  updatePowerUpUI();

  renderChallenges(); renderBadges(); renderPortfolio(); renderWeeklyChallenge(); renderGoals();
  saveToLeaderboard(); renderLeaderboard(); checkDailyReward(); saveState();
}

// ====== FINANCIAL CALCULATORS ======
function setupCalculators() {
  $("btnCalcCompound")?.addEventListener("click", calculateCompoundInterest);
  $("btnCalcSIP")?.addEventListener("click", calculateSIP);
  $("btnCalcEMI")?.addEventListener("click", calculateEMI);

  // Tab switching
  document.querySelectorAll(".calc-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".calc-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".calc-panel").forEach(p => p.classList.add("hidden"));
      const target = tab.getAttribute("data-calc");
      document.getElementById(`calc-${target}`)?.classList.remove("hidden");
    });
  });
}

function calculateCompoundInterest() {
  const principal = parseFloat($("calcPrincipal")?.value) || 0;
  const rate = parseFloat($("calcRate")?.value) || 0;
  const years = parseFloat($("calcYears")?.value) || 0;
  const frequency = parseInt($("calcFrequency")?.value) || 1;

  if (principal <= 0 || rate <= 0 || years <= 0) {
    $("calcResult").innerHTML = '<div class="calc-error">Please enter valid values</div>';
    return;
  }

  const r = rate / 100;
  const amount = principal * Math.pow(1 + r / frequency, frequency * years);
  const interest = amount - principal;

  $("calcResult").innerHTML = `
    <div class="calc-success">
      <div class="calc-row"><span>Final Amount:</span><strong>₹${amount.toFixed(2)}</strong></div>
      <div class="calc-row"><span>Interest Earned:</span><strong>₹${interest.toFixed(2)}</strong></div>
      <div class="calc-row"><span>Growth:</span><strong>${((amount / principal - 1) * 100).toFixed(1)}%</strong></div>
    </div>`;
  addXP(5, "using calculator");
}

function calculateSIP() {
  const monthly = parseFloat($("sipMonthly")?.value) || 0;
  const rate = parseFloat($("sipRate")?.value) || 0;
  const years = parseFloat($("sipYears")?.value) || 0;

  if (monthly <= 0 || rate <= 0 || years <= 0) {
    $("sipResult").innerHTML = '<div class="calc-error">Please enter valid values</div>';
    return;
  }

  const months = years * 12;
  const monthlyRate = rate / 100 / 12;
  const futureValue = monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
  const invested = monthly * months;
  const returns = futureValue - invested;

  $("sipResult").innerHTML = `
    <div class="calc-success">
      <div class="calc-row"><span>Total Invested:</span><strong>₹${invested.toFixed(0)}</strong></div>
      <div class="calc-row"><span>Est. Returns:</span><strong>₹${returns.toFixed(0)}</strong></div>
      <div class="calc-row"><span>Future Value:</span><strong>₹${futureValue.toFixed(0)}</strong></div>
    </div>`;
  addXP(5, "using SIP calculator");
}

function calculateEMI() {
  const loan = parseFloat($("emiLoan")?.value) || 0;
  const rate = parseFloat($("emiRate")?.value) || 0;
  const months = parseFloat($("emiMonths")?.value) || 0;

  if (loan <= 0 || rate <= 0 || months <= 0) {
    $("emiResult").innerHTML = '<div class="calc-error">Please enter valid values</div>';
    return;
  }

  const monthlyRate = rate / 100 / 12;
  const emi = loan * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - loan;

  $("emiResult").innerHTML = `
    <div class="calc-success">
      <div class="calc-row"><span>Monthly EMI:</span><strong>₹${emi.toFixed(0)}</strong></div>
      <div class="calc-row"><span>Total Interest:</span><strong>₹${totalInterest.toFixed(0)}</strong></div>
      <div class="calc-row"><span>Total Payment:</span><strong>₹${totalPayment.toFixed(0)}</strong></div>
    </div>`;
  addXP(5, "using EMI calculator");
}

// ====== POWER-UPS SYSTEM ======
function setupPowerUps() {
  $("btnActivateBoost")?.addEventListener("click", activateXPBoost);
  updatePowerUpUI();
}

function activateXPBoost() {
  if (state.xpBoostActive) {
    showToast("Boost already active!");
    return;
  }

  const cost = 50; // Cost in XP to activate boost
  if (state.points < cost) {
    showToast(`Need ${cost} XP to activate boost!`);
    return;
  }

  state.points -= cost;
  state.xpMultiplier = 2;
  state.xpBoostActive = true;
  state.xpBoostExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes

  saveState();
  updatePowerUpUI();
  showToast("🚀 2x XP Boost activated for 10 minutes!");
  showConfetti();
  playSound("success");

  // Set timer to deactivate
  setTimeout(checkBoostExpiry, 10 * 60 * 1000);
}

function checkBoostExpiry() {
  if (state.xpBoostActive && Date.now() >= state.xpBoostExpiry) {
    state.xpMultiplier = 1;
    state.xpBoostActive = false;
    saveState();
    updatePowerUpUI();
    showToast("XP Boost expired!");
  }
}

function updatePowerUpUI() {
  const boostIndicator = $("boostIndicator");
  const boostBtn = $("btnActivateBoost");

  // Check if boost expired
  if (state.xpBoostActive && Date.now() >= (state.xpBoostExpiry || 0)) {
    state.xpMultiplier = 1;
    state.xpBoostActive = false;
    saveState();
  }

  if (boostIndicator) {
    if (state.xpBoostActive) {
      const remaining = Math.max(0, Math.ceil((state.xpBoostExpiry - Date.now()) / 60000));
      boostIndicator.classList.remove("hidden");
      boostIndicator.innerHTML = `🚀 2x XP (${remaining}m left)`;
    } else {
      boostIndicator.classList.add("hidden");
    }
  }

  if (boostBtn) {
    boostBtn.textContent = state.xpBoostActive ? "Boost Active ✓" : "Activate 2x XP (50 XP)";
    boostBtn.disabled = state.xpBoostActive;
  }
}

// ====== STREAK CALENDAR ======
function setupStreakCalendar() {
  renderStreakCalendar();
}

function renderStreakCalendar() {
  const container = $("streakCalendar");
  if (!container) return;

  const today = new Date();
  const days = [];

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const isToday = i === 0;
    const isActive = state.streakDays?.includes(dateStr) || (isToday && state.lastLogin === dateStr);

    days.push({ date: dateStr, day: dayName, isToday, isActive });
  }

  container.innerHTML = days.map(d => `
    <div class="streak-day ${d.isActive ? 'active' : ''} ${d.isToday ? 'today' : ''}">
      <div class="streak-day-name">${d.day}</div>
      <div class="streak-day-icon">${d.isActive ? '🔥' : '○'}</div>
    </div>
  `).join("");

  // Update streak days tracking
  if (!state.streakDays) state.streakDays = [];
  const todayStr = today.toISOString().slice(0, 10);
  if (!state.streakDays.includes(todayStr)) {
    state.streakDays.push(todayStr);
    // Keep only last 30 days
    if (state.streakDays.length > 30) state.streakDays = state.streakDays.slice(-30);
    saveState();
  }
}

// ====== SPEED QUIZ MINI-GAME ======
let speedQuizTimer = null;
let speedQuizScore = 0;
let speedQuizQuestions = [];
let speedQuizIndex = 0;

function setupSpeedQuiz() {
  $("btnStartSpeedQuiz")?.addEventListener("click", startSpeedQuiz);
}

function startSpeedQuiz() {
  speedQuizScore = 0;
  speedQuizIndex = 0;
  speedQuizQuestions = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);

  $("speedQuizStart")?.classList.add("hidden");
  $("speedQuizGame")?.classList.remove("hidden");
  $("speedQuizResult")?.classList.add("hidden");

  renderSpeedQuizQuestion();
  startSpeedQuizTimer();
}

function renderSpeedQuizQuestion() {
  const q = speedQuizQuestions[speedQuizIndex];
  if (!q) {
    endSpeedQuiz();
    return;
  }

  $("speedQuizProgress").textContent = `${speedQuizIndex + 1}/10`;
  $("speedQuizQ").textContent = q.q;

  const optionsContainer = $("speedQuizOptions");
  optionsContainer.innerHTML = q.options.map((opt, i) => `
    <button class="speed-option" onclick="answerSpeedQuiz(${i}, ${q.correct})">${opt}</button>
  `).join("");
}

function startSpeedQuizTimer() {
  let time = 60;
  $("speedQuizTime").textContent = time;

  speedQuizTimer = setInterval(() => {
    time--;
    $("speedQuizTime").textContent = time;
    if (time <= 0) {
      endSpeedQuiz();
    }
  }, 1000);
}

window.answerSpeedQuiz = function (choice, correct) {
  if (choice === correct) {
    speedQuizScore++;
    $("speedQuizScore").textContent = speedQuizScore;
    playSound("success");
  } else {
    playSound("error");
  }

  speedQuizIndex++;
  if (speedQuizIndex >= 10) {
    endSpeedQuiz();
  } else {
    renderSpeedQuizQuestion();
  }
};

function endSpeedQuiz() {
  clearInterval(speedQuizTimer);

  $("speedQuizGame")?.classList.add("hidden");
  $("speedQuizResult")?.classList.remove("hidden");

  const xpEarned = speedQuizScore * 10;
  $("speedQuizFinalScore").textContent = speedQuizScore;
  $("speedQuizXP").textContent = xpEarned;

  if (speedQuizScore >= 7) {
    showConfetti();
    $("speedQuizMessage").textContent = "🏆 Excellent! You're a speed champion!";
  } else if (speedQuizScore >= 5) {
    $("speedQuizMessage").textContent = "👍 Good job! Keep practicing!";
  } else {
    $("speedQuizMessage").textContent = "📚 Keep learning! You'll get better!";
  }

  addXP(xpEarned, "Speed Quiz");

  $("btnSpeedQuizAgain")?.addEventListener("click", () => {
    $("speedQuizResult")?.classList.add("hidden");
    $("speedQuizStart")?.classList.remove("hidden");
  });
}

// ====== ACHIEVEMENT POPUPS ======
function checkAchievements() {
  const newAchievements = [];

  // Check for milestone achievements
  if (state.points >= 100 && !state.achievements?.includes("first100xp")) {
    newAchievements.push({ id: "first100xp", title: "Century!", desc: "Reached 100 XP", emoji: "💯" });
  }
  if (state.points >= 500 && !state.achievements?.includes("first500xp")) {
    newAchievements.push({ id: "first500xp", title: "Rising Star!", desc: "Reached 500 XP", emoji: "⭐" });
  }
  if (state.quizzesCorrect >= 10 && !state.achievements?.includes("quiz10")) {
    newAchievements.push({ id: "quiz10", title: "Quiz Whiz!", desc: "10 correct answers", emoji: "🧠" });
  }
  if (state.streak >= 7 && !state.achievements?.includes("week_streak")) {
    newAchievements.push({ id: "week_streak", title: "Week Warrior!", desc: "7-day streak", emoji: "🔥" });
  }
  if (state.goals?.filter(g => g.completed).length >= 1 && !state.achievements?.includes("first_goal")) {
    newAchievements.push({ id: "first_goal", title: "Goal Crusher!", desc: "Completed first goal", emoji: "🎯" });
  }

  // Record and show achievements
  if (!state.achievements) state.achievements = [];
  newAchievements.forEach(a => {
    if (!state.achievements.includes(a.id)) {
      state.achievements.push(a.id);
      showAchievementPopup(a);
    }
  });

  saveState();
}

function showAchievementPopup(achievement) {
  const popup = document.createElement("div");
  popup.className = "achievement-popup";
  popup.innerHTML = `
    <div class="achievement-content">
      <span class="achievement-emoji">${achievement.emoji}</span>
      <div class="achievement-text">
        <div class="achievement-title">🏆 ${achievement.title}</div>
        <div class="achievement-desc">${achievement.desc}</div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  playSound("success");

  setTimeout(() => {
    popup.classList.add("fade-out");
    setTimeout(() => popup.remove(), 500);
  }, 3000);
}

// Initialize new features
document.addEventListener("DOMContentLoaded", () => {
  // Add to existing init after a small delay
  setTimeout(() => {
    setupCalculators();
    setupPowerUps();
    setupStreakCalendar();
    setupSpeedQuiz();
    checkAchievements();
  }, 100);
});

// Check achievements periodically
setInterval(checkAchievements, 5000);

