const db = require('../db');
const queries = require('../db/queries')(db);
let LETTER_VALUES = new Array();

queries.load_tiles()
.then(result => {
    letter_array =  result;
    
    letter_array.forEach( (letter) => {
        LETTER_VALUES[letter.id] = {value: letter.letter, score: letter.score}; 
    }, this);  
});

module.exports = {LETTER_VALUES};