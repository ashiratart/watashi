// -------------------------------------------------------------
// astro.js — matemática de posicionamento astronômico
// -------------------------------------------------------------

export function raToRad(raHours) {
    return (raHours * 15) * Math.PI / 180;
}

export function decToRad(decDeg) {
    return decDeg * Math.PI / 180;
}

export function dateToJD(date) {
    return date.getTime() / 86400000 + 2440587.5;
}

// Tempo sideral local real (GMST + longitude do observador)
export function getLST(date, lonDeg) {
    const JD = dateToJD(date);
    const T = (JD - 2451545.0) / 36525;
    let GMSTdeg = 280.46061837
                + 360.98564736629 * (JD - 2451545.0)
                + 0.000387933 * T * T
                - (T * T * T) / 38710000;
    GMSTdeg = ((GMSTdeg % 360) + 360) % 360;
    const LSTdeg = (GMSTdeg + lonDeg + 360) % 360;
    return LSTdeg * Math.PI / 180;
}

// Converte coordenadas equatoriais (RA/Dec) para horizontais (alt/az)
// dado o tempo sideral local (LST) e a latitude do observador, ambos em radianos.
export function equatorialToHorizontal(ra, dec, lst, observerLat) {
    const H = lst - ra;
    const alt = Math.asin(
        Math.sin(dec) * Math.sin(observerLat) +
        Math.cos(dec) * Math.cos(observerLat) * Math.cos(H)
    );
    let cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(observerLat)) /
                (Math.cos(alt) * Math.cos(observerLat));
    cosAz = Math.max(-1, Math.min(1, cosAz));
    let az = Math.acos(cosAz);
    if (Math.sin(H) > 0) az = 2 * Math.PI - az;
    return { alt, az };
}

// Projeção: horizonte na base (y = h), zênite no topo (y = 0), sul centralizado.
export function project(alt, az, w, h) {
    const x = (az * w / (2 * Math.PI) + w / 2) % w;
    const y = h * (1 - alt / (Math.PI / 2));
    return { x, y };
}

// --- Extinção atmosférica ---
// Estrelas perto do horizonte atravessam mais atmosfera e ficam mais fracas.
export function airmass(altRad) {
    const altDeg = altRad * 180 / Math.PI;
    if (altDeg < 3) return 20;
    return 1 / (Math.sin(altRad) + 0.50572 * Math.pow(altDeg + 6.07995, -1.6364));
}

export function extinctionFactor(altRad, k = 0.28) {
    const X = airmass(altRad);
    return Math.pow(10, -0.4 * k * (X - 1));
}

// --- Cintilação ---
// Oscilação de brilho mais forte perto do horizonte, quase nula no zênite.
export function twinkleFactor(seed, tMs, altRad) {
    const amount = 0.15 + 0.35 * (1 - Math.sin(Math.max(altRad, 0.01)));
    return 1 + amount * Math.sin(tMs * 0.006 + seed);
}

// --- Fase lunar ---
// Fração iluminada e crescente/minguante a partir do ciclo sinódico real (~29.53 dias),
// contado desde uma lua nova de referência conhecida (6/jan/2000, 18:14 UTC).
export function getMoonPhase(date) {
    const synodic = 29.530588853;
    const refNewMoonS = Date.UTC(2000, 0, 6, 18, 14) / 1000;
    const nowS = date.getTime() / 1000;
    const daysSince = (nowS - refNewMoonS) / 86400;
    const age = ((daysSince % synodic) + synodic) % synodic;
    const phaseFrac = age / synodic; // 0 = nova, 0.5 = cheia
    const illum = (1 - Math.cos(2 * Math.PI * phaseFrac)) / 2;
    return { phaseFrac, illum, waxing: phaseFrac < 0.5, age };
}
