/* ============================================================
   WORLDLINE · engine.js
   Motor de universos: simulación Monte Carlo, propagación
   causal, sensibilidad (Butterfly Variable), What must be true
   y calibración. Sin dependencias, sin DOM.
   ============================================================ */

const Engine = (() => {

  // ---------- utilidades numéricas ----------
  function gaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  function quantile(sorted, q) {
    const pos = (sorted.length - 1) * q;
    const lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  function pearson(xs, ys) {
    const n = xs.length;
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      sx += xs[i]; sy += ys[i];
      sxx += xs[i] * xs[i]; syy += ys[i] * ys[i]; sxy += xs[i] * ys[i];
    }
    const cov = sxy / n - (sx / n) * (sy / n);
    const vx = sxx / n - (sx / n) ** 2;
    const vy = syy / n - (sy / n) ** 2;
    if (vx <= 1e-12 || vy <= 1e-12) return 0;
    return cov / Math.sqrt(vx * vy);
  }

  // ---------- muestreo de variables ----------
  // Devuelve valor normalizado 0..1 según el tipo de variable.
  function sampleVar(v) {
    const span = (v.max - v.min) || 1;
    switch (v.type) {
      case 'fixed':
        return clamp((v.value - v.min) / span, 0, 1);
      case 'range':
        return Math.random();
      case 'boolean':
      case 'prob':
        return Math.random() < (v.value / 100) ? 1 : 0;
      case 'growth': {
        // crecimiento: sesgo hacia arriba con ruido
        const base = clamp((v.value - v.min) / span, 0, 1);
        return clamp(base + Math.random() * 0.4 - 0.1, 0, 1);
      }
      default:
        return Math.random();
    }
  }

  // valor normalizado → unidades reales
  function denorm(v, x) {
    if (v.type === 'boolean' || v.type === 'prob') return Math.round(x * 100);
    return v.min + x * (v.max - v.min);
  }

  // ---------- propagación causal ----------
  // relations: [{from, to, sign(+1/-1), strength(0..1)}]
  function propagate(values, variables, relations, passes = 3) {
    const idx = {};
    variables.forEach((v, i) => idx[v.id] = i);
    const out = values.slice();
    for (let p = 0; p < passes; p++) {
      for (const r of relations) {
        const fi = idx[r.from], ti = idx[r.to];
        if (fi === undefined || ti === undefined) continue;
        const push = r.sign * r.strength * (out[fi] - 0.5) * 0.55;
        out[ti] = clamp(out[ti] + push / passes, 0, 1);
      }
    }
    return out;
  }

  const IMPACT_W = [0.5, 1.0, 1.6];   // bajo, medio, alto
  const UNC_NOISE = [2.5, 5, 8.5];    // ruido según incertidumbre

  // ---------- simulación de un mundo (modo deep) ----------
  function simulateWorld(world, variables, relations, N, target) {
    const scores = [];
    const samples = variables.map(() => []);
    let avgUnc = 0;
    variables.forEach(v => avgUnc += (v.uncertainty ?? 1));
    avgUnc = variables.length ? avgUnc / variables.length : 1;

    for (let n = 0; n < N; n++) {
      let raw = variables.map(sampleVar);
      raw = propagate(raw, variables, relations);
      let score = 50;
      variables.forEach((v, i) => {
        const eff = (world.effects && world.effects[v.id]) || 0;   // -2..2
        const w = IMPACT_W[v.impact ?? 1];
        score += eff * (raw[i] - 0.5) * 24 * w;
        samples[i].push(raw[i]);
      });
      score += gaussian() * UNC_NOISE[Math.round(clamp(avgUnc, 0, 2))];
      scores.push(clamp(score, 0, 100));
    }

    const sorted = scores.slice().sort((a, b) => a - b);
    const sens = variables.map((v, i) => ({
      id: v.id, name: v.name,
      corr: pearson(samples[i], scores)
    }));

    return {
      worldId: world.id,
      scores,
      median: quantile(sorted, 0.5),
      p10: quantile(sorted, 0.10),
      p90: quantile(sorted, 0.90),
      probTarget: scores.filter(s => s >= target).length / N * 100,
      stability: clamp(100 - (quantile(sorted, 0.90) - quantile(sorted, 0.10)), 0, 100),
      sensitivity: sens
    };
  }

  // ---------- simulación de un mundo (modo quick) ----------
  function simulateQuickWorld(world, N, target) {
    const q = world.quick || { potential: 5, risk: 5, reversibility: 5 };
    const base = 50 + (q.potential - 5) * 5 - (q.risk - 5) * 2.2 + (q.reversibility - 5) * 1.4;
    const spread = 4 + q.risk * 1.5;
    const scores = [];
    for (let n = 0; n < N; n++) scores.push(clamp(base + gaussian() * spread, 0, 100));
    const sorted = scores.slice().sort((a, b) => a - b);
    return {
      worldId: world.id, scores,
      median: quantile(sorted, 0.5),
      p10: quantile(sorted, 0.10),
      p90: quantile(sorted, 0.90),
      probTarget: scores.filter(s => s >= target).length / N * 100,
      stability: clamp(100 - (quantile(sorted, 0.90) - quantile(sorted, 0.10)), 0, 100),
      sensitivity: []
    };
  }

  // ---------- simulación completa de una bifurcación ----------
  function simulate(fork, N = 1000) {
    const target = fork.targetScore ?? 60;
    const results = {};
    for (const w of fork.worlds) {
      results[w.id] = fork.mode === 'deep' && fork.variables?.length
        ? simulateWorld(w, fork.variables, fork.relations || [], N, target)
        : simulateQuickWorld(w, N, target);
    }

    // Butterfly Variable: mayor |correlación| en cualquier mundo
    let butterfly = null;
    if (fork.mode === 'deep') {
      let best = 0;
      for (const w of fork.worlds) {
        for (const s of results[w.id].sensitivity) {
          if (Math.abs(s.corr) > best) {
            best = Math.abs(s.corr);
            butterfly = { ...s, worldId: w.id, abs: best };
          }
        }
      }
    }

    // divergencia: diferencia máxima de medianas entre mundos
    const medians = fork.worlds.map(w => results[w.id].median);
    const divergence = Math.max(...medians) - Math.min(...medians);

    return { at: Date.now(), N, target, results, butterfly, divergence };
  }

  // ---------- lectura narrativa (español) ----------
  function narrate(fork, sim) {
    const ws = fork.worlds.map(w => ({ w, r: sim.results[w.id] }));
    ws.sort((a, b) => b.r.median - a.r.median);
    const top = ws[0], second = ws[1];
    if (!second) return `${top.w.name} produce una mediana de ${top.r.median.toFixed(0)} puntos.`;

    let txt = `${top.w.name} tiene el mayor potencial (mediana ${top.r.median.toFixed(0)}, mejor 10% llega a ${top.r.p90.toFixed(0)})`;
    if (sim.butterfly && sim.butterfly.worldId === top.w.id) {
      txt += `, pero sus resultados dependen mucho de la variable “${sim.butterfly.name}”`;
    }
    if (second.r.p90 < top.r.p90) {
      txt += `. ${second.w.name} tiene menor beneficio máximo (${second.r.p90.toFixed(0)})`;
    } else {
      txt += `. ${second.w.name} tiene un techo similar o mayor (${second.r.p90.toFixed(0)})`;
    }
    if (second.r.stability > top.r.stability + 5) {
      txt += `, pero produce resultados más estables (estabilidad ${second.r.stability.toFixed(0)} vs ${top.r.stability.toFixed(0)})`;
    }
    txt += `. Ninguna probabilidad aquí es un hecho: son las consecuencias internas de tus propios supuestos.`;
    return txt;
  }

  // ---------- What must be true ----------
  // Para cada variable sensible del mundo, busca el umbral normalizado
  // que hace que la mediana alcance el objetivo.
  function whatMustBeTrue(fork, worldId, N = 400) {
    if (fork.mode !== 'deep' || !fork.variables?.length) return [];
    const world = fork.worlds.find(w => w.id === worldId);
    if (!world) return [];
    const target = fork.targetScore ?? 60;
    const conditions = [];

    const baseSim = simulateWorld(world, fork.variables, fork.relations || [], N, target);

    for (const v of fork.variables) {
      const eff = (world.effects && world.effects[v.id]) || 0;
      if (Math.abs(eff) < 0.25) continue;

      // mediana condicionada fijando la variable en x
      const medianAt = (x) => {
        const scores = [];
        for (let n = 0; n < 220; n++) {
          let raw = fork.variables.map(vv => vv.id === v.id ? x : sampleVar(vv));
          raw = propagate(raw, fork.variables, fork.relations || []);
          let score = 50;
          fork.variables.forEach((vv, i) => {
            const e2 = (world.effects && world.effects[vv.id]) || 0;
            score += e2 * (raw[i] - 0.5) * 24 * IMPACT_W[vv.impact ?? 1];
          });
          scores.push(clamp(score, 0, 100));
        }
        scores.sort((a, b) => a - b);
        return quantile(scores, 0.5);
      };

      const mLow = medianAt(0), mHigh = medianAt(1);
      const rising = mHigh >= mLow;
      if (Math.max(mLow, mHigh) < target) {
        conditions.push({
          variable: v, achievable: false, rising,
          text: `Ni el mejor valor de “${v.name}” alcanza el objetivo por sí solo: este mundo necesita que varias cosas salgan bien a la vez.`
        });
        continue;
      }
      if (Math.min(mLow, mHigh) >= target) continue; // no restringe

      // búsqueda binaria del umbral
      let lo = 0, hi = 1;
      for (let it = 0; it < 12; it++) {
        const mid = (lo + hi) / 2;
        const m = medianAt(mid);
        if (rising ? m >= target : m < target) hi = mid; else lo = mid;
      }
      const xStar = (lo + hi) / 2;
      const real = denorm(v, xStar);
      const unit = (v.type === 'boolean' || v.type === 'prob') ? '%' : '';
      conditions.push({
        variable: v, achievable: true, rising, threshold: real,
        text: rising
          ? `“${v.name}” debe estar en al menos ${fmtNum(real)}${unit} para que este mundo alcance el objetivo.`
          : `“${v.name}” debe mantenerse por debajo de ${fmtNum(real)}${unit} para que este mundo alcance el objetivo.`
      });
    }
    conditions.sort((a, b) => (b.achievable ? 1 : 0) - (a.achievable ? 1 : 0));
    return { baseMedian: baseSim.median, target, conditions };
  }

  function fmtNum(x) {
    return Math.abs(x) >= 100 ? Math.round(x).toLocaleString('es') : (Math.round(x * 10) / 10).toLocaleString('es');
  }

  // ---------- trayectorias para el gráfico de divergencia ----------
  // Genera caminos por mundo: empiezan juntos y divergen hacia su score.
  function trajectories(fork, sim, pathsPerWorld = 26, steps = 60) {
    const out = {};
    for (const w of fork.worlds) {
      const r = sim.results[w.id];
      const paths = [];
      for (let p = 0; p < pathsPerWorld; p++) {
        const final = r.scores[Math.floor(Math.random() * r.scores.length)];
        const pts = [];
        let wiggle = 0;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const ease = t * t * (3 - 2 * t);          // divergen despacio, luego más
          wiggle = wiggle * 0.9 + gaussian() * 0.9;
          const y = 50 + (final - 50) * ease + wiggle * Math.sqrt(t) * 1.6;
          pts.push(clamp(y, 0, 100));
        }
        paths.push(pts);
      }
      // camino mediano
      const medianPath = [];
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, ease = t * t * (3 - 2 * t);
        medianPath.push(50 + (r.median - 50) * ease);
      }
      out[w.id] = { paths, medianPath };
    }
    return out;
  }

  // ---------- calibración ----------
  // Compara la mediana predicha del mundo elegido con el resultado real (0-10 → 0-100).
  function calibration(forks) {
    const entries = [];
    for (const f of forks) {
      if (!f.outcome || !f.simulation) continue;
      const r = f.simulation.results?.[f.outcome.chosenWorldId];
      if (!r) continue;
      entries.push({
        fork: f,
        predicted: r.median,
        actual: f.outcome.rating * 10,
        error: f.outcome.rating * 10 - r.median
      });
    }
    if (!entries.length) return { score: null, entries: [], patterns: [] };

    const absErr = entries.reduce((a, e) => a + Math.abs(e.error), 0) / entries.length;
    const bias = entries.reduce((a, e) => a + e.error, 0) / entries.length;
    const score = clamp(Math.round(100 - absErr * 1.8), 0, 100);

    const patterns = [];
    if (entries.length >= 2) {
      if (bias < -8) patterns.push('Tendés a imaginar futuros mejores de los que luego vivís: tus estimaciones son optimistas en promedio ' + Math.abs(bias).toFixed(0) + ' puntos.');
      else if (bias > 8) patterns.push('Tendés a subestimar tus resultados: la realidad te sale mejor que tus simulaciones (+' + bias.toFixed(0) + ' puntos en promedio).');
      else patterns.push('Tus estimaciones están bien centradas: el error promedio es bajo y sin sesgo claro.');
    }
    const reversibles = entries.filter(e => {
      const w = e.fork.worlds.find(x => x.id === e.fork.outcome.chosenWorldId);
      return w && (w.quick?.reversibility ?? 5) >= 7;
    });
    if (reversibles.length >= 2) {
      const avg = reversibles.reduce((a, e) => a + e.actual, 0) / reversibles.length;
      if (avg >= 65) patterns.push('Las decisiones reversibles suelen salirte bien: promedio real de ' + avg.toFixed(0) + ' puntos.');
   }
    return { score, entries, patterns, bias };
  }

  return { simulate, narrate, whatMustBeTrue, trajectories, calibration, denorm, fmtNum };
})();
