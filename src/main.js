// -------------------------------------------------------------
// main.js — ponto de entrada: estado, UI e loop de animação
// -------------------------------------------------------------
import { REAL_STARS } from './data/stars-catalog.js';
import { CONSTELLATION_LINES } from './data/constellations.js';
import { MILKY_WAY_BANDS } from './data/milky-way.js';
import { getLST, raToRad, decToRad, domeGeometry } from './astro.js';
import { getVisiblePlanets } from './planets.js';
import {
    drawMilkyWay, drawStars, drawConstellationLines,
    drawAltitudeMarkings, drawHorizonAndCardinals, drawMoon, drawPlanets
} from './render.js';

const canvas = document.getElementById('galaxy-canvas');
const ctx = canvas.getContext('2d');
let w, h;

// -------------------------------
// ESTADO DO OBSERVADOR
// -------------------------------
let observerLatDeg = -23;
let observerLonDeg = -46;
let observerLat = observerLatDeg * Math.PI / 180;
let simSpeed = 600;
let simTime = new Date();
let LST = getLST(simTime, observerLonDeg);

// -------------------------------
// CATÁLOGO DE ESTRELAS
// REAL_STARS vem no formato compacto [ra, dec, mag, cor, nome]
// -------------------------------
const stars = REAL_STARS.map(([ra, dec, mag, color, name], i) => ({
    ra, dec, mag, color,
    name: name || null,
    seed: i * 12.9898 % 1000
}));

// -------------------------------
// LUA (posição aproximada, não é efeméride precisa)
// -------------------------------
let moonRA = raToRad(10);
let moonDec = decToRad(-20);

function updateMoonPosition(dtSimMs) {
    const degPerMs = 13.2 / 86400000; // ~13.2°/dia contra as estrelas
    moonRA += (degPerMs * Math.PI / 180) * dtSimMs;
    if (moonRA > 2 * Math.PI) moonRA -= 2 * Math.PI;
}

// -------------------------------
// UI
// -------------------------------
const dtInput = document.getElementById('dtInput');
const latInput = document.getElementById('latInput');
const lonInput = document.getElementById('lonInput');
const speedInput = document.getElementById('speedInput');
const nowBtn = document.getElementById('nowBtn');
const infoBox = document.getElementById('info');

function toLocalInputValue(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function setNow() {
    simTime = new Date();
    dtInput.value = toLocalInputValue(simTime);
}
setNow();

dtInput.addEventListener('change', () => {
    if (dtInput.value) simTime = new Date(dtInput.value);
});
latInput.addEventListener('input', () => {
    observerLatDeg = parseFloat(latInput.value) || 0;
    observerLat = observerLatDeg * Math.PI / 180;
});
lonInput.addEventListener('input', () => {
    observerLonDeg = parseFloat(lonInput.value) || 0;
});
speedInput.addEventListener('change', () => {
    simSpeed = parseFloat(speedInput.value);
});
nowBtn.addEventListener('click', setNow);

// Painel educativo (recolhível, ocupa a margem fora do domo)
const eduPanel = document.getElementById('edu-panel');
const eduToggle = document.getElementById('eduToggle');
eduToggle.addEventListener('click', () => {
    const collapsed = eduPanel.classList.toggle('collapsed');
    eduToggle.textContent = collapsed ? '+' : '−';
    eduToggle.setAttribute('aria-label', collapsed ? 'Expandir painel' : 'Recolher painel');
});

// -------------------------------
// DESENHO PRINCIPAL
// -------------------------------
function drawSky(nowMs) {
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, w, h);

    const { cx, cy, R } = domeGeometry(w, h);

    // Área "abaixo do horizonte" (fora do domo) — sutilmente mais escura,
    // só pra deixar claro que ali não é céu.
    ctx.save();
    ctx.fillStyle = '#04060b';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(cx, cy, R, 0, 2 * Math.PI, true);
    ctx.fill('evenodd');
    ctx.restore();

    // Recorta o desenho do céu dentro do círculo do domo — evita ter que
    // filtrar manualmente cada ponto abaixo do horizonte.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.clip();

    drawMilkyWay(ctx, MILKY_WAY_BANDS, w, h, LST, observerLat);

    const projectedStars = drawStars(ctx, stars, w, h, LST, observerLat, nowMs);

    const planets = getVisiblePlanets(simTime);
    const projectedPlanets = drawPlanets(ctx, planets, w, h, LST, observerLat, nowMs);

    const moonInfo = drawMoon(ctx, w, h, LST, observerLat, { ra: moonRA, dec: moonDec }, simTime);

    drawConstellationLines(ctx, projectedStars, CONSTELLATION_LINES);

    ctx.restore(); // fim do recorte do domo

    drawHorizonAndCardinals(ctx, w, h);
    drawAltitudeMarkings(ctx, w, h);

    return { moonInfo, visiblePlanetsCount: Object.keys(projectedPlanets).length };
}

// -------------------------------
// LOOP DE ANIMAÇÃO
// -------------------------------
let lastTs = null;

function animate(ts) {
    if (lastTs === null) lastTs = ts;
    const dtRealMs = ts - lastTs;
    lastTs = ts;

    const dtSimMs = dtRealMs * simSpeed;
    simTime = new Date(simTime.getTime() + dtSimMs);

    LST = getLST(simTime, observerLonDeg);
    updateMoonPosition(dtSimMs);

    const { moonInfo, visiblePlanetsCount } = drawSky(ts);

    const illumPct = moonInfo ? Math.round(moonInfo.illum * 100) : 0;
    infoBox.textContent = simTime.toLocaleString('pt-BR') +
        (moonInfo ? ` · Lua: ${illumPct}% iluminada` : ' · Lua abaixo do horizonte') +
        ` · ${stars.length} estrelas · ${visiblePlanetsCount} planeta(s) visível(is)`;

    requestAnimationFrame(animate);
}

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(animate);
