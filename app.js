/* ============================================================
   WORLDLINE · app.js
   UI, estado, vistas: Nexus, Forks, Wizard, Branch Compare,
   Causal Field, Observatory, ajustes y export/import.
   ============================================================ */

'use strict';

/* ==================== helpers ==================== */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtDate = d => d ? new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const WORLD_COLORS = ['#6c63ff', '#e0526f', '#e8a33d', '#4aa8de', '#b06ce0'];
const CONT_COLOR = '#2fa98c';

const METRICS = ['Dinero','Tiempo','Tranquilidad','Familia','Aprendizaje','Salud','Diversión','Crecimiento profesional','Libertad futura','Reversibilidad','Riesgo'];
const OBS_CATS = ['Mecánica cuántica','Muchos mundos','Consciencia','Hipótesis de simulación','Inteligencia artificial','Singularidad','Causalidad','Determinismo','Libre albedrío','Identidad personal','Futurismo','Ciencia ficción'];
const LEVELS = ['Bajo','Medio','Alto'];

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add('hidden'), 2400);
}

function openModal(html) {
  $('#modalCard').innerHTML = html;
  $('#modal').classList.remove('hidden');
}
function closeModal() { $('#modal').classList.add('hidden'); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

/* ==================== store ==================== */
const Store = {
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem('worldline-data')); } catch (e) { this.data = null; }
    if (!this.data) { this.data = { forks: [], notes: [], settings: { theme: 'dark' }, seeded: false }; }
    if (!this.data.seeded) { seedData(this.data); this.data.seeded = true; this.save(); }
  },
  save() { localStorage.setItem('worldline-data', JSON.stringify(this.data)); },
  fork(id) { return this.data.forks.find(f => f.id === id); }
};

/* ==================== seeds ==================== */
function seedData(d) {
  // Observatory: biblioteca inicial
  const books = [
    ['Mentirosas cuánticas', 'Mecánica cuántica', 'Mitos y malas interpretaciones de la física cuántica. Referencia clave para mantener Worldline lejos de la pseudociencia: el multiverso aquí es lenguaje visual, no afirmación observable.'],
    ['The Singularity Is Nearer — Ray Kurzweil', 'Singularidad', 'IA, evolución tecnológica, consciencia y la posible llegada de la singularidad. Útil para el horizonte largo: qué tendencias amplias considerar a 3+ años.'],
    ['The Coming Wave — Suleyman & Bhaskar', 'Inteligencia artificial', 'Impacto, riesgos y contención de IA y biología sintética. Conecta con la idea de variables que no controlás: eventos externos con impacto alto.'],
    ['Foundation — Isaac Asimov', 'Ciencia ficción', 'La psicohistoria: predecir trayectorias de sistemas grandes, no individuos. Recordatorio de que Worldline modela supuestos personales, no leyes históricas.'],
    ['The Three-Body Problem — Liu Cixin', 'Ciencia ficción', 'Sistemas caóticos y sensibilidad a condiciones iniciales: la inspiración directa de la Butterfly Variable.'],
    ['Project Hail Mary — Andy Weir', 'Ciencia ficción', 'Resolver bajo incertidumbre extrema: formar hipótesis, probar, registrar lo que realmente pasó. El loop científico que Worldline copia a escala personal.']
  ];
  d.notes = books.map(([title, cat, text]) => ({
    id: uid(), title, category: cat, text, isBook: true, forkId: null, at: Date.now()
  }));

  // Fork de ejemplo (borrable): la prensa francesa del documento
  const vUso = uid(), vCosto = uid(), vVariedad = uid(), vEspacio = uid();
  const wA = uid(), wB = uid();
  d.forks = [{
    id: uid(), demo: true, mode: 'deep',
    title: '¿Compro una prensa francesa o sigo solo con AeroPress?',
    why: 'Disfrutar más el café sin acumular equipo innecesario.',
    ifNothing: 'Sigo con AeroPress; cero costo, cero cambio.',
    deadline: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    horizonMonths: 3,
    reviewDate: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
    createdAt: Date.now(),
    metrics: ['Dinero', 'Diversión', 'Aprendizaje'],
    targetScore: 60,
    worlds: [
      { id: wA, name: 'World A — Comprarla', desc: 'Mayor variedad de preparaciones; gasto inicial; riesgo de usarla poco.', color: WORLD_COLORS[0], isContinuity: false,
        pros: ['Más variedad de preparaciones', 'Descubrir cafés que rinden mejor en prensa'], cons: ['Gasto inicial', 'Posibilidad de usarla poco'],
        quick: { potential: 7, risk: 4, reversibility: 8 },
        effects: { [vUso]: 1.8, [vCosto]: -0.8, [vVariedad]: 1.2, [vEspacio]: -0.4 } },
      { id: wB, name: 'World B — No comprarla', desc: 'Rutina sencilla; ahorro; menos experimentación.', color: CONT_COLOR, isContinuity: true,
        pros: ['Rutina sencilla', 'Ahorro', 'Comprar después con más certeza'], cons: ['Menos experimentación'],
        quick: { potential: 5, risk: 2, reversibility: 10 },
        effects: { [vUso]: 0, [vCosto]: 0.6, [vVariedad]: -0.6, [vEspacio]: 0.3 } }
    ],
    variables: [
      { id: vUso, name: 'Usos por semana', type: 'range', value: 2, min: 0, max: 7, control: 2, uncertainty: 2, impact: 2 },
      { id: vCosto, name: 'Costo total ($)', type: 'range', value: 40, min: 25, max: 80, control: 1, uncertainty: 0, impact: 1 },
      { id: vVariedad, name: 'Variedad de café que pruebo', type: 'growth', value: 7, min: 1, max: 10, control: 2, uncertainty: 1, impact: 1 },
      { id: vEspacio, name: 'Espacio libre en cocina', type: 'range', value: 5, min: 0, max: 10, control: 1, uncertainty: 0, impact: 0 }
    ],
    relations: [
      { from: vVariedad, to: vUso, sign: 1, strength: 0.7 },
      { from: vCosto, to: vUso, sign: 1, strength: 0.3 }
    ],
    desiredOutcome: '',
    simulation: null,
    outcome: null
  }];
}

/* ==================== router ==================== */
let currentView = 'nexus';
function showView(name) {
  currentView = name;
  $$('.view').forEach(v => v.classList.add('hidden'));
  $('#view-' + name).classList.remove('hidden');
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.view === name));
  window.scrollTo({ top: 0 });
  if (name === 'nexus') renderNexus();
  if (name === 'forks') renderForks();
  if (name === 'newfork') startWizard(wizard.mode || 'quick');
  if (name === 'causal') renderCausalPicker();
  if (name === 'observatory') renderObservatory();
}
$$('.tab').forEach(t => t.addEventListener('click', () => showView(t.dataset.view)));
$('#brandHome').addEventListener('click', () => showView('nexus'));

/* ==================== NEXUS ==================== */
function renderNexus() {
  drawNexusHero();
  const forks = Store.data.forks;
  const open = forks.filter(f => !f.outcome);
  const resolved = forks.filter(f => f.outcome);
  const today = new Date().toISOString().slice(0, 10);
  const due = open.filter(f => f.reviewDate && f.reviewDate <= today);

  // mayor divergencia y butterfly global
  let maxDiv = null, butterfly = null;
  for (const f of forks) {
    if (f.simulation) {
      if (!maxDiv || f.simulation.divergence > maxDiv.sim.divergence) maxDiv = { fork: f, sim: f.simulation };
      if (f.simulation.butterfly && (!butterfly || f.simulation.butterfly.abs > butterfly.b.abs))
        butterfly = { fork: f, b: f.simulation.butterfly };
    }
  }
  const cal = Engine.calibration(forks);
  const lastNotes = Store.data.notes.slice().sort((a, b) => b.at - a.at).slice(0, 2);

  const g = $('#nexusGrid');
  g.innerHTML = `
    <div class="card click span2" data-go="forks">
      <div class="card-label">Active Forks</div>
      <div class="card-big">${open.length}</div>
      <p class="muted">${open.length === 1 ? 'decisión abierta esperando colapsar' : 'decisiones abiertas esperando colapsar'}</p>
    </div>
    <div class="card click" data-go="forks" data-filter="resolved">
      <div class="card-label">Prime Timeline</div>
      <div class="card-big">${resolved.length}</div>
      <p class="muted">realidades observadas</p>
    </div>
    <div class="card ${due.length ? '' : ''}" style="${due.length ? 'border-color:var(--worldB)' : ''}">
      <div class="card-label" style="${due.length ? 'color:var(--worldB)' : ''}">Upcoming Observations</div>
      <div class="card-big">${due.length}</div>
      <p class="muted">${due.length ? '¡hay resultados por registrar!' : 'nada pendiente de revisión'}</p>
    </div>
    ${maxDiv ? `
    <div class="card click span2" data-fork="${maxDiv.fork.id}">
      <div class="card-label">Largest Divergence</div>
      <h3>${esc(maxDiv.fork.title)}</h3>
      <p class="muted">Sus mundos se separan ${maxDiv.sim.divergence.toFixed(0)} puntos — el multiverso más abierto que tenés.</p>
    </div>` : ''}
    ${butterfly ? `
    <div class="card click butterfly-card span2" data-fork="${butterfly.fork.id}">
      <div class="card-label">🦋 Butterfly Variable</div>
      <h3>“${esc(butterfly.b.name)}”</h3>
      <p class="muted">La pequeña condición que más está doblando tus líneas temporales (|r| = ${butterfly.b.abs.toFixed(2)}).</p>
    </div>` : ''}
    <div class="card">
      <div class="card-label">Calibration</div>
      <div class="card-big">${cal.score === null ? '—' : cal.score + '%'}</div>
      <p class="muted">${cal.score === null ? 'registrá resultados para calibrarte' : 'precisión histórica de tus futuros imaginados'}</p>
    </div>
    <div class="card click ${lastNotes.length ? '' : ''}" data-go="observatory">
      <div class="card-label">Observatory</div>
      ${lastNotes.map(n => `<p class="muted" style="margin-bottom:4px">☾ ${esc(n.title)}</p>`).join('') || '<p class="muted">sin notas aún</p>'}
    </div>
    ${cal.patterns?.length ? `
    <div class="card span2">
      <div class="card-label">Patrones de decisión</div>
      ${cal.patterns.map(p => `<p class="muted" style="margin-bottom:6px">◆ ${esc(p)}</p>`).join('')}
    </div>` : ''}
  `;
  g.querySelectorAll('[data-go]').forEach(c => c.addEventListener('click', () => {
    const flt = c.dataset.filter;
    showView(c.dataset.go);
    if (flt) { forkFilter = flt; $$('#forkFilter button').forEach(b => b.classList.toggle('on', b.dataset.f === flt)); renderForks(); }
  }));
  g.querySelectorAll('[data-fork]').forEach(c => c.addEventListener('click', () => openFork(c.dataset.fork)));
}

$$('.nexus-cta [data-newfork], [data-newfork]').forEach(b =>
  b.addEventListener('click', () => { wizard.mode = b.dataset.newfork; showView('newfork'); }));

/* --- hero canvas: worldlines vivas --- */
let heroAnim = null;
function drawNexusHero() {
  const cv = $('#nexusCanvas');
  const ctx = cv.getContext('2d');
  const W = cv.width = cv.offsetWidth * devicePixelRatio;
  const H = cv.height = 160 * devicePixelRatio;
  cancelAnimationFrame(heroAnim);
  const lines = [];
  const colors = [...WORLD_COLORS, CONT_COLOR];
  for (let i = 0; i < 6; i++) {
    lines.push({ c: colors[i % colors.length], phase: Math.random() * 99, amp: 8 + Math.random() * 22, speed: 0.15 + Math.random() * 0.25, off: (i - 2.5) * 9 });
  }
  let t = 0;
  (function frame() {
    t += 0.016;
    ctx.clearRect(0, 0, W, H);
    const cy = H * 0.42;
    const forkX = W * 0.32;
    for (const l of lines) {
      ctx.beginPath();
      ctx.strokeStyle = l.c;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.4 * devicePixelRatio;
      for (let x = 0; x <= W; x += 4) {
        const past = x < forkX;
        const spread = past ? 0 : ((x - forkX) / (W - forkX));
        const wave = Math.sin(x * 0.012 + t * l.speed * 4 + l.phase) * l.amp * spread * 0.4;
        const y = cy + (past ? 0 : l.off * spread * devicePixelRatio * 2.2) + wave * devicePixelRatio * 0.5;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // nexus event dot
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(forkX, cy, 4.5 * devicePixelRatio, 0, 7);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#6c63ff'; ctx.shadowBlur = 16 * devicePixelRatio;
    ctx.fill();
    ctx.shadowBlur = 0;
    heroAnim = requestAnimationFrame(frame);
  })();
}

/* ==================== FORKS LIST ==================== */
let forkFilter = 'open';
$('#forkFilter').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  forkFilter = b.dataset.f;
  $$('#forkFilter button').forEach(x => x.classList.toggle('on', x === b));
  renderForks();
});

function renderForks() {
  const today = new Date().toISOString().slice(0, 10);
  let list = Store.data.forks.slice().sort((a, b) => b.createdAt - a.createdAt);
  if (forkFilter === 'open') list = list.filter(f => !f.outcome);
  if (forkFilter === 'resolved') list = list.filter(f => f.outcome);
  const el = $('#forksList');
  if (!list.length) {
    el.innerHTML = `<div class="empty">No hay bifurcaciones aquí.<br>Creá una con el botón <b>+</b> — cada decisión abre líneas nuevas.</div>`;
    return;
  }
  el.innerHTML = list.map(f => {
    const due = !f.outcome && f.reviewDate && f.reviewDate <= today;
    const st = f.outcome ? 'resolved' : due ? 'due' : 'open';
    return `<div class="card click fork-row" data-id="${f.id}">
      <div class="fork-glyph">${f.mode === 'deep' ? '🌌' : '⚡'}</div>
      <div class="fork-meta">
        <h3>${esc(f.title)}</h3>
        <p class="muted">${f.worlds.length} mundos · ${f.outcome ? 'observado ' + fmtDate(f.outcome.date) : 'revisión ' + fmtDate(f.reviewDate)}${f.demo ? ' · ejemplo' : ''}</p>
      </div>
      <span class="status-dot ${st}"></span>
    </div>`;
  }).join('');
  el.querySelectorAll('[data-id]').forEach(c => c.addEventListener('click', () => openFork(c.dataset.id)));
}

/* ==================== WIZARD ==================== */
const wizard = { mode: 'quick', step: 0, draft: null };

function blankDraft(mode) {
  return {
    id: uid(), mode, title: '', why: '', ifNothing: '', deadline: '', horizonMonths: 3,
    reviewDate: '', createdAt: Date.now(), metrics: [], targetScore: 60,
    worlds: [
      { id: uid(), name: 'World A', desc: '', color: WORLD_COLORS[0], isContinuity: false, pros: [], cons: [], quick: { potential: 6, risk: 5, reversibility: 6 }, effects: {} },
      { id: uid(), name: 'World B', desc: '', color: WORLD_COLORS[1], isContinuity: false, pros: [], cons: [], quick: { potential: 5, risk: 4, reversibility: 7 }, effects: {} }
    ],
    variables: [], relations: [], desiredOutcome: '', simulation: null, outcome: null
  };
}

function wizardStepList() {
  return wizard.mode === 'deep'
    ? ['Nexus Event', 'Mundos', 'Métricas', 'Variables', 'Relaciones', 'Revisión']
    : ['Nexus Event', 'Mundos', 'Revisión'];
}

function startWizard(mode) {
  wizard.mode = mode;
  wizard.step = 0;
  wizard.draft = blankDraft(mode);
  $('#wizardTitle').textContent = mode === 'deep' ? '🌌 Deep Universe' : '⚡ Quick Fork';
  renderWizard();
}

function renderWizard() {
  const steps = wizardStepList();
  $('#wizardSteps').innerHTML = steps.map((s, i) => `<span class="${i <= wizard.step ? 'on' : ''}"></span>`).join('');
  $('#wizPrev').style.visibility = wizard.step === 0 ? 'hidden' : 'visible';
  $('#wizNext').textContent = wizard.step === steps.length - 1 ? '✓ Crear bifurcación' : 'Siguiente →';
  const body = $('#wizardBody');
  const d = wizard.draft;
  const name = steps[wizard.step];

  if (name === 'Nexus Event') {
    body.innerHTML = `<div class="wstep">
      <h2>1 · El punto de divergencia</h2>
      <p class="sub">El momento donde tu línea temporal se abre en varias.</p>
      <label class="f">¿Qué decisión enfrentás?</label>
      <input type="text" id="wTitle" placeholder="¿Acepto el proyecto nuevo?" value="${esc(d.title)}">
      <label class="f">¿Por qué importa?</label>
      <textarea id="wWhy" placeholder="Qué está en juego...">${esc(d.why)}</textarea>
      <label class="f">¿Qué pasa si no hacés nada?</label>
      <textarea id="wNothing" placeholder="La línea de Continuidad...">${esc(d.ifNothing)}</textarea>
      <div class="frow">
        <div><label class="f">Fecha límite de la decisión</label><input type="date" id="wDeadline" value="${d.deadline}"></div>
        <div><label class="f">Horizonte (meses)</label><input type="number" id="wHorizon" min="1" max="60" value="${d.horizonMonths}"></div>
      </div>
      <label class="f">Fecha de revisión (¿cuándo mirás qué pasó?)</label>
      <input type="date" id="wReview" value="${d.reviewDate}">
    </div>`;
  }

  if (name === 'Mundos') {
    body.innerHTML = `<div class="wstep">
      <h2>2 · Las líneas posibles</h2>
      <p class="sub">Cada alternativa es un mundo. Agregá una línea de Continuidad si “no hacer nada” también es una opción.</p>
      <div class="stack" id="wWorlds"></div>
      <div class="frow" style="margin-top:12px">
        <button class="btn ghost small" id="wAddWorld">+ Mundo</button>
        <button class="btn ghost small" id="wAddCont">+ Continuidad</button>
      </div>
    </div>`;
    renderWizardWorlds();
  }

  if (name === 'Métricas') {
    body.innerHTML = `<div class="wstep">
      <h2>3 · ¿Qué significa ganar?</h2>
      <p class="sub">Elegí solo las métricas que importan en esta decisión.</p>
      <div class="chips" id="wMetrics">${METRICS.map(m => `<button class="chip ${d.metrics.includes(m) ? 'on' : ''}" data-m="${m}">${m}</button>`).join('')}</div>
      <label class="f">Objetivo de la simulación (score 0–100 que considerás “éxito”)</label>
      <input type="range" id="wTarget" min="40" max="85" value="${d.targetScore}">
      <p class="muted mono" id="wTargetVal">${d.targetScore} puntos</p>
    </div>`;
    $('#wMetrics').addEventListener('click', e => {
      const c = e.target.closest('.chip'); if (!c) return;
      const m = c.dataset.m;
      d.metrics.includes(m) ? d.metrics.splice(d.metrics.indexOf(m), 1) : d.metrics.push(m);
      c.classList.toggle('on');
    });
    $('#wTarget').addEventListener('input', e => { d.targetScore = +e.target.value; $('#wTargetVal').textContent = d.targetScore + ' puntos'; });
  }

  if (name === 'Variables') {
    body.innerHTML = `<div class="wstep">
      <h2>4 · Variables</h2>
      <p class="sub">Las cantidades que mueven esta historia: valor, rango, control, incertidumbre e impacto.</p>
      <div class="stack" id="wVars"></div>
      <button class="btn ghost small" id="wAddVar" style="margin-top:12px">+ Variable</button>
    </div>`;
    renderWizardVars();
  }

  if (name === 'Relaciones') {
    body.innerHTML = `<div class="wstep">
      <h2>5 · Relaciones causales</h2>
      <p class="sub">Dibujá cómo una variable empuja a otra. Esto convierte la lista en un mapa causal.</p>
      <div class="stack" id="wRels"></div>
      ${d.variables.length >= 2 ? `
      <div class="card" style="margin-top:12px">
        <div class="frow">
          <select id="relFrom">${d.variables.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select>
          <select id="relSign"><option value="1">aumenta →</option><option value="-1">reduce →</option></select>
          <select id="relTo">${d.variables.map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join('')}</select>
        </div>
        <label class="f">Fuerza del efecto</label>
        <input type="range" id="relStr" min="10" max="100" value="60">
        <button class="btn primary small" id="relAdd" style="margin-top:10px">+ Agregar relación</button>
      </div>` : '<p class="muted">Necesitás al menos dos variables para crear relaciones.</p>'}
    </div>`;
    renderWizardRels();
    const add = $('#relAdd');
    if (add) add.addEventListener('click', () => {
      const from = $('#relFrom').value, to = $('#relTo').value;
      if (from === to) return toast('Una variable no puede empujarse a sí misma');
      d.relations.push({ from, to, sign: +$('#relSign').value, strength: +$('#relStr').value / 100 });
      renderWizardRels();
    });
  }

  if (name === 'Revisión') {
    const isDeep = wizard.mode === 'deep';
    body.innerHTML = `<div class="wstep">
      <h2>${isDeep ? '6' : '3'} · Revisión final</h2>
      <p class="sub">Tu Nexus Event está a punto de quedar registrado.</p>
      <div class="card">
        <div class="card-label">Nexus Event</div>
        <h3>${esc(d.title) || 'Sin título'}</h3>
        <p class="muted" style="margin-top:6px">${d.worlds.length} mundos · horizonte ${d.horizonMonths} meses · revisión ${fmtDate(d.reviewDate)}</p>
        ${isDeep ? `<p class="muted">${d.variables.length} variables · ${d.relations.length} relaciones · métricas: ${d.metrics.join(', ') || '—'}</p>` : ''}
      </div>
      <p class="muted" style="margin-top:12px">Al crearla, ${isDeep ? 'podrás correr la simulación Monte Carlo (1,000 futuros por mundo) desde la vista Branch Compare.' : 'obtendrás una comparación inmediata entre tus mundos.'}</p>
    </div>`;
  }
}

function readWizardStep() {
  const steps = wizardStepList();
  const d = wizard.draft;
  const name = steps[wizard.step];
  if (name === 'Nexus Event') {
    d.title = $('#wTitle').value.trim();
    d.why = $('#wWhy').value.trim();
    d.ifNothing = $('#wNothing').value.trim();
    d.deadline = $('#wDeadline').value;
    d.horizonMonths = +$('#wHorizon').value || 3;
    d.reviewDate = $('#wReview').value;
    if (!d.title) { toast('Ponele nombre a la decisión'); return false; }
    if (!d.reviewDate) {
      const r = new Date(Date.now() + d.horizonMonths * 30 * 864e5);
      d.reviewDate = r.toISOString().slice(0, 10);
    }
  }
  if (name === 'Mundos') {
    let ok = true;
    $$('#wWorlds .world-card').forEach((card, i) => {
      const w = d.worlds[i];
      w.name = card.querySelector('.wName').value.trim() || w.name;
      w.desc = card.querySelector('.wDesc').value.trim();
      w.quick.potential = +card.querySelector('.wPot').value;
      w.quick.risk = +card.querySelector('.wRisk').value;
      w.quick.reversibility = +card.querySelector('.wRev').value;
      w.pros = card.querySelector('.wPros').value.split('\n').map(s => s.trim()).filter(Boolean);
      w.cons = card.querySelector('.wCons').value.split('\n').map(s => s.trim()).filter(Boolean);
    });
    if (d.worlds.length < 2) { toast('Necesitás al menos dos mundos'); ok = false; }
    return ok;
  }
  if (name === 'Variables') {
    $$('#wVars .var-card').forEach((card, i) => {
      const v = d.variables[i];
      v.name = card.querySelector('.vName').value.trim() || v.name;
      v.type = card.querySelector('.vType').value;
      v.min = +card.querySelector('.vMin').value;
      v.max = +card.querySelector('.vMax').value;
      v.value = +card.querySelector('.vVal').value;
      v.control = +card.querySelector('.vCtl').value;
      v.uncertainty = +card.querySelector('.vUnc').value;
      v.impact = +card.querySelector('.vImp').value;
      if (v.max <= v.min) v.max = v.min + 1;
    });
    // efectos por mundo
    $$('#wVars .var-card').forEach((card, i) => {
      const v = d.variables[i];
      card.querySelectorAll('.vEff').forEach(inp => {
        const w = d.worlds.find(x => x.id === inp.dataset.w);
        if (w) w.effects[v.id] = +inp.value / 10;
      });
    });
  }
  return true;
}

function renderWizardWorlds() {
  const d = wizard.draft;
  const el = $('#wWorlds');
  el.innerHTML = d.worlds.map((w, i) => `
    <div class="card world-card" style="border-left-color:${w.color}">
      <div class="wc-head">
        <span class="world-tag" style="background:${w.color}22;color:${w.color}">${w.isContinuity ? 'CONTINUIDAD' : 'WORLD ' + String.fromCharCode(65 + i)}</span>
        ${d.worlds.length > 2 ? `<button class="wc-del" data-i="${i}">✕</button>` : ''}
      </div>
      <input type="text" class="wName" placeholder="Nombre del mundo" value="${esc(w.name)}">
      <label class="f">Descripción breve</label>
      <input type="text" class="wDesc" placeholder="Qué implica esta línea..." value="${esc(w.desc)}">
      <div class="frow" style="margin-top:10px">
        <div><label class="f">Potencial ${'·'} <span class="mono pv">${w.quick.potential}</span></label><input type="range" class="wPot" min="0" max="10" value="${w.quick.potential}"></div>
        <div><label class="f">Riesgo ${'·'} <span class="mono rv">${w.quick.risk}</span></label><input type="range" class="wRisk" min="0" max="10" value="${w.quick.risk}"></div>
        <div><label class="f">Reversib. ${'·'} <span class="mono vv">${w.quick.reversibility}</span></label><input type="range" class="wRev" min="0" max="10" value="${w.quick.reversibility}"></div>
      </div>
      <details class="adv"><summary>Pros y contras</summary>
        <label class="f">Pros (uno por línea)</label>
        <textarea class="wPros">${esc(w.pros.join('\n'))}</textarea>
        <label class="f">Contras (uno por línea)</label>
        <textarea class="wCons">${esc(w.cons.join('\n'))}</textarea>
      </details>
    </div>`).join('');
  el.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', e => {
    const lbl = e.target.closest('div').querySelector('span');
    if (lbl) lbl.textContent = e.target.value;
  }));
  el.querySelectorAll('.wc-del').forEach(b => b.addEventListener('click', () => {
    readWizardStep(); wizard.draft.worlds.splice(+b.dataset.i, 1); renderWizardWorlds();
  }));
  $('#wAddWorld')?.addEventListener('click', () => {
    readWizardStep();
    const i = d.worlds.length;
    d.worlds.push({ id: uid(), name: 'World ' + String.fromCharCode(65 + i), desc: '', color: WORLD_COLORS[i % WORLD_COLORS.length], isContinuity: false, pros: [], cons: [], quick: { potential: 5, risk: 5, reversibility: 5 }, effects: {} });
    renderWizardWorlds();
  }, { once: true });
  $('#wAddCont')?.addEventListener('click', () => {
    readWizardStep();
    if (d.worlds.some(w => w.isContinuity)) return toast('Ya existe una línea de Continuidad');
    d.worlds.push({ id: uid(), name: 'Continuidad — seguir igual', desc: d.ifNothing || 'No intervenir.', color: CONT_COLOR, isContinuity: true, pros: [], cons: [], quick: { potential: 4, risk: 2, reversibility: 10 }, effects: {} });
    renderWizardWorlds();
  }, { once: true });
}

function renderWizardVars() {
  const d = wizard.draft;
  const el = $('#wVars');
  const types = [['range', 'Rango'], ['fixed', 'Valor fijo'], ['prob', 'Probabilidad %'], ['boolean', 'Sí / No'], ['growth', 'Crece con el tiempo']];
  el.innerHTML = d.variables.map((v, i) => `
    <div class="card var-card">
      <div class="var-head">
        <input type="text" class="vName" value="${esc(v.name)}" placeholder="Nombre de la variable">
        <button class="wc-del" data-i="${i}">✕</button>
      </div>
      <div class="var-attrs">
        <div class="attr"><b>Tipo</b><select class="vType">${types.map(t => `<option value="${t[0]}" ${v.type === t[0] ? 'selected' : ''}>${t[1]}</option>`).join('')}</select></div>
        <div class="attr"><b>Valor actual</b><input type="number" class="vVal" value="${v.value}" step="any"></div>
        <div class="attr"><b>Mínimo</b><input type="number" class="vMin" value="${v.min}" step="any"></div>
        <div class="attr"><b>Máximo</b><input type="number" class="vMax" value="${v.max}" step="any"></div>
        <div class="attr"><b>Control</b><select class="vCtl">${LEVELS.map((l, j) => `<option value="${j}" ${v.control === j ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="attr"><b>Incertidumbre</b><select class="vUnc">${LEVELS.map((l, j) => `<option value="${j}" ${v.uncertainty === j ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="attr"><b>Impacto</b><select class="vImp">${LEVELS.map((l, j) => `<option value="${j}" ${v.impact === j ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      </div>
      <details class="adv"><summary>Efecto sobre cada mundo (−20 daña · +20 ayuda)</summary>
        ${d.worlds.map(w => `
          <label class="f" style="color:${w.color}">${esc(w.name)}</label>
          <input type="range" class="vEff" data-w="${w.id}" min="-20" max="20" value="${Math.round((w.effects[v.id] || 0) * 10)}">
        `).join('')}
      </details>
    </div>`).join('');
  el.querySelectorAll('.wc-del').forEach(b => b.addEventListener('click', () => {
    readWizardStep(); d.variables.splice(+b.dataset.i, 1); renderWizardVars();
  }));
  $('#wAddVar')?.addEventListener('click', () => {
    readWizardStep();
    d.variables.push({ id: uid(), name: 'Variable ' + (d.variables.length + 1), type: 'range', value: 5, min: 0, max: 10, control: 1, uncertainty: 1, impact: 1 });
    renderWizardVars();
  }, { once: true });
}

function renderWizardRels() {
  const d = wizard.draft;
  const el = $('#wRels');
  const vName = id => d.variables.find(v => v.id === id)?.name || '?';
  el.innerHTML = d.relations.map((r, i) => `
    <div class="rel-row">
      <span>${esc(vName(r.from))}</span>
      <span class="rel-arrow ${r.sign > 0 ? 'pos' : 'neg'}">${r.sign > 0 ? '⟶ aumenta' : '⟶ reduce'} (${Math.round(r.strength * 100)}%)</span>
      <span>${esc(vName(r.to))}</span>
      <button class="wc-del" data-i="${i}" style="margin-left:auto">✕</button>
    </div>`).join('') || '<p class="muted">Aún no hay relaciones.</p>';
  el.querySelectorAll('.wc-del').forEach(b => b.addEventListener('click', () => {
    d.relations.splice(+b.dataset.i, 1); renderWizardRels();
  }));
}

$('#wizNext').addEventListener('click', () => {
  if (!readWizardStep()) return;
  const steps = wizardStepList();
  if (wizard.step < steps.length - 1) { wizard.step++; renderWizard(); }
  else {
    Store.data.forks.push(wizard.draft);
    Store.save();
    toast('⑂ Nexus Event registrado');
    const id = wizard.draft.id;
    wizard.draft = null;
    openFork(id);
  }
});
$('#wizPrev').addEventListener('click', () => {
  readWizardStep();
  if (wizard.step > 0) { wizard.step--; renderWizard(); }
});

/* ==================== FORK DETAIL / BRANCH COMPARE ==================== */
let currentForkId = null;

function openFork(id) {
  currentForkId = id;
  $$('.view').forEach(v => v.classList.add('hidden'));
  $('#view-fork').classList.remove('hidden');
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.view === 'forks'));
  window.scrollTo({ top: 0 });
  renderForkDetail();
}

function renderForkDetail() {
  const f = Store.fork(currentForkId);
  if (!f) return showView('forks');
  const el = $('#forkDetail');
  const today = new Date().toISOString().slice(0, 10);
  const due = !f.outcome && f.reviewDate && f.reviewDate <= today;
  const sim = f.simulation;

  let html = `
    <button class="btn ghost small" id="backForks">← Bifurcaciones</button>
    <div class="view-head" style="margin-top:14px">
      <div>
        <div class="tag-line">
          <span class="world-tag">${f.mode === 'deep' ? '🌌 DEEP UNIVERSE' : '⚡ QUICK FORK'}</span>
          ${f.outcome ? '<span class="world-tag" style="background:rgba(47,169,140,.16);color:var(--cont)">OBSERVADO</span>' : due ? '<span class="world-tag" style="background:rgba(224,82,111,.16);color:var(--worldB)">REVISIÓN PENDIENTE</span>' : ''}
        </div>
        <h1 style="margin-top:8px">${esc(f.title)}</h1>
        <p class="muted">${esc(f.why)}</p>
        <p class="muted">Horizonte: ${f.horizonMonths} meses · Revisión: ${fmtDate(f.reviewDate)}</p>
      </div>
    </div>`;

  /* --- mundos --- */
  html += `<div class="section-title">Los mundos</div><div class="bc-worlds">`;
  for (const w of f.worlds) {
    const r = sim?.results?.[w.id];
    const chosen = f.outcome?.chosenWorldId === w.id;
    html += `<div class="card bc-world" style="border-top-color:${w.color};${f.outcome && !chosen ? 'opacity:.55' : ''}">
      <div class="wc-head">
        <span class="world-tag" style="background:${w.color}22;color:${w.color}">${esc(w.name)}</span>
        ${chosen ? '<span class="world-tag" style="background:rgba(47,169,140,.2);color:var(--cont)">PRIME</span>' : f.outcome ? '<span class="muted" style="font-size:.65rem">UNOBSERVED</span>' : ''}
      </div>
      ${w.desc ? `<p class="muted" style="margin-bottom:8px">${esc(w.desc)}</p>` : ''}
      ${r ? `
        <div class="bc-stat"><span>Mediana</span><b>${r.median.toFixed(0)}</b></div>
        <div class="bc-stat"><span>Mejor 10%</span><b>${r.p90.toFixed(0)}</b></div>
        <div class="bc-stat"><span>Peor 10%</span><b>${r.p10.toFixed(0)}</b></div>
        <div class="bc-stat"><span>P(objetivo ≥ ${sim.target})</span><b>${r.probTarget.toFixed(0)}%</b></div>
        <div class="bc-stat"><span>Estabilidad</span><b>${r.stability.toFixed(0)}</b></div>
      ` : `
        <div class="bc-stat"><span>Potencial</span><b>${w.quick.potential}/10</b></div>
        <div class="bc-stat"><span>Riesgo</span><b>${w.quick.risk}/10</b></div>
        <div class="bc-stat"><span>Reversibilidad</span><b>${w.quick.reversibility}/10</b></div>
      `}
      ${(w.pros.length || w.cons.length) ? `<details class="adv"><summary>Pros / contras</summary>
        ${w.pros.map(p => `<p class="muted">＋ ${esc(p)}</p>`).join('')}
        ${w.cons.map(c => `<p class="muted">－ ${esc(c)}</p>`).join('')}
      </details>` : ''}
    </div>`;
  }
  html += `</div>`;

  /* --- botones de acción --- */
  if (!f.outcome) {
    html += `<div class="frow" style="margin:14px 0">
      <button class="btn primary" id="runSim">${sim ? '⟳ Re-simular 1,000 futuros' : '▶ Simular 1,000 futuros por mundo'}</button>
      ${due || sim ? `<button class="btn ghost" id="recordOutcome">● Registrar qué pasó</button>` : ''}
    </div>`;
  }

  /* --- resultados de simulación --- */
  if (sim) {
    html += `
    <div class="section-title">Branch Compare · divergencia de líneas temporales</div>
    <div class="divergence-wrap">
      <canvas id="divCanvas" class="div-canvas" height="240"></canvas>
      <div class="horizon-legend"><span>Hoy</span><span>1 semana</span><span>3 meses</span><span>1 año</span><span>${f.horizonMonths >= 36 ? '3 años' : f.horizonMonths + ' meses'}</span></div>
    </div>
    <div class="reading">${esc(Engine.narrate(f, sim))}</div>`;

    if (sim.butterfly) {
      html += `<div class="card butterfly-card" style="margin:12px 0">
        <div class="card-label">🦋 Butterfly Variable</div>
        <h3>“${esc(sim.butterfly.name)}”</h3>
        <p class="muted" style="margin-top:6px">La decisión no depende principalmente de lo obvio: esta es la pequeña condición que produce la mayor diferencia entre tus líneas temporales (correlación ${sim.butterfly.corr.toFixed(2)}).</p>
      </div>`;
    }

    // sensibilidad por mundo
    if (f.mode === 'deep') {
      const wBest = f.worlds.reduce((a, b) => sim.results[a.id].median >= sim.results[b.id].median ? a : b);
      const sens = sim.results[wBest.id].sensitivity.slice().sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr));
      html += `<div class="card" style="margin:12px 0">
        <div class="card-label">Sensibilidad de variables · ${esc(wBest.name)}</div>
        ${sens.map(s => `<div class="sens-row">
          <span class="sens-name">${esc(s.name)}</span>
          <div class="sens-track"><div class="sens-fill" style="width:${Math.abs(s.corr) * 100}%;background:${s.corr >= 0 ? 'var(--cont)' : 'var(--worldB)'}"></div></div>
          <span class="sens-val">${s.corr.toFixed(2)}</span>
        </div>`).join('')}
      </div>`;

      /* --- What must be true --- */
      html += `<div class="section-title">What must be true?</div>
      <div class="card">
        <p class="muted">Ingeniería inversa del universo deseado: ¿qué condiciones necesita cada mundo para alcanzar tu objetivo (${sim.target} puntos)?</p>
        <label class="f">Resultado que querés lograr (opcional, para tu registro)</label>
        <input type="text" id="wmbtDesired" placeholder="Ej: crecer profesionalmente sin perder tiempo familiar" value="${esc(f.desiredOutcome || '')}">
        <div class="frow" style="margin-top:10px">
          <select id="wmbtWorld">${f.worlds.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select>
          <button class="btn primary small" id="wmbtRun">Calcular condiciones</button>
        </div>
        <div id="wmbtOut" style="margin-top:10px"></div>
      </div>`;
    }
  }

  /* --- resultado observado --- */
  if (f.outcome) {
    const o = f.outcome;
    const w = f.worlds.find(x => x.id === o.chosenWorldId);
    html += `<div class="section-title">Realidad observada</div>
    <div class="card" style="border-color:var(--cont)">
      <div class="card-label" style="color:var(--cont)">Prime Timeline · ${esc(w?.name || '')}</div>
      <p style="margin:8px 0">${esc(o.whatHappened)}</p>
      <div class="bc-stat"><span>Satisfacción con el resultado</span><b>${o.rating}/10</b></div>
      <div class="bc-stat"><span>¿Tomarías la misma decisión?</span><b>${o.again ? 'Sí' : 'No'}</b></div>
      ${o.rightAssumptions ? `<p class="muted" style="margin-top:8px">✓ Acerté: ${esc(o.rightAssumptions)}</p>` : ''}
      ${o.wrongAssumptions ? `<p class="muted">✗ Fallé: ${esc(o.wrongAssumptions)}</p>` : ''}
      ${o.unexpected ? `<p class="muted">⚡ No lo vi venir: ${esc(o.unexpected)}</p>` : ''}
      ${f.simulation?.results?.[o.chosenWorldId] ? `<p class="muted" style="margin-top:8px">Simulación previa: mediana ${f.simulation.results[o.chosenWorldId].median.toFixed(0)} · realidad: ${o.rating * 10} → error ${(o.rating * 10 - f.simulation.results[o.chosenWorldId].median).toFixed(0)} puntos.</p>` : ''}
    </div>`;
  }

  /* --- pie --- */
  html += `<div class="divider"></div>
  <div class="frow">
    <button class="btn ghost small" id="linkNote">☾ Nota en Observatory</button>
    <button class="btn danger small" id="delFork">Eliminar bifurcación</button>
  </div>`;

  el.innerHTML = html;

  /* --- listeners --- */
  $('#backForks').addEventListener('click', () => showView('forks'));
  $('#delFork').addEventListener('click', () => {
    openModal(`<div class="modal-head"><h2>¿Eliminar esta bifurcación?</h2></div>
      <p class="muted">Se borrarán sus mundos, variables y simulaciones. Esto no se puede deshacer.</p>
      <div class="frow" style="margin-top:16px">
        <button class="btn ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn danger" id="confirmDel">Eliminar</button>
      </div>`);
    $('#confirmDel').addEventListener('click', () => {
      Store.data.forks = Store.data.forks.filter(x => x.id !== f.id);
      Store.save(); closeModal(); toast('Línea temporal eliminada'); showView('forks');
    });
  });
  $('#linkNote').addEventListener('click', () => noteEditor(null, f.id));

  $('#runSim')?.addEventListener('click', () => {
    const btn = $('#runSim');
    btn.textContent = '⟳ Colapsando 1,000 futuros...';
    btn.disabled = true;
    setTimeout(() => {
      f.simulation = Engine.simulate(f, 1000);
      Store.save();
      renderForkDetail();
      toast('🌌 ' + (f.worlds.length * 1000).toLocaleString('es') + ' futuros simulados');
    }, 60);
  });

  $('#recordOutcome')?.addEventListener('click', () => outcomeForm(f));

  $('#wmbtRun')?.addEventListener('click', () => {
    f.desiredOutcome = $('#wmbtDesired').value.trim();
    Store.save();
    const worldId = $('#wmbtWorld').value;
    const out = $('#wmbtOut');
    out.innerHTML = '<p class="muted">Calculando condiciones…</p>';
    setTimeout(() => {
      const res = Engine.whatMustBeTrue(f, worldId);
      if (!res.conditions?.length) {
        out.innerHTML = `<p class="muted">Este mundo ${res.baseMedian >= res.target ? 'ya alcanza el objetivo en su escenario mediano — ninguna variable individual lo restringe.' : 'no tiene variables con efecto suficiente para calcular umbrales. Ajustá los efectos por mundo en las variables.'}</p>`;
        return;
      }
      out.innerHTML = res.conditions.map(c =>
        `<div class="rel-row" style="margin-bottom:8px">
          <span>${c.achievable ? '✓' : '⚠'}</span><span>${esc(c.text)}</span>
        </div>`).join('');
    }, 30);
  });

  if (sim) drawDivergence(f, sim);
}

/* --- gráfico de divergencia (spaghetti de futuros) --- */
function drawDivergence(f, sim) {
  const cv = $('#divCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width = cv.offsetWidth * devicePixelRatio;
  const H = cv.height = 240 * devicePixelRatio;
  const tr = Engine.trajectories(f, sim);
  const pad = 10 * devicePixelRatio;
  const y = v => H - pad - (v / 100) * (H - pad * 2);
  const steps = 60;

  // marcas de horizonte (1 sem, 3 m, 1 año)
  ctx.strokeStyle = 'rgba(128,128,150,.18)';
  ctx.lineWidth = 1;
  [0.1, 0.35, 0.65].forEach(t => {
    ctx.beginPath(); ctx.moveTo(W * t, 0); ctx.lineTo(W * t, H); ctx.stroke();
  });

  let prog = 0;
  const total = 46;
  (function anim() {
    prog++;
    const upto = Math.floor(steps * Math.min(1, prog / total));
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(128,128,150,.15)';
    [0.1, 0.35, 0.65].forEach(t => { ctx.beginPath(); ctx.moveTo(W * t, 0); ctx.lineTo(W * t, H); ctx.stroke(); });

    for (const w of f.worlds) {
      const t = tr[w.id];
      // fantasmas
      ctx.globalAlpha = 0.07;
      ctx.lineWidth = 1 * devicePixelRatio;
      ctx.strokeStyle = w.color;
      for (const p of t.paths) {
        ctx.beginPath();
        for (let s = 0; s <= upto; s++) {
          const x = pad + (s / steps) * (W - pad * 2);
          s === 0 ? ctx.moveTo(x, y(p[s])) : ctx.lineTo(x, y(p[s]));
        }
        ctx.stroke();
      }
      // mediana
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.4 * devicePixelRatio;
      ctx.beginPath();
      for (let s = 0; s <= upto; s++) {
        const x = pad + (s / steps) * (W - pad * 2);
        s === 0 ? ctx.moveTo(x, y(t.medianPath[s])) : ctx.lineTo(x, y(t.medianPath[s]));
      }
      ctx.stroke();
      // etiqueta al final
      if (upto === steps) {
        ctx.font = `${11 * devicePixelRatio}px -apple-system, sans-serif`;
        ctx.fillStyle = w.color;
        const last = t.medianPath[steps];
        ctx.fillText(sim.results[w.id].median.toFixed(0), W - pad - 24 * devicePixelRatio, y(last) - 6 * devicePixelRatio);
      }
    }
    // punto nexus
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(pad, y(50), 4 * devicePixelRatio, 0, 7);
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#6c63ff'; ctx.shadowBlur = 12 * devicePixelRatio;
    ctx.fill(); ctx.shadowBlur = 0;

    if (prog < total) requestAnimationFrame(anim);
  })();
}

/* --- registrar lo que realmente pasó --- */
function outcomeForm(f) {
  openModal(`<div class="modal-head"><h2>● Registrar la realidad</h2><button class="icon-btn" onclick="closeModal()">✕</button></div>
    <p class="muted">La rama elegida se convierte en tu Prime Timeline. Las demás quedan como Unobserved Worlds.</p>
    <label class="f">¿Qué opción tomaste?</label>
    <select id="oWorld">${f.worlds.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select>
    <label class="f">¿Qué ocurrió?</label>
    <textarea id="oWhat" placeholder="La historia real..."></textarea>
    <label class="f">Satisfacción con el resultado · <span class="mono" id="oRatingVal">7</span>/10</label>
    <input type="range" id="oRating" min="0" max="10" value="7">
    <label class="f">¿Qué supuestos acertaste?</label>
    <input type="text" id="oRight" placeholder="Variables que calculaste bien...">
    <label class="f">¿Qué supuestos fallaron?</label>
    <input type="text" id="oWrong" placeholder="Lo que imaginaste distinto...">
    <label class="f">¿Qué evento no habías considerado?</label>
    <input type="text" id="oUnexpected" placeholder="El cisne negro personal...">
    <label class="f">¿Tomarías la misma decisión?</label>
    <div class="seg" id="oAgain"><button data-v="1" class="on">Sí</button><button data-v="0">No</button></div>
    <button class="btn primary" id="oSave" style="width:100%;margin-top:18px">Colapsar la función de onda ●</button>`);

  $('#oRating').addEventListener('input', e => $('#oRatingVal').textContent = e.target.value);
  let again = true;
  $('#oAgain').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    again = b.dataset.v === '1';
    $$('#oAgain button').forEach(x => x.classList.toggle('on', x === b));
  });
  $('#oSave').addEventListener('click', () => {
    f.outcome = {
      chosenWorldId: $('#oWorld').value,
      whatHappened: $('#oWhat').value.trim(),
      rating: +$('#oRating').value,
      rightAssumptions: $('#oRight').value.trim(),
      wrongAssumptions: $('#oWrong').value.trim(),
      unexpected: $('#oUnexpected').value.trim(),
      again,
      date: new Date().toISOString().slice(0, 10)
    };
    Store.save();
    closeModal();
    toast('● Realidad observada. Prime Timeline actualizada.');
    renderForkDetail();
  });
}

/* ==================== CAUSAL FIELD ==================== */
let causalForkId = null;

function renderCausalPicker() {
  const candidates = Store.data.forks.filter(f => f.mode === 'deep' && f.variables?.length);
  const picker = $('#causalPicker');
  const stage = $('#causalStage');
  stage.innerHTML = '';
  if (!candidates.length) {
    picker.innerHTML = '<div class="empty">Necesitás una bifurcación Deep Universe con variables para abrir el Causal Field.</div>';
    return;
  }
  picker.innerHTML = candidates.map(f => `
    <div class="card click fork-row" data-id="${f.id}">
      <div class="fork-glyph">✳</div>
      <div class="fork-meta"><h3>${esc(f.title)}</h3>
      <p class="muted">${f.variables.length} variables · ${f.relations.length} relaciones</p></div>
    </div>`).join('');
  picker.querySelectorAll('[data-id]').forEach(c => c.addEventListener('click', () => {
    causalForkId = c.dataset.id;
    picker.innerHTML = '';
    renderCausalField();
  }));
}

function renderCausalField() {
  const f = Store.fork(causalForkId);
  if (!f) return;
  const stage = $('#causalStage');
  $('#causalHint').textContent = 'Tocá un nodo y movelo con el slider: mirá cómo se propaga el efecto por la red.';

  const Wv = 640, Hv = 440;
  const nodes = f.variables.map((v, i) => {
    const angle = (i / f.variables.length) * Math.PI * 2 - Math.PI / 2;
    const r = Math.min(Wv, Hv) * 0.33;
    return { v, x: Wv / 2 + Math.cos(angle) * r, y: Hv / 2 + Math.sin(angle) * r * 0.9, norm: normOf(v) };
  });

  function normOf(v) {
    const span = (v.max - v.min) || 1;
    if (v.type === 'boolean' || v.type === 'prob') return v.value / 100;
    return Math.min(1, Math.max(0, (v.value - v.min) / span));
  }

  function propagateOnce(startId) {
    // reset a valores base y propaga desde el nodo tocado
    nodes.forEach(n => n.sim = n.v.id === startId ? n.norm : normOf(n.v));
    for (let p = 0; p < 3; p++) {
      for (const r of f.relations) {
        const from = nodes.find(n => n.v.id === r.from);
        const to = nodes.find(n => n.v.id === r.to);
        if (!from || !to) continue;
        to.sim = Math.min(1, Math.max(0, to.sim + r.sign * r.strength * (from.sim - 0.5) * 0.55 / 3));
      }
    }
  }
  nodes.forEach(n => n.sim = n.norm);

  function draw() {
    let svg = `<svg id="causalSvg" viewBox="0 0 ${Wv} ${Hv}" xmlns="http://www.w3.org/2000/svg">`;
    // edges
    for (const r of f.relations) {
      const a = nodes.find(n => n.v.id === r.from), b = nodes.find(n => n.v.id === r.to);
      if (!a || !b) continue;
      const col = r.sign > 0 ? '#2fa98c' : '#e0526f';
      const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.18;
      const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.18;
      svg += `<path d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}" fill="none" stroke="${col}" stroke-width="${1 + r.strength * 2.4}" stroke-opacity=".5" marker-end="url(#arr${r.sign > 0 ? 'P' : 'N'})"/>`;
    }
    svg += `<defs>
      <marker id="arrP" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="none" stroke="#2fa98c" stroke-width="1.4"/></marker>
      <marker id="arrN" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="none" stroke="#e0526f" stroke-width="1.4"/></marker>
    </defs>`;
    // nodes
    for (const n of nodes) {
      const rad = 16 + n.sim * 18;
      const heat = Math.abs(n.sim - normOf(n.v));
      svg += `<g class="cnode" data-id="${n.v.id}" style="cursor:pointer">
        <circle cx="${n.x}" cy="${n.y}" r="${rad}" fill="#6c63ff" fill-opacity="${0.18 + n.sim * 0.4}" stroke="${heat > 0.02 ? '#e8a33d' : '#6c63ff'}" stroke-width="${heat > 0.02 ? 2.5 : 1.4}"/>
        <text x="${n.x}" y="${n.y - rad - 7}" text-anchor="middle" fill="currentColor" font-size="11.5" font-weight="600">${esc(n.v.name)}</text>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" fill="currentColor" font-size="11" opacity=".8">${Math.round(n.sim * 100)}</text>
      </g>`;
    }
    svg += `</svg>`;
    stage.innerHTML = svg + `<div class="causal-controls" id="causalCtl"></div>`;

    stage.querySelectorAll('.cnode').forEach(g => g.addEventListener('click', () => selectNode(g.dataset.id)));
  }

  function selectNode(id) {
    const n = nodes.find(x => x.v.id === id);
    const ctl = $('#causalCtl');
    const v = n.v;
    const isPct = v.type === 'boolean' || v.type === 'prob';
    ctl.innerHTML = `<div class="card">
      <div class="card-label">✳ ${esc(v.name)}</div>
      <label class="f">Valor experimental · <span class="mono" id="cfVal">${isPct ? Math.round(n.norm * 100) + '%' : Engine.fmtNum(v.min + n.norm * (v.max - v.min))}</span></label>
      <input type="range" id="cfSlider" min="0" max="100" value="${Math.round(n.norm * 100)}">
      <p class="muted" style="margin-top:8px">Movelo y observá la propagación. Los nodos con borde ámbar cambiaron por efecto causal, no por tu mano.</p>
      <button class="btn ghost small" id="cfReset" style="margin-top:10px">Restaurar universo</button>
    </div>`;
    $('#cfSlider').addEventListener('input', e => {
      n.norm = +e.target.value / 100;
      $('#cfVal').textContent = isPct ? Math.round(n.norm * 100) + '%' : Engine.fmtNum(v.min + n.norm * (v.max - v.min));
      propagateOnce(v.id);
      // redibujar conservando el control
      const keep = ctl.innerHTML;
      draw();
      $('#causalCtl').innerHTML = keep;
      rebindCtl();
    });
    function rebindCtl() {
      $('#cfSlider').addEventListener('input', ev => {
        n.norm = +ev.target.value / 100;
        $('#cfVal').textContent = isPct ? Math.round(n.norm * 100) + '%' : Engine.fmtNum(v.min + n.norm * (v.max - v.min));
        propagateOnce(v.id);
        const keep2 = $('#causalCtl').innerHTML;
        draw();
        $('#causalCtl').innerHTML = keep2;
        rebindCtl();
      });
      $('#cfReset').addEventListener('click', () => { nodes.forEach(x => { x.norm = normOf(x.v); x.sim = x.norm; }); draw(); });
    }
    $('#cfReset').addEventListener('click', () => { nodes.forEach(x => { x.norm = normOf(x.v); x.sim = x.norm; }); draw(); });
  }

  draw();
}

/* ==================== OBSERVATORY ==================== */
let obsFilter = null;

function renderObservatory() {
  const cats = $('#obsCategories');
  cats.innerHTML = `<button class="chip ${!obsFilter ? 'on' : ''}" data-c="">Todo</button>` +
    OBS_CATS.map(c => `<button class="chip ${obsFilter === c ? 'on' : ''}" data-c="${c}">${c}</button>`).join('');
  cats.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
    obsFilter = ch.dataset.c || null; renderObservatory();
  }));

  let notes = Store.data.notes.slice().sort((a, b) => b.at - a.at);
  if (obsFilter) notes = notes.filter(n => n.category === obsFilter);
  const el = $('#obsList');
  if (!notes.length) { el.innerHTML = '<div class="empty">Sin notas en esta categoría todavía.</div>'; return; }
  el.innerHTML = notes.map(n => {
    const fork = n.forkId ? Store.fork(n.forkId) : null;
    return `<div class="card click note-card" data-id="${n.id}">
      <div class="tag-line">
        <span class="note-cat">${esc(n.category)}</span>
        ${n.isBook ? '<span class="book-badge">📖 libro</span>' : ''}
      </div>
      <h3>${esc(n.title)}</h3>
      <p class="muted">${esc(n.text.length > 180 ? n.text.slice(0, 180) + '…' : n.text)}</p>
      ${fork ? `<p class="muted" style="margin-top:6px">⑂ conectada a: ${esc(fork.title)}</p>` : ''}
    </div>`;
  }).join('');
  el.querySelectorAll('[data-id]').forEach(c => c.addEventListener('click', () => {
    noteEditor(Store.data.notes.find(n => n.id === c.dataset.id));
  }));
}

function noteEditor(note, forkId = null) {
  const isNew = !note;
  const n = note || { id: uid(), title: '', category: OBS_CATS[0], text: '', isBook: false, forkId: forkId, at: Date.now() };
  const forks = Store.data.forks;
  openModal(`<div class="modal-head"><h2>${isNew ? '☾ Nueva nota' : '☾ Editar nota'}</h2><button class="icon-btn" onclick="closeModal()">✕</button></div>
    <label class="f">Título</label>
    <input type="text" id="nTitle" value="${esc(n.title)}" placeholder="Idea, libro, teoría, pregunta...">
    <label class="f">Categoría</label>
    <select id="nCat">${OBS_CATS.map(c => `<option ${n.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
    <label class="f">Nota</label>
    <textarea id="nText" style="min-height:120px" placeholder="Ej: esta decisión me recordó el concepto de dependencia de trayectoria...">${esc(n.text)}</textarea>
    <label class="f">¿Es un libro?</label>
    <div class="seg" id="nBook"><button data-v="0" class="${!n.isBook ? 'on' : ''}">No</button><button data-v="1" class="${n.isBook ? 'on' : ''}">📖 Sí</button></div>
    <label class="f">Conectar con una bifurcación</label>
    <select id="nFork"><option value="">— ninguna —</option>${forks.map(f => `<option value="${f.id}" ${n.forkId === f.id ? 'selected' : ''}>${esc(f.title)}</option>`).join('')}</select>
    <div class="frow" style="margin-top:18px">
      ${!isNew ? '<button class="btn danger" id="nDel">Eliminar</button>' : ''}
      <button class="btn primary" id="nSave" style="flex:2">Guardar</button>
    </div>`);
  let isBook = n.isBook;
  $('#nBook').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    isBook = b.dataset.v === '1';
    $$('#nBook button').forEach(x => x.classList.toggle('on', x === b));
  });
  $('#nSave').addEventListener('click', () => {
    n.title = $('#nTitle').value.trim();
    if (!n.title) return toast('La nota necesita título');
    n.category = $('#nCat').value;
    n.text = $('#nText').value.trim();
    n.isBook = isBook;
    n.forkId = $('#nFork').value || null;
    if (isNew) Store.data.notes.push(n);
    Store.save(); closeModal(); toast('☾ Guardada en el Observatory');
    if (currentView === 'observatory') renderObservatory();
  });
  $('#nDel')?.addEventListener('click', () => {
    Store.data.notes = Store.data.notes.filter(x => x.id !== n.id);
    Store.save(); closeModal(); toast('Nota eliminada'); renderObservatory();
  });
}
$('#newNoteBtn').addEventListener('click', () => noteEditor(null));

/* ==================== SETTINGS ==================== */
$('#settingsBtn').addEventListener('click', () => {
  const d = Store.data;
  openModal(`<div class="modal-head"><h2>⚙ Ajustes</h2><button class="icon-btn" onclick="closeModal()">✕</button></div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-label">Datos</div>
      <p class="muted">${d.forks.length} bifurcaciones · ${d.notes.length} notas · todo vive en este dispositivo.</p>
      <div class="frow" style="margin-top:12px">
        <button class="btn ghost small" id="expBtn">↓ Exportar JSON</button>
        <button class="btn ghost small" id="impBtn">↑ Importar JSON</button>
      </div>
      <input type="file" id="impFile" accept=".json" style="display:none">
    </div>
    <div class="card">
      <div class="card-label">Zona peligrosa</div>
      <button class="btn danger small" id="wipeBtn" style="margin-top:6px">Borrar todo el multiverso</button>
    </div>
    <p class="muted" style="margin-top:14px;text-align:center">Worldline v1 · Las probabilidades representan tus supuestos, no el mundo real.</p>`);

  $('#expBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(Store.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'worldline-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    toast('↓ Multiverso exportado');
  });
  $('#impBtn').addEventListener('click', () => $('#impFile').click());
  $('#impFile').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!Array.isArray(data.forks)) throw new Error('formato');
        Store.data = data; Store.save();
        closeModal(); toast('↑ Multiverso restaurado'); showView('nexus');
      } catch (err) { toast('Archivo inválido'); }
    };
    r.readAsText(file);
  });
  $('#wipeBtn').addEventListener('click', () => {
    if (!confirm('¿Borrar todas las bifurcaciones y notas? Esto colapsa TODO.')) return;
    localStorage.removeItem('worldline-data');
    Store.load(); closeModal(); toast('Big Bang: universo reiniciado'); showView('nexus');
  });
});

/* ==================== theme ==================== */
$('#themeToggle').addEventListener('click', () => {
  const cur = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = cur;
  Store.data.settings.theme = cur;
  Store.save();
});

/* ==================== init ==================== */
Store.load();
if (Store.data.settings.theme === 'light') document.documentElement.dataset.theme = 'light';
showView('nexus');