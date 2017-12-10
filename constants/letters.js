let n = 27;
let letter_array = new Array();
for (var i = 1; i < n; i++){

    let letter = {value: String.fromCharCode(i - 1 + 65), score: Math.floor(Math.random() * 10)};

    letter_array[i] = letter;
}

const LETTER_VALUES = letter_array;

module.exports = { LETTER_VALUES};