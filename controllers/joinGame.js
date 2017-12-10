const express = require('express');
const router = express.Router();
const db = require('../db');
const dbjs = require('../db/tempQueries')
const database = new dbjs(db)
session = require('express-session');
let username

const joinGame = app => {

    console.log('in joinGame');
    router.get('/',function(req, res, next) { 
        //console.log(req.params.gameId);
        console.log('in get join game');
        res.redirect('/game');   
    });
    router.post('/',function(req, res, next) { 
        console.log(req.body.gameId);
        res.redirect('/game');   
    });
    return router;
}
module.exports = joinGame;