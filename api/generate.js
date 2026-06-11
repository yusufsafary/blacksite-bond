const SYSTEM_PROMPT = `You are BLACKSITE's autonomous product synthesis engine. Given a product idea, generate a concise operational brief in this exact format — no markdown, no extra text, only this structure:

BLACKSITE — OPERATION INITIATED
────────────────────────────────
INPUT PARSED: [summarize the idea in 5-8 words]
COMPLEXITY: [Low / Medium / High]

PRODUCT IDENTITY
└── Name: [SHORT MEMORABLE PRODUCT NAME in caps]
└── Domain: [suggested domain.com]
└── Tagline: [one sharp sentence]

TECH STACK SELECTED
└── Frontend: [framework + styling]
└── Backend: [service or framework]
└── Database: [db choice]
└── Payments: [payment service if needed, else "N/A"]
└── Hosting: [hosting]

CORE MODULES
└── [01] [module name]: [one line description]
└── [02] [module name]: [one line description]
└── [03] [module name]: [one line description]
└── [04] [module name]: [one line description]
└── [05] [module name]: [one line description]

DEPLOYMENT ESTIMATE
└── Phase 1: [timeframe] — [scope]
└── Phase 2: [timeframe] — [scope]
└── Total: [X]h to production

BLACKSITE ASSESSMENT
└── Viability: [LOW / MEDIUM / HIGH / CRITICAL]
└── Revenue potential: [$X–$Y MRR at 12 months]
└── Recommended plan: [BLACKSITE CORE / OPS / CLASSIFIED]

OPERATION STATUS: READY TO EXECUTE
────────────────────────────────`;

function simulateOutput(idea) {
  const ideaLower = idea.toLowerCase();
  const words = idea.split(' ').filter(w => w.length > 3);
  const stopWords = new Set(['with','that','for','and','the','from','about','into','using','based','a','an']);
  const keyWords = words.filter(w => !stopWords.has(w.toLowerCase())).slice(0, 2);
  const productName = keyWords.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).join('') || 'NEXUS';
  const isMarketplace = /market|sell|buy|vendor|product|shop|store/.test(ideaLower);
  const isSaaS = /saas|tool|platform|dashboard|manage|track|analytics|automat/.test(ideaLower);
  const isAI = /ai|ml|generat|openai|llm|model|predict|smart/.test(ideaLower);
  const stack = isMarketplace
    ? { fe: 'Next.js 15 + Tailwind', be: 'Supabase', db: 'PostgreSQL', pay: 'Stripe Connect', host: 'Vercel + Supabase' }
    : isAI
    ? { fe: 'Next.js 15 + Tailwind', be: 'FastAPI + Python', db: 'PostgreSQL + Pinecone', pay: 'Stripe', host: 'Vercel + Fly.io' }
    : { fe: 'Next.js 15 + Tailwind', be: 'Express + Prisma', db: 'PostgreSQL', pay: 'Stripe', host: 'Vercel + Railway' };
  const modules = isMarketplace
    ? ['Seller onboarding + verification','Product listings + rich media','Buyer discovery + search filters','Cart + checkout + payout splits','Orders + shipping + tracking']
    : isAI
    ? ['AI pipeline + model orchestration','User authentication + usage limits','Prompt management + history','Output formatting + export','Billing + usage metering']
    : ['User auth + team management','Core product dashboard','Data ingestion + processing','Reporting + analytics engine','API + webhook integrations'];
  return `BLACKSITE — OPERATION INITIATED
────────────────────────────────
INPUT PARSED: ${idea.substring(0, 48)}${idea.length > 48 ? '...' : ''}
COMPLEXITY: ${isAI || isMarketplace ? 'High' : isSaaS ? 'Medium' : 'Medium'}

PRODUCT IDENTITY
└── Name: ${productName}
└── Domain: ${productName.toLowerCase()}.io
└── Tagline: ${isMarketplace ? 'The marketplace built for the modern economy.' : isSaaS ? 'The command center for your workflow.' : 'Built to move fast. Built to last.'}

TECH STACK SELECTED
└── Frontend: ${stack.fe}
└── Backend: ${stack.be}
└── Database: ${stack.db}
└── Payments: ${stack.pay}
└── Hosting: ${stack.host}

CORE MODULES
└── [01] ${modules[0]}
└── [02] ${modules[1]}
└── [03] ${modules[2]}
└── [04] ${modules[3]}
└── [05] ${modules[4]}

DEPLOYMENT ESTIMATE
└── Phase 1: 48h — Core architecture + authentication
└── Phase 2: 24h — Feature completion + production deploy
└── Total: 72h to production

BLACKSITE ASSESSMENT
└── Viability: HIGH
└── Revenue potential: $12K–$60K MRR at 12 months
└── Recommended plan: BLACKSITE CORE — $1,200

OPERATION STATUS: READY TO EXECUTE
────────────────────────────────`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { idea } = req.body || {};
  if (!idea || idea.trim().length < 3) return res.status(400).json({ error: 'Idea required' });

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    try {
      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: idea.trim() }
          ],
          max_tokens: 700,
          temperature: 0.7
        })
      });
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return res.json({ output: data.choices[0].message.content });
      }
    } catch (e) { /* fall through */ }
  }

  await new Promise(r => setTimeout(r, 1200));
  return res.json({ output: simulateOutput(idea.trim()) });
};
