const express = require('express');
const router = express.Router();
const db = require('../db');
const dbjs = require('../db/tempQueries')
const database = new dbjs(db)
session = require('express-session');
let username

const joinGame = app => {

    //console.log('in joinGame');
    router.get('/:gameId',function(request, response, next) { 
        const game_id = request.params.gameId;
        const user_id = request.session.player_id;
        //console.log(req.params.gameId);
        console.log('in get join game');
        database.insert_game_user(game_id, request, response)
        response.redirect('/game/'+game_id);   
    });
    
    router.post('/',function(req, res, next) { 
        res.redirect('/game');   
    });
    return router;
}
module.exports = joinGame;