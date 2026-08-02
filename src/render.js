// -------------------------------------------------------------
// render.js — desenho no canvas
// -------------------------------------------------------------
import {
    equatorialToHorizontal, project, raToRad, decToRad,
    extinctionFactor, twinkleFactor, getMoonPhase
} from './astro.js';

export function drawMilkyWay(ctx, w, h, lst, observerLat) {
    const decNGP = 27.13 * Math.PI / 180;
    const raNGP = 192.85 * Math.PI / 180;
    const lStep = 0.02;
    const l0 = 123 * Math.PI / 180;

    ctx.save();
    ctx.globalAlpha = 0.15;

    for (let l = 0; l < 2 * Math.PI; l += lStep) {
        let sinDec = Math.cos(decNGP) * Math.sin(l - l0);
        sinDec = Math.max(-1, Math.min(1, sinDec));
        const dec = Math.asin(sinDec);

        const cosDec = Math.cos(dec);
        let cosDeltaRA = Math.cos(l - l0) / cosDec;
        let sinDeltaRA = -Math.sin(decNGP) * Math.sin(l - l0) / cosDec;
        cosDeltaRA = Math.max(-1, Math.min(1, cosDeltaRA));
        sinDeltaRA = Math.max(-1, Math.min(1, sinDeltaRA));

        let deltaRA = Math.atan2(sinDeltaRA, cosDeltaRA);
        let ra = raNGP + deltaRA;
        if (ra < 0) ra += 2 * Math.PI;
        if (ra > 2 * Math.PI) ra -= 2 * Math.PI;

        const { alt, az } = equatorialToHorizontal(ra, dec, lst, observerLat);
        if (alt > 0) {
            const { x, y } = project(alt, az, w, h);
            const ext = extinctionFactor(alt);
            let size = 40 + 30 * Math.cos(l);
            if (size < 20) size = 20;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(255, 255, 240, ${0.3 * ext})`);
            gradient.addColorStop(0.5, `rgba(200, 200, 255, ${0.1 * ext})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
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
