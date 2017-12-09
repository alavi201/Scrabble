const pgp = require('pg-promise')();
const connection = pgp( process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/ALIEXPRESSAPP' );

module.exports = connection;
