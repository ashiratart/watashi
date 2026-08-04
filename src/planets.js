// -------------------------------------------------------------
// planets.js — posição real dos planetas visíveis a olho nu
//
// Método: elementos orbitais keplerianos (ORBITAL_ELEMENTS) →
// posição heliocêntrica na órbita → rotação para o plano eclíptico →
// subtração da posição da Terra (geocentro) → rotação para
// equatorial (RA/Dec) via obliquidade da eclíptica.
//
// Essa é a mesma técnica usada em efemérides de baixa precisão
// (erro tipicamente < 1 arco-minuto entre 1800-2050).
// -------------------------------------------------------------
import { ORBITAL_ELEMENTS } from './data/orbital-elements.js';

const DEG = Math.PI / 180;
const OBLIQUITY_J2000 = 23.43929111 * DEG;

function dateToJulianCenturies(date) {
    const JD = date.getTime() / 86400000 + 2440587.5;
    return (JD - 2451545.0) / 36525;
}

// Resolve a equação de Kepler M = E - e*sin(E) para E, via Newton-Raphson.
// M e o retorno estão em radianos.
function solveKepler(M, e) {
    let E = M;
    for (let i = 0; i < 12; i++) {
        const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= dE;
        if (Math.abs(dE) < 1e-10) break;
    }
    return E;
}

function normalizeDeg180(deg) {
    return ((deg + 180) % 360 + 360) % 360 - 180;
}

// Retorna a posição heliocêntrica (x,y,z) em UA, no plano eclíptico J2000.
function heliocentricPosition(elements, T) {
    const a = elements.a[0] + elements.a[1] * T;
    const e = elements.e[0] + elements.e[1] * T;
    const Ideg = elements.I[0] + elements.I[1] * T;
    const Ldeg = elements.L[0] + elements.L[1] * T;
    const periDeg = elements.peri[0] + elements.peri[1] * T;
    const nodeDeg = elements.node[0] + elements.node[1] * T;

    const I = Ideg * DEG;
    const peri = periDeg * DEG;
    const node = nodeDeg * DEG;

    const Mdeg = normalizeDeg180(Ldeg - periDeg);
    const M = Mdeg * DEG;
    const E = solveKepler(M, e);

    // Posição no plano orbital
    const xOrb = a * (Math.cos(E) - e);
    const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

    // Rotação: argumento do periélio (w), inclinação (I), nó ascendente (node)
    const w = peri - node;
    const cosW = Math.cos(w), sinW = Math.sin(w);
    const cosO = Math.cos(node), sinO = Math.sin(node);
    const cosI = Math.cos(I), sinI = Math.sin(I);

    const x = (cosW * cosO - sinW * sinO * cosI) * xOrb + (-sinW * cosO - cosW * sinO * cosI) * yOrb;
    const y = (cosW * sinO + sinW * cosO * cosI) * xOrb + (-sinW * sinO + cosW * cosO * cosI) * yOrb;
    const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

    return { x, y, z };
}

// -------------------------------------------------------------
// MAGNITUDE APARENTE REAL (Meeus, "Astronomical Algorithms", cap. 41-42)
//
// Depende de três grandezas:
//   r = distância heliocêntrica do planeta (Sol → planeta), em UA
//   Δ = distância geocêntrica do planeta (Terra → planeta), em UA
//   i = ângulo de fase (Sol-planeta-Terra), em graus — o quanto do
//       disco iluminado do planeta vemos da Terra, análogo à fase da Lua.
//
// Cada planeta tem coeficientes próprios calibrados observacionalmente.
// Saturno tem uma contribuição extra do brilho dos anéis, que aqui é
// simplificada (omite a inclinação exata dos anéis vista da Terra);
// na prática o brilho real de Saturno pode variar ~±0.9 mag em torno
// do valor calculado, conforme os anéis estejam mais "de frente" ou
// "de perfil" para nós.
// -------------------------------------------------------------
function phaseAngleDeg(r, delta, R) {
    let cosI = (r * r + delta * delta - R * R) / (2 * r * delta);
    cosI = Math.max(-1, Math.min(1, cosI));
    return Math.acos(cosI) * 180 / Math.PI;
}

function apparentMagnitude(planetKey, r, delta, i) {
    const base5log = 5 * Math.log10(r * delta);
    switch (planetKey) {
        case 'Mercury':
            return -0.42 + base5log + 0.0380 * i - 0.000273 * i * i + 0.000002 * i * i * i;
        case 'Venus':
            return -4.40 + base5log + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i * i * i;
        case 'Mars':
            return -1.52 + base5log + 0.016 * i;
        case 'Jupiter':
            return -9.40 + base5log + 0.005 * i;
        case 'Saturn':
            // Termo de anéis simplificado (contribuição média, sem inclinação real)
            return -8.88 + base5log + 0.044 * (i / 6);
        default:
            return base5log;
    }
}



// RA (radianos), Dec (radianos), distância geocêntrica (UA) e magnitude
// aparente real de um planeta.
function planetEquatorial(planetKey, T) {
    const p = heliocentricPosition(ORBITAL_ELEMENTS[planetKey], T);
    const earth = heliocentricPosition(ORBITAL_ELEMENTS.Earth, T);

    // Vetor geocêntrico eclíptico
    const xg = p.x - earth.x;
    const yg = p.y - earth.y;
    const zg = p.z - earth.z;

    // Eclíptica -> Equatorial
    const xEq = xg;
    const yEq = yg * Math.cos(OBLIQUITY_J2000) - zg * Math.sin(OBLIQUITY_J2000);
    const zEq = yg * Math.sin(OBLIQUITY_J2000) + zg * Math.cos(OBLIQUITY_J2000);

    const delta = Math.sqrt(xEq * xEq + yEq * yEq + zEq * zEq); // distância geocêntrica (Δ)
    let ra = Math.atan2(yEq, xEq);
    if (ra < 0) ra += 2 * Math.PI;
    const dec = Math.asin(zEq / delta);

    const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);          // distância heliocêntrica do planeta
    const R = Math.sqrt(earth.x * earth.x + earth.y * earth.y + earth.z * earth.z); // distância heliocêntrica da Terra

    const i = phaseAngleDeg(r, delta, R);
    const mag = apparentMagnitude(planetKey, r, delta, i);

    return { ra, dec, distanceAU: delta, heliocentricAU: r, phaseAngleDeg: i, magnitude: mag };
}

// Converte magnitude aparente em tamanho de desenho (px). Não é uma escala
// física real (planetas são fontes pontuais a olho nu) — é uma curva
// perceptual pra que Vênus pareça bem mais proeminente que Saturno, por
// exemplo, do mesmo jeito que o olho humano percebe essa diferença de brilho.
function magnitudeToSize(mag) {
    let size = 6.8 - mag * 0.85;
    size = Math.max(size, 1.6);
    size = Math.min(size, 10);
    return size;
}

// Retorna a lista de planetas visíveis (Mercúrio a Saturno) com
// RA em horas e Dec em graus, no mesmo formato usado pelo catálogo
// de estrelas — pronto para passar por equatorialToHorizontal().
export function getVisiblePlanets(date) {
    const T = dateToJulianCenturies(date);
    const keys = Object.keys(ORBITAL_ELEMENTS).filter(k => k !== 'Earth');

    return keys.map(key => {
        const { ra, dec, distanceAU, magnitude, phaseAngleDeg: phase } = planetEquatorial(key, T);
        const el = ORBITAL_ELEMENTS[key];
        return {
            key,
            name: el.label,
            ra: ra * 12 / Math.PI,    // radianos -> horas
            dec: dec * 180 / Math.PI, // radianos -> graus
            color: el.color,
            distanceAU,
            magnitude,
            phaseAngleDeg: phase,
            size: magnitudeToSize(magnitude)
        };
    });
}
