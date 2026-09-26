/* ─────────────────────────────────────────────────────────────
   Nova · Innovent's on-site assistant — server side

   POST /api/nova  { messages: [{role, content}], page: {slug, title}, lead: {...} }
   →  { reply, actions: [{type: 'navigate'|'handoff'|'suggest', ...}] }

   The model key is read from the ANTHROPIC_API_KEY environment variable that
   the site owner sets in Netlify (Site configuration → Environment variables).
   It never reaches the browser. With no key the function answers 503 and the
   widget falls back to its on-site guided mode, so the site keeps working.

   Optional env: NOVA_MODEL (default claude-sonnet-5), NOVA_MAX_TOKENS (600).
   ───────────────────────────────────────────────────────────── */

export const config = { path: '/api/nova' };

const MODEL = process.env.NOVA_MODEL || 'claude-sonnet-5';
const MAX_TOKENS = Math.min(parseInt(process.env.NOVA_MAX_TOKENS || '600', 10) || 600, 1200);
const MAX_TURNS = 16;            // most recent turns sent to the model
const MAX_MSG_CHARS = 1500;      // per user message
const ALLOWED_HOSTS = /(^|\.)innovent\.io$|(^|\.)netlify\.app$|^localhost(:\d+)?$/;

/* ── knowledge pack ─────────────────────────────────────────────────────── */
let KB = null, KB_AT = 0;
async function loadKb(origin) {
  if (KB && Date.now() - KB_AT < 10 * 60 * 1000) return KB;
  const r = await fetch(origin + '/nova-kb.json', { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error('kb ' + r.status);
  KB = await r.json(); KB_AT = Date.now();
  return KB;
}

const STOP = new Set('the a an and or of to in on for with is are be by at as it its this that we you your our from into one all any can how what which who why when where do does not no yes more about over under across every each per via us'.split(' '));
function tokens(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9+&\- ]+/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w))
    .map(w => w.length > 4 ? w.replace(/(ies|es|s)$/, m => m === 'ies' ? 'y' : '') : w);
}
function rank(kb, query, currentSlug, n) {
  const q = tokens(query); if (!q.length) return [];
  const scored = kb.pages.map(p => {
    const title = tokens(p.title + ' ' + p.family).join(' ');
    const desc = tokens(p.description + ' ' + (p.headings || []).join(' ')).join(' ');
    const body = (p.text || '').toLowerCase();
    let s = 0;
    for (const w of new Set(q)) {
      if (title.includes(w)) s += 6;
      if (desc.includes(w)) s += 3;
      const m = body.split(w).length - 1; if (m) s += Math.min(3, 1 + Math.log2(m));
    }
    if (p.slug === currentSlug) s += 1.5;
    if (p.family === 'Open role' || p.family === 'Office') s *= 0.6;
    return [s, p];
  }).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]);
  return scored.slice(0, n).map(x => x[1]);
}

/* ── prompt ─────────────────────────────────────────────────────────────── */
function indexBlock(kb) {
  const lines = kb.pages.map(p => `- ${p.slug} — ${p.title}${p.description ? ' — ' + p.description.slice(0, 140) : ''}`);
  return lines.join('\n');
}
function pageBlock(p, chars) {
  return `### ${p.title} (slug: ${p.slug}; ${p.family})\nSections: ${(p.headings || []).slice(0, 10).join(' | ')}\n${(p.text || '').slice(0, chars)}`;
}

const PERSONA = `You are Nova, the on-site assistant for Innovent (innovent.io), the company behind the Innfini operational-intelligence platform. You help visitors understand what Innovent does, work out what they need, and find the right page — you can take them there yourself.

How you work
- Be warm, concise and concrete. Two to four short sentences, then at most one question. Plain text; no headings, no bullet lists longer than three items, no emojis.
- Ask one question at a time. Early on, learn what matters: their sector (ports, public safety, smart city, defense, critical infrastructure, healthcare, manufacturing, retail, energy…), the problem (visibility, dispatch, asset tracking, compliance, integration…), the deployment they need (cloud, private cloud, on-prem, hybrid edge, air-gapped), rough scale, and timeline. Do not interrogate — weave questions into helpful answers.
- Ground every claim in the SITE KNOWLEDGE below. If the site does not say it, say you are not sure and offer to connect them with the team. Never invent customers, numbers, prices, certifications, integrations or timelines. Pricing is not published: offer a call.
- When a page answers their question or fits their need, call the navigate tool with its slug (and a section heading when one is clearly relevant) and tell them in one short sentence what they will see. Navigate at most once per reply, and only when it helps — not on every turn.
- When they want to talk to someone, see a demo, get pricing, or you have learned enough to hand over, call the handoff tool: "book-call" for a conversation with the team, "request-demo" for a walkthrough. Pass any name, company, email or topic they have already given. Ask before opening a form only if their intent is unclear.
- Most replies should call the suggest tool with two to four short quick replies (max 32 characters each) that move the conversation forward.
- You are Nova on innovent.io; you are not a general assistant. If asked something unrelated to Innovent, Innfini, operations technology or the site, say so kindly and steer back.
- Never ask for or repeat sensitive personal data. Work email, name, company and topic are all you need for a handoff.
- The visitor is on the page named in "Current page"; use that context.`;

const TOOLS = [
  { name: 'navigate', description: 'Take the visitor to a page on innovent.io (and optionally scroll to a section). Use the slug from the site index.',
    input_schema: { type: 'object', properties: {
      slug: { type: 'string', description: 'Page slug from the site index, e.g. cc-ports' },
      section: { type: 'string', description: 'Exact or partial heading text of the section to scroll to, if one is clearly relevant' },
      why: { type: 'string', description: 'Five to ten words on why this page, shown on the card' } }, required: ['slug'] } },
  { name: 'handoff', description: 'Open one of the site\'s own contact forms for the visitor, pre-filled with what they have shared.',
    input_schema: { type: 'object', properties: {
      form: { type: 'string', enum: ['book-call', 'request-demo'] },
      name: { type: 'string' }, email: { type: 'string' }, company: { type: 'string' },
      topic: { type: 'string', description: 'One line summarising their need, for the team' } }, required: ['form'] } },
  { name: 'suggest', description: 'Offer two to four quick replies the visitor can tap.',
    input_schema: { type: 'object', properties: {
      options: { type: 'array', items: { type: 'string', maxLength: 32 }, minItems: 2, maxItems: 4 } }, required: ['options'] } }
];

/* ── handler ────────────────────────────────────────────────────────────── */
const json = (status, body, extra) => new Response(JSON.stringify(body), {
  status, headers: Object.assign({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, extra || {}) });

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return json(405, { error: 'method' });

  const url = new URL(req.url);
  const origin = req.headers.get('origin') || '';
  const host = origin ? new URL(origin).hostname : url.hostname;
  if (!ALLOWED_HOSTS.test(host)) return json(403, { error: 'origin' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(503, { error: 'not_configured' });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'json' }); }
  const msgs = Array.isArray(body.messages) ? body.messages : [];
  const clean = msgs
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, m.role === 'user' ? MAX_MSG_CHARS : 2000) }));
  while (clean.length && clean[0].role !== 'user') clean.shift();
  if (!clean.length || clean[clean.length - 1].role !== 'user') return json(400, { error: 'messages' });
  // collapse any accidental same-role runs
  const turns = [];
  for (const m of clean) { const last = turns[turns.length - 1]; if (last && last.role === m.role) last.content += '\n' + m.content; else turns.push(m); }

  const page = body.page && typeof body.page === 'object' ? body.page : {};
  const curSlug = String(page.slug || '').slice(0, 60);
  const lead = body.lead && typeof body.lead === 'object' ? body.lead : {};

  let kb;
  try { kb = await loadKb(url.origin); } catch (e) { return json(502, { error: 'kb' }); }

  const lastUser = turns.filter(t => t.role === 'user').slice(-2).map(t => t.content).join(' ');
  const hits = rank(kb, lastUser + ' ' + (page.title || ''), curSlug, 4);
  const current = kb.pages.find(p => p.slug === curSlug);
  if (current && !hits.includes(current)) hits.push(current);

  const system = [
    { type: 'text', text: PERSONA },
    { type: 'text', text: 'SITE INDEX (slug — title — summary). Only these slugs exist:\n' + indexBlock(kb), cache_control: { type: 'ephemeral' } },
    { type: 'text', text: 'SITE KNOWLEDGE — the pages most relevant to this conversation:\n\n' + hits.map(p => pageBlock(p, p.slug === curSlug ? 2600 : 1800)).join('\n\n') +
        `\n\nCurrent page: ${current ? current.title + ' (slug: ' + current.slug + ')' : (page.title || 'unknown')}` +
        (Object.keys(lead).length ? `\nWhat the visitor has shared so far: ${JSON.stringify(lead).slice(0, 400)}` : '') }
  ];

  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 25000);
  let up;
  try {
    up = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages: turns, tools: TOOLS, tool_choice: { type: 'auto' } })
    });
  } catch (e) { clearTimeout(t); return json(504, { error: 'upstream_timeout' }); }
  clearTimeout(t);
  if (!up.ok) {
    const txt = await up.text().catch(() => '');
    console.error('nova upstream', up.status, txt.slice(0, 300));
    return json(502, { error: 'upstream', status: up.status });
  }
  const data = await up.json();
  let reply = ''; const actions = [];
  for (const b of data.content || []) {
    if (b.type === 'text') reply += b.text;
    else if (b.type === 'tool_use') {
      const i = b.input || {};
      if (b.name === 'navigate' && i.slug && kb.pages.some(p => p.slug === i.slug)) {
        const p = kb.pages.find(x => x.slug === i.slug);
        actions.push({ type: 'navigate', slug: p.slug, path: p.path, title: p.title, section: i.section ? String(i.section).slice(0, 80) : '', why: i.why ? String(i.why).slice(0, 90) : '' });
      } else if (b.name === 'handoff' && (i.form === 'book-call' || i.form === 'request-demo')) {
        actions.push({ type: 'handoff', form: i.form, prefill: { name: i.name, email: i.email, company: i.company, topic: i.topic } });
      } else if (b.name === 'suggest' && Array.isArray(i.options)) {
        actions.push({ type: 'suggest', options: i.options.filter(o => typeof o === 'string').map(o => o.slice(0, 40)).slice(0, 4) });
      }
    }
  }
  reply = reply.trim();
  if (!reply) reply = actions.some(a => a.type === 'navigate') ? 'Let me take you there.' : actions.some(a => a.type === 'handoff') ? 'Opening that for you now.' : 'Could you tell me a little more about what you are looking for?';
  return json(200, { reply, actions, usage: data.usage ? { in: data.usage.input_tokens, out: data.usage.output_tokens } : undefined });
};
