// -------------------------------------------------------------
// render.js — desenho no canvas
// -------------------------------------------------------------
import {
    equatorialToHorizontal, project, raToRad, decToRad,
    extinctionFactor, twinkleFactor, getMoonPhase
} from './astro.js';

// Estilo visual de cada nível de densidade real da Via Láctea, do mais
// fraco/largo (ol1, halo externo) ao mais brilhante/estreito (ol5, núcleo
// em Sagitário/Escorpião/Carina). Valores de cor/largura são artísticos;
// a FORMA vem de dados reais (ver src/data/milky-way.js).
const MW_BAND_STYLE = {
    ol1: { rgb: '210,220,255', width: 55, blur: 45, alpha: 0.05 },
    ol2: { rgb: '215,220,255', width: 40, blur: 35, alpha: 0.06 },
    ol3: { rgb: '225,225,255', width: 28, blur: 26, alpha: 0.08 },
    ol4: { rgb: '235,230,250', width: 18, blur: 18, alpha: 0.11 },
    ol5: { rgb: '255,250,240', width: 10, blur: 12, alpha: 0.16 }
};

// bands: MILKY_WAY_BANDS de src/data/milky-way.js — cada anel em [ra_horas, dec_graus]
export function drawMilkyWay(ctx, bands, w, h, lst, observerLat) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const band of bands) {
        const style = MW_BAND_STYLE[band.id];
        if (!style) continue;

        ctx.strokeStyle = `rgba(${style.rgb}, ${style.alpha})`;
        ctx.lineWidth = style.width;
        ctx.shadowColor = `rgba(${style.rgb}, ${style.alpha * 1.5})`;
        ctx.shadowBlur = style.blur;

        for (const ring of band.rings) {
            ctx.beginPath();
            let prevX = null;

            for (const [raHours, decDeg] of ring) {
                const ra = raToRad(raHours);
                const dec = decToRad(decDeg);
                const { alt, az } = equatorialToHorizontal(ra, dec, lst, observerLat);
                const { x, y } = project(alt, az, w, h);

                // Quebra o traço quando o ponto "pula" pro outro lado do canvas
                // (costura em RA=0h/24h da projeção equirretangular).
                if (prevX === null || Math.abs(x - prevX) > w / 2) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                prevX = x;
            }
            ctx.stroke();
        }
    }

    ctx.restore();
}

// stars: array de objetos { ra, dec, mag, color, seed, name? } já normalizado
// (ra em horas, dec em graus — a conversão é feita aqui)
export function drawStars(ctx, stars, w, h, lst, observerLat, nowMs) {
    const projected = {};

    for (const s of stars) {
        const ra = raToRad(s.ra);
        const dec = decToRad(s.dec);
        const { alt, az } = equatorialToHorizontal(ra, dec, lst, observerLat);
        if (alt <= 0) continue;

        const { x, y } = project(alt, az, w, h);
        let size = 5 - (s.mag ?? 5);
        if (s.mag < 0) size = 7;
        size = Math.max(size, 1.0);
        size = Math.min(size, 6);

        const ext = extinctionFactor(alt);
        const twk = twinkleFactor(s.seed, nowMs, alt);

        ctx.globalAlpha = Math.max(0, Math.min(1, 0.9 * ext * twk));
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = s.color || 'white';
        ctx.fill();

        if (s.name) projected[s.name] = { x, y };
    }
    ctx.globalAlpha = 1;
    return projected;
}

export function drawConstellationLines(ctx, projectedStars, constellationLines) {
    ctx.strokeStyle = 'rgba(180,220,255,0.6)';
    ctx.lineWidth = 1.5;
    for (const constName in constellationLines) {
        for (const [a, b] of constellationLines[constName]) {
            if (projectedStars[a] && projectedStars[b]) {
                ctx.beginPath();
                ctx.moveTo(projectedStars[a].x, projectedStars[a].y);
                ctx.lineTo(projectedStars[b].x, projectedStars[b].y);
                ctx.stroke();
            }
        }
    }
}

export function drawAltitudeMarkings(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#8a7a5a';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    const altitudes = [30, 60];
    altitudes.forEach(deg => {
        const alt = deg * Math.PI / 180;
        const y = h * (1 - alt / (Math.PI / 2));
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    });

    ctx.setLineDash([]);
    ctx.globalAlpha = 0.8;
    ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = '#d4c4a4';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    altitudes.forEach(deg => {
        const alt = deg * Math.PI / 180;
        const y = h * (1 - alt / (Math.PI / 2));
        if (y > 20 && y < h - 20) ctx.fillText(deg + '°', 30, y);
    });

    ctx.beginPath();
    ctx.arc(30, 10, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffecb3';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Zênite', 30, 30);

    ctx.shadowBlur = 0;
    ctx.restore();
}

export function drawHorizonAndCardinals(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(160, 120, 60, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    const cardinals = [
        { name: 'N', az: 0 },
        { name: 'L', az: Math.PI / 2 },
        { name: 'S', az: Math.PI },
        { name: 'O', az: 3 * Math.PI / 2 }
    ];

    ctx.font = "bold 16px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = '#c0b090';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    cardinals.forEach(c => {
        const { x } = project(0, c.az, w, h);
        const y = h;
        ctx.beginPath();
        ctx.arc(x, y - 10, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#a58e6d';
        ctx.fill();
        ctx.fillStyle = '#ffecb3';
        ctx.fillText(c.name, x, y - 30);
    });

    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawMoonDisc(ctx, x, y, r, phaseFrac, illum, waxing) {
    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.clip();

    ctx.fillStyle = '#0d1220';
    ctx.fillRect(-r, -r, r * 2, r * 2);

    ctx.beginPath();
    if (waxing) {
        ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
    } else {
        ctx.arc(0, 0, r, Math.PI / 2, -Math.PI / 2);
    }
    ctx.fillStyle = '#f0e6c0';
    ctx.fill();

    const k = Math.abs(Math.cos(phaseFrac * 2 * Math.PI));
    ctx.beginPath();
    ctx.ellipse(0, 0, r * k, r, 0, 0, 2 * Math.PI);
    ctx.fillStyle = illum > 0.5 ? '#f0e6c0' : '#0d1220';
    ctx.fill();

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#a09070';
    ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.2, r * 0.15, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.35, r * 0.25, r * 0.18, 0, 2 * Math.PI); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
}

// planets: array no formato retornado por getVisiblePlanets() (src/planets.js)
// — ra em horas, dec em graus, mesmo padrão do catálogo de estrelas.
export function drawPlanets(ctx, planets, w, h, lst, observerLat, nowMs) {
    const projected = {};

    for (const p of planets) {
        const ra = raToRad(p.ra);
        const dec = decToRad(p.dec);
        const { alt, az } = equatorialToHorizontal(ra, dec, lst, observerLat);
        if (alt <= 0) continue;

        const { x, y } = project(alt, az, w, h);
        const ext = extinctionFactor(alt);
        const twk = twinkleFactor(p.key.length * 17, nowMs, alt); // cintilação bem sutil
        const size = p.size;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, ext * (0.75 + 0.25 * twk)));

        // Leve glow — planetas não "piscam" como estrelas, brilham de forma mais estável
        ctx.shadowColor = p.color;
        ctx.shadowBlur = size * 2.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Rótulo do nome
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(0.85, ext));
        ctx.font = "11px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = '#dfe6f5';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, x, y - size - 8);
        ctx.restore();

        projected[p.name] = { x, y };
    }
    ctx.globalAlpha = 1;
    return projected;
}

// moonPos: { ra, dec } em radianos já calculados pelo chamador
export function drawMoon(ctx, w, h, lst, observerLat, moonPos, simTime) {
    const { alt, az } = equatorialToHorizontal(moonPos.ra, moonPos.dec, lst, observerLat);
    if (alt <= 0) return null;

    const { x, y } = project(alt, az, w, h);
    const moonSize = 25;
    const { phaseFrac, illum, waxing, age } = getMoonPhase(simTime);

    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 200, 0.8)';
    ctx.shadowBlur = 25 + 15 * illum;
    ctx.beginPath();
    ctx.arc(x, y, moonSize * 0.9, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 220, ${0.15 + 0.2 * illum})`;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    drawMoonDisc(ctx, x, y, moonSize, phaseFrac, illum, waxing);

    return { illum, age };
}
