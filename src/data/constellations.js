// Linhas de constelações.
// Os nomes abaixo foram conferidos contra o campo "proper"/"bayer" real
// do catálogo (src/data/stars-catalog.js) por proximidade de coordenadas —
// nem toda estrela tem nome próprio consagrado, então algumas aparecem
// com designação Bayer abreviada (ex: "Gam Cen", "Fang").

export const CONSTELLATION_LINES = {
    Crux: [
        ["Gacrux", "Acrux"],
        ["Imai", "Ginan"],
        ["Mimosa", "Acrux"]
    ],
    Centaurus: [
        ["Rigil Kentaurus", "Hadar"],
        ["Hadar", "Gam Cen"],
        ["Gam Cen", "Menkent"],
        ["Menkent", "Rigil Kentaurus"]
    ],
    Carina: [
        ["Canopus", "Miaplacidus"],
        ["Miaplacidus", "Aspidiske"],
        ["Aspidiske", "Avior"],
        ["Avior", "Canopus"]
    ],
    Vela: [
        ["Gam2Vel", "Markeb"],
        ["Markeb", "Alsephina"],
        ["Alsephina", "Gam2Vel"]
    ],
    Scorpius: [
        ["Antares", "Dschubba"],
        ["Dschubba", "Fang"],
        ["Fang", "Antares"],
        ["Antares", "Sargas"],
        ["Sargas", "Shaula"]
    ],
    Sagittarius: [
        ["Kaus Australis", "Kaus Media"],
        ["Kaus Media", "Ascella"],
        ["Ascella", "Nunki"],
        ["Nunki", "Kaus Australis"]
    ],
    TriangulumAustrale: [
        ["Atria", "Bet TrA"],
        ["Bet TrA", "Gam TrA"],
        ["Gam TrA", "Atria"]
    ]
};

// Estrelas que vale destacar com rótulo, caso queira exibir nomes no céu futuramente.
export const HIGHLIGHT_STARS = [
    "Sirius", "Canopus", "Rigil Kentaurus", "Achernar", "Fomalhaut", "Peacock"
];
