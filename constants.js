/* =========================================================================
   FINTEENS CONSTANTS & DATA
   ========================================================================= */

const quizData = [
  {
    question: "Which of these is the safest way to accept a payment from a stranger?",
    options: ["Sharing your UPI ID/QR code only", "Sharing your UPI PIN", "Clicking a link they sent", "Scanning a QR code they sent"],
    answer: 0,
    explanation: "To receive money, you only need to share your UPI ID or QR code. Never enter your PIN or scan a QR code to receive money.",
    category: "upi",
    difficulty: "beginner"
  },
  {
    question: "What does 'Compounding' mean in investing?",
    options: ["Losing money over time", "Earning interest on your interest", "Paying a one-time fee", "Dividing your money into parts"],
    answer: 1,
    explanation: "Compounding is when the interest you earn on an investment also starts earning interest, accelerating growth over time.",
    category: "investing",
    difficulty: "beginner"
  },
  {
    question: "Which of these is an example of a 'Need' rather than a 'Want'?",
    options: ["The latest gaming console", "Basic groceries and food", "Designer sneakers", "Movie tickets"],
    answer: 1,
    explanation: "Needs are essentials like food, shelter, and health. Wants are things that improve life but aren't strictly necessary.",
    category: "basics",
    difficulty: "beginner"
  },
  {
    question: "What is the typical age range for a 'Teen' savings account in India?",
    options: ["10 to 18 years", "5 to 10 years", "18 to 25 years", "Any age"],
    answer: 0,
    explanation: "Most banks offer minor/teen accounts for children aged 10-18, often with a specialized debit card.",
    category: "banking",
    difficulty: "beginner"
  },
  {
    question: "What should you do if you receive a suspicious 'KYC update' SMS with a link?",
    options: ["Click it immediately", "Forward it to all friends", "Delete it and never click the link", "Reply with your bank details"],
    answer: 2,
    explanation: "Banks never ask for sensitive details via SMS links. These are usually phishing attempts to steal your data.",
    category: "upi",
    difficulty: "beginner"
  },
  {
    question: "What is a 'Budget'?",
    options: ["A way to spend all your money", "A plan for your income and expenses", "A type of bank account", "An expensive gift"],
    answer: 1,
    explanation: "A budget is a financial plan that helps you track how much money you get and how much you spend.",
    category: "basics",
    difficulty: "beginner"
  }
];

const budgetCategories = [
  { id: "needs", name: "Needs", icon: "🏠", color: "#6366f1" },
  { id: "wants", name: "Wants", icon: "🎮", color: "#ec4899" },
  { id: "savings", name: "Savings", icon: "💰", color: "#10b981" },
  { id: "investments", name: "Investments", icon: "📈", color: "#8b5cf6" }
];

const scenarioList = [
  { text: "You found ₹500. What do you do?", options: [{ txt: "Save it", correct: true, xp: 50 }, { txt: "Spend on candy", correct: false, xp: 0 }] },
  { text: "Stocks just dropped 10%. Panic?", options: [{ txt: "No, hold/buy more", correct: true, xp: 100 }, { txt: "Sell everything", correct: false, xp: 0 }] }
];

const glossary = [
  { term: "Inflation", definition: "When prices go up and money value goes down." },
  { term: "Dividend", definition: "A share of profits given to stockholders." },
  { term: "Asset", definition: "Something you own that has value, like cash or a house." },
  { term: "Liability", definition: "Something you owe, like a loan or credit card debt." },
  { term: "Net Worth", definition: "The total value of your assets minus your liabilities." },
  { term: "Interest", definition: "Money paid regularly at a rate for the use of money lent." },
  { term: "Principal", definition: "The original sum of money borrowed, or put into an investment." },
  { term: "Diversification", definition: "Spreading your investments around to limit exposure to risk." },
  { term: "Liquidity", definition: "How easily an asset can be converted into cash." },
  { term: "Bull Market", definition: "A financial market in which prices are rising or expected to rise." },
  { term: "Bear Market", definition: "A condition in which securities prices fall and pessimism is widespread." },
  { term: "Capital Gain", definition: "A profit from the sale of property or of an investment." },
  { term: "Compound Interest", definition: "Interest calculated on the initial principal and accumulated interest." },
  { term: "Emergency Fund", definition: "A stash of money set aside to cover unexpected financial surprises." },
  { term: "Budget", definition: "An estimation of revenue and expenses over a specified future period." }
];

const newsItems = [
  { title: "Market Boom", desc: "Tech stocks surge on strong earnings.", impact: { symbol: "titan", value: 0.05 } },
  { title: "Crypto Crash", desc: "Bitcoin falls 8% amid regulation fears.", impact: { symbol: "crypto", value: -0.08 } },
  { title: "Gold Rush", desc: "SafeGold hits yearly high.", impact: { symbol: "safe", value: 0.03 } },
  { title: "Banking Rally", desc: "National Bank posts record profits.", impact: { symbol: "bank", value: 0.04 } },
  { title: "Energy Dip", desc: "Green Energy stocks slip on policy news.", impact: { symbol: "green", value: -0.05 } },
  { title: "FMCG Stable", desc: "Consumer goods hold steady.", impact: { symbol: "fmcg", value: 0.01 } }
];


const Ranks = [
  { n: "Apprentice", min: 0 },
  { n: "Saver", min: 1000 },
  { n: "Investor", min: 5000 },
  { n: "Wealth Master", min: 10000 }
];

const speedQuizBank = [
  { q: "Is UPI PIN needed to receive money?", a: "No", cat: "upi" },
  { q: "Does compounding help your savings grow?", a: "Yes", cat: "investing" },
  { q: "Is a credit card a form of debt?", a: "Yes", cat: "banking" },
  { q: "Is 123456 a strong password?", a: "No", cat: "upi" },
  { q: "Is a budget used for planning spend?", a: "Yes", cat: "basics" },
  { q: "Are stocks guaranteed to go up?", a: "No", cat: "investing" },
  { q: "Is an emergency fund important?", a: "Yes", cat: "basics" },
  { q: "Can you change your UPI PIN?", a: "Yes", cat: "upi" },
  { q: "Is inflation good for your savings?", a: "No", cat: "basics" },
  { q: "Is diversification good for risk?", a: "Yes", cat: "investing" }
];


const marketAssets = [
  { id: "pifty50", name: "Pifty 50 Index", type: "Index", basePrice: 18500, vol: 0.008, trend: 0.0002 },
  { id: "titan", name: "Titan Tech", type: "Stock", basePrice: 2450, vol: 0.015, trend: 0.0005 },
  { id: "green", name: "Green Energy", type: "Stock", basePrice: 840, vol: 0.025, trend: 0.001 },
  { id: "safe", name: "SafeGold", type: "Commodity", basePrice: 5200, vol: 0.005, trend: 0.0001 },
  { id: "crypto", name: "BitCoin Virtual", type: "Crypto", basePrice: 4500000, vol: 0.04, trend: -0.0005 },
  { id: "fmcg", name: "Everyday FMCG", type: "Stock", basePrice: 1100, vol: 0.007, trend: 0.0003 },
  { id: "bank", name: "National Bank", type: "Stock", basePrice: 1550, vol: 0.012, trend: 0.0004 }
];

const funFacts = [
    "The first paper money was issued in China over 1,000 years ago!",
    "A ₹10 coin costs about ₹6 to manufacture.",
    "The word 'Salary' comes from 'Sal' (Salt) — Roman soldiers were once paid in salt!",
    "If you save ₹100 every day from age 15, with 10% return, you'd be a crorepati by age 50!",
    "The Rupee symbol ₹ was officially adopted by the Government of India in 2010.",
    "There are more than 1.5 million ATMs in the world — one even exists in Antarctica!",
    "Around 8% of the world's currency is physical cash; the rest is digital.",
    "The largest banknote ever printed was the 100,000,000,000,000 Zimbabwean Dollar."
];

const dailyTips = funFacts; // Alias for consistency


const learningPaths = [
  { id: 1, title: "Money Basics", description: "Income, Expenses, and Needs vs Wants.", color: "var(--primary)", lessons: [1, 2] },
  { id: 2, title: "Investing Pro", description: "Stocks, Markets, and Compounding.", color: "#ec4899", lessons: [3, 4] }
];

const lessons = [
  { id: 1, title: "Budgeting 101", sections: [
    { heading: "What is a budget?", content: "A budget is simply a plan for your money — you decide in advance how much to spend on different things before the month starts, instead of wondering where it all went." },
    { heading: "The 50/30/20 rule", content: "A popular budgeting method: spend 50% on needs (food, transport, school supplies), 30% on wants (entertainment, eating out), and save 20% every month." },
    { heading: "How to start", content: "Write down your monthly income (pocket money, part-time earnings). Then list every expense. Compare the two — if you're spending more than you earn, identify which 'wants' you can cut first." }
  ]},
  { id: 2, title: "Saving & Interest", sections: [
    { heading: "Power of Compounding", content: "Compounding is when you earn interest on both the money you save and the interest you've already earned. Over time, this makes your money grow much faster!" },
    { heading: "Emergency Funds", content: "An emergency fund is money set aside specifically for unexpected expenses, like a broken phone or a sudden trip. Aim to save at least 3 months of basic expenses." },
    { heading: "Saving vs. Investing", content: "Saving is putting money aside for short-term needs in a safe place. Investing is putting money into assets like stocks or gold to build wealth over the long term, though it carries more risk." }
  ]},
  { id: 3, title: "Stocks & Markets", sections: [
    { heading: "What are Stocks?", content: "When you buy a stock, you're buying a tiny piece of ownership in a company. If the company does well, the value of your stock usually goes up." },
    { heading: "Risk & Reward", content: "Higher potential returns usually come with higher risk. Diversification (owning different types of investments) helps spread this risk." },
    { heading: "Long-term Thinking", content: "The market goes up and down daily, but historically, it tends to go up over long periods. Be patient and don't panic-sell!" }
  ]},
  { id: 4, title: "Digital Safety", sections: [
    { heading: "UPI Protection", content: "Never share your UPI PIN with anyone. Real businesses or banks will never call you to ask for your pin or for you to 'receive' money by entering a pin." },
    { heading: "Spotting Scams", content: "If an offer sounds too good to be true (like 'double your money in a day'), it's almost certainly a scam. Always verify links before clicking." }
  ]}
];

const badges = [
  { id: "newbie", name: "First Steps", desc: "Complete your first quiz", icon: "🌱", condition: (s) => s.quizzesCorrect > 0 },
  { id: "saver", name: "Smart Saver", desc: "Create your first savings goal", icon: "🐷", condition: (s) => s.goals && s.goals.length > 0 },
  { id: "trader", name: "Market Rookie", desc: "Make your first virtual trade", icon: "📈", condition: (s) => s.tradeHistory && s.tradeHistory.length > 0 },
  { id: "scholar", name: "Finance Scholar", desc: "Reach Level 5", icon: "🎓", condition: (s) => (Math.floor(s.points / 500) + 1) >= 5 },
  { id: "streak3", name: "3-Day Fire", desc: "Maintain a 3-day login streak", icon: "🔥", condition: (s) => s.streak >= 3 },
  { id: "wealthy", name: "Lakhpati", desc: "Reach ₹1,00,000 Net Worth", icon: "💰", condition: (s) => (s.wallet + (s.portfolioValue || 0)) >= 100000 }
];
const skillTree = [
  { id: "s1", title: "Budgeting Basics", desc: "Unlock automated expense categorization.", icon: "📊", cost: 200, perk: "categorization" },
  { id: "s2", title: "Stock Master", desc: "Lower trading transaction fees by 50%.", icon: "📈", cost: 500, perk: "lowFees" },
  { id: "s3", title: "UPI Guardian", desc: "Get warned about high-risk transactions.", icon: "🛡️", cost: 300, perk: "safetyAlerts" },
  { id: "s4", title: "Compound King", desc: "Earn 1% bonus on savings monthly.", icon: "👑", cost: 1000, perk: "savingsBonus" },
  { id: "s5", title: "News Insider", desc: "See news impact 5 seconds early.", icon: "📰", cost: 400, perk: "newsEarly" }
];

const leaderboardData = {
  daily: [
    { name: "MoneySlayer", score: 12500, avatar: "rocket" },
    { name: "CryptoKing", score: 11200, avatar: "bull" },
    { name: "SaverQueen", score: 9800, avatar: "piggy" },
    { name: "FinancePro", score: 8500, avatar: "bear" },
    { name: "BullRunner", score: 7200, avatar: "bull" }
  ],
  alltime: [
    { name: "LegendaryTeen", score: 150000, avatar: "rocket" },
    { name: "WealthWizard", score: 142000, avatar: "bear" },
    { name: "StockNinja", score: 135000, avatar: "bull" },
    { name: "PennyPincher", score: 128000, avatar: "piggy" },
    { name: "MarketMaven", score: 115000, avatar: "rocket" }
  ]
};
