/**
 * PPLA Command Dictionary — Mercury Series
 * Baseado no PPLA Programmer's Manual V1.00
 * Arquivo separado para facilitar manutenção
 */
const PPLA = (() => {
    // ═══════════════════════════════════════════════════
    // CÓDIGOS DE CONTROLE
    // ═══════════════════════════════════════════════════
    const CTRL = {
        SOH: '\x01', STX: '\x02', ESC: '\x1B',
        CR: '\x0D', LF: '\x0A', XON: '\x11', XOFF: '\x13',
        RS: '\x1E', US: '\x1F',
    };

    // ═══════════════════════════════════════════════════
    // FONTES INTERNAS
    // ═══════════════════════════════════════════════════
    const FONTS = {
        '0': { name: 'Font 0 – USASCII', family: '"Courier New",Courier,monospace', baseH: 0.08, wRatio: 0.6, charSet: 'ASCII 21h–7Fh' },
        '1': { name: 'Font 1 – USASCII+Ext', family: '"Courier New",Courier,monospace', baseH: 0.08, wRatio: 0.6, charSet: 'ASCII+Extension' },
        '2': { name: 'Font 2 – USASCII+Ext', family: '"Courier New",Courier,monospace', baseH: 0.12, wRatio: 0.6, charSet: 'ASCII+Extension' },
        '3': { name: 'Font 3 – Alnum Upper', family: '"Courier New",Courier,monospace', baseH: 0.15, wRatio: 0.65, charSet: 'Num+Uppercase' },
        '4': { name: 'Font 4 – Alnum Upper', family: '"Courier New",Courier,monospace', baseH: 0.18, wRatio: 0.65, charSet: 'Num+Uppercase' },
        '5': { name: 'Font 5 – Alnum Upper', family: '"Courier New",Courier,monospace', baseH: 0.22, wRatio: 0.65, charSet: 'Num+Uppercase' },
        '6': { name: 'Font 6 – Alnum Upper', family: '"Courier New",Courier,monospace', baseH: 0.28, wRatio: 0.65, charSet: 'Num+Uppercase' },
        '7': { name: 'Font 7 – OCR-A', family: '"Courier New",monospace', baseH: 0.10, wRatio: 0.6, charSet: 'OCR-A ASCII' },
        '8': { name: 'Font 8 – OCR-B', family: '"Courier New",monospace', baseH: 0.10, wRatio: 0.6, charSet: 'OCR-B+Specials' },
        '9': { name: 'Font 9 – ASD Smooth', family: 'Arial,Helvetica,sans-serif', scalable: true, charSet: 'PC850/WinLatin' },
        ':': { name: 'Courier', family: '"Courier New",Courier,monospace', baseH: 0.12, wRatio: 0.6, charSet: '8 Symbol Sets' },
    };

    // Pontos ASD Smooth
    const ASD_SIZES = {
        'A04': 4, '000': 5, '001': 6, '002': 8, '003': 10,
        '004': 12, '005': 14, '006': 18, '007': 24,
        '008': 30, '009': 36, '010': 48, 'A72': 72,
    };

    const ASD_SYMBOL_SETS = {
        'PM': 'PC850', 'W1': 'Win 3.1 Latin 1', 'WE': 'Win 3.1 Latin 2',
        'WG': 'Win Latin Greek', 'WR': 'Win Latin Cyrillic', 'WT': 'Win 3.1 Latin 5',
    };

    const COURIER_SETS = {
        '000': 'Roman-8', '001': 'ECMA-94', '002': 'PC', '003': 'PC-A',
        '004': 'PC-B', '005': 'Legal', '006': 'Greek', '007': 'Russian',
    };

    // ═══════════════════════════════════════════════════
    // CÓDIGOS DE BARRAS 1D
    // ═══════════════════════════════════════════════════
    const BARCODES = {
        'A': { name: 'Code 3 of 9', variable: true, checksum: false, readable: true },
        'a': { name: 'Code 3 of 9', variable: true, checksum: false, readable: false },
        'B': { name: 'UPC-A', length: 12, checksum: true, readable: true },
        'b': { name: 'UPC-A', length: 12, checksum: true, readable: false },
        'C': { name: 'UPC-E', length: 7, checksum: true, readable: true },
        'c': { name: 'UPC-E', length: 7, checksum: true, readable: false },
        'D': { name: 'Interleaved 2 of 5', variable: true, checksum: false, readable: true },
        'd': { name: 'Interleaved 2 of 5', variable: true, checksum: false, readable: false },
        'E': { name: 'Code 128', variable: true, checksum: true, readable: true },
        'e': { name: 'Code 128', variable: true, checksum: true, readable: false },
        'F': { name: 'EAN-13', length: 13, checksum: true, readable: true },
        'f': { name: 'EAN-13', length: 13, checksum: true, readable: false },
        'G': { name: 'EAN-8', length: 8, checksum: true, readable: true },
        'g': { name: 'EAN-8', length: 8, checksum: true, readable: false },
        'H': { name: 'HBIC', variable: true, checksum: true, readable: true },
        'h': { name: 'HBIC', variable: true, checksum: true, readable: false },
        'I': { name: 'Coda bar', minLen: 3, checksum: false, readable: true },
        'i': { name: 'Coda bar', minLen: 3, checksum: false, readable: false },
        'J': { name: 'I25+Mod10', variable: true, checksum: true, readable: true },
        'j': { name: 'I25+Mod10', variable: true, checksum: true, readable: false },
        'K': { name: 'Plessey', length: '1-14', checksum: true, readable: true },
        'k': { name: 'Plessey', length: '1-14', checksum: true, readable: false },
        'L': { name: 'I25+Mod10+Bearer', variable: true, checksum: true, readable: true },
        'l': { name: 'I25+Mod10+Bearer', variable: true, checksum: true, readable: false },
        'M': { name: 'UPC2', length: 2, checksum: false, readable: true },
        'm': { name: 'UPC2', length: 2, checksum: false, readable: false },
        'N': { name: 'UPC5', length: 5, checksum: false, readable: true },
        'n': { name: 'UPC5', length: 5, checksum: false, readable: false },
        'O': { name: 'Code 93', variable: true, checksum: true, readable: true },
        'o': { name: 'Code 93', variable: true, checksum: true, readable: false },
        'P': { name: 'Postnet', variable: true, checksum: true, readable: false },
        'p': { name: 'Postnet', variable: true, checksum: true, readable: false },
        'Q': { name: 'UCC/EAN 128', length: 20, checksum: true, readable: true },
        'q': { name: 'UCC/EAN 128', length: 20, checksum: true, readable: false },
        'R': { name: 'UCC/EAN 128 K-MART', length: 18, checksum: true, readable: true },
        'r': { name: 'UCC/EAN 128 K-MART', length: 18, checksum: true, readable: false },
        'S': { name: 'UCC/EAN 128 Random', length: 34, checksum: true, readable: true },
        's': { name: 'UCC/EAN 128 Random', length: 34, checksum: true, readable: false },
        'T': { name: 'Telepen', variable: true, checksum: true, readable: true },
        't': { name: 'Telepen', variable: true, checksum: true, readable: false },
        'U': { name: 'UPS MaxiCode', type: '2D', readable: false },
        'u': { name: 'UPS MaxiCode', type: '2D', readable: false },
        'V': { name: 'FIM', length: 1, checksum: false, readable: false },
        'v': { name: 'FIM', length: 1, checksum: false, readable: false },
        'W': { name: 'DataMatrix', type: '2D', readable: false },
        'w': { name: 'DataMatrix', type: '2D', readable: false },
        'Z': { name: 'PDF-417', type: '2D', readable: false },
        'z': { name: 'PDF-417', type: '2D', readable: false },
    };

    // Code 39 – padrões binários (BSBSBSBSB, 1=wide 0=narrow)
    const CODE39 = {
        '0':'000110100','1':'100100001','2':'001100001','3':'101100000',
        '4':'000110001','5':'100110000','6':'001110000','7':'000100101',
        '8':'100100100','9':'001100100','A':'100001001','B':'001001001',
        'C':'101001000','D':'000011001','E':'100011000','F':'001011000',
        'G':'000001101','H':'100001100','I':'001001100','J':'000011100',
        'K':'100000011','L':'001000011','M':'101000010','N':'000010011',
        'O':'100010010','P':'001010010','Q':'000000111','R':'100000110',
        'S':'001000110','T':'000010110','U':'110000001','V':'011000001',
        'W':'111000000','X':'010010001','Y':'110010000','Z':'011010000',
        '-':'010000101','.':'110000100',' ':'011000100',
        '$':'010101000','/':'010100010','+':'010001010',
        '%':'000101010','*':'010010100',
    };

    // Códigos de barras estendidos (W1x)
    const EXT_BARCODES = {
        'c': 'DataMatrix', 'd': 'QR Code (Auto)', 'D': 'QR Code (Manual)',
        'f': 'Aztec (Variable)', 'F': 'Aztec (Specified)',
        'k': 'RSS/GS1 DataBar', 'z': 'MicroPDF417', 'Z': 'MicroPDF417 (Spec)',
    };

    // ═══════════════════════════════════════════════════
    // TABELAS DE REFERÊNCIA
    // ═══════════════════════════════════════════════════
    const SPEEDS = {
        'A':1.0,'B':1.5,'C':2.0,'D':2.5,'E':3.0,'F':3.5,
        'G':4.0,'H':4.5,'I':5.0,'J':5.5,'K':6.0,'L':6.5,
        'M':7.0,'N':7.5,'O':8.0,'P':8.5,'Q':9.0,'R':9.5,'S':10.0,
    };

    const DIRECTIONS = {
        '1': { name: 'Portrait', angle: 0 },
        '2': { name: 'Rev Landscape', angle: -Math.PI / 2 },
        '3': { name: 'Rev Portrait', angle: Math.PI },
        '4': { name: 'Landscape', angle: Math.PI / 2 },
    };

    const MEM_MODULES = { 'A': 'RAM', 'B': 'Flash', 'C': 'Default', 'H': 'USB' };

    // ═══════════════════════════════════════════════════
    // FUNÇÕES UTILITÁRIAS
    // ═══════════════════════════════════════════════════
    function charToScale(ch) {
        if (!ch) return 1;
        const c = ch.toUpperCase();
        if (c >= '0' && c <= '9') return parseInt(c);
        if (c >= 'A' && c <= 'O') return c.charCodeAt(0) - 55;
        return 1;
    }

    // XXXX = XX.XX" (polegada) ou XXX.X mm (métrico), conforme A1/A5 do manual
    function coordToMm(val, meas) {
        return meas === 'mm' ? val / 10 : (val / 100) * 25.4;
    }

    function formatDateTime(fmt) {
        const d = new Date();
        const dn = ['DOM','SEG','TER','QUA','QUI','SEX','SAB'];
        const mn = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
        let r = '', i = 0;
        while (i < fmt.length) {
            const c = fmt[i];
            const take = (n) => { i = Math.min(i + n, fmt.length); };
            switch (c) {
                case 'A': r += d.getDay(); take(1); break;
                case 'B': case 'C': case 'D': r += dn[d.getDay()]; take(3); break;
                case 'E': case 'F': r += String(d.getMonth() + 1).padStart(2, '0'); take(2); break;
                case 'G': case 'H': case 'I': r += mn[d.getMonth()]; take(3); break;
                case 'P': case 'Q': r += String(d.getDate()).padStart(2, '0'); take(2); break;
                case 'R': case 'S': case 'T': case 'U': r += d.getFullYear(); take(4); break;
                case 'V': case 'W': r += String(d.getHours()).padStart(2, '0'); take(2); break;
                case 'X': case 'Y': r += String(d.getHours() % 12 || 12).padStart(2, '0'); take(2); break;
                case 'Z': case 'a': r += String(d.getMinutes()).padStart(2, '0'); take(2); break;
                case 'g': case 'h': r += String(d.getSeconds()).padStart(2, '0'); take(2); break;
                case 'b': case 'c': r += d.getHours() >= 12 ? 'PM' : 'AM'; take(2); break;
                case 'd': case 'e': case 'f': {
                    const s = new Date(d.getFullYear(), 0, 0);
                    r += String(Math.floor((d - s) / 864e5)).padStart(3, '0'); take(3); break;
                }
                default: r += c; take(1);
            }
        }
        return r;
    }

    return {
        CTRL, FONTS, ASD_SIZES, ASD_SYMBOL_SETS, COURIER_SETS,
        BARCODES, CODE39, EXT_BARCODES, SPEEDS, DIRECTIONS, MEM_MODULES,
        charToScale, coordToMm, formatDateTime,
    };
})();
