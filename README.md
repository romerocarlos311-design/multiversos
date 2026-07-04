# WORLDLINE

**Simulador personal de futuros alternativos.** Cada decisión abre líneas temporales; Worldline las modela con causalidad y probabilidades, simula miles de futuros, encuentra la Butterfly Variable y aprende de la distancia entre lo que imaginaste y lo que realmente pasó.

> Mapea futuros. Observa variables. Aprende de tu línea temporal.

## Qué incluye (V1 + V2 + V3 completas)

- **The Nexus** — dashboard con Active Forks, Prime Timeline, Upcoming Observations, Largest Divergence, Butterfly Variable, Calibration y Observatory.
- **Quick Fork** — bifurcaciones en menos de dos minutos: mundos, potencial, riesgo, reversibilidad.
- **Deep Universe** — variables con 5 atributos (valor, rango, control, incertidumbre, impacto), relaciones causales, métricas de "qué significa ganar" y línea de Continuidad.
- **Motor de universos** — simulación Monte Carlo de 1,000 futuros por mundo: mediana, mejor/peor 10%, probabilidad de alcanzar el objetivo, estabilidad.
- **Branch Compare** — gráfico animado de divergencia: los futuros fantasma de cada mundo se separan desde el Nexus Event.
- **Butterfly Variable** — análisis de sensibilidad que identifica la pequeña condición que más dobla tus líneas temporales.
- **What must be true?** — ingeniería inversa del universo deseado: umbrales que cada variable debe cumplir para alcanzar tu objetivo.
- **Causal Field** — mapa interactivo de variables: mové un nodo y mirá propagarse el efecto por la red.
- **Registrar la realidad** — la rama elegida se vuelve Prime Timeline; las demás quedan como Unobserved Worlds. Con el tiempo, calibración y patrones de decisión.
- **Observatory** — journal de libros e ideas (viene precargado con *Mentirosas cuánticas*, *The Singularity Is Nearer*, *The Coming Wave*, *Foundation*, *The Three-Body Problem* y *Project Hail Mary*), conectable con bifurcaciones.
- **PWA** — instalable en iPhone, funciona offline, datos 100% locales, export/import JSON, dark/light mode.

## Deploy en GitHub Pages

1. Creá un repo nuevo (ej. `worldline`) en github.com.
2. Subí todos los archivos de esta carpeta (podés arrastrarlos en *Add file → Upload files*).
3. En el repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. En 1–2 minutos tu app vive en `https://TU-USUARIO.github.io/worldline/`.

Por línea de comandos:

```bash
cd worldline
git init && git add . && git commit -m "Worldline v1"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/worldline.git
git push -u origin main
```

## Instalar en iPhone

1. Abrí la URL en Safari.
2. Compartir → **Agregar a pantalla de inicio**.
3. Se abre a pantalla completa, como app nativa, y funciona sin conexión.

## Nota metodológica

Worldline no adivina el futuro ni afirma que existan universos paralelos observables. El multiverso es lenguaje visual (Everett como inspiración, no como afirmación); los modelos causales y la simulación Monte Carlo son las herramientas operativas (Pearl); y la hipótesis de simulación es contenido filosófico para el Observatory (Bostrom). **Las probabilidades representan tus supuestos, no probabilidades objetivas del mundo real.**

## Estructura

| Archivo | Función |
|---|---|
| `index.html` | Shell de la app y navegación |
| `styles.css` | Sistema visual (oscuro, minimalista, mobile-first) |
| `engine.js` | Monte Carlo, propagación causal, sensibilidad, calibración |
| `app.js` | Vistas, wizard, Causal Field, Observatory, storage |
| `manifest.json` + `service-worker.js` | PWA e instalación offline |

Datos en `localStorage` con respaldo por JSON. Sin cuentas, sin servidores, sin pagos.
