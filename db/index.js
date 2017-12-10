const pgp = require('pg-promise')();
const connection = pgp( process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/scrabble' );

module.exports = connection;