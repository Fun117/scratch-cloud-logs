const _charToNumber = {
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '1': '10',
    '2': '11',
    '3': '12',
    '4': '13',
    '5': '14',
    '6': '15',
    '7': '16',
    '8': '17',
    '9': '18',
    '0': '19',
    ' ': '20',
    'a': '21',
    'A': '22',
    'b': '23',
    'B': '24',
    'c': '25',
    'C': '26',
    'd': '27',
    'D': '28',
    'e': '29',
    'E': '30',
    'f': '31',
    'F': '32',
    'g': '33',
    'G': '34',
    'h': '35',
    'H': '36',
    'i': '37',
    'I': '38',
    'j': '39',
    'J': '40',
    'k': '41',
    'K': '42',
    'l': '43',
    'L': '44',
    'm': '45',
    'M': '46',
    'n': '47',
    'N': '48',
    'o': '49',
    'O': '50',
    'p': '51',
    'P': '52',
    'q': '53',
    'Q': '54',
    'r': '55',
    'R': '56',
    's': '57',
    'S': '58',
    't': '59',
    'T': '60',
    'u': '61',
    'U': '62',
    'v': '63',
    'V': '64',
    'w': '65',
    'W': '66',
    'x': '67',
    'X': '68',
    'y': '69',
    'Y': '70',
    'z': '71',
    'Z': '72',
    '*': '73',
    '/': '74',
    '.': '75',
    ',': '76',
    '!': '77',
    '"': '78',
    '§': '79',
    '$': '80',
    '%': '81',
    '_': '82',
    '-': '83',
    '(': '84',
    '´': '85',
    ')': '86',
    '`': '87',
    '?': '88',
    'new line': '89',
    '@': '90',
    '#': '91',
    '~': '92',
    ';': '93',
    ':': '94',
    '+': '95',
    '&': '96',
    '|': '97',
    '^': '98',
    "'": '99',
};


function CharToNumberGET(type, content) {
    let result = '';

    if (type === 'scratch_username') {
        // 通常の文字列から番号への変換
        if ( content.length > 20 ) {
            // 文字数が長すぎる場合はエラー
            throw new Error('CharToNumberGET | 最大20文字です');
        }

        for (let i = 0; i < 20; i++) {
            const char = content[i] || ''; // 文字が存在しない場合は空文字を使用
            if (_charToNumber[char]) {
                result += _charToNumber[char];
            } else {
                // 未知の文字は何も変更せずにそのまま追加
                result += "00";
            }
        }
    } else {
        // 通常の文字列から番号への変換
        for (let char of content) {
            if (_charToNumber[char]) {
                result += _charToNumber[char];
            } else {
                // 未知の文字は何も変更せずにそのまま追加
                result += char;
            }
        }
    }

    return result;
};

function NumberToCharGET(type, content) {
    let result = '';

    if (type === 'scratch_username') {
        // 番号から文字列への変換
        for (let i = 0; i < content.length; i += 2) {
            const number = content.substr(i, 2);
            if (number !== '00') {
                const char = Object.keys(_charToNumber).find(key => _charToNumber[key] === number);
                if (char) {
                    result += char;
                } else {
                    // 未知の番号は何も変更せずにそのまま追加
                    result += number;
                }
            }
        }
    } else {
        // 通常の番号から文字列への変換
        for (let i = 0; i < content.length; i += 2) {
            const number = content.substr(i, 2);
            const char = String.fromCharCode(parseInt(number));
            result += char;
        }
    }

    return result;
};

module.exports = { CharToNumberGET, NumberToCharGET }