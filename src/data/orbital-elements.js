// -------------------------------------------------------------
// orbital-elements.js — elementos keplerianos de baixa precisão
// Fonte: Standish, E.M. (1992) / JPL "Keplerian Elements for
// Approximate Positions of the Major Planets", válidos com boa
// precisão (~1 arcmin) para o intervalo 1800-2050.
//
// Cada elemento é dado como [valor_em_J2000, taxa_por_século_juliano].
// Ângulos em graus, semi-eixo maior (a) em UA.
// -------------------------------------------------------------

export const ORBITAL_ELEMENTS = {
    Mercury: {
        label: 'Mercúrio',
        a:    [0.38709927,    0.00000037],
        e:    [0.20563593,    0.00001906],
        I:    [7.00497902,   -0.00594749],
        L:    [252.25032350, 149472.67411175],
        peri: [77.45779628,   0.16047689],
        node: [48.33076593,  -0.12534081],
        color: '#b7b2a8',
    },
    Venus: {
        label: 'Vênus',
        a:    [0.72333566,    0.00000390],
        e:    [0.00677672,   -0.00004107],
        I:    [3.39467605,   -0.00078890],
        L:    [181.97909950, 58517.81538729],
        peri: [131.60246718,  0.00268329],
        node: [76.67984255,  -0.27769418],
        color: '#f6ecd0',
    },
    Earth: {
        // Necessário apenas para calcular a posição geocêntrica
        // dos demais planetas (heliocentro da Terra).
        label: 'Terra',
        a:    [1.00000261,    0.00000562],
        e:    [0.01671123,   -0.00004392],
        I:    [-0.00001531,  -0.01294668],
        L:    [100.46457166, 35999.37244981],
        peri: [102.93768193,  0.32327364],
        node: [0.0,            0.0]
    },
    Mars: {
        label: 'Marte',
        a:    [1.52371034,    0.00001847],
        e:    [0.09339410,    0.00007882],
        I:    [1.84969142,   -0.00813131],
        L:    [-4.55343205,  19140.30268499],
        peri: [-23.94362959,  0.44441088],
        node: [49.55953891,  -0.29257343],
        color: '#e2795a',
    },
    Jupiter: {
        label: 'Júpiter',
        a:    [5.20288700,   -0.00011607],
        e:    [0.04838624,   -0.00013253],
        I:    [1.30439695,   -0.00183714],
        L:    [34.39644051,  3034.74612775],
        peri: [14.72847983,   0.21252668],
        node: [100.47390909,  0.20469106],
        color: '#f0dcb8',
    },
    Saturn: {
        label: 'Saturno',
        a:    [9.53667594,   -0.00125060],
        e:    [0.05386179,   -0.00050991],
        I:    [2.48599187,    0.00193609],
        L:    [49.95424423,  1222.49362201],
        peri: [92.59887831,  -0.41897216],
        node: [113.66242448, -0.28867794],
        color: '#e8dcae',
    }
};
